import {
  CompareArrays,
  CompareValuesWithConflicts,
  CompareValuesWithDetailedDifferences,
  ComparisonOptions,
  CircularReferenceHandling,
  DetailedDifference
} from '../index';

describe('Circular Reference Detection', () => {
  describe('CompareArrays with circular references', () => {
    it('should throw an error when encountering circular references by default', () => {
      // Create a circular reference in an array
      const arr1: any[] = [1, 2, 3];
      arr1.push(arr1); // Self-reference

      const arr2: any[] = [1, 2, 3];
      arr2.push(arr2); // Self-reference
      
      expect(() => {
        CompareArrays(arr1, arr2);
      }).toThrow(/circular reference detected/i);
    });

    it('should handle circular references and return true when they are identical with ignore option', () => {
      // Create a circular reference in an array
      const arr1: any[] = [1, 2, 3];
      arr1.push(arr1); // Self-reference

      const arr2: any[] = [1, 2, 3];
      arr2.push(arr2); // Self-reference

      const options: ComparisonOptions = {
        circularReferences: 'ignore'
      };
      
      expect(CompareArrays(arr1, arr2, options)).toBe(true);
    });

    it('should compare nested arrays with circular references', () => {
      // Create nested arrays with circular references
      const arr1: any[] = [1, 2, 3, []];
      arr1[3].push(arr1); // Circular reference to parent

      const arr2: any[] = [1, 2, 3, []];
      arr2[3].push(arr2); // Circular reference to parent

      const options: ComparisonOptions = {
        circularReferences: 'ignore'
      };
      
      expect(CompareArrays(arr1, arr2, options)).toBe(true);
    });

    it('should identify differences in arrays with circular references when using ignore option', () => {
      // Create circular reference in arrays with different values
      const arr1: any[] = [1, 2, 3, []];
      arr1[3].push(arr1); 

      const arr2: any[] = [1, 2, 4, []]; // Different value in position 2
      arr2[3].push(arr2);

      const options: ComparisonOptions = {
        circularReferences: 'ignore'
      };
      
      expect(CompareArrays(arr1, arr2, options)).toBe(false);
    });
  });

  describe('CompareValuesWithConflicts with circular references', () => {
    it('should throw an error when encountering circular references by default', () => {
      // Create circular references in objects
      const obj1: any = { a: 1, b: 2 };
      obj1.self = obj1; // Self-reference

      const obj2: any = { a: 1, b: 2 };
      obj2.self = obj2; // Self-reference
      
      expect(() => {
        CompareValuesWithConflicts(obj1, obj2);
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
      
      const conflicts = CompareValuesWithConflicts(obj1, obj2, '', options);
      expect(conflicts).not.toBeNull();
      expect(conflicts).toEqual([]);
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
      
      const conflicts = CompareValuesWithConflicts(obj1, obj2, '', options);
      expect(conflicts).not.toBeNull();
      if (conflicts) {
        expect(conflicts).toContain('b');
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
      
      const conflicts = CompareValuesWithConflicts(obj1, obj2, '', options);
      expect(conflicts).not.toBeNull();
      expect(conflicts).toEqual([]);
    });
  });

  describe('CompareValuesWithDetailedDifferences with circular references', () => {
    it('should throw an error when encountering circular references by default', () => {
      // Create circular references in objects
      const obj1: any = { a: 1, b: 2 };
      obj1.self = obj1; // Self-reference

      const obj2: any = { a: 1, b: 2 };
      obj2.self = obj2; // Self-reference
      
      expect(() => {
        CompareValuesWithDetailedDifferences(obj1, obj2);
      }).toThrow(/circular reference detected/i);
    });

    it('should not report differences when circular references are identical and using ignore option', () => {
      // Create circular references in objects
      const obj1: any = { a: 1, b: 2 };
      obj1.self = obj1; // Self-reference

      const obj2: any = { a: 1, b: 2 };
      obj2.self = obj2; // Self-reference

      const options: ComparisonOptions = {
        circularReferences: 'ignore'
      };
      
      const differences = CompareValuesWithDetailedDifferences(obj1, obj2, '', options);
      expect(differences).not.toBeNull();
      if (differences) {
        expect(differences.length).toBe(0);
      }
    });

    it('should report detailed differences in objects with circular references when values differ', () => {
      // Create circular references in objects with different values
      const obj1: any = { a: 1, b: 2 };
      obj1.self = obj1;

      const obj2: any = { a: 1, b: 3 }; // Different value for b
      obj2.self = obj2;

      const options: ComparisonOptions = {
        circularReferences: 'ignore'
      };
      
      const differences = CompareValuesWithDetailedDifferences(obj1, obj2, '', options);
      expect(differences).not.toBeNull();
      if (differences) {
        expect(differences.length).toBe(1);
        expect(differences[0].path).toBe('b');
        expect(differences[0].type).toBe('changed');
        expect(differences[0].oldValue).toBe(2);
        expect(differences[0].newValue).toBe(3);
      }
    });

    it('should handle different circular reference structures correctly', () => {
      // Test different circular reference patterns
      const obj1: any = { a: 1 };
      obj1.b = { c: 2, parent: obj1 };

      const obj2: any = { a: 1 };
      obj2.b = { c: 2, self: obj2.b }; // Different circular reference pattern
      
      const options: ComparisonOptions = {
        circularReferences: 'ignore'
      };
      
      const differences = CompareValuesWithDetailedDifferences(obj1, obj2, '', options);
      expect(differences).not.toBeNull();
      if (differences) {
        expect(differences.length).toBeGreaterThan(0);
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
      
      const differences = CompareValuesWithDetailedDifferences(objA, objC, '', options);
      expect(differences).not.toBeNull();
      if (differences) {
        expect(differences.length).toBe(0); // Should be equal when ignoring circular references
      }
    });
  });
}); 