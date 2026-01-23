
import React, { useState, useMemo } from 'react';
import { Language, OntologyObject, AIPAction } from '../types';
import {
  generateToolSpec,
  generateAllToolSpecs,
  generateObjectToolSpecs,
  toolsToJSON,
  generateLangChainPython,
  generateOpenAITypeScript,
  ToolFormat,
  OpenAITool,
  LangChainTool
} from '../utils/toolGenerator';
import { Bot, Copy, Download, Check, ChevronDown, ChevronRight, X, Code, Shield } from 'lucide-react';

interface ToolSpecViewerProps {
  lang: Language;
  objects: OntologyObject[];
  selectedObjectId?: string;
  selectedAction?: AIPAction;
  onClose?: () => void;
}

const translations = {
  en: {
    title: 'Agent Tool Spec',
    subtitle: 'Auto-generated tool definitions for AI agents',
    format: 'Format',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    noActions: 'No actions defined yet',
    fullSpec: 'All Tools',
    singleAction: 'Single Tool',
    singleObject: 'Object Tools',
    tools: 'Tools',
    governance: 'Governance',
    preview: 'Preview',
    codeGen: 'Code Generation',
    pythonCode: 'Python (LangChain)',
    tsCode: 'TypeScript (OpenAI)',
    jsonSpec: 'JSON Spec',
    tier: 'Tier',
    approval: 'Approval',
    risk: 'Risk'
  },
  cn: {
    title: 'Agent Tool 规范',
    subtitle: '为 AI Agent 自动生成的工具定义',
    format: '格式',
    copy: '复制',
    copied: '已复制!',
    download: '下载',
    noActions: '尚未定义动作',
    fullSpec: '所有工具',
    singleAction: '单个工具',
    singleObject: '对象工具',
    tools: '工具',
    governance: '治理',
    preview: '预览',
    codeGen: '代码生成',
    pythonCode: 'Python (LangChain)',
    tsCode: 'TypeScript (OpenAI)',
    jsonSpec: 'JSON 规范',
    tier: '等级',
    approval: '审批',
    risk: '风险'
  }
};

type ViewMode = 'full' | 'object' | 'action';
type OutputMode = 'json' | 'python' | 'typescript';

const formatLabels: Record<ToolFormat, string> = {
  openai: 'OpenAI',
  langchain: 'LangChain',
  claude: 'Claude',
  mcp: 'MCP',
  universal: 'Universal'
};

