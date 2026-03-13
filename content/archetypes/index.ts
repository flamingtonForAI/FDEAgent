/**
 * Archetype Library Index — Lazy Loading
 * 原型库索引 — 按需加载
 *
 * Archetype 是将行业咨询经验产品化的核心载体
 * 与 Case（学习案例）不同，Archetype 是可直接部署的行业解决方案
 *
 * 支持两类原型：
 * 1. 静态原型（static）：随代码发布的内置原型，按需动态加载
 * 2. 导入原型（imported）：用户生成或导入的原型（存储在 IndexedDB）
 *
 * Index metadata (stats, tags, version) is derived at runtime from the actual
 * archetype data — never hand-maintained — to guarantee single-source-of-truth.
 */

import { Archetype, ArchetypeIndex, ArchetypeOrigin } from '../../types/archetype';
import { archetypeStorageService, StoredArchetype } from '../../services/archetypeStorageService';

// ============= Dynamic loader map =============

/**
 * Static archetype loader map — each entry lazily imports the full archetype data.
 * The module path must be a static string for Vite to create separate chunks.
 */
const archetypeLoaders: Record<string, () => Promise<Archetype>> = {
  'manufacturing-isa95-mom': () => import('./manufacturing-isa95').then(m => m.manufacturingISA95Archetype),
  'manufacturing-mes': () => import('./manufacturing-mes').then(m => m.manufacturingMESArchetype),
  'retail-omnichannel': () => import('./retail-omnichannel').then(m => m.retailOmnichannelArchetype),
  'healthcare-fhir-clinical': () => import('./healthcare-fhir').then(m => m.healthcareFHIRArchetype),
  'aquaculture-smart-farming': () => import('./aquaculture-farming').then(m => m.aquacultureFarmingArchetype),
  'aviation-mro-operations': () => import('./aviation-mro').then(m => m.aviationMROArchetype),
  'insurance-risk-management': () => import('./insurance-risk').then(m => m.insuranceRiskArchetype),
  'defense-intelligence': () => import('./defense-intelligence').then(m => m.defenseIntelligenceArchetype),
  'energy-utilities': () => import('./energy-utilities').then(m => m.energyUtilitiesArchetype),
  'financial-aml': () => import('./financial-aml').then(m => m.financialAmlArchetype),
  'automotive-supply-chain': () => import('./automotive-supply-chain').then(m => m.automotiveSupplyChainArchetype),
};

// Canonical ordering for the archetype list
const archetypeOrder: string[] = [
  'manufacturing-isa95-mom',
  'manufacturing-mes',
  'retail-omnichannel',
  'healthcare-fhir-clinical',
  'aquaculture-smart-farming',
  'aviation-mro-operations',
  'insurance-risk-management',
  'defense-intelligence',
  'energy-utilities',
  'financial-aml',
  'automotive-supply-chain',
];

// ============= Cache =============

/** Cache for loaded archetypes to avoid repeated dynamic imports */
const archetypeCache = new Map<string, Archetype>();

/** Cached index derived from real archetype data — populated on first call */
let cachedStaticIndex: ArchetypeIndex[] | null = null;

/** IDs that failed to load and should be retried on next access */
let failedIds: Set<string> = new Set();

/** In-flight promise to prevent duplicate parallel loads */
let indexLoadPromise: Promise<ArchetypeIndex[]> | null = null;

// ============= Internal helpers =============

/** Extract tags from a real Archetype instance — same logic as the original */
function extractTags(archetype: Archetype): string[] {
  const tags: string[] = [archetype.metadata?.industry, archetype.metadata?.domain].filter(Boolean) as string[];

  if (archetype.aiCapabilities && archetype.aiCapabilities.length > 0) {
    tags.push('ai-enabled');
  }

  if (archetype.connectors && archetype.connectors.length > 0) {
    const sourceTypes = new Set(archetype.connectors.map(c => c.sourceType));
    if (sourceTypes.has('erp')) tags.push('erp-integration');
    if (sourceTypes.has('mes')) tags.push('mes-integration');
    if (sourceTypes.has('iot')) tags.push('iot-enabled');
  }

  return tags;
}

/** Derive a lightweight ArchetypeIndex from a full Archetype */
function toArchetypeIndex(a: Archetype): ArchetypeIndex {
  return {
    id: a.metadata.id,
    name: a.metadata.name,
    description: a.metadata.description,
    industry: a.metadata.industry,
    domain: a.metadata.domain,
    version: a.metadata.version,
    stats: {
      objectCount: a.ontology?.objects?.length || 0,
      actionCount: a.ontology?.objects?.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0) || 0,
      connectorCount: a.connectors?.length || 0,
      workflowCount: a.workflows?.length || 0,
      dashboardCount: a.dashboards?.length || 0,
    },
    tags: extractTags(a),
    estimatedDeploymentTime: a.metadata.usage?.avgDeploymentTime || '1-2 weeks',
    origin: { type: 'static' } as ArchetypeOrigin,
  };
}

