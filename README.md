# object-deep-compare

[![npm version](https://img.shields.io/badge/npm-v2.0.0-blue)](https://www.npmjs.com/package/object-deep-compare)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/Zero-Dependencies-green.svg)](https://www.npmjs.com/package/object-deep-compare)

A type-safe collection of comparison methods for objects and arrays in TypeScript/JavaScript. This library provides powerful tools for deep comparison of complex data structures with configurable options.

## Features

- **Type-safe**: Written in TypeScript with full type definitions
- **Zero dependencies**: No external dependencies required
- **Configurable comparison depth**: Control how deep the comparison goes with the `maxDepth` option
- **Flexible equality**: Choose between strict and loose equality with the `strict` option
- **Special value support**: Correctly handles comparison of special values like `NaN`, `null`, and `undefined`
- **Date object support**: Properly compares Date objects based on their time values
- **RegExp support**: Correctly compares RegExp objects
- **Performance optimized**: Efficient algorithms to minimize processing time
- **Configurable**: Control comparison behavior through options

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
import { CompareProperties, CompareArrays, CompareValuesWithConflicts } from 'object-deep-compare';
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
  - `maxDepth` - Maximum depth to traverse when comparing nested arrays/objects (default: Infinity)
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

const isEqualWithDepth = objectDeepCompare.CompareArrays(
	deepArray1,
	deepArray2,
	{ maxDepth: 2 }
);
console.log(isEqualWithDepth); // true (because it only compares up to depth 2)
```

### `CompareValuesWithConflicts`
This method performs a deep comparison of two objects and returns an array of paths to properties that differ.

#### Parameters:
- `firstObject` - First object to compare
- `secondObject` - Second object to compare
- `pathOfConflict` (optional) - Starting path for conflict (default: '')
- `options` (optional) - Comparison options
  - `maxDepth` - Maximum depth to traverse when comparing nested objects (default: Infinity)
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

const conflictsWithDepth = objectDeepCompare.CompareValuesWithConflicts(
	deepObject1,
	deepObject2,
	'',
	{ maxDepth: 2 }
);
console.log(conflictsWithDepth); // [] (because it only compares up to depth 2)
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

## Dependencies
No runtime dependencies!

## Dev Dependencies
- `typescript`
- `jest`
- `ts-jest`
- `@types/jest`

## License
MIT © Dean Dumitru
