import { CompareValuesWithDetailedDifferences, DetailedDifference, ComparisonOptions } from '../index';

describe('CompareValuesWithDetailedDifferences', () => {
  describe('Basic functionality', () => {
    it('should return an empty array for identical objects', () => {
      const obj1 = { a: 1, b: 'string', c: true };
      const obj2 = { a: 1, b: 'string', c: true };
      
      const result = CompareValuesWithDetailedDifferences(obj1, obj2);
      expect(result).toEqual([]);
    });

    it('should report added properties with correct type and values', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1, b: 2 };
      
      const result = CompareValuesWithDetailedDifferences(obj1, obj2);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        path: 'b',
        type: 'added',
        oldValue: undefined,
        newValue: 2
      });
    });

    it('should report removed properties with correct type and values', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1 };
      
      const result = CompareValuesWithDetailedDifferences(obj1, obj2);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        path: 'b',
        type: 'removed',
        oldValue: 2,
        newValue: undefined
      });
    });

    it('should report changed properties with correct type and values', () => {
      const obj1 = { a: 1, b: 'original' };
      const obj2 = { a: 1, b: 'changed' };
      
      const result = CompareValuesWithDetailedDifferences(obj1, obj2);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        path: 'b',
        type: 'changed',
        oldValue: 'original',
        newValue: 'changed'
      });
    });
  });

  describe('Nested structures', () => {
    it('should handle nested object differences', () => {
      const obj1 = { 
        a: 1, 
        nested: { 
          b: 2, 
          c: 'unchanged',
          deep: {
            value: 100
          }
        } 
      };
      
      const obj2 = { 
        a: 1, 
        nested: { 
          b: 3, 
          c: 'unchanged',
          deep: {
            value: 200,
            extra: true
          }
        } 
      };
      
      const result = CompareValuesWithDetailedDifferences(obj1, obj2);
      expect(result).toHaveLength(3);
      
      // Check for changed nested.b value
      expect(result).toContainEqual({
        path: 'nested.b',
        type: 'changed',
        oldValue: 2,
        newValue: 3
      });
      
      // Check for changed nested.deep.value
      expect(result).toContainEqual({
        path: 'nested.deep.value',
        type: 'changed',
        oldValue: 100,
        newValue: 200
      });
      
      // Check for added nested.deep.extra
      expect(result).toContainEqual({
        path: 'nested.deep.extra',
        type: 'added',
        oldValue: undefined,
        newValue: true
      });
    });

    it('should handle array differences', () => {
      const obj1 = { array: [1, 2, 3] };
      const obj2 = { array: [1, 5, 3] };
      
      const result = CompareValuesWithDetailedDifferences(obj1, obj2);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        path: 'array[1]',
        type: 'changed',
        oldValue: 2,
        newValue: 5
      });
    });

    it('should handle arrays of different lengths', () => {
      const obj1 = { array: [1, 2, 3] };
      const obj2 = { array: [1, 2, 3, 4] };
      
      const result = CompareValuesWithDetailedDifferences(obj1, obj2);
      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('array');
      expect(result[0].type).toBe('changed');
      expect(result[0].oldValue).toEqual([1, 2, 3]);
      expect(result[0].newValue).toEqual([1, 2, 3, 4]);
    });

    it('should handle nested arrays containing objects', () => {
      const obj1 = { 
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' }
        ]
      };
      
      const obj2 = { 
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bobby' }
        ]
      };
      
      const result = CompareValuesWithDetailedDifferences(obj1, obj2);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        path: 'users[1].name',
        type: 'changed',
        oldValue: 'Bob',
        newValue: 'Bobby'
      });
    });
  });

  describe('Special types', () => {
    it('should handle date objects', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-02-01');
      
      const obj1 = { date: date1 };
      const obj2 = { date: date2 };
      
      const result = CompareValuesWithDetailedDifferences(obj1, obj2);
      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('date');
      expect(result[0].type).toBe('changed');
      expect(result[0].oldValue).toEqual(date1);
      expect(result[0].newValue).toEqual(date2);
    });

    it('should handle non-strict comparison mode', () => {
      const obj1 = { a: 1, b: '2' };
      const obj2 = { a: '1', b: 2 };
      
      // With strict mode (default)
      const strictResult = CompareValuesWithDetailedDifferences(obj1, obj2);
      expect(strictResult.length).toBeGreaterThan(0);
      
      // With non-strict mode
      const nonStrictResult = CompareValuesWithDetailedDifferences(obj1, obj2, '', { strict: false });
      expect(nonStrictResult.length).toBe(0); // Should find no differences with type coercion
    });

    it('should handle circular references with ignore option', () => {
      // Create objects with circular references
      const obj1: any = { a: 1, b: 2 };
      obj1.self = obj1; // Self-reference

      const obj2: any = { a: 1, b: 3 }; // Different value for b
      obj2.self = obj2; // Self-reference

      const options: ComparisonOptions = {
        circularReferences: 'ignore'
      };
      
      const result = CompareValuesWithDetailedDifferences(obj1, obj2, '', options);
      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('b');
      expect(result[0].type).toBe('changed');
      expect(result[0].oldValue).toBe(2);
      expect(result[0].newValue).toBe(3);
    });
  });

  describe('Path filtering', () => {
    it('should respect path filtering options', () => {
      const obj1 = { 
        id: 1, 
        name: 'Product',
        price: 99.99,
        details: {
          color: 'black',
          size: 'medium'
        }
      };
      
      const obj2 = { 
        id: 2, 
        name: 'Updated Product',
        price: 89.99,
        details: {
          color: 'red',
          size: 'medium'
        }
      };

      // Test with exclude filter
      const excludeResult = CompareValuesWithDetailedDifferences(obj1, obj2, '', {
        pathFilter: {
          patterns: ['id', 'details.color'],
          mode: 'exclude'
        }
      });
      
      // Should only contain differences in name and price
      expect(excludeResult.length).toBe(2);
      expect(excludeResult.some(d => d.path === 'name')).toBe(true);
      expect(excludeResult.some(d => d.path === 'price')).toBe(true);
      expect(excludeResult.some(d => d.path === 'id')).toBe(false);
      expect(excludeResult.some(d => d.path === 'details.color')).toBe(false);

      // Test with include filter
      const includeResult = CompareValuesWithDetailedDifferences(obj1, obj2, '', {
        pathFilter: {
          patterns: ['id', 'details.color'],
          mode: 'include'
        }
      });
      
      // Should only contain differences in id and details.color
      expect(includeResult.length).toBe(2);
      expect(includeResult.some(d => d.path === 'id')).toBe(true);
      expect(includeResult.some(d => d.path === 'details.color')).toBe(true);
      expect(includeResult.some(d => d.path === 'name')).toBe(false);
      expect(includeResult.some(d => d.path === 'price')).toBe(false);
    });
  });
}); 