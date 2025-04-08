import { ComparePropertiesResult, ComparisonOptions, DetailedDifference, DifferenceType, PathFilter, PathFilterMode, 
  isObjectGuard, isArrayGuard, isDateGuard, isRegExpGuard, TypeSafeComparisonOptions, TypedComparisonResult, 
  TypedDetailedDifference, CompatibleObject } from './types';

/**
 * Error thrown when a circular reference is detected and handling is set to 'error'
 */
class CircularReferenceError extends Error {
  constructor(path: string) {
    super(`Circular reference detected at path: ${path}`);
    this.name = 'CircularReferenceError';
  }
}

/**
 * Helper function to check if an object has a property
 * @param obj - Object to check
 * @param key - Property to check for
 * @returns Whether the object has the property
 */
const hasOwn = (obj: Record<string, any>, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

/**
 * Helper function to check if a value is empty
 * @param value - Value to check
 * @returns Whether the value is empty
 */
const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Helper function to check if a value is an object
 * @param value - Value to check
 * @returns Whether the value is an object
 */
const isObject = (value: any): boolean => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Helper function to determine if two values are equal
 * @param a - First value
 * @param b - Second value
 * @param strict - Whether to use strict equality
 * @returns Whether the values are equal
 */
const areValuesEqual = (a: any, b: any, strict = true): boolean => {
  // Handle identical values first
  if (a === b) return true;
  
  // If strict mode is enabled and values are not strictly equal, they're not equal
  if (strict) return false;
  
  // For non-strict mode:
  
  // Handle NaN
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  
  // Handle null and undefined
  if ((a === null && b === undefined) || (a === undefined && b === null)) return true;
  
  // Handle type coercion for primitives
  if (typeof a === 'string' || typeof b === 'string') {
    // Only try numeric comparison if one is a string and the other is a number
    if ((typeof a === 'string' && typeof b === 'number') || 
        (typeof a === 'number' && typeof b === 'string')) {
      const numA = Number(a);
      const numB = Number(b);
      if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA === numB) return true;
    }
  }
  
  // Handle boolean values
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    const boolA = Boolean(a);
    const boolB = Boolean(b);
    if (boolA === boolB) return true;
  }
  
  // At this point, if one is falsy and the other is not, they're not equal
  if (!a || !b) return false;
  
  // If both are dates
  if (a instanceof Date && b instanceof Date) 
    return a.getTime() === b.getTime();
  
  // If both are RegExp
  if (a instanceof RegExp && b instanceof RegExp)
    return a.toString() === b.toString();
  
  return false;
};

/**
 * Creates a filtered copy of an object with only the specified keys
 * @param obj - Object to filter
 * @param keys - Keys to include in the result
 * @returns A new object with only the specified keys
 */
const pick = <T extends Record<string, any>>(obj: T, keys: string[]): Record<string, any> => {
  return keys.reduce((result, key) => {
    if (hasOwn(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Record<string, any>);
};

/**
 * Compares the properties of two objects
 * Returns all the different and common properties
 *
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @return Object containing differences and common properties
 */
const CompareProperties = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T,
  secondObject: U
): ComparePropertiesResult => {
  const differences: string[] = [];
  const common: string[] = [];

  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(firstObject), ...Object.keys(secondObject)]);
  
  // Process each key
  allKeys.forEach(key => {
    const inFirst = hasOwn(firstObject, key);
    const inSecond = hasOwn(secondObject, key);
    
    if (inFirst && inSecond) {
      common.push(key);
    } else {
      differences.push(key);
    }
  });

  return {
    differences,
    common
  };
};

/**
 * Checks if a given path matches any of the provided patterns
 * Supports wildcard patterns:
 * - '.fieldName' matches any property named 'fieldName' at any level
 * - 'parent.*.child' matches any path like 'parent.something.child'
 * - 'parent[*].child' matches any array index like 'parent[0].child'
 * 
 * @param path - The property path to check
 * @param patterns - Array of patterns to match against
 * @returns Whether the path matches any of the patterns
 */
