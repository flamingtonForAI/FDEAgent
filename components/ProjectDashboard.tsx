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
  draft: 'var(--color-text-muted)',
  active: 'var(--color-success)',
  archived: 'var(--color-warning)',
  completed: 'var(--color-info)',
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
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <FolderOpen style={{ color: 'var(--color-accent)' }} />
            {t.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {t.subtitle}
          </p>
        </div>
        <button
          onClick={() => setShowNewDialog(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-bg-base)'
          }}
        >
          <Plus size={18} />
          {t.newProject}
        </button>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2"
            size={18}
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <div
          className="text-center py-16 rounded-xl border-2 border-dashed"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)'
          }}
        >
          <FolderOpen
            className="mx-auto mb-4"
            size={48}
            style={{ color: 'var(--color-text-muted)' }}
          />
          <h3
            className="text-lg font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.noProjects}
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            {t.noProjectsHint}
          </p>
          <button
            onClick={() => setShowNewDialog(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-bg-base)'
            }}
          >
            <Plus size={18} />
            {t.createFirst}
          </button>
        </div>
      )}

      {/* Search Empty State */}
      {projects.length > 0 && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Search
            className="mx-auto mb-4"
            size={32}
            style={{ color: 'var(--color-text-muted)' }}
          />
          <p style={{ color: 'var(--color-text-muted)' }}>{t.emptySearch}</p>
        </div>
      )}

      {/* Project Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => {
          const isActive = project.id === activeProjectId;
          return (
            <div
              key={project.id}
              className="relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg"
              style={{
                backgroundColor: isActive
                  ? 'var(--color-bg-elevated)'
                  : 'var(--color-bg-surface)',
                borderColor: isActive
                  ? 'var(--color-accent)'
                  : 'var(--color-border)',
              }}
              onClick={() => handleOpenProject(project.id)}
            >
              {/* Current Badge */}
              {isActive && (
                <div
                  className="absolute -top-2 -right-2 px-2 py-0.5 text-xs rounded-full flex items-center gap-1"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-bg-base)'
                  }}
                >
                  <Star size={10} fill="currentColor" />
                  {t.current}
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {project.name}
                  </h3>
                  {project.description && (
                    <p
                      className="text-sm truncate mt-0.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColors[project.status] }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {t[project.status as keyof typeof t]}
                  </span>
                </div>
              </div>

              {/* Industry & Template */}
              <div className="flex flex-wrap gap-2 mb-3">
                {project.industry && (
                  <span
                    className="px-2 py-0.5 text-xs rounded"
                    style={{
                      backgroundColor: 'var(--color-bg-hover)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    {project.industry}
                  </span>
                )}
                {project.baseArchetypeName && (
                  <span
                    className="px-2 py-0.5 text-xs rounded flex items-center gap-1"
                    style={{
                      backgroundColor: 'var(--color-accent-secondary)',
                      color: 'var(--color-bg-base)',
                      opacity: 0.9
                    }}
                  >
                    <Package size={10} />
                    {project.baseArchetypeName}
                  </span>
                )}
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div
                  className="flex justify-between text-xs mb-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <span>{t.completeness}</span>
                  <span>{project.progress.completeness}%</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--color-bg-hover)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${project.progress.completeness}%`,
                      backgroundColor: 'var(--color-accent)'
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div
                className="flex items-center gap-4 text-xs mb-3"
                style={{ color: 'var(--color-text-muted)' }}
              >
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
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <span
                  className="text-xs flex items-center gap-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Clock size={12} />
                  {formatRelativeTime(project.updatedAt)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(project.id);
                    }}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                    title={t.delete}
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProject(project.id);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-bg-base)'
                    }}
                  >
                    {t.open}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirmId === project.id && (
                <div
                  className="absolute inset-0 rounded-xl flex flex-col items-center justify-center p-4 z-10"
                  style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    opacity: 0.98
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <AlertCircle
                    className="mb-2"
                    size={32}
                    style={{ color: 'var(--color-error)' }}
                  />
                  <p
                    className="text-sm text-center mb-4"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {t.deleteConfirm}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-4 py-1.5 text-sm rounded transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {lang === 'cn' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-4 py-1.5 text-sm rounded transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: 'var(--color-error)',
                        color: '#fff'
                      }}
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
