import { useState, useEffect } from 'react';
import { AnalysisResult } from '../services/aiAnalysisService';
import { storage } from '../lib/storageFacade';

/**
 * Manages AI analysis state per project (persisted across tab switches & refreshes).
 */
export function useAIAnalysis(activeProjectId: string | null) {
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  // Load analysis result when project switches
  useEffect(() => {
    if (activeProjectId) {
      const saved = storage.getAnalysisResultById(activeProjectId);
      setAiAnalysisResult(saved as AnalysisResult | null);
    } else {
      setAiAnalysisResult(null);
    }
    // Reset transient state on project switch
    setIsAiAnalyzing(false);
    setAiAnalysisError(null);
  }, [activeProjectId]);

  // Auto-save analysis result when it changes
  useEffect(() => {
    if (!activeProjectId || isAiAnalyzing) return;
    if (aiAnalysisResult) {
      storage.saveAnalysisResultById(activeProjectId, aiAnalysisResult);
    }
  }, [aiAnalysisResult, activeProjectId, isAiAnalyzing]);

  /** Clear persisted analysis (call when ontology regenerated or archetype applied) */
  const clearAnalysis = () => {
    setAiAnalysisResult(null);
    if (activeProjectId) {
      storage.saveAnalysisResultById(activeProjectId, null);
    }
  };

  return {
    aiAnalysisResult,
    setAiAnalysisResult,
    isAiAnalyzing,
    setIsAiAnalyzing,
    aiAnalysisError,
    setAiAnalysisError,
    clearAnalysis,
  };
}