const matchesPathPattern = (path: string, patterns: string[]): boolean => {
  if (!patterns || patterns.length === 0) {
    return false;
  }

  for (const pattern of patterns) {
    // Handle leading dot for any level match
    if (pattern.startsWith('.')) {
      const fieldName = pattern.substring(1);
      // Check if path equals the field name, ends with the field name, or contains it as a property name
      if (path === fieldName || 
          path.endsWith(`.${fieldName}`) || 
          path.includes(`${fieldName}.`) ||
          path.match(new RegExp(`\\[\\d+\\]\\.${fieldName}`)) ||  // Match pattern[0].fieldName
          path.match(new RegExp(`\\.${fieldName}\\[`))) {         // Match pattern.fieldName[
        return true;
      }
      continue;
    }

    // Handle exact match
    if (pattern === path) {
      return true;
    }
    
    // Match array index patterns
    if (pattern.includes('[*]')) {
      const arrayPattern = pattern.replace(/\[\*\]/g, '\\[\\d+\\]');
      const regexPattern = '^' + arrayPattern.replace(/\./g, '\\.') + '$';
      try {
        const regex = new RegExp(regexPattern);
        if (regex.test(path)) {
          return true;
        }
      } catch (e) {
        // If regex fails, fall back to exact match
      }
    }
    
    // Match wildcard patterns
    if (pattern.includes('*')) {
      // Convert pattern to regex
      const regexPattern = '^' + pattern
        .replace(/\./g, '\\.')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\*/g, '[^.\\[\\]]*') + '$';
      
      try {
        const regex = new RegExp(regexPattern);
        if (regex.test(path)) {
          return true;
        }
      } catch (e) {
        // If regex fails, fall back to exact match
      }
    }

    // Check for parent paths in array cases
    // If the pattern is 'posts' and the path is 'posts[0].title', it should match
    if (path.startsWith(pattern + '[') || path.startsWith(pattern + '.')) {
      return true;
    }
  }

  return false;
};

/**
 * Determine if a path or any of its parent paths should be filtered out
 * This helps handle structured data like arrays where we might want to filter
 * at the parent level
 * 
 * @param path - The property path to check
 * @param pathFilter - Path filter configuration
 * @returns Whether the path should be filtered
 */
