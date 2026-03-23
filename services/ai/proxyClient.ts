/**
 * Thin client that delegates AI calls to the backend proxy (/api/ai/*).
 * Uses the authenticated apiClient for all requests.
 */

import { apiClient } from '../apiClient';
import type { EnrichedModelInfo, AICallOptions } from './types';
import type { ChatMessage, AISettings } from '../../types';

interface ChatResponse {
  content: string;
}

interface ModelsResponse {
  models: Array<{ id: string; name: string; description?: string }>;
}

export async function proxyChat(
  settings: AISettings,
  history: ChatMessage[],
  nextMessage: string,
  options?: AICallOptions,
): Promise<string> {
  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: nextMessage },
  ];
  const resp = await apiClient.post<ChatResponse>('/ai/chat', {
    provider: settings.provider,
    model: settings.model,
    messages,
    options: options ? { lang: options.lang } : undefined,
  });
  return resp.content;
}

export async function proxyChatWithFiles(
  settings: AISettings,
  history: ChatMessage[],
  nextMessage: string,
  files: Array<{ name: string; content: string; isBase64: boolean; extractedText?: string }>,
  options?: AICallOptions,
): Promise<string> {
  // For proxy mode, append file text content to the message
  // (binary file handling would require multipart — out of scope for now)
  let enhancedMessage = nextMessage;
  for (const file of files) {
    const text = file.extractedText || (!file.isBase64 ? file.content : null);
    if (text) {
      enhancedMessage += `\n\n--- Attachment: ${file.name} ---\n${text}\n--- End ---`;
    }
  }
  return proxyChat(settings, history, enhancedMessage, options);
}

export async function proxyDesign(
  settings: AISettings,
  chatHistory: ChatMessage[],
  options?: AICallOptions,
): Promise<string> {
  const resp = await apiClient.post<ChatResponse>('/ai/design', {
    provider: settings.provider,
    model: settings.model,
    chatHistory: chatHistory.map(m => ({ role: m.role, content: m.content })),
    options: options ? { lang: options.lang } : undefined,
  });
  return resp.content;
}

export async function proxyListModels(
  settings: AISettings,
): Promise<EnrichedModelInfo[]> {
  const resp = await apiClient.get<ModelsResponse>(
    `/ai/models?provider=${encodeURIComponent(settings.provider)}`,
  );
  return (resp.models || []).map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    source: 'api' as const,
  }));
}
