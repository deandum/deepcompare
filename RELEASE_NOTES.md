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