const shouldFilterPath = (path: string, pathFilter?: PathFilter): boolean => {
  if (!pathFilter || !pathFilter.patterns || pathFilter.patterns.length === 0) {
    return false; // If no filter is defined, nothing is filtered
  }

  // Check if the path itself matches any pattern
  if (matchesPathPattern(path, pathFilter.patterns)) {
    return true;
  }

  // Check for parent paths in case of arrays
  // For example, if filtering 'posts.*.title', we should also filter 'posts'
  // This is needed because arrays report conflicts at the parent level
  const parts = path.split('.');
  let currentPath = '';

  for (const part of parts) {
    // Handle array notation in path segments
    const arrayMatch = part.match(/^([^\[]+)(\[\d+\])(.*)$/);
    if (arrayMatch) {
      const beforeBracket = arrayMatch[1];
      const bracketPart = arrayMatch[2];
      const afterBracket = arrayMatch[3];
      
      // Build the path up to this segment
      if (currentPath) {
        currentPath += '.';
      }
      currentPath += beforeBracket;
      
      // Check if this array path matches any pattern
      if (matchesPathPattern(currentPath, pathFilter.patterns)) {
        return true;
      }
      
      // Include the bracket part and continue
      currentPath += bracketPart;
      
      if (afterBracket) {
        currentPath += afterBracket;
      }
    } else {
      // Handle normal path segments
      if (currentPath) {
        currentPath += '.';
      }
      currentPath += part;
      
      // Check if this path matches any pattern
      if (matchesPathPattern(currentPath, pathFilter.patterns)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Determines if a path should be compared based on the pathFilter configuration
 * 
 * @param path - The property path to check
 * @param pathFilter - Path filter configuration
 * @returns Whether the path should be compared
 */
const shouldComparePath = (path: string, pathFilter?: PathFilter): boolean => {
  if (!pathFilter || !pathFilter.patterns || pathFilter.patterns.length === 0) {
    return true; // If no filter is defined, compare all paths
  }

  const mode = pathFilter.mode || 'exclude';
  
  // If we're in exclude mode, check if the path matches any pattern
  if (mode === 'exclude') {
    return !shouldFilterPath(path, pathFilter);
  }
  
  // For include mode, we need more flexible matching
  
  // Direct match - check if the path exactly matches any pattern
  if (pathFilter.patterns.includes(path)) {
    return true;
  }
  
  // Check if path matches any pattern
  if (shouldFilterPath(path, pathFilter)) {
    return true;
  }
  
  // Handle array notation specially
  if (path.includes('[')) {
    // Convert array indices to wildcards for matching
    const wildcardPath = path.replace(/\[\d+\]/g, '[*]');
    if (pathFilter.patterns.includes(wildcardPath)) {
      return true;
    }
    
    // Check array element direct match
    // e.g., if pattern is '[*].content', path could be '[0].content'
    for (const pattern of pathFilter.patterns) {
      if (pattern.startsWith('[*]') && path.match(/^\[\d+\]/)) {
        const patternSuffix = pattern.substring(3); // Remove '[*]'
        const pathSuffix = path.replace(/^\[\d+\]/, ''); // Remove '[0]'
        if (patternSuffix === pathSuffix) {
          return true;
        }
      }
    }
  }
  
  // Check parent paths for include patterns
  // e.g., if pattern is 'settings.*', we should include 'settings.theme'
  const parts = path.split('.');
  let currentPath = '';
  
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) {
      currentPath += '.';
    }
    currentPath += parts[i];
    
    // Check if the current path segment followed by wildcard is in patterns
    const wildcardPattern = `${currentPath}.*`;
    if (pathFilter.patterns.includes(wildcardPattern)) {
      return true;
    }
    
    // Also check for other wildcard patterns
    for (const pattern of pathFilter.patterns) {
      if (pattern.includes('*') && !pattern.startsWith('.')) {
        // Convert pattern to regex
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\[/g, '\\[')
          .replace(/\]/g, '\\]')
          .replace(/\*/g, '[^.\\[\\]]*');
        
        try {
          const regex = new RegExp(`^${regexPattern}`);
          if (regex.test(path)) {
            return true;
          }
        } catch (e) {
          // If regex fails, continue
        }
      }
    }
  }
  
  // For include mode, return false if no pattern matches
  return false;
};

/**
 * Handles comparison for arrays and objects
 * @param firstValue - First value to compare
 * @param secondValue - Second value to compare
 * @param currentPath - Current path for conflicts
 * @param options - Comparison options
 * @param isArrayComparison - Whether this is an array comparison
 * @param detailed - Whether to return detailed difference information
 * @param firstVisited - Map of already visited objects in the first object tree
 * @param secondVisited - Map of already visited objects in the second object tree
 * @returns Array of conflict paths or detailed differences, or boolean indicating equality
 */
const handleDepthComparison = (
  firstValue: any,
  secondValue: any,
  currentPath: string,
  options: ComparisonOptions,
  isArrayComparison: boolean,
  detailed: boolean = false,
  firstVisited: Map<any, string> = new Map(),
  secondVisited: Map<any, string> = new Map()
): string[] | DetailedDifference[] | boolean => {
  const { strict = true, circularReferences = 'error', pathFilter } = options;

  // If we should skip comparing this path due to pathFilter, return true (consider them equal)
  if (currentPath && !shouldComparePath(currentPath, pathFilter)) {
    return true;
  }

  // Handle Date objects specially
  if (firstValue instanceof Date && secondValue instanceof Date) {
    if (firstValue.getTime() === secondValue.getTime()) {
      return true;
    }
    return detailed 
      ? [{ 
          path: currentPath, 
          type: 'changed', 
          oldValue: firstValue, 
          newValue: secondValue 
        } as DetailedDifference] 
      : [currentPath];
  }

  // Handle RegExp objects specially
  if (firstValue instanceof RegExp && secondValue instanceof RegExp) {
    if (firstValue.toString() === secondValue.toString()) {
      return true;
    }
    return detailed 
      ? [{ 
          path: currentPath, 
          type: 'changed', 
          oldValue: firstValue, 
          newValue: secondValue 
        } as DetailedDifference] 
      : [currentPath];
  }

  // Check for circular references in arrays
  if (Array.isArray(firstValue) && Array.isArray(secondValue)) {
    // Check if either array has been visited before
    const firstVisitedPath = firstVisited.get(firstValue);
    const secondVisitedPath = secondVisited.get(secondValue);
    
    if (firstVisitedPath !== undefined || secondVisitedPath !== undefined) {
      // If handling is set to error, throw an error
      if (circularReferences === 'error') {
        throw new CircularReferenceError(currentPath);
      }
      
      // If both arrays have been visited before and they reference the same relative position in their structures
      if (firstVisitedPath !== undefined && secondVisitedPath !== undefined) {
        // If both paths are the same, consider them equal
        return true;
      }
      
      // If only one has been visited or they're at different positions, consider them different
      return detailed 
        ? [{ 
            path: currentPath, 
            type: 'changed',
            oldValue: firstValue,
            newValue: secondValue
          } as DetailedDifference] 
        : [currentPath];
    }
    
    // Mark arrays as visited before going deeper
    firstVisited.set(firstValue, currentPath);
    secondVisited.set(secondValue, currentPath);

    if (firstValue.length !== secondValue.length) {
      // If this is a direct array comparison and the path should be filtered
      if (isArrayComparison && pathFilter && !shouldComparePath(currentPath, pathFilter)) {
        return true; // Consider them equal if filtered
      }
      
      return isArrayComparison 
        ? false 
        : (detailed 
            ? [{ 
                path: currentPath, 
                type: 'changed', 
                oldValue: firstValue, 
                newValue: secondValue 
              } as DetailedDifference] 
            : [currentPath]);
    }
    
    // For direct array comparison or nested arrays
    const conflicts = detailed ? [] as DetailedDifference[] : [] as string[];
    let hasConflict = false;
    
    // Iterate through array elements and compare them
    for (let i = 0; i < firstValue.length; i++) {
      // Construct the array element path
      const elemPath = `${currentPath}[${i}]`;
      
      // Skip comparison if the path should be filtered
      if (!shouldComparePath(elemPath, pathFilter)) {
        continue;
      }
      
      // Compare array elements
      if (isObject(firstValue[i]) && isObject(secondValue[i])) {
        // Recursively compare objects within arrays
        try {
          const result = handleDepthComparison(
            firstValue[i],
            secondValue[i],
            elemPath,
            options,
            false,
            detailed,
            new Map(firstVisited),  // Create a new map to avoid shared references
            new Map(secondVisited)  // Create a new map to avoid shared references
          );
          
          if (result !== true) {
            hasConflict = true;
            if (Array.isArray(result)) {
              if (detailed) {
                (conflicts as DetailedDifference[]).push(...(result as DetailedDifference[]));
              } else {
                (conflicts as string[]).push(...(result as string[]));
              }
            }
          }
        } catch (error) {
          if (error instanceof CircularReferenceError) {
            if (circularReferences === 'error') {
              throw error;
            }
            // If circularReferences is 'ignore', continue with next comparison
          } else {
            throw error;
          }
        }
      } else if (Array.isArray(firstValue[i]) && Array.isArray(secondValue[i])) {
        // Recursively compare nested arrays
        try {
          const result = handleDepthComparison(
            firstValue[i],
            secondValue[i],
            elemPath,
            options,
            true,
            detailed,
            new Map(firstVisited),  // Create a new map to avoid shared references
            new Map(secondVisited)  // Create a new map to avoid shared references
          );
          
          if (result !== true) {
            hasConflict = true;
            if (Array.isArray(result)) {
              if (detailed) {
                (conflicts as DetailedDifference[]).push(...(result as DetailedDifference[]));
              } else {
                (conflicts as string[]).push(...(result as string[]));
              }
            } else if (result === false) {
              // For arrays compared directly
              if (detailed) {
                (conflicts as DetailedDifference[]).push({
                  path: elemPath,
                  type: 'changed',
                  oldValue: firstValue[i],
                  newValue: secondValue[i]
                });
              } else {
                (conflicts as string[]).push(elemPath);
              }
            }
          }
        } catch (error) {
          if (error instanceof CircularReferenceError) {
            if (circularReferences === 'error') {
              throw error;
            }
            // If circularReferences is 'ignore', continue with next comparison
          } else {
            throw error;
          }
        }
      } else if (!areValuesEqual(firstValue[i], secondValue[i], strict)) {
        // For primitive values that are not equal
        hasConflict = true;
        if (detailed) {
          (conflicts as DetailedDifference[]).push({
            path: elemPath,
            type: 'changed',
            oldValue: firstValue[i],
            newValue: secondValue[i]
          });
        } else {
          (conflicts as string[]).push(elemPath);
        }
      }
    }
    
    if (isArrayComparison && hasConflict && conflicts.length === 0) {
      return false;
    }
    
    return conflicts.length > 0 ? conflicts : true;
  }

  // Handle objects
  if (isObject(firstValue) && isObject(secondValue)) {
    // Check if either object has been visited before
    const firstVisitedPath = firstVisited.get(firstValue);
    const secondVisitedPath = secondVisited.get(secondValue);
    
    if (firstVisitedPath !== undefined || secondVisitedPath !== undefined) {
      // If handling is set to error, throw an error
      if (circularReferences === 'error') {
        throw new CircularReferenceError(currentPath);
      }
      
      // If both objects have been visited before and they reference the same relative position in their structures
      if (firstVisitedPath !== undefined && secondVisitedPath !== undefined) {
        // If both paths are the same, consider them equal
        return true;
      }
      
      // If only one has been visited or they're at different positions, consider them different
      return detailed 
        ? [{ 
            path: currentPath, 
            type: 'changed',
            oldValue: firstValue,
            newValue: secondValue
          } as DetailedDifference] 
        : [currentPath];
    }
    
    // Mark objects as visited before going deeper
    firstVisited.set(firstValue, currentPath);
    secondVisited.set(secondValue, currentPath);

    const allKeys = new Set([...Object.keys(firstValue), ...Object.keys(secondValue)]);
    const conflicts = detailed ? [] as DetailedDifference[] : [] as string[];
    
    for (const key of allKeys) {
      const hasFirst = hasOwn(firstValue, key);
      const hasSecond = hasOwn(secondValue, key);
      const propPath = currentPath ? `${currentPath}.${key}` : key;
      
      // Skip this property if it should be filtered based on pathFilter
      if (!shouldComparePath(propPath, pathFilter)) {
        continue;
      }
      
      // If key exists in one but not in the other
      if (!hasFirst || !hasSecond) {
        if (detailed) {
          const type: DifferenceType = !hasFirst ? 'added' : 'removed';
          (conflicts as DetailedDifference[]).push({ 
            path: propPath, 
            type, 
            oldValue: !hasFirst ? undefined : firstValue[key], 
            newValue: !hasSecond ? undefined : secondValue[key] 
          });
        } else {
          (conflicts as string[]).push(propPath);
        }
        continue;
      }
      
      // Both objects have the key, compare their values
      try {
        const result = handleDepthComparison(
          firstValue[key],
          secondValue[key],
          propPath,
          options,
          false,
          detailed,
          new Map(firstVisited),  // Create a new map to avoid shared references
          new Map(secondVisited)  // Create a new map to avoid shared references
        );
        
        if (result !== true) {
          if (Array.isArray(result)) {
            if (detailed) {
              (conflicts as DetailedDifference[]).push(...(result as DetailedDifference[]));
            } else {
              (conflicts as string[]).push(...(result as string[]));
            }
          } else if (typeof result === 'string') {
            (conflicts as string[]).push(result);
          }
        }
      } catch (error) {
        if (error instanceof CircularReferenceError) {
          if (circularReferences === 'error') {
            throw error;
          }
          // If circularReferences is 'ignore', just mark this property as different
          if (detailed) {
            (conflicts as DetailedDifference[]).push({
              path: propPath,
              type: 'changed',
              oldValue: firstValue[key],
              newValue: secondValue[key]
            });
          } else {
            (conflicts as string[]).push(propPath);
          }
        } else {
          throw error;
        }
      }
    }
    
    return conflicts.length > 0 ? conflicts : true;
  }

  // Handle primitive values
  if (areValuesEqual(firstValue, secondValue, strict)) {
    return true;
  }
  
  return detailed 
    ? [{ 
        path: currentPath, 
        type: 'changed', 
        oldValue: firstValue, 
        newValue: secondValue 
      } as DetailedDifference] 
    : [currentPath];
};

/**
 * Compares two arrays for equality, including nested arrays and objects
 *
 * @param firstArray - First array to compare
 * @param secondArray - Second array to compare
 * @param options - Comparison options
 * @return Boolean indicating whether arrays are equal
 */
const CompareArrays = (
  firstArray: any[], 
  secondArray: any[],
  options: ComparisonOptions = {}
): boolean => {
  // Handle falsy cases
  if (!Array.isArray(firstArray) || !Array.isArray(secondArray)) {
    return false;
  }

  // Extract options
  const { circularReferences = 'error' } = options;

  // If the arrays are the same object, they're equal
  if (firstArray === secondArray) {
    return true;
  }

  // Check for obvious circular references in the top-level arrays
  if (circularReferences === 'error') {
    // Create a simple check for the most direct circular reference cases
    for (let i = 0; i < firstArray.length; i++) {
      if (firstArray[i] === firstArray) {
        throw new CircularReferenceError(`[${i}]`);
      }
    }
    
    for (let i = 0; i < secondArray.length; i++) {
      if (secondArray[i] === secondArray) {
        throw new CircularReferenceError(`[${i}]`);
      }
    }
  }

  try {
    // Use the unified depth handling function
    return handleDepthComparison(firstArray, secondArray, '', options, true, false) === true;
  } catch (error) {
    if (error instanceof CircularReferenceError) {
      if (circularReferences === 'error') {
        throw error;
      }
      // If circularReferences is 'ignore' and we're still throwing, something went wrong
      return false;
    }
    throw error;
  }
};

/**
 * Compares the properties of two objects (deep comparison)
 * Returns an array, each element is the path of a property that is different
 *
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param pathOfConflict - Starting path for conflict (used in recursion)
 * @param options - Comparison options
 * @return Array of conflict paths
 */
const CompareValuesWithConflicts = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T,
  secondObject: U,
  pathOfConflict: string = '',
  options: ComparisonOptions = {}
): string[] => {
  // Extract options
  const { circularReferences = 'error', pathFilter } = options;

  // If the objects are the same reference, there are no conflicts
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

  try {
    // Use the unified depth handling function
    const conflicts = handleDepthComparison(firstObject, secondObject, pathOfConflict, options, false, false);
    
    if (!Array.isArray(conflicts)) {
      return [];
    }
    
    // Type assertion because we know the conflicts will be strings due to detailed=false parameter
    const stringConflicts = conflicts as string[];
    
    // Post-process the conflicts to maintain backward compatibility
    // This ensures arrays are reported at their parent level only
    const processedConflicts = new Set<string>();
    
    for (const conflict of stringConflicts) {
      // If this path should be filtered out, skip it
      if (pathFilter && !shouldComparePath(conflict, pathFilter)) {
        continue;
      }
      
      // If this is an array element conflict (contains [), get the array path
      if (conflict.includes('[')) {
        const arrayPath = conflict.substring(0, conflict.indexOf('['));
        
        // If the array path should be filtered, skip this conflict
        if (pathFilter && !shouldComparePath(arrayPath, pathFilter)) {
          continue;
        }
        
        processedConflicts.add(arrayPath);
      } else {
        processedConflicts.add(conflict);
      }
    }
    
    return Array.from(processedConflicts);
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
 * Compares the properties of two objects (deep comparison)
 * Returns detailed information about differences including type and values
 *
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param pathOfConflict - Starting path for conflict (used in recursion)
 * @param options - Comparison options
 * @return Array of detailed differences
 */
const CompareValuesWithDetailedDifferences = <T extends Record<string, any>, U extends Record<string, any>>(
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
                    if (hasOwn(second[i], propKey)) {
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
                    if (hasOwn(first[i], propKey)) {
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
                    if (hasOwn(first[i], propKey) && hasOwn(second[i], propKey)) {
                      if (!areValuesEqual(first[i][propKey], second[i][propKey], options.strict)) {
                        differences.push({
                          path: `[${i}]${propPattern}`,
                          type: 'changed',
                          oldValue: first[i][propKey],
                          newValue: second[i][propKey]
                        });
                      }
                    } else if (hasOwn(first[i], propKey)) {
                      differences.push({
                        path: `[${i}]${propPattern}`,
                        type: 'removed',
                        oldValue: first[i][propKey],
                        newValue: undefined
                      });
                    } else if (hasOwn(second[i], propKey)) {
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
        
        if (!hasOwn(first, key)) {
          // Property added in second object
          if (shouldComparePath(propPath, pathFilter)) {
            differences.push({
              path: propPath,
              type: 'added',
              oldValue: undefined,
              newValue: second[key]
            });
          }
        } else if (!hasOwn(second, key)) {
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
        const matchesPattern = shouldFilterPath(diff.path, pathFilter);
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
 * Creates a memoized version of a function
 * @param fn - Function to memoize
 * @param keyFn - Optional custom function to generate cache keys
 * @returns Memoized version of the function
 */
const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    // Create a cache key from the arguments
    const key = keyFn 
      ? keyFn(...args) 
      : JSON.stringify(args);
    
    // Check if result is in cache
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    // Call the original function
    const result = fn(...args);
    
    // Store result in cache
    cache.set(key, result);
    
    return result;
  }) as T;
};

/**
 * Generate a cache key for CompareProperties
 */
const comparePropertiesKeyFn = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T,
  secondObject: U
): string => {
  return JSON.stringify([
    Object.keys(firstObject).sort(),
    Object.keys(secondObject).sort()
  ]);
};

/**
 * Generate a cache key for CompareValuesWithConflicts
 */
const compareValuesWithConflictsKeyFn = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T,
  secondObject: U,
  pathOfConflict: string = '',
  options: ComparisonOptions = {}
): string => {
  // Include path and options in the cache key
  // Note: We stringify only specific options to avoid circular reference issues in the key generation itself
  const safeOptions = {
    strict: options.strict,
    circularReferences: options.circularReferences
  };
  
  // For cache key, we use object IDs instead of full objects to avoid circular references
  return JSON.stringify([
    Object.keys(firstObject).sort().join(','),
    Object.keys(secondObject).sort().join(','),
    pathOfConflict,
    safeOptions
  ]);
};

/**
 * Generate a cache key for CompareValuesWithDetailedDifferences
 */
const compareValuesWithDetailedDifferencesKeyFn = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T,
  secondObject: U,
  pathOfConflict: string = '',
  options: ComparisonOptions = {}
): string => {
  // Include path and options in the cache key
  // Note: We stringify only specific options to avoid circular reference issues in the key generation itself
  const safeOptions = {
    strict: options.strict,
    circularReferences: options.circularReferences
  };
  
  // For cache key, we use object IDs instead of full objects to avoid circular references
  return JSON.stringify([
    Object.keys(firstObject).sort().join(','),
    Object.keys(secondObject).sort().join(','),
    pathOfConflict,
    safeOptions
  ]);
};

/**
 * Memoized version of CompareProperties
 */
const MemoizedCompareProperties = memoize(CompareProperties, comparePropertiesKeyFn);

/**
 * Memoized version of CompareArrays
 */
const MemoizedCompareArrays = memoize(CompareArrays);

/**
 * Memoized version of CompareValuesWithConflicts
 */
const MemoizedCompareValuesWithConflicts = memoize(
  CompareValuesWithConflicts, 
  compareValuesWithConflictsKeyFn
);

/**
 * Memoized version of CompareValuesWithDetailedDifferences
 */
const MemoizedCompareValuesWithDetailedDifferences = memoize(
  CompareValuesWithDetailedDifferences, 
  compareValuesWithDetailedDifferencesKeyFn
);

/**
 * Gets the type name of a value for better type information
 * @param value - The value to get the type of
 * @returns A string representing the type
 */
const getTypeName = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (isArrayGuard(value)) return 'array';
  if (isDateGuard(value)) return 'date';
  if (isRegExpGuard(value)) return 'regexp';
  if (isObjectGuard(value)) return 'object';
  return typeof value;
};

/**
 * Type-safe version of CompareArrays that includes type information in the result
 * 
 * @param firstArray - First array to compare
 * @param secondArray - Second array to compare
 * @param options - Optional comparison options (strict, circularReferences, pathFilter)
 * @returns Object with isEqual flag and type information
 */
const TypeSafeCompareArrays = <T extends unknown[], U extends unknown[]>(
  firstArray: T, 
  secondArray: U,
  options: ComparisonOptions = {}
): TypedComparisonResult<T, U> => {
  const isEqual = CompareArrays(firstArray, secondArray, options);
  
  return {
    isEqual,
    firstType: Array.isArray(firstArray) ? 'array' : (firstArray === null ? 'null' : 'undefined'),
    secondType: Array.isArray(secondArray) ? 'array' : (secondArray === null ? 'null' : 'undefined')
  };
};

/**
 * Maps properties between objects with different structures
 * 
 * @param sourceObject - Source object
 * @param propertyMapping - Mapping from source properties to target properties
 * @returns A new object with mapped properties
 */
const mapObjectProperties = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  sourceObject: T,
  propertyMapping: Partial<Record<keyof T, keyof U>>
): Partial<U> => {
  const result = {} as Partial<U>;
  
  Object.entries(propertyMapping).forEach(([sourceKey, targetKey]) => {
    if (sourceKey in sourceObject && targetKey) {
      // @ts-ignore - We know these keys exist based on the check
      result[targetKey] = sourceObject[sourceKey];
    }
  });
  
  return result;
};

