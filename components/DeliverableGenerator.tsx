import React, { useState, useMemo } from 'react';
import { Language, ProjectState, OntologyObject, AIPAction } from '../types';
import {
  FileText,
  Code,
  Database,
  Zap,
  Download,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileJson,
  FileCode,
  BookOpen,
  Cpu,
  Link2,
  Eye,
  X
} from 'lucide-react';

interface DeliverableGeneratorProps {
  lang: Language;
  project: ProjectState;
  onClose?: () => void;
}

type DeliverableType = 'api-spec' | 'data-model' | 'agent-tools' | 'brd' | 'integration';

interface DeliverableConfig {
  id: DeliverableType;
  title: { cn: string; en: string };
  description: { cn: string; en: string };
  icon: React.FC<any>;
  format: string;
  color: string;
}

const deliverableConfigs: DeliverableConfig[] = [
  {
    id: 'api-spec',
    title: { cn: 'API 规范', en: 'API Specification' },
    description: { cn: 'OpenAPI 3.0 格式的 REST API 定义', en: 'REST API definition in OpenAPI 3.0 format' },
    icon: FileCode,
    format: 'YAML',
    color: 'var(--color-success)'
  },
  {
    id: 'data-model',
    title: { cn: '数据模型文档', en: 'Data Model Document' },
    description: { cn: '完整的对象模型和关系定义', en: 'Complete object model and relationship definitions' },
    icon: Database,
    format: 'Markdown',
    color: 'var(--color-accent)'
  },
  {
    id: 'agent-tools',
    title: { cn: 'Agent Tool 规范', en: 'Agent Tool Specs' },
    description: { cn: 'AI Agent 可调用的工具定义', en: 'Tool definitions for AI Agent integration' },
    icon: Cpu,
    format: 'JSON',
    color: 'var(--color-warning)'
  },
  {
    id: 'brd',
    title: { cn: '业务需求文档', en: 'Business Requirements' },
    description: { cn: '业务场景、对象和操作的需求说明', en: 'Business scenarios, objects and operations requirements' },
    icon: BookOpen,
    format: 'Markdown',
    color: 'var(--color-accent-secondary, #a371f7)'
  },
  {
    id: 'integration',
    title: { cn: '集成指南', en: 'Integration Guide' },
    description: { cn: '数据源集成配置和同步规范', en: 'Data source integration config and sync specifications' },
    icon: Link2,
    format: 'Markdown',
    color: 'var(--color-error)'
  }
];

const translations = {
  cn: {
    title: '交付物生成器',
    subtitle: '一键生成各类技术文档',
    generate: '生成',
    download: '下载',
    copy: '复制',
    copied: '已复制',
    preview: '预览',
    close: '关闭',
    noData: '暂无数据可生成',
    selectType: '选择交付物类型',
    generating: '生成中...',
    generated: '已生成',
    tip: '基于当前 Ontology 设计自动生成文档'
  },
  en: {
    title: 'Deliverable Generator',
    subtitle: 'One-click generation of technical documents',
    generate: 'Generate',
    download: 'Download',
    copy: 'Copy',
    copied: 'Copied',
    preview: 'Preview',
    close: 'Close',
    noData: 'No data available for generation',
    selectType: 'Select deliverable type',
    generating: 'Generating...',
    generated: 'Generated',
    tip: 'Auto-generate documents based on current Ontology design'
  }
};

