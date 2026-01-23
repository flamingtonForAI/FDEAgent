/**
 * Case Library Index
 * 案例库索引
 */

import { manufacturingProductionCase } from './manufacturing-production';
import { retailInventoryCase } from './retail-inventory';
import { logisticsDeliveryCase } from './logistics-delivery';
import { OntologyCase, CaseIndex, Industry, CaseTag, CaseDifficulty } from '../../types/case';

// 所有案例
export const allCases: OntologyCase[] = [
  manufacturingProductionCase,
  retailInventoryCase,
  logisticsDeliveryCase
];

// 案例映射 (by ID)
export const casesById: Record<string, OntologyCase> = {
  'manufacturing-production': manufacturingProductionCase,
  'retail-inventory': retailInventoryCase,
  'logistics-delivery': logisticsDeliveryCase
};

// 获取案例索引列表
export function getCaseIndexList(): CaseIndex[] {
  return allCases.map(c => ({
    id: c.metadata.id,
    title: c.metadata.title,
    description: c.metadata.description,
    industry: c.metadata.industry,
    tags: c.metadata.tags,
    difficulty: c.metadata.difficulty,
    objectCount: c.ontology.objects.length,
    actionCount: c.ontology.objects.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0)
  }));
}

// 按行业筛选案例
export function getCasesByIndustry(industry: Industry): CaseIndex[] {
  return getCaseIndexList().filter(c => c.industry === industry);
}

// 按标签筛选案例
export function getCasesByTag(tag: CaseTag): CaseIndex[] {
  return getCaseIndexList().filter(c => c.tags.includes(tag));
}

// 按难度筛选案例
export function getCasesByDifficulty(difficulty: CaseDifficulty): CaseIndex[] {
  return getCaseIndexList().filter(c => c.difficulty === difficulty);
}

// 获取完整案例
export function getCaseById(id: string): OntologyCase | undefined {
  return casesById[id];
}

// 获取相关案例
export function getRelatedCases(caseId: string): CaseIndex[] {
  const currentCase = casesById[caseId];
  if (!currentCase || !currentCase.relatedCases) return [];

  return currentCase.relatedCases
    .map(id => {
      const related = casesById[id];
      if (!related) return null;
      return {
        id: related.metadata.id,
        title: related.metadata.title,
        description: related.metadata.description,
        industry: related.metadata.industry,
        tags: related.metadata.tags,
        difficulty: related.metadata.difficulty,
        objectCount: related.ontology.objects.length,
        actionCount: related.ontology.objects.reduce((sum, obj) => sum + (obj.actions?.length || 0), 0)
      };
    })
    .filter((c): c is CaseIndex => c !== null);
}

// 搜索案例
export function searchCases(query: string): CaseIndex[] {
  const lowerQuery = query.toLowerCase();
  return getCaseIndexList().filter(c =>
    c.title.en.toLowerCase().includes(lowerQuery) ||
    c.title.cn.includes(query) ||
    c.description.en.toLowerCase().includes(lowerQuery) ||
    c.description.cn.includes(query)
  );
}

// 导出单个案例
export { manufacturingProductionCase, retailInventoryCase, logisticsDeliveryCase };