/**
 * Type-safe version of object comparison that supports objects with different structures
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param options - Type-safe comparison options
 * @returns Object with isEqual flag and type information
 */
const TypeSafeCompareObjects = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined,
  options: TypeSafeComparisonOptions<T, U> = {}
): TypedComparisonResult<T, U> => {
  // Handle null and undefined cases
  if (!firstObject || !secondObject) {
    return {
      isEqual: firstObject === secondObject,
      firstType: (firstObject === null ? 'null' : firstObject === undefined ? 'undefined' : 'object') as any,
      secondType: (secondObject === null ? 'null' : secondObject === undefined ? 'undefined' : 'object') as any
    };
  }
  
  // Create a new object for comparison if property mapping is provided
  if (options.propertyMapping && Object.keys(options.propertyMapping).length > 0) {
    // Create a clean object with only mapped properties
    const mappedFirstObject: Record<string, unknown> = {};
    
    // Apply property mapping
    for (const [sourceKey, targetKey] of Object.entries(options.propertyMapping)) {
      if (sourceKey in firstObject && targetKey) {
        // Map the source property to the target property name
        // @ts-ignore - We know these keys exist based on the check
        mappedFirstObject[targetKey] = firstObject[sourceKey];
      }
    }
    
    // Use existing CompareValuesWithConflicts function for comparison
    const conflicts = CompareValuesWithConflicts(
      mappedFirstObject as any, 
      secondObject, 
      '', 
      {
        strict: options.strict,
        circularReferences: options.circularReferences,
        pathFilter: options.pathFilter
      }
    );
    
    return {
      isEqual: conflicts.length === 0,
      firstType: 'object' as any,
      secondType: 'object' as any
    };
  } else {
    // Without property mapping, do a regular comparison
    const conflicts = CompareValuesWithConflicts(
      firstObject as any, 
      secondObject as any, 
      '', 
      {
        strict: options.strict,
        circularReferences: options.circularReferences,
        pathFilter: options.pathFilter
      }
    );
    
    return {
      isEqual: conflicts.length === 0,
      firstType: 'object' as any,
      secondType: 'object' as any
    };
  }
};

