/**
 * Theme storage utilities
 * Handles persistence of theme preferences in localStorage with comprehensive error handling
 */

/**
 * Default storage key for theme preferences
 */
export const DEFAULT_STORAGE_KEY = 'wishlist-theme';

/**
 * Storage error types for better error handling
 */
export enum StorageError {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  STORAGE_DISABLED = 'STORAGE_DISABLED',
  SECURITY_ERROR = 'SECURITY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Storage operation result interface
 */
export interface StorageResult<T = void> {
  success: boolean;
  data?: T;
  error?: StorageError;
  message?: string;
}

/**
 * In-memory fallback storage for when localStorage is unavailable
 */
class MemoryStorage {
  private storage = new Map<string, string>();

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Fallback storage instance
 */
const memoryStorage = new MemoryStorage();

/**
 * Determine storage error type from exception
 */
const getStorageErrorType = (error: unknown): StorageError => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'QuotaExceededError':
      case 'NS_ERROR_DOM_QUOTA_REACHED':
        return StorageError.QUOTA_EXCEEDED;
      case 'SecurityError':
        return StorageError.SECURITY_ERROR;
      default:
        return StorageError.STORAGE_DISABLED;
    }
  }
  return StorageError.UNKNOWN_ERROR;
};

/**
 * Check if localStorage is available and functional
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Save theme preference with comprehensive error handling and fallback
 */
export const saveThemePreference = (
  themeId: string, 
  storageKey: string = DEFAULT_STORAGE_KEY
): StorageResult => {
  if (!themeId || typeof themeId !== 'string') {
    return {
      success: false,
      error: StorageError.UNKNOWN_ERROR,
      message: 'Invalid theme ID provided'
    };
  }

  try {
    localStorage.setItem(storageKey, themeId);
    return { success: true };
  } catch (error) {
    const errorType = getStorageErrorType(error);
    
    // Handle quota exceeded by clearing old preferences and retrying
    if (errorType === StorageError.QUOTA_EXCEEDED) {
      try {
        // Clear old theme preferences (keep only current key)
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('theme') && key !== storageKey) {
            localStorage.removeItem(key);
          }
        });
        
        // Retry saving
        localStorage.setItem(storageKey, themeId);
        return { success: true };
      } catch (retryError) {
        // Fall back to memory storage
        memoryStorage.setItem(storageKey, themeId);
        console.warn('localStorage quota exceeded, using memory storage fallback');
        return {
          success: true,
          message: 'Saved to memory storage (session only)'
        };
      }
    }
    
    // For other errors, fall back to memory storage
    memoryStorage.setItem(storageKey, themeId);
    console.warn('localStorage unavailable, using memory storage fallback:', error);
    
    return {
      success: true,
      error: errorType,
      message: 'Saved to memory storage (session only)'
    };
  }
};

/**
 * Load theme preference with fallback to memory storage
 */
export const loadThemePreference = (
  storageKey: string = DEFAULT_STORAGE_KEY
): StorageResult<string | null> => {
  try {
    const preference = localStorage.getItem(storageKey);
    return {
      success: true,
      data: preference
    };
  } catch (error) {
    const errorType = getStorageErrorType(error);
    
    // Fall back to memory storage
    const memoryPreference = memoryStorage.getItem(storageKey);
    
    if (memoryPreference) {
      return {
        success: true,
        data: memoryPreference,
        error: errorType,
        message: 'Loaded from memory storage'
      };
    }
    
    console.warn('Failed to load theme preference:', error);
    return {
      success: false,
      data: null,
      error: errorType,
      message: 'No preference found in any storage'
    };
  }
};

/**
 * Clear theme preference from both localStorage and memory storage
 */
export const clearThemePreference = (
  storageKey: string = DEFAULT_STORAGE_KEY
): StorageResult => {
  let localStorageCleared = false;
  let memoryStorageCleared = false;
  
  try {
    localStorage.removeItem(storageKey);
    localStorageCleared = true;
  } catch (error) {
    console.warn('Failed to clear theme preference from localStorage:', error);
  }
  
  try {
    memoryStorage.removeItem(storageKey);
    memoryStorageCleared = true;
  } catch (error) {
    console.warn('Failed to clear theme preference from memory storage:', error);
  }
  
  return {
    success: localStorageCleared || memoryStorageCleared,
    message: localStorageCleared 
      ? 'Cleared from localStorage' 
      : memoryStorageCleared 
        ? 'Cleared from memory storage' 
        : 'Failed to clear from any storage'
  };
};

/**
 * Validate theme preference data
 */
export const validateThemePreference = (themeId: string | null): boolean => {
  if (!themeId || typeof themeId !== 'string') {
    return false;
  }
  
  // Basic validation - theme ID should be alphanumeric with hyphens
  const validThemePattern = /^[a-z0-9-]+$/;
  return validThemePattern.test(themeId) && themeId.length > 0 && themeId.length < 50;
};

/**
 * Get storage status information for debugging
 */
export const getStorageStatus = (): {
  localStorage: boolean;
  memoryStorage: boolean;
  hasStoredPreference: boolean;
} => {
  const localStorageAvailable = isStorageAvailable();
  const hasMemoryPreference = memoryStorage.getItem(DEFAULT_STORAGE_KEY) !== null;
  
  let hasLocalPreference = false;
  if (localStorageAvailable) {
    try {
      hasLocalPreference = localStorage.getItem(DEFAULT_STORAGE_KEY) !== null;
    } catch {
      hasLocalPreference = false;
    }
  }
  
  return {
    localStorage: localStorageAvailable,
    memoryStorage: true, // Memory storage is always available
    hasStoredPreference: hasLocalPreference || hasMemoryPreference
  };
};