const ToolSpecViewer: React.FC<ToolSpecViewerProps> = ({
  lang,
  objects,
  selectedObjectId,
  selectedAction,
  onClose
}) => {
  const t = translations[lang];
  const [format, setFormat] = useState<ToolFormat>('openai');
  const [outputMode, setOutputMode] = useState<OutputMode>('json');
  const [viewMode, setViewMode] = useState<ViewMode>('full');
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['tools']));

  // Find selected object
  const selectedObject = useMemo(() => {
    return objects.find(o => o.id === selectedObjectId);
  }, [objects, selectedObjectId]);

  // Generate tools based on view mode
  const tools = useMemo(() => {
    if (viewMode === 'full') {
      const objectsWithActions = objects.filter(o => o.actions.length > 0);
      if (objectsWithActions.length === 0) return [];
      return generateAllToolSpecs(objectsWithActions, format);
    }

    if (viewMode === 'object' && selectedObject) {
      if (selectedObject.actions.length === 0) return [];
      return generateObjectToolSpecs(selectedObject, format);
    }

    if (viewMode === 'action' && selectedAction && selectedObject) {
      return [generateToolSpec(selectedAction, selectedObject.name, format)];
    }

    return [];
  }, [viewMode, objects, selectedObject, selectedAction, format]);

  // Generate output string based on output mode
  const outputString = useMemo(() => {
    if (tools.length === 0) return '';

    if (outputMode === 'json') {
      return toolsToJSON(tools, format);
    }

    if (outputMode === 'python' && (format === 'langchain' || format === 'openai')) {
      // Convert to LangChain format for Python generation
      const lcTools = format === 'langchain'
        ? tools as LangChainTool[]
        : objects.flatMap(obj =>
            obj.actions.map(action => generateToolSpec(action, obj.name, 'langchain') as LangChainTool)
          );
      return generateLangChainPython(lcTools);
    }

    if (outputMode === 'typescript' && format === 'openai') {
      return generateOpenAITypeScript(tools as OpenAITool[]);
    }

    return toolsToJSON(tools, format);
  }, [tools, format, outputMode, objects]);

  // Copy to clipboard
  const handleCopy = async () => {
    if (!outputString) return;
    await navigator.clipboard.writeText(outputString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download file
  const handleDownload = () => {
    if (!outputString) return;

    let filename = 'agent-tools';
    let mimeType = 'application/json';

    if (outputMode === 'python') {
      filename += '.py';
      mimeType = 'text/x-python';
    } else if (outputMode === 'typescript') {
      filename += '.ts';
      mimeType = 'text/typescript';
    } else {
      filename += '.json';
    }

    const blob = new Blob([outputString], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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

  // Get tool name for display
  const getToolName = (tool: any): string => {
    if ('function' in tool) return tool.function.name;
    return tool.name;
  };

  // Get tool description for display
  const getToolDescription = (tool: any): string => {
    if ('function' in tool) return tool.function.description;
    return tool.description;
  };

  // Get tool parameter count
  const getParamCount = (tool: any): number => {
    if ('function' in tool) return Object.keys(tool.function.parameters.properties).length;
    if ('args_schema' in tool) return Object.keys(tool.args_schema.properties).length;
    if ('input_schema' in tool) return Object.keys(tool.input_schema.properties).length;
    if ('inputSchema' in tool) return Object.keys(tool.inputSchema.properties).length;
    if ('parameters' in tool) return tool.parameters.length;
    return 0;
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Bot size={20} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">{t.title}</h3>
            <p className="text-xs text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
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
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.fullSpec}
          </button>
          {selectedObject && (
            <button
              onClick={() => setViewMode('object')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'object'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white'
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
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.singleAction}
            </button>
          )}
        </div>

        {/* Format and Actions */}
        <div className="flex items-center gap-2">
          {/* Format Selector */}
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ToolFormat)}
            className="glass-surface rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            {Object.entries(formatLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Output Mode Toggle */}
          <div className="flex items-center gap-1 glass-surface rounded-lg p-1">
            <button
              onClick={() => setOutputMode('json')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                outputMode === 'json'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.jsonSpec}
            </button>
            <button
              onClick={() => setOutputMode('python')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                outputMode === 'python'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Python
            </button>
            {format === 'openai' && (
              <button
                onClick={() => setOutputMode('typescript')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  outputMode === 'typescript'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                TypeScript
              </button>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!outputString}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass-surface text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? t.copied : t.copy}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={!outputString}
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
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            {t.noActions}
          </div>
        ) : tools.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            {t.noActions}
          </div>
        ) : (
          <div className="p-4">
            {/* Spec Preview Sections */}
            <div className="space-y-3">
              {/* Tools Section */}
              <div className="glass-surface rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('tools')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedSections.has('tools') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="text-sm font-medium text-white">{t.tools}</span>
                    <span className="text-xs text-gray-500">({tools.length})</span>
                  </div>
                </button>
                {expandedSections.has('tools') && (
                  <div className="px-4 pb-4">
                    <div className="space-y-2">
                      {tools.map((tool, index) => (
                        <div key={index} className="glass-card rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-sm text-cyan-300 font-mono">
                                  {getToolName(tool)}
                                </code>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400">
                                  {getParamCount(tool)} params
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                                {getToolDescription(tool)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Governance Info */}
              {format === 'langchain' && (
                <div className="glass-surface rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection('governance')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.has('governance') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <Shield size={14} className="text-orange-400" />
                      <span className="text-sm font-medium text-white">{t.governance}</span>
                    </div>
                  </button>
                  {expandedSections.has('governance') && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        {(tools as LangChainTool[]).filter(tool => tool.metadata).map((tool, index) => (
                          <div key={index} className="glass-card rounded-lg p-2.5">
                            <div className="font-mono text-cyan-300 text-[11px] mb-1.5 truncate">
                              {tool.name}
                            </div>
                            <div className="space-y-1 text-gray-400">
                              {tool.metadata?.permission_tier && (
                                <div className="flex justify-between">
                                  <span>{t.tier}:</span>
                                  <span className="text-white">{tool.metadata.permission_tier}</span>
                                </div>
                              )}
                              {tool.metadata?.requires_human_approval !== undefined && (
                                <div className="flex justify-between">
                                  <span>{t.approval}:</span>
                                  <span className={tool.metadata.requires_human_approval ? 'text-amber-400' : 'text-emerald-400'}>
                                    {tool.metadata.requires_human_approval ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              )}
                              {tool.metadata?.risk_level && (
                                <div className="flex justify-between">
                                  <span>{t.risk}:</span>
                                  <span className={
                                    tool.metadata.risk_level === 'high' ? 'text-red-400' :
                                    tool.metadata.risk_level === 'medium' ? 'text-amber-400' :
                                    'text-emerald-400'
                                  }>
                                    {tool.metadata.risk_level}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Code Preview */}
              <div className="glass-surface rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('code')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedSections.has('code') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Code size={14} className="text-purple-400" />
                    <span className="text-sm font-medium text-white">
                      {outputMode === 'json' ? t.preview : t.codeGen}
                    </span>
                  </div>
                </button>
                {expandedSections.has('code') && (
                  <div className="px-4 pb-4">
                    <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto text-xs text-gray-300 font-mono max-h-96">
                      {outputString}
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

export default ToolSpecViewer;
