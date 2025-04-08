import { CompareValuesWithDetailedDifferences, DetailedDifference } from '../index';

describe('CompareValuesWithDetailedDifferences', () => {
  test('should return null for invalid inputs', () => {
    expect(CompareValuesWithDetailedDifferences(null, {})).toBeNull();
    expect(CompareValuesWithDetailedDifferences({}, null)).toBeNull();
    expect(CompareValuesWithDetailedDifferences(undefined, {})).toBeNull();
    expect(CompareValuesWithDetailedDifferences({}, undefined)).toBeNull();
  });

  test('should return an empty array for identical objects', () => {
    const obj1 = { a: 1, b: 'string', c: true };
    const obj2 = { a: 1, b: 'string', c: true };
    
    const result = CompareValuesWithDetailedDifferences(obj1, obj2);
    expect(result).toEqual([]);
  });

  test('should report added properties with correct type and values', () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1, b: 2 };
    
    const result = CompareValuesWithDetailedDifferences(obj1, obj2);
    expect(result).toHaveLength(1);
    expect(result![0]).toEqual({
      path: 'b',
      type: 'added',
      oldValue: undefined,
      newValue: 2
    });
  });

  test('should report removed properties with correct type and values', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1 };
    
    const result = CompareValuesWithDetailedDifferences(obj1, obj2);
    expect(result).toHaveLength(1);
    expect(result![0]).toEqual({
      path: 'b',
      type: 'removed',
      oldValue: 2,
      newValue: undefined
    });
  });

  test('should report changed properties with correct type and values', () => {
    const obj1 = { a: 1, b: 'original' };
    const obj2 = { a: 1, b: 'changed' };
    
    const result = CompareValuesWithDetailedDifferences(obj1, obj2);
    expect(result).toHaveLength(1);
    expect(result![0]).toEqual({
      path: 'b',
      type: 'changed',
      oldValue: 'original',
      newValue: 'changed'
    });
  });

  test('should handle nested object differences', () => {
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

  test('should handle array differences', () => {
    const obj1 = { array: [1, 2, 3] };
    const obj2 = { array: [1, 5, 3] };
    
    const result = CompareValuesWithDetailedDifferences(obj1, obj2);
    expect(result).toHaveLength(1);
    expect(result![0]).toEqual({
      path: 'array[1]',
      type: 'changed',
      oldValue: 2,
      newValue: 5
    });
  });

  test('should handle arrays of different lengths', () => {
    const obj1 = { array: [1, 2, 3] };
    const obj2 = { array: [1, 2, 3, 4] };
    
    const result = CompareValuesWithDetailedDifferences(obj1, obj2);
    expect(result).toHaveLength(1);
    expect(result![0].path).toBe('array');
    expect(result![0].type).toBe('changed');
    // The entire arrays should be in old/new values
    expect(result![0].oldValue).toEqual([1, 2, 3]);
    expect(result![0].newValue).toEqual([1, 2, 3, 4]);
  });

  test('should handle date objects', () => {
    const date1 = new Date('2023-01-01');
    const date2 = new Date('2023-02-01');
    
    const obj1 = { date: date1 };
    const obj2 = { date: date2 };
    
    const result = CompareValuesWithDetailedDifferences(obj1, obj2);
    expect(result).toHaveLength(1);
    expect(result![0].path).toBe('date');
    expect(result![0].type).toBe('changed');
    expect(result![0].oldValue).toEqual(date1);
    expect(result![0].newValue).toEqual(date2);
  });

  test('should handle nested arrays containing objects', () => {
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
    // Now checks for individual property difference instead of whole object
    expect(result![0]).toEqual({
      path: 'users[1].name',
      type: 'changed',
      oldValue: 'Bob',
      newValue: 'Bobby'
    });
  });

  test('should handle complex objects with multiple types of differences', () => {
    const obj1 = {
      id: 1,
      name: 'Product',
      price: 99.99,
      tags: ['electronics', 'gadget'],
      details: {
        color: 'black',
        weight: '200g',
        dimensions: {
          width: 10,
          height: 5
        }
      },
      inStock: true,
      variants: [
        { id: 'v1', color: 'red' },
        { id: 'v2', color: 'blue' }
      ]
    };
    
    const obj2 = {
      id: 1,
      name: 'Updated Product',
      price: 89.99,
      tags: ['electronics', 'gadget', 'sale'],
      details: {
        color: 'black',
        dimensions: {
          width: 10,
          height: 5,
          depth: 2
        }
      },
      inStock: true,
      variants: [
        { id: 'v1', color: 'red' },
        { id: 'v3', color: 'green' }
      ],
      relatedProducts: [101, 102]
    };
    
    const result = CompareValuesWithDetailedDifferences(obj1, obj2);
    
    // Check if all expected differences are reported
    expect(result).toContainEqual({
      path: 'name',
      type: 'changed',
      oldValue: 'Product',
      newValue: 'Updated Product'
    });
    
    expect(result).toContainEqual({
      path: 'price',
      type: 'changed',
      oldValue: 99.99,
      newValue: 89.99
    });
    
    // The tags array has a new item
    expect(result).toContainEqual({
      path: 'tags',
      type: 'changed',
      oldValue: ['electronics', 'gadget'],
      newValue: ['electronics', 'gadget', 'sale']
    });
    
    // The details.weight property was removed
    expect(result).toContainEqual({
      path: 'details.weight',
      type: 'removed',
      oldValue: '200g',
      newValue: undefined
    });
    
    // The details.dimensions.depth property was added
    expect(result).toContainEqual({
      path: 'details.dimensions.depth',
      type: 'added',
      oldValue: undefined,
      newValue: 2
    });
    
    // The variants[1].id and variants[1].color were changed
    expect(result).toContainEqual({
      path: 'variants[1].id',
      type: 'changed',
      oldValue: 'v2',
      newValue: 'v3'
    });
    
    expect(result).toContainEqual({
      path: 'variants[1].color',
      type: 'changed',
      oldValue: 'blue',
      newValue: 'green'
    });
    
    // The relatedProducts property was added
    expect(result).toContainEqual({
      path: 'relatedProducts',
      type: 'added',
      oldValue: undefined,
      newValue: [101, 102]
    });
  });
}); 