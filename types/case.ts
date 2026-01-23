/**
 * Case Library Type Definitions
 * 案例库类型定义
 */

import { OntologyObject, OntologyLink, Integration } from '../types';

// 案例难度
export type CaseDifficulty = 'beginner' | 'intermediate' | 'advanced';

// 行业类型
export type Industry =
  | 'manufacturing'  // 制造业
  | 'retail'         // 零售业
  | 'logistics'      // 物流业
  | 'healthcare'     // 医疗健康
  | 'finance'        // 金融服务
  | 'energy'         // 能源
  | 'agriculture';   // 农业

// 案例标签
export type CaseTag =
  | 'production'     // 生产计划
  | 'inventory'      // 库存管理
  | 'delivery'       // 配送调度
  | 'quality'        // 质量控制
  | 'maintenance'    // 设备维护
  | 'supply-chain'   // 供应链
  | 'customer'       // 客户服务
  | 'workforce'      // 人力调度
  | 'analytics'      // 数据分析
  | 'ai-augmented';  // AI增强

// 案例元数据
export interface CaseMetadata {
  id: string;
  title: {
    en: string;
    cn: string;
  };
  description: {
    en: string;
    cn: string;
  };
  industry: Industry;
  tags: CaseTag[];
  difficulty: CaseDifficulty;
  estimatedTime: string; // e.g., "30min", "1h"
  author?: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

// 业务场景描述
export interface BusinessScenario {
  background: {
    en: string;
    cn: string;
  };
  challenges: {
    en: string[];
    cn: string[];
  };
  goals: {
    en: string[];
    cn: string[];
  };
  stakeholders: {
    role: string;
    description: {
      en: string;
      cn: string;
    };
  }[];
}

// 设计亮点
export interface DesignHighlight {
  title: {
    en: string;
    cn: string;
  };
  description: {
    en: string;
    cn: string;
  };
  relatedElements: string[]; // Object/Action IDs
}

// 学习要点
export interface LearningPoint {
  concept: {
    en: string;
    cn: string;
  };
  explanation: {
    en: string;
    cn: string;
  };
  example?: string; // 相关代码或配置示例
}

// 完整案例结构
export interface OntologyCase {
  metadata: CaseMetadata;
  scenario: BusinessScenario;

  // Ontology 设计
  ontology: {
    objects: OntologyObject[];
    links: OntologyLink[];
    integrations: Integration[];
  };

  // 设计亮点
  highlights: DesignHighlight[];

  // 学习要点
  learningPoints: LearningPoint[];

  // 相关案例 IDs
  relatedCases?: string[];
}

// 案例索引（用于列表展示）
export interface CaseIndex {
  id: string;
  title: {
    en: string;
    cn: string;
  };
  description: {
    en: string;
    cn: string;
  };
  industry: Industry;
  tags: CaseTag[];
  difficulty: CaseDifficulty;
  objectCount: number;
  actionCount: number;
  thumbnail?: string; // 缩略图 URL
}

// 行业配置
export const industryConfig: Record<Industry, {
  icon: string;
  color: string;
  label: { en: string; cn: string }
}> = {
  manufacturing: {
    icon: 'Factory',
    color: 'blue',
    label: { en: 'Manufacturing', cn: '制造业' }
  },
  retail: {
    icon: 'ShoppingCart',
    color: 'emerald',
    label: { en: 'Retail', cn: '零售业' }
  },
  logistics: {
    icon: 'Truck',
    color: 'amber',
    label: { en: 'Logistics', cn: '物流业' }
  },
  healthcare: {
    icon: 'Heart',
    color: 'red',
    label: { en: 'Healthcare', cn: '医疗健康' }
  },
  finance: {
    icon: 'Landmark',
    color: 'purple',
    label: { en: 'Finance', cn: '金融服务' }
  },
  energy: {
    icon: 'Zap',
    color: 'yellow',
    label: { en: 'Energy', cn: '能源' }
  },
  agriculture: {
    icon: 'Leaf',
    color: 'green',
    label: { en: 'Agriculture', cn: '农业' }
  }
};

// 难度配置
export const difficultyConfig: Record<CaseDifficulty, {
  color: string;
  label: { en: string; cn: string }
}> = {
  beginner: {
    color: 'emerald',
    label: { en: 'Beginner', cn: '入门' }
  },
  intermediate: {
    color: 'amber',
    label: { en: 'Intermediate', cn: '中级' }
  },
  advanced: {
    color: 'red',
    label: { en: 'Advanced', cn: '高级' }
  }
};

// 标签配置
export const tagConfig: Record<CaseTag, { label: { en: string; cn: string } }> = {
  'production': { label: { en: 'Production', cn: '生产计划' } },
  'inventory': { label: { en: 'Inventory', cn: '库存管理' } },
  'delivery': { label: { en: 'Delivery', cn: '配送调度' } },
  'quality': { label: { en: 'Quality', cn: '质量控制' } },
  'maintenance': { label: { en: 'Maintenance', cn: '设备维护' } },
  'supply-chain': { label: { en: 'Supply Chain', cn: '供应链' } },
  'customer': { label: { en: 'Customer', cn: '客户服务' } },
  'workforce': { label: { en: 'Workforce', cn: '人力调度' } },
  'analytics': { label: { en: 'Analytics', cn: '数据分析' } },
  'ai-augmented': { label: { en: 'AI Augmented', cn: 'AI增强' } }
};
