import { ComparisonOptions, DetailedDifference } from '../types';
import { CircularReferenceError } from '../core/errors';
import { ValidateObjectsAgainstSchemas } from '../core/schema-validation';
import { shouldComparePath } from '../core/path-filtering';
import { handleDepthComparison } from '../core/value-comparison';
import { areValuesEqual, isObject } from '../core/utils';
import { Memoize, compareValuesWithDetailedDifferencesKeyFn } from '../utils/memoization';

/**
 * Compares two objects and returns detailed information about differences
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param pathOfConflict - Starting path for conflict (optional)
 * @param options - Optional comparison options (strict, circularReferences, pathFilter)
 * @returns Array of detailed differences
 */
export const CompareValuesWithDetailedDifferences = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T,
  secondObject: U,
  pathOfConflict: string = '',
  options: ComparisonOptions = {}
): DetailedDifference[] => {
  // Perform schema validation if specified
  if (options.schemaValidation) {
    ValidateObjectsAgainstSchemas(firstObject, secondObject, options.schemaValidation);
  }
  
  return _CompareValuesWithDetailedDifferences(
    firstObject, 
    secondObject, 
    pathOfConflict, 
    options
  );
};

/**
 * Internal implementation of CompareValuesWithDetailedDifferences
 * This is separated to allow for memoization
 */
