/**
 * Authentication Service
 * Handles user registration, login, and session management
 *
 * SECURITY: All authentication goes through the backend.
 * Demo mode requires DEMO_ENABLED=true on the server + seeded demo account.
 * There is no client-side offline fallback.
 */

import { apiClient, type AuthResponse } from './apiClient';

export interface DeletionCheckResponse {
  canDelete: boolean;
  blockers: string[];
  impact: {
    ownedProjects: number;
    sharedMemberships: number;
    versions: number;
    chatMessages: number;
  };
}

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
   */
  async login(input: LoginInput): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/auth/login', input);
    apiClient.setTokens(response);
    return response.user;
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    // Clear any stale demo-mode flag from previous versions
    localStorage.removeItem('demo-mode');

    try {
      await apiClient.logout();
    } catch {
      // Ignore errors - backend might be down
    }
  }

  /**
   * Get the current user's info
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    const response = await apiClient.put<AuthResponse>('/auth/password', {
      currentPassword,
      newPassword,
    });
    apiClient.setTokens(response);
    return response;
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    try {
      await apiClient.post('/auth/logout-all');
    } finally {
      await apiClient.logout();
    }
  }

  /**
   * Check if account can be deleted
   */
  async getDeletionCheck(): Promise<DeletionCheckResponse> {
    return apiClient.get<DeletionCheckResponse>('/auth/account/deletion-check');
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string, confirmEmail: string): Promise<void> {
    await apiClient.post('/auth/account/delete', { password, confirmEmail });
    await apiClient.logout();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthChange(callback: (isAuthenticated: boolean) => void): () => void {
    return apiClient.onAuthChange(callback);
  }
}

export const authService = new AuthService();
