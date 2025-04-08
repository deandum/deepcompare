# object-deep-compare

[![npm version](https://img.shields.io/badge/npm-v2.1.0-blue)](https://www.npmjs.com/package/object-deep-compare)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/Zero-Dependencies-green.svg)](https://www.npmjs.com/package/object-deep-compare)

A type-safe collection of comparison methods for objects and arrays in TypeScript/JavaScript. This library provides powerful tools for deep comparison of complex data structures with configurable options.

## Features

- **Type-safe**: Written in TypeScript with full type definitions
- **Zero dependencies**: No external dependencies required
- **Flexible equality**: Choose between strict and loose equality with the `strict` option
- **Special value support**: Correctly handles comparison of special values like `NaN`, `null`, and `undefined`
- **Date object support**: Properly compares Date objects based on their time values
- **RegExp support**: Correctly compares RegExp objects
- **Performance optimized**: Efficient algorithms to minimize processing time
- **Configurable**: Control comparison behavior through options
- **Detailed difference reporting**: Get detailed information about each difference including type and actual values

## Installation

Using npm:
```bash
npm install object-deep-compare
```

Using yarn:
```bash
yarn add object-deep-compare
```

## Usage

### CommonJS
```js
const objectDeepCompare = require('object-deep-compare');
```

### ES Modules
```ts
import { 
  CompareProperties, 
  CompareArrays, 
  CompareValuesWithConflicts,
  CompareValuesWithDetailedDifferences 
} from 'object-deep-compare';
```

## API Reference

### `CompareProperties`
This method compares the properties of two objects. It returns all the different and common properties between the two objects.

#### Parameters:
- `firstObject` - First object to compare
- `secondObject` - Second object to compare

#### Returns:
- An object with two arrays:
  - `differences`: Properties that exist in the first object but not in the second
  - `common`: Properties that exist in both objects

#### Example:
```ts
const firstObject = {
	foo: 1,
	bar: 2
};
const secondObject = {
	foo: 2,
};

const result = objectDeepCompare.CompareProperties(firstObject, secondObject);
console.log(result);
/*
Will return: 
{
	differences: ['bar'],
	common: ['foo']
}
*/
```

### `CompareArrays`
This method compares two arrays for equality. It returns true or false.

#### Parameters:
- `firstArray` - First array to compare
- `secondArray` - Second array to compare
- `options` (optional) - Comparison options
  - `strict` - Whether to use strict equality (===) for comparing values (default: true)

#### Returns:
- `boolean`: true if arrays are equal, false otherwise

#### Example:
```ts
const firstArray = [1, 2];
const secondArray = [1, 2];

const isEqual = objectDeepCompare.CompareArrays(firstArray, secondArray);
console.log(isEqual); // true

// With options
const deepArray1 = [1, [2, [3, 4]]];
const deepArray2 = [1, [2, [3, 5]]];

const isEqualWithStrict = objectDeepCompare.CompareArrays(
	deepArray1,
	deepArray2,
	{ strict: true }
);
console.log(isEqualWithStrict); // false
```

### `CompareValuesWithConflicts`
This method performs a deep comparison of two objects and returns an array of paths to properties that differ.

#### Parameters:
- `firstObject` - First object to compare
- `secondObject` - Second object to compare
- `pathOfConflict` (optional) - Starting path for conflict (default: '')
- `options` (optional) - Comparison options
  - `strict` - Whether to use strict equality (===) for comparing values (default: true)

#### Returns:
- `string[]`: Array of paths to properties that differ between the objects

#### Example:
```ts
const firstObject = {
	nested: {
		foo: 1,
		bar: 2
	}
};
const secondObject = {
	nested: {
		foo: 2,
		bar: 4
	}
};

const conflicts = objectDeepCompare.CompareValuesWithConflicts(firstObject, secondObject);
console.log(conflicts);
/*
Will return: ['nested.foo', 'nested.bar']
*/

// With options
const deepObject1 = { level1: { level2: { level3: { value: 42 } } } };
const deepObject2 = { level1: { level2: { level3: { value: 43 } } } };

const conflictsWithStrict = objectDeepCompare.CompareValuesWithConflicts(
	deepObject1,
	deepObject2,
	'',
	{ strict: true }
);
console.log(conflictsWithStrict); // ['level1.level2.level3.value']
```

### `CompareValuesWithDetailedDifferences`
This method performs a deep comparison of two objects and returns detailed information about each difference, including the type of difference and the actual values.

#### Parameters:
- `firstObject` - First object to compare
- `secondObject` - Second object to compare
- `pathOfConflict` (optional) - Starting path for conflict (default: '')
- `options` (optional) - Comparison options
  - `strict` - Whether to use strict equality (===) for comparing values (default: true)

#### Returns:
- `DetailedDifference[]`: Array of detailed difference objects, where each object includes:
  - `path`: Path to the property that differs
  - `type`: Type of difference ('added', 'removed', or 'changed')
  - `oldValue`: Original value (undefined for added properties)
  - `newValue`: New value (undefined for removed properties)

#### Example:
```ts
const firstObject = {
  user: {
    name: 'John',
    age: 30,
    roles: ['admin']
  }
};
const secondObject = {
  user: {
    name: 'John',
    age: 31,
    location: 'New York',
    roles: ['admin', 'editor']
  }
};

const detailedDiffs = objectDeepCompare.CompareValuesWithDetailedDifferences(firstObject, secondObject);
console.log(detailedDiffs);
/*
Will return: [
  {
    path: 'user.age',
    type: 'changed',
    oldValue: 30,
    newValue: 31
  },
  {
    path: 'user.location',
    type: 'added',
    oldValue: undefined,
    newValue: 'New York'
  },
  {
    path: 'user.roles',
    type: 'changed',
    oldValue: ['admin'],
    newValue: ['admin', 'editor']
  }
]
*/
```

## Advanced Usage

### Handling Special Values

The library correctly handles special values like `NaN`, `null`, and `undefined`:

```ts
const obj1 = { value: NaN };
const obj2 = { value: NaN };

// NaN === NaN is false in JavaScript, but our library correctly identifies them as equal
const isEqual = objectDeepCompare.CompareArrays(obj1, obj2);
console.log(isEqual); // true
```

### Comparing Date Objects

Date objects are compared based on their time values:

```ts
const date1 = new Date('2023-01-01');
const date2 = new Date('2023-01-01');
const date3 = new Date('2023-01-02');

const isEqual = objectDeepCompare.CompareArrays(date1, date2);
console.log(isEqual); // true

const isNotEqual = objectDeepCompare.CompareArrays(date1, date3);
console.log(isNotEqual); // false
```

### Comparing RegExp Objects

RegExp objects are compared based on their source and flags:

```ts
const regex1 = /test/g;
const regex2 = /test/g;
const regex3 = /test/i;

const isEqual = objectDeepCompare.CompareArrays(regex1, regex2);
console.log(isEqual); // true

const isNotEqual = objectDeepCompare.CompareArrays(regex1, regex3);
console.log(isNotEqual); // false
```

## Memoized Functions

The library provides memoized versions of all comparison functions for improved performance when comparing the same objects multiple times. Memoization caches the results of function calls based on their arguments, avoiding redundant computations.

### `MemoizedCompareProperties`
Memoized version of `CompareProperties` that caches results based on object references.

```ts
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, c: 3 };

// First call computes the result
const result1 = objectDeepCompare.MemoizedCompareProperties(obj1, obj2);
// Second call with same objects returns cached result
const result2 = objectDeepCompare.MemoizedCompareProperties(obj1, obj2);
```

### `MemoizedCompareArrays`
Memoized version of `CompareArrays` that caches results based on array references and options.

```ts
const arr1 = [1, 2, 3];
const arr2 = [1, 2, 3];
const options = { strict: true };

// First call computes the result
const result1 = objectDeepCompare.MemoizedCompareArrays(arr1, arr2, options);
// Second call with same arrays and options returns cached result
const result2 = objectDeepCompare.MemoizedCompareArrays(arr1, arr2, options);
```

### `MemoizedCompareValuesWithConflicts`
Memoized version of `CompareValuesWithConflicts` that caches results based on object references, path, and options.

```ts
const obj1 = { nested: { value: 1 } };
const obj2 = { nested: { value: 2 } };
const path = '';
const options = { strict: true };

// First call computes the result
const result1 = objectDeepCompare.MemoizedCompareValuesWithConflicts(obj1, obj2, path, options);
// Second call with same parameters returns cached result
const result2 = objectDeepCompare.MemoizedCompareValuesWithConflicts(obj1, obj2, path, options);
```

### `memoize` Utility
A generic memoization utility function that can be used to memoize any function.

```ts
const myFunction = (a: number, b: number) => a + b;
const memoizedFn = objectDeepCompare.memoize(myFunction);

// First call computes the result
const result1 = memoizedFn(1, 2);
// Second call with same arguments returns cached result
const result2 = memoizedFn(1, 2);
```

## Dependencies
No runtime dependencies!

## Dev Dependencies
- `typescript`
- `jest`
- `ts-jest`
- `@types/jest`

## License
MIT © Dean Dumitru
