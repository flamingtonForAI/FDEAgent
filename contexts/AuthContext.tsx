/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService, type User, type LoginInput, type RegisterInput } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          // Store user ID for storage layer isolation
          if (currentUser?.id) {
            localStorage.setItem('ontology-auth-session', JSON.stringify({ user: { id: currentUser.id } }));
          }
        } catch {
          // Token is invalid, clear it
          setUser(null);
          localStorage.removeItem('ontology-auth-session');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthChange((isAuthenticated) => {
      if (!isAuthenticated) {
        setUser(null);
        localStorage.removeItem('ontology-auth-session');
      }
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setError(null);
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login(input);
      setUser(loggedInUser);
      // Store user ID for storage layer isolation
      if (loggedInUser?.id) {
        localStorage.setItem('ontology-auth-session', JSON.stringify({ user: { id: loggedInUser.id } }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setError(null);
    setIsLoading(true);
    try {
      const newUser = await authService.register(input);
      setUser(newUser);
      // Store user ID for storage layer isolation
      if (newUser?.id) {
        localStorage.setItem('ontology-auth-session', JSON.stringify({ user: { id: newUser.id } }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      // Clear user session for storage isolation
      localStorage.removeItem('ontology-auth-session');
      // Note: We intentionally keep project data for next login
      // The user-scoped keys ensure it won't leak to other users
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
