import { ComparisonOptions, CompatibleObject, TypeSafeComparisonOptions, TypedComparisonResult, TypedDetailedDifference } from '../types';
import { CompareArrays } from '../comparison/compare-arrays';
import { CompareValuesWithConflicts } from '../comparison/object-comparison';
import { CompareValuesWithDetailedDifferences } from '../comparison/detailed-comparison';
import { ValidateObjectsAgainstSchemas } from '../core/schema-validation';
import { getTypeName } from '../core/utils';

/**
 * Type-safe comparison of arrays that includes type information
 * 
 * @param firstArray - First array to compare
 * @param secondArray - Second array to compare
 * @param options - Optional comparison options (strict, circularReferences)
 * @returns Object with isEqual flag and type information
 */
export const TypeSafeCompareArrays = <T extends unknown[], U extends unknown[]>(
  firstArray: T, 
  secondArray: U,
  options: ComparisonOptions = {}
): TypedComparisonResult<T, U> => {
  // Perform schema validation if specified
  if (options.schemaValidation) {
    // Convert arrays to objects for schema validation if schemas are provided
    if (options.schemaValidation.firstObjectSchema || options.schemaValidation.secondObjectSchema) {
      const firstObject = { items: firstArray };
      const secondObject = { items: secondArray };
      
      // Wrap the array schemas inside an object with 'items' property
      const wrappedFirstSchema = options.schemaValidation.firstObjectSchema 
        ? { items: [options.schemaValidation.firstObjectSchema] } 
        : undefined;
      
      const wrappedSecondSchema = options.schemaValidation.secondObjectSchema 
        ? { items: [options.schemaValidation.secondObjectSchema] } 
        : undefined;
      
      const wrappedSchemaValidation = {
        firstObjectSchema: wrappedFirstSchema,
        secondObjectSchema: wrappedSecondSchema,
        throwOnValidationFailure: options.schemaValidation.throwOnValidationFailure
      };
      
      // Run the schema validation
      ValidateObjectsAgainstSchemas(firstObject, secondObject, wrappedSchemaValidation);
    }
  }

  const isEqual = CompareArrays(firstArray, secondArray, options);
  
  return {
    isEqual,
    firstType: getTypeName(firstArray),
    secondType: getTypeName(secondArray)
  };
};

/**
 * Maps properties between objects with different structures
 * 
 * @param sourceObject - Source object
 * @param propertyMapping - Mapping from source properties to target properties
 * @returns A new object with mapped properties
 */
export const MapObjectProperties = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  sourceObject: T,
  propertyMapping: Partial<Record<keyof T, keyof U>>
): Partial<U> => {
  const result = {} as Partial<U>;
  
  Object.entries(propertyMapping).forEach(([sourceKey, targetKey]) => {
    if (sourceKey in sourceObject && targetKey) {
      // @ts-ignore - We know these keys exist based on the check
      result[targetKey] = sourceObject[sourceKey];
    }
  });
  
  return result;
};

/**
 * Type-safe version of object comparison that supports objects with different structures
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param options - Type-safe comparison options
 * @returns Object with isEqual flag and type information
 */
export const TypeSafeCompareObjects = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined,
  options: TypeSafeComparisonOptions<T, U> = {}
): TypedComparisonResult<T, U> => {
  // Handle null and undefined cases
  if (!firstObject || !secondObject) {
    return {
      isEqual: firstObject === secondObject,
      firstType: (firstObject === null ? 'null' : firstObject === undefined ? 'undefined' : 'object') as any,
      secondType: (secondObject === null ? 'null' : secondObject === undefined ? 'undefined' : 'object') as any
    };
  }
  
  // Create a new object for comparison if property mapping is provided
  if (options.propertyMapping && Object.keys(options.propertyMapping).length > 0) {
    // Create a clean object with only mapped properties
    const mappedFirstObject: Record<string, unknown> = {};
    
    // Apply property mapping
    for (const [sourceKey, targetKey] of Object.entries(options.propertyMapping)) {
      if (sourceKey in firstObject && targetKey) {
        // Map the source property to the target property name
        // @ts-ignore - We know these keys exist based on the check
        mappedFirstObject[targetKey] = firstObject[sourceKey];
      }
    }
    
    // Use existing CompareValuesWithConflicts function for comparison
    const conflicts = CompareValuesWithConflicts(
      mappedFirstObject as any, 
      secondObject, 
      '', 
      {
        strict: options.strict,
        circularReferences: options.circularReferences,
        pathFilter: options.pathFilter
      }
    );
    
    return {
      isEqual: conflicts.length === 0,
      firstType: 'object' as any,
      secondType: 'object' as any
    };
  } else {
    // Without property mapping, do a regular comparison
    const conflicts = CompareValuesWithConflicts(
      firstObject as any, 
      secondObject as any, 
      '', 
      {
        strict: options.strict,
        circularReferences: options.circularReferences,
        pathFilter: options.pathFilter
      }
    );
    
    return {
      isEqual: conflicts.length === 0,
      firstType: 'object' as any,
      secondType: 'object' as any
    };
  }
};

/**
 * Type-safe version of detailed comparison that supports objects with different structures
 * and provides type information
 * 
 * @param firstObject - First object to compare
 * @param secondObject - Second object to compare
 * @param options - Type-safe comparison options
 * @returns Array of typed detailed differences with type information
 */
export const TypeSafeCompareValuesWithDetailedDifferences = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  firstObject: T,
  secondObject: U,
  options: TypeSafeComparisonOptions<T, U> = {}
): TypedDetailedDifference[] => {
  if (!firstObject || !secondObject) {
    return [];
  }

  // Perform schema validation if specified
  if (options.schemaValidation) {
    ValidateObjectsAgainstSchemas(firstObject, secondObject, options.schemaValidation);
  }
  
  // Get standard detailed differences
  const differences = CompareValuesWithDetailedDifferences(firstObject, secondObject, '', options);
  
  // If we don't need type info, just return the standard differences
  if (!options.includeTypeInfo) {
    return differences as TypedDetailedDifference[];
  }
  
  // Add type information to each difference
  return differences.map((diff) => {
    const typedDiff: TypedDetailedDifference = {
      ...diff,
      oldValueType: diff.oldValue !== undefined ? getTypeName(diff.oldValue) : undefined,
      newValueType: diff.newValue !== undefined ? getTypeName(diff.newValue) : undefined
    };
    return typedDiff;
  });
}; 