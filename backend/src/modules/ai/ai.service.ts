import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { getProvider } from './providers/index.js';
import type { ChatMessage, ChatOptions, ModelInfo } from './providers/index.js';

export class AIService {
  async chat(
    provider: string,
    model: string,
    messages: ChatMessage[],
    options?: ChatOptions,
    userId?: string,
  ): Promise<string> {
    logger.info({ provider, model, messageCount: messages.length }, 'AI chat request');
    const adapter = getProvider(provider);
    return this.withAudit('chat', provider, model, userId, () =>
      adapter.chat(model, messages, options),
    );
  }

  async design(
    provider: string,
    model: string,
    chatHistory: ChatMessage[],
    options?: ChatOptions,
    userId?: string,
  ): Promise<string> {
    logger.info({ provider, model, historyCount: chatHistory.length }, 'AI design request');
    const adapter = getProvider(provider);
    return this.withAudit('design', provider, model, userId, () =>
      adapter.design(model, chatHistory, options),
    );
  }

  async listModels(provider: string, userId?: string): Promise<ModelInfo[]> {
    logger.info({ provider }, 'AI listModels request');
    const adapter = getProvider(provider);
    return this.withAudit('models', provider, '', userId, () =>
      adapter.listModels(),
    );
  }

  async getAuditLogs(userId: string, limit = 50) {
    return prisma.aIAuditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private async withAudit<T>(
    endpoint: string,
    provider: string,
    model: string,
    userId: string | undefined,
    fn: () => Promise<T>,
  ): Promise<T> {
    const start = Date.now();
    let success = true;
    let errorMessage: string | undefined;

    try {
      return await fn();
    } catch (err) {
      success = false;
      errorMessage = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const latencyMs = Date.now() - start;
      if (userId) {
        prisma.aIAuditLog.create({
          data: {
            userId,
            provider,
            model,
            endpoint,
            latencyMs,
            success,
            errorMessage: errorMessage?.slice(0, 500),
          },
        }).catch((logErr) => {
          logger.warn({ err: logErr }, 'Failed to write AI audit log');
        });
      }
    }
  }
}

export const aiService = new AIService();