/**
 * Type-safe version of detailed comparison that supports objects with different structures
 * and provides type information
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param options - Type-safe comparison options
 * @returns Array of typed detailed differences with type information
 */
const TypeSafeCompareValuesWithDetailedDifferences = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined,
  options: TypeSafeComparisonOptions<T, U> = {}
): TypedDetailedDifference[] => {
  // Handle null and undefined cases
  if (!firstObject || !secondObject) {
    return [{
      path: '',
      type: (!firstObject && !secondObject) ? 'changed' : (!firstObject ? 'added' : 'removed'),
      oldValue: firstObject,
      newValue: secondObject,
      oldValueType: getTypeName(firstObject),
      newValueType: getTypeName(secondObject)
    }];
  }
  
  // Apply property mapping if provided
  let mappedFirstObject: Record<string, unknown> = firstObject;
  if (options.propertyMapping && Object.keys(options.propertyMapping).length > 0) {
    mappedFirstObject = {
      ...firstObject,
      ...mapObjectProperties(firstObject, options.propertyMapping)
    };
  }
  
  // Get detailed differences using existing function
  const differences = CompareValuesWithDetailedDifferences(
    mappedFirstObject as any, 
    secondObject, 
    '', 
    {
      strict: options.strict,
      circularReferences: options.circularReferences,
      pathFilter: options.pathFilter
    }
  );
  
  // Enhance with type information if requested
  if (options.includeTypeInfo) {
    return differences.map(diff => ({
      ...diff,
      oldValueType: getTypeName(diff.oldValue),
      newValueType: getTypeName(diff.newValue)
    }));
  }
  
  return differences as TypedDetailedDifference[];
};

