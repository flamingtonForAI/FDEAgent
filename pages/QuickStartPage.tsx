import React from 'react';
import { QuickStart } from '../components/QuickStart';
import type { ProjectState, Language } from '../types';

type WorkflowTab = 'projects' | 'quickStart' | 'academy' | 'archetypes' | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aip' | 'overview' | 'aiEnhancement';

interface QuickStartPageProps {
  lang: Language;
  project: ProjectState;
  onNavigate: (tab: WorkflowTab) => void;
}

/**
 * 快速开始页面
 * 新用户引导和项目创建向导
 */
export const QuickStartPage: React.FC<QuickStartPageProps> = ({ lang, project, onNavigate }) => (
  <QuickStart lang={lang} project={project} onNavigate={onNavigate} />
);
