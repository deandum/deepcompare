import * as deepCompare from '../index';
import { SchemaValidation, SchemaValidationResult } from '../src/types';

describe('Schema Validation', () => {
  // Sample objects for testing
  const user1 = {
    id: 1,
    name: 'John',
    email: 'john@example.com',
    age: 30,
    isActive: true
  };

  const user2 = {
    id: 2,
    name: 'Jane',
    email: 'jane@example.com',
    age: 28,
    isActive: false
  };

  const userSchema = {
    id: 'number',
    name: 'string',
    email: 'string',
    age: 'number',
    isActive: 'boolean'
  };

  describe('Basic validation', () => {
    it('should validate objects against schema correctly', () => {
      const schemaValidation: SchemaValidation = {
        firstObjectSchema: userSchema,
        secondObjectSchema: userSchema
      };

      const result = deepCompare.ValidateObjectsAgainstSchemas(user1, user2, schemaValidation);

      expect(result.firstObjectValid).toBe(true);
      expect(result.secondObjectValid).toBe(true);
      expect(result.firstObjectErrors).toBeUndefined();
      expect(result.secondObjectErrors).toBeUndefined();
    });

    it('should detect type mismatches', () => {
      const userWithWrongTypes = {
        id: '5', // Should be number
        name: 123, // Should be string
        email: 'bob@example.com',
        age: 'thirty', // Should be number
        isActive: 1 // Should be boolean
      };

      const schemaValidation: SchemaValidation = {
        firstObjectSchema: userSchema,
        secondObjectSchema: userSchema
      };

      const result = deepCompare.ValidateObjectsAgainstSchemas(userWithWrongTypes, user2, schemaValidation);

      expect(result.firstObjectValid).toBe(false);
      expect(result.secondObjectValid).toBe(true);
      expect(result.firstObjectErrors?.length).toBeGreaterThan(0);
      expect(result.firstObjectErrors?.some(err => err.includes('id'))).toBe(true);
      expect(result.firstObjectErrors?.some(err => err.includes('name'))).toBe(true);
      expect(result.firstObjectErrors?.some(err => err.includes('age'))).toBe(true);
    });

    it('should detect missing properties', () => {
      const incompleteUser = {
        id: 3,
        name: 'Bob',
        // Missing email, age, and isActive
      };

      const schemaValidation: SchemaValidation = {
        firstObjectSchema: userSchema,
        secondObjectSchema: userSchema
      };

      const result = deepCompare.ValidateObjectsAgainstSchemas(incompleteUser, user2, schemaValidation);

      expect(result.firstObjectValid).toBe(false);
      expect(result.secondObjectValid).toBe(true);
      expect(result.firstObjectErrors?.some(err => err.includes('email'))).toBe(true);
      expect(result.firstObjectErrors?.some(err => err.includes('age'))).toBe(true);
      expect(result.firstObjectErrors?.some(err => err.includes('isActive'))).toBe(true);
    });

    it('should throw error when configured to do so', () => {
      const invalidUser = {
        id: 'invalid', // Should be number
        name: 123 // Should be string
      };

      const schemaValidation: SchemaValidation = {
        firstObjectSchema: userSchema,
        secondObjectSchema: userSchema,
        throwOnValidationFailure: true
      };

      expect(() => {
        deepCompare.ValidateObjectsAgainstSchemas(invalidUser, user2, schemaValidation);
      }).toThrow('Schema validation failed');
    });
  });

  describe('Complex validations', () => {
    it('should validate nested objects', () => {
      const userWithAddress = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          zipCode: 12345
        }
      };

      const userWithInvalidAddress = {
        id: 2,
        name: 'Jane',
        email: 'jane@example.com',
        address: {
          street: 123, // Should be string
          city: 'Anytown',
          zipCode: '12345' // Should be number
        }
      };

      const nestedSchema = {
        id: 'number',
        name: 'string',
        email: 'string',
        address: {
          street: 'string',
          city: 'string',
          zipCode: 'number'
        }
      };

      const schemaValidation: SchemaValidation = {
        firstObjectSchema: nestedSchema,
        secondObjectSchema: nestedSchema
      };

      const result = deepCompare.ValidateObjectsAgainstSchemas(
        userWithAddress, 
        userWithInvalidAddress, 
        schemaValidation
      );

      expect(result.firstObjectValid).toBe(true);
      expect(result.secondObjectValid).toBe(false);
      expect(result.secondObjectErrors?.some(err => err.includes('address.street'))).toBe(true);
      expect(result.secondObjectErrors?.some(err => err.includes('address.zipCode'))).toBe(true);
    });

    it('should validate arrays in objects', () => {
      const userWithArray = {
        id: 1,
        name: 'John',
        tags: ['admin', 'developer']
      };

      const userWithInvalidArray = {
        id: 2,
        name: 'Jane',
        tags: [1, 2, 3] // Should be strings
      };

      const arraySchema = {
        id: 'number',
        name: 'string',
        tags: 'array<string>'
      };

      const schemaValidation: SchemaValidation = {
        firstObjectSchema: arraySchema,
        secondObjectSchema: arraySchema
      };

      const result = deepCompare.ValidateObjectsAgainstSchemas(
        userWithArray, 
        userWithInvalidArray, 
        schemaValidation
      );

      expect(result.firstObjectValid).toBe(true);
      expect(result.secondObjectValid).toBe(false);
      expect(result.secondObjectErrors?.some(err => err.includes('tags'))).toBe(true);
    });

    it('should validate complex nested arrays and objects', () => {
      const complexObject = {
        users: [
          { id: '1', name: 'User 1', roles: ['admin', 'user'] },
          { id: '2', name: 'User 2', roles: ['user'] },
        ],
        config: {
          version: 1,
          settings: {
            enabled: true,
            timeout: 30
          }
        }
      };

      const invalidComplexObject = {
        users: [
          { id: '1', name: 'User 1', roles: ['admin', 'user'] },
          { id: 2, name: 'User 2', roles: [123] } // Invalid id type and role type
        ],
        config: {
          version: '1', // Should be number
          settings: {
            enabled: 1, // Should be boolean
            timeout: '30' // Should be number
          }
        }
      };

      const complexSchema = {
        users: [{
          id: 'string',
          name: 'string',
          roles: 'array<string>'
        }],
        config: {
          version: 'number',
          settings: {
            enabled: 'boolean',
            timeout: 'number'
          }
        }
      };

      const schemaValidation: SchemaValidation = {
        firstObjectSchema: complexSchema,
        secondObjectSchema: complexSchema
      };

      const result = deepCompare.ValidateObjectsAgainstSchemas(
        complexObject, 
        invalidComplexObject, 
        schemaValidation
      );

      expect(result.firstObjectValid).toBe(true);
      expect(result.secondObjectValid).toBe(false);
      expect(result.secondObjectErrors?.length).toBeGreaterThan(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle null and undefined objects', () => {
      const schemaValidation: SchemaValidation = {
        firstObjectSchema: userSchema,
        secondObjectSchema: userSchema
      };

      const result1 = deepCompare.ValidateObjectsAgainstSchemas(null, user2, schemaValidation);
      expect(result1.firstObjectValid).toBe(false);
      expect(result1.secondObjectValid).toBe(true);
      expect(result1.firstObjectErrors?.[0]).toBe('First object is null or undefined');

      const result2 = deepCompare.ValidateObjectsAgainstSchemas(user1, undefined, schemaValidation);
      expect(result2.firstObjectValid).toBe(true);
      expect(result2.secondObjectValid).toBe(false);
      expect(result2.secondObjectErrors?.[0]).toBe('Second object is null or undefined');
    });

    it('should handle empty schemas', () => {
      const schemaValidation: SchemaValidation = {
        firstObjectSchema: {},
        secondObjectSchema: {}
      };

      const result = deepCompare.ValidateObjectsAgainstSchemas(user1, user2, schemaValidation);

      expect(result.firstObjectValid).toBe(true);
      expect(result.secondObjectValid).toBe(true);
    });

    it('should handle any type specification', () => {
      const mixedObject = {
        id: 1,
        dynamic: "string value", // Could be any type
        config: {
          setting: true,
          value: 42
        }
      };

      const anyTypeSchema = {
        id: 'number',
        dynamic: 'any', // Accept any type
        config: {
          setting: 'boolean',
          value: 'any' // Accept any type
        }
      };

      const schemaValidation: SchemaValidation = {
        firstObjectSchema: anyTypeSchema
      };

      const result = deepCompare.ValidateObjectsAgainstSchemas(mixedObject, {}, schemaValidation);
      expect(result.firstObjectValid).toBe(true);
    });
  });

  describe('Integration with comparison functions', () => {
    it('should validate before comparison and report differences', () => {
      const baseUser = { ...user1 };
      const modifiedUser = { ...user1, name: 'Modified Name' };

      const schemaValidation: SchemaValidation = {
        firstObjectSchema: userSchema,
        secondObjectSchema: userSchema
      };

      const options = { schemaValidation };

      // Test with CompareValuesWithConflicts
      const conflicts = deepCompare.CompareValuesWithConflicts(baseUser, modifiedUser, '', options);
      expect(conflicts).not.toBeNull();
      expect(conflicts).toContain('name');
      
      // Test with CompareValuesWithDetailedDifferences
      const details = deepCompare.CompareValuesWithDetailedDifferences(baseUser, modifiedUser, '', options);
      expect(details).not.toBeNull();
      expect(details.some(d => d.path === 'name')).toBe(true);
      
      // Test with CompareArrays
      const arr1 = [{ ...user1 }, { ...user2 }];
      const arr2 = [{ ...user1 }, { ...user2 }];
      
      const arrResult = deepCompare.CompareArrays(arr1, arr2, options);
      expect(arrResult).toBe(true);
    });
  });
}); 