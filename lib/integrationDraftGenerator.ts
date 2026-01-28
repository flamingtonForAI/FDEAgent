/**
 * Integration Draft Generator
 *
 * Generates comprehensive integration documentation based on the ontology design.
 * Includes data flow diagrams, API specifications, and implementation roadmaps.
 */

import { ProjectState, OntologyObject, Language } from '../types';

export interface IntegrationDraft {
  title: string;
  generatedAt: string;
  summary: {
    totalObjects: number;
    totalActions: number;
    totalLinks: number;
    totalIntegrations: number;
    estimatedComplexity: 'low' | 'medium' | 'high';
  };
  sections: DraftSection[];
  dataFlowDiagram: string; // Mermaid diagram syntax
  apiSpecifications: APISpec[];
  implementationRoadmap: RoadmapPhase[];
  risks: Risk[];
  recommendations: string[];
}

export interface DraftSection {
  id: string;
  title: string;
  content: string;
  subsections?: DraftSection[];
}

export interface APISpec {
  objectName: string;
  endpoints: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    description: string;
    requestBody?: string;
    responseBody?: string;
  }>;
}

export interface RoadmapPhase {
  phase: number;
  name: string;
  description: string;
  deliverables: string[];
  dependencies: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface Risk {
  id: string;
  category: 'technical' | 'data' | 'integration' | 'organizational';
  description: string;
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

// Helper to convert object name to API-friendly format
const toApiPath = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

// Helper to convert to camelCase
const toCamelCase = (name: string): string => {
  return name
    .split(/[\s_-]+/)
    .map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Generate Mermaid data flow diagram
const generateDataFlowDiagram = (project: ProjectState, lang: Language): string => {
  const lines: string[] = ['flowchart LR'];

  // Add objects as nodes
  project.objects.forEach(obj => {
    const nodeId = toApiPath(obj.name);
    lines.push(`    ${nodeId}[${obj.name}]`);
  });

  // Add links as edges
  project.links.forEach(link => {
    const source = project.objects.find(o => o.id === link.source || o.id === link.sourceId);
    const target = project.objects.find(o => o.id === link.target || o.id === link.targetId);
    if (source && target) {
      const sourceId = toApiPath(source.name);
      const targetId = toApiPath(target.name);
      const label = link.label || '';
      lines.push(`    ${sourceId} -->|${label}| ${targetId}`);
    }
  });

  // Add external integrations
  project.integrations?.forEach((integration, i) => {
    const intId = `ext_${i}`;
    lines.push(`    ${intId}[/"${integration.systemName}"/]`);
    // Connect to first object as placeholder
    if (project.objects.length > 0) {
      const firstObj = toApiPath(project.objects[0].name);
      lines.push(`    ${intId} -.->|${integration.mechanism || 'sync'}| ${firstObj}`);
    }
  });

  return lines.join('\n');
};

// Generate API specifications for each object
const generateAPISpecs = (objects: OntologyObject[], lang: Language): APISpec[] => {
  return objects.map(obj => {
    const basePath = `/api/v1/${toApiPath(obj.name)}s`;
    const singularName = toCamelCase(obj.name);

    const endpoints: APISpec['endpoints'] = [
      {
        method: 'GET',
        path: basePath,
        description: lang === 'cn' ? `获取所有${obj.name}列表` : `List all ${obj.name}s`,
        responseBody: `{ "data": [${singularName}], "total": number, "page": number }`
      },
      {
        method: 'GET',
        path: `${basePath}/:id`,
        description: lang === 'cn' ? `获取单个${obj.name}详情` : `Get ${obj.name} by ID`,
        responseBody: `{ "data": ${singularName} }`
      },
      {
        method: 'POST',
        path: basePath,
        description: lang === 'cn' ? `创建新的${obj.name}` : `Create new ${obj.name}`,
        requestBody: `{ ${obj.properties?.map(p => `"${p.name}": ${p.type}`).join(', ') || '...'} }`,
        responseBody: `{ "data": ${singularName}, "id": string }`
      },
      {
        method: 'PUT',
        path: `${basePath}/:id`,
        description: lang === 'cn' ? `更新${obj.name}` : `Update ${obj.name}`,
        requestBody: `{ ${obj.properties?.map(p => `"${p.name}": ${p.type}`).join(', ') || '...'} }`,
        responseBody: `{ "data": ${singularName} }`
      },
      {
        method: 'DELETE',
        path: `${basePath}/:id`,
        description: lang === 'cn' ? `删除${obj.name}` : `Delete ${obj.name}`,
        responseBody: `{ "success": boolean }`
      }
    ];

    // Add action-based endpoints
    obj.actions?.forEach(action => {
      endpoints.push({
        method: 'POST',
        path: `${basePath}/:id/actions/${toApiPath(action.name)}`,
        description: action.description || action.name,
        requestBody: `{ /* action parameters */ }`,
        responseBody: `{ "result": any, "success": boolean }`
      });
    });

    return {
      objectName: obj.name,
      endpoints
    };
  });
};

// Generate implementation roadmap
const generateRoadmap = (project: ProjectState, lang: Language): RoadmapPhase[] => {
  const phases: RoadmapPhase[] = [];

  // Phase 1: Data Model Setup
  phases.push({
    phase: 1,
    name: lang === 'cn' ? '数据模型建立' : 'Data Model Setup',
    description: lang === 'cn'
      ? '建立核心数据模型和数据库架构'
      : 'Establish core data models and database schema',
    deliverables: [
      lang === 'cn' ? '数据库表结构设计' : 'Database table design',
      lang === 'cn' ? '实体关系模型' : 'Entity relationship model',
      lang === 'cn' ? '数据迁移脚本' : 'Data migration scripts',
      ...project.objects.map(obj =>
        lang === 'cn' ? `${obj.name} 模型定义` : `${obj.name} model definition`
      )
    ],
    dependencies: [],
    priority: 'critical'
  });

  // Phase 2: Core APIs
  phases.push({
    phase: 2,
    name: lang === 'cn' ? '核心 API 开发' : 'Core API Development',
    description: lang === 'cn'
      ? '开发基础 CRUD API 和核心业务逻辑'
      : 'Develop basic CRUD APIs and core business logic',
    deliverables: [
      lang === 'cn' ? 'RESTful API 端点' : 'RESTful API endpoints',
      lang === 'cn' ? '认证授权机制' : 'Authentication & authorization',
      lang === 'cn' ? 'API 文档 (OpenAPI/Swagger)' : 'API documentation (OpenAPI/Swagger)',
      lang === 'cn' ? '单元测试覆盖' : 'Unit test coverage'
    ],
    dependencies: [lang === 'cn' ? '数据模型建立' : 'Data Model Setup'],
    priority: 'critical'
  });

  // Phase 3: External Integrations
  if ((project.integrations?.length || 0) > 0) {
    phases.push({
      phase: 3,
      name: lang === 'cn' ? '外部系统集成' : 'External System Integration',
      description: lang === 'cn'
        ? '集成外部系统和数据源'
        : 'Integrate with external systems and data sources',
      deliverables: project.integrations?.map(int =>
        lang === 'cn'
          ? `${int.systemName} 集成 (${int.mechanism})`
          : `${int.systemName} integration (${int.mechanism})`
      ) || [],
      dependencies: [lang === 'cn' ? '核心 API 开发' : 'Core API Development'],
      priority: 'high'
    });
  }

  // Phase 4: Actions & Workflows
  const totalActions = project.objects.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0);
  if (totalActions > 0) {
    phases.push({
      phase: phases.length + 1,
      name: lang === 'cn' ? '业务动作实现' : 'Business Actions Implementation',
      description: lang === 'cn'
        ? '实现业务动作和工作流'
        : 'Implement business actions and workflows',
      deliverables: project.objects.flatMap(obj =>
        (obj.actions || []).map(action =>
          lang === 'cn'
            ? `${obj.name}.${action.name} 动作`
            : `${obj.name}.${action.name} action`
        )
      ),
      dependencies: [lang === 'cn' ? '核心 API 开发' : 'Core API Development'],
      priority: 'high'
    });
  }

  // Phase 5: AI Features
  const hasAI = project.objects.some(obj => obj.aiFeatures && obj.aiFeatures.length > 0);
  if (hasAI) {
    phases.push({
      phase: phases.length + 1,
      name: lang === 'cn' ? 'AI 功能集成' : 'AI Features Integration',
      description: lang === 'cn'
        ? '集成 AI/ML 功能和智能化特性'
        : 'Integrate AI/ML features and intelligence',
      deliverables: project.objects.flatMap(obj =>
        (obj.aiFeatures || []).map(ai =>
          lang === 'cn'
            ? `${obj.name} - ${ai.name || ai.type} AI 功能`
            : `${obj.name} - ${ai.name || ai.type} AI feature`
        )
      ),
      dependencies: [
        lang === 'cn' ? '核心 API 开发' : 'Core API Development',
        lang === 'cn' ? '业务动作实现' : 'Business Actions Implementation'
      ],
      priority: 'medium'
    });
  }

  // Final Phase: Testing & Deployment
  phases.push({
    phase: phases.length + 1,
    name: lang === 'cn' ? '测试与部署' : 'Testing & Deployment',
    description: lang === 'cn'
      ? '端到端测试、性能优化和生产部署'
      : 'End-to-end testing, performance optimization, and production deployment',
    deliverables: [
      lang === 'cn' ? '集成测试' : 'Integration tests',
      lang === 'cn' ? '性能基准测试' : 'Performance benchmarks',
      lang === 'cn' ? '部署流水线' : 'Deployment pipeline',
      lang === 'cn' ? '监控和告警配置' : 'Monitoring & alerting setup'
    ],
    dependencies: phases.slice(0, -1).map(p => p.name),
    priority: 'critical'
  });

  return phases;
};

// Generate risk assessment
const generateRisks = (project: ProjectState, lang: Language): Risk[] => {
  const risks: Risk[] = [];

  // Data complexity risk
  if (project.objects.length > 10) {
    risks.push({
      id: 'risk_data_complexity',
      category: 'technical',
      description: lang === 'cn'
        ? '数据模型复杂度较高，可能导致维护困难'
        : 'High data model complexity may lead to maintenance challenges',
      impact: 'medium',
      mitigation: lang === 'cn'
        ? '建议进行模块化设计，考虑领域驱动设计 (DDD) 方法'
        : 'Consider modular design and Domain-Driven Design (DDD) approach'
    });
  }

  // Integration risk
  if ((project.integrations?.length || 0) > 2) {
    risks.push({
      id: 'risk_integration',
      category: 'integration',
      description: lang === 'cn'
        ? '多系统集成增加了故障点和同步复杂度'
        : 'Multiple system integrations increase failure points and sync complexity',
      impact: 'high',
      mitigation: lang === 'cn'
        ? '实施断路器模式、重试机制和数据一致性检查'
        : 'Implement circuit breaker pattern, retry mechanisms, and data consistency checks'
    });
  }

  // Incomplete objects risk
  const incompleteObjects = project.objects.filter(obj =>
    !obj.description || (obj.properties?.length || 0) === 0
  );
  if (incompleteObjects.length > 0) {
    risks.push({
      id: 'risk_incomplete_model',
      category: 'data',
      description: lang === 'cn'
        ? `${incompleteObjects.length} 个对象定义不完整，可能导致实现偏差`
        : `${incompleteObjects.length} objects have incomplete definitions, may cause implementation drift`,
      impact: 'medium',
      mitigation: lang === 'cn'
        ? '在开发前完善所有对象的属性和描述定义'
        : 'Complete all object property and description definitions before development'
    });
  }

  // No links risk
  if (project.links.length === 0 && project.objects.length > 1) {
    risks.push({
      id: 'risk_no_relationships',
      category: 'data',
      description: lang === 'cn'
        ? '对象之间没有定义关系，可能表示模型不完整'
        : 'No relationships defined between objects, model may be incomplete',
      impact: 'high',
      mitigation: lang === 'cn'
        ? '审查对象之间的业务关系并添加适当的关联'
        : 'Review business relationships between objects and add appropriate links'
    });
  }

  return risks;
};

// Main function to generate integration draft
export const generateIntegrationDraft = (
  project: ProjectState,
  lang: Language
): IntegrationDraft => {
  const totalActions = project.objects.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0);

  // Calculate complexity
  let complexity: 'low' | 'medium' | 'high' = 'low';
  const complexityScore =
    project.objects.length * 2 +
    totalActions +
    project.links.length +
    (project.integrations?.length || 0) * 3;

  if (complexityScore > 30) complexity = 'high';
  else if (complexityScore > 15) complexity = 'medium';

  const sections: DraftSection[] = [
    {
      id: 'overview',
      title: lang === 'cn' ? '概述' : 'Overview',
      content: lang === 'cn'
        ? `本文档描述了基于 Ontology 设计的系统集成方案。包含 ${project.objects.length} 个核心业务对象、${totalActions} 个业务动作、${project.links.length} 个对象关系和 ${project.integrations?.length || 0} 个外部系统集成。`
        : `This document describes the system integration plan based on the Ontology design. It includes ${project.objects.length} core business objects, ${totalActions} business actions, ${project.links.length} object relationships, and ${project.integrations?.length || 0} external system integrations.`
    },
    {
      id: 'objects',
      title: lang === 'cn' ? '核心对象' : 'Core Objects',
      content: project.objects.map(obj => {
        const propsDesc = obj.properties?.map(p => `- ${p.name}: ${p.type}`).join('\n') || (lang === 'cn' ? '(无属性)' : '(no properties)');
        return `### ${obj.name}\n${obj.description || ''}\n\n**${lang === 'cn' ? '属性' : 'Properties'}:**\n${propsDesc}`;
      }).join('\n\n')
    },
    {
      id: 'relationships',
      title: lang === 'cn' ? '对象关系' : 'Object Relationships',
      content: project.links.length > 0
        ? project.links.map(link => {
            const source = project.objects.find(o => o.id === link.source || o.id === link.sourceId)?.name || link.source;
            const target = project.objects.find(o => o.id === link.target || o.id === link.targetId)?.name || link.target;
            return `- **${source}** → **${target}**: ${link.label || link.type || 'relates to'}`;
          }).join('\n')
        : lang === 'cn' ? '暂无定义的关系' : 'No relationships defined'
    },
    {
      id: 'integrations',
      title: lang === 'cn' ? '外部集成' : 'External Integrations',
      content: (project.integrations?.length || 0) > 0
        ? project.integrations!.map(int =>
            `### ${int.systemName}\n- **${lang === 'cn' ? '同步方式' : 'Mechanism'}**: ${int.mechanism}\n- **${lang === 'cn' ? '数据点' : 'Data Points'}**: ${int.dataPoints?.join(', ') || 'N/A'}`
          ).join('\n\n')
        : lang === 'cn' ? '暂无外部系统集成' : 'No external integrations'
    }
  ];

  return {
    title: lang === 'cn' ? '系统集成草案' : 'System Integration Draft',
    generatedAt: new Date().toISOString(),
    summary: {
      totalObjects: project.objects.length,
      totalActions,
      totalLinks: project.links.length,
      totalIntegrations: project.integrations?.length || 0,
      estimatedComplexity: complexity
    },
    sections,
    dataFlowDiagram: generateDataFlowDiagram(project, lang),
    apiSpecifications: generateAPISpecs(project.objects, lang),
    implementationRoadmap: generateRoadmap(project, lang),
    risks: generateRisks(project, lang),
    recommendations: [
      lang === 'cn' ? '建议在开发前进行技术评审' : 'Recommend technical review before development',
      lang === 'cn' ? '考虑使用 API 网关统一管理接口' : 'Consider using API Gateway for unified interface management',
      lang === 'cn' ? '实施持续集成/持续部署 (CI/CD) 流水线' : 'Implement CI/CD pipeline',
      lang === 'cn' ? '建立完善的日志和监控体系' : 'Establish comprehensive logging and monitoring'
    ]
  };
};

// Export draft to Markdown format
export const exportDraftToMarkdown = (draft: IntegrationDraft, lang: Language): string => {
  let md = `# ${draft.title}\n\n`;
  md += `> ${lang === 'cn' ? '生成时间' : 'Generated'}: ${new Date(draft.generatedAt).toLocaleString()}\n\n`;

  // Summary
  md += `## ${lang === 'cn' ? '摘要' : 'Summary'}\n\n`;
  md += `| ${lang === 'cn' ? '指标' : 'Metric'} | ${lang === 'cn' ? '值' : 'Value'} |\n`;
  md += `|------|------|\n`;
  md += `| ${lang === 'cn' ? '对象数' : 'Objects'} | ${draft.summary.totalObjects} |\n`;
  md += `| ${lang === 'cn' ? '动作数' : 'Actions'} | ${draft.summary.totalActions} |\n`;
  md += `| ${lang === 'cn' ? '关系数' : 'Links'} | ${draft.summary.totalLinks} |\n`;
  md += `| ${lang === 'cn' ? '集成数' : 'Integrations'} | ${draft.summary.totalIntegrations} |\n`;
  md += `| ${lang === 'cn' ? '预估复杂度' : 'Complexity'} | ${draft.summary.estimatedComplexity} |\n\n`;

  // Sections
  draft.sections.forEach(section => {
    md += `## ${section.title}\n\n${section.content}\n\n`;
  });

  // Data Flow Diagram
  md += `## ${lang === 'cn' ? '数据流图' : 'Data Flow Diagram'}\n\n`;
  md += '```mermaid\n' + draft.dataFlowDiagram + '\n```\n\n';

  // API Specifications
  md += `## ${lang === 'cn' ? 'API 规范' : 'API Specifications'}\n\n`;
  draft.apiSpecifications.forEach(api => {
    md += `### ${api.objectName}\n\n`;
    md += `| ${lang === 'cn' ? '方法' : 'Method'} | ${lang === 'cn' ? '路径' : 'Path'} | ${lang === 'cn' ? '描述' : 'Description'} |\n`;
    md += `|------|------|------|\n`;
    api.endpoints.forEach(ep => {
      md += `| ${ep.method} | \`${ep.path}\` | ${ep.description} |\n`;
    });
    md += '\n';
  });

  // Implementation Roadmap
  md += `## ${lang === 'cn' ? '实施路线图' : 'Implementation Roadmap'}\n\n`;
  draft.implementationRoadmap.forEach(phase => {
    md += `### ${lang === 'cn' ? '阶段' : 'Phase'} ${phase.phase}: ${phase.name}\n\n`;
    md += `**${lang === 'cn' ? '描述' : 'Description'}**: ${phase.description}\n\n`;
    md += `**${lang === 'cn' ? '优先级' : 'Priority'}**: ${phase.priority}\n\n`;
    md += `**${lang === 'cn' ? '交付物' : 'Deliverables'}**:\n`;
    phase.deliverables.forEach(d => md += `- ${d}\n`);
    if (phase.dependencies.length > 0) {
      md += `\n**${lang === 'cn' ? '依赖' : 'Dependencies'}**: ${phase.dependencies.join(', ')}\n`;
    }
    md += '\n';
  });

  // Risks
  md += `## ${lang === 'cn' ? '风险评估' : 'Risk Assessment'}\n\n`;
  if (draft.risks.length > 0) {
    md += `| ${lang === 'cn' ? '类别' : 'Category'} | ${lang === 'cn' ? '描述' : 'Description'} | ${lang === 'cn' ? '影响' : 'Impact'} | ${lang === 'cn' ? '缓解措施' : 'Mitigation'} |\n`;
    md += `|------|------|------|------|\n`;
    draft.risks.forEach(risk => {
      md += `| ${risk.category} | ${risk.description} | ${risk.impact} | ${risk.mitigation} |\n`;
    });
  } else {
    md += lang === 'cn' ? '未识别到重大风险。\n' : 'No significant risks identified.\n';
  }
  md += '\n';

  // Recommendations
  md += `## ${lang === 'cn' ? '建议' : 'Recommendations'}\n\n`;
  draft.recommendations.forEach(rec => md += `- ${rec}\n`);

  return md;
};
