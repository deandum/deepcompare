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