/**
 * ArtifactExporter - Multi-format export for ontology artifacts
 *
 * Supports exporting to:
 * - Markdown (documentation)
 * - JSON (data interchange)
 * - HTML (standalone report)
 * - Mermaid diagram (visual)
 * - Integration Draft (comprehensive document)
 */

import React, { useState } from 'react';
import { Language, ProjectState } from '../types';
import {
  Download,
  FileText,
  FileJson,
  FileCode,
  Image,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Copy,
  CheckCircle2,
  Loader2,
  BookOpen
} from 'lucide-react';
import { generateIntegrationDraft, exportDraftToMarkdown, IntegrationDraft } from '../lib/integrationDraftGenerator';
import { loadAuditLog, getChangeSummary, formatChangeForDisplay } from '../lib/changeAuditTracker';

type ExportFormat = 'markdown' | 'json' | 'html' | 'mermaid' | 'integration-draft';

interface ArtifactExporterProps {
  lang: Language;
  project: ProjectState;
  onClose?: () => void;
}

const translations = {
  en: {
    title: 'Export Artifacts',
    subtitle: 'Download your ontology design in various formats',
    formats: 'Export Formats',
    markdown: 'Markdown',
    markdownDesc: 'Documentation format, good for wikis',
    json: 'JSON',
    jsonDesc: 'Machine-readable data format',
    html: 'HTML Report',
    htmlDesc: 'Standalone viewable report',
    mermaid: 'Mermaid Diagram',
    mermaidDesc: 'Flowchart diagram code',
    integrationDraft: 'Integration Draft',
    integrationDraftDesc: 'Comprehensive implementation document',
    preview: 'Preview',
    download: 'Download',
    copy: 'Copy to Clipboard',
    copied: 'Copied!',
    generating: 'Generating...',
    includeChangelog: 'Include Change History',
    recentChanges: 'Recent Changes',
    noChanges: 'No changes recorded',
    close: 'Close'
  },
  cn: {
    title: '导出 Artifacts',
    subtitle: '以多种格式下载您的 Ontology 设计',
    formats: '导出格式',
    markdown: 'Markdown',
    markdownDesc: '文档格式，适合 Wiki',
    json: 'JSON',
    jsonDesc: '机器可读数据格式',
    html: 'HTML 报告',
    htmlDesc: '独立可查看的报告',
    mermaid: 'Mermaid 图表',
    mermaidDesc: '流程图代码',
    integrationDraft: '集成草案',
    integrationDraftDesc: '完整的实施文档',
    preview: '预览',
    download: '下载',
    copy: '复制到剪贴板',
    copied: '已复制！',
    generating: '生成中...',
    includeChangelog: '包含变更历史',
    recentChanges: '最近变更',
    noChanges: '暂无变更记录',
    close: '关闭'
  }
};

