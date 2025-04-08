import { ComparisonOptions } from '../types';
import { CircularReferenceError } from '../core/errors';
import { ValidateObjectsAgainstSchemas } from '../core/schema-validation';
import { handleDepthComparison } from '../core/value-comparison';
import { Memoize } from '../utils/memoization';

/**
 * Compares two arrays and returns whether they are equal
 * 
 * @param firstArray - First array to compare
 * @param secondArray - Second array to compare
 * @param options - Optional comparison options (strict, circularReferences, pathFilter, schemaValidation)
 * @returns True if arrays are equal, false otherwise
 */
export const CompareArrays = (
  firstArray: any[], 
  secondArray: any[],
  options: ComparisonOptions = {}
): boolean => {
  // Handle falsy cases
  if (!Array.isArray(firstArray) || !Array.isArray(secondArray)) {
    return false;
  }

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

  // Extract options
  const { circularReferences = 'error' } = options;

  // If the arrays are the same object, they're equal
  if (firstArray === secondArray) {
    return true;
  }

  // Check for obvious circular references in the top-level arrays
  if (circularReferences === 'error') {
    // Create a simple check for the most direct circular reference cases
    for (let i = 0; i < firstArray.length; i++) {
      if (firstArray[i] === firstArray) {
        throw new CircularReferenceError(`[${i}]`);
      }
    }
    
    for (let i = 0; i < secondArray.length; i++) {
      if (secondArray[i] === secondArray) {
        throw new CircularReferenceError(`[${i}]`);
      }
    }
  }

  try {
    // Use the unified depth handling function
    return handleDepthComparison(firstArray, secondArray, '', options, true, false) === true;
  } catch (error) {
    if (error instanceof CircularReferenceError) {
      if (circularReferences === 'error') {
        throw error;
      }
      // If circularReferences is 'ignore' and we're still throwing, something went wrong
      return false;
    }
    throw error;
  }
};

/**
 * Memoized version of CompareArrays
 */
export const MemoizedCompareArrays = Memoize(CompareArrays); 