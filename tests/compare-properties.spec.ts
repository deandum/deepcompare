import * as deepCompare from '../src/main';
import { ComparePropertiesResult } from '../src/types';

describe('Test CompareProperties method', () => {
  let firstObject: Record<string, any>;
  let secondObject: Record<string, any>;
  let result: ComparePropertiesResult | null;

  it('finds differences when fistObject > secondObject', () => {
    firstObject = {
      foo: 1,
      bar: 2
    };

    secondObject = {
      foo: 2,
    };

    result = deepCompare.CompareProperties(firstObject, secondObject);
    expect(result).not.toBe(null);
    expect(result.differences.length).toBe(1);
    expect(result.differences[0]).toBe('bar');
    expect(result.common.length).toBe(1);
    expect(result.common[0]).toBe('foo');
  });

  it('finds differences when fistObject < secondObject', () => {
    firstObject = {
      foo: 1
    };

    secondObject = {
      foo: 1,
      bar: 2
    };

    result = deepCompare.CompareProperties(firstObject, secondObject);
    expect(result).not.toBe(null);
    expect(result.differences.length).toBe(1);
    expect(result.differences[0]).toBe('bar');
    expect(result.common.length).toBe(1);
    expect(result.common[0]).toBe('foo');
  });

  it('finds differences when fistObject is completely secondObject', () => {
    firstObject = {
      foo: 1,
      bar: 2
    };

    secondObject = {
      a: 1,
      b: 2
    };

    result = deepCompare.CompareProperties(firstObject, secondObject);
    expect(result).not.toBe(null);
    expect(result.differences.length).toBe(4);
    expect(result.differences[0]).toBe('foo');
    expect(result.differences[1]).toBe('bar');
    expect(result.differences[2]).toBe('a');
    expect(result.differences[3]).toBe('b');
    expect(result.common.length).toBe(0);
  });

  it('does not find any differences', () => {
    firstObject = {
      foo: 1,
      bar: 2
    };

    secondObject = {
      foo: 1,
      bar: 2
    };

    result = deepCompare.CompareProperties(firstObject, secondObject);
    expect(result).not.toBe(null);
    expect(result.differences.length).toBe(0);
    expect(result.common.length).toBe(2);
    expect(result.common[0]).toBe('foo');
    expect(result.common[1]).toBe('bar');
  });
}); 