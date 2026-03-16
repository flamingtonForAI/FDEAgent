
import React, { useState } from 'react';
import { ProjectState } from '../types';
import { ShieldCheck, Layers, FileJson, Download, Terminal, FileText, History, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import ArtifactExporter from './ArtifactExporter';
import ChangeHistoryPanel from './ChangeHistoryPanel';
import { generateIntegrationDraft, exportDraftToMarkdown, IntegrationDraft } from '../lib/integrationDraftGenerator';

interface Props {
  project: ProjectState;
}

const ProjectOverview: React.FC<Props> = ({ project }) => {
  const { t, lang } = useAppTranslation('integration');
  const [showExporter, setShowExporter] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [integrationDraft, setIntegrationDraft] = useState<IntegrationDraft | null>(null);
  const [showDraft, setShowDraft] = useState(false);

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ontology_system_design.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleGenerateDraft = () => {
    const draft = generateIntegrationDraft(project, lang);
    setIntegrationDraft(draft);
    setShowDraft(true);
  };

  const handleDownloadDraft = () => {
    if (!integrationDraft) return;
    const markdown = exportDraftToMarkdown(integrationDraft, lang);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-draft-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getComplexityLabel = (complexity: 'low' | 'medium' | 'high') => {
    const labels = { low: t('projectOverview.low'), medium: t('projectOverview.medium'), high: t('projectOverview.high') };
    return labels[complexity];
  };

  const getComplexityColor = (complexity: 'low' | 'medium' | 'high') => {
    const colors = { low: 'var(--color-success)', medium: 'var(--color-warning)', high: 'var(--color-error)' };
    return colors[complexity];
  };

  return (
    <div className="p-8 pb-24 h-full bg-[var(--color-bg-elevated)] space-y-12 overflow-y-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>{t('projectOverview.title')}</h2>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs font-bold uppercase" style={{ backgroundColor: 'var(--color-bg-hover)', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}>
               <ShieldCheck size={14} /> {t('projectOverview.validated')}
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs font-bold uppercase" style={{ backgroundColor: 'var(--color-bg-hover)', borderColor: 'var(--color-accent-secondary)', color: 'var(--color-accent-secondary)' }}>
               <Layers size={14} /> {t('projectOverview.hybrid')}
             </div>
          </div>
        </div>
        <button
          onClick={downloadJSON}
          className="px-6 py-3 rounded-xl flex items-center gap-3 transition-all border"
          style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        >
          <Download size={18} />
          {t('projectOverview.export')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
          <h3 className="text-muted text-xs font-mono uppercase tracking-widest mb-4">{t('projectOverview.orchestration')}</h3>
          <div className="p-4 rounded-xl border font-medium text-sm" style={{ backgroundColor: 'var(--color-bg-hover)', borderColor: 'var(--color-accent-secondary)', color: 'var(--color-accent-secondary)' }}>
            Model-Agnostic Decision Layer
            <p className="text-micro text-muted mt-1 uppercase font-mono">{t('projectOverview.orchestrationSub')}</p>
          </div>
        </div>
        <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
          <h3 className="text-muted text-xs font-mono uppercase tracking-widest mb-4">{t('projectOverview.ontology')}</h3>
          <div className="p-4 rounded-xl border font-medium text-sm" style={{ backgroundColor: 'var(--color-bg-hover)', borderColor: 'var(--color-accent-secondary)', color: 'var(--color-accent-secondary)' }}>
            {project.objects.length} Entities & {project.links.length} Relations
            <p className="text-micro text-muted mt-1 uppercase font-mono">{t('projectOverview.ontologySub')}</p>
          </div>
        </div>
        <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
          <h3 className="text-muted text-xs font-mono uppercase tracking-widest mb-4">{t('projectOverview.operational')}</h3>
          <div className="p-4 rounded-xl border font-medium text-sm" style={{ backgroundColor: 'var(--color-bg-hover)', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
            {project.objects.reduce((acc, obj) => acc + (obj.actions?.length || 0), 0)} Augmented Workflows
            <p className="text-micro text-muted mt-1 uppercase font-mono">{t('projectOverview.operationalSub')}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--color-bg-surface)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3 mb-6">
          <Terminal size={20} style={{ color: 'var(--color-accent-secondary)' }} />
          <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('projectOverview.definition')}</h3>
        </div>
        <div className="p-6 rounded-xl font-mono text-xs overflow-x-auto max-h-96" style={{ backgroundColor: 'var(--color-bg-base)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)' }}>
          <pre style={{ color: 'var(--color-accent-secondary)' }}>
            {JSON.stringify(project, null, 2)}
          </pre>
        </div>
      </div>

      {/* Phase 3: Tools Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Integration Draft Generator */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)20', color: 'var(--color-accent)' }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t('projectOverview.integrationDraft')}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t('projectOverview.integrationDraftDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateDraft}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
          >
            {t('projectOverview.generateDraft')}
          </button>
        </div>

        {/* Export Artifacts */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-info)20', color: 'var(--color-info)' }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t('projectOverview.exportArtifacts')}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t('projectOverview.exportArtifactsDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowExporter(true)}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-info)', color: '#fff' }}
          >
            {t('projectOverview.exportArtifacts')}
          </button>
        </div>

        {/* Change History */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-success)20', color: 'var(--color-success)' }}
            >
              <History size={20} />
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t('projectOverview.changeHistory')}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t('projectOverview.changeHistoryDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}
          >
            {showHistory ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {t('projectOverview.changeHistory')}
          </button>
        </div>
      </div>

      {/* Integration Draft Preview */}
      {showDraft && integrationDraft && (
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen size={20} style={{ color: 'var(--color-accent)' }} />
              <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {integrationDraft.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${getComplexityColor(integrationDraft.summary.estimatedComplexity)}20`,
                  color: getComplexityColor(integrationDraft.summary.estimatedComplexity)
                }}
              >
                {t('projectOverview.complexity')}: {getComplexityLabel(integrationDraft.summary.estimatedComplexity)}
              </span>
              <button
                onClick={handleDownloadDraft}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
              >
                <Download size={14} />
                {t('projectOverview.downloadDraft')}
              </button>
              <button
                onClick={() => setShowDraft(false)}
                className="px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/10"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Objects', value: integrationDraft.summary.totalObjects, color: 'var(--color-accent)' },
              { label: 'Actions', value: integrationDraft.summary.totalActions, color: 'var(--color-success)' },
              { label: 'Links', value: integrationDraft.summary.totalLinks, color: 'var(--color-warning)' },
              { label: 'Integrations', value: integrationDraft.summary.totalIntegrations, color: 'var(--color-info)' }
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: 'var(--color-bg-elevated)' }}
              >
                <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Implementation Phases */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
              {t('projectOverview.phases')}
            </h4>
            <div className="space-y-2">
              {integrationDraft.implementationRoadmap.map(phase => (
                <div
                  key={phase.phase}
                  className="p-3 rounded-lg flex items-center gap-4"
                  style={{ backgroundColor: 'var(--color-bg-elevated)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
                  >
                    {phase.phase}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {phase.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {phase.deliverables.length} deliverables
                    </div>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      backgroundColor: phase.priority === 'critical' ? 'var(--color-error)20' :
                                      phase.priority === 'high' ? 'var(--color-warning)20' : 'var(--color-bg-surface)',
                      color: phase.priority === 'critical' ? 'var(--color-error)' :
                             phase.priority === 'high' ? 'var(--color-warning)' : 'var(--color-text-muted)'
                    }}
                  >
                    {phase.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          {integrationDraft.risks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                {t('projectOverview.risks')}
              </h4>
              <div className="space-y-2">
                {integrationDraft.risks.map(risk => (
                  <div
                    key={risk.id}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg-elevated)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: risk.impact === 'high' ? 'var(--color-error)20' :
                                          risk.impact === 'medium' ? 'var(--color-warning)20' : 'var(--color-bg-surface)',
                          color: risk.impact === 'high' ? 'var(--color-error)' :
                                 risk.impact === 'medium' ? 'var(--color-warning)' : 'var(--color-text-muted)'
                        }}
                      >
                        {risk.impact}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {risk.category}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {risk.description}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Mitigation: {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Change History Panel */}
      {showHistory && (
        <ChangeHistoryPanel lang={lang} />
      )}

      {/* Artifact Exporter Modal */}
      {showExporter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-auto">
            <ArtifactExporter
              lang={lang}
              project={project}
              onClose={() => setShowExporter(false)}
            />
          </div>
        </div>
      )}

      <div className="p-12 border-2 border-dashed rounded-3xl text-center" style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="text-xl font-light text-muted mb-6">{t('projectOverview.quote')}</h3>
        <p className="text-xs font-mono text-muted uppercase tracking-widest">{t('projectOverview.role')}</p>
      </div>
    </div>
  );
};

export default ProjectOverview;