/**
 * Load all static archetypes in parallel, populate the cache and derive the index.
 * Deduplicates concurrent calls.
 *
 * Resilience: if any archetype fails to load, the successfully loaded ones are
 * returned immediately, but the index is NOT permanently cached. Failed IDs are
 * recorded and retried on the next call, so transient network errors self-heal
 * without requiring a full page reload.
 */
async function ensureStaticIndexLoaded(): Promise<ArchetypeIndex[]> {
  // Fully cached and no outstanding failures — fast path
  if (cachedStaticIndex && failedIds.size === 0) return cachedStaticIndex;

  if (!indexLoadPromise) {
    indexLoadPromise = (async () => {
      // On first call load all; on retry only load previously failed IDs
      const idsToLoad = cachedStaticIndex ? [...failedIds] : [...archetypeOrder];
      const newFailures = new Set<string>();

      await Promise.all(
        idsToLoad.map(async (id) => {
          if (archetypeCache.has(id)) return; // already loaded successfully
          const loader = archetypeLoaders[id];
          if (!loader) return;
          try {
            const archetype = await loader();
            archetypeCache.set(id, archetype);
          } catch (error) {
            console.error(`Failed to load archetype ${id}:`, error);
            newFailures.add(id);
          }
        })
      );

      // Rebuild the full index from the cache in canonical order
      cachedStaticIndex = archetypeOrder
        .filter(id => archetypeCache.has(id))
        .map(id => toArchetypeIndex(archetypeCache.get(id)!));

      failedIds = newFailures;
      indexLoadPromise = null;
      return cachedStaticIndex;
    })();
  }

  return indexLoadPromise;
}

// ============= Public API =============

/**
 * 获取静态 Archetype 索引列表（异步，首次调用加载全部原型并派生索引，后续从缓存返回）
 * Index metadata is always derived from the real archetype data — never hand-maintained.
 */
export async function getArchetypeIndexList(): Promise<ArchetypeIndex[]> {
  return ensureStaticIndexLoaded();
}

/**
 * 获取完整 Archetype（异步，按需加载）
 */
export async function getArchetypeById(id: string): Promise<Archetype | undefined> {
  // Check cache first
  const cached = archetypeCache.get(id);
  if (cached) return cached;

  // Dynamic import
  const loader = archetypeLoaders[id];
  if (!loader) return undefined;

  try {
    const archetype = await loader();
    archetypeCache.set(id, archetype);
    return archetype;
  } catch (error) {
    console.error(`Failed to load archetype ${id}:`, error);
    return undefined;
  }
}

// ============= 合并静态 + 导入原型的函数 =============

/**
 * 获取合并后的原型索引列表（静态 + 导入）
 * 这是推荐的主要获取方法
 */
export async function getMergedArchetypeIndexList(): Promise<ArchetypeIndex[]> {
  const staticList = await getArchetypeIndexList();

  try {
    await archetypeStorageService.initialize();
    const importedList = await archetypeStorageService.getArchetypeIndexList();
    return [...staticList, ...importedList];
  } catch (error) {
    console.error('Failed to load imported archetypes:', error);
    return staticList;
  }
}

/**
 * 获取合并后的单个原型（优先从静态获取，如果没有则从存储获取）
 */
export async function getMergedArchetypeById(id: string): Promise<Archetype | undefined> {
  const staticArchetype = await getArchetypeById(id);
  if (staticArchetype) {
    return staticArchetype;
  }

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
  if (archetypeLoaders[id]) {
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

// 按行业筛选
export async function getArchetypesByIndustry(industry: string): Promise<ArchetypeIndex[]> {
  return (await getArchetypeIndexList()).filter(a => a.industry === industry);
}

// 按领域筛选
export async function getArchetypesByDomain(domain: string): Promise<ArchetypeIndex[]> {
  return (await getArchetypeIndexList()).filter(a => a.domain === domain);
}

// 搜索 Archetype
export async function searchArchetypes(query: string): Promise<ArchetypeIndex[]> {
  const lowerQuery = query.toLowerCase();
  return (await getArchetypeIndexList()).filter(a => {
    const descriptionEn = typeof a.description === 'string' ? a.description : a.description.en;
    const descriptionCn = typeof a.description === 'string' ? a.description : a.description.cn;
    return (
      a.name.toLowerCase().includes(lowerQuery) ||
      descriptionEn.toLowerCase().includes(lowerQuery) ||
      descriptionCn.includes(query) ||
      a.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  });
}
