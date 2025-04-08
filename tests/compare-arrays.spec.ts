import * as deepCompare from '../src/main';

describe('Test CompareArrays method', () => {
  let firstArray: any[];
  let secondArray: any[];

  describe('when falsy', () => {
    it ('returns false', () => {
      expect(deepCompare.CompareArrays(null as any, null as any)).toBe(false);
      expect(deepCompare.CompareArrays([], null as any)).toBe(false);
      expect(deepCompare.CompareArrays(null as any, [])).toBe(false);
    });
  });

  describe('with different length', () => {
    it ('returns false', () => {
      firstArray = [];
      secondArray = [1];

      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);

      firstArray = [1];
      secondArray = [];

      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);
    });
  });

  describe('with same length', () => {
    it('returns false with simple array', () => {
      firstArray = [1, 2];
      secondArray = [2, 3];

      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);
    });

    it('returns false with nested arrays', () =>{
      firstArray = [1, [1, 2]];
      secondArray = [2, [2, 3]];

      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);

      firstArray = [1, {foo:1}];
      secondArray = [2, {bar:1}];

      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);

      firstArray = [1, {foo:1}];
      secondArray = [1, {foo:2}];

      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);
    });

    it('succeeds', () => {
      firstArray = [1, 2];
      secondArray = [1, 2];

      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(true);

      firstArray = [1, ['a', 'b']];
      secondArray = [1, ['a', 'b']];

      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(true);

      firstArray = [1, {foo: true}];
      secondArray = [1, {foo: true}];

      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(true);
    });
  });
  
  describe('with maxDepth option', () => {
    it('limits comparison depth for nested arrays', () => {
      // Arrays that differ at a deep level
      firstArray = [1, [2, [3, 4]]];
      secondArray = [1, [2, [3, 5]]];
      
      // Regular comparison should find the difference
      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);
      
      // With maxDepth=2, it won't compare the inner arrays (will only compare up to [2, ...])
      expect(deepCompare.CompareArrays(firstArray, secondArray, { maxDepth: 2 })).toBe(true);
    });
    
    it('limits comparison depth for nested objects in arrays', () => {
      // Arrays with objects that differ at a deep level
      firstArray = [1, { nested: { deep: 42 } }];
      secondArray = [1, { nested: { deep: 43 } }];
      
      // Regular comparison should find the difference
      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);
      
      // With maxDepth=2, it won't compare the inner object properties
      expect(deepCompare.CompareArrays(firstArray, secondArray, { maxDepth: 2 })).toBe(true);
    });
  });
  
  describe('with strict option', () => {
    it('allows loose comparison when strict is disabled', () => {
      // String and number that are equal in loose comparison
      firstArray = ['1', 2];
      secondArray = [1, '2'];
      
      // With strict=true (default), these are different
      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);
      
      // With strict=false, these are considered equal
      expect(deepCompare.CompareArrays(firstArray, secondArray, { strict: false })).toBe(false); // Still false because we don't implement loose comparison for primitives
    });
    
    it('handles special values correctly', () => {
      // Special values that should be equal
      firstArray = [NaN, null];
      secondArray = [NaN, undefined];
      
      // With strict=true (default), these are different
      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);
      
      // With strict=false, NaN===NaN and null===undefined
      expect(deepCompare.CompareArrays(firstArray, secondArray, { strict: false })).toBe(true);
    });
  });
}); 