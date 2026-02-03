import React, { useState } from 'react';
import { Package, Link2, Zap, Plus, ChevronRight } from 'lucide-react';
import { ProjectState, Language, OntologyObject, AIPAction } from '../types';

interface OntologyDashboardProps {
  project: ProjectState;
  lang: Language;
  onAddObject: () => void;
  onAddLink: () => void;
  onAddAction: () => void;
}

const translations = {
  en: {
    objects: 'Objects',
    links: 'Links',
    actions: 'Actions',
    readiness: 'Readiness',
    addObj: 'Add Object',
    addLink: 'Add Link',
    addAction: 'Add Action',
  },
  cn: {
    objects: '对象',
    links: '关系',
    actions: '动作',
    readiness: '准备度',
    addObj: '添加对象',
    addLink: '添加关系',
    addAction: '添加动作',
  }
};

// 计算准备度分数
function calculateReadiness(project: ProjectState): number {
  let score = 0;

  // Objects: 40分
  if (project.objects.length >= 1) score += 15;
  if (project.objects.length >= 3) score += 15;
  if (project.objects.some(o => o.properties?.length > 0)) score += 10;

  // Links: 20分
  if (project.links.length >= 1) score += 10;
  if (project.links.length >= 2) score += 10;

  // Actions: 40分
  const allActions = project.objects.flatMap(o => o.actions || []);
  if (allActions.length >= 1) score += 15;
  if (allActions.length >= 3) score += 15;
  if (allActions.some(a => a.businessLayer)) score += 10;

  return Math.min(score, 100);
}

// 获取所有 Actions
function getAllActions(objects: OntologyObject[]): { action: AIPAction; objectName: string }[] {
  const result: { action: AIPAction; objectName: string }[] = [];
  objects.forEach(obj => {
    (obj.actions || []).forEach(action => {
      result.push({ action, objectName: obj.name });
    });
  });
  return result;
}

