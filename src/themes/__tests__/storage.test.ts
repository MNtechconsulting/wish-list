/**
 * Tests for theme storage utilities
 * Validates localStorage integration with error handling and fallback mechanisms
 */

import {
  saveThemePreference,
  loadThemePreference,
  clearThemePreference,
  isStorageAvailable,
  validateThemePreference,
  getStorageStatus,
  StorageError,
  DEFAULT_STORAGE_KEY
} from '../storage';

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

// Mock localStorage globally
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('Theme Storage Utilities', () => {
  beforeEach(() => {
    // Clear all mocks and storage before each test
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws an error', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage disabled');
      });
      
      expect(isStorageAvailable()).toBe(false);
    });
  });

  describe('validateThemePreference', () => {
    it('should validate correct theme IDs', () => {
      expect(validateThemePreference('dark')).toBe(true);
      expect(validateThemePreference('light')).toBe(true);
      expect(validateThemePreference('high-contrast')).toBe(true);
      expect(validateThemePreference('pastel')).toBe(true);
    });

    it('should reject invalid theme IDs', () => {
      expect(validateThemePreference('')).toBe(false);
      expect(validateThemePreference(null)).toBe(false);
      expect(validateThemePreference('invalid theme!')).toBe(false);
      expect(validateThemePreference('a'.repeat(51))).toBe(false); // Too long
    });
  });

  describe('saveThemePreference', () => {
    it('should save theme preference successfully', () => {
      const result = saveThemePreference('dark');
      
      expect(result.success).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(DEFAULT_STORAGE_KEY, 'dark');
    });

    it('should handle invalid theme ID', () => {
      const result = saveThemePreference('');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(StorageError.UNKNOWN_ERROR);
      expect(result.message).toContain('Invalid theme ID');
    });

    it('should fall back to memory storage when localStorage fails', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage disabled');
      });
      
      const result = saveThemePreference('dark');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('memory storage');
    });

    it('should handle quota exceeded error', () => {
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      mockLocalStorage.setItem
        .mockImplementationOnce(() => { throw quotaError; })
        .mockImplementationOnce(() => { throw quotaError; }); // Retry also fails
      
      const result = saveThemePreference('dark');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('memory storage');
    });
  });

  describe('loadThemePreference', () => {
    it('should load theme preference successfully', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('dark');
      
      const result = loadThemePreference();
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('dark');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(DEFAULT_STORAGE_KEY);
    });

    it('should return null when no preference is stored', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);
      
      const result = loadThemePreference();
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });

    it('should fall back to memory storage when localStorage fails', () => {
      // Use a custom storage key to avoid interference from other tests
      const customKey = 'test-fallback-key';
      
      // First save to memory storage with the custom key (simulate localStorage failure during save)
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage disabled during save');
      });
      saveThemePreference('light', customKey);
      
      // Now simulate localStorage failure during load
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage disabled during load');
      });
      
      const result = loadThemePreference(customKey);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('light');
      expect(result.message).toContain('memory storage');
    });
  });

  describe('clearThemePreference', () => {
    it('should clear theme preference successfully', () => {
      const result = clearThemePreference();
      
      expect(result.success).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(DEFAULT_STORAGE_KEY);
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage disabled');
      });
      
      const result = clearThemePreference();
      
      expect(result.success).toBe(true); // Memory storage cleared
      expect(result.message).toContain('memory storage');
    });
  });

  describe('getStorageStatus', () => {
    it('should return correct storage status', () => {
      const status = getStorageStatus();
      
      expect(status.localStorage).toBe(true);
      expect(status.memoryStorage).toBe(true);
      expect(typeof status.hasStoredPreference).toBe('boolean');
    });

    it('should detect stored preferences', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('dark');
      
      const status = getStorageStatus();
      
      expect(status.hasStoredPreference).toBe(true);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete save-load-clear cycle', () => {
      // Save
      const saveResult = saveThemePreference('dark');
      expect(saveResult.success).toBe(true);
      
      // Load
      const loadResult = loadThemePreference();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBe('dark');
      
      // Clear
      const clearResult = clearThemePreference();
      expect(clearResult.success).toBe(true);
      
      // Verify cleared
      const loadAfterClear = loadThemePreference();
      expect(loadAfterClear.data).toBe(null);
    });

    it('should work with custom storage keys', () => {
      const customKey = 'custom-theme-key';
      
      const saveResult = saveThemePreference('light', customKey);
      expect(saveResult.success).toBe(true);
      
      const loadResult = loadThemePreference(customKey);
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBe('light');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(customKey, 'light');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(customKey);
    });
  });
});