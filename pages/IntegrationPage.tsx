import React from 'react';
import SystemIntegration from '../components/SystemIntegration';
import type { ProjectState } from '../types';

interface IntegrationPageProps {
  project: ProjectState;
}

/**
 * 系统集成页面 (Phase 3: Integration)
 * 数据源对接规划和系统架构图
 */
export const IntegrationPage: React.FC<IntegrationPageProps> = ({ project }) => (
  <SystemIntegration project={project} />
);
