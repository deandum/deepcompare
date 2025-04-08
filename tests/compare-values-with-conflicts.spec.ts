import * as deepCompare from '../src/main';

describe('Test CompareValuesWithConflicts method', () => {
  let firstObject: Record<string, any>;
  let secondObject: Record<string, any>;
  let conflicts: string[] | null;

  describe('with simple objects', () => {
    it('finds conflict', () => {
      firstObject = {
        foo: 1,
        bar: 2
      };

      secondObject = {
        foo: 2,
        bar: 2
      };

      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(1);
      expect(conflicts[0]).toBe('foo');
    });

    it('finds conflict with different amount of keys', () => {
      firstObject = {
        foo: 1,
        bar: 2,
        baz: 3
      };

      secondObject = {
        foo: 2,
        bar: 2,
        x: 0,
        y: 0
      };

      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(4);
      expect(conflicts.includes('baz')).toBe(true);
      expect(conflicts.includes('x')).toBe(true);
      expect(conflicts.includes('y')).toBe(true);
      expect(conflicts.includes('foo')).toBe(true);
    });

    it('finds conflict with different keys', () => {
      firstObject = {
        foo: 1,
        bar: 2,
        baz: 3
      };

      secondObject = {
        a: 2,
        b: 2,
        c: 0
      };

      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(6);
      expect(conflicts).toEqual(expect.arrayContaining(['foo', 'bar', 'baz', 'a', 'b', 'c']));
    });

    it('succeeds', () => {
      firstObject = {
        foo: 1,
        bar: 2
      };

      secondObject = {
        foo: 1,
        bar: 2
      };

      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(0);
    });
  });

  describe('with nested objects', () => {
    it('finds conflict', () => {
      firstObject = {
        nested: {
          foo: 1,
          bar: 2
        }
      };

      secondObject = {
        nested: {
          foo: 2,
          bar: 4
        }
      };

      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(2);
      expect(conflicts).toEqual(expect.arrayContaining(['nested.foo', 'nested.bar']));
    });

    it('succeeds', () => {
      firstObject = {
        nested: {
          foo: 1,
          bar: 2
        }
      };

      secondObject = {
        nested: {
          foo: 1,
          bar: 2
        }
      };

      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(0);
    });
  });

  describe('with nested arrays', () => {
    it('finds conflict', () => {
      firstObject = {
        array: [
          1,
          2
        ]
      };

      secondObject = {
        array: [
          2,
          4
        ]
      };

      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(1);
      expect(conflicts[0]).toBe('array');
    });

    it('finds conflict with nested objects as elements', () => {
      firstObject = {
        array: [
          {
            foo: 1,
            bar: 2
          },
          {
            foo: -1,
            bar: -2
          }
        ]
      };

      secondObject = {
        array: [
          {
            foo: 2,
            bar: 4
          },
          {
            foo: -1,
            bar: -2
          }
        ]
      };

      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(1);
      expect(conflicts[0]).toBe('array');
    });

    it('succeeds', () => {
      firstObject = {
        array: [
          1,
          2
        ]
      };

      secondObject = {
        array: [
          1,
          2
        ]
      };

      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(0);
    });
  });

  describe('with all together', () => {
    it('finds conflict', () => {
      firstObject = {
        foo: 'a',
        bar: false,
        array: [
          1,
          2
        ],
        array2: [
          {
            x: null,
            y: null
          }
        ],
        nested: {
          x: 0,
          y: ["test"]
        }
      };

      secondObject = {
        foo: 'b',
        bar: true,
        array: [
          2,
          4
        ],
        array2: [
          {
            x: 0,
            y: 0
          }
        ],
        nested: {
          x: 0,
          y: ["test-2"]
        }
      };

      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(5);
      expect(conflicts).toEqual(expect.arrayContaining([
        'foo', 'bar', 'array', 'array2', 'nested.y'
      ]));
    });
  });
  
  describe('with maxDepth option', () => {
    it('limits the depth of object comparison', () => {
      firstObject = {
        level1: {
          level2: {
            level3: {
              value: 42
            }
          }
        }
      };
      
      secondObject = {
        level1: {
          level2: {
            level3: {
              value: 43
            }
          }
        }
      };
      
      // Full depth comparison should find the difference
      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(1);
      expect(conflicts[0]).toBe('level1.level2.level3.value');
      
      // Limited depth to 2 levels should not find the difference
      conflicts = deepCompare.CompareValuesWithConflicts(
        firstObject, 
        secondObject, 
        '', 
        { maxDepth: 2 }
      );
      expect(conflicts.length).toBe(0);
      
      // Limited depth to 3 levels should find the difference
      conflicts = deepCompare.CompareValuesWithConflicts(
        firstObject, 
        secondObject, 
        '', 
        { maxDepth: 3 }
      );
      expect(conflicts.length).toBe(1);
      expect(conflicts[0]).toBe('level1.level2.level3');
    });
  });
  
  describe('with strict option', () => {
    it('handles special values with non-strict comparison', () => {
      firstObject = {
        nan: NaN,
        nullValue: null,
        date: new Date('2023-01-01')
      };
      
      secondObject = {
        nan: NaN,
        nullValue: undefined,
        date: new Date('2023-01-01')
      };
      
      // With strict=true (default), these are different
      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(1);
      expect(conflicts[0]).toBe('nullValue');
      
      // With strict=false, null and undefined are considered equal
      conflicts = deepCompare.CompareValuesWithConflicts(
        firstObject, 
        secondObject, 
        '', 
        { strict: false }
      );
      expect(conflicts.length).toBe(0);
    });
    
    it('handles date objects correctly', () => {
      firstObject = {
        date1: new Date('2023-01-01'),
        date2: new Date('2023-01-02')
      };
      
      secondObject = {
        date1: new Date('2023-01-01'),
        date2: new Date('2023-01-03')
      };
      
      conflicts = deepCompare.CompareValuesWithConflicts(firstObject, secondObject, '');
      expect(conflicts.length).toBe(1);
      expect(conflicts[0]).toBe('date2');
    });
  });
}); 