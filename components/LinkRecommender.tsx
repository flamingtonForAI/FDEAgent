/**
 * LinkRecommender - Intelligent relationship suggestions
 *
 * Analyzes existing objects and suggests possible relationships
 * based on naming patterns, property analysis, and common ontology patterns.
 */

import React, { useState, useMemo } from 'react';
import { Language, ProjectState, OntologyLink } from '../types';
import {
  Link2,
  ArrowRight,
  Plus,
  X,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface LinkRecommenderProps {
  lang: Language;
  project: ProjectState;
  onApplyLink: (link: Omit<OntologyLink, 'id'>) => void;
  onDismissRecommendation: (sourceId: string, targetId: string) => void;
}

interface RecommendedLink {
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  relationshipType: 'belongs_to' | 'has_many' | 'has_one' | 'references' | 'depends_on';
  label: string;
  confidence: number; // 0-100
  reason: string;
}

const translations = {
  en: {
    title: 'Suggested Relationships',
    subtitle: 'Based on your objects',
    noSuggestions: 'No relationship suggestions available. Add more objects to get recommendations.',
    apply: 'Apply',
    dismiss: 'Dismiss',
    applied: 'Applied!',
    confidence: 'Confidence',
    reason: 'Why',
    relationTypes: {
      belongs_to: 'belongs to',
      has_many: 'has many',
      has_one: 'has one',
      references: 'references',
      depends_on: 'depends on'
    },
    showAll: 'Show all',
    showLess: 'Show less'
  },
  cn: {
    title: '建议的关系',
    subtitle: '基于您的对象分析',
    noSuggestions: '暂无关系建议。添加更多对象以获取推荐。',
    apply: '应用',
    dismiss: '忽略',
    applied: '已应用！',
    confidence: '置信度',
    reason: '原因',
    relationTypes: {
      belongs_to: '属于',
      has_many: '拥有多个',
      has_one: '拥有一个',
      references: '引用',
      depends_on: '依赖'
    },
    showAll: '显示全部',
    showLess: '收起'
  }
};

// Common relationship patterns in enterprise systems
const RELATIONSHIP_PATTERNS: Array<{
  sourcePattern: RegExp;
  targetPattern: RegExp;
  type: RecommendedLink['relationshipType'];
  labelEn: string;
  labelCn: string;
  reasonEn: string;
  reasonCn: string;
  confidence: number;
}> = [
  // Order belongs to Customer
  {
    sourcePattern: /order|订单|sale|销售|purchase|采购/i,
    targetPattern: /customer|客户|client|account|账户/i,
    type: 'belongs_to',
    labelEn: 'placed by',
    labelCn: '下单客户',
    reasonEn: 'Orders are typically placed by customers',
    reasonCn: '订单通常由客户下单',
    confidence: 90
  },
  // Order has many Items/Lines
  {
    sourcePattern: /order|订单/i,
    targetPattern: /item|商品|line|行项|product|产品/i,
    type: 'has_many',
    labelEn: 'contains',
    labelCn: '包含',
    reasonEn: 'Orders typically contain multiple line items',
    reasonCn: '订单通常包含多个行项',
    confidence: 85
  },
  // Product belongs to Category
  {
    sourcePattern: /product|产品|item|商品|material|物料/i,
    targetPattern: /category|类别|type|类型|group|组/i,
    type: 'belongs_to',
    labelEn: 'categorized as',
    labelCn: '归类于',
    reasonEn: 'Products are typically categorized',
    reasonCn: '产品通常有分类',
    confidence: 80
  },
  // Invoice references Order
  {
    sourcePattern: /invoice|发票|bill|账单/i,
    targetPattern: /order|订单|sale|销售/i,
    type: 'references',
    labelEn: 'for',
    labelCn: '对应',
    reasonEn: 'Invoices are generated for orders',
    reasonCn: '发票对应订单生成',
    confidence: 85
  },
  // Shipment references Order
  {
    sourcePattern: /shipment|发货|delivery|配送|shipping|物流/i,
    targetPattern: /order|订单/i,
    type: 'references',
    labelEn: 'fulfills',
    labelCn: '履行',
    reasonEn: 'Shipments fulfill orders',
    reasonCn: '发货履行订单',
    confidence: 85
  },
  // Employee belongs to Department
  {
    sourcePattern: /employee|员工|staff|人员|worker|工人/i,
    targetPattern: /department|部门|team|团队|division|分部/i,
    type: 'belongs_to',
    labelEn: 'works in',
    labelCn: '所属',
    reasonEn: 'Employees belong to departments',
    reasonCn: '员工属于部门',
    confidence: 90
  },
  // Task belongs to Project
  {
    sourcePattern: /task|任务|activity|活动|work|工作/i,
    targetPattern: /project|项目|program|计划/i,
    type: 'belongs_to',
    labelEn: 'part of',
    labelCn: '属于',
    reasonEn: 'Tasks are part of projects',
    reasonCn: '任务属于项目',
    confidence: 85
  },
  // Payment references Invoice
  {
    sourcePattern: /payment|付款|收款|transaction|交易/i,
    targetPattern: /invoice|发票|bill|账单/i,
    type: 'references',
    labelEn: 'settles',
    labelCn: '结算',
    reasonEn: 'Payments settle invoices',
    reasonCn: '付款结算发票',
    confidence: 85
  },
  // Inventory at Location
  {
    sourcePattern: /inventory|库存|stock|存货/i,
    targetPattern: /location|位置|warehouse|仓库|bin|库位/i,
    type: 'belongs_to',
    labelEn: 'stored at',
    labelCn: '存放于',
    reasonEn: 'Inventory is stored at locations',
    reasonCn: '库存存放在位置',
    confidence: 85
  },
  // Production Order uses Material
  {
    sourcePattern: /production|生产|manufacturing|制造|work order|工单/i,
    targetPattern: /material|物料|component|组件|part|零件/i,
    type: 'has_many',
    labelEn: 'consumes',
    labelCn: '消耗',
    reasonEn: 'Production orders consume materials',
    reasonCn: '生产订单消耗物料',
    confidence: 80
  },
  // Contact belongs to Account
  {
    sourcePattern: /contact|联系人|person|人员/i,
    targetPattern: /account|账户|company|公司|organization|组织/i,
    type: 'belongs_to',
    labelEn: 'works at',
    labelCn: '任职于',
    reasonEn: 'Contacts are associated with accounts',
    reasonCn: '联系人关联到账户',
    confidence: 85
  },
  // Opportunity belongs to Account
  {
    sourcePattern: /opportunity|商机|lead|线索|deal|交易/i,
    targetPattern: /account|账户|customer|客户/i,
    type: 'belongs_to',
    labelEn: 'with',
    labelCn: '关联',
    reasonEn: 'Opportunities are associated with accounts',
    reasonCn: '商机关联到客户',
    confidence: 85
  }
];

// Analyze objects and generate recommendations
const generateRecommendations = (
  project: ProjectState,
  existingLinks: OntologyLink[],
  lang: Language
): RecommendedLink[] => {
  const recommendations: RecommendedLink[] = [];
  const objects = project.objects;

  if (objects.length < 2) return [];

  // Check each pair of objects
  for (let i = 0; i < objects.length; i++) {
    for (let j = 0; j < objects.length; j++) {
      if (i === j) continue;

      const source = objects[i];
      const target = objects[j];

      // Skip if link already exists
      const linkExists = existingLinks.some(
        link =>
          (link.sourceId === source.id && link.targetId === target.id) ||
          (link.sourceId === target.id && link.targetId === source.id)
      );
      if (linkExists) continue;

      // Check against patterns
      for (const pattern of RELATIONSHIP_PATTERNS) {
        const sourceText = `${source.name} ${source.description || ''}`;
        const targetText = `${target.name} ${target.description || ''}`;

        if (pattern.sourcePattern.test(sourceText) && pattern.targetPattern.test(targetText)) {
          // Check if this recommendation already exists
          const exists = recommendations.some(
            r => r.sourceId === source.id && r.targetId === target.id
          );
          if (!exists) {
            recommendations.push({
              sourceId: source.id,
              sourceName: source.name,
              targetId: target.id,
              targetName: target.name,
              relationshipType: pattern.type,
              label: lang === 'cn' ? pattern.labelCn : pattern.labelEn,
              confidence: pattern.confidence,
              reason: lang === 'cn' ? pattern.reasonCn : pattern.reasonEn
            });
          }
        }
      }

      // Property-based inference: if source has a property referencing target name
      const sourceProps = source.properties || [];
      for (const prop of sourceProps) {
        const propName = prop.name.toLowerCase();
        const targetName = target.name.toLowerCase();

        if (
          propName.includes(targetName) ||
          propName.includes(`${targetName}_id`) ||
          propName.includes(`${targetName}id`) ||
          propName === `${targetName}` ||
          propName === `${targetName}_ref`
        ) {
          const exists = recommendations.some(
            r => r.sourceId === source.id && r.targetId === target.id
          );
          if (!exists) {
            recommendations.push({
              sourceId: source.id,
              sourceName: source.name,
              targetId: target.id,
              targetName: target.name,
              relationshipType: 'references',
              label: lang === 'cn' ? '关联' : 'references',
              confidence: 75,
              reason: lang === 'cn'
                ? `属性 "${prop.name}" 引用了 ${target.name}`
                : `Property "${prop.name}" references ${target.name}`
            });
          }
        }
      }
    }
  }

  // Sort by confidence
  return recommendations.sort((a, b) => b.confidence - a.confidence);
};

const LinkRecommender: React.FC<LinkRecommenderProps> = ({
  lang,
  project,
  onApplyLink,
  onDismissRecommendation
}) => {
  const t = translations[lang];
  const [appliedLinks, setAppliedLinks] = useState<Set<string>>(new Set());
  const [dismissedLinks, setDismissedLinks] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const recommendations = useMemo(() => {
    return generateRecommendations(project, project.links, lang);
  }, [project, lang]);

  // Filter out dismissed recommendations
  const visibleRecommendations = recommendations.filter(
    r => !dismissedLinks.has(`${r.sourceId}-${r.targetId}`)
  );

  const displayedRecommendations = showAll
    ? visibleRecommendations
    : visibleRecommendations.slice(0, 3);

  const handleApply = (rec: RecommendedLink) => {
    const linkKey = `${rec.sourceId}-${rec.targetId}`;

    onApplyLink({
      sourceId: rec.sourceId,
      targetId: rec.targetId,
      type: rec.relationshipType,
      label: rec.label
    });

    setAppliedLinks(prev => new Set([...prev, linkKey]));

    // Auto-dismiss after a moment
    setTimeout(() => {
      setDismissedLinks(prev => new Set([...prev, linkKey]));
    }, 1500);
  };

  const handleDismiss = (rec: RecommendedLink) => {
    const linkKey = `${rec.sourceId}-${rec.targetId}`;
    setDismissedLinks(prev => new Set([...prev, linkKey]));
    onDismissRecommendation(rec.sourceId, rec.targetId);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 85) return 'var(--color-success)';
    if (confidence >= 70) return 'var(--color-warning)';
    return 'var(--color-text-muted)';
  };

  if (visibleRecommendations.length === 0) {
    return (
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)'
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-info)20', color: 'var(--color-info)' }}
          >
            <Link2 size={16} />
          </div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {t.title}
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {t.noSuggestions}
        </p>
      </div>
    );
  }

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
        className="px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{ backgroundColor: 'var(--color-bg-elevated)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-info)20', color: 'var(--color-info)' }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {t.title}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {t.subtitle}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-info)', color: '#fff' }}
          >
            {visibleRecommendations.length}
          </span>
          <ChevronRight
            size={16}
            className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          {displayedRecommendations.map(rec => {
            const linkKey = `${rec.sourceId}-${rec.targetId}`;
            const isApplied = appliedLinks.has(linkKey);

            return (
              <div
                key={linkKey}
                className="p-3 rounded-lg group"
                style={{ backgroundColor: 'var(--color-bg-hover)' }}
              >
                {/* Relationship visualization */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-sm font-medium px-2 py-1 rounded"
                    style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}
                  >
                    {rec.sourceName}
                  </span>
                  <div className="flex items-center gap-1" style={{ color: 'var(--color-info)' }}>
                    <ArrowRight size={14} />
                    <span className="text-xs font-medium">{rec.label}</span>
                    <ArrowRight size={14} />
                  </div>
                  <span
                    className="text-sm font-medium px-2 py-1 rounded"
                    style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}
                  >
                    {rec.targetName}
                  </span>
                </div>

                {/* Confidence and reason */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {t.confidence}:
                    </span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: getConfidenceColor(rec.confidence) }}
                    >
                      {rec.confidence}%
                    </span>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}
                  >
                    {t.relationTypes[rec.relationshipType]}
                  </span>
                </div>

                {/* Reason */}
                <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="font-medium">{t.reason}:</span> {rec.reason}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApply(rec)}
                    disabled={isApplied}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1"
                    style={{
                      backgroundColor: isApplied ? 'var(--color-success)' : 'var(--color-info)',
                      color: '#fff',
                      opacity: isApplied ? 0.8 : 1
                    }}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 size={12} />
                        {t.applied}
                      </>
                    ) : (
                      <>
                        <Plus size={12} />
                        {t.apply}
                      </>
                    )}
                  </button>
                  {!isApplied && (
                    <button
                      onClick={() => handleDismiss(rec)}
                      className="px-3 py-1.5 text-xs rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {t.dismiss}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Show more/less */}
          {visibleRecommendations.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-xs text-center py-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {showAll ? t.showLess : `${t.showAll} (${visibleRecommendations.length - 3} more)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkRecommender;
