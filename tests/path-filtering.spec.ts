import {
  CompareArrays,
  CompareValuesWithConflicts,
  CompareValuesWithDetailedDifferences,
  ComparisonOptions
} from '../index';

describe('Property Path Filtering', () => {
  // Test objects with various nested structures
  const obj1 = {
    user: {
      id: 'abc123',
      name: 'John',
      email: 'john@example.com',
      createdAt: '2023-01-01T00:00:00Z',
      profile: {
        id: 'profile1',
        bio: 'Hello!',
        lastSeen: '2023-01-01T12:00:00Z'
      },
      settings: {
        theme: 'dark',
        notifications: true
      }
    },
    posts: [
      {
        id: 'post1',
        title: 'First Post',
        content: 'Hello world',
        timestamp: '2023-01-02T00:00:00Z',
        tags: ['hello', 'world']
      },
      {
        id: 'post2',
        title: 'Second Post',
        content: 'Another post',
        timestamp: '2023-01-03T00:00:00Z',
        tags: ['another', 'post']
      }
    ],
    timestamp: '2023-01-04T00:00:00Z'
  };

  const obj2 = {
    user: {
      id: 'xyz789', // Different ID
      name: 'John',
      email: 'john@example.com',
      createdAt: '2023-02-01T00:00:00Z', // Different timestamp
      profile: {
        id: 'profile2', // Different ID
        bio: 'Hello!',
        lastSeen: '2023-02-01T12:00:00Z' // Different timestamp
      },
      settings: {
        theme: 'light', // Different value
        notifications: true
      }
    },
    posts: [
      {
        id: 'post3', // Different ID
        title: 'First Post',
        content: 'Hello world',
        timestamp: '2023-02-02T00:00:00Z', // Different timestamp
        tags: ['hello', 'world']
      },
      {
        id: 'post4', // Different ID
        title: 'Second Post Modified', // Different value
        content: 'Modified content', // Different value
        timestamp: '2023-02-03T00:00:00Z', // Different timestamp
        tags: ['another', 'modified'] // Different value
      }
    ],
    timestamp: '2023-02-04T00:00:00Z' // Different timestamp
  };

  // Simplified objects for more predictable testing
  const simple1 = {
    id: 'id1',
    name: 'Test',
    settings: {
      theme: 'dark',
      notifications: true,
      timestamp: '2023-01-01'
    }
  };

  const simple2 = {
    id: 'id2',
    name: 'Test',
    settings: {
      theme: 'light',
      notifications: false,
      timestamp: '2023-02-01'
    }
  };

  describe('Excluding paths', () => {
    test('should ignore specific exact paths', () => {
      const options: ComparisonOptions = {
        pathFilter: {
          patterns: ['user.settings.theme'],
          mode: 'exclude'
        }
      };

      const conflicts = CompareValuesWithConflicts(obj1, obj2, '', options);
      expect(conflicts).not.toBeNull();
      if (conflicts !== null) {
        expect(conflicts).not.toContain('user.settings.theme');
        expect(conflicts).toContain('user.id');
        expect(conflicts).toContain('user.createdAt');
      }
    });

    test('should ignore paths with property patterns', () => {
      // Use simpler objects for this test
      const options: ComparisonOptions = {
        pathFilter: {
          patterns: ['.timestamp'], // Ignore any property named timestamp
          mode: 'exclude'
        }
      };

      const differences = CompareValuesWithDetailedDifferences(simple1, simple2, '', options);
      expect(differences).not.toBeNull();
      if (differences !== null) {
        // Should include differences not related to timestamp
        const hasIdDiff = differences.some(d => d.path === 'id');
        const hasThemeDiff = differences.some(d => d.path === 'settings.theme');
        const hasNotificationsDiff = differences.some(d => d.path === 'settings.notifications');
        
        expect(hasIdDiff).toBe(true);
        expect(hasThemeDiff).toBe(true);
        expect(hasNotificationsDiff).toBe(true);
        
        // Should not include timestamp differences
        const hasTimestampDiff = differences.some(d => d.path && d.path.includes('timestamp'));
        expect(hasTimestampDiff).toBe(false);
      }
    });

    test('should ignore all properties with a specific name using leading dot', () => {
      const options: ComparisonOptions = {
        pathFilter: {
          patterns: ['.id', '.timestamp', '.createdAt', '.lastSeen'],
          mode: 'exclude'
        }
      };

      const differences = CompareValuesWithDetailedDifferences(obj1, obj2, '', options);
      expect(differences).not.toBeNull();
      if (differences !== null) {
        // Should not contain any timestamp or id fields
        const hasIdDiffs = differences.some(d => d.path && (
          d.path === 'user.id' || 
          d.path === 'user.profile.id' || 
          d.path.includes('posts') && d.path.includes('id')
        ));
        
        const hasTimestampDiffs = differences.some(d => d.path && (
          d.path === 'timestamp' || 
          d.path === 'user.createdAt' || 
          d.path === 'user.profile.lastSeen' || 
          d.path.includes('posts') && d.path.includes('timestamp')
        ));
        
        expect(hasIdDiffs).toBe(false);
        expect(hasTimestampDiffs).toBe(false);
        
        // Should still contain other differences
        const hasThemeDiff = differences.some(d => d.path === 'user.settings.theme');
        const hasPostTitleDiff = differences.some(d => d.path && d.path.includes('title'));
        const hasPostContentDiff = differences.some(d => d.path && d.path.includes('content'));
        const hasPostTagsDiff = differences.some(d => d.path && d.path.includes('tags'));
        
        expect(hasThemeDiff).toBe(true);
        expect(hasPostTitleDiff).toBe(true);
        expect(hasPostContentDiff).toBe(true);
        expect(hasPostTagsDiff).toBe(true);
      }
    });
  });

  describe('Including paths', () => {
    test('should only compare specified exact paths', () => {
      // Use simpler objects with known differences
      const options: ComparisonOptions = {
        pathFilter: {
          patterns: ['id', 'settings.theme'],
          mode: 'include'
        }
      };

      const differences = CompareValuesWithDetailedDifferences(simple1, simple2, '', options);
      expect(differences).not.toBeNull();
      if (differences !== null) {
        // Log the actual differences for debugging
        console.log('Differences with include mode:', differences.map(d => d.path));
        
        expect(differences.length).toBeGreaterThan(0);
        
        // Should have differences for specified paths
        const hasIdDiff = differences.some(d => d.path === 'id');
        const hasThemeDiff = differences.some(d => d.path === 'settings.theme');
        
        expect(hasIdDiff).toBe(true);
        expect(hasThemeDiff).toBe(true);
        
        // Should not include other paths
        const hasNotificationsDiff = differences.some(d => d.path === 'settings.notifications');
        const hasTimestampDiff = differences.some(d => d.path === 'settings.timestamp');
        
        expect(hasNotificationsDiff).toBe(false);
        expect(hasTimestampDiff).toBe(false);
      }
    });

    test('should filter arrays using include mode', () => {
      // Specific test for array filtering in include mode
      const arr1 = [
        { id: 1, title: 'First', content: 'Content 1' },
        { id: 2, title: 'Second', content: 'Content 2' }
      ];
      
      const arr2 = [
        { id: 3, title: 'First', content: 'Different content' },
        { id: 4, title: 'Second Modified', content: 'Content 2' }
      ];
      
      const options: ComparisonOptions = {
        pathFilter: {
          patterns: ['[*].content'], // Only check content fields
          mode: 'include'
        }
      };
      
      const differences = CompareValuesWithDetailedDifferences(arr1, arr2, '', options);
      expect(differences).not.toBeNull();
      if (differences !== null) {
        // Log the actual differences for debugging
        console.log('Array differences with include mode:', differences.map(d => d.path));
        
        // Should only have differences in content, not in id or title
        const hasContentDiffs = differences.some(d => d.path && d.path.includes('content'));
        const hasIdDiffs = differences.some(d => d.path && d.path.includes('id'));
        const hasTitleDiffs = differences.some(d => d.path && d.path.includes('title'));
        
        expect(hasContentDiffs).toBe(true);
        expect(hasIdDiffs).toBe(false);
        expect(hasTitleDiffs).toBe(false);
      }
    });
  });

  describe('Detailed differences', () => {
    test('should include detailed differences with path filtering', () => {
      const options: ComparisonOptions = {
        pathFilter: {
          patterns: ['.id', '.timestamp', '.createdAt', '.lastSeen'],
          mode: 'exclude'
        }
      };

      const differences = CompareValuesWithDetailedDifferences(obj1, obj2, '', options);
      expect(differences).not.toBeNull();
      if (differences !== null) {
        // Should have detailed differences for non-excluded paths
        const themeDiff = differences.find(d => d.path === 'user.settings.theme');
        expect(themeDiff).toBeDefined();
        expect(themeDiff?.oldValue).toBe('dark');
        expect(themeDiff?.newValue).toBe('light');
        
        // Should not have differences for excluded paths
        expect(differences.find(d => d.path === 'user.id')).toBeUndefined();
        expect(differences.find(d => d.path === 'timestamp')).toBeUndefined();
        expect(differences.find(d => d.path === 'posts[0].id')).toBeUndefined();
      }
    });
  });

  describe('Array comparison', () => {
    test('should apply path filtering to array comparisons', () => {
      const arr1 = [
        { id: 1, name: 'Item 1', timestamp: '2023-01-01' },
        { id: 2, name: 'Item 2', timestamp: '2023-01-02' }
      ];
      
      const arr2 = [
        { id: 3, name: 'Item 1', timestamp: '2023-02-01' }, // Only id and timestamp different
        { id: 4, name: 'Different', timestamp: '2023-02-02' } // All fields different
      ];
      
      // Without filtering
      expect(CompareArrays(arr1, arr2)).toBe(false);
      
      // With filtering - exclude IDs and timestamps
      const options: ComparisonOptions = {
        pathFilter: {
          patterns: ['.id', '.timestamp'],
          mode: 'exclude'
        }
      };
      
      // Only name difference remains
      expect(CompareArrays(arr1, arr2, options)).toBe(false);
      
      // When filtering out all differences, arrays should match
      const arr3 = [
        { id: 5, name: 'Item 1', timestamp: '2023-03-01' }, // Only id and timestamp different
        { id: 6, name: 'Item 2', timestamp: '2023-03-02' } // Only id and timestamp different
      ];
      
      expect(CompareArrays(arr1, arr3, options)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty pattern arrays', () => {
      const options: ComparisonOptions = {
        pathFilter: {
          patterns: [],
          mode: 'exclude'
        }
      };

      // Empty patterns should be the same as no filtering
      const conflicts = CompareValuesWithConflicts(obj1, obj2, '', options);
      expect(conflicts).not.toBeNull();
      if (conflicts !== null) {
        expect(conflicts.length).toBeGreaterThan(0);
      }
    });

    test('should handle invalid patterns gracefully', () => {
      const options: ComparisonOptions = {
        pathFilter: {
          patterns: ['non.existent.path'],
          mode: 'include'
        }
      };

      // Should result in no conflicts since nothing matches the pattern
      const conflicts = CompareValuesWithConflicts(obj1, obj2, '', options);
      expect(conflicts).not.toBeNull();
      if (conflicts !== null) {
        expect(conflicts.length).toBe(0);
      }
    });
  });
}); 