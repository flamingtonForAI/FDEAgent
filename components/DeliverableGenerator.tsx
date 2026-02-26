import React, { useState, useMemo } from 'react';
import { Language, ProjectState, OntologyObject, AIPAction } from '../types';
import { runQualityCheck, checkActionThreeLayers } from '../utils/qualityChecker';
import YAML from 'yaml';
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
type ExportMode = 'draft' | 'client';

interface DeliveryBlocker {
  key: string;
  message: string;
}

interface ZipTextFile {
  name: string;
  content: string;
}

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
    tip: '基于当前 Ontology 设计自动生成文档',
    exportMode: '导出模式',
    draftMode: '内部草稿',
    clientMode: '客户交付',
    deliveryBlockedTitle: '客户交付模式未通过质量门槛',
    deliveryBlockedHint: '请先修复以下问题，再执行导出：',
    clientName: '客户名称',
    clientNamePlaceholder: '例如：某制造集团',
    designerName: '方案设计人',
    designerNamePlaceholder: '例如：FDE Team',
    deliveryVersion: '交付版本',
    releaseNotes: '版本变更摘要',
    releaseNotesPlaceholder: '例如：新增订单审批动作与ERP集成映射',
    downloadZip: '打包下载 ZIP'
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
    tip: 'Auto-generate documents based on current Ontology design',
    exportMode: 'Export Mode',
    draftMode: 'Internal Draft',
    clientMode: 'Client Delivery',
    deliveryBlockedTitle: 'Client delivery gate check failed',
    deliveryBlockedHint: 'Please resolve the following issues before export:',
    clientName: 'Client Name',
    clientNamePlaceholder: 'e.g. Acme Manufacturing',
    designerName: 'Designer',
    designerNamePlaceholder: 'e.g. FDE Team',
    deliveryVersion: 'Delivery Version',
    releaseNotes: 'Release Notes',
    releaseNotesPlaceholder: 'e.g. Added approval actions and ERP mapping',
    downloadZip: 'Download ZIP Package'
  }
};

const textEncoder = new TextEncoder();

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const toU16LE = (value: number): Uint8Array =>
  new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);

const toU32LE = (value: number): Uint8Array =>
  new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ]);

const concatBytes = (chunks: Uint8Array[]): Uint8Array => {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
};

const computeCRC32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

/** Minimal ZIP builder (store-only, no compression, no external deps).
 *  Limits: max 65535 files, max ~4GB per file. Sufficient for text deliverables. */