const OntologyDashboard: React.FC<OntologyDashboardProps> = ({
  project,
  lang,
  onAddObject,
  onAddLink,
  onAddAction,
}) => {
  const t = translations[lang];
  const readiness = calculateReadiness(project);
  const allActions = getAllActions(project.objects);
  const [expandedSection, setExpandedSection] = useState<'objects' | 'links' | 'actions' | null>(null);

  // 准备度颜色
  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 50) return 'var(--color-accent)';
    if (score >= 30) return 'var(--color-warning, #d29922)';
    return 'var(--color-error)';
  };

  const toggleSection = (section: 'objects' | 'links' | 'actions') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 text-xs"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Objects */}
      <div className="relative">
        <button
          onClick={() => toggleSection('objects')}
          className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors hover:bg-[var(--color-bg-hover)]"
          style={{
            backgroundColor: expandedSection === 'objects' ? 'var(--color-bg-hover)' : 'transparent'
          }}
        >
          <Package size={13} style={{ color: 'var(--color-accent)' }} />
          <span className="text-muted">{t.objects}</span>
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              backgroundColor: 'rgba(var(--color-accent-rgb, 88, 166, 255), 0.15)',
              color: 'var(--color-accent)'
            }}
          >
            {project.objects.length}
          </span>
          <ChevronRight
            size={12}
            className="text-muted transition-transform"
            style={{ transform: expandedSection === 'objects' ? 'rotate(90deg)' : 'none' }}
          />
        </button>
        {expandedSection === 'objects' && (
          <div
            className="absolute left-0 top-full mt-1 z-20 min-w-[160px] rounded-lg shadow-lg p-2"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)'
            }}
          >
            {project.objects.length === 0 ? (
              <div className="text-xs text-muted px-2 py-1">{lang === 'cn' ? '暂无对象' : 'No objects'}</div>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {project.objects.map((obj, idx) => (
                  <div
                    key={obj.id || idx}
                    className="text-xs px-2 py-1 rounded truncate"
                    style={{ color: 'var(--color-text-secondary)' }}
                    title={obj.description || obj.name}
                  >
                    {obj.name}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onAddObject(); setExpandedSection(null); }}
              className="w-full mt-1 flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-[var(--color-bg-hover)]"
              style={{ color: 'var(--color-accent)' }}
            >
              <Plus size={12} />
              {t.addObj}
            </button>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="relative">
        <button
          onClick={() => toggleSection('links')}
          className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors hover:bg-[var(--color-bg-hover)]"
          style={{
            backgroundColor: expandedSection === 'links' ? 'var(--color-bg-hover)' : 'transparent'
          }}
        >
          <Link2 size={13} style={{ color: 'var(--color-success)' }} />
          <span className="text-muted">{t.links}</span>
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              backgroundColor: 'rgba(63, 185, 80, 0.15)',
              color: 'var(--color-success)'
            }}
          >
            {project.links.length}
          </span>
          <ChevronRight
            size={12}
            className="text-muted transition-transform"
            style={{ transform: expandedSection === 'links' ? 'rotate(90deg)' : 'none' }}
          />
        </button>
        {expandedSection === 'links' && (
          <div
            className="absolute left-0 top-full mt-1 z-20 min-w-[180px] rounded-lg shadow-lg p-2"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)'
            }}
          >
            {project.links.length === 0 ? (
              <div className="text-xs text-muted px-2 py-1">{lang === 'cn' ? '暂无关系' : 'No links'}</div>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {project.links.map((link, idx) => (
                  <div
                    key={link.id || idx}
                    className="text-xs px-2 py-1 rounded truncate"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {link.source} → {link.target}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onAddLink(); setExpandedSection(null); }}
              disabled={project.objects.length < 2}
              className="w-full mt-1 flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-[var(--color-bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--color-success)' }}
            >
              <Plus size={12} />
              {t.addLink}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="relative">
        <button
          onClick={() => toggleSection('actions')}
          className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors hover:bg-[var(--color-bg-hover)]"
          style={{
            backgroundColor: expandedSection === 'actions' ? 'var(--color-bg-hover)' : 'transparent'
          }}
        >
          <Zap size={13} style={{ color: 'var(--color-warning, #d29922)' }} />
          <span className="text-muted">{t.actions}</span>
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              backgroundColor: 'rgba(210, 153, 34, 0.15)',
              color: 'var(--color-warning, #d29922)'
            }}
          >
            {allActions.length}
          </span>
          <ChevronRight
            size={12}
            className="text-muted transition-transform"
            style={{ transform: expandedSection === 'actions' ? 'rotate(90deg)' : 'none' }}
          />
        </button>
        {expandedSection === 'actions' && (
          <div
            className="absolute left-0 top-full mt-1 z-20 min-w-[160px] rounded-lg shadow-lg p-2"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)'
            }}
          >
            {allActions.length === 0 ? (
              <div className="text-xs text-muted px-2 py-1">{lang === 'cn' ? '暂无动作' : 'No actions'}</div>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {allActions.map(({ action, objectName }, idx) => (
                  <div
                    key={idx}
                    className="text-xs px-2 py-1 rounded truncate"
                    style={{ color: 'var(--color-text-secondary)' }}
                    title={`${objectName}.${action.name}`}
                  >
                    {action.name}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onAddAction(); setExpandedSection(null); }}
              disabled={project.objects.length === 0}
              className="w-full mt-1 flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-[var(--color-bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--color-warning, #d29922)' }}
            >
              <Plus size={12} />
              {t.addAction}
            </button>
          </div>
        )}
      </div>

      {/* 分隔符 */}
      <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />

      {/* 准备度 */}
      <div className="flex items-center gap-2">
        <span className="text-muted">{t.readiness}</span>
        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${readiness}%`,
              backgroundColor: getReadinessColor(readiness)
            }}
          />
        </div>
        <span style={{ color: getReadinessColor(readiness) }}>{readiness}%</span>
      </div>

      {/* 点击外部关闭下拉菜单 */}
      {expandedSection && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setExpandedSection(null)}
        />
      )}
    </div>
  );
};

export default OntologyDashboard;
