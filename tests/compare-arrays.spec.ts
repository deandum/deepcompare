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
  
  describe('with strict option', () => {
    it('handles type coercion when strict is disabled', () => {
      // String and number that are equal in loose comparison
      firstArray = ['1', 2];
      secondArray = [1, '2'];
      
      // With strict=true (default), these are different
      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);
      
      // With strict=false, these are equal due to type coercion
      expect(deepCompare.CompareArrays(firstArray, secondArray, { strict: false })).toBe(true);
      
      // Test more type coercion cases
      firstArray = ['42', true];
      secondArray = [42, '1'];
      expect(deepCompare.CompareArrays(firstArray, secondArray, { strict: false })).toBe(true);
      
      // Different values should still be different even with type coercion
      firstArray = ['43', true];
      secondArray = [42, '1'];
      expect(deepCompare.CompareArrays(firstArray, secondArray, { strict: false })).toBe(false);
    });
    
    it('handles special values correctly', () => {
      // Special values that should be equal
      firstArray = [NaN, null];
      secondArray = [NaN, undefined];
      
      // With strict=true (default), these are different
      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(false);
      
      // With strict=false, NaN===NaN and null===undefined
      expect(deepCompare.CompareArrays(firstArray, secondArray, { strict: false })).toBe(true);
      
      // Test more special cases
      firstArray = [Infinity, -0];
      secondArray = [Infinity, 0];
      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(true); // These are always equal
      
      firstArray = [new Date('2023-01-01'), /abc/];
      secondArray = [new Date('2023-01-01'), /abc/];
      expect(deepCompare.CompareArrays(firstArray, secondArray)).toBe(true);
    });
  });
}); 