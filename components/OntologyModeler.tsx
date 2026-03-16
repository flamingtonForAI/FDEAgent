/**
 * OntologyModeler - 统一的本体建模模块
 * 两个视图：建模工作台（编辑 Objects/Links/Actions）+ 关系图谱（可视化）
 */
import React, { useState } from 'react';
import { ProjectState } from '../types';
import { ClipboardList, GitFork } from 'lucide-react';
import StructuringWorkbench from './StructuringWorkbench';
import OntologyVisualizer from './OntologyVisualizer';
import { useAppTranslation } from '../hooks/useAppTranslation';

type ModelingView = 'workbench' | 'graph';

interface OntologyModelerProps {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  chatMessages?: Array<{ role: string; content: string }>;
  onNavigateToScouting?: () => void;
  onNavigateToArchetypes?: () => void;
}

const OntologyModeler: React.FC<OntologyModelerProps> = ({
  project,
  setProject,
  chatMessages,
  onNavigateToScouting,
  onNavigateToArchetypes
}) => {
  const { t } = useAppTranslation('modeling');
  const [activeView, setActiveView] = useState<ModelingView>('workbench');

  const tabs: { id: ModelingView; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'workbench', label: t('ontologyModeler.tabWorkbench'), desc: t('ontologyModeler.tabWorkbenchDesc'), icon: <ClipboardList size={16} /> },
    { id: 'graph', label: t('ontologyModeler.tabGraph'), desc: t('ontologyModeler.tabGraphDesc'), icon: <GitFork size={16} /> },
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
            {t('ontologyModeler.title')}
          </h1>
          <p className="text-xs text-muted">{t('ontologyModeler.subtitle')}</p>
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
        {activeView === 'workbench' && (
          <StructuringWorkbench
            project={project}
            setProject={setProject}
            chatMessages={chatMessages}
            onNavigateToScouting={onNavigateToScouting}
            onNavigateToArchetypes={onNavigateToArchetypes}
          />
        )}
        {activeView === 'graph' && (
          <OntologyVisualizer
            objects={project.objects}
            links={project.links}
          />
        )}
      </div>
    </div>
  );
};

export default OntologyModeler;
