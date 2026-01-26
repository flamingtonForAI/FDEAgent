
import React, { useState, useMemo } from 'react';
import { Language, OntologyObject, AIPAction } from '../types';
import {
  generateObjectAPISpec,
  generateFullAPISpec,
  generateActionAPISpec,
  specToJSON,
  specToYAML,
  OpenAPISpec
} from '../utils/apiGenerator';
import { Code, Copy, Download, Check, FileJson, FileText, ChevronDown, ChevronRight, X } from 'lucide-react';

interface APISpecViewerProps {
  lang: Language;
  objects: OntologyObject[];
  selectedObjectId?: string;
  selectedAction?: AIPAction;
  onClose?: () => void;
}

const translations = {
  en: {
    title: 'OpenAPI Specification',
    subtitle: 'Auto-generated REST API spec',
    format: 'Format',
    json: 'JSON',
    yaml: 'YAML',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    noActions: 'No actions defined yet',
    selectAction: 'Select an action to generate API spec',
    fullSpec: 'Full API Spec',
    singleAction: 'Single Action',
    singleObject: 'Single Object',
    paths: 'Paths',
    schemas: 'Schemas',
    preview: 'Preview'
  },
  cn: {
    title: 'OpenAPI 规范',
    subtitle: '自动生成的 REST API 规范',
    format: '格式',
    json: 'JSON',
    yaml: 'YAML',
    copy: '复制',
    copied: '已复制!',
    download: '下载',
    noActions: '尚未定义动作',
    selectAction: '选择一个动作以生成 API 规范',
    fullSpec: '完整 API 规范',
    singleAction: '单个动作',
    singleObject: '单个对象',
    paths: '路径',
    schemas: '数据模型',
    preview: '预览'
  }
};

type ViewMode = 'full' | 'object' | 'action';
type Format = 'json' | 'yaml';

