import * as deepCompare from '../src/main';
import { TypedComparisonResult, TypedDetailedDifference, TypeSafeComparisonOptions } from '../src/types';

describe('Type-Safe Comparison Tests', () => {
  // Define interfaces for type testing
  interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    [key: string]: unknown;
  }

  interface SimpleUser {
    userId: number;
    username: string;
    userEmail: string;
    [key: string]: unknown;
  }

  interface Customer {
    id: number;
    name: string;
    email: string;
    subscription: {
      plan: string;
      active: boolean;
    };
    [key: string]: unknown;
  }

  let user: User;
  let simpleUser: SimpleUser;
  let customer: Customer;

  beforeEach(() => {
    user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    simpleUser = {
      userId: 1,
      username: 'John Doe',
      userEmail: 'john@example.com'
    };

    customer = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      subscription: {
        plan: 'premium',
        active: true
      }
    };
  });

  describe('TypeSafeCompareArrays', () => {
    it('should compare arrays of different types with type information', () => {
      const array1 = [1, 2, 3];
      const array2 = ['1', '2', '3'];
      
      // With strict comparison
      const result1 = deepCompare.TypeSafeCompareArrays(array1, array2);
      expect(result1.isEqual).toBe(false);
      expect(result1.firstType).toBe('array');
      expect(result1.secondType).toBe('array');
      
      // With non-strict comparison
      const result2 = deepCompare.TypeSafeCompareArrays(array1, array2, { strict: false });
      expect(result2.isEqual).toBe(true);
    });
    
    it('should handle arrays with objects', () => {
      const array1 = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
      const array2 = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
      
      const result = deepCompare.TypeSafeCompareArrays(array1, array2);
      expect(result.isEqual).toBe(true);
    });
  });

  describe('TypeSafeCompareObjects', () => {
    it('should compare objects of different types', () => {
      // Create mapping for different property names
      const options: TypeSafeComparisonOptions<SimpleUser, User> = {
        propertyMapping: {
          userId: 'id',
          username: 'name',
          userEmail: 'email'
        },
        // Set strict to false to handle property type differences
        strict: false
      };
      
      const result = deepCompare.TypeSafeCompareObjects(simpleUser, user, options);
      
      // Since the first object still has properties that don't exist in the second, it's not equal
      // The property mapping only adds mapped properties, doesn't remove unmapped ones
      expect(result.isEqual).toBe(false);
      expect(result.firstType).toBe('object');
      expect(result.secondType).toBe('object');
      
      // When we create objects with only the mapped properties, they should be equal
      const simpleUserMappedOnly = {
        userId: 1,
        username: 'John Doe',
        userEmail: 'john@example.com'
      };
      
      const userEquivalent = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };
      
      const mappedResult = deepCompare.TypeSafeCompareObjects(simpleUserMappedOnly, userEquivalent, options);
      expect(mappedResult.isEqual).toBe(true);
    });
    
    it('should fail when objects are not compatible', () => {
      const result = deepCompare.TypeSafeCompareObjects(simpleUser, user);
      expect(result.isEqual).toBe(false);
    });
    
    it('should handle nested objects', () => {
      const extendedUser = {
        ...user,
        settings: {
          theme: 'dark',
          notifications: true
        }
      };
      
      const result = deepCompare.TypeSafeCompareObjects(user, extendedUser);
      expect(result.isEqual).toBe(false);
    });
  });

  describe('TypeSafeCompareValuesWithDetailedDifferences', () => {
    it('should provide detailed differences with type information', () => {
      const options: TypeSafeComparisonOptions<User, Customer> = {
        includeTypeInfo: true
      };
      
      const result = deepCompare.TypeSafeCompareValuesWithDetailedDifferences(user, customer, options);
      
      // Should find 2 differences: role missing, subscription added
      expect(result.length).toBe(2);
      
      // Verify first difference (role missing)
      const roleDiff = result.find(diff => diff.path === 'role');
      expect(roleDiff).toBeDefined();
      expect(roleDiff?.type).toBe('removed');
      expect(roleDiff?.oldValue).toBe('admin');
      expect(roleDiff?.oldValueType).toBe('string');
      
      // Verify second difference (subscription added)
      const subscriptionDiff = result.find(diff => diff.path === 'subscription');
      expect(subscriptionDiff).toBeDefined();
      expect(subscriptionDiff?.type).toBe('added');
      expect(subscriptionDiff?.newValueType).toBe('object');
    });
  });

  describe('ObjectsAreEqual type guard', () => {
    it('should act as a TypeScript type guard', () => {
      // Create an object that has all properties from both types
      const combinedObject = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        subscription: {
          plan: 'premium',
          active: true
        }
      };
      
      const someObject: User | Customer = combinedObject;
      
      // We expect the objects to be equal (since combinedObject has all properties of customer)
      const isEqual = deepCompare.ObjectsAreEqual(someObject, customer);
      
      // The objects should be equal
      expect(isEqual).toBe(true);
      
      // If they are equal, TypeScript narrows the type
      if (isEqual) {
        // TypeScript should now know that someObject is compatible with Customer
        expect(someObject.subscription).toBeDefined();
        // In the combined object, the role should also be defined
        expect(someObject.role).toBeDefined();
      }
    });
    
    it('should correctly identify unequal objects', () => {
      const modifiedCustomer = { ...customer, id: 999 };
      
      if (deepCompare.ObjectsAreEqual(user, modifiedCustomer)) {
        // This branch should not execute in this test case
        expect(true).toBe(false);
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('IsSubset', () => {
    it('should check if an object is a subset of another', () => {
      const userSubset = {
        id: 1,
        name: 'John Doe'
      };
      
      expect(deepCompare.IsSubset(user, userSubset)).toBe(true);
      expect(deepCompare.IsSubset(userSubset, user)).toBe(false);
    });
  });

  describe('GetCommonStructure', () => {
    it('should identify common structure between different objects', () => {
      const common = deepCompare.GetCommonStructure(user, customer);
      
      // Should have id, name, and email properties
      expect(common).toHaveProperty('id');
      expect(common).toHaveProperty('name');
      expect(common).toHaveProperty('email');
      
      // Should not have role or subscription properties
      expect(common).not.toHaveProperty('role');
      expect(common).not.toHaveProperty('subscription');
    });
  });
}); 