/**
 * Type guard that checks if two objects are equal
 * Can be used to narrow types in conditional branches
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param options - Optional comparison options
 * @returns Type predicate indicating if the objects are equal
 */
const ObjectsAreEqual = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined,
  options: ComparisonOptions = {}
): firstObject is (T & U) => {
  if (!firstObject || !secondObject) {
    return firstObject === secondObject;
  }
  
  // For type guard functionality, we need to check if the first object contains all properties
  // from the second object, this ensures the type narrowing works correctly
  const firstObjectKeys = Object.keys(firstObject);
  const secondObjectKeys = Object.keys(secondObject);
  
  // Check if all properties from second object exist in first object
  for (const key of secondObjectKeys) {
    if (!firstObjectKeys.includes(key)) {
      return false;
    }
  }
  
  // For non-strict comparison, we need to check if property values are equal
  // We specifically only compare the properties that exist in second object
  const comparisonObject: Record<string, unknown> = {};
  for (const key of secondObjectKeys) {
    // @ts-ignore - We know these keys exist based on the check above
    comparisonObject[key] = firstObject[key];
  }
  
  // Now compare only the properties that matter for type guard
  const conflicts = CompareValuesWithConflicts(
    comparisonObject, 
    secondObject, 
    '', 
    options
  );
  
  return conflicts.length === 0;
};

