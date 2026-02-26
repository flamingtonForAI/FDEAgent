import jwt, { Algorithm } from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { authConfig } from '../config/auth.js';

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
  // Standard JWT claims (added by jwt.sign automatically, but declared for type safety)
  iat?: number;  // Issued at
  exp?: number;  // Expiration
  iss?: string;  // Issuer
  aud?: string;  // Audience
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

/**
 * Generate an access token (short-lived, 15 minutes)
 * Uses HS256 algorithm with issuer and audience claims for security
 */
export function generateAccessToken(userId: string, email: string): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
    userId,
    email,
    type: 'access',
  };

  return jwt.sign(payload, config.jwt.secret, {
    algorithm: authConfig.jwt.algorithm,
    expiresIn: authConfig.tokens.accessTokenExpiresIn,
    issuer: authConfig.jwt.issuer,
    audience: authConfig.jwt.audience,
  });
}

/**
 * Generate a refresh token (long-lived, 7 days)
 * Uses a random component for added security
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('base64url');
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(userId: string, email: string): TokenPair {
  const now = Date.now();

  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(),
    accessTokenExpiresAt: new Date(now + 15 * 60 * 1000), // 15 minutes
    refreshTokenExpiresAt: new Date(now + authConfig.tokens.refreshTokenExpiresInMs),
  };
}

/**
 * Verify and decode an access token
 *
 * Security measures:
 * - Algorithm whitelist to prevent algorithm confusion attacks
 * - Issuer and audience validation
 * - Type claim validation
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: [authConfig.jwt.algorithm] as Algorithm[],
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    }) as JWTPayload;

    // Additional validation: ensure this is an access token
    if (decoded.type !== 'access') {
      console.warn('JWT verification failed: token type is not "access"');
      return null;
    }

    return decoded;
  } catch (error) {
    // Log the error for debugging/security monitoring (but not the token itself)
    if (error instanceof jwt.TokenExpiredError) {
      // Token expired - normal case, don't log as warning
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('JWT verification failed:', error.message);
    } else {
      console.error('Unexpected JWT verification error:', error);
    }
    return null;
  }
}

/**
 * Decode a token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload | null;
  } catch {
    return null;
  }
}
