/**
 * Core utility functions for object comparison
 */

/**
 * Helper function to check if an object has a property
 * @param obj - Object to check
 * @param key - Property to check for
 * @returns Whether the object has the property
 */
export const hasOwn = (obj: Record<string, any>, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

/**
 * Helper function to check if a value is empty
 * @param value - Value to check
 * @returns Whether the value is empty
 */
export const isEmpty = (value: any): boolean => {
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
export const isObject = (value: any): boolean => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Helper function to determine if two values are equal
 * @param a - First value
 * @param b - Second value
 * @param strict - Whether to use strict equality
 * @returns Whether the values are equal
 */
export const areValuesEqual = (a: any, b: any, strict = true): boolean => {
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
export const pick = <T extends Record<string, any>>(obj: T, keys: string[]): Record<string, any> => {
  return keys.reduce((result, key) => {
    if (hasOwn(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Record<string, any>);
};

/**
 * Gets the type name of a value for better type information
 * @param value - The value to get the type of
 * @returns A string representing the type
 */
export const getTypeName = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (value instanceof RegExp) return 'regexp';
  if (typeof value === 'object') return 'object';
  return typeof value;
}; 