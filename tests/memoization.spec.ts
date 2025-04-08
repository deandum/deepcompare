import * as deepCompare from '../index';
import { ComparePropertiesResult } from '../src/types';

describe('Test Memoization functionality', () => {
  // Test the memoize utility function
  describe('Memoize utility function', () => {
    it('should return consistent results for the same inputs', () => {
      // Create a simple function to test memoization
      const testFn = (a: number, b: number) => a + b;
      const memoizedFn = deepCompare.Memoize(testFn);
      
      // First call
      const result1 = memoizedFn(1, 2);
      
      // Second call with same arguments
      const result2 = memoizedFn(1, 2);
      
      // Results should be consistent
      expect(result1).toBe(3);
      expect(result2).toBe(3);
    });
    
    it('should handle complex objects as arguments', () => {
      const testFn = (obj: Record<string, any>) => obj.value;
      const memoizedFn = deepCompare.Memoize(testFn);
      
      const obj1 = { value: 42 };
      const obj2 = { value: 42 }; // Same structure, different reference
      
      // First call
      const result1 = memoizedFn(obj1);
      
      // Second call with different object but same structure
      const result2 = memoizedFn(obj2);
      
      // Results should be consistent
      expect(result1).toBe(42);
      expect(result2).toBe(42);
    });
  });
  
  // Test MemoizedCompareProperties
  describe('MemoizedCompareProperties', () => {
    it('should return the same result as CompareProperties', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, c: 3 };
      
      const regularResult = deepCompare.CompareProperties(obj1, obj2);
      const memoizedResult = deepCompare.MemoizedCompareProperties(obj1, obj2);
      
      expect(memoizedResult).toEqual(regularResult);
    });
    
    it('should return consistent results for repeated comparisons', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, c: 3 };
      
      // First call
      const result1 = deepCompare.MemoizedCompareProperties(obj1, obj2);
      
      // Second call with same objects
      const result2 = deepCompare.MemoizedCompareProperties(obj1, obj2);
      
      // Results should be consistent
      expect(result1).toEqual(result2);
      
      // Call with different objects
      const result3 = deepCompare.MemoizedCompareProperties({ a: 1, b: 2 }, { a: 1, d: 4 });
      
      // Results should be different
      expect(result3).not.toEqual(result1);
    });
  });
  
  // Test MemoizedCompareArrays
  describe('MemoizedCompareArrays', () => {
    it('should return the same result as CompareArrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const arr3 = [1, 2, 4];
      
      const regularResult1 = deepCompare.CompareArrays(arr1, arr2);
      const memoizedResult1 = deepCompare.MemoizedCompareArrays(arr1, arr2);
      expect(memoizedResult1).toBe(regularResult1);
      
      const regularResult2 = deepCompare.CompareArrays(arr1, arr3);
      const memoizedResult2 = deepCompare.MemoizedCompareArrays(arr1, arr3);
      expect(memoizedResult2).toBe(regularResult2);
    });
    
    it('should return consistent results for repeated comparisons', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      
      // First call
      const result1 = deepCompare.MemoizedCompareArrays(arr1, arr2);
      
      // Second call with same arrays
      const result2 = deepCompare.MemoizedCompareArrays(arr1, arr2);
      
      // Results should be consistent
      expect(result1).toBe(result2);
      
      // Call with different arrays
      const result3 = deepCompare.MemoizedCompareArrays([1, 2, 3], [1, 2, 4]);
      
      // Results should be different
      expect(result3).not.toBe(result1);
    });
  });
  
  // Test MemoizedCompareValuesWithConflicts
  describe('MemoizedCompareValuesWithConflicts', () => {
    it('should return the same result as CompareValuesWithConflicts', () => {
      const obj1 = { a: 1, b: { x: 2, y: 3 } };
      const obj2 = { a: 1, b: { x: 2, y: 4 } };
      
      const regularResult = deepCompare.CompareValuesWithConflicts(obj1, obj2);
      const memoizedResult = deepCompare.MemoizedCompareValuesWithConflicts(obj1, obj2);
      
      expect(memoizedResult).toEqual(regularResult);
    });
    
    it('should return consistent results for repeated comparisons', () => {
      const obj1 = { a: 1, b: { x: 2, y: 3 } };
      const obj2 = { a: 1, b: { x: 2, y: 4 } };
      
      // First call
      const result1 = deepCompare.MemoizedCompareValuesWithConflicts(obj1, obj2);
      
      // Second call with same objects
      const result2 = deepCompare.MemoizedCompareValuesWithConflicts(obj1, obj2);
      
      // Results should be consistent
      expect(result1).toEqual(result2);
      
      // Call with completely different object structure
      const result3 = deepCompare.MemoizedCompareValuesWithConflicts(
        { a: 1, c: { z: 10 } },
        { a: 1, c: { z: 20 } }
      );
      
      // Check that we get a different conflict path
      expect(result3[0]).toEqual('c.z');
      expect(result3[0]).not.toEqual(result1[0]);
    });
    
    it('should handle options parameter correctly', () => {
      const obj1 = { a: 1, b: { x: 2, y: 3 } };
      const obj2 = { a: 1, b: { x: 2, y: 4 } };
      
      // First call with default options
      const result1 = deepCompare.MemoizedCompareValuesWithConflicts(obj1, obj2);
      
      // Second call with same objects but different options
      const result2 = deepCompare.MemoizedCompareValuesWithConflicts(obj1, obj2, '', { strict: false });
      
      // Results might be different due to different options
      // We're just testing that both calls work without errors
      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
    });
  });
}); 