/**
 * Checks if the second object is a subset of the first object
 * This is useful for checking if an object satisfies a specific interface
 * 
 * @param firstObject - Object to check against
 * @param secondObject - Object that should be a subset
 * @param options - Optional comparison options
 * @returns Boolean indicating if secondObject is a subset of firstObject
 */
const IsSubset = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined,
  options: ComparisonOptions = {}
): boolean => {
  if (!firstObject || !secondObject) {
    return false;
  }
  
  // Create a filtered version of firstObject with only the keys from secondObject
  const secondObjectKeys = Object.keys(secondObject);
  const filteredFirstObject: Record<string, unknown> = {};
  
  for (const key of secondObjectKeys) {
    if (key in firstObject) {
      // @ts-ignore - We know these keys exist based on the check
      filteredFirstObject[key] = firstObject[key];
    } else {
      return false; // If secondObject has a key that firstObject doesn't, it's not a subset
    }
  }
  
  // Now compare the filtered first object with the second object
  const conflicts = CompareValuesWithConflicts(
    filteredFirstObject as any, 
    secondObject as any, 
    '', 
    options
  );
  
  return conflicts.length === 0;
};

/**
 * Gets the common type structure between two objects
 * Useful for understanding what properties are shared between objects
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @returns A new object containing only common properties with their types
 */
