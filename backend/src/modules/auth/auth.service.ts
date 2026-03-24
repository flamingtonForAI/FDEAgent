import { prisma } from '../../config/database.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { generateTokenPair, TokenPair } from '../../utils/jwt.js';
import { AppError } from '../../middleware/error.middleware.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  };
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
      },
    });

    // Generate tokens
    const tokenPair = generateTokenPair(user.id, user.email);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokenPair);

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresAt: tokenPair.accessTokenExpiresAt,
      },
    };
  }

  /**
   * Login a user
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const isValid = await verifyPassword(input.password, user.passwordHash);

    if (!isValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate tokens
    const tokenPair = generateTokenPair(user.id, user.email);

    // Store refresh token and update last login
    await Promise.all([
      this.storeRefreshToken(user.id, tokenPair),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresAt: tokenPair.accessTokenExpiresAt,
      },
    };
  }

  /**
   * Refresh access token
   * Uses transaction to ensure atomic token rotation
   */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    // Find the refresh token first (outside transaction for quick validation)
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError(401, 'Invalid refresh token');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError(401, 'Refresh token has expired');
    }

    // Check if token is revoked
    if (storedToken.revokedAt) {
      throw new AppError(401, 'Refresh token has been revoked');
    }

    // Generate new token pair before transaction
    const newTokenPair = generateTokenPair(
      storedToken.user.id,
      storedToken.user.email
    );

    // Atomic token rotation using transaction
    // This prevents race conditions where old token is deleted but new one fails to create
    await prisma.$transaction(async (tx) => {
      // Delete old refresh token (token rotation)
      await tx.refreshToken.delete({ where: { id: storedToken.id } });

      // Clean up old expired tokens for this user
      await tx.refreshToken.deleteMany({
        where: {
          userId: storedToken.user.id,
          expiresAt: { lt: new Date() },
        },
      });

      // Store new refresh token
      await tx.refreshToken.create({
        data: {
          token: newTokenPair.refreshToken,
          userId: storedToken.user.id,
          expiresAt: newTokenPair.refreshTokenExpiresAt,
        },
      });
    });

    return {
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        emailVerified: storedToken.user.emailVerified,
        createdAt: storedToken.user.createdAt,
      },
      tokens: {
        accessToken: newTokenPair.accessToken,
        refreshToken: newTokenPair.refreshToken,
        expiresAt: newTokenPair.accessTokenExpiresAt,
      },
    };
  }

  /**
   * Logout a user (revoke refresh token)
   */
  async logout(refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    } else if (userId) {
      // Revoke all tokens for user
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'User not found');

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) throw new AppError(401, 'Current password is incorrect');

    const passwordHash = await hashPassword(newPassword);
    const tokenPair = generateTokenPair(user.id, user.email);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { passwordHash } });
      await tx.refreshToken.deleteMany({ where: { userId } });
      await tx.refreshToken.create({
        data: {
          token: tokenPair.refreshToken,
          userId: user.id,
          expiresAt: tokenPair.refreshTokenExpiresAt,
        },
      });
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresAt: tokenPair.accessTokenExpiresAt,
      },
    };
  }

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async getDeletionCheck(userId: string) {
    const [ownedProjects, sharedMemberships, versions, chatMessages] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.projectMember.count({ where: { userId } }),
      prisma.ontologyVersion.count({
        where: { project: { userId } },
      }),
      prisma.chatMessage.count({
        where: { project: { userId } },
      }),
    ]);

    const canDelete = ownedProjects === 0;
    const blockers: string[] = [];
    if (!canDelete) {
      blockers.push(`You own ${ownedProjects} project(s). Transfer or delete them first.`);
    }

    return {
      canDelete,
      blockers,
      impact: {
        ownedProjects,
        sharedMemberships,
        versions,
        chatMessages,
      },
    };
  }

  async deleteAccount(userId: string, password: string, confirmEmail: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'User not found');

    // Verify email matches
    if (user.email.toLowerCase() !== confirmEmail.toLowerCase()) {
      throw new AppError(400, 'Email does not match');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) throw new AppError(401, 'Password is incorrect');

    // Check demo account
    if (user.email.toLowerCase() === 'demo@example.com') {
      throw new AppError(403, 'Demo account cannot be deleted');
    }

    // Check if can delete (no owned projects)
    const ownedProjects = await prisma.project.count({ where: { userId } });
    if (ownedProjects > 0) {
      throw new AppError(409, 'Cannot delete account while owning projects');
    }

    // Cascade delete handles: refreshTokens, preferences, memberships
    await prisma.user.delete({ where: { id: userId } });
  }

  /**
   * Store refresh token in database
   */
  private async storeRefreshToken(
    userId: string,
    tokenPair: TokenPair
  ): Promise<void> {
    // Clean up old expired tokens for this user
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokenPair.refreshToken,
        userId,
        expiresAt: tokenPair.refreshTokenExpiresAt,
      },
    });
  }
}

export const authService = new AuthService();
