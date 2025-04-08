import { ComparisonOptions } from '../types';

/**
 * Creates a memoized version of a function
 * @param fn - Function to memoize
 * @param keyFn - Optional custom function to generate cache keys
 * @returns Memoized version of the function
 */
export const Memoize = <T extends (...args: any[]) => any>(
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
export const comparePropertiesKeyFn = <T extends Record<string, any>, U extends Record<string, any>>(
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
export const compareValuesWithConflictsKeyFn = <T extends Record<string, any>, U extends Record<string, any>>(
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
export const compareValuesWithDetailedDifferencesKeyFn = <T extends Record<string, any>, U extends Record<string, any>>(
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