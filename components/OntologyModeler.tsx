/**
 * OntologyModeler - 统一的本体建模模块
 * 整合：结构化编辑 + 可视化 + Action 设计
 */
import React, { useState, useCallback } from 'react';
import { Language, ProjectState, AIPAction } from '../types';
import { ClipboardList, Eye, PenTool } from 'lucide-react';
import StructuringWorkbench from './StructuringWorkbench';
import OntologyVisualizer from './OntologyVisualizer';
import ActionDesigner from './ActionDesigner';

type ModelingView = 'edit' | 'visualize' | 'actions';

interface OntologyModelerProps {
  lang: Language;
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  chatMessages?: Array<{ role: string; content: string }>;
  onNavigateToScouting?: () => void;
  onNavigateToArchetypes?: () => void;
}

const translations = {
  en: {
    title: 'Ontology Modeling',
    subtitle: 'Define Objects, Links, and Actions',
    tabEdit: 'Edit',
    tabVisualize: 'Visualize',
    tabActions: 'Actions',
    tabEditDesc: 'Structure & Properties',
    tabVisualizeDesc: 'Relationship Graph',
    tabActionsDesc: 'Business Logic',
  },
  cn: {
    title: '本体建模',
    subtitle: '定义 Objects、Links 和 Actions',
    tabEdit: '编辑',
    tabVisualize: '可视化',
    tabActions: 'Actions',
    tabEditDesc: '结构与属性',
    tabVisualizeDesc: '关系图谱',
    tabActionsDesc: '业务逻辑',
  }
};

const OntologyModeler: React.FC<OntologyModelerProps> = ({
  lang,
  project,
  setProject,
  chatMessages,
  onNavigateToScouting,
  onNavigateToArchetypes
}) => {
  const t = translations[lang];
  const [activeView, setActiveView] = useState<ModelingView>('edit');

  // Action 更新处理
  const handleUpdateAction = useCallback((objectId: string, actionIndex: number, updatedAction: AIPAction) => {
    setProject(prev => ({
      ...prev,
      objects: prev.objects.map(obj =>
        obj.id === objectId
          ? {
              ...obj,
              actions: obj.actions.map((action, idx) =>
                idx === actionIndex ? updatedAction : action
              )
            }
          : obj
      )
    }));
  }, [setProject]);

  const tabs: { id: ModelingView; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'edit', label: t.tabEdit, desc: t.tabEditDesc, icon: <ClipboardList size={16} /> },
    { id: 'visualize', label: t.tabVisualize, desc: t.tabVisualizeDesc, icon: <Eye size={16} /> },
    { id: 'actions', label: t.tabActions, desc: t.tabActionsDesc, icon: <PenTool size={16} /> },
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
        {activeView === 'edit' && (
          <StructuringWorkbench
            lang={lang}
            project={project}
            setProject={setProject}
            chatMessages={chatMessages}
            onNavigateToScouting={onNavigateToScouting}
            onNavigateToArchetypes={onNavigateToArchetypes}
          />
        )}
        {activeView === 'visualize' && (
          <OntologyVisualizer
            lang={lang}
            objects={project.objects}
            links={project.links}
          />
        )}
        {activeView === 'actions' && (
          <ActionDesigner
            lang={lang}
            objects={project.objects}
            onUpdateAction={handleUpdateAction}
          />
        )}
      </div>
    </div>
  );
};

export default OntologyModeler;
