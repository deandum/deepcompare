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