# object-deep-compare

[![npm version](https://img.shields.io/badge/npm-v2.4.0-blue)](https://www.npmjs.com/package/object-deep-compare)
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
- **Schema validation**: Validate objects against expected schemas before comparison
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
const { 
  CompareProperties, 
  CompareArrays, 
  CompareValuesWithConflicts,
  CompareValuesWithDetailedDifferences,
  // Other functions as needed...
} = require('object-deep-compare');
```

### ES Modules
```ts
import { 
  CompareProperties, 
  CompareArrays, 
  CompareValuesWithConflicts,
  CompareValuesWithDetailedDifferences,
  TypeSafeCompareObjects,
  ObjectsAreEqual,
  IsSubset,
  // Schema validation
  ValidateObjectsAgainstSchemas,
  // Types
  ComparisonOptions,
  CircularReferenceHandling,
  PathFilter,
  PathFilterMode,
  SchemaValidation
  // Other functions and types as needed...
} from 'object-deep-compare';
```

All functions are named exports, so you can import only the specific functions you need.

## Schema Validation

The library offers optional schema validation to ensure objects match an expected structure before comparison. This helps catch structural issues early, ensuring that objects conform to expected schemas.

### Basic Schema Validation Example

```ts
import { 
  CompareValuesWithDetailedDifferences, 
  SchemaValidation 
} from 'object-deep-compare';

// Define a schema for user objects
const userSchema = {
  id: 'string',
  name: 'string',
  age: 'number',
  isActive: 'boolean',
  metadata: {
    createdAt: 'string',
    updatedAt: 'string'
  }
};

// Objects to compare
const user1 = {
  id: '1001',
  name: 'Alice',
  age: 32,
  isActive: true,
  metadata: {
    createdAt: '2023-01-01',
    updatedAt: '2023-05-15'
  }
};

const user2 = {
  id: '1002',
  name: 'Bob',
  age: 'twenty-eight', // Wrong type - should be a number
  isActive: true,
  metadata: {
    createdAt: '2023-02-10'
    // Missing updatedAt field
  }
};

// Set validation options
const schemaValidation: SchemaValidation = {
  firstObjectSchema: userSchema,
  secondObjectSchema: userSchema,
  throwOnValidationFailure: true // Will throw an error if validation fails
};

try {
  // Compare with schema validation
  const differences = CompareValuesWithDetailedDifferences(
    user1, 
    user2, 
    '', 
    { schemaValidation }
  );
  console.log('Differences:', differences);
} catch (error) {
  console.error('Schema validation failed:', error.message);
  console.log('Validation result:', error.validationResult);
  /*
  ValidationResult will contain:
  {
    firstObjectValid: true,
    secondObjectValid: false,
    secondObjectErrors: [
      'Property age should be of type number but got string',
      'Missing required property: metadata.updatedAt'
    ]
  }
  */
}
```

### Schema Format

The schema definition is a simple object structure where:

- String values represent expected types: `'string'`, `'number'`, `'boolean'`, `'object'`, `'array'`, etc.
- Use `'any'` to skip type checking for a property
- Use objects for nested structure validation
- Use arrays with a single object to define schemas for array items

#### Array Schema Example:

```ts
// Schema for an array of user objects
const usersSchema = [
  {
    id: 'string',
    name: 'string',
    age: 'number'
  }
];

// Or using array<type> notation
const tagsSchema = 'array<string>';
```

### Manual Schema Validation

You can validate objects against schemas without performing comparisons:

```ts
import { ValidateObjectsAgainstSchemas, SchemaValidation } from 'object-deep-compare';

const schema = {
  id: 'string',
  items: 'array<object>'
};

const data = {
  id: 123,  // Wrong type
  items: [{ name: 'Item 1' }]
};

const validationOptions: SchemaValidation = {
  firstObjectSchema: schema,
  throwOnValidationFailure: false  // Get validation results instead of throwing
};

const result = ValidateObjectsAgainstSchemas(data, {}, validationOptions);
console.log(result);
/*
{
  firstObjectValid: false,
  secondObjectValid: true,
  firstObjectErrors: ['Property id should be of type string but got number']
}
*/
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

const { CompareProperties } = require('object-deep-compare');
// Or using ES modules: import { CompareProperties } from 'object-deep-compare';

const result = CompareProperties(firstObject, secondObject);
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
  - `schemaValidation` - Schema validation options to validate array structures before comparison

#### Returns:
- `boolean`: true if arrays are equal, false otherwise

#### Example:
```ts
const firstArray = [1, 2];
const secondArray = [1, 2];

const { CompareArrays } = require('object-deep-compare');
// Or using ES modules: import { CompareArrays } from 'object-deep-compare';

const isEqual = CompareArrays(firstArray, secondArray);
console.log(isEqual); // true

// With options
const deepArray1 = [1, [2, [3, 4]]];
const deepArray2 = [1, [2, [3, 5]]];

const isEqualWithStrict = CompareArrays(
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
  - `schemaValidation` - Schema validation options to validate object structures before comparison

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

const { CompareValuesWithConflicts } = require('object-deep-compare');
// Or using ES modules: import { CompareValuesWithConflicts } from 'object-deep-compare';

const conflicts = CompareValuesWithConflicts(firstObject, secondObject);
console.log(conflicts);
/*
Will return: ['nested.foo', 'nested.bar']
*/

// With options
const deepObject1 = { level1: { level2: { level3: { value: 42 } } } };
const deepObject2 = { level1: { level2: { level3: { value: 43 } } } };

const conflictsWithStrict = CompareValuesWithConflicts(
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
  - `schemaValidation` - Schema validation options to validate object structures before comparison

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

const { CompareValuesWithDetailedDifferences } = require('object-deep-compare');
// Or using ES modules: import { CompareValuesWithDetailedDifferences } from 'object-deep-compare';

const detailedDiffs = CompareValuesWithDetailedDifferences(firstObject, secondObject);
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

### `ValidateObjectsAgainstSchemas`

Validates objects against schema definitions without performing comparisons.

#### Parameters:
- `firstObject` - First object to validate
- `secondObject` - Second object to validate
- `schemaValidation` - Schema validation options
  - `firstObjectSchema` - Schema for the first object
  - `secondObjectSchema` - Schema for the second object
  - `throwOnValidationFailure` - Whether to throw an error if validation fails (default: false)

#### Returns:
- `SchemaValidationResult`: Object with validation results
  - `firstObjectValid` - Boolean indicating if first object is valid
  - `secondObjectValid` - Boolean indicating if second object is valid
  - `firstObjectErrors` - Array of validation errors for first object (if any)
  - `secondObjectErrors` - Array of validation errors for second object (if any)

#### Example:
```ts
import { ValidateObjectsAgainstSchemas, SchemaValidation } from 'object-deep-compare';

const userSchema = {
  id: 'string',
  name: 'string',
  age: 'number',
  roles: 'array<string>'
};

const user = {
  id: '1234',
  name: 'John Doe',
  age: 'thirty', // Should be a number
  roles: ['admin', 'user']
};

const validationOptions: SchemaValidation = {
  firstObjectSchema: userSchema,
  throwOnValidationFailure: false
};

const result = ValidateObjectsAgainstSchemas(user, {}, validationOptions);
console.log(result);
/*
{
  firstObjectValid: false,
  secondObjectValid: true,
  firstObjectErrors: ['Property age should be of type number but got string']
}
*/
```

## Type-Safe Comparison Functions

The library now offers enhanced type safety with the following features:

- **TypeScript type guards** for better type inference
- **Support for comparing objects with different but compatible types**
- **Better type inference for comparison results**
- **Detailed type information in comparison results**

### `TypeSafeCompareArrays`

This method compares two arrays with type information.

#### Parameters:
- `firstArray` - First array to compare
- `secondArray` - Second array to compare
- `options` (optional) - Comparison options:
  - `strict` - Whether to use strict equality (===) for comparing values (default: true)
  - `circularReferences` - How to handle circular references: 'error' or 'ignore' (default: 'error')
  - `pathFilter` - Configuration to include or exclude properties based on path patterns
  - `schemaValidation` - Schema validation options to validate array structures before comparison

#### Returns:
- `TypedComparisonResult<T, U>`: Object with:
  - `isEqual`: Boolean indicating if arrays are equal
  - `firstType`: Type of the first array
  - `secondType`: Type of the second array

#### Example:
```ts
const stringArray = ['a', 'b', 'c'];
const numberArray = [1, 2, 3];
const mixedArray = ['a', 2, true];

const { TypeSafeCompareArrays } = require('object-deep-compare');
// Or using ES modules: import { TypeSafeCompareArrays } from 'object-deep-compare';

// Compare arrays of different types
const result = TypeSafeCompareArrays(stringArray, numberArray);
console.log(result);
/* Will return:
{
  isEqual: false,
  firstType: 'Array<string>',
  secondType: 'Array<number>'
}
*/

// With includeTypeInfo option
const detailedResult = TypeSafeCompareArrays(stringArray, mixedArray, {
  includeTypeInfo: true
});
console.log(detailedResult);
/* Will return:
{
  isEqual: false,
  firstType: 'Array<string>',
  secondType: 'Array<string|number|boolean>'
}
*/
```

### `TypeSafeCompareObjects`

This method compares two objects and supports objects with different but compatible types.

#### Parameters:
- `firstObject` - First object to compare
- `secondObject` - Second object to compare
- `options` (optional) - Type-safe comparison options:
  - `strict` - Whether to use strict equality (===) for comparing values (default: true)
  - `circularReferences` - How to handle circular references: 'error' or 'ignore' (default: 'error')
  - `pathFilter` - Configuration to include or exclude properties based on path patterns
  - `schemaValidation` - Schema validation options to validate object structures before comparison
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
// Different but compatible object types
interface User {
  id: string;
  name: string;
  age: number;
}

interface Employee {
  employeeId: string;
  fullName: string;
  age: number;
  department: string;
}

const user: User = {
  id: '1001',
  name: 'John Doe',
  age: 30
};

const employee: Employee = {
  employeeId: '1001',
  fullName: 'John Doe',
  age: 30,
  department: 'Engineering'
};

const { TypeSafeCompareObjects } = require('object-deep-compare');
// Or using ES modules: import { TypeSafeCompareObjects } from 'object-deep-compare';

// Using property mapping to compare objects with different structures
const result = TypeSafeCompareObjects(user, employee, {
  propertyMapping: {
    id: 'employeeId',
    name: 'fullName'
  },
  includeTypeInfo: true
});

console.log(result);
/* Will return:
{
  isEqual: true,
  firstType: 'User',
  secondType: 'Employee'
}
*/

// With custom comparator for specific properties
const customResult = TypeSafeCompareObjects(user, employee, {
  propertyMapping: {
    id: 'employeeId',
    name: 'fullName'
  },
  customComparators: {
    // Case-insensitive string comparison for name fields
    'name': (val1, val2) => val1.toLowerCase() === val2.toLowerCase()
  }
});

console.log(customResult.isEqual); // true
```

### `TypeSafeCompareValuesWithDetailedDifferences`

This method performs a deep comparison of two objects and returns detailed differences with type information.

#### Parameters:
- `firstObject` - First object to compare
- `secondObject` - Second object to compare
- `options` (optional) - Type-safe comparison options:
  - `strict` - Whether to use strict equality (===) for comparing values (default: true)
  - `circularReferences` - How to handle circular references: 'error' or 'ignore' (default: 'error')
  - `pathFilter` - Configuration to include or exclude properties based on path patterns
  - `schemaValidation` - Schema validation options to validate object structures before comparison
  - `propertyMapping`: Maps properties from the first object to equivalent properties in the second
  - `includeTypeInfo`: Whether to include type information in the results (default: false)
  - `customComparators`: Custom comparator functions for specific property paths

#### Returns:
- `TypedDetailedDifference[]`: Array of detailed differences with type information:
  - All properties from `DetailedDifference`
  - `oldValueType`: Type of the old value
  - `newValueType`: Type of the new value

#### Example:
```ts
interface Product {
  id: string;
  name: string;
  price: number;
  stock?: number;
}

const oldProduct: Product = {
  id: 'prod-001',
  name: 'Original Product',
  price: 29.99
};

const newProduct: Product = {
  id: 'prod-001',
  name: 'Updated Product',
  price: 39.99,
  stock: 100
};

const { TypeSafeCompareValuesWithDetailedDifferences } = require('object-deep-compare');
// Or using ES modules: import { TypeSafeCompareValuesWithDetailedDifferences } from 'object-deep-compare';

const differences = TypeSafeCompareValuesWithDetailedDifferences(oldProduct, newProduct, {
  includeTypeInfo: true
});

console.log(differences);
/* Will return:
[
  {
    path: 'name',
    type: 'changed',
    oldValue: 'Original Product',
    newValue: 'Updated Product',
    oldValueType: 'string',
    newValueType: 'string'
  },
  {
    path: 'price',
    type: 'changed',
    oldValue: 29.99,
    newValue: 39.99,
    oldValueType: 'number',
    newValueType: 'number'
  },
  {
    path: 'stock',
    type: 'added',
    oldValue: undefined,
    newValue: 100,
    oldValueType: 'undefined',
    newValueType: 'number'
  }
]
*/
```

### `ObjectsAreEqual`

Type guard function that checks if two objects are equal and narrows types in conditional branches.

#### Parameters:
- `firstObject` - First object to compare
- `secondObject` - Second object to compare
- `options` (optional) - Comparison options:
  - `strict` - Whether to use strict equality (===) for comparing values (default: true)
  - `circularReferences` - How to handle circular references: 'error' or 'ignore' (default: 'error')
  - `pathFilter` - Configuration to include or exclude properties based on path patterns
  - `schemaValidation` - Schema validation options to validate object structures before comparison

#### Returns:
- Type predicate indicating if the objects are equal (narrows type to intersection)

#### Example:
```ts
interface Shape {
  type: string;
  color: string;
}

interface Circle extends Shape {
  type: 'circle';
  radius: number;
}

interface Square extends Shape {
  type: 'square';
  sideLength: number;
}

function processShape(shape1: Shape, shape2: Shape) {
  const { ObjectsAreEqual } = require('object-deep-compare');
  // Or using ES modules: import { ObjectsAreEqual } from 'object-deep-compare';

  // ObjectsAreEqual acts as a type guard
  if (ObjectsAreEqual(shape1, shape2)) {
    // TypeScript now knows both shapes are equal
    console.log('Shapes are equal:', shape1.type);
    return true;
  } else {
    console.log('Shapes are different');
    // TypeScript maintains the original types
    return false;
  }
}

const circle: Circle = { type: 'circle', color: 'red', radius: 10 };
const sameCircle: Circle = { type: 'circle', color: 'red', radius: 10 };
const differentCircle: Circle = { type: 'circle', color: 'blue', radius: 5 };

processShape(circle, sameCircle); // "Shapes are equal: circle"
processShape(circle, differentCircle); // "Shapes are different"
```

### `IsSubset`

Checks if the second object is a subset of the first object.

#### Parameters:
- `firstObject` - Object to check against
- `secondObject` - Object that should be a subset
- `options` (optional) - Comparison options:
  - `strict` - Whether to use strict equality (===) for comparing values (default: true)
  - `circularReferences` - How to handle circular references: 'error' or 'ignore' (default: 'error')
  - `pathFilter` - Configuration to include or exclude properties based on path patterns
  - `schemaValidation` - Schema validation options to validate object structures before comparison

#### Returns:
- `boolean`: True if second object is a subset of first object

#### Example:
```ts
const completeUser = {
  id: '1001',
  name: 'Jane Smith',
  age: 28,
  email: 'jane@example.com',
  settings: {
    theme: 'dark',
    notifications: true,
    privacyLevel: 'high'
  }
};

const partialUser = {
  id: '1001',
  name: 'Jane Smith'
};

const partialSettings = {
  settings: {
    theme: 'dark'
  }
};

const { IsSubset } = require('object-deep-compare');
// Or using ES modules: import { IsSubset } from 'object-deep-compare';

console.log(IsSubset(completeUser, partialUser)); // true
console.log(IsSubset(completeUser, partialSettings)); // true

// Non-matching subset
const nonMatchingUser = {
  id: '1001',
  name: 'Different Name'
};
console.log(IsSubset(completeUser, nonMatchingUser)); // false

// Extra properties
const extraPropsUser = {
  id: '1001',
  name: 'Jane Smith',
  role: 'admin' // This property doesn't exist in completeUser
};
console.log(IsSubset(completeUser, extraPropsUser)); // false
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
const user1 = {
  id: 'user1',
  name: 'Alice',
  age: 30,
  email: 'alice@example.com',
  settings: {
    theme: 'light',
    notifications: true
  }
};

const user2 = {
  id: 'user2',
  name: 'Bob',
  age: 25,
  role: 'admin',
  settings: {
    theme: 'dark',
    privacyLevel: 'high'
  }
};

const { GetCommonStructure } = require('object-deep-compare');
// Or using ES modules: import { GetCommonStructure } from 'object-deep-compare';

const common = GetCommonStructure(user1, user2);
console.log(common);
/* Will return:
{
  id: 'user1',  // Values from first object are used
  name: 'Alice',
  age: 30,
  settings: {
    theme: 'light'
  }
}
*/

// The result contains only properties present in both objects,
// with nested objects showing their common structure
```

## Advanced Usage

### Handling Special Values

The library correctly handles special values like `NaN`, `null`, and `undefined`:

```ts
const obj1 = { value: NaN };
const obj2 = { value: NaN };

const { CompareArrays } = require('object-deep-compare');
// Or using ES modules: import { CompareArrays } from 'object-deep-compare';

// NaN === NaN is false in JavaScript, but our library correctly identifies them as equal
const isEqual = CompareArrays(obj1, obj2);
console.log(isEqual); // true
```

### Comparing Date Objects

Date objects are compared based on their time values:

```ts
const date1 = new Date('2023-01-01');
const date2 = new Date('2023-01-01');
const date3 = new Date('2023-01-02');

const { CompareArrays } = require('object-deep-compare');
// Or using ES modules: import { CompareArrays } from 'object-deep-compare';

const isEqual = CompareArrays(date1, date2);
console.log(isEqual); // true

const isNotEqual = CompareArrays(date1, date3);
console.log(isNotEqual); // false
```

### Comparing RegExp Objects

RegExp objects are compared based on their source and flags:

```ts
const regex1 = /test/g;
const regex2 = /test/g;
const regex3 = /test/i;

const { CompareArrays } = require('object-deep-compare');
// Or using ES modules: import { CompareArrays } from 'object-deep-compare';

const isEqual = CompareArrays(regex1, regex2);
console.log(isEqual); // true

const isNotEqual = CompareArrays(regex1, regex3);
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

const { CompareValuesWithDetailedDifferences } = require('object-deep-compare');
// Or using ES modules: import { CompareValuesWithDetailedDifferences } from 'object-deep-compare';

// By default, circular references will throw an error
try {
  const diffs = CompareValuesWithDetailedDifferences(obj1, obj2);
} catch (error) {
  console.log(error.message); // "Circular reference detected at path: self"
}

// Use the circularReferences option to handle circular references gracefully
const options = { circularReferences: 'ignore' };
const diffs = CompareValuesWithDetailedDifferences(obj1, obj2, '', options);
console.log(diffs); // [] (empty array, objects are equal)

// Objects with the same structure but different values will still show differences
const obj3 = { a: 1, b: 3 }; // Different value for b
obj3.self = obj3;

const diffResults = CompareValuesWithDetailedDifferences(obj1, obj3, '', options);
console.log(diffResults[0].path); // "b"
```

## Memoized Functions

The library provides memoized versions of all comparison functions for improved performance when comparing the same objects multiple times. Memoization caches the results of function calls based on their arguments, avoiding redundant computations.

### `MemoizedCompareProperties`
Memoized version of `CompareProperties` that caches results based on object references.

```ts
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, c: 3 };

const { MemoizedCompareProperties } = require('object-deep-compare');
// Or using ES modules: import { MemoizedCompareProperties } from 'object-deep-compare';

// First call computes the result
const result1 = MemoizedCompareProperties(obj1, obj2);
// Second call with same objects returns cached result
const result2 = MemoizedCompareProperties(obj1, obj2);
```

### `MemoizedCompareArrays`
Memoized version of `CompareArrays` that caches results based on array references and options.

```ts
const arr1 = [1, 2, 3];
const arr2 = [1, 2, 3];
const options = { strict: true };

const { MemoizedCompareArrays } = require('object-deep-compare');
// Or using ES modules: import { MemoizedCompareArrays } from 'object-deep-compare';

// First call computes the result
const result1 = MemoizedCompareArrays(arr1, arr2, options);
// Second call with same arrays and options returns cached result
const result2 = MemoizedCompareArrays(arr1, arr2, options);
```

### `MemoizedCompareValuesWithConflicts`
Memoized version of `CompareValuesWithConflicts` that caches results based on object references, path, and options.

```ts
const obj1 = { nested: { value: 1 } };
const obj2 = { nested: { value: 2 } };
const path = '';
const options = { strict: true };

const { MemoizedCompareValuesWithConflicts } = require('object-deep-compare');
// Or using ES modules: import { MemoizedCompareValuesWithConflicts } from 'object-deep-compare';

// First call computes the result
const result1 = MemoizedCompareValuesWithConflicts(obj1, obj2, path, options);
// Second call with same parameters returns cached result
const result2 = MemoizedCompareValuesWithConflicts(obj1, obj2, path, options);
```

### `MemoizedCompareValuesWithDetailedDifferences`
Memoized version of `CompareValuesWithDetailedDifferences` that caches results for better performance.

```ts
const obj1 = { user: { name: 'John', age: 30 } };
const obj2 = { user: { name: 'John', age: 31 } };

const { MemoizedCompareValuesWithDetailedDifferences } = require('object-deep-compare');
// Or using ES modules: import { MemoizedCompareValuesWithDetailedDifferences } from 'object-deep-compare';

// First call computes the result
const result1 = MemoizedCompareValuesWithDetailedDifferences(obj1, obj2);
// Second call with same objects returns cached result
const result2 = MemoizedCompareValuesWithDetailedDifferences(obj1, obj2);
```

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

const { CompareValuesWithConflicts } = require('object-deep-compare');
// Or using ES modules: import { CompareValuesWithConflicts } from 'object-deep-compare';

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

const { CompareValuesWithDetailedDifferences } = require('object-deep-compare');
// Or using ES modules: import { CompareValuesWithDetailedDifferences } from 'object-deep-compare';

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

const { CompareArrays } = require('object-deep-compare');
// Or using ES modules: import { CompareArrays } from 'object-deep-compare';

const isEqual = CompareArrays(array1, array2, options);
```

### `Memoize` Utility
A generic memoization utility function that can be used to memoize any function.

#### Parameters:
- `fn` - The function to memoize
- `keyFn` (optional) - A custom function to generate cache keys for the arguments

#### Returns:
- A memoized version of the function that caches results based on input arguments

#### Example:
```ts
const { Memoize } = require('object-deep-compare');
// Or using ES modules: import { Memoize } from 'object-deep-compare';

// Create a computationally expensive function
const calculateFactorial = (n: number): number => {
  if (n <= 1) return 1;
  return n * calculateFactorial(n - 1);
};

// Create a memoized version of the function
const memoizedFactorial = Memoize(calculateFactorial);

console.time('first-call');
const result1 = memoizedFactorial(20); // This will compute the result
console.timeEnd('first-call'); // e.g., "first-call: 5.123ms"

console.time('second-call');
const result2 = memoizedFactorial(20); // This will return the cached result
console.timeEnd('second-call'); // e.g., "second-call: 0.052ms" (much faster)

// You can also provide a custom key generation function
const customKeyMemoize = Memoize(
  (a: object, b: object) => Object.assign({}, a, b),
  (a, b) => JSON.stringify([Object.keys(a).sort(), Object.keys(b).sort()])
);
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

const { CompareValuesWithConflicts } = require('object-deep-compare');
// Or using ES modules: import { CompareValuesWithConflicts } from 'object-deep-compare';

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

const { CompareValuesWithDetailedDifferences } = require('object-deep-compare');
// Or using ES modules: import { CompareValuesWithDetailedDifferences } from 'object-deep-compare';

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

const { CompareArrays } = require('object-deep-compare');
// Or using ES modules: import { CompareArrays } from 'object-deep-compare';

const isEqual = CompareArrays(array1, array2, options);
```
