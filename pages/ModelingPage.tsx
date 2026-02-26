import React from 'react';
import OntologyModeler from '../components/OntologyModeler';
import type { ProjectState, Language } from '../types';

interface ModelingPageProps {
  lang: Language;
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  chatMessages: React.MutableRefObject<any[]>;
  onNavigateToScouting: () => void;
  onNavigateToArchetypes: () => void;
}

/**
 * 本体建模页面 (Phase 2: Modeling)
 * Ontology 设计器：Objects、Links、Actions 定义
 */
export const ModelingPage: React.FC<ModelingPageProps> = ({
  lang,
  project,
  setProject,
  chatMessages,
  onNavigateToScouting,
  onNavigateToArchetypes,
}) => (
  <OntologyModeler
    lang={lang}
    project={project}
    setProject={setProject}
    chatMessages={chatMessages}
    onNavigateToScouting={onNavigateToScouting}
    onNavigateToArchetypes={onNavigateToArchetypes}
  />
);
