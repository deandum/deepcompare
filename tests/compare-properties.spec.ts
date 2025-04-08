import * as deepCompare from '../index';
import { ComparePropertiesResult } from '../src/types';

describe('Test CompareProperties method', () => {
  describe('Basic property comparison', () => {
    it('should compare object properties correctly', () => {
      const obj1 = { foo: 1 };
      const obj2 = { foo: 1, bar: 2 };

      const result = deepCompare.CompareProperties(obj1, obj2);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.differences.length).toBe(1);
        expect(result.differences[0]).toBe('bar');
        expect(result.common.length).toBe(1);
        expect(result.common[0]).toBe('foo');
      }
    });

    it('should find no common properties when objects are completely different', () => {
      const obj1 = { foo: 1, a: 1 };
      const obj2 = { bar: 2, b: 2 };

      const result = deepCompare.CompareProperties(obj1, obj2);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.differences.length).toBe(4);
        expect(result.differences).toContain('foo');
        expect(result.differences).toContain('bar');
        expect(result.differences).toContain('a');
        expect(result.differences).toContain('b');
        expect(result.common.length).toBe(0);
      }
    });

    it('should find all common properties when objects are identical', () => {
      const obj1 = { foo: 1, bar: 2 };
      const obj2 = { foo: 1, bar: 2 };

      const result = deepCompare.CompareProperties(obj1, obj2);
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.differences.length).toBe(0);
        expect(result.common.length).toBe(2);
        expect(result.common).toContain('foo');
        expect(result.common).toContain('bar');
      }
    });

    it('should handle empty objects', () => {
      const result1 = deepCompare.CompareProperties({}, {});
      if (result1) {
        expect(result1.differences.length).toBe(0);
        expect(result1.common.length).toBe(0);
      }

      const obj = { a: 1, b: 2 };
      const result2 = deepCompare.CompareProperties(obj, {});
      if (result2) {
        expect(result2.differences.length).toBe(2);
        expect(result2.differences).toContain('a');
        expect(result2.differences).toContain('b');
        expect(result2.common.length).toBe(0);
      }
    });
  });

  describe('Memoization', () => {
    it('should produce the same results with memoized version', () => {
      const obj1 = { foo: 1, bar: 2 };
      const obj2 = { foo: 1, baz: 3 };

      const regularResult = deepCompare.CompareProperties(obj1, obj2);
      const memoizedResult = deepCompare.MemoizedCompareProperties(obj1, obj2);
      
      expect(memoizedResult).toEqual(regularResult);
    });

    it('should be consistent across multiple calls', () => {
      const obj1 = { foo: 1, bar: 2 };
      const obj2 = { foo: 1, baz: 3 };

      // First call
      const result1 = deepCompare.MemoizedCompareProperties(obj1, obj2);
      
      // Second call with same objects
      const result2 = deepCompare.MemoizedCompareProperties(obj1, obj2);
      
      expect(result1).toEqual(result2);
    });
  });
}); 