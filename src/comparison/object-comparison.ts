import { ComparisonOptions, CompatibleObject } from '../types';
import { CircularReferenceError } from '../core/errors';
import { ValidateObjectsAgainstSchemas } from '../core/schema-validation';
import { handleDepthComparison } from '../core/value-comparison';
import { Memoize, compareValuesWithConflictsKeyFn } from '../utils/memoization';
import { hasOwn } from '../core/utils';

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
export const CompareValuesWithConflicts = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T,
  secondObject: U,
  pathOfConflict: string = '',
  options: ComparisonOptions = {}
): string[] => {
  // Perform schema validation if specified
  if (options.schemaValidation) {
    ValidateObjectsAgainstSchemas(firstObject, secondObject, options.schemaValidation);
  }
  
  return _CompareValuesWithConflicts(
    firstObject, 
    secondObject, 
    pathOfConflict, 
    options
  );
};

/**
 * Internal implementation of CompareValuesWithConflicts
 * This is separated to allow for memoization
 */
const _CompareValuesWithConflicts = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T,
  secondObject: U,
  pathOfConflict: string = '',
  options: ComparisonOptions = {}
): string[] => {
  // Extract options
  const { circularReferences = 'error', pathFilter, strict = true } = options;

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
 * Type guard that checks if two objects are equal
 * Can be used to narrow types in conditional branches
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param options - Optional comparison options
 * @returns Type predicate indicating if the objects are equal
 */
export const ObjectsAreEqual = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
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
export const IsSubset = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
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
export const GetCommonStructure = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
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
      if (isObject(firstValue) && isObject(secondValue)) {
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

/**
 * Memoized version of CompareValuesWithConflicts
 */
export const MemoizedCompareValuesWithConflicts = Memoize(
  CompareValuesWithConflicts, 
  compareValuesWithConflictsKeyFn
);

// Import missing dependencies after defining functions to avoid circular dependencies
import { shouldComparePath } from '../core/path-filtering';
import { isObject } from '../core/utils';
import { CompareProperties } from './compare-properties'; 