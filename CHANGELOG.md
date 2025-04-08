# Changelog

All notable changes to the object-deep-compare project will be documented in this file.

## [2.4.0] - 2024-04-08

### Added
- **Schema Validation**:
  - New `schemaValidation` option in ComparisonOptions to validate objects against schemas before comparison
  - Support for validating both simple and complex nested object structures
  - Schema definition for validating object property types and presence
  - Array validation including support for array items validation
  - New `SchemaValidation` and `SchemaValidationResult` types for configuring and receiving validation results
  - New `ValidateObjectsAgainstSchemas` function for standalone schema validation
  - Added examples in documentation showing how to use schema validation for type checking

## [2.3.0] - 2024-04-08

### Added
- **Property Path Filtering**:
  - New `pathFilter` option in ComparisonOptions to specify which properties to compare or ignore
  - Support for wildcard patterns, exact paths, and property name patterns
  - Two filtering modes: 'include' to only compare matching paths or 'exclude' to ignore matching paths
  - New helper functions to match paths against patterns
  - New types `PathFilter` and `PathFilterMode` for configuring path filtering
  - Added examples in documentation that show how to ignore timestamps, auto-generated IDs, etc.

## [2.2.0] - 2024-04-08

### Added
- **Circular Reference Detection**:
  - New `circularReferences` option in ComparisonOptions to handle circular references
  - Two handling strategies: 'error' (default) to throw a CircularReferenceError or 'ignore' to treat circular references as equal
  - Added tracking of object references during comparison to detect cycles
  - Added CircularReferenceHandling type to specify handling strategy
  - New tests for circular reference detection and handling
- **Enhanced error handling** for all comparison functions to properly handle circular reference errors
- **Updated documentation** with examples for the new circular reference detection feature

## [2.1.0] - 2024-04-08

### Added
- **Detailed Difference Reporting**:
  - New `CompareValuesWithDetailedDifferences` function that returns detailed information about differences
  - Each difference now includes the type of difference ('added', 'removed', 'changed')
  - Actual values that differ are included in the conflict report (oldValue and newValue)
  - New `DetailedDifference` type that represents the enhanced difference information
- **Memoized version** of the new function available as `MemoizedCompareValuesWithDetailedDifferences`

### Fixed
- Improved array element comparison to report individual element differences
- Maintained backward compatibility for existing API functions

## [2.0.0] - 2024-04-08

### Breaking Changes
- **Complete rewrite in TypeScript** - Full type-safety and improved developer experience
- **Removal of lodash dependency** - Now uses native JavaScript methods for all operations
- **Enhanced comparison behavior** - More predictable behavior for edge cases and special values

### Added
- **TypeScript type definitions** - Full type definitions for all functions and interfaces
- **New configuration options**:
  - `strict`: Toggle between strict and loose equality checks
- **Special value handling**:
  - Proper comparison for `NaN`, `null`, and `undefined` values
  - Date object comparison based on time values
  - RegExp object comparison

### Fixed
- **CompareProperties**: Fixed duplicate entries in differences array
- **CompareArrays**: 
  - Replaced inefficient and inaccurate JSON.stringify comparison
  - Fixed early returns in forEach loops
  - Added proper type checking
- **CompareValuesWithConflicts**: 
  - Improved path building for nested conflicts
  - Fixed potential infinite recursion with circular references
  - Better structure for nested comparisons

### Performance Improvements
- Optimized algorithms for better performance
- Reduced unnecessary iterations and property checks
- More efficient property filtering with pick function
- Improved data structures for tracking results

### Documentation
- Enhanced JSDoc comments for all functions
- Improved README with detailed examples
- Added examples for new configuration options

## [1.2.0] - Previous version
- Initial version with JavaScript implementation 