const buildZipBlob = (files: ZipTextFile[]): Blob => {
  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const fileNameBytes = textEncoder.encode(file.name);
    const fileDataBytes = textEncoder.encode(file.content);
    const crc32 = computeCRC32(fileDataBytes);

    const localHeader = concatBytes([
      toU32LE(0x04034b50),
      toU16LE(20), // version needed
      toU16LE(0),  // flags
      toU16LE(0),  // method: store
      toU16LE(0),  // mod time
      toU16LE(0),  // mod date
      toU32LE(crc32),
      toU32LE(fileDataBytes.length),
      toU32LE(fileDataBytes.length),
      toU16LE(fileNameBytes.length),
      toU16LE(0), // extra length
      fileNameBytes,
    ]);

    localChunks.push(localHeader, fileDataBytes);

    const centralHeader = concatBytes([
      toU32LE(0x02014b50),
      toU16LE(20), // version made by
      toU16LE(20), // version needed
      toU16LE(0),  // flags
      toU16LE(0),  // method
      toU16LE(0),  // mod time
      toU16LE(0),  // mod date
      toU32LE(crc32),
      toU32LE(fileDataBytes.length),
      toU32LE(fileDataBytes.length),
      toU16LE(fileNameBytes.length),
      toU16LE(0), // extra
      toU16LE(0), // comment
      toU16LE(0), // disk start
      toU16LE(0), // internal attrs
      toU32LE(0), // external attrs
      toU32LE(offset),
      fileNameBytes,
    ]);

    centralChunks.push(centralHeader);
    offset += localHeader.length + fileDataBytes.length;
  }

  const centralDirectory = concatBytes(centralChunks);
  const localData = concatBytes(localChunks);

  const endRecord = concatBytes([
    toU32LE(0x06054b50),
    toU16LE(0), // disk number
    toU16LE(0), // central disk
    toU16LE(files.length),
    toU16LE(files.length),
    toU32LE(centralDirectory.length),
    toU32LE(localData.length),
    toU16LE(0), // comment length
  ]);

  const zipBytes = concatBytes([localData, centralDirectory, endRecord]);
  return new Blob([zipBytes], { type: 'application/zip' });
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

  return YAML.stringify(spec);
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
  const [exportMode, setExportMode] = useState<ExportMode>('draft');
  const [deliveryBlockers, setDeliveryBlockers] = useState<DeliveryBlocker[]>([]);
  const [showDeliveryBlockers, setShowDeliveryBlockers] = useState(false);
  const [clientName, setClientName] = useState('');
  const [designerName, setDesignerName] = useState('');
  const [deliveryVersion, setDeliveryVersion] = useState('v1.0');
  const [releaseNotes, setReleaseNotes] = useState('');

  const hasData = project.objects.length > 0;

  const buildClientDeliveryBlockers = (): DeliveryBlocker[] => {
    const blockers: DeliveryBlocker[] = [];

    if (!clientName.trim()) {
      blockers.push({
        key: 'missing-client-name',
        message: lang === 'cn' ? '客户名称为必填项' : 'Client name is required',
      });
    }
    if (!designerName.trim()) {
      blockers.push({
        key: 'missing-designer-name',
        message: lang === 'cn' ? '方案设计人为必填项' : 'Designer name is required',
      });
    }

    const qualityReport = runQualityCheck(project);

    qualityReport.issues
      .filter(issue => issue.severity === 'error')
      .forEach((issue, idx) => {
        const target = issue.target?.name ? ` (${issue.target.name})` : '';
        blockers.push({
          key: `quality-error-${idx}`,
          message: `${issue.message[lang]}${target}`,
        });
      });

    const threeLayerReport = checkActionThreeLayers(project);
    threeLayerReport.actions
      .filter(action => action.overallStatus === 'minimal')
      .forEach((action, idx) => {
        blockers.push({
          key: `three-layer-minimal-${idx}`,
          message: lang === 'cn'
            ? `Action "${action.objectName}.${action.actionName}" 三层完整度低于 partial`
            : `Action "${action.objectName}.${action.actionName}" is below partial three-layer completeness`,
        });
      });

    return blockers;
  };

  const handleGenerate = (type: DeliverableType) => {
    setSelectedType(type);
    setShowDeliveryBlockers(false);

    if (exportMode === 'client') {
      const blockers = buildClientDeliveryBlockers();
      if (blockers.length > 0) {
        setDeliveryBlockers(blockers);
        setShowDeliveryBlockers(true);
        setGeneratedContent('');
        setShowPreview(false);
        return;
      }
      setDeliveryBlockers([]);
    }

    let content = '';
    switch (type) {
      case 'api-spec': content = generateAPISpec(project); break;
      case 'data-model': content = generateDataModel(project, lang); break;
      case 'agent-tools': content = generateAgentTools(project); break;
      case 'brd': content = generateBRD(project, lang); break;
      case 'integration': content = generateIntegrationGuide(project, lang); break;
    }

    setGeneratedContent(content);
    setShowPreview(true);
  };

  const buildCoverPage = (): string => {
    const now = new Date().toLocaleString();
    const totalActions = project.objects.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0);
    return lang === 'cn'
      ? `# 交付封面\n\n- 项目名称: ${project.projectName || '未命名项目'}\n- 客户名称: ${clientName || '待填写'}\n- 版本号: ${deliveryVersion || 'v1.0'}\n- 设计师: ${designerName || '待填写'}\n- 生成时间: ${now}\n\n## 交付摘要\n\n- 对象数: ${project.objects.length}\n- 动作数: ${totalActions}\n- 关系数: ${project.links.length}\n- 集成数: ${project.integrations.length}\n\n## 版本变更摘要\n\n${releaseNotes || '无'}\n`
      : `# Delivery Cover\n\n- Project: ${project.projectName || 'Untitled Project'}\n- Client: ${clientName || 'TBD'}\n- Version: ${deliveryVersion || 'v1.0'}\n- Designer: ${designerName || 'TBD'}\n- Generated At: ${now}\n\n## Summary\n\n- Objects: ${project.objects.length}\n- Actions: ${totalActions}\n- Links: ${project.links.length}\n- Integrations: ${project.integrations.length}\n\n## Release Notes\n\n${releaseNotes || 'N/A'}\n`;
  };

  const handleDownloadZip = () => {
    if (exportMode === 'client') {
      const blockers = buildClientDeliveryBlockers();
      if (blockers.length > 0) {
        setDeliveryBlockers(blockers);
        setShowDeliveryBlockers(true);
        return;
      }
    }

    const now = new Date().toISOString();
    const files: ZipTextFile[] = [
      ...(exportMode === 'client' ? [{ name: '00-cover.md', content: buildCoverPage() }] : []),
      { name: '01-api-spec.yaml', content: generateAPISpec(project) },
      { name: '02-data-model.md', content: generateDataModel(project, lang) },
      { name: '03-agent-tools.json', content: generateAgentTools(project) },
      { name: '04-brd.md', content: generateBRD(project, lang) },
      { name: '05-integration-guide.md', content: generateIntegrationGuide(project, lang) },
      {
        name: 'delivery-metadata.json',
        content: JSON.stringify({
          exportMode,
          projectName: project.projectName || '',
          clientName,
          designerName,
          deliveryVersion,
          releaseNotes,
          generatedAt: now,
        }, null, 2),
      },
    ];

    const zipBlob = buildZipBlob(files);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-package-${deliveryVersion || 'v1.0'}-${Date.now()}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  {t.exportMode}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setExportMode('draft')}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: exportMode === 'draft' ? 'var(--color-accent)' : 'var(--color-bg-hover)',
                      color: exportMode === 'draft' ? '#fff' : 'var(--color-text-secondary)',
                    }}
                  >
                    {t.draftMode}
                  </button>
                  <button
                    onClick={() => setExportMode('client')}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: exportMode === 'client' ? 'var(--color-warning)' : 'var(--color-bg-hover)',
                      color: exportMode === 'client' ? '#fff' : 'var(--color-text-secondary)',
                    }}
                  >
                    {t.clientMode}
                  </button>
                </div>
              </div>

              {exportMode === 'draft' && (
                <button
                  onClick={handleDownloadZip}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full"
                  style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  {t.downloadZip}
                </button>
              )}

              {exportMode === 'client' && (
              <div className="p-3 rounded-lg grid gap-2" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.clientName}</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={t.clientNamePlaceholder}
                  className="px-2 py-1.5 rounded text-xs"
                  style={{ backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.designerName}</label>
                <input
                  type="text"
                  value={designerName}
                  onChange={(e) => setDesignerName(e.target.value)}
                  placeholder={t.designerNamePlaceholder}
                  className="px-2 py-1.5 rounded text-xs"
                  style={{ backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.deliveryVersion}</label>
                <input
                  type="text"
                  value={deliveryVersion}
                  onChange={(e) => setDeliveryVersion(e.target.value)}
                  className="px-2 py-1.5 rounded text-xs"
                  style={{ backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.releaseNotes}</label>
                <textarea
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder={t.releaseNotesPlaceholder}
                  rows={2}
                  className="px-2 py-1.5 rounded text-xs resize-y"
                  style={{ backgroundColor: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                <button
                  onClick={handleDownloadZip}
                  className="mt-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  {t.downloadZip}
                </button>
              </div>
              )}

              {showDeliveryBlockers && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-error)' }}>
                  <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-error)' }}>
                    {t.deliveryBlockedTitle}
                  </div>
                  <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    {t.deliveryBlockedHint}
                  </div>
                  <ul className="space-y-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {deliveryBlockers.map((blocker) => (
                      <li key={blocker.key}>• {blocker.message}</li>
                    ))}
                  </ul>
                </div>
              )}

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
