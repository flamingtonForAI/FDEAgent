import React from 'react';
import QuickStart from '../components/QuickStart';
import type { ProjectState } from '../types';

type WorkflowTab = 'projects' | 'quickStart' | 'academy' | 'archetypes' | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aip' | 'overview' | 'aiEnhancement';

interface QuickStartPageProps {
  project: ProjectState;
  onNavigate: (tab: WorkflowTab) => void;
}

/**
 * 快速开始页面
 * 新用户引导和项目创建向导
 */
export const QuickStartPage: React.FC<QuickStartPageProps> = ({ project, onNavigate }) => (
  <QuickStart project={project} onNavigate={onNavigate} />
);
