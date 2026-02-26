import React from 'react';
import AIEnhancement from '../components/AIEnhancement';
import type { ProjectState, Language, AISettings, AnalysisResult } from '../types';

interface AIEnhancementPageProps {
  lang: Language;
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  aiSettings: AISettings;
  analysisResult: AnalysisResult | null;
  onAnalysisResult: (result: AnalysisResult | null) => void;
}

/**
 * AI 增强页面 (Phase 4: AI Enhancement)
 * AI 能力设计、Agent Tools 生成
 */
export const AIEnhancementPage: React.FC<AIEnhancementPageProps> = ({
  lang,
  project,
  setProject,
  aiSettings,
  analysisResult,
  onAnalysisResult,
}) => (
  <AIEnhancement
    lang={lang}
    project={project}
    setProject={setProject}
    aiSettings={aiSettings}
    analysisResult={analysisResult}
    onAnalysisResult={onAnalysisResult}
  />
);
