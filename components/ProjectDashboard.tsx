/**
 * Project Dashboard Component
 * 项目工作台组件
 *
 * 展示项目列表，支持创建、切换、删除项目
 */

import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { useProject } from '../contexts/ProjectContext';
import {
  FolderOpen, Plus, Search, Trash2, Clock, Package,
  GitBranch, Layers, Zap, MoreVertical, Star, Edit2,
  ArrowRight, AlertCircle
} from 'lucide-react';
import NewProjectDialog from './NewProjectDialog';

interface Props {
  lang: Language;
  onOpenProject?: () => void;
}

const translations = {
  en: {
    title: 'My Projects',
    subtitle: 'Manage your ontology design projects',
    newProject: 'New Project',
    search: 'Search projects...',
    noProjects: 'No projects yet',
    noProjectsHint: 'Create your first project to get started',
    createFirst: 'Create First Project',
    open: 'Open',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this project?',
    lastModified: 'Last modified',
    objects: 'Objects',
    links: 'Links',
    actions: 'Actions',
    completeness: 'Completeness',
    basedOn: 'Based on',
    draft: 'Draft',
    active: 'Active',
    archived: 'Archived',
    completed: 'Completed',
    current: 'Current',
    emptySearch: 'No projects match your search',
  },
  cn: {
    title: '我的项目',
    subtitle: '管理你的本体设计项目',
    newProject: '新建项目',
    search: '搜索项目...',
    noProjects: '暂无项目',
    noProjectsHint: '创建你的第一个项目开始设计',
    createFirst: '创建第一个项目',
    open: '打开',
    delete: '删除',
    deleteConfirm: '确定要删除这个项目吗？',
    lastModified: '最后修改',
    objects: '对象',
    links: '链接',
    actions: '动作',
    completeness: '完成度',
    basedOn: '基于模板',
    draft: '草稿',
    active: '活跃',
    archived: '已归档',
    completed: '已完成',
    current: '当前',
    emptySearch: '没有匹配的项目',
  }
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  archived: 'bg-yellow-500',
  completed: 'bg-blue-500',
};

export default function ProjectDashboard({ lang, onOpenProject }: Props) {
  const t = translations[lang];
  const {
    projects,
    activeProjectId,
    switchProject,
    deleteProject,
    isLoading
  } = useProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.industry.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return lang === 'cn' ? '刚刚' : 'just now';
    if (diffMins < 60) return lang === 'cn' ? `${diffMins}分钟前` : `${diffMins}m ago`;
    if (diffHours < 24) return lang === 'cn' ? `${diffHours}小时前` : `${diffHours}h ago`;
    if (diffDays < 7) return lang === 'cn' ? `${diffDays}天前` : `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleOpenProject = async (projectId: string) => {
    await switchProject(projectId);
    onOpenProject?.();
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
    setDeleteConfirmId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="text-blue-500" />
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setShowNewDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          {t.newProject}
        </button>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <FolderOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            {t.noProjects}
          </h3>
          <p className="text-sm text-gray-500 mb-6">{t.noProjectsHint}</p>
          <button
            onClick={() => setShowNewDialog(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            {t.createFirst}
          </button>
        </div>
      )}

      {/* Search Empty State */}
      {projects.length > 0 && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto text-gray-400 mb-4" size={32} />
          <p className="text-gray-500">{t.emptySearch}</p>
        </div>
      )}

      {/* Project Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => {
          const isActive = project.id === activeProjectId;
          return (
            <div
              key={project.id}
              className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                isActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
              }`}
              onClick={() => handleOpenProject(project.id)}
            >
              {/* Current Badge */}
              {isActive && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1">
                  <Star size={10} fill="currentColor" />
                  {t.current}
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <span className={`w-2 h-2 rounded-full ${statusColors[project.status]}`} />
                  <span className="text-xs text-gray-500">
                    {t[project.status as keyof typeof t]}
                  </span>
                </div>
              </div>

              {/* Industry & Template */}
              <div className="flex flex-wrap gap-2 mb-3">
                {project.industry && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                    {project.industry}
                  </span>
                )}
                {project.baseArchetypeName && (
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded flex items-center gap-1">
                    <Package size={10} />
                    {t.basedOn}: {project.baseArchetypeName}
                  </span>
                )}
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{t.completeness}</span>
                  <span>{project.progress.completeness}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${project.progress.completeness}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <Layers size={12} />
                  {project.progress.objectCount} {t.objects}
                </span>
                <span className="flex items-center gap-1">
                  <GitBranch size={12} />
                  {project.progress.linkCount} {t.links}
                </span>
                <span className="flex items-center gap-1">
                  <Zap size={12} />
                  {project.progress.actionCount} {t.actions}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  {formatRelativeTime(project.updatedAt)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(project.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title={t.delete}
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProject(project.id);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {t.open}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirmId === project.id && (
                <div
                  className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 rounded-xl flex flex-col items-center justify-center p-4 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AlertCircle className="text-red-500 mb-2" size={32} />
                  <p className="text-sm text-center mb-4">{t.deleteConfirm}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-4 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Project Dialog */}
      {showNewDialog && (
        <NewProjectDialog
          lang={lang}
          onClose={() => setShowNewDialog(false)}
          onCreated={() => {
            setShowNewDialog(false);
            onOpenProject?.();
          }}
        />
      )}
    </div>
  );
}
