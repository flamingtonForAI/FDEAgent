import React, { useMemo } from 'react';
import DeliverableGenerator from '../components/DeliverableGenerator';
import { runQualityCheck, checkActionThreeLayers, qualityRules } from '../utils/qualityChecker';
import type { ProjectState, Language } from '../types';
import { Package, Boxes, Zap, Link2, Network, CheckCircle2, AlertTriangle, Minus, ArrowRight } from 'lucide-react';

interface DeliveryPageProps {
  lang: Language;
  project: ProjectState;
  onOpenQualityPanel?: () => void;
}

const translations = {
  en: {
    deliveryCenter: 'Delivery Center',
    designCompleteness: 'Design Completeness',
    qualitySummary: 'Quality Summary',
    rulesPassed: 'rules passed',
    actionsComplete: 'actions with complete 3-layer',
    actionsNotStarted: 'No actions defined yet',
    viewDetails: 'View Details',
    objects: 'Objects',
    actions: 'Actions',
    links: 'Links',
    integrations: 'Integrations',
  },
  cn: {
    deliveryCenter: '交付中心',
    designCompleteness: '设计完成度',
    qualitySummary: '质量摘要',
    rulesPassed: '条规则通过',
    actionsComplete: '个动作三层完整',
    actionsNotStarted: '尚未定义动作',
    viewDetails: '查看详情',
    objects: '对象',
    actions: '动作',
    links: '关联',
    integrations: '集成',
  }
};

/**
 * 交付中心页面 (Phase 5: Deliver)
 * 设计完成度概览 + 质量摘要 + 嵌入式 DeliverableGenerator
 */
export const DeliveryPage: React.FC<DeliveryPageProps> = ({
  lang,
  project,
  onOpenQualityPanel,
}) => {
  const t = translations[lang];

  // Compute stats
  const stats = useMemo(() => {
    const totalActions = project.objects.reduce(
      (sum, obj) => sum + (obj.actions?.length || 0), 0
    );
    return {
      objects: project.objects.length,
      actions: totalActions,
      links: project.links.length,
      integrations: project.integrations.length,
    };
  }, [project]);

  // Quality report
  const qualityReport = useMemo(() => runQualityCheck(project), [project]);
  const threeLayerReport = useMemo(() => checkActionThreeLayers(project), [project]);

  const statCards: { label: string; value: number; icon: React.ReactNode; color: string }[] = [
    { label: t.objects, value: stats.objects, icon: <Boxes size={18} />, color: 'var(--color-accent)' },
    { label: t.actions, value: stats.actions, icon: <Zap size={18} />, color: 'var(--color-warning)' },
    { label: t.links, value: stats.links, icon: <Link2 size={18} />, color: 'var(--color-success)' },
    { label: t.integrations, value: stats.integrations, icon: <Network size={18} />, color: 'var(--color-error)' },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Page Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(var(--color-accent-rgb, 88, 166, 255), 0.15)' }}
          >
            <Package size={18} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {t.deliveryCenter}
            </h1>
            {(project.projectName || project.industry) && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {[project.projectName, project.industry].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Design Completeness Cards */}
      <div className="px-6 pb-4">
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          {t.designCompleteness}
        </p>
        <div className="grid grid-cols-4 gap-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg p-3 text-center"
              style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-elevated)',
              }}
            >
              <div className="flex justify-center mb-1.5" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {card.value}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Summary Bar */}
      <div className="px-6 pb-4">
        <div
          className="rounded-lg px-4 py-3 flex items-center gap-4 flex-wrap"
          style={{
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-elevated)',
          }}
        >
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle2
              size={14}
              style={{ color: qualityReport.passed === qualityRules.length ? 'var(--color-success)' : 'var(--color-warning)' }}
            />
            <span style={{ color: 'var(--color-text-primary)' }}>
              {qualityReport.passed}/{qualityRules.length}
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>{t.rulesPassed}</span>
          </div>

          <div className="w-px h-4" style={{ backgroundColor: 'var(--color-border)' }} />

          <div className="flex items-center gap-1.5 text-xs">
            {threeLayerReport.totalActions === 0 ? (
              <>
                <Minus size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>{t.actionsNotStarted}</span>
              </>
            ) : threeLayerReport.completeActions === threeLayerReport.totalActions ? (
              <>
                <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {threeLayerReport.completeActions}/{threeLayerReport.totalActions}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>{t.actionsComplete}</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {threeLayerReport.completeActions}/{threeLayerReport.totalActions}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>{t.actionsComplete}</span>
              </>
            )}
          </div>

          {onOpenQualityPanel && (
            <>
              <div className="flex-1" />
              <button
                onClick={onOpenQualityPanel}
                className="flex items-center gap-1 text-xs hover:underline"
                style={{ color: 'var(--color-accent)' }}
              >
                {t.viewDetails}
                <ArrowRight size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Embedded DeliverableGenerator */}
      <div className="flex-1 px-6 pb-6 min-h-0">
        <div
          className="h-full rounded-xl overflow-hidden"
          style={{
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-elevated)',
          }}
        >
          <DeliverableGenerator
            lang={lang}
            project={project}
            embedded
          />
        </div>
      </div>
    </div>
  );
};
