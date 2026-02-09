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
    await apiClient.logout();
  }

  /**
   * Get the current user's info
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
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
