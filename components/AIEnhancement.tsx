/**
 * AIEnhancement - 第四阶段：智能化设计
 * 规划 AI 增强方向，包括 Smart Properties、AI Actions、Agent Tools
 */
import React, { useState } from 'react';
import { Language, ProjectState } from '../types';
import { Sparkles, Cpu, Wrench, Shield } from 'lucide-react';
import AIPLogicMatrix from './AIPLogicMatrix';
import ToolSpecViewer from './ToolSpecViewer';

type AIView = 'matrix' | 'tools';

interface AIEnhancementProps {
  lang: Language;
  project: ProjectState;
}

const translations = {
  en: {
    title: 'AI Enhancement',
    subtitle: 'Design AI capabilities and Agent tools',
    tabMatrix: 'AI Matrix',
    tabTools: 'Agent Tools',
    tabMatrixDesc: 'Enhancement Points',
    tabToolsDesc: 'Tool Specs',
  },
  cn: {
    title: '智能化设计',
    subtitle: '规划 AI 能力增强与 Agent 工具',
    tabMatrix: 'AI 矩阵',
    tabTools: 'Agent 工具',
    tabMatrixDesc: '增强点总览',
    tabToolsDesc: '工具规范',
  }
};

const AIEnhancement: React.FC<AIEnhancementProps> = ({
  lang,
  project
}) => {
  const t = translations[lang];
  const [activeView, setActiveView] = useState<AIView>('matrix');

  const tabs: { id: AIView; label: string; desc: string; icon: React.ReactNode }[] = [
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
        {activeView === 'matrix' && (
          <AIPLogicMatrix lang={lang} objects={project.objects} />
        )}
        {activeView === 'tools' && (
          <div className="h-full p-6 overflow-y-auto">
            <ToolSpecViewer lang={lang} project={project} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEnhancement;
