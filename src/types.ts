/**
 * Interface for the result of CompareProperties
 */
export interface ComparePropertiesResult {
  differences: string[];
  common: string[];
}

/**
 * Comparison options that can be passed to comparison functions
 */
export interface ComparisonOptions {
  /**
   * Maximum depth to traverse when comparing objects
   * @default Infinity
   */
  maxDepth?: number;
  
  /**
   * Whether to use strict equality (===) for comparing values
   * @default true
   */
  strict?: boolean;
} 