import { ComparisonOptions, DetailedDifference, DifferenceType } from '../types';
import { CircularReferenceError } from './errors';
import { shouldComparePath } from './path-filtering';
import { areValuesEqual, isObject } from './utils';

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
export const handleDepthComparison = (
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
      const hasFirst = key in firstValue;
      const hasSecond = key in secondValue;
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