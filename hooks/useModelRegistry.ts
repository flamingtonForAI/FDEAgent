import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AIProvider } from '../types';
import { EnrichedModelInfo } from '../services/aiService';
import { modelRegistry } from '../lib/modelRegistry';
import { getModelCapabilities, isRecommendedModel, ModelCapabilities } from '../lib/llmCapabilities';

type FetchStatus = 'idle' | 'fetching' | 'success' | 'failed';

interface UseModelRegistryParams {
  provider: AIProvider;
  apiKey?: string;
  customBaseUrl?: string;
}

interface UseModelRegistryResult {
  models: EnrichedModelInfo[];
  status: FetchStatus;
  error: string;
  isUsingFallback: boolean;
  refreshModels: () => Promise<void>;
  getCapabilities: (modelId?: string, modelInfo?: EnrichedModelInfo) => ModelCapabilities;
  isRecommended: (modelId?: string, modelInfo?: EnrichedModelInfo) => boolean;
}

export function useModelRegistry({
  provider,
  apiKey = '',
  customBaseUrl,
}: UseModelRegistryParams): UseModelRegistryResult {
  const [models, setModels] = useState<EnrichedModelInfo[]>([]);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState('');
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const loadModels = useCallback(async (forceRefresh: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus((prev) => (forceRefresh || prev !== 'success' ? 'fetching' : prev));
    setError('');

    try {
      const result = await modelRegistry.listModels({
        provider,
        apiKey,
        customBaseUrl,
        forceRefresh,
        signal: controller.signal,
      });
      setModels(result.models);
      setStatus('success');
      setIsUsingFallback(result.fallback);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setStatus('failed');
      setError(err instanceof Error ? err.message : 'Failed to load models');
    }
  }, [provider, apiKey, customBaseUrl]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadModels(false);
    }, 800);
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [loadModels]);

  const refreshModels = useCallback(async () => {
    await loadModels(true);
  }, [loadModels]);

  const getCapabilitiesFn = useCallback((modelId?: string, modelInfo?: EnrichedModelInfo) => {
    return getModelCapabilities(provider, modelId, modelInfo);
  }, [provider]);

  const isRecommendedFn = useCallback((modelId?: string, modelInfo?: EnrichedModelInfo) => {
    return isRecommendedModel(provider, modelId, modelInfo);
  }, [provider]);

  return useMemo(() => ({
    models,
    status,
    error,
    isUsingFallback,
    refreshModels,
    getCapabilities: getCapabilitiesFn,
    isRecommended: isRecommendedFn,
  }), [models, status, error, isUsingFallback, refreshModels, getCapabilitiesFn, isRecommendedFn]);
}