const ArtifactExporter: React.FC<ArtifactExporterProps> = ({
  lang,
  project,
  onClose
}) => {
  const t = translations[lang];
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [includeChangelog, setIncludeChangelog] = useState(false);
  const [integrationDraft, setIntegrationDraft] = useState<IntegrationDraft | null>(null);

  const formats: Array<{
    id: ExportFormat;
    icon: React.FC<any>;
    label: string;
    desc: string;
    extension: string;
    mimeType: string;
  }> = [
    { id: 'markdown', icon: FileText, label: t.markdown, desc: t.markdownDesc, extension: 'md', mimeType: 'text/markdown' },
    { id: 'json', icon: FileJson, label: t.json, desc: t.jsonDesc, extension: 'json', mimeType: 'application/json' },
    { id: 'html', icon: FileCode, label: t.html, desc: t.htmlDesc, extension: 'html', mimeType: 'text/html' },
    { id: 'mermaid', icon: Image, label: t.mermaid, desc: t.mermaidDesc, extension: 'mmd', mimeType: 'text/plain' },
    { id: 'integration-draft', icon: BookOpen, label: t.integrationDraft, desc: t.integrationDraftDesc, extension: 'md', mimeType: 'text/markdown' }
  ];

  // Generate content based on format
  const generateContent = (format: ExportFormat): string => {
    switch (format) {
      case 'markdown':
        return generateMarkdown();
      case 'json':
        return generateJSON();
      case 'html':
        return generateHTML();
      case 'mermaid':
        return generateMermaid();
      case 'integration-draft':
        const draft = generateIntegrationDraft(project, lang);
        setIntegrationDraft(draft);
        return exportDraftToMarkdown(draft, lang);
      default:
        return '';
    }
  };

  // Generate Markdown format
  const generateMarkdown = (): string => {
    let md = `# Ontology Design Document\n\n`;
    md += `> Generated: ${new Date().toLocaleString()}\n\n`;

    // Summary
    const totalActions = project.objects.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0);
    md += `## Summary\n\n`;
    md += `- **Objects**: ${project.objects.length}\n`;
    md += `- **Actions**: ${totalActions}\n`;
    md += `- **Relationships**: ${project.links.length}\n`;
    md += `- **Integrations**: ${project.integrations?.length || 0}\n\n`;

    // Objects
    md += `## Objects\n\n`;
    project.objects.forEach(obj => {
      md += `### ${obj.name}\n\n`;
      if (obj.description) md += `${obj.description}\n\n`;

      if (obj.properties && obj.properties.length > 0) {
        md += `**Properties:**\n\n`;
        md += `| Name | Type | Description |\n|------|------|-------------|\n`;
        obj.properties.forEach(p => {
          md += `| ${p.name} | ${p.type} | ${p.description || '-'} |\n`;
        });
        md += '\n';
      }

      if (obj.actions && obj.actions.length > 0) {
        md += `**Actions:**\n\n`;
        obj.actions.forEach(action => {
          md += `- **${action.name}**: ${action.description || '-'}\n`;
        });
        md += '\n';
      }

      if (obj.aiFeatures && obj.aiFeatures.length > 0) {
        md += `**AI Features:**\n\n`;
        obj.aiFeatures.forEach(ai => {
          md += `- ${ai.name || ai.type}: ${ai.description || '-'}\n`;
        });
        md += '\n';
      }
    });

    // Relationships
    if (project.links.length > 0) {
      md += `## Relationships\n\n`;
      project.links.forEach(link => {
        const source = project.objects.find(o => o.id === link.source || o.id === link.sourceId)?.name || link.source;
        const target = project.objects.find(o => o.id === link.target || o.id === link.targetId)?.name || link.target;
        md += `- **${source}** → **${target}**: ${link.label || link.type || '-'}\n`;
      });
      md += '\n';
    }

    // Integrations
    if ((project.integrations?.length || 0) > 0) {
      md += `## External Integrations\n\n`;
      project.integrations!.forEach(int => {
        md += `### ${int.systemName}\n\n`;
        md += `- **Mechanism**: ${int.mechanism}\n`;
        md += `- **Data Points**: ${int.dataPoints?.join(', ') || '-'}\n\n`;
      });
    }

    // Change history
    if (includeChangelog) {
      const log = loadAuditLog();
      const recentChanges = log.changes.slice(-20);
      if (recentChanges.length > 0) {
        md += `## Change History\n\n`;
        recentChanges.reverse().forEach(change => {
          md += `- ${formatChangeForDisplay(change, lang)}\n`;
        });
      }
    }

    return md;
  };

  // Generate JSON format
  const generateJSON = (): string => {
    const exportData = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      project: {
        objects: project.objects,
        links: project.links,
        integrations: project.integrations || []
      },
      metadata: {
        objectCount: project.objects.length,
        actionCount: project.objects.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0),
        linkCount: project.links.length,
        integrationCount: project.integrations?.length || 0
      }
    };

    if (includeChangelog) {
      const log = loadAuditLog();
      (exportData as any).changelog = log.changes.slice(-50);
    }

    return JSON.stringify(exportData, null, 2);
  };

  // Generate HTML format
  const generateHTML = (): string => {
    const totalActions = project.objects.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0);

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ontology Design Report</title>
  <style>
    :root {
      --bg: #0a0a0f;
      --surface: #12121a;
      --border: #2a2a3a;
      --text: #e4e4e7;
      --muted: #71717a;
      --accent: #f59e0b;
      --success: #22c55e;
      --info: #3b82f6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 2rem;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; color: var(--accent); }
    h3 { font-size: 1.125rem; margin: 1.5rem 0 0.5rem; }
    p { color: var(--muted); margin-bottom: 1rem; }
    .meta { font-size: 0.875rem; color: var(--muted); margin-bottom: 2rem; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1rem;
      text-align: center;
    }
    .stat-value { font-size: 2rem; font-weight: 600; color: var(--accent); }
    .stat-label { font-size: 0.75rem; color: var(--muted); text-transform: uppercase; }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .card-title { font-weight: 600; margin-bottom: 0.5rem; }
    .card-desc { font-size: 0.875rem; color: var(--muted); }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 0.875rem;
    }
    th, td {
      text-align: left;
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
    }
    th { color: var(--muted); font-weight: 500; }
    .tag {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      background: var(--border);
      border-radius: 0.25rem;
      font-size: 0.75rem;
      margin-right: 0.5rem;
    }
    .link-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      font-size: 0.875rem;
    }
    .link-arrow { color: var(--accent); }
  </style>
