/**
 * Archetype Library Index
 * 原型库索引
 *
 * Archetype 是将行业咨询经验产品化的核心载体
 * 与 Case（学习案例）不同，Archetype 是可直接部署的行业解决方案
 *
 * 支持两类原型：
 * 1. 静态原型（static）：随代码发布的内置原型
 * 2. 导入原型（imported）：用户生成或导入的原型（存储在 IndexedDB）
 */

import { Archetype, ArchetypeIndex, ArchetypeOrigin } from '../../types/archetype';
import { archetypeStorageService, StoredArchetype } from '../../services/archetypeStorageService';
import { manufacturingMESArchetype } from './manufacturing-mes';
import { manufacturingISA95Archetype } from './manufacturing-isa95';
import { retailOmnichannelArchetype } from './retail-omnichannel';
import { healthcareFHIRArchetype } from './healthcare-fhir';
import { aquacultureFarmingArchetype } from './aquaculture-farming';
import { aviationMROArchetype } from './aviation-mro';

// 所有 Archetypes
export const allArchetypes: Archetype[] = [
  manufacturingISA95Archetype,  // ISA-95 based comprehensive archetype (recommended)
  manufacturingMESArchetype,     // Simpler MES-focused archetype
  retailOmnichannelArchetype,    // Retail omnichannel operations
  healthcareFHIRArchetype,       // Healthcare clinical operations (FHIR)
  aquacultureFarmingArchetype,   // Smart aquaculture & livestock farming
  aviationMROArchetype,          // Aviation MRO operations
];

// Archetype 映射 (by ID)
export const archetypesById: Record<string, Archetype> = {
  'manufacturing-isa95-mom': manufacturingISA95Archetype,
  'manufacturing-mes': manufacturingMESArchetype,
  'retail-omnichannel': retailOmnichannelArchetype,
  'healthcare-fhir-clinical': healthcareFHIRArchetype,
  'aquaculture-smart-farming': aquacultureFarmingArchetype,
  'aviation-mro-operations': aviationMROArchetype,
};

// 获取静态 Archetype 索引列表
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
    origin: { type: 'static' } as ArchetypeOrigin,
  }));
}

// ============= 合并静态 + 导入原型的函数 =============

/**
 * 获取合并后的原型索引列表（静态 + 导入）
 * 这是推荐的主要获取方法
 */
export async function getMergedArchetypeIndexList(): Promise<ArchetypeIndex[]> {
  // 获取静态原型
  const staticList = getArchetypeIndexList();

  // 获取导入的原型
  try {
    await archetypeStorageService.initialize();
    const importedList = await archetypeStorageService.getArchetypeIndexList();

    // 合并，导入的原型在后面
    return [...staticList, ...importedList];
  } catch (error) {
    console.error('Failed to load imported archetypes:', error);
    // 如果加载导入原型失败，只返回静态原型
    return staticList;
  }
}

/**
 * 获取合并后的单个原型（优先从静态获取，如果没有则从存储获取）
 */
export async function getMergedArchetypeById(id: string): Promise<Archetype | undefined> {
  // 先尝试从静态原型获取
  const staticArchetype = archetypesById[id];
  if (staticArchetype) {
    return staticArchetype;
  }

  // 从存储获取
  try {
    await archetypeStorageService.initialize();
    const stored = await archetypeStorageService.getArchetype(id);
    return stored?.archetype;
  } catch (error) {
    console.error('Failed to get imported archetype:', error);
    return undefined;
  }
}

/**
 * 按来源类型筛选合并后的原型列表
 */
export async function getMergedArchetypesByOriginType(
  originType: 'static' | 'reference' | 'ai-generated' | 'all'
): Promise<ArchetypeIndex[]> {
  const mergedList = await getMergedArchetypeIndexList();

  if (originType === 'all') {
    return mergedList;
  }

  return mergedList.filter(a => a.origin?.type === originType);
}

/**
 * 删除导入的原型
 */
export async function deleteImportedArchetype(id: string): Promise<boolean> {
  // 不允许删除静态原型
  if (archetypesById[id]) {
    console.warn('Cannot delete static archetype:', id);
    return false;
  }

  try {
    await archetypeStorageService.initialize();
    await archetypeStorageService.deleteArchetype(id);
    return true;
  } catch (error) {
    console.error('Failed to delete imported archetype:', error);
    return false;
  }
}

/**
 * 获取所有导入的原型
 */
export async function getImportedArchetypes(): Promise<StoredArchetype[]> {
  try {
    await archetypeStorageService.initialize();
    return await archetypeStorageService.getAllArchetypes();
  } catch (error) {
    console.error('Failed to get imported archetypes:', error);
    return [];
  }
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
export {
  manufacturingMESArchetype,
  manufacturingISA95Archetype,
  retailOmnichannelArchetype,
  healthcareFHIRArchetype,
  aquacultureFarmingArchetype,
  aviationMROArchetype
};
