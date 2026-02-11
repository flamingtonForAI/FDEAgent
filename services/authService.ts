/**
 * Authentication Service
 * Handles user registration, login, and session management
 */

import { apiClient, type AuthResponse } from './apiClient';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

// Demo account for offline testing
const DEMO_ACCOUNT = {
  email: 'demo@example.com',
  password: 'Demo123!',
};

const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@example.com',
  emailVerified: true,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

// Check if demo mode is active
function isDemoMode(): boolean {
  return localStorage.getItem('demo-mode') === 'true';
}

function setDemoMode(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem('demo-mode', 'true');
  } else {
    localStorage.removeItem('demo-mode');
  }
}

class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/auth/register', input);
    apiClient.setTokens(response);
    return response.user;
  }

  /**
   * Login an existing user
   * Supports demo mode for offline testing
   */
  async login(input: LoginInput): Promise<User> {
    // Check if this is a demo account login
    const isDemoAccount =
      input.email === DEMO_ACCOUNT.email &&
      input.password === DEMO_ACCOUNT.password;

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', input);
      apiClient.setTokens(response);
      setDemoMode(false);
      return response.user;
    } catch (err) {
      // If backend is not available and using demo account, enable demo mode
      if (isDemoAccount && err instanceof Error &&
          (err.message.includes('404') || err.message.includes('Failed to fetch') || err.message.includes('Network'))) {
        console.log('Backend not available, using demo mode');
        // SECURITY: Clear any existing tokens before entering demo mode
        // to prevent mixed state where UI shows demo but requests carry old tokens
        await apiClient.logout().catch(() => {}); // Ignore errors since backend might be down
        setDemoMode(true);
        // Trigger auth change callback
        this._notifyAuthChange(true);
        return DEMO_USER;
      }
      throw err;
    }
  }

  // Auth change listeners
  private _authListeners: Set<(isAuthenticated: boolean) => void> = new Set();

  private _notifyAuthChange(isAuthenticated: boolean): void {
    this._authListeners.forEach(callback => callback(isAuthenticated));
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    // Always clear demo mode flag
    const wasDemo = isDemoMode();
    setDemoMode(false);

    // Always attempt to clear tokens, even in demo mode
    // This ensures clean state when switching between demo and real auth
    try {
      await apiClient.logout();
    } catch {
      // Ignore errors - backend might be down
    }

    if (wasDemo) {
      this._notifyAuthChange(false);
    }
  }

  /**
   * Get the current user's info
   */
  async getCurrentUser(): Promise<User> {
    if (isDemoMode()) {
      return DEMO_USER;
    }
    return apiClient.get<User>('/auth/me');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (isDemoMode()) {
      return true;
    }
    return apiClient.isAuthenticated();
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthChange(callback: (isAuthenticated: boolean) => void): () => void {
    this._authListeners.add(callback);
    const apiUnsubscribe = apiClient.onAuthChange(callback);

    return () => {
      this._authListeners.delete(callback);
      apiUnsubscribe();
    };
  }
}

export const authService = new AuthService();
