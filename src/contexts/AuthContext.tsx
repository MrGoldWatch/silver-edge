import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { User, LoginRequest, RegisterRequest, ApiError } from '../types/api';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleApiError = (error: any) => {
    const apiError = error as ApiError;
    const errorMessage = apiError.message || apiError.error || 'An unexpected error occurred';
    setError(errorMessage);
    
    // Show alert for critical errors
    if (apiError.status === 0) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      if (apiService.isAuthenticated()) {
        // Try to get current user from API
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // If API call fails, try to get stored user data
          const storedUser = await apiService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // Clear invalid auth
            await apiService.logout();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      console.log('AuthContext: Starting login...', credentials.email);
      setIsLoading(true);
      clearError();

      const response = await apiService.login(credentials);
      console.log('AuthContext: Login successful', response);
      setUser(response.user);

      Alert.alert(
        'Welcome Back!',
        `Successfully logged in as ${response.user.email}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('AuthContext: Login error', error);
      handleApiError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      console.log('AuthContext: Starting registration...', userData);
      setIsLoading(true);
      clearError();

      const response = await apiService.register(userData);
      console.log('AuthContext: Registration successful', response);
      setUser(response.user);

      Alert.alert(
        'Welcome to Silver Edge!',
        'Your account has been created successfully. You can now start tracking your coin hunts.',
        [{ text: 'Get Started' }]
      );
    } catch (error) {
      console.error('AuthContext: Registration error', error);
      handleApiError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiService.logout();
      setUser(null);
      clearError();
      
      Alert.alert(
        'Logged Out',
        'You have been successfully logged out.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const currentUser = await apiService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      handleApiError(error);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && apiService.isAuthenticated(),
    login,
    register,
    logout,
    refreshUser,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
