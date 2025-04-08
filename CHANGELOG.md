# Changelog

All notable changes to the object-deep-compare project will be documented in this file.

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