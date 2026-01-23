/**
 * Archetype Library Index
 * 原型库索引
 *
 * Archetype 是 Palantir 将咨询能力产品化的核心载体
 * 与 Case（学习案例）不同，Archetype 是可直接部署的行业解决方案
 */

import { Archetype, ArchetypeIndex } from '../../types/archetype';
import { manufacturingMESArchetype } from './manufacturing-mes';
import { manufacturingISA95Archetype } from './manufacturing-isa95';

// 所有 Archetypes
export const allArchetypes: Archetype[] = [
  manufacturingISA95Archetype,  // ISA-95 based comprehensive archetype (recommended)
  manufacturingMESArchetype,     // Simpler MES-focused archetype
];

// Archetype 映射 (by ID)
export const archetypesById: Record<string, Archetype> = {
  'manufacturing-isa95-mom': manufacturingISA95Archetype,
  'manufacturing-mes': manufacturingMESArchetype,
};

// 获取 Archetype 索引列表
export function getArchetypeIndexList(): ArchetypeIndex[] {
  return allArchetypes.map(a => ({
    id: a.metadata.id,
    name: a.metadata.name,
    description: a.metadata.description,
    industry: a.metadata.industry,
    domain: a.metadata.domain,
    version: a.metadata.version,
    stats: {
      objectCount: a.ontology.objects.length,
      actionCount: a.ontology.objects.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0),
      connectorCount: a.connectors.length,
      workflowCount: a.workflows.length,
      dashboardCount: a.dashboards.length,
    },
    tags: extractTags(a),
    estimatedDeploymentTime: a.metadata.usage?.avgDeploymentTime || '1-2 weeks',
  }));
}

// 从 Archetype 提取标签
function extractTags(archetype: Archetype): string[] {
  const tags: string[] = [archetype.metadata.industry, archetype.metadata.domain];

  // 添加 AI 能力标签
  if (archetype.aiCapabilities.length > 0) {
    tags.push('ai-enabled');
  }

  // 添加数据源类型标签
  const sourceTypes = new Set(archetype.connectors.map(c => c.sourceType));
  if (sourceTypes.has('erp')) tags.push('erp-integration');
  if (sourceTypes.has('mes')) tags.push('mes-integration');
  if (sourceTypes.has('iot')) tags.push('iot-enabled');

  return tags;
}

// 按行业筛选
export function getArchetypesByIndustry(industry: string): ArchetypeIndex[] {
  return getArchetypeIndexList().filter(a => a.industry === industry);
}

// 按领域筛选
export function getArchetypesByDomain(domain: string): ArchetypeIndex[] {
  return getArchetypeIndexList().filter(a => a.domain === domain);
}

// 获取完整 Archetype
export function getArchetypeById(id: string): Archetype | undefined {
  return archetypesById[id];
}

// 搜索 Archetype
export function searchArchetypes(query: string): ArchetypeIndex[] {
  const lowerQuery = query.toLowerCase();
  return getArchetypeIndexList().filter(a =>
    a.name.toLowerCase().includes(lowerQuery) ||
    a.description.en.toLowerCase().includes(lowerQuery) ||
    a.description.cn.includes(query) ||
    a.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

// 导出单个 Archetype
export { manufacturingMESArchetype, manufacturingISA95Archetype };
