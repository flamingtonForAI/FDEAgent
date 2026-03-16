import React from 'react';
import ProjectDashboard from '../components/ProjectDashboard';

interface DiscoveryPageProps {
  onOpenProject: () => void;
}

/**
 * 发现阶段页面
 * 包含：项目管理、快速开始、学习中心、模板浏览
 */
export const ProjectsPage: React.FC<DiscoveryPageProps> = ({ onOpenProject }) => (
  <ProjectDashboard onOpenProject={onOpenProject} />
);
