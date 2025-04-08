import * as objectDeepCompare from './src/main';
import { ComparisonOptions, DetailedDifference, CircularReferenceHandling } from './src/types';

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
 * @param options - Optional comparison options (strict, circularReferences)
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
 * @param options - Optional comparison options (strict, circularReferences)
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
 * @param options - Optional comparison options (strict, circularReferences)
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

export {
  CompareProperties,
  CompareArrays,
  CompareValuesWithConflicts,
  CompareValuesWithDetailedDifferences,
  DetailedDifference,
  ComparisonOptions,
  CircularReferenceHandling
}; 