const _CompareValuesWithDetailedDifferences = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T,
  secondObject: U,
  pathOfConflict: string = '',
  options: ComparisonOptions = {}
): DetailedDifference[] => {
  // Extract options
  const { circularReferences = 'error', pathFilter } = options;

  // If the objects are the same reference, there are no differences
  if (Object.is(firstObject, secondObject)) {
    return [];
  }

  // Check for obvious circular references in the top-level objects
  if (circularReferences === 'error') {
    // Look for direct self-references in both objects
    for (const key in firstObject) {
      if (firstObject[key] === firstObject) {
        throw new CircularReferenceError(key);
      }
    }
    
    for (const key in secondObject) {
      if (secondObject[key] === secondObject) {
        throw new CircularReferenceError(key);
      }
    }
  }

  // Handle path filtering specially for include mode
  if (pathFilter && pathFilter.mode === 'include') {
    // For include mode, we'll do a more direct comparison
    const differences: DetailedDifference[] = [];
    
    // Special handling for array patterns
    const hasArrayPatterns = pathFilter.patterns.some(p => p.startsWith('['));
    
    // Function to compare properties based on path patterns
    const comparePropertiesRecursively = (
      first: any,
      second: any,
      currentPath: string
    ) => {
      // Special case for top-level array with [*] patterns
      if (currentPath === '' && Array.isArray(first) && Array.isArray(second) && hasArrayPatterns) {
        for (let i = 0; i < Math.max(first.length, second.length); i++) {
          const elemPath = `[${i}]`;
          
          if (i >= first.length) {
            // Handle added elements
            for (const pattern of pathFilter.patterns) {
              if (pattern.startsWith('[*]')) {
                const propPattern = pattern.substring(3); // Remove '[*]'
                if (propPattern) {
                  // Check properties inside array element
                  if (typeof second[i] === 'object' && second[i] !== null) {
                    const propKey = propPattern.startsWith('.') ? propPattern.substring(1) : propPattern;
                    if (propKey in second[i]) {
                      differences.push({
                        path: `[${i}]${propPattern}`,
                        type: 'added',
                        oldValue: undefined,
                        newValue: second[i][propKey]
                      });
                    }
                  }
                } else {
                  // Match the entire element
                  differences.push({
                    path: elemPath,
                    type: 'added',
                    oldValue: undefined,
                    newValue: second[i]
                  });
                }
              }
            }
          } else if (i >= second.length) {
            // Handle removed elements
            for (const pattern of pathFilter.patterns) {
              if (pattern.startsWith('[*]')) {
                const propPattern = pattern.substring(3); // Remove '[*]'
                if (propPattern) {
                  // Check properties inside array element
                  if (typeof first[i] === 'object' && first[i] !== null) {
                    const propKey = propPattern.startsWith('.') ? propPattern.substring(1) : propPattern;
                    if (propKey in first[i]) {
                      differences.push({
                        path: `[${i}]${propPattern}`,
                        type: 'removed',
                        oldValue: first[i][propKey],
                        newValue: undefined
                      });
                    }
                  }
                } else {
                  // Match the entire element
                  differences.push({
                    path: elemPath,
                    type: 'removed',
                    oldValue: first[i],
                    newValue: undefined
                  });
                }
              }
            }
          } else {
            // Compare existing elements
            for (const pattern of pathFilter.patterns) {
              if (pattern.startsWith('[*]')) {
                const propPattern = pattern.substring(3); // Remove '[*]'
                if (propPattern) {
                  // Check properties inside array element
                  const propKey = propPattern.startsWith('.') ? propPattern.substring(1) : propPattern;
                  
                  if (typeof first[i] === 'object' && first[i] !== null &&
                      typeof second[i] === 'object' && second[i] !== null) {
                    if (propKey in first[i] && propKey in second[i]) {
                      if (!areValuesEqual(first[i][propKey], second[i][propKey], options.strict)) {
                        differences.push({
                          path: `[${i}]${propPattern}`,
                          type: 'changed',
                          oldValue: first[i][propKey],
                          newValue: second[i][propKey]
                        });
                      }
                    } else if (propKey in first[i]) {
                      differences.push({
                        path: `[${i}]${propPattern}`,
                        type: 'removed',
                        oldValue: first[i][propKey],
                        newValue: undefined
                      });
                    } else if (propKey in second[i]) {
                      differences.push({
                        path: `[${i}]${propPattern}`,
                        type: 'added',
                        oldValue: undefined,
                        newValue: second[i][propKey]
                      });
                    }
                  }
                } else {
                  // Match the entire element
                  if (!areValuesEqual(first[i], second[i], options.strict)) {
                    differences.push({
                      path: elemPath,
                      type: 'changed',
                      oldValue: first[i],
                      newValue: second[i]
                    });
                  }
                }
              }
            }
          }
        }
        return;
      }
      
      // Skip if we're not at a pattern that should be included
      if (!shouldComparePath(currentPath, pathFilter)) {
        // But check if any children would match before skipping
        let matchesChild = false;
        
        for (const pattern of pathFilter.patterns) {
          if (pattern.startsWith(currentPath + '.') || 
              (currentPath === '' && !pattern.startsWith('.'))) {
            matchesChild = true;
            break;
          }
        }
        
        if (!matchesChild) {
          return;
        }
      }
      
      // For simple types, compare directly
      if (typeof first !== 'object' || first === null || 
          typeof second !== 'object' || second === null) {
        if (!areValuesEqual(first, second, options.strict)) {
          differences.push({
            path: currentPath,
            type: 'changed',
            oldValue: first,
            newValue: second
          });
        }
        return;
      }
      
      // Handle arrays
      if (Array.isArray(first) && Array.isArray(second)) {
        for (let i = 0; i < Math.max(first.length, second.length); i++) {
          const elemPath = `${currentPath}[${i}]`;
          
          if (i >= first.length) {
            // Element added in second array
            if (shouldComparePath(elemPath, pathFilter)) {
              differences.push({
                path: elemPath,
                type: 'added',
                oldValue: undefined,
                newValue: second[i]
              });
            }
          } else if (i >= second.length) {
            // Element removed in second array
            if (shouldComparePath(elemPath, pathFilter)) {
              differences.push({
                path: elemPath,
                type: 'removed',
                oldValue: first[i],
                newValue: undefined
              });
            }
          } else {
            // Compare elements
            comparePropertiesRecursively(first[i], second[i], elemPath);
          }
        }
        return;
      }
      
      // Handle objects
      const allKeys = new Set([...Object.keys(first), ...Object.keys(second)]);
      
      for (const key of allKeys) {
        const propPath = currentPath ? `${currentPath}.${key}` : key;
        
        if (!(key in first)) {
          // Property added in second object
          if (shouldComparePath(propPath, pathFilter)) {
            differences.push({
              path: propPath,
              type: 'added',
              oldValue: undefined,
              newValue: second[key]
            });
          }
        } else if (!(key in second)) {
          // Property removed in second object
          if (shouldComparePath(propPath, pathFilter)) {
            differences.push({
              path: propPath,
              type: 'removed',
              oldValue: first[key],
              newValue: undefined
            });
          }
        } else {
          // Compare properties
          comparePropertiesRecursively(first[key], second[key], propPath);
        }
      }
    };
    
    // Start the recursive comparison
    comparePropertiesRecursively(firstObject, secondObject, pathOfConflict);
    
    return differences;
  }

  try {
    // For exclude mode, use the unified depth handling function
    const differences = handleDepthComparison(firstObject, secondObject, pathOfConflict, options, false, true);
    
    if (!Array.isArray(differences)) {
      return [];
    }
    
    // Type assertion because we know the differences will be DetailedDifference objects due to detailed=true parameter
    const detailedDifferences = differences as DetailedDifference[];
    
    // Filter the differences based on the path filter settings
    if (pathFilter && pathFilter.patterns && pathFilter.patterns.length > 0) {
      return detailedDifferences.filter(diff => {
        // Skip undefined paths (shouldn't happen, but just in case)
        if (!diff.path) {
          return false;
        }
        
        // For 'exclude' mode: keep if NOT matching any pattern
        const matchesPattern = !shouldComparePath(diff.path, pathFilter);
        return !matchesPattern;
      });
    }
    
    return detailedDifferences;
  } catch (error) {
    if (error instanceof CircularReferenceError) {
      if (circularReferences === 'error') {
        throw error;
      }
      // If circularReferences is 'ignore' and we're getting an error, return empty array
      return [];
    }
    throw error;
  }
};

/**
 * Memoized version of CompareValuesWithDetailedDifferences
 */
export const MemoizedCompareValuesWithDetailedDifferences = Memoize(
  CompareValuesWithDetailedDifferences, 
  compareValuesWithDetailedDifferencesKeyFn
); 