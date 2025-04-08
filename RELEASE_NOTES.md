# object-deep-compare v2.4.0 Release Notes

We're excited to announce the release of version 2.4.0 of object-deep-compare, which introduces schema validation to ensure objects match expected structures before comparison.

## What's New

### Schema Validation

The major new feature in this release is the ability to validate objects against schemas before comparison:

- **Schema Definition**:
  - Define expected types for each property using strings: 'string', 'number', 'boolean', etc.
  - Nest objects to validate complex structures
  - Validate arrays using 'array<type>' notation or array items using schemas
  - Use 'any' type to skip type checking for specific properties

- **Integration with Comparison Functions**:
  - All comparison functions now accept a `schemaValidation` option
  - Can be configured to throw errors or simply return validation results
  - Works with both simple and complex object structures

- **Standalone Validation**:
  - New `ValidateObjectsAgainstSchemas` function for validation without comparison
  - Returns detailed validation results including error messages
  - Useful for quick type checking of objects in TypeScript/JavaScript

This feature is particularly valuable for:
- Catching type errors early in the comparison process
- Ensuring objects meet expected formats
- Validating API responses before comparison
- Adding type safety to dynamic objects

## Usage Examples

### Basic Schema Validation

```ts
import { CompareValuesWithDetailedDifferences, SchemaValidation } from 'object-deep-compare';

// Define schema
const userSchema = {
  id: 'string',
  name: 'string',
  age: 'number',
  isActive: 'boolean',
  metadata: {
    createdAt: 'string',
    tags: 'array<string>'
  }
};

// Set up validation options
const schemaValidation: SchemaValidation = {
  firstObjectSchema: userSchema,
  secondObjectSchema: userSchema,
  throwOnValidationFailure: false // Continue comparison even if validation fails
};

// Compare with schema validation
const differences = CompareValuesWithDetailedDifferences(
  user1, 
  user2, 
  '', 
  { schemaValidation }
);
```

### Validation Only

```ts
import { ValidateObjectsAgainstSchemas, SchemaValidation } from 'object-deep-compare';

const schema = {
  id: 'string',
  items: 'array<object>'
};

const validationOptions: SchemaValidation = {
  firstObjectSchema: schema,
  throwOnValidationFailure: false
};

const result = ValidateObjectsAgainstSchemas(data, {}, validationOptions);
console.log(result.firstObjectValid); // true/false
console.log(result.firstObjectErrors); // Array of validation error messages
```

For more details, see the updated [README.md](README.md) and [CHANGELOG.md](CHANGELOG.md).

# object-deep-compare v2.0.0 Release Notes

We're excited to announce the release of version 2.0.0 of object-deep-compare, a complete rewrite in TypeScript with significant improvements.

## Major Changes

### TypeScript Migration
The entire library has been converted to TypeScript, providing full type safety and improved developer experience.

### Zero Dependencies
We've removed the lodash dependency and replaced all functionality with native JavaScript methods.

### New Features
- **Configuration Options**: New `strict` option to control comparison behavior
- **Special Value Handling**: Better handling of special values like `NaN`, `Date` objects, and `RegExp`
- **Performance Optimizations**: More efficient algorithms and data structures

### Bug Fixes
- Fixed duplicate entries in differences array
- Replaced inefficient JSON.stringify comparisons
- Fixed early returns in array comparison
- Improved path building for nested conflicts
- Fixed potential infinite recursion with circular references

## Upgrading from 1.x

For most users, the upgrade should be seamless as we've maintained the same API. However, there are some behavior changes to be aware of:

1. **TypeScript Support**: You can now use TypeScript interfaces and benefit from type checking
2. **No Lodash Dependency**: If you were relying on transitive lodash imports, you will need to install lodash separately
3. **Different Behavior for Edge Cases**: Comparison behavior for special values may be different in 2.0.0

## Example Usage

```ts
import { CompareValuesWithConflicts } from 'object-deep-compare';

// With new options
const conflicts = CompareValuesWithConflicts(
  { level1: { level2: { level3: { value: 42 } } } },
  { level1: { level2: { level3: { value: 43 } } } },
  '',
  { strict: true } // Control strict equality
);
```

For detailed changes, please refer to the [CHANGELOG.md](CHANGELOG.md) file.

# object-deep-compare v2.3.0 Release Notes

We're excited to announce the release of version 2.3.0 of object-deep-compare, which introduces property path filtering capabilities.

## What's New

### Property Path Filtering

The major new feature in this release is the ability to specify which properties to compare or ignore using path patterns:

- **Flexible Pattern Matching**:
  - Exact paths (e.g., 'user.name')
  - Wildcard patterns using * (e.g., 'user.*.created')
  - Leading dot patterns to match property names at any level (e.g., '.timestamp')

- **Two Filtering Modes**:
  - 'exclude' mode (default): Compare all properties except those matching the patterns
  - 'include' mode: Only compare properties matching the patterns

This feature is especially useful for:
- Ignoring auto-generated IDs or timestamps in objects
- Focusing comparison on specific fields
- Excluding fields that are expected to be different
- Simplifying comparison results by filtering out noise

## Usage Examples

### Exclude Timestamps from Comparison

```ts
import { CompareValuesWithConflicts, ComparisonOptions } from 'object-deep-compare';

const obj1 = {
  user: {
    name: "John",
    email: "john@example.com",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
    profile: {
      bio: "Hello!",
      lastSeen: "2023-01-03T00:00:00Z"
    }
  }
};

const obj2 = {
  user: {
    name: "John",
    email: "john@example.com",
    createdAt: "2023-02-01T00:00:00Z", // Different timestamp
    updatedAt: "2023-02-02T00:00:00Z", // Different timestamp
    profile: {
      bio: "Hello!",
      lastSeen: "2023-02-03T00:00:00Z" // Different timestamp
    }
  }
};

const options: ComparisonOptions = {
  pathFilter: {
    patterns: ['.createdAt', '.updatedAt', '.lastSeen'],
    mode: 'exclude' // This is the default mode
  }
};

const differences = CompareValuesWithConflicts(obj1, obj2, '', options);
console.log(differences); // [] - No differences when ignoring timestamp fields
```

### Only Compare Specific Fields

```ts
import { CompareValuesWithDetailedDifferences, ComparisonOptions } from 'object-deep-compare';

const options: ComparisonOptions = {
  pathFilter: {
    patterns: ['user.name', 'user.email'],
    mode: 'include'
  }
};

const differences = CompareValuesWithDetailedDifferences(obj1, obj2, '', options);
// Will only compare the name and email fields, ignoring all others
```

For more details, see the updated [README.md](README.md) and [CHANGELOG.md](CHANGELOG.md). 