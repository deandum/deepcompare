import * as objectDeepCompare from './src/main';
import { ComparisonOptions, DetailedDifference, CircularReferenceHandling, PathFilter, PathFilterMode,
  TypedComparisonResult, TypedDetailedDifference, TypeSafeComparisonOptions, CompatibleObject } from './src/types';

/**
 * Compares the properties of two objects and returns their differences and commonalities
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @returns Object with differences and common properties or null if inputs are invalid
 */
const CompareProperties = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined
) => {
  if (!firstObject) { return null; }
  if (!secondObject) { return null; }
  return objectDeepCompare.CompareProperties(firstObject, secondObject);
};

/**
 * Compares two arrays for equality
 * 
 * @param firstArray - First array to compare
 * @param secondArray - Second array to compare
 * @param options - Optional comparison options (strict, circularReferences, pathFilter)
 * @returns Boolean indicating if arrays are equal
 */
const CompareArrays = (
  firstArray: any[], 
  secondArray: any[],
  options?: ComparisonOptions
) => {
  return objectDeepCompare.CompareArrays(firstArray, secondArray, options);
};

/**
 * Compares two objects and returns paths to conflicting values
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param pathOfConflict - Starting path for conflict (optional)
 * @param options - Optional comparison options (strict, circularReferences, pathFilter)
 * @returns Array of conflict paths or null if inputs are invalid
 */
const CompareValuesWithConflicts = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined,
  pathOfConflict?: string,
  options?: ComparisonOptions
) => {
  if (!firstObject) { return null; }
  if (!secondObject) { return null; }
  return objectDeepCompare.CompareValuesWithConflicts(
    firstObject, 
    secondObject, 
    pathOfConflict || '',
    options
  );
};

/**
 * Compares two objects and returns detailed information about differences 
 * including type (added, removed, changed) and actual values
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param pathOfConflict - Starting path for conflict (optional)
 * @param options - Optional comparison options (strict, circularReferences, pathFilter)
 * @returns Array of detailed differences or null if inputs are invalid
 */
const CompareValuesWithDetailedDifferences = <T extends Record<string, any>, U extends Record<string, any>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined,
  pathOfConflict?: string,
  options?: ComparisonOptions
) => {
  if (!firstObject) { return null; }
  if (!secondObject) { return null; }
  return objectDeepCompare.CompareValuesWithDetailedDifferences(
    firstObject, 
    secondObject, 
    pathOfConflict || '',
    options
  );
};

/**
 * Type-safe version of CompareArrays that includes type information
 * 
 * @param firstArray - First array to compare
 * @param secondArray - Second array to compare
 * @param options - Optional comparison options
 * @returns Object with isEqual flag and type information
 */
const TypeSafeCompareArrays = <T extends unknown[], U extends unknown[]>(
  firstArray: T,
  secondArray: U,
  options?: ComparisonOptions
) => {
  return objectDeepCompare.TypeSafeCompareArrays(firstArray, secondArray, options);
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
  options?: TypeSafeComparisonOptions<T, U>
) => {
  if (!firstObject) { return null; }
  if (!secondObject) { return null; }
  return objectDeepCompare.TypeSafeCompareObjects(firstObject, secondObject, options);
};

/**
 * Type-safe version of detailed comparison that supports objects with different structures
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param options - Type-safe comparison options
 * @returns Array of typed detailed differences or null if inputs are invalid
 */
const TypeSafeCompareValuesWithDetailedDifferences = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined,
  options?: TypeSafeComparisonOptions<T, U>
) => {
  if (!firstObject) { return null; }
  if (!secondObject) { return null; }
  return objectDeepCompare.TypeSafeCompareValuesWithDetailedDifferences(firstObject, secondObject, options);
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
  options?: ComparisonOptions
): firstObject is (T & U) => {
  if (!firstObject || !secondObject) {
    return firstObject === secondObject;
  }
  return objectDeepCompare.ObjectsAreEqual(firstObject, secondObject, options);
};

/**
 * Checks if the second object is a subset of the first object
 * 
 * @param firstObject - Object to check against
 * @param secondObject - Object that should be a subset
 * @param options - Optional comparison options
 * @returns Boolean indicating if secondObject is a subset of firstObject
 */
const IsSubset = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined,
  options?: ComparisonOptions
) => {
  if (!firstObject || !secondObject) {
    return false;
  }
  return objectDeepCompare.IsSubset(firstObject, secondObject, options);
};

/**
 * Gets the common type structure between two objects
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @returns A new object containing only common properties with their types
 */
const GetCommonStructure = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined
) => {
  if (!firstObject || !secondObject) {
    return {};
  }
  return objectDeepCompare.GetCommonStructure(firstObject, secondObject);
};

export {
  CompareProperties,
  CompareArrays,
  CompareValuesWithConflicts,
  CompareValuesWithDetailedDifferences,
  TypeSafeCompareArrays,
  TypeSafeCompareObjects,
  TypeSafeCompareValuesWithDetailedDifferences,
  ObjectsAreEqual,
  IsSubset,
  GetCommonStructure,
  DetailedDifference,
  TypedDetailedDifference,
  TypedComparisonResult,
  ComparisonOptions,
  TypeSafeComparisonOptions,
  CircularReferenceHandling,
  PathFilter,
  PathFilterMode,
  CompatibleObject
}; 