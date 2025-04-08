import { SchemaValidation, SchemaValidationResult } from '../types';
import { SchemaValidationError } from './errors';
import { hasOwn, isEmpty, isObject } from './utils';

/**
 * Validates an object against a schema
 * @param obj - Object to validate
 * @param schema - Schema to validate against
 * @param path - Current path (used for error messages)
 * @returns Array of validation error messages
 */
export const validateObjectAgainstSchema = (
  obj: Record<string, unknown>, 
  schema: Record<string, unknown>, 
  path: string = ''
): string[] => {
  const errors: string[] = [];
  
  // Check all schema properties against the object
  for (const key in schema) {
    const currentPath = path ? `${path}.${key}` : key;
    
    // Check if property exists
    if (!hasOwn(obj, key)) {
      errors.push(`Missing required property: ${currentPath}`);
      continue;
    }
    
    const schemaValue = schema[key];
    const objValue = obj[key];
    
    // Check property type
    if (typeof schemaValue === 'string') {
      // String values in schema represent type constraints
      const expectedType = schemaValue as string;
      
      if (expectedType === 'any') {
        // Skip type checking for 'any'
        continue;
      }
      
      // Handle special array type notation: 'array<string>', 'array<number>', etc.
      if (expectedType.startsWith('array<') && expectedType.endsWith('>')) {
        if (!Array.isArray(objValue)) {
          errors.push(`Property ${currentPath} should be an array but got ${typeof objValue}`);
          continue;
        }
        
        // Extract the array item type
        const itemType = expectedType.substring(6, expectedType.length - 1);
        
        // Validate array items if needed
        for (let i = 0; i < (objValue as any[]).length; i++) {
          const item = (objValue as any[])[i];
          if (typeof item !== itemType && itemType !== 'any') {
            errors.push(`Array item ${currentPath}[${i}] should be of type ${itemType} but got ${typeof item}`);
          }
        }
        continue;
      }
      
      // Check primitive types
      if (typeof objValue !== expectedType && expectedType !== 'any') {
        errors.push(`Property ${currentPath} should be of type ${expectedType} but got ${typeof objValue}`);
      }
    }
    else if (isObject(schemaValue) && !isEmpty(schemaValue)) {
      // For nested objects, recursively validate
      if (isObject(objValue)) {
        const nestedErrors = validateObjectAgainstSchema(objValue as Record<string, unknown>, schemaValue as Record<string, unknown>, currentPath);
        errors.push(...nestedErrors);
      } else {
        errors.push(`Property ${currentPath} should be an object but got ${typeof objValue}`);
      }
    }
    else if (Array.isArray(schemaValue)) {
      // Array schema - check that the value is an array
      if (!Array.isArray(objValue)) {
        errors.push(`Property ${currentPath} should be an array but got ${typeof objValue}`);
        continue;
      }
      
      // If the schema array has a single item, it's a schema for all items
      if (schemaValue.length === 1 && isObject(schemaValue[0])) {
        const itemSchema = schemaValue[0];
        // Check each array item against the item schema
        for (let i = 0; i < (objValue as any[]).length; i++) {
          const item = (objValue as any[])[i];
          if (isObject(item)) {
            const nestedErrors = validateObjectAgainstSchema(
              item as Record<string, unknown>, 
              itemSchema as Record<string, unknown>, 
              `${currentPath}[${i}]`
            );
            errors.push(...nestedErrors);
          } else {
            errors.push(`Array item ${currentPath}[${i}] should be an object but got ${typeof item}`);
          }
        }
      }
    }
  }
  
  return errors;
};

/**
 * Validates objects against schemas based on schema validation options
 * @param firstObject - First object to validate
 * @param secondObject - Second object to validate
 * @param schemaValidation - Schema validation options
 * @returns Validation result with any errors
 */
export const ValidateObjectsAgainstSchemas = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  firstObject: T | null | undefined,
  secondObject: U | null | undefined,
  schemaValidation: SchemaValidation
): SchemaValidationResult => {
  // Handle null or undefined inputs
  if (!firstObject || !secondObject) {
    return {
      firstObjectValid: !firstObject ? false : true,
      secondObjectValid: !secondObject ? false : true,
      firstObjectErrors: !firstObject ? ['First object is null or undefined'] : undefined,
      secondObjectErrors: !secondObject ? ['Second object is null or undefined'] : undefined
    };
  }
  
  const result: SchemaValidationResult = {
    firstObjectValid: true,
    secondObjectValid: true
  };
  
  // Validate first object if schema is provided
  if (schemaValidation.firstObjectSchema) {
    const firstObjectErrors = validateObjectAgainstSchema(
      firstObject,
      schemaValidation.firstObjectSchema
    );
    
    if (firstObjectErrors.length > 0) {
      result.firstObjectValid = false;
      result.firstObjectErrors = firstObjectErrors;
    }
  }
  
  // Validate second object if schema is provided
  if (schemaValidation.secondObjectSchema) {
    const secondObjectErrors = validateObjectAgainstSchema(
      secondObject,
      schemaValidation.secondObjectSchema
    );
    
    if (secondObjectErrors.length > 0) {
      result.secondObjectValid = false;
      result.secondObjectErrors = secondObjectErrors;
    }
  }
  
  // If throwOnValidationFailure is true and any validation failed, throw an error
  if (schemaValidation.throwOnValidationFailure && 
      (!result.firstObjectValid || !result.secondObjectValid)) {
    const errorMsg = `Schema validation failed: ${
      !result.firstObjectValid ? 'First object has validation errors. ' : ''
    }${
      !result.secondObjectValid ? 'Second object has validation errors.' : ''
    }`;
    throw new SchemaValidationError(errorMsg, result);
  }
  
  return result;
}; 