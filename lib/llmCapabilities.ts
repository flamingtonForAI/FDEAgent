import { AIProvider } from '../types';
import { EnrichedModelInfo } from '../services/aiService';

export type CapabilityLevel = 'full' | 'partial' | 'none';

export interface ModelCapabilities {
  office: CapabilityLevel;
  pdf: CapabilityLevel;
  image: CapabilityLevel;
  longContext: CapabilityLevel;
  toolUse: CapabilityLevel;
  recommendedForOntology: boolean;
}

function normalizeModelId(modelId?: string): string {
  return (modelId || '').trim().toLowerCase();
}

function hasFileInput(inputModalities?: string[]): boolean {
  return !!inputModalities?.some((m) => ['file', 'document'].includes(String(m).toLowerCase()));
}

function hasImageInput(inputModalities?: string[]): boolean {
  return !!inputModalities?.some((m) => ['image', 'vision'].includes(String(m).toLowerCase()));
}

function isGemini15OrNewer(provider?: AIProvider, modelId?: string): boolean {
  if (provider !== 'gemini') return false;
  const id = normalizeModelId(modelId);
  return id.includes('gemini-1.5') || id.includes('gemini-2');
}

function getFallbackCapabilities(provider?: AIProvider, modelId?: string): Omit<ModelCapabilities, 'recommendedForOntology'> {
  const id = normalizeModelId(modelId);
  const isOpenRouterClaude = provider === 'openrouter' && id.includes('claude');
  const isGeminiModern = isGemini15OrNewer(provider, modelId);
  const isVision = id.includes('4o') || id.includes('claude-3') || id.includes('claude-4') || id.includes('gemini') || id.includes('glm-4v');
  const longContext = id.includes('128k') || id.includes('200k') || id.includes('1m') || id.includes('gpt-4.1');
  const likelyTools = !id.startsWith('o1') && !id.includes('deepseek-reasoner');

  return {
    office: isGeminiModern ? 'full' : 'none',
    pdf: (isGeminiModern || isOpenRouterClaude) ? 'full' : 'partial',
    image: isVision ? 'full' : 'none',
    longContext: longContext ? 'full' : 'partial',
    toolUse: likelyTools ? 'full' : 'partial',
  };
}

function fromMetadata(provider?: AIProvider, modelId?: string, modelInfo?: EnrichedModelInfo): Omit<ModelCapabilities, 'recommendedForOntology'> {
  if (!modelInfo) return getFallbackCapabilities(provider, modelId);

  const office = (provider === 'gemini' && isGemini15OrNewer(provider, modelId))
    ? 'full'
    : hasFileInput(modelInfo.inputModalities)
      ? 'full'
      : 'none';

  const pdf = (office === 'full' || hasFileInput(modelInfo.inputModalities))
    ? 'full'
    : (provider === 'openrouter' && normalizeModelId(modelId).includes('claude') ? 'full' : 'partial');

  const image = hasImageInput(modelInfo.inputModalities) ? 'full' : 'none';
  const longContext = (modelInfo.contextLength || 0) >= 128000 ? 'full' : (modelInfo.contextLength ? 'partial' : 'none');
  const toolUse = modelInfo.supportsTools === true ? 'full' : (modelInfo.supportsTools === false ? 'none' : 'partial');

  return { office, pdf, image, longContext, toolUse };
}

export function getOntologyRecommendationScore(provider?: AIProvider, modelId?: string, modelInfo?: EnrichedModelInfo): number {
  const capability = fromMetadata(provider, modelId, modelInfo);
  const id = normalizeModelId(modelId);
  let score = 0;

  if (capability.office === 'full') score += 30;
  if (capability.pdf === 'full') score += 20;
  if (capability.image === 'full') score += 15;
  if (capability.toolUse === 'full') score += 15;
  if (capability.longContext === 'full') score += 10;

  if (id.includes('gemini-2.5') || id.includes('claude-sonnet-4') || id.includes('gpt-4.1')) {
    score += 10;
  }

  return score;
}

export function getModelCapabilities(provider?: AIProvider, modelId?: string, modelInfo?: EnrichedModelInfo): ModelCapabilities {
  const base = fromMetadata(provider, modelId, modelInfo);
  const score = getOntologyRecommendationScore(provider, modelId, modelInfo);
  return {
    ...base,
    recommendedForOntology: score >= 75,
  };
}

export function isRecommendedModel(provider?: AIProvider, modelId?: string, modelInfo?: EnrichedModelInfo): boolean {
  return getModelCapabilities(provider, modelId, modelInfo).recommendedForOntology;
}