const GetCommonStructure = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined
): Partial<CompatibleObject<T, U>> => {
  if (!firstObject || !secondObject) {
    return {};
  }
  
  const result = {} as Partial<CompatibleObject<T, U>>;
  const { common } = CompareProperties(firstObject as any, secondObject as any);
  
  for (const key of common) {
    if (key in firstObject && key in secondObject) {
      // @ts-ignore - We know these keys exist based on the check
      const firstValue = firstObject[key];
      // @ts-ignore
      const secondValue = secondObject[key];
      
      // If both values are objects, recursively get their common structure
      if (isObjectGuard(firstValue) && isObjectGuard(secondValue)) {
        // @ts-ignore
        result[key] = GetCommonStructure(firstValue, secondValue);
      } else {
        // @ts-ignore
        result[key] = firstValue;
      }
    }
  }
  
  return result;
};

export {
  CompareProperties,
  CompareArrays,
  CompareValuesWithConflicts,
  CompareValuesWithDetailedDifferences,
  MemoizedCompareProperties,
  MemoizedCompareArrays,
  MemoizedCompareValuesWithConflicts,
  MemoizedCompareValuesWithDetailedDifferences,
  memoize,
  TypeSafeCompareArrays,
  mapObjectProperties,
  TypeSafeCompareObjects,
  TypeSafeCompareValuesWithDetailedDifferences,
  ObjectsAreEqual,
  IsSubset,
  GetCommonStructure
}; 