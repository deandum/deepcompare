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
  // Default options
  const { strict = true, maxDepth = Infinity } = options;
  
  // Handle falsy cases
  if (!firstArray || !secondArray) {
    return false;
  }

  // Must have the same length
  if (firstArray.length !== secondArray.length) {
    return false;
  }

  // Compare each element
  for (let i = 0; i < firstArray.length; i++) {
    const firstElement = firstArray[i];
    const secondElement = secondArray[i];
    
    // For arrays, recursively compare if maxDepth allows
    if (Array.isArray(firstElement) && Array.isArray(secondElement)) {
      if (maxDepth <= 1) {
        // At max depth, just check reference equality
        if (firstElement !== secondElement) return false;
      } else {
        // Recursively compare arrays with decreased depth
        if (!CompareArrays(firstElement, secondElement, {
          ...options,
          maxDepth: maxDepth === Infinity ? Infinity : maxDepth - 1
        })) {
          return false;
        }
      }
    } 
    // For objects (but not arrays), do a deep comparison
    else if (isObject(firstElement) && isObject(secondElement)) {
      if (maxDepth <= 1) {
        // At max depth, just check reference equality
        if (firstElement !== secondElement) return false;
      } else {
        // Compare objects with decreased depth
        const conflicts = CompareValuesWithConflicts(
          firstElement, 
          secondElement,
          '', 
          {
            ...options,
            maxDepth: maxDepth === Infinity ? Infinity : maxDepth - 1
          }
        );
        
        if (conflicts.length > 0) return false;
      }
    } 
    // For primitive values or different types
    else {
      if (!areValuesEqual(firstElement, secondElement, strict)) {
        return false;
      }
    }
  }

  return true;
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
  // Default options
  const { strict = true, maxDepth = Infinity } = options;
  
  // If we've reached max depth, stop recursion and return no conflicts
  if (maxDepth <= 0) return [];
  
  let conflicts: string[] = [];
  const currentDepth = maxDepth === Infinity ? Infinity : maxDepth - 1;

  // First handle case where objects have different keys
  if (Object.keys(firstObject).length !== Object.keys(secondObject).length) {
    const result = CompareProperties(firstObject, secondObject);
    
    // Add differences to conflicts
    result.differences.forEach(diff => {
      const conflictPath = isEmpty(pathOfConflict) ? diff : `${pathOfConflict}.${diff}`;
      conflicts.push(conflictPath);
    });
    
    // For deeper checks, focus only on common properties
    if (currentDepth > 0) {
      const firstFiltered = pick(firstObject, result.common);
      const secondFiltered = pick(secondObject, result.common);
      
      // Only continue if we have common properties to check
      if (Object.keys(firstFiltered).length > 0) {
        const deeperConflicts = processObjectProperties(
          firstFiltered,
          secondFiltered,
          pathOfConflict,
          { strict, maxDepth: currentDepth }
        );
        
        conflicts = conflicts.concat(deeperConflicts);
      }
    }
    
    return conflicts;
  }
  
  // If objects have same keys, process all properties
  return processObjectProperties(
    firstObject,
    secondObject,
    pathOfConflict,
    { strict, maxDepth: currentDepth }
  );
};

/**
 * Helper function to process object properties and find conflicts
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param basePath - Base path for conflicts
 * @param options - Comparison options
 * @returns Array of conflict paths
 */
const processObjectProperties = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T,
  secondObject: U,
  basePath: string = '',
  options: ComparisonOptions = {}
): string[] => {
  // Default options
  const { strict = true, maxDepth = Infinity } = options;
  
  const conflicts: string[] = [];
  
  // Process each property in the first object
  for (const [key, value] of Object.entries(firstObject)) {
    // Skip if the second object doesn't have this property
    if (!hasOwn(secondObject, key)) continue;
    
    // Build the conflict path for this property
    const conflictPath = isEmpty(basePath) ? key : `${basePath}.${key}`;
    
    // Check different types of values
    if (isObject(value) && isObject(secondObject[key])) {
      // Process nested object only if we haven't reached max depth
      if (maxDepth > 0) {
        const nestedConflicts = CompareValuesWithConflicts(
          value,
          secondObject[key],
          conflictPath,
          {
            strict,
            maxDepth: maxDepth === Infinity ? Infinity : maxDepth - 1
          }
        );
        
        if (nestedConflicts.length > 0) {
          conflicts.push(...nestedConflicts);
        }
      } else if (value !== secondObject[key]) {
        // At max depth, just check reference equality
        conflicts.push(conflictPath);
      }
    }
    else if (Array.isArray(value)) {
      // Check if second value is also an array
      if (!Array.isArray(secondObject[key])) {
        conflicts.push(conflictPath);
      } 
      // Compare arrays
      else if (!CompareArrays(value, secondObject[key], {
        strict,
        maxDepth: maxDepth === Infinity ? Infinity : maxDepth - 1
      })) {
        conflicts.push(conflictPath);
      }
    }
    // For primitive values
    else if (!areValuesEqual(value, secondObject[key], strict)) {
      conflicts.push(conflictPath);
    }
  }
  
  return conflicts;
};

export {
  CompareProperties,
  CompareArrays,
  CompareValuesWithConflicts,
}; 