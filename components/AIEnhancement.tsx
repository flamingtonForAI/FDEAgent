/**
 * AIEnhancement - 第四阶段：智能化设计
 * AI 驱动分析 + AI 矩阵 + Agent 工具规范
 */
import React, { useState } from 'react';
import { Language, ProjectState, AISettings } from '../types';
import { Sparkles, Cpu, Wrench, Target } from 'lucide-react';
import AIPLogicMatrix from './AIPLogicMatrix';
import ToolSpecViewer from './ToolSpecViewer';
import AIAnalyzer from './AIAnalyzer';
import { AnalysisResult } from '../services/aiAnalysisService';

type AIView = 'analyze' | 'matrix' | 'tools';

interface AIEnhancementProps {
  lang: Language;
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  aiSettings: AISettings;
  // State lifted to App.tsx for persistence across all tab switches
  analysisResult: AnalysisResult | null;
  onAnalysisResult: (result: AnalysisResult | null) => void;
  isAnalyzing: boolean;
  onIsAnalyzingChange: (v: boolean) => void;
  analysisError: string | null;
  onAnalysisError: (e: string | null) => void;
}

const translations = {
  en: {
    title: 'AI Enhancement',
    subtitle: 'Design AI capabilities and Agent tools',
    tabAnalyze: 'AI Analysis',
    tabMatrix: 'AI Matrix',
    tabTools: 'Agent Tools',
    tabAnalyzeDesc: 'Opportunities',
    tabMatrixDesc: 'Enhancement Points',
    tabToolsDesc: 'Tool Specs',
  },
  cn: {
    title: '智能化设计',
    subtitle: '规划 AI 能力增强与 Agent 工具',
    tabAnalyze: 'AI 分析',
    tabMatrix: 'AI 矩阵',
    tabTools: 'Agent 工具',
    tabAnalyzeDesc: '机会识别',
    tabMatrixDesc: '增强点总览',
    tabToolsDesc: '工具规范',
  }
};

const AIEnhancement: React.FC<AIEnhancementProps> = ({
  lang,
  project,
  setProject,
  aiSettings,
  analysisResult,
  onAnalysisResult,
  isAnalyzing,
  onIsAnalyzingChange,
  analysisError,
  onAnalysisError
}) => {
  const t = translations[lang];
  const [activeView, setActiveView] = useState<AIView>('analyze');

  const tabs: { id: AIView; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'analyze', label: t.tabAnalyze, desc: t.tabAnalyzeDesc, icon: <Target size={16} /> },
    { id: 'matrix', label: t.tabMatrix, desc: t.tabMatrixDesc, icon: <Sparkles size={16} /> },
    { id: 'tools', label: t.tabTools, desc: t.tabToolsDesc, icon: <Wrench size={16} /> },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header with tabs */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {t.title}
          </h1>
          <p className="text-xs text-muted">{t.subtitle}</p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                activeView === tab.id ? 'shadow-sm' : 'hover:bg-[var(--color-bg-hover)]'
              }`}
              style={
                activeView === tab.id
                  ? {
                      backgroundColor: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-primary)',
                      fontWeight: 500
                    }
                  : { color: 'var(--color-text-muted)' }
              }
            >
              {tab.icon}
              <div className="flex flex-col items-start">
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-70">{tab.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'analyze' && (
          <AIAnalyzer
            lang={lang}
            objects={project.objects || []}
            links={project.links || []}
            aiSettings={aiSettings}
            analysisResult={analysisResult}
            onAnalysisResult={onAnalysisResult}
            isAnalyzing={isAnalyzing}
            onIsAnalyzingChange={onIsAnalyzingChange}
            analysisError={analysisError}
            onAnalysisError={onAnalysisError}
            project={project}
            setProject={setProject}
          />
        )}
        {activeView === 'matrix' && (
          <AIPLogicMatrix lang={lang} objects={project.objects} />
        )}
        {activeView === 'tools' && (
          <div className="h-full p-6 pb-24 overflow-y-auto">
            <ToolSpecViewer lang={lang} objects={project.objects || []} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEnhancement;
