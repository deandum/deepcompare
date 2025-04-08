import { SchemaValidationResult } from '../types';

/**
 * Schema Validation Error thrown when schema validation fails and throwOnValidationFailure is true
 */
export class SchemaValidationError extends Error {
  /**
   * Creates a new Schema Validation Error
   * @param message - Error message
   * @param validationResult - Result of schema validation that caused the error
   */
  constructor(message: string, public validationResult: SchemaValidationResult) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Error thrown when a circular reference is detected and handling is set to 'error'
 */
export class CircularReferenceError extends Error {
  /**
   * Creates a new Circular Reference Error
   * @param path - Path where the circular reference was detected
   */
  constructor(path: string) {
    super(`Circular reference detected at path: ${path}`);
    this.name = 'CircularReferenceError';
  }
} 