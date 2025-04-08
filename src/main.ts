import { ComparePropertiesResult, ComparisonOptions, DetailedDifference, DifferenceType } from './types';

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
 * Handles comparison for arrays and objects
 * @param firstValue - First value to compare
 * @param secondValue - Second value to compare
 * @param currentPath - Current path for conflicts
 * @param options - Comparison options
 * @param isArrayComparison - Whether this is an array comparison
 * @param detailed - Whether to return detailed difference information
 * @returns Array of conflict paths or detailed differences, or boolean indicating equality
 */
const handleDepthComparison = (
  firstValue: any,
  secondValue: any,
  currentPath: string,
  options: ComparisonOptions,
  isArrayComparison: boolean,
  detailed: boolean = false
): string[] | DetailedDifference[] | boolean => {
  const { strict = true } = options;

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

  // Handle arrays
  if (Array.isArray(firstValue) && Array.isArray(secondValue)) {
    if (firstValue.length !== secondValue.length) {
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
      
      // Compare array elements
      if (isObject(firstValue[i]) && isObject(secondValue[i])) {
        // Recursively compare objects within arrays
        const result = handleDepthComparison(
          firstValue[i],
          secondValue[i],
          elemPath,
          options,
          false,
          detailed
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
      } else if (Array.isArray(firstValue[i]) && Array.isArray(secondValue[i])) {
        // Recursively compare nested arrays
        const result = handleDepthComparison(
          firstValue[i],
          secondValue[i],
          elemPath,
          options,
          true,
          detailed
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
    const allKeys = new Set([...Object.keys(firstValue), ...Object.keys(secondValue)]);
    const conflicts = detailed ? [] as DetailedDifference[] : [] as string[];
    
    allKeys.forEach(key => {
      const hasFirst = hasOwn(firstValue, key);
      const hasSecond = hasOwn(secondValue, key);
      const propPath = currentPath ? `${currentPath}.${key}` : key;
      
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
        return;
      }
      
      // Both objects have the key, compare their values
      const result = handleDepthComparison(
        firstValue[key],
        secondValue[key],
        propPath,
        options,
        false,
        detailed
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
    });
    
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

  // Use the unified depth handling function
  return handleDepthComparison(firstArray, secondArray, '', options, true, false) === true;
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
    // If this is an array element conflict (contains [), get the array path
    if (conflict.includes('[')) {
      const arrayPath = conflict.substring(0, conflict.indexOf('['));
      processedConflicts.add(arrayPath);
    } else {
      processedConflicts.add(conflict);
    }
  }
  
  return Array.from(processedConflicts);
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
  // Use the unified depth handling function with detailed flag
  const conflicts = handleDepthComparison(firstObject, secondObject, pathOfConflict, options, false, true);
  return Array.isArray(conflicts) ? conflicts as DetailedDifference[] : [];
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
  return JSON.stringify([
    firstObject,
    secondObject,
    pathOfConflict,
    options
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
  return JSON.stringify([
    firstObject,
    secondObject,
    pathOfConflict,
    options
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

export {
  CompareProperties,
  CompareArrays,
  CompareValuesWithConflicts,
  CompareValuesWithDetailedDifferences,
  MemoizedCompareProperties,
  MemoizedCompareArrays,
  MemoizedCompareValuesWithConflicts,
  MemoizedCompareValuesWithDetailedDifferences,
  memoize
}; 