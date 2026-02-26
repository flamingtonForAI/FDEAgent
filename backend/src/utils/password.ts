import argon2 from 'argon2';
import { authConfig } from '../config/auth.js';

/**
 * Hash a password using Argon2id
 * Argon2id is the winner of the Password Hashing Competition (PHC)
 * and provides resistance against both GPU and side-channel attacks
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: authConfig.argon2.memoryCost,
    timeCost: authConfig.argon2.timeCost,
    parallelism: authConfig.argon2.parallelism,
  });
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Check if a password meets the minimum requirements
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < authConfig.password.minLength) {
    errors.push(`Password must be at least ${authConfig.password.minLength} characters`);
  }

  if (password.length > authConfig.password.maxLength) {
    errors.push(`Password must be at most ${authConfig.password.maxLength} characters`);
  }

  // Check for at least one uppercase, one lowercase, and one number
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
