/**
 * SystemIntegration - 第三阶段：系统集成
 * 规划数据源对接与集成方案
 */
import React, { useState } from 'react';
import { ProjectState } from '../types';
import { Network, FileText } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import SystemMap from './SystemMap';
import ProjectOverview from './ProjectOverview';

type IntegrationView = 'architecture' | 'export';

interface SystemIntegrationProps {
  project: ProjectState;
  setProject: (update: ProjectState | ((prev: ProjectState) => ProjectState)) => void;
}

const SystemIntegration: React.FC<SystemIntegrationProps> = ({
  project,
  setProject
}) => {
  const { t } = useAppTranslation('integration');
  const [activeView, setActiveView] = useState<IntegrationView>('architecture');

  const tabs: { id: IntegrationView; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'architecture', label: t('systemIntegration.tabArchitecture'), desc: t('systemIntegration.tabArchitectureDesc'), icon: <Network size={16} /> },
    { id: 'export', label: t('systemIntegration.tabTechnicalDraft'), desc: t('systemIntegration.tabTechnicalDraftDesc'), icon: <FileText size={16} /> },
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
            {t('systemIntegration.title')}
          </h1>
          <p className="text-xs text-muted">{t('systemIntegration.subtitle')}</p>
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
        {activeView === 'architecture' && (
          <SystemMap project={project} setProject={setProject} />
        )}
        {activeView === 'export' && (
          <ProjectOverview project={project} />
        )}
      </div>
    </div>
  );
};

export default SystemIntegration;