const APISpecViewer: React.FC<APISpecViewerProps> = ({
  lang,
  objects,
  selectedObjectId,
  selectedAction,
  onClose
}) => {
  const t = translations[lang];
  const [format, setFormat] = useState<Format>('json');
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['paths']));

  // Find selected object
  const selectedObject = useMemo(() => {
    return objects.find(o => o.id === selectedObjectId);
  }, [objects, selectedObjectId]);

  // Generate spec based on view mode
  const spec = useMemo<OpenAPISpec | null>(() => {
    if (viewMode === 'full') {
      const objectsWithActions = objects.filter(o => o.actions.length > 0);
      if (objectsWithActions.length === 0) return null;
      return generateFullAPISpec(objectsWithActions, 'Ontology API');
    }

    if (viewMode === 'object' && selectedObject) {
      if (selectedObject.actions.length === 0) return null;
      return generateObjectAPISpec(selectedObject);
    }

    if (viewMode === 'action' && selectedAction && selectedObject) {
      const { path, pathItem, schemas } = generateActionAPISpec(selectedAction, selectedObject.name);
      return {
        openapi: '3.0.3',
        info: {
          title: `${selectedAction.name} API`,
          version: '1.0.0',
          description: selectedAction.description
        },
        paths: { [path]: pathItem },
        components: {
          schemas,
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        }
      };
    }

    return null;
  }, [viewMode, objects, selectedObject, selectedAction]);

  // Format spec as string
  const specString = useMemo(() => {
    if (!spec) return '';
    return format === 'json' ? specToJSON(spec) : specToYAML(spec);
  }, [spec, format]);

  // Copy to clipboard
  const handleCopy = async () => {
    if (!specString) return;
    await navigator.clipboard.writeText(specString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download file
  const handleDownload = () => {
    if (!specString) return;
    const blob = new Blob([specString], { type: format === 'json' ? 'application/json' : 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-spec.${format === 'json' ? 'json' : 'yaml'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Check if we have any actions
  const hasActions = objects.some(o => o.actions.length > 0);

  return (
    <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Code size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">{t.title}</h3>
            <p className="text-xs text-muted">{t.subtitle}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
        {/* View Mode Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('full')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'full'
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-muted hover:text-primary'
            }`}
          >
            {t.fullSpec}
          </button>
          {selectedObject && (
            <button
              onClick={() => setViewMode('object')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'object'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-muted hover:text-primary'
              }`}
            >
              {t.singleObject}
            </button>
          )}
          {selectedAction && selectedObject && (
            <button
              onClick={() => setViewMode('action')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'action'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-muted hover:text-primary'
              }`}
            >
              {t.singleAction}
            </button>
          )}
        </div>

        {/* Format and Actions */}
        <div className="flex items-center gap-2">
          {/* Format Toggle */}
          <div className="flex items-center gap-1 glass-surface rounded-lg p-1">
            <button
              onClick={() => setFormat('json')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                format === 'json'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-muted hover:text-primary'
              }`}
            >
              <FileJson size={12} />
              {t.json}
            </button>
            <button
              onClick={() => setFormat('yaml')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                format === 'yaml'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-muted hover:text-primary'
              }`}
            >
              <FileText size={12} />
              {t.yaml}
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!specString}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass-surface text-muted hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? t.copied : t.copy}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!specString}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium btn-gradient disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Download size={12} />
            {t.download}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!hasActions ? (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            {t.noActions}
          </div>
        ) : !spec ? (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            {t.selectAction}
          </div>
        ) : (
          <div className="p-4">
            {/* Spec Preview Sections */}
            <div className="space-y-3">
              {/* Paths Section */}
              <div className="glass-surface rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('paths')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedSections.has('paths') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="text-sm font-medium text-white">{t.paths}</span>
                    <span className="text-xs text-muted">({Object.keys(spec.paths).length})</span>
                  </div>
                </button>
                {expandedSections.has('paths') && (
                  <div className="px-4 pb-4">
                    <div className="space-y-2">
                      {Object.entries(spec.paths).map(([path, item]) => (
                        <div key={path} className="glass-card rounded-lg p-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {Object.keys(item).filter(k => ['get', 'post', 'put', 'patch', 'delete'].includes(k)).map(method => (
                              <span
                                key={method}
                                className={`px-2 py-0.5 rounded text-micro font-bold uppercase ${
                                  method === 'get' ? 'bg-emerald-500/20 text-emerald-400' :
                                  method === 'post' ? 'bg-amber-500/20 text-amber-400' :
                                  method === 'put' ? 'bg-amber-500/20 text-amber-400' :
                                  method === 'patch' ? 'bg-purple-500/20 text-purple-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {method}
                              </span>
                            ))}
                            <code className="text-xs text-secondary font-mono">{path}</code>
                          </div>
                          {(item as any)[Object.keys(item)[0]]?.summary && (
                            <p className="text-xs text-muted mt-1.5">
                              {(item as any)[Object.keys(item)[0]].summary}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Schemas Section */}
              {spec.components?.schemas && Object.keys(spec.components.schemas).length > 0 && (
                <div className="glass-surface rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection('schemas')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.has('schemas') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="text-sm font-medium text-white">{t.schemas}</span>
                      <span className="text-xs text-muted">({Object.keys(spec.components.schemas).length})</span>
                    </div>
                  </button>
                  {expandedSections.has('schemas') && (
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(spec.components.schemas).map(schemaName => (
                          <span
                            key={schemaName}
                            className="px-2.5 py-1 bg-purple-500/15 text-purple-300 rounded-lg text-xs"
                          >
                            {schemaName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Raw Spec */}
              <div className="glass-surface rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('raw')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedSections.has('raw') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="text-sm font-medium text-white">{t.preview}</span>
                  </div>
                </button>
                {expandedSections.has('raw') && (
                  <div className="px-4 pb-4">
                    <pre className="bg-[var(--color-bg-base)]/30 rounded-lg p-4 overflow-x-auto text-xs text-secondary font-mono max-h-96">
                      {specString}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APISpecViewer;