// Generate OpenAPI Specification
function generateAPISpec(project: ProjectState): string {
  const spec: any = {
    openapi: '3.0.3',
    info: {
      title: `${project.industry || 'Business'} Ontology API`,
      description: project.useCase || 'Auto-generated API from Ontology design',
      version: '1.0.0'
    },
    servers: [
      { url: 'https://api.example.com/v1', description: 'Production' },
      { url: 'https://api-staging.example.com/v1', description: 'Staging' }
    ],
    tags: project.objects.map(obj => ({
      name: obj.name,
      description: obj.description || `Operations for ${obj.name}`
    })),
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  };

  // Generate paths and schemas for each object
  // Decision-First: Only generate APIs for objects with defined Actions
  project.objects.forEach(obj => {
    const basePath = `/${obj.name.toLowerCase().replace(/\s+/g, '-')}s`;

    // Generate schema (always useful for reference)
    const properties: any = {};
    const required: string[] = ['id'];

    properties.id = { type: 'string', description: 'Unique identifier' };
    obj.properties?.forEach(prop => {
      properties[prop.name] = {
        type: mapPropertyType(prop.type),
        description: prop.logicDescription || prop.name
      };
      if (prop.name.toLowerCase().includes('id') || prop.name.toLowerCase().includes('name')) {
        required.push(prop.name);
      }
    });

    spec.components.schemas[obj.name] = {
      type: 'object',
      properties,
      required
    };

    // Decision-First: Skip API generation if no Actions defined
    // Only generate GET by ID for reference (read-only)
    if (!obj.actions || obj.actions.length === 0) {
      // Minimal read endpoint for reference only
      spec.paths[`${basePath}/{id}`] = {
        get: {
          tags: [obj.name],
          summary: `Get ${obj.name} by ID (read-only reference)`,
          operationId: `get${obj.name}ById`,
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${obj.name}` }
                }
              }
            },
            '404': { description: 'Not found' }
          }
        }
      };
      return; // Skip to next object - no CRUD, no action endpoints
    }

    // Generate action endpoints only (Decision-First approach)
    obj.actions?.forEach(action => {
      const actionPath = `${basePath}/{id}/actions/${action.name.toLowerCase().replace(/\s+/g, '-')}`;
      const il = action.implementationLayer;

      spec.paths[actionPath] = {
        post: {
          tags: [obj.name],
          summary: action.description || action.name,
          operationId: `${obj.name.toLowerCase()}${action.name}`,
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: action.logicLayer?.parameters?.length ? {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: Object.fromEntries(
                    (action.logicLayer.parameters || []).map(p => [
                      p.name,
                      { type: p.type, description: p.description }
                    ])
                  ),
                  required: (action.logicLayer.parameters || [])
                    .filter(p => p.required)
                    .map(p => p.name)
                }
              }
            }
          } : undefined,
          responses: {
            '200': { description: 'Action executed successfully' },
            '400': { description: 'Invalid request' },
            '403': { description: 'Permission denied' }
          },
          security: [{ bearerAuth: [] }]
        }
      };
    });
  });

  return formatYAML(spec);
}

// Generate Data Model Documentation
function generateDataModel(project: ProjectState, lang: Language): string {
  let md = `# ${lang === 'cn' ? '数据模型文档' : 'Data Model Document'}\n\n`;
  md += `> ${lang === 'cn' ? '生成时间' : 'Generated'}: ${new Date().toLocaleString()}\n\n`;

  if (project.industry) {
    md += `**${lang === 'cn' ? '行业' : 'Industry'}:** ${project.industry}\n\n`;
  }

  md += `## ${lang === 'cn' ? '对象模型' : 'Object Models'}\n\n`;

  project.objects.forEach((obj, idx) => {
    md += `### ${idx + 1}. ${obj.name}\n\n`;
    md += `${obj.description || (lang === 'cn' ? '_无描述_' : '_No description_')}\n\n`;

    if (obj.properties?.length) {
      md += `#### ${lang === 'cn' ? '属性' : 'Properties'}\n\n`;
      md += `| ${lang === 'cn' ? '名称' : 'Name'} | ${lang === 'cn' ? '类型' : 'Type'} | ${lang === 'cn' ? '说明' : 'Description'} |\n`;
      md += `|------|------|------|\n`;
      obj.properties.forEach(prop => {
        md += `| ${prop.name} | ${prop.type} | ${prop.logicDescription || '-'} |\n`;
      });
      md += '\n';
    }

    if (obj.actions?.length) {
      md += `#### ${lang === 'cn' ? '操作' : 'Actions'}\n\n`;
      obj.actions.forEach(action => {
        md += `- **${action.name}**: ${action.description || '-'}\n`;
        if (action.businessLayer?.executorRole) {
          md += `  - ${lang === 'cn' ? '执行角色' : 'Executor'}: ${action.businessLayer.executorRole}\n`;
        }
        if (action.governance?.permissionTier) {
          md += `  - ${lang === 'cn' ? '权限等级' : 'Permission Tier'}: Tier ${action.governance.permissionTier}\n`;
        }
      });
      md += '\n';
    }
  });

  if (project.links?.length) {
    md += `## ${lang === 'cn' ? '对象关系' : 'Relationships'}\n\n`;
    md += `| ${lang === 'cn' ? '源对象' : 'Source'} | ${lang === 'cn' ? '关系' : 'Relationship'} | ${lang === 'cn' ? '目标对象' : 'Target'} |\n`;
    md += `|------|------|------|\n`;
    project.links.forEach(link => {
      const source = project.objects.find(o => o.id === link.source)?.name || link.source;
      const target = project.objects.find(o => o.id === link.target)?.name || link.target;
      md += `| ${source} | ${link.label || '-'} | ${target} |\n`;
    });
    md += '\n';
  }

  return md;
}

// Generate Agent Tool Specifications
function generateAgentTools(project: ProjectState): string {
  const tools: any[] = [];

  project.objects.forEach(obj => {
    obj.actions?.forEach(action => {
      const tool: any = {
        name: `${obj.name.toLowerCase()}_${action.name.toLowerCase().replace(/\s+/g, '_')}`,
        description: action.description || `${action.name} for ${obj.name}`,
        parameters: {
          type: 'object',
          properties: {
            [`${obj.name.toLowerCase()}_id`]: {
              type: 'string',
              description: `The ID of the ${obj.name} to operate on`
            }
          },
          required: [`${obj.name.toLowerCase()}_id`]
        }
      };

      // Add action parameters
      action.logicLayer?.parameters?.forEach(param => {
        tool.parameters.properties[param.name] = {
          type: param.type,
          description: param.description
        };
        if (param.required) {
          tool.parameters.required.push(param.name);
        }
      });

      // Add metadata
      tool.metadata = {
        targetObject: obj.name,
        actionType: action.type,
        permissionTier: action.governance?.permissionTier || 1,
        requiresApproval: action.governance?.requiresHumanApproval || false
      };

      // Add preconditions as tool hints
      if (action.logicLayer?.preconditions?.length) {
        tool.preconditions = action.logicLayer.preconditions;
      }

      tools.push(tool);
    });
  });

  return JSON.stringify({ tools }, null, 2);
}

// Generate Business Requirements Document
function generateBRD(project: ProjectState, lang: Language): string {
  let md = `# ${lang === 'cn' ? '业务需求文档 (BRD)' : 'Business Requirements Document (BRD)'}\n\n`;
  md += `> ${lang === 'cn' ? '生成时间' : 'Generated'}: ${new Date().toLocaleString()}\n\n`;

  md += `## 1. ${lang === 'cn' ? '项目概述' : 'Project Overview'}\n\n`;
  md += `**${lang === 'cn' ? '行业' : 'Industry'}:** ${project.industry || (lang === 'cn' ? '待定义' : 'TBD')}\n\n`;
  md += `**${lang === 'cn' ? '用例' : 'Use Case'}:** ${project.useCase || (lang === 'cn' ? '待定义' : 'TBD')}\n\n`;

  md += `## 2. ${lang === 'cn' ? '业务对象' : 'Business Objects'}\n\n`;
  md += lang === 'cn'
    ? '以下是系统需要管理的核心业务实体：\n\n'
    : 'The following are core business entities to be managed:\n\n';

  project.objects.forEach((obj, idx) => {
    md += `### 2.${idx + 1} ${obj.name}\n\n`;
    md += `**${lang === 'cn' ? '业务定义' : 'Business Definition'}:**\n`;
    md += `${obj.description || (lang === 'cn' ? '待补充' : 'TBD')}\n\n`;

    if (obj.properties?.length) {
      md += `**${lang === 'cn' ? '关键属性' : 'Key Attributes'}:**\n`;
      obj.properties.slice(0, 5).forEach(prop => {
        md += `- ${prop.name}${prop.logicDescription ? `: ${prop.logicDescription}` : ''}\n`;
      });
      if (obj.properties.length > 5) {
        md += `- ... ${lang === 'cn' ? `及其他 ${obj.properties.length - 5} 个属性` : `and ${obj.properties.length - 5} more`}\n`;
      }
      md += '\n';
    }
  });

  md += `## 3. ${lang === 'cn' ? '业务操作' : 'Business Operations'}\n\n`;

  project.objects.forEach(obj => {
    if (!obj.actions?.length) return;

    md += `### ${obj.name} ${lang === 'cn' ? '操作' : 'Operations'}\n\n`;
    obj.actions.forEach(action => {
      md += `#### ${action.name}\n\n`;
      md += `- **${lang === 'cn' ? '描述' : 'Description'}:** ${action.description || '-'}\n`;
      if (action.businessLayer?.executorRole) {
        md += `- **${lang === 'cn' ? '执行角色' : 'Executor Role'}:** ${action.businessLayer.executorRole}\n`;
      }
      if (action.businessLayer?.triggerCondition) {
        md += `- **${lang === 'cn' ? '触发条件' : 'Trigger Condition'}:** ${action.businessLayer.triggerCondition}\n`;
      }
      if (action.governance?.requiresHumanApproval) {
        md += `- **${lang === 'cn' ? '审批要求' : 'Approval Required'}:** ${lang === 'cn' ? '是' : 'Yes'}\n`;
      }
      md += '\n';
    });
  });

  if (project.integrations?.length) {
    md += `## 4. ${lang === 'cn' ? '系统集成' : 'System Integration'}\n\n`;
    project.integrations.forEach(int => {
      md += `### ${int.systemName}\n`;
      md += `- **${lang === 'cn' ? '集成方式' : 'Integration Method'}:** ${int.mechanism || '-'}\n`;
      md += `- **${lang === 'cn' ? '数据点' : 'Data Points'}:** ${int.dataPoints?.join(', ') || '-'}\n\n`;
    });
  }

  return md;
}

// Generate Integration Guide
function generateIntegrationGuide(project: ProjectState, lang: Language): string {
  let md = `# ${lang === 'cn' ? '集成指南' : 'Integration Guide'}\n\n`;
  md += `> ${lang === 'cn' ? '生成时间' : 'Generated'}: ${new Date().toLocaleString()}\n\n`;

  md += `## ${lang === 'cn' ? '概述' : 'Overview'}\n\n`;
  md += lang === 'cn'
    ? '本文档描述了 Ontology 系统与外部数据源的集成配置。\n\n'
    : 'This document describes the integration configuration between the Ontology system and external data sources.\n\n';

  if (project.integrations?.length) {
    md += `## ${lang === 'cn' ? '数据源集成' : 'Data Source Integrations'}\n\n`;

    project.integrations.forEach((int, idx) => {
      const targetObj = project.objects.find(o => o.id === int.targetObjectId);

      md += `### ${idx + 1}. ${int.systemName}\n\n`;
      md += `**${lang === 'cn' ? '目标对象' : 'Target Object'}:** ${targetObj?.name || int.targetObjectId}\n\n`;
      md += `**${lang === 'cn' ? '集成方式' : 'Integration Method'}:** ${int.mechanism || 'API'}\n\n`;

      if (int.dataPoints?.length) {
        md += `**${lang === 'cn' ? '同步字段' : 'Sync Fields'}:**\n`;
        int.dataPoints.forEach(dp => {
          md += `- ${dp}\n`;
        });
        md += '\n';
      }

      md += `**${lang === 'cn' ? '配置示例' : 'Configuration Example'}:**\n\n`;
      md += '```json\n';
      md += JSON.stringify({
        source: int.systemName,
        target: targetObj?.name || int.targetObjectId,
        mechanism: int.mechanism || 'API',
        syncConfig: {
          frequency: 'realtime',
          conflictResolution: 'source_wins',
          fields: int.dataPoints || []
        }
      }, null, 2);
      md += '\n```\n\n';
    });
  } else {
    md += lang === 'cn'
      ? '_尚未定义数据源集成_\n\n'
      : '_No data source integrations defined_\n\n';
  }

  md += `## ${lang === 'cn' ? 'API 端点' : 'API Endpoints'}\n\n`;
  md += lang === 'cn'
    ? '以下是可用于集成的主要 API 端点：\n\n'
    : 'The following are main API endpoints available for integration:\n\n';

  project.objects.forEach(obj => {
    const basePath = `/api/v1/${obj.name.toLowerCase().replace(/\s+/g, '-')}s`;
    md += `### ${obj.name}\n\n`;
    md += `| Method | Endpoint | Description |\n`;
    md += `|--------|----------|-------------|\n`;
    md += `| GET | ${basePath} | List all |\n`;
    md += `| GET | ${basePath}/{id} | Get by ID |\n`;
    md += `| POST | ${basePath} | Create |\n`;
    md += `| PUT | ${basePath}/{id} | Update |\n`;
    md += `| DELETE | ${basePath}/{id} | Delete |\n`;

    obj.actions?.forEach(action => {
      const actionPath = `${basePath}/{id}/actions/${action.name.toLowerCase().replace(/\s+/g, '-')}`;
      md += `| POST | ${actionPath} | ${action.description || action.name} |\n`;
    });
    md += '\n';
  });

  return md;
}

// Helper functions
function mapPropertyType(type: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    integer: 'integer',
    boolean: 'boolean',
    date: 'string',
    datetime: 'string',
    array: 'array',
    object: 'object'
  };
  return typeMap[type.toLowerCase()] || 'string';
}

function formatYAML(obj: any, indent = 0): string {
  const spaces = '  '.repeat(indent);
  let yaml = '';

  if (Array.isArray(obj)) {
    obj.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        yaml += `${spaces}-\n${formatYAML(item, indent + 1).replace(/^/, spaces + '  ').slice(spaces.length + 2)}`;
      } else {
        yaml += `${spaces}- ${item}\n`;
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      if (value === undefined) return;
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
          yaml += `${spaces}${key}: []\n`;
        } else if (Object.keys(value).length === 0) {
          yaml += `${spaces}${key}: {}\n`;
        } else {
          yaml += `${spaces}${key}:\n${formatYAML(value, indent + 1)}`;
        }
      } else if (typeof value === 'string' && (value.includes('\n') || value.includes(':'))) {
        yaml += `${spaces}${key}: "${value.replace(/"/g, '\\"')}"\n`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    });
  }

  return yaml;
}

const DeliverableGenerator: React.FC<DeliverableGeneratorProps> = ({
  lang,
  project,
  onClose
}) => {
  const t = translations[lang];
  const [selectedType, setSelectedType] = useState<DeliverableType | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const hasData = project.objects.length > 0;

  const handleGenerate = (type: DeliverableType) => {
    setSelectedType(type);
    let content = '';

    switch (type) {
      case 'api-spec':
        content = generateAPISpec(project);
        break;
      case 'data-model':
        content = generateDataModel(project, lang);
        break;
      case 'agent-tools':
        content = generateAgentTools(project);
        break;
      case 'brd':
        content = generateBRD(project, lang);
        break;
      case 'integration':
        content = generateIntegrationGuide(project, lang);
        break;
    }

    setGeneratedContent(content);
    setShowPreview(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const config = deliverableConfigs.find(c => c.id === selectedType);
    if (!config) return;

    const ext = config.format === 'YAML' ? 'yaml' : config.format === 'JSON' ? 'json' : 'md';
    const mimeType = config.format === 'JSON' ? 'application/json' : 'text/plain';

    const blob = new Blob([generatedContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="rounded-xl overflow-hidden h-full flex flex-col"
      style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(var(--color-accent-rgb, 88, 166, 255), 0.15)' }}
          >
            <FileText className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t.title}
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {t.subtitle}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--color-bg-hover)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>{t.noData}</p>
          </div>
        </div>
      ) : showPreview ? (
        <>
          {/* Preview header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 rounded hover:bg-[var(--color-bg-hover)]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {deliverableConfigs.find(c => c.id === selectedType)?.title[lang]}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}
              >
                {deliverableConfigs.find(c => c.id === selectedType)?.format}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{
                  backgroundColor: copied ? 'rgba(var(--color-success-rgb, 63, 185, 80), 0.15)' : 'var(--color-bg-hover)',
                  color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)'
                }}
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t.copied : t.copy}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
              >
                <Download className="w-3.5 h-3.5" />
                {t.download}
              </button>
            </div>
          </div>

          {/* Preview content */}
          <div className="flex-1 overflow-auto p-4">
            <pre
              className="text-xs p-4 rounded-lg overflow-auto"
              style={{
                backgroundColor: 'var(--color-bg-base)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-mono, monospace)'
              }}
            >
              {generatedContent}
            </pre>
          </div>
        </>
      ) : (
        <>
          {/* Deliverable type selection */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid gap-3">
              {deliverableConfigs.map(config => {
                const Icon = config.icon;
                return (
                  <button
                    key={config.id}
                    onClick={() => handleGenerate(config.id)}
                    className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-hover)]"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {config.title[lang]}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-muted)' }}
                        >
                          {config.format}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {config.description[lang]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: config.color }}>
                      <span className="text-xs font-medium">{t.generate}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer tip */}
          <div
            className="px-4 py-2 text-xs border-t"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <FileText className="inline w-3 h-3 mr-1" />
            {t.tip}
          </div>
        </>
      )}
    </div>
  );
};

export default DeliverableGenerator;
