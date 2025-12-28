/**
 * Authentication context for managing user state and authentication
 * Provides login, logout, and user state management across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, LoginRequest, RegisterRequest, ApiError } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token might be expired or invalid
          apiService.logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);
      setIsLoading(true);
      
      await apiService.login(credentials);
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Login failed. Please try again.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      console.log('🚀 Starting registration process for:', userData.email);
      setError(null);
      setIsLoading(true);
      
      console.log('📞 Calling API register...');
      const registrationResult = await apiService.register(userData);
      console.log('✅ API register successful:', registrationResult);
      console.log('🔄 Now auto-logging in...');
      
      // Auto-login after successful registration
      await login({ email: userData.email, password: userData.password });
      console.log('✅ Auto-login successful');
    } catch (error) {
      console.error('❌ Registration error caught:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error constructor:', error?.constructor?.name);
      console.error('❌ Error instanceof ApiError:', error instanceof ApiError);
      
      if (error instanceof ApiError) {
        console.error('❌ ApiError details:', { status: error.status, message: error.message, details: error.details });
        
        // Provide more specific error messages
        if (error.status === 409) {
          setError('This email is already registered. Please try logging in instead.');
        } else if (error.status === 422) {
          setError(error.details?.errors ? error.details.errors.join(', ') : 'Please check your input and try again.');
        } else {
          setError(error.message || 'Registration failed. Please try again.');
        }
      } else {
        console.error('❌ Unknown error details:', {
          message: (error as any)?.message,
          name: (error as any)?.name,
          stack: (error as any)?.stack,
          toString: (error as any)?.toString()
        });
        setError(`Network error: ${(error as any)?.message || 'Please check your connection and try again.'}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};