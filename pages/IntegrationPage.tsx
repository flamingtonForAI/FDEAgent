import React from 'react';
import SystemIntegration from '../components/SystemIntegration';
import type { ProjectState } from '../types';

interface IntegrationPageProps {
  project: ProjectState;
  setProject: (update: ProjectState | ((prev: ProjectState) => ProjectState)) => void;
  lang?: string;
}

/**
 * 系统集成页面 (Phase 3: Integration)
 * 数据源对接规划和系统架构图
 */
export const IntegrationPage: React.FC<IntegrationPageProps> = ({ project, setProject }) => (
  <SystemIntegration project={project} setProject={setProject} />
);
