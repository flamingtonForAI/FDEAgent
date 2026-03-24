import React, { useMemo } from 'react';
import DeliverableGenerator from '../components/DeliverableGenerator';
import VersionHistory from '../components/VersionHistory';
import { runQualityCheck, checkActionThreeLayers, qualityRules } from '../utils/qualityChecker';
import type { ProjectState } from '../types';
import { Package, Boxes, Zap, Link2, Network, CheckCircle2, AlertTriangle, Minus, ArrowRight } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useProject } from '../contexts/ProjectContext';

interface DeliveryPageProps {
  project: ProjectState;
  onOpenQualityPanel?: () => void;
}

/**
 * 交付中心页面 (Phase 5: Deliver)
 * 设计完成度概览 + 质量摘要 + 嵌入式 DeliverableGenerator
 */
export const DeliveryPage: React.FC<DeliveryPageProps> = ({
  project,
  onOpenQualityPanel,
}) => {
  const { t } = useAppTranslation('delivery');
  const { activeProjectId } = useProject();

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
    { label: t('deliveryPage.objects'), value: stats.objects, icon: <Boxes size={18} />, color: 'var(--color-accent)' },
    { label: t('deliveryPage.actions'), value: stats.actions, icon: <Zap size={18} />, color: 'var(--color-warning)' },
    { label: t('deliveryPage.links'), value: stats.links, icon: <Link2 size={18} />, color: 'var(--color-success)' },
    { label: t('deliveryPage.integrations'), value: stats.integrations, icon: <Network size={18} />, color: 'var(--color-error)' },
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
              {t('deliveryPage.deliveryCenter')}
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
          {t('deliveryPage.designCompleteness')}
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
            <span style={{ color: 'var(--color-text-muted)' }}>{t('deliveryPage.rulesPassed')}</span>
          </div>

          <div className="w-px h-4" style={{ backgroundColor: 'var(--color-border)' }} />

          <div className="flex items-center gap-1.5 text-xs">
            {threeLayerReport.totalActions === 0 ? (
              <>
                <Minus size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>{t('deliveryPage.actionsNotStarted')}</span>
              </>
            ) : threeLayerReport.completeActions === threeLayerReport.totalActions ? (
              <>
                <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {threeLayerReport.completeActions}/{threeLayerReport.totalActions}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('deliveryPage.actionsComplete')}</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {threeLayerReport.completeActions}/{threeLayerReport.totalActions}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('deliveryPage.actionsComplete')}</span>
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
                {t('deliveryPage.viewDetails')}
                <ArrowRight size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Version History */}
      {activeProjectId && (
        <div className="px-6 pb-4">
          <VersionHistory projectId={activeProjectId} />
        </div>
      )}

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
            project={project}
            embedded
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;
