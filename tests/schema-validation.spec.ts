import * as deepCompare from '../src/main';
import { SchemaValidation, SchemaValidationResult } from '../src/types';

describe('Schema Validation', () => {
  // Test validateObjectAgainstSchema through the exported validateObjectsAgainstSchemas
  describe('validateObjectsAgainstSchemas', () => {
    it('validates objects against schemas', () => {
      const firstObject = {
        id: '123',
        name: 'Test Object',
        age: 30,
        active: true,
        tags: ['tag1', 'tag2'],
        metadata: {
          createdAt: '2023-01-01',
          updatedAt: '2023-02-01'
        }
      };

      const secondObject = {
        id: 456, // Wrong type, should be string
        name: 'Another Object',
        age: '25', // Wrong type, should be number
        active: true,
        // missing tags
        metadata: {
          createdAt: '2023-03-01'
          // missing updatedAt
        }
      };

      const schema = {
        id: 'string',
        name: 'string',
        age: 'number',
        active: 'boolean',
        tags: 'array<string>',
        metadata: {
          createdAt: 'string',
          updatedAt: 'string'
        }
      };

      const options: SchemaValidation = {
        firstObjectSchema: schema,
        secondObjectSchema: schema,
        throwOnValidationFailure: false
      };

      const result = deepCompare.validateObjectsAgainstSchemas(firstObject, secondObject, options);

      expect(result.firstObjectValid).toBe(true);
      expect(result.secondObjectValid).toBe(false);
      expect(result.secondObjectErrors).toContain('Property id should be of type string but got number');
      expect(result.secondObjectErrors).toContain('Property age should be of type number but got string');
      expect(result.secondObjectErrors).toContain('Missing required property: tags');
      expect(result.secondObjectErrors).toContain('Missing required property: metadata.updatedAt');
    });

    it('throws an error when throwOnValidationFailure is true', () => {
      const object = {
        id: 123, // Wrong type, should be string
        name: 'Test'
      };

      const schema = {
        id: 'string',
        name: 'string'
      };

      const options: SchemaValidation = {
        firstObjectSchema: schema,
        throwOnValidationFailure: true
      };

      expect(() => {
        deepCompare.validateObjectsAgainstSchemas(object, {}, options);
      }).toThrow('Schema validation failed: First object has validation errors.');
    });

    it('validates nested array structures', () => {
      const object = {
        users: [
          { id: '1', name: 'User 1', roles: ['admin', 'user'] },
          { id: 2, name: 'User 2', roles: ['user'] },
          { id: '3', name: 'User 3', roles: [123] }
        ]
      };

      const schema = {
        users: [
          {
            id: 'string',
            name: 'string',
            roles: 'array<string>'
          }
        ]
      };

      const options: SchemaValidation = {
        firstObjectSchema: schema,
        throwOnValidationFailure: false
      };

      const result = deepCompare.validateObjectsAgainstSchemas(object, {}, options);

      expect(result.firstObjectValid).toBe(false);
      expect(result.firstObjectErrors).toContain('Property users[1].id should be of type string but got number');
      expect(result.firstObjectErrors).toContain('Array item users[2].roles[0] should be of type string but got number');
    });
  });

  // Test schema validation with comparison functions
  describe('with CompareValuesWithConflicts', () => {
    it('validates objects before comparison', () => {
      const firstObject = {
        id: '123',
        name: 'Test',
        value: 42
      };

      const secondObject = {
        id: 456, // Wrong type
        name: 'Test', 
        value: 42
      };

      const schema = {
        id: 'string',
        name: 'string',
        value: 'number'
      };

      const options = {
        schemaValidation: {
          firstObjectSchema: schema,
          secondObjectSchema: schema,
          throwOnValidationFailure: true
        }
      };

      expect(() => {
        deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '', options);
      }).toThrow('Schema validation failed:');
    });

    it('continues comparison when validation passes', () => {
      const firstObject = {
        id: '123',
        name: 'Test',
        value: 42
      };

      const secondObject = {
        id: '123', // Changed to match first object's id
        name: 'Test', 
        value: 43 // Different value
      };

      const schema = {
        id: 'string',
        name: 'string',
        value: 'number'
      };

      const options = {
        schemaValidation: {
          firstObjectSchema: schema,
          secondObjectSchema: schema,
          throwOnValidationFailure: true
        }
      };

      const conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '', options);
      expect(conflicts).toEqual(['value']);
    });
  });

  describe('with CompareValuesWithDetailedDifferences', () => {
    it('compares objects after validation passes', () => {
      const firstObject = {
        id: '123',
        name: 'Test',
        value: 42
      };

      const secondObject = {
        id: '456',
        name: 'Test',
        value: 42
      };

      const schema = {
        id: 'string',
        name: 'string',
        value: 'number'
      };

      const options = {
        schemaValidation: {
          firstObjectSchema: schema,
          secondObjectSchema: schema
        }
      };

      const differences = deepCompare.CompareValuesWithDetailedDifferences(
        firstObject, 
        secondObject,
        '',
        options
      );

      expect(differences.length).toBe(1);
      expect(differences[0].path).toBe('id');
      expect(differences[0].type).toBe('changed');
      expect(differences[0].oldValue).toBe('123');
      expect(differences[0].newValue).toBe('456');
    });
  });

  describe('with CompareArrays', () => {
    it('validates arrays before comparison', () => {
      const firstArray = [
        { id: '1', value: 10 },
        { id: '2', value: 20 }
      ];

      const secondArray = [
        { id: 1, value: 10 }, // Wrong type
        { id: '2', value: 20 }
      ];

      const itemSchema = {
        id: 'string',
        value: 'number'
      };

      const options = {
        schemaValidation: {
          firstObjectSchema: itemSchema,
          secondObjectSchema: itemSchema,
          throwOnValidationFailure: true
        }
      };

      expect(() => {
        deepCompare.CompareArrays(firstArray, secondArray, options);
      }).toThrow('Schema validation failed:');
    });

    it('compares arrays when validation passes', () => {
      const firstArray = [
        { id: '1', value: 10 },
        { id: '2', value: 20 }
      ];

      const secondArray = [
        { id: '1', value: 10 },
        { id: '2', value: 20 }
      ];

      const itemSchema = {
        id: 'string',
        value: 'number'
      };

      const options = {
        schemaValidation: {
          firstObjectSchema: itemSchema,
          secondObjectSchema: itemSchema,
          throwOnValidationFailure: true
        }
      };

      const result = deepCompare.CompareArrays(firstArray, secondArray, options);
      expect(result).toBe(true);
    });
  });

  describe('with any type', () => {
    it('skips type checking for properties with "any" type', () => {
      const object = {
        id: '123',
        dynamicValue: 42, // could be any type
        metadata: {
          type: 'number',
          nested: {
            anyValue: true
          }
        }
      };

      const schema = {
        id: 'string',
        dynamicValue: 'any', // accept any type
        metadata: {
          type: 'string',
          nested: {
            anyValue: 'any' // accept any type
          }
        }
      };

      const options: SchemaValidation = {
        firstObjectSchema: schema,
        throwOnValidationFailure: false
      };

      const result = deepCompare.validateObjectsAgainstSchemas(object, {}, options);
      expect(result.firstObjectValid).toBe(true);
      expect(result.firstObjectErrors).toBeUndefined();
      expect(result.secondObjectValid).toBe(true);
    });
  });
}); 