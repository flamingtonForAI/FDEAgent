import { prisma } from '../../config/database.js';
import type { UpdatePreferencesInput } from './preferences.schema.js';

export class PreferencesService {
  /**
   * Get user preferences (creates default if not exists)
   */
  async getPreferences(userId: string) {
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.userPreferences.create({
        data: { userId },
      });
    }

    return preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, input: UpdatePreferencesInput) {
    // Upsert to handle case where preferences don't exist yet
    return prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...input,
      },
      update: input,
    });
  }
}

export const preferencesService = new PreferencesService();
