import { ComparePropertiesResult, ComparisonOptions } from './types';

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
 * @returns Array of conflict paths or boolean indicating equality
 */
const handleDepthComparison = (
  firstValue: any,
  secondValue: any,
  currentPath: string,
  options: ComparisonOptions,
  isArrayComparison: boolean
): string[] | boolean => {
  const { strict = true } = options;

  // Handle Date objects specially
  if (firstValue instanceof Date && secondValue instanceof Date) {
    return firstValue.getTime() === secondValue.getTime() ? true : [currentPath];
  }

  // Handle RegExp objects specially
  if (firstValue instanceof RegExp && secondValue instanceof RegExp) {
    return firstValue.toString() === secondValue.toString() ? true : [currentPath];
  }

  // Handle arrays
  if (Array.isArray(firstValue) && Array.isArray(secondValue)) {
    if (firstValue.length !== secondValue.length) {
      return isArrayComparison ? false : [currentPath];
    }
    
    // When comparing arrays within objects (not direct array comparison)
    if (!isArrayComparison && currentPath) {
      for (let i = 0; i < firstValue.length; i++) {
        const elemResult = handleDepthComparison(
          firstValue[i],
          secondValue[i],
          `${currentPath}[${i}]`,
          options,
          true
        );
        if (elemResult !== true) {
          return [currentPath]; // Return the parent array path for conflicts in nested arrays
        }
      }
      return true;
    }
    
    // For direct array comparison or nested arrays in arrays
    for (let i = 0; i < firstValue.length; i++) {
      const result = handleDepthComparison(
        firstValue[i],
        secondValue[i],
        `${currentPath}[${i}]`,
        options,
        true
      );
      if (result !== true) return result;
    }
    return true;
  }

  // Handle objects
  if (isObject(firstValue) && isObject(secondValue)) {
    const allKeys = new Set([...Object.keys(firstValue), ...Object.keys(secondValue)]);
    const conflicts: string[] = [];
    
    allKeys.forEach(key => {
      // If key exists in one but not in the other
      if (!hasOwn(firstValue, key) || !hasOwn(secondValue, key)) {
        conflicts.push(currentPath ? `${currentPath}.${key}` : key);
        return;
      }
      
      const result = handleDepthComparison(
        firstValue[key],
        secondValue[key],
        currentPath ? `${currentPath}.${key}` : key,
        options,
        false
      );
      
      if (result !== true) {
        if (Array.isArray(result)) {
          conflicts.push(...result);
        } else if (typeof result === 'string') {
          conflicts.push(result);
        }
      }
    });
    
    return conflicts.length > 0 ? conflicts : true;
  }

  // Handle primitive values
  return areValuesEqual(firstValue, secondValue, strict) ? true : [currentPath];
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
  return handleDepthComparison(firstArray, secondArray, '', options, true) === true;
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
  const conflicts = handleDepthComparison(firstObject, secondObject, pathOfConflict, options, false);
  return Array.isArray(conflicts) ? conflicts : [];
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

export {
  CompareProperties,
  CompareArrays,
  CompareValuesWithConflicts,
  MemoizedCompareProperties,
  MemoizedCompareArrays,
  MemoizedCompareValuesWithConflicts,
  memoize
}; 