</head>
<body>
  <div class="container">
    <h1>Ontology Design Report</h1>
    <p class="meta">Generated: ${new Date().toLocaleString()}</p>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${project.objects.length}</div>
        <div class="stat-label">Objects</div>
      </div>
      <div class="stat">
        <div class="stat-value">${totalActions}</div>
        <div class="stat-label">Actions</div>
      </div>
      <div class="stat">
        <div class="stat-value">${project.links.length}</div>
        <div class="stat-label">Relationships</div>
      </div>
      <div class="stat">
        <div class="stat-value">${project.integrations?.length || 0}</div>
        <div class="stat-label">Integrations</div>
      </div>
    </div>

    <h2>Objects</h2>
    ${project.objects.map(obj => `
      <div class="card">
        <div class="card-title">${obj.name}</div>
        ${obj.description ? `<div class="card-desc">${obj.description}</div>` : ''}
        ${obj.properties && obj.properties.length > 0 ? `
          <table>
            <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
            <tbody>
              ${obj.properties.map(p => `<tr><td>${p.name}</td><td><span class="tag">${p.type}</span></td><td>${p.description || '-'}</td></tr>`).join('')}
            </tbody>
          </table>
        ` : ''}
        ${obj.actions && obj.actions.length > 0 ? `
          <h4 style="margin-top: 1rem; font-size: 0.875rem; color: var(--success);">Actions</h4>
          ${obj.actions.map(a => `<div style="font-size: 0.875rem; padding: 0.25rem 0;"><strong>${a.name}</strong>: ${a.description || '-'}</div>`).join('')}
        ` : ''}
      </div>
    `).join('')}

    ${project.links.length > 0 ? `
      <h2>Relationships</h2>
      <div class="card">
        ${project.links.map(link => {
          const source = project.objects.find(o => o.id === link.source || o.id === link.sourceId)?.name || link.source;
          const target = project.objects.find(o => o.id === link.target || o.id === link.targetId)?.name || link.target;
          return `<div class="link-item"><strong>${source}</strong> <span class="link-arrow">→</span> <strong>${target}</strong> <span class="tag">${link.label || link.type || '-'}</span></div>`;
        }).join('')}
      </div>
    ` : ''}

    ${(project.integrations?.length || 0) > 0 ? `
      <h2>External Integrations</h2>
      ${project.integrations!.map(int => `
        <div class="card">
          <div class="card-title">${int.systemName}</div>
          <div class="card-desc">Mechanism: ${int.mechanism}</div>
          <div style="margin-top: 0.5rem;">
            ${int.dataPoints?.map(dp => `<span class="tag">${dp}</span>`).join('') || ''}
          </div>
        </div>
      `).join('')}
    ` : ''}
  </div>
