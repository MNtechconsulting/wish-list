/**
 * Custom hook for managing localStorage with TypeScript generics
 * Provides get, set, and remove functionality with error handling
 * Handles localStorage unavailability gracefully
 */

import { useState, useEffect, useCallback } from 'react';

// Type for the hook's return value
type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void,
  boolean // isAvailable flag
];

/**
 * Custom hook for localStorage management with TypeScript generics
 * @param key - The localStorage key
 * @param initialValue - Default value if key doesn't exist or localStorage is unavailable
 * @returns [value, setValue, removeValue, isAvailable]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  // Check if localStorage is available
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        setIsAvailable(false);
        return initialValue;
      }

      // Test localStorage availability by trying to use it
      const testKey = '__localStorage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);

      // Get item from localStorage
      const item = window.localStorage.getItem(key);
      
      if (item === null) {
        return initialValue;
      }

      // Parse stored JSON
      return JSON.parse(item);
    } catch (error) {
      // localStorage is disabled, full, or corrupted
      console.warn(`localStorage unavailable for key "${key}":`, error);
      setIsAvailable(false);
      return initialValue;
    }
  });

  // Function to set value in both state and localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to localStorage if available
        if (isAvailable && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        // Handle localStorage errors (quota exceeded, etc.)
        console.warn(`Failed to save to localStorage for key "${key}":`, error);
        setIsAvailable(false);
        // Still update the state even if localStorage fails
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
      }
    },
    [key, storedValue, isAvailable]
  );

  // Function to remove value from both state and localStorage
  const removeValue = useCallback(() => {
    try {
      // Reset to initial value
      setStoredValue(initialValue);
      
      // Remove from localStorage if available
      if (isAvailable && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Failed to remove from localStorage for key "${key}":`, error);
      setIsAvailable(false);
      // Still reset the state even if localStorage fails
      setStoredValue(initialValue);
    }
  }, [key, initialValue, isAvailable]);

  // Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    if (!isAvailable || typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Failed to parse localStorage change for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        // Key was removed
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, isAvailable]);

  return [storedValue, setValue, removeValue, isAvailable];
}

/**
 * Utility function to check if localStorage is available
 * @returns boolean indicating localStorage availability
 */
export function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Utility function to safely get an item from localStorage
 * @param key - The localStorage key
 * @param defaultValue - Default value if key doesn't exist or localStorage is unavailable
 * @returns The parsed value or defaultValue
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  try {
    if (!isLocalStorageAvailable()) {
      return defaultValue;
    }

    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Failed to get localStorage item for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Utility function to safely set an item in localStorage
 * @param key - The localStorage key
 * @param value - The value to store
 * @returns boolean indicating success
 */
export function setLocalStorageItem<T>(key: string, value: T): boolean {
  try {
    if (!isLocalStorageAvailable()) {
      return false;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to set localStorage item for key "${key}":`, error);
    return false;
  }
}

/**
 * Utility function to safely remove an item from localStorage
 * @param key - The localStorage key
 * @returns boolean indicating success
 */
export function removeLocalStorageItem(key: string): boolean {
  try {
    if (!isLocalStorageAvailable()) {
      return false;
    }

    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove localStorage item for key "${key}":`, error);
    return false;
  }
}