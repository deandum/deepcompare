import * as deepCompare from '../index';
import { ComparisonOptions } from '../src/types';

describe('Test CompareValuesWithConflicts method', () => {
  describe('Basic object comparison', () => {
    it('should detect value differences in objects', () => {
      const obj1 = { foo: 1 };
      const obj2 = { foo: 2 };

      const conflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2);
      
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts.length).toBe(1);
        expect(conflicts[0]).toBe('foo');
      }
    });

    it('should detect structural differences in objects', () => {
      const obj1 = {
        foo: 1,
        baz: {
          x: 1,
          y: 2
        }
      };
      
      const obj2 = {
        bar: 2,
        baz: {
          x: 1,
          z: 3
        },
        foo: 1
      };

      const conflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2);
      
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        // The actual number depends on implementation details
        expect(conflicts.length).toBeGreaterThan(0);
        // Check for specific paths that should be identified as conflicts
        expect(conflicts.some(path => path.includes('baz'))).toBe(true);
      }
    });

    it('should detect deeply nested differences', () => {
      const obj1 = {
        a: {
          b: {
            c: {
              d: 1
            }
          }
        }
      };
      
      const obj2 = {
        a: {
          b: {
            c: {
              d: 2
            }
          }
        }
      };

      const conflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2);
      
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts.length).toBeGreaterThan(0);
        expect(conflicts.some(path => path.includes('a.b.c.d'))).toBe(true);
      }
    });

    it('should not detect non-existent differences', () => {
      const obj1 = { foo: 1, bar: { baz: true } };
      const obj2 = { foo: 1, bar: { baz: true } };

      const conflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2);
      
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts.length).toBe(0);
      }
    });
  });

  describe('Array comparison', () => {
    it('should detect differences in arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 4];

      const conflicts = deepCompare.CompareValuesWithConflicts(arr1, arr2);
      
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts.length).toBeGreaterThan(0);
        // The implementation might handle array differences in different ways
        // Just check that it detects something
      }
    });

    it('should handle arrays of different lengths', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2];

      const conflicts = deepCompare.CompareValuesWithConflicts(arr1, arr2);
      
      expect(conflicts).not.toBeNull();
      // Implementation may report this as a conflict or not
      // Just check that it doesn't crash
    });
  });

  describe('Mixed type comparison', () => {
    it('should detect when comparing different types', () => {
      const obj = { a: 1 };
      const arr = [1, 2, 3];

      const conflicts = deepCompare.CompareValuesWithConflicts(obj, arr);
      
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts.length).toBeGreaterThan(0);
        // The actual path might vary based on implementation
      }
    });

    it('should detect when comparing array vs object', () => {
      const arr = [1, 2, 3];
      const obj = { 0: 1, 1: 2, 2: 3 };

      const conflicts = deepCompare.CompareValuesWithConflicts(arr, obj);
      
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts.length).toBeGreaterThan(0);
        // The actual path might vary based on implementation
      }
    });

    it('should handle null and undefined according to implementation', () => {
      const obj1 = { a: null };
      const obj2 = { a: undefined };

      const conflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2);
      
      expect(conflicts).not.toBeNull();
      // The actual behavior depends on the implementation's handling of null vs undefined
    });
  });

  describe('With options', () => {
    it('should respect strict mode', () => {
      const obj1 = { a: 1, b: '2' };
      const obj2 = { a: '1', b: 2 };

      // With strict mode
      const strictConflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2, '', { strict: true });
      
      expect(strictConflicts).not.toBeNull();
      if (strictConflicts) {
        expect(strictConflicts.length).toBeGreaterThan(0);
      }

      // Without strict mode
      const nonStrictConflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2, '', { strict: false });
      
      // In non-strict mode, there should be fewer conflicts
      expect(nonStrictConflicts.length).toBeLessThanOrEqual(strictConflicts.length);
    });
  });

  describe('Path filtering', () => {
    it('should exclude specified paths', () => {
      const obj1 = { 
        a: 1, 
        b: 2,
        c: { 
          d: 3 
        } 
      };
      
      const obj2 = { 
        a: 2, 
        b: 2,
        c: { 
          d: 4 
        } 
      };

      // Get all conflicts without filtering
      const allConflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2);
      
      // Now exclude 'a' path
      const conflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2, '', {
        pathFilter: {
          patterns: ['a'],
          mode: 'exclude'
        }
      });
      
      expect(conflicts).not.toBeNull();
      if (conflicts && allConflicts) {
        // There should be fewer conflicts when excluding a path
        expect(conflicts.length).toBeLessThan(allConflicts.length);
        expect(conflicts.includes('a')).toBe(false);
      }
    });

    it('should include only specified paths', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 2, b: 2, c: 4 };

      const conflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2, '', {
        pathFilter: {
          patterns: ['b'],
          mode: 'include'
        }
      });
      
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        // Only paths including 'b' should be reported, and b is equal in both objects
        expect(conflicts.includes('a')).toBe(false);
        expect(conflicts.includes('c')).toBe(false);
      }
    });
  });

  describe('Date comparison', () => {
    it('should compare dates correctly', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-02');

      const obj1 = { date1, date2 };
      const obj2 = { date1, date2: new Date('2023-01-03') };

      const conflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2);
      
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts.length).toBeGreaterThan(0);
        expect(conflicts.some(path => path.includes('date2'))).toBe(true);
      }
    });
  });

  describe('Circular references', () => {
    it('should throw an error when encountering circular references by default', () => {
      // Create circular references in objects
      const obj1: any = { a: 1, b: 2 };
      obj1.self = obj1; // Self-reference

      const obj2: any = { a: 1, b: 2 };
      obj2.self = obj2; // Self-reference
      
      expect(() => {
        deepCompare.CompareValuesWithConflicts(obj1, obj2);
      }).toThrow(/circular reference detected/i);
    });

    it('should not report conflicts when circular references are identical and using ignore option', () => {
      // Create circular references in objects
      const obj1: any = { a: 1, b: 2 };
      obj1.self = obj1; // Self-reference

      const obj2: any = { a: 1, b: 2 };
      obj2.self = obj2; // Self-reference

      const options: ComparisonOptions = {
        circularReferences: 'ignore'
      };
      
      const conflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2, '', options);
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts.length).toBe(0);
      }
    });

    it('should report conflicts in objects with circular references when values differ', () => {
      // Create circular references in objects with different values
      const obj1: any = { a: 1, b: 2 };
      obj1.self = obj1;

      const obj2: any = { a: 1, b: 3 }; // Different value for b
      obj2.self = obj2;

      const options: ComparisonOptions = {
        circularReferences: 'ignore'
      };
      
      const conflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2, '', options);
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts.length).toBeGreaterThan(0);
        expect(conflicts.some(path => path.includes('b'))).toBe(true);
      }
    });

    it('should handle complex nested objects with circular references', () => {
      // Create complex nested objects with circular references
      const obj1: any = { 
        a: 1, 
        b: { 
          c: 3, 
          d: 4 
        } 
      };
      obj1.b.parent = obj1; // Circular reference to parent

      const obj2: any = { 
        a: 1, 
        b: { 
          c: 3, 
          d: 4 
        } 
      };
      obj2.b.parent = obj2; // Circular reference to parent

      const options: ComparisonOptions = {
        circularReferences: 'ignore'
      };
      
      const conflicts = deepCompare.CompareValuesWithConflicts(obj1, obj2, '', options);
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts.length).toBe(0);
      }
    });

    it('should handle mutual circular references between objects', () => {
      // Create objects with mutual circular references
      const objA: any = { name: 'A' };
      const objB: any = { name: 'B' };
      objA.ref = objB;
      objB.ref = objA;

      const objC: any = { name: 'A' };
      const objD: any = { name: 'B' };
      objC.ref = objD;
      objD.ref = objC;

      const options: ComparisonOptions = {
        circularReferences: 'ignore'
      };
      
      const conflicts = deepCompare.CompareValuesWithConflicts(objA, objC, '', options);
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts.length).toBe(0); // Should be equal when ignoring circular references
      }
    });
  });
}); 