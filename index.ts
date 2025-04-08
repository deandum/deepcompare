import { CompareProperties, MemoizedCompareProperties } from './src/comparison/compare-properties';
import { CompareArrays, MemoizedCompareArrays } from './src/comparison/compare-arrays';
import { 
  CompareValuesWithConflicts, 
  MemoizedCompareValuesWithConflicts,
  ObjectsAreEqual,
  IsSubset,
  GetCommonStructure
} from './src/comparison/object-comparison';
import { 
  CompareValuesWithDetailedDifferences,
  MemoizedCompareValuesWithDetailedDifferences 
} from './src/comparison/detailed-comparison';
import { 
  TypeSafeCompareArrays,
  TypeSafeCompareObjects,
  TypeSafeCompareValuesWithDetailedDifferences,
  MapObjectProperties
} from './src/type-safe/typed-comparisons';
import { ValidateObjectsAgainstSchemas } from './src/core/schema-validation';
import { Memoize } from './src/utils/memoization';
import { 
  ComparisonOptions, 
  DetailedDifference, 
  TypedComparisonResult, 
  TypedDetailedDifference, 
  TypeSafeComparisonOptions, 
  CompatibleObject,
  CircularReferenceHandling,
  PathFilter,
  PathFilterMode,
  SchemaValidation,
  SchemaValidationResult
} from './src/types';

export {
  CompareProperties,
  CompareArrays,
  CompareValuesWithConflicts,
  CompareValuesWithDetailedDifferences,
  TypeSafeCompareArrays,
  TypeSafeCompareObjects,
  TypeSafeCompareValuesWithDetailedDifferences,
  ObjectsAreEqual,
  IsSubset,
  GetCommonStructure,
  ValidateObjectsAgainstSchemas,
  MapObjectProperties,
  Memoize,
  MemoizedCompareProperties,
  MemoizedCompareArrays,
  MemoizedCompareValuesWithConflicts,
  MemoizedCompareValuesWithDetailedDifferences,
  DetailedDifference,
  TypedComparisonResult,
  TypedDetailedDifference,
  ComparisonOptions,
  TypeSafeComparisonOptions,
  CompatibleObject,
  CircularReferenceHandling,
  PathFilter,
  PathFilterMode,
  SchemaValidation,
  SchemaValidationResult
}; 