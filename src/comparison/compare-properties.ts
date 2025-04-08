import { ComparePropertiesResult } from '../types';
import { hasOwn } from '../core/utils';
import { Memoize, comparePropertiesKeyFn } from '../utils/memoization';

/**
 * Compares the properties of two objects
 * Returns all the different and common properties
 *
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @return Object containing differences and common properties
 */
export const CompareProperties = <T extends Record<string, any>, U extends Record<string, any>>(
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
 * Memoized version of CompareProperties
 */
export const MemoizedCompareProperties = Memoize(CompareProperties, comparePropertiesKeyFn); 