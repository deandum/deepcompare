# object-deep-compare

[![npm version](https://img.shields.io/badge/npm-v2.2.0-blue)](https://www.npmjs.com/package/object-deep-compare)
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
- **Circular reference detection**: Can detect and handle circular references in objects and arrays
- **Path filtering**: Ability to include or exclude specific properties from comparison using wildcard patterns
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
  CompareValuesWithDetailedDifferences,
  ComparisonOptions,
  CircularReferenceHandling,
  PathFilter,
  PathFilterMode
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
  - `circularReferences` - How to handle circular references: 'error' or 'ignore' (default: 'error')
  - `pathFilter` - Configuration to include or exclude properties based on path patterns

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
  - `circularReferences` - How to handle circular references: 'error' or 'ignore' (default: 'error')
  - `pathFilter` - Configuration to include or exclude properties based on path patterns

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
  - `circularReferences` - How to handle circular references: 'error' or 'ignore' (default: 'error')
  - `pathFilter` - Configuration to include or exclude properties based on path patterns

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

## Type-Safe Comparison Functions

The library now offers enhanced type safety with the following features:

- **TypeScript type guards** for better type inference
- **Support for comparing objects with different but compatible types**
- **Better type inference for comparison results**
- **Detailed type information in comparison results**

### `TypeSafeCompareArrays`

This method compares two arrays and includes type information in the result.

#### Parameters:
- `firstArray` - First array to compare
- `secondArray` - Second array to compare
- `options` (optional) - Comparison options (same as `CompareArrays`)

#### Returns:
- `TypedComparisonResult<T, U>`: Object with:
  - `isEqual`: Boolean indicating if arrays are equal
  - `firstType`: Type of the first array
  - `secondType`: Type of the second array

#### Example:
```ts
const numbers = [1, 2, 3];
const strings = ['1', '2', '3'];

const result = TypeSafeCompareArrays(numbers, strings);
console.log(result.isEqual); // false
console.log(result.firstType); // 'array'
console.log(result.secondType); // 'array'

// With non-strict comparison (type coercion)
const result2 = TypeSafeCompareArrays(numbers, strings, { strict: false });
console.log(result2.isEqual); // true
```

### `TypeSafeCompareObjects`

This method compares two objects and supports objects with different but compatible types.

#### Parameters:
- `firstObject` - First object to compare
- `secondObject` - Second object to compare
- `options` (optional) - Type-safe comparison options:
  - All options from `ComparisonOptions`
  - `propertyMapping`: Maps properties from the first object to equivalent properties in the second
  - `includeTypeInfo`: Whether to include type information in the results (default: false)
  - `customComparators`: Custom comparator functions for specific property paths

#### Returns:
- `TypedComparisonResult<T, U>`: Object with:
  - `isEqual`: Boolean indicating if objects are equal
  - `firstType`: Type of the first object
  - `secondType`: Type of the second object

#### Example:
```ts
interface User {
  id: number;
  name: string;
  email: string;
}

interface Customer {
  userId: number;
  username: string;
  userEmail: string;
}

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
};

const customer: Customer = {
  userId: 1,
  username: 'John Doe',
  userEmail: 'john@example.com'
};

// Define property mapping
const result = TypeSafeCompareObjects(user, customer, {
  propertyMapping: {
    id: 'userId',
    name: 'username',
    email: 'userEmail'
  }
});

console.log(result.isEqual); // true
```

### `TypeSafeCompareValuesWithDetailedDifferences`

This method performs a deep comparison of two objects and returns detailed differences with type information.

#### Parameters:
- `firstObject` - First object to compare
- `secondObject` - Second object to compare
- `options` (optional) - Type-safe comparison options (same as `TypeSafeCompareObjects`)

#### Returns:
- `TypedDetailedDifference[]`: Array of detailed differences with type information:
  - All properties from `DetailedDifference`
  - `oldValueType`: Type of the old value
  - `newValueType`: Type of the new value

#### Example:
```ts
const user = {
  id: 1,
  name: 'John Doe',
  role: 'admin'
};

const customer = {
  id: 1,
  name: 'John Doe',
  subscription: {
    plan: 'premium',
    active: true
  }
};

const differences = TypeSafeCompareValuesWithDetailedDifferences(user, customer, {
  includeTypeInfo: true
});

/* Result:
[
  {
    path: 'role',
    type: 'removed',
    oldValue: 'admin',
    oldValueType: 'string'
  },
  {
    path: 'subscription',
    type: 'added',
    newValue: { plan: 'premium', active: true },
    newValueType: 'object'
  }
]
*/
```

### `ObjectsAreEqual`

Type guard function that checks if two objects are equal and narrows types in conditional branches.

#### Parameters:
- `firstObject` - First object to compare
- `secondObject` - Second object to compare
- `options` (optional) - Comparison options (same as `ComparisonOptions`)

#### Returns:
- Type predicate indicating if the objects are equal (narrows type to intersection)

#### Example:
```ts
interface User { id: number; name: string; role: string; }
interface Customer { id: number; name: string; subscription: { plan: string; } }

// Object that could be either type
const someObject: User | Customer = getObject();

if (ObjectsAreEqual(someObject, { id: 1, name: 'John', role: 'admin', subscription: { plan: 'premium' } })) {
  // TypeScript now knows someObject has both User & Customer properties
  console.log(someObject.role); // OK - TypeScript knows this exists
  console.log(someObject.subscription.plan); // OK - TypeScript knows this exists
}
```

### `IsSubset`

Checks if the second object is a subset of the first object.

#### Parameters:
- `firstObject` - Object to check against
- `secondObject` - Object that should be a subset
- `options` (optional) - Comparison options (same as `ComparisonOptions`)

#### Returns:
- `boolean`: True if second object is a subset of first object

#### Example:
```ts
const user = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
};

const userSubset = {
  id: 1,
  name: 'John Doe'
};

console.log(IsSubset(user, userSubset)); // true
console.log(IsSubset(userSubset, user)); // false
```

### `GetCommonStructure`

Gets the common structure between two objects.

#### Parameters:
- `firstObject` - First object to compare
- `secondObject` - Second object to compare

#### Returns:
- `Partial<CompatibleObject<T, U>>`: A new object containing only common properties

#### Example:
```ts
const user = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
};

const customer = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  subscription: {
    plan: 'premium'
  }
};

const common = GetCommonStructure(user, customer);
/*
Result:
{
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
}
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

### Handling Circular References

The library can detect and handle circular references in objects and arrays:

```ts
// Create objects with circular references
const obj1 = { a: 1, b: 2 };
obj1.self = obj1; // Self-reference

const obj2 = { a: 1, b: 2 };
obj2.self = obj2; // Self-reference

// By default, circular references will throw an error
try {
  const diffs = objectDeepCompare.CompareValuesWithDetailedDifferences(obj1, obj2);
} catch (error) {
  console.log(error.message); // "Circular reference detected at path: self"
}

// Use the circularReferences option to handle circular references gracefully
const options = { circularReferences: 'ignore' };
const diffs = objectDeepCompare.CompareValuesWithDetailedDifferences(obj1, obj2, '', options);
console.log(diffs); // [] (empty array, objects are equal)

// Objects with the same structure but different values will still show differences
const obj3 = { a: 1, b: 3 }; // Different value for b
obj3.self = obj3;

const diffResults = objectDeepCompare.CompareValuesWithDetailedDifferences(obj1, obj3, '', options);
console.log(diffResults[0].path); // "b"
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

## Configuration Options

### Path Filtering

You can include or exclude specific properties from comparison using the `pathFilter` option.

#### PathFilter interface:
```ts
interface PathFilter {
  patterns: string[];  // Array of path patterns to match
  mode?: 'include' | 'exclude';  // Whether to include or exclude matched paths (default: 'exclude')
}
```

#### Path pattern types:
- **Exact paths**: Match a specific property path (e.g., `'user.name'`)
- **Leading dot paths**: Match any property with the specified name at any level (e.g., `'.timestamp'` matches `'timestamp'`, `'user.timestamp'`, `'logs.entry.timestamp'`, etc.)
- **Wildcard paths**: Use `*` to match any property name in a path (e.g., `'user.*.created'` matches `'user.profile.created'`, `'user.settings.created'`, etc.)

#### Examples:

Ignore all timestamp properties:
```ts
const options = {
  pathFilter: {
    patterns: ['.timestamp', '.createdAt', '.updatedAt'],
    mode: 'exclude'  // This is the default mode
  }
};

const differences = CompareValuesWithConflicts(obj1, obj2, '', options);
```

Only compare specific fields:
```ts
const options = {
  pathFilter: {
    patterns: ['user.name', 'user.email', 'settings.*'],
    mode: 'include'
  }
};

const differences = CompareValuesWithDetailedDifferences(obj1, obj2, '', options);
```

Compare everything except auto-generated IDs:
```ts
const options = {
  pathFilter: {
    patterns: ['.id', '.uuid', '*.id'],
    mode: 'exclude'
  }
};

const isEqual = CompareArrays(array1, array2, options);
```
