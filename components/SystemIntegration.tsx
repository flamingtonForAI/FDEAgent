/**
 * SystemIntegration - 第三阶段：系统集成
 * 规划数据源对接与集成方案
 */
import React, { useState } from 'react';
import { Language, ProjectState } from '../types';
import { Network, FileText } from 'lucide-react';
import SystemMap from './SystemMap';
import ProjectOverview from './ProjectOverview';

type IntegrationView = 'architecture' | 'export';

interface SystemIntegrationProps {
  lang: Language;
  project: ProjectState;
}

const translations = {
  en: {
    title: 'System Integration',
    subtitle: 'Data sources and integration planning',
    tabArchitecture: 'Architecture',
    tabExport: 'Export',
    tabArchitectureDesc: 'Data Sources',
    tabExportDesc: 'Deliverables',
  },
  cn: {
    title: '系统集成',
    subtitle: '数据源与集成方案规划',
    tabArchitecture: '架构',
    tabExport: '导出',
    tabArchitectureDesc: '数据源配置',
    tabExportDesc: '交付物',
  }
};

const SystemIntegration: React.FC<SystemIntegrationProps> = ({
  lang,
  project
}) => {
  const t = translations[lang];
  const [activeView, setActiveView] = useState<IntegrationView>('architecture');

  const tabs: { id: IntegrationView; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'architecture', label: t.tabArchitecture, desc: t.tabArchitectureDesc, icon: <Network size={16} /> },
    { id: 'export', label: t.tabExport, desc: t.tabExportDesc, icon: <FileText size={16} /> },
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
        {activeView === 'architecture' && (
          <SystemMap lang={lang} project={project} />
        )}
        {activeView === 'export' && (
          <ProjectOverview lang={lang} project={project} />
        )}
      </div>
    </div>
  );
};

export default SystemIntegration;
