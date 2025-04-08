/**
 * Interface for the result of CompareProperties
 */
export interface ComparePropertiesResult {
  differences: string[];
  common: string[];
}

/**
 * Type for circular reference handling strategy
 */
export type CircularReferenceHandling = 'error' | 'ignore';

/**
 * Type for path filter mode 
 */
export type PathFilterMode = 'include' | 'exclude';

/**
 * Interface for path filter configuration
 */
export interface PathFilter {
  /**
   * Array of path patterns to include or exclude
   * - Supports exact paths (e.g., 'user.name')
   * - Supports wildcard paths with leading dot (e.g., '.id' matches any property named 'id' at any level)
   * - Supports wildcards with * (e.g., 'user.*.created' matches 'user.profile.created', 'user.settings.created', etc.)
   */
  patterns: string[];
  
  /**
   * Whether to include or exclude the specified paths
   * - 'include': Only compare paths that match the patterns
   * - 'exclude': Compare all paths except those that match the patterns
   * @default 'exclude'
   */
  mode?: PathFilterMode;
}

/**
 * Comparison options that can be passed to comparison functions
 */
export interface ComparisonOptions {
  /**
   * Whether to use strict equality (===) for comparing values
   * @default true
   */
  strict?: boolean;

  /**
   * How to handle circular references in objects
   * - 'error': throw an error when a circular reference is detected
   * - 'ignore': treat circular references as equal if they refer to the same ancestor
   * @default 'error'
   */
  circularReferences?: CircularReferenceHandling;

  /**
   * Path filter configuration to specify which properties to compare or ignore
   * This allows filtering properties based on path patterns
   */
  pathFilter?: PathFilter;
  
  /**
   * Schema validation options to validate objects structure before comparison
   * This allows ensuring objects match expected structure before performing comparison
   */
  schemaValidation?: SchemaValidation;
}

/**
 * Type of difference between two values
 */
export type DifferenceType = 'added' | 'removed' | 'changed';

/**
 * Interface for detailed difference information
 */
export interface DetailedDifference {
  /** Path to the property that differs */
  path: string;
  /** Type of difference */
  type: DifferenceType;
  /** Original value (undefined for added properties) */
  oldValue?: any;
  /** New value (undefined for removed properties) */
  newValue?: any;
}

/**
 * Type guard to check if a value is an object (neither null nor an array)
 * @param value - The value to check
 * @returns Type predicate indicating if the value is a non-null, non-array object
 */
export function isObjectGuard(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an array
 * @param value - The value to check
 * @returns Type predicate indicating if the value is an array
 */
export function isArrayGuard(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a Date object
 * @param value - The value to check
 * @returns Type predicate indicating if the value is a Date
 */
export function isDateGuard(value: unknown): value is Date {
  return value instanceof Date;
}

/**
 * Type guard to check if a value is a RegExp object
 * @param value - The value to check
 * @returns Type predicate indicating if the value is a RegExp
 */
export function isRegExpGuard(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

/**
 * Generic type for objects with compatible structures
 * This allows TypeScript to understand that objects can have different 
 * but compatible types, where one might be a subset of another
 */
export type CompatibleObject<T, U> = {
  [K in keyof (T & U)]: K extends keyof T & keyof U
    ? T[K] extends object 
      ? U[K] extends object 
        ? CompatibleObject<T[K], U[K]>
        : T[K] | U[K]
      : T[K] | U[K]
    : K extends keyof T
      ? T[K]
      : K extends keyof U
        ? U[K]
        : never
};

/**
 * Result type for comparison operations that includes type information
 * about the compared objects
 */
export type TypedComparisonResult<T, U> = {
  isEqual: boolean;
  firstType: string;
  secondType: string;
};

/**
 * Extended detailed difference that includes type information
 */
export interface TypedDetailedDifference extends DetailedDifference {
  oldValueType?: string;
  newValueType?: string;
}

/**
 * Schema validation options for objects before comparison
 */
export interface SchemaValidation {
  /**
   * Schema for the first object in the comparison
   * If provided, the first object will be validated against this schema before comparison
   */
  firstObjectSchema?: Record<string, unknown>;
  
  /**
   * Schema for the second object in the comparison
   * If provided, the second object will be validated against this schema before comparison
   */
  secondObjectSchema?: Record<string, unknown>;
  
  /**
   * Whether to throw an error if schema validation fails
   * - If true, an error will be thrown when validation fails
   * - If false, validation results will be returned but comparison will continue
   * @default false
   */
  throwOnValidationFailure?: boolean;
}

/**
 * Result of schema validation
 */
export interface SchemaValidationResult {
  /**
   * Whether the first object passed schema validation
   */
  firstObjectValid: boolean;
  
  /**
   * Whether the second object passed schema validation
   */
  secondObjectValid: boolean;
  
  /**
   * List of validation errors for the first object
   */
  firstObjectErrors?: string[];
  
  /**
   * List of validation errors for the second object
   */
  secondObjectErrors?: string[];
}

/**
 * Type safe version of comparison options
 */
export interface TypeSafeComparisonOptions<T, U> extends ComparisonOptions {
  /**
   * Property mapping for objects with different structures
   * Maps properties from the first object to equivalent properties in the second
   */
  propertyMapping?: Partial<Record<keyof T, keyof U>>;
  
  /**
   * Whether to include type information in the results
   * @default false
   */
  includeTypeInfo?: boolean;
  
  /**
   * Custom comparator functions for specific property paths
   */
  customComparators?: Record<string, (value1: any, value2: any) => boolean>;
} 