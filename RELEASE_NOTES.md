# object-deep-compare v2.0.0 Release Notes

We're excited to announce the release of version 2.0.0 of object-deep-compare, a complete rewrite in TypeScript with significant improvements.

## Major Changes

### TypeScript Migration
The entire library has been converted to TypeScript, providing full type safety and improved developer experience.

### Zero Dependencies
We've removed the lodash dependency and replaced all functionality with native JavaScript methods.

### New Features
- **Configuration Options**: New `maxDepth` and `strict` options to control comparison behavior
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
  { maxDepth: 2 } // Limit comparison depth
);
```

For detailed changes, please refer to the [CHANGELOG.md](CHANGELOG.md) file. 