</body>
</html>`;
  };

  // Generate Mermaid diagram
  const generateMermaid = (): string => {
    let diagram = 'flowchart LR\n';

    // Style definitions
    diagram += '    classDef object fill:#f59e0b,stroke:#d97706,color:#000\n';
    diagram += '    classDef external fill:#3b82f6,stroke:#2563eb,color:#fff\n\n';

    // Objects as nodes
    project.objects.forEach(obj => {
      const nodeId = obj.name.replace(/\s+/g, '_').toLowerCase();
      diagram += `    ${nodeId}["${obj.name}"]\n`;
    });

    diagram += '\n';

    // Links as edges
    project.links.forEach(link => {
      const source = project.objects.find(o => o.id === link.source || o.id === link.sourceId);
      const target = project.objects.find(o => o.id === link.target || o.id === link.targetId);
      if (source && target) {
        const sourceId = source.name.replace(/\s+/g, '_').toLowerCase();
        const targetId = target.name.replace(/\s+/g, '_').toLowerCase();
        const label = link.label || link.type || '';
        diagram += `    ${sourceId} -->|${label}| ${targetId}\n`;
      }
    });

    // External integrations
    project.integrations?.forEach((int, i) => {
      const intId = `ext_${i}`;
      diagram += `    ${intId}[/"${int.systemName}"/]:::external\n`;
      if (project.objects.length > 0) {
        const firstObj = project.objects[0].name.replace(/\s+/g, '_').toLowerCase();
        diagram += `    ${intId} -.->|${int.mechanism || 'sync'}| ${firstObj}\n`;
      }
    });

    // Apply styles
    diagram += '\n';
    project.objects.forEach(obj => {
      const nodeId = obj.name.replace(/\s+/g, '_').toLowerCase();
      diagram += `    class ${nodeId} object\n`;
    });

    return diagram;
  };

  const handlePreview = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const content = generateContent(selectedFormat);
      setPreviewContent(content);
      setShowPreview(true);
      setIsGenerating(false);
    }, 100);
  };

  const handleDownload = () => {
    const content = generateContent(selectedFormat);
    const format = formats.find(f => f.id === selectedFormat)!;
    const blob = new Blob([content], { type: format.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ontology-${selectedFormat}-${Date.now()}.${format.extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)'
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div>
          <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {t.title}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {t.subtitle}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.close}
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Format Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
            {t.formats}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {formats.map(format => (
              <button
                key={format.id}
                onClick={() => {
                  setSelectedFormat(format.id);
                  setShowPreview(false);
                }}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedFormat === format.id ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-surface)]' : ''
                }`}
                style={{
                  backgroundColor: selectedFormat === format.id ? 'var(--color-accent)15' : 'var(--color-bg-elevated)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: selectedFormat === format.id ? 'var(--color-accent)' : 'var(--color-border)',
                  ringColor: 'var(--color-accent)'
                }}
              >
                <format.icon
                  size={20}
                  style={{ color: selectedFormat === format.id ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                />
                <div
                  className="text-sm font-medium mt-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {format.label}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {format.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeChangelog}
              onChange={(e) => setIncludeChangelog(e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {t.includeChangelog}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handlePreview}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t.generating}
              </>
            ) : (
              <>
                <FileCheck size={16} />
                {t.preview}
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#fff'
            }}
          >
            <Download size={16} />
            {t.download}
          </button>
        </div>

        {/* Preview */}
        {showPreview && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t.preview}
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors hover:bg-white/10"
                style={{ color: copied ? 'var(--color-success)' : 'var(--color-text-muted)' }}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={12} />
                    {t.copied}
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    {t.copy}
                  </>
                )}
              </button>
            </div>
            <pre
              className="p-4 rounded-lg overflow-auto max-h-96 text-xs"
              style={{
                backgroundColor: 'var(--color-bg-base)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)'
              }}
            >
              {previewContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactExporter;
