/** Common message format used across all providers. */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Options passed to chat/design calls. */
export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  lang?: string;
}

/** Model information returned by listModels. */
export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
}

/** Every provider adapter implements this interface. */
export interface AIProviderAdapter {
  chat(model: string, messages: ChatMessage[], options?: ChatOptions): Promise<string>;
  design(model: string, chatHistory: ChatMessage[], options?: ChatOptions): Promise<string>;
  listModels(): Promise<ModelInfo[]>;
}
