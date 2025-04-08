import { PathFilter } from '../types';

/**
 * Checks if a given path matches any of the provided patterns
 * Supports wildcard patterns:
 * - '.fieldName' matches any property named 'fieldName' at any level
 * - 'parent.*.child' matches any path like 'parent.something.child'
 * - 'parent[*].child' matches any array index like 'parent[0].child'
 * 
 * @param path - The property path to check
 * @param patterns - Array of patterns to match against
 * @returns Whether the path matches any of the patterns
 */
export const matchesPathPattern = (path: string, patterns: string[]): boolean => {
  if (!patterns || patterns.length === 0) {
    return false;
  }

  for (const pattern of patterns) {
    // Handle leading dot for any level match
    if (pattern.startsWith('.')) {
      const fieldName = pattern.substring(1);
      // Check if path equals the field name, ends with the field name, or contains it as a property name
      if (path === fieldName || 
          path.endsWith(`.${fieldName}`) || 
          path.includes(`${fieldName}.`) ||
          path.match(new RegExp(`\\[\\d+\\]\\.${fieldName}`)) ||  // Match pattern[0].fieldName
          path.match(new RegExp(`\\.${fieldName}\\[`))) {         // Match pattern.fieldName[
        return true;
      }
      continue;
    }

    // Handle exact match
    if (pattern === path) {
      return true;
    }
    
    // Match array index patterns
    if (pattern.includes('[*]')) {
      const arrayPattern = pattern.replace(/\[\*\]/g, '\\[\\d+\\]');
      const regexPattern = '^' + arrayPattern.replace(/\./g, '\\.') + '$';
      try {
        const regex = new RegExp(regexPattern);
        if (regex.test(path)) {
          return true;
        }
      } catch (e) {
        // If regex fails, fall back to exact match
      }
    }
    
    // Match wildcard patterns
    if (pattern.includes('*')) {
      // Convert pattern to regex
      const regexPattern = '^' + pattern
        .replace(/\./g, '\\.')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\*/g, '[^.\\[\\]]*') + '$';
      
      try {
        const regex = new RegExp(regexPattern);
        if (regex.test(path)) {
          return true;
        }
      } catch (e) {
        // If regex fails, fall back to exact match
      }
    }

    // Check for parent paths in array cases
    // If the pattern is 'posts' and the path is 'posts[0].title', it should match
    if (path.startsWith(pattern + '[') || path.startsWith(pattern + '.')) {
      return true;
    }
  }

  return false;
};

/**
 * Determine if a path or any of its parent paths should be filtered out
 * This helps handle structured data like arrays where we might want to filter
 * at the parent level
 * 
 * @param path - The property path to check
 * @param pathFilter - Path filter configuration
 * @returns Whether the path should be filtered
 */
export const shouldFilterPath = (path: string, pathFilter?: PathFilter): boolean => {
  if (!pathFilter || !pathFilter.patterns || pathFilter.patterns.length === 0) {
    return false; // If no filter is defined, nothing is filtered
  }

  // Check if the path itself matches any pattern
  if (matchesPathPattern(path, pathFilter.patterns)) {
    return true;
  }

  // Check for parent paths in case of arrays
  // For example, if filtering 'posts.*.title', we should also filter 'posts'
  // This is needed because arrays report conflicts at the parent level
  const parts = path.split('.');
  let currentPath = '';

  for (const part of parts) {
    // Handle array notation in path segments
    const arrayMatch = part.match(/^([^\[]+)(\[\d+\])(.*)$/);
    if (arrayMatch) {
      const beforeBracket = arrayMatch[1];
      const bracketPart = arrayMatch[2];
      const afterBracket = arrayMatch[3];
      
      // Build the path up to this segment
      if (currentPath) {
        currentPath += '.';
      }
      currentPath += beforeBracket;
      
      // Check if this array path matches any pattern
      if (matchesPathPattern(currentPath, pathFilter.patterns)) {
        return true;
      }
      
      // Include the bracket part and continue
      currentPath += bracketPart;
      
      if (afterBracket) {
        currentPath += afterBracket;
      }
    } else {
      // Handle normal path segments
      if (currentPath) {
        currentPath += '.';
      }
      currentPath += part;
      
      // Check if this path matches any pattern
      if (matchesPathPattern(currentPath, pathFilter.patterns)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Determines if a path should be compared based on the pathFilter configuration
 * 
 * @param path - The property path to check
 * @param pathFilter - Path filter configuration
 * @returns Whether the path should be compared
 */
export const shouldComparePath = (path: string, pathFilter?: PathFilter): boolean => {
  if (!pathFilter || !pathFilter.patterns || pathFilter.patterns.length === 0) {
    return true; // If no filter is defined, compare all paths
  }

  const mode = pathFilter.mode || 'exclude';
  
  // If we're in exclude mode, check if the path matches any pattern
  if (mode === 'exclude') {
    return !shouldFilterPath(path, pathFilter);
  }
  
  // For include mode, we need more flexible matching
  
  // Direct match - check if the path exactly matches any pattern
  if (pathFilter.patterns.includes(path)) {
    return true;
  }
  
  // Check if path matches any pattern
  if (shouldFilterPath(path, pathFilter)) {
    return true;
  }
  
  // Handle array notation specially
  if (path.includes('[')) {
    // Convert array indices to wildcards for matching
    const wildcardPath = path.replace(/\[\d+\]/g, '[*]');
    if (pathFilter.patterns.includes(wildcardPath)) {
      return true;
    }
    
    // Check array element direct match
    // e.g., if pattern is '[*].content', path could be '[0].content'
    for (const pattern of pathFilter.patterns) {
      if (pattern.startsWith('[*]') && path.match(/^\[\d+\]/)) {
        const patternSuffix = pattern.substring(3); // Remove '[*]'
        const pathSuffix = path.replace(/^\[\d+\]/, ''); // Remove '[0]'
        if (patternSuffix === pathSuffix) {
          return true;
        }
      }
    }
  }
  
  // Check parent paths for include patterns
  // e.g., if pattern is 'settings.*', we should include 'settings.theme'
  const parts = path.split('.');
  let currentPath = '';
  
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) {
      currentPath += '.';
    }
    currentPath += parts[i];
    
    // Check if the current path segment followed by wildcard is in patterns
    const wildcardPattern = `${currentPath}.*`;
    if (pathFilter.patterns.includes(wildcardPattern)) {
      return true;
    }
    
    // Also check for other wildcard patterns
    for (const pattern of pathFilter.patterns) {
      if (pattern.includes('*') && !pattern.startsWith('.')) {
        // Convert pattern to regex
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\[/g, '\\[')
          .replace(/\]/g, '\\]')
          .replace(/\*/g, '[^.\\[\\]]*');
        
        try {
          const regex = new RegExp(`^${regexPattern}`);
          if (regex.test(path)) {
            return true;
          }
        } catch (e) {
          // If regex fails, continue
        }
      }
    }
  }
  
  // For include mode, return false if no pattern matches
  return false;
}; 