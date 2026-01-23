
import { ProjectState, OntologyObject, OntologyLink, AIPAction } from '../types';

// ============= Quality Check Types =============

export type Severity = 'error' | 'warning' | 'info';
export type Category = 'object' | 'action' | 'link' | 'integration' | 'architecture';

export interface QualityRule {
  id: string;
  name: { en: string; cn: string };
  description: { en: string; cn: string };
  category: Category;
  severity: Severity;
  check: (project: ProjectState) => QualityIssue[];
}

export interface QualityIssue {
  ruleId: string;
  severity: Severity;
  category: Category;
  message: { en: string; cn: string };
  target?: {
    type: 'object' | 'action' | 'link' | 'integration';
    id: string;
    name: string;
  };
  suggestion?: { en: string; cn: string };
}

export interface QualityReport {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  totalChecks: number;
  passed: number;
  issues: QualityIssue[];
  byCategory: Record<Category, { total: number; issues: number }>;
  bySeverity: Record<Severity, number>;
}

// ============= Quality Rules =============

export const qualityRules: QualityRule[] = [
  // === Object Rules ===
  {
    id: 'object-has-description',
    name: { en: 'Object Description', cn: '对象描述' },
    description: { en: 'Every object should have a description', cn: '每个对象都应该有描述' },
    category: 'object',
    severity: 'warning',
    check: (project) => {
      const issues: QualityIssue[] = [];
      project.objects.forEach(obj => {
        if (!obj.description || obj.description.trim().length < 10) {
          issues.push({
            ruleId: 'object-has-description',
            severity: 'warning',
            category: 'object',
            message: {
              en: `Object "${obj.name}" lacks a proper description`,
              cn: `对象 "${obj.name}" 缺少描述`
            },
            target: { type: 'object', id: obj.id, name: obj.name },
            suggestion: {
              en: 'Add a clear description explaining the business meaning of this object',
              cn: '添加清晰的描述来解释该对象的业务含义'
            }
          });
        }
      });
      return issues;
    }
  },
  {
    id: 'object-has-properties',
    name: { en: 'Object Properties', cn: '对象属性' },
    description: { en: 'Every object should have at least one property', cn: '每个对象至少应该有一个属性' },
    category: 'object',
    severity: 'error',
    check: (project) => {
      const issues: QualityIssue[] = [];
      project.objects.forEach(obj => {
        if (!obj.properties || obj.properties.length === 0) {
          issues.push({
            ruleId: 'object-has-properties',
            severity: 'error',
            category: 'object',
            message: {
              en: `Object "${obj.name}" has no properties defined`,
              cn: `对象 "${obj.name}" 没有定义属性`
            },
            target: { type: 'object', id: obj.id, name: obj.name },
            suggestion: {
              en: 'Define properties that describe the attributes of this object',
              cn: '定义描述该对象特征的属性'
            }
          });
        }
      });
      return issues;
    }
  },
  {
    id: 'object-has-primary-key',
    name: { en: 'Object Primary Key', cn: '对象主键' },
    description: { en: 'Every object should have an ID or primary key property', cn: '每个对象应该有一个ID或主键属性' },
    category: 'object',
    severity: 'warning',
    check: (project) => {
      const issues: QualityIssue[] = [];
      const pkPatterns = ['id', 'key', 'pk', 'uuid', 'guid', 'code', '编号', '编码', '主键'];
      project.objects.forEach(obj => {
        const hasPK = obj.properties?.some(p =>
          pkPatterns.some(pattern => p.name.toLowerCase().includes(pattern))
        );
        if (!hasPK && obj.properties && obj.properties.length > 0) {
          issues.push({
            ruleId: 'object-has-primary-key',
            severity: 'warning',
            category: 'object',
            message: {
              en: `Object "${obj.name}" may not have a primary key property`,
              cn: `对象 "${obj.name}" 可能没有主键属性`
            },
            target: { type: 'object', id: obj.id, name: obj.name },
            suggestion: {
              en: 'Add an ID or unique identifier property',
              cn: '添加一个 ID 或唯一标识符属性'
            }
          });
        }
      });
      return issues;
    }
  },
  {
    id: 'object-has-actions',
    name: { en: 'Object Actions', cn: '对象动作' },
    description: { en: 'Objects should have at least one action defined', cn: '对象至少应该定义一个动作' },
    category: 'object',
    severity: 'info',
    check: (project) => {
      const issues: QualityIssue[] = [];
      project.objects.forEach(obj => {
        if (!obj.actions || obj.actions.length === 0) {
          issues.push({
            ruleId: 'object-has-actions',
            severity: 'info',
            category: 'object',
            message: {
              en: `Object "${obj.name}" has no actions defined`,
              cn: `对象 "${obj.name}" 没有定义动作`
            },
            target: { type: 'object', id: obj.id, name: obj.name },
            suggestion: {
              en: 'Consider what operations can be performed on this object',
              cn: '考虑可以对该对象执行哪些操作'
            }
          });
        }
      });
      return issues;
    }
  },

  // === Action Rules ===
  {
    id: 'action-has-business-layer',
    name: { en: 'Action Business Layer', cn: '动作业务层' },
    description: { en: 'Actions should have business layer definition', cn: '动作应该有业务层定义' },
    category: 'action',
    severity: 'warning',
    check: (project) => {
      const issues: QualityIssue[] = [];
      project.objects.forEach(obj => {
        obj.actions?.forEach(action => {
          if (!action.businessLayer || !action.businessLayer.description) {
            issues.push({
              ruleId: 'action-has-business-layer',
              severity: 'warning',
              category: 'action',
              message: {
                en: `Action "${action.name}" on "${obj.name}" lacks business layer definition`,
                cn: `"${obj.name}" 的动作 "${action.name}" 缺少业务层定义`
              },
              target: { type: 'action', id: obj.id, name: `${obj.name}.${action.name}` },
              suggestion: {
                en: 'Define the business description, executor role, and trigger condition',
                cn: '定义业务描述、执行角色和触发条件'
              }
            });
          }
        });
      });
      return issues;
    }
  },
  {
    id: 'action-has-preconditions',
    name: { en: 'Action Preconditions', cn: '动作前置条件' },
    description: { en: 'Actions should define preconditions', cn: '动作应该定义前置条件' },
    category: 'action',
    severity: 'warning',
    check: (project) => {
      const issues: QualityIssue[] = [];
      project.objects.forEach(obj => {
        obj.actions?.forEach(action => {
          if (!action.logicLayer?.preconditions || action.logicLayer.preconditions.length === 0) {
            issues.push({
              ruleId: 'action-has-preconditions',
              severity: 'warning',
              category: 'action',
              message: {
                en: `Action "${action.name}" on "${obj.name}" has no preconditions`,
                cn: `"${obj.name}" 的动作 "${action.name}" 没有前置条件`
              },
              target: { type: 'action', id: obj.id, name: `${obj.name}.${action.name}` },
              suggestion: {
                en: 'Define what conditions must be met before this action can execute',
                cn: '定义执行此动作前必须满足的条件'
              }
            });
          }
        });
      });
      return issues;
    }
  },
  {
    id: 'action-has-postconditions',
    name: { en: 'Action Postconditions', cn: '动作后置状态' },
    description: { en: 'Actions should define postconditions (state changes)', cn: '动作应该定义后置状态（状态变更）' },
    category: 'action',
    severity: 'warning',
    check: (project) => {
      const issues: QualityIssue[] = [];
      project.objects.forEach(obj => {
        obj.actions?.forEach(action => {
          if (!action.logicLayer?.postconditions || action.logicLayer.postconditions.length === 0) {
            issues.push({
              ruleId: 'action-has-postconditions',
              severity: 'warning',
              category: 'action',
              message: {
                en: `Action "${action.name}" on "${obj.name}" has no postconditions`,
                cn: `"${obj.name}" 的动作 "${action.name}" 没有后置状态`
              },
              target: { type: 'action', id: obj.id, name: `${obj.name}.${action.name}` },
              suggestion: {
                en: 'Define what state changes occur after this action executes',
                cn: '定义此动作执行后的状态变更'
              }
            });
          }
        });
      });
      return issues;
    }
  },
  {
    id: 'action-has-parameters',
    name: { en: 'Action Parameters', cn: '动作参数' },
    description: { en: 'Non-trivial actions should have parameters', cn: '非简单动作应该有参数' },
    category: 'action',
    severity: 'info',
    check: (project) => {
      const issues: QualityIssue[] = [];
      const simpleActions = ['delete', 'remove', 'cancel', 'close', 'archive', '删除', '移除', '取消', '关闭', '归档'];
      project.objects.forEach(obj => {
        obj.actions?.forEach(action => {
          const isSimple = simpleActions.some(s => action.name.toLowerCase().includes(s));
          if (!isSimple && (!action.logicLayer?.parameters || action.logicLayer.parameters.length === 0)) {
            issues.push({
              ruleId: 'action-has-parameters',
              severity: 'info',
              category: 'action',
              message: {
                en: `Action "${action.name}" on "${obj.name}" has no input parameters`,
                cn: `"${obj.name}" 的动作 "${action.name}" 没有输入参数`
              },
              target: { type: 'action', id: obj.id, name: `${obj.name}.${action.name}` },
              suggestion: {
                en: 'Consider what inputs are needed to execute this action',
                cn: '考虑执行此动作需要哪些输入'
              }
            });
          }
        });
      });
      return issues;
    }
  },
  {
    id: 'action-has-governance',
    name: { en: 'Action Governance', cn: '动作治理' },
    description: { en: 'Actions should have governance settings', cn: '动作应该有治理设置' },
    category: 'action',
    severity: 'info',
    check: (project) => {
      const issues: QualityIssue[] = [];
      project.objects.forEach(obj => {
        obj.actions?.forEach(action => {
          if (!action.governance) {
            issues.push({
              ruleId: 'action-has-governance',
              severity: 'info',
              category: 'action',
              message: {
                en: `Action "${action.name}" on "${obj.name}" has no governance settings`,
                cn: `"${obj.name}" 的动作 "${action.name}" 没有治理设置`
              },
              target: { type: 'action', id: obj.id, name: `${obj.name}.${action.name}` },
              suggestion: {
                en: 'Define permission tier, approval requirements, and risk level',
                cn: '定义权限等级、审批要求和风险等级'
              }
            });
          }
        });
      });
      return issues;
    }
  },
  {
    id: 'action-has-api-endpoint',
    name: { en: 'Action API Endpoint', cn: '动作API端点' },
    description: { en: 'Actions should have API implementation defined', cn: '动作应该定义API实现' },
    category: 'action',
    severity: 'info',
    check: (project) => {
      const issues: QualityIssue[] = [];
      project.objects.forEach(obj => {
        obj.actions?.forEach(action => {
          if (!action.implementationLayer?.apiEndpoint) {
            issues.push({
              ruleId: 'action-has-api-endpoint',
              severity: 'info',
              category: 'action',
              message: {
                en: `Action "${action.name}" on "${obj.name}" has no API endpoint defined`,
                cn: `"${obj.name}" 的动作 "${action.name}" 没有定义API端点`
              },
              target: { type: 'action', id: obj.id, name: `${obj.name}.${action.name}` },
              suggestion: {
                en: 'Define the REST API endpoint for this action',
                cn: '为此动作定义 REST API 端点'
              }
            });
          }
        });
      });
      return issues;
    }
  },

  // === Link Rules ===
  {
    id: 'link-has-label',
    name: { en: 'Link Label', cn: '关系标签' },
    description: { en: 'Links should have meaningful labels', cn: '关系应该有有意义的标签' },
    category: 'link',
    severity: 'warning',
    check: (project) => {
      const issues: QualityIssue[] = [];
      project.links.forEach(link => {
        if (!link.label || link.label.trim().length < 2) {
          const sourceName = project.objects.find(o => o.id === link.source)?.name || link.source;
          const targetName = project.objects.find(o => o.id === link.target)?.name || link.target;
          issues.push({
            ruleId: 'link-has-label',
            severity: 'warning',
            category: 'link',
            message: {
              en: `Link between "${sourceName}" and "${targetName}" lacks a proper label`,
              cn: `"${sourceName}" 和 "${targetName}" 之间的关系缺少标签`
            },
            target: { type: 'link', id: link.id, name: `${sourceName} → ${targetName}` },
            suggestion: {
              en: 'Add a label describing the relationship (e.g., "has", "belongs to", "contains")',
              cn: '添加描述关系的标签（如 "包含"、"属于"、"关联"）'
            }
          });
        }
      });
      return issues;
    }
  },
  {
    id: 'no-orphan-objects',
    name: { en: 'No Orphan Objects', cn: '无孤立对象' },
    description: { en: 'Objects should be connected via links', cn: '对象应该通过关系连接' },
    category: 'link',
    severity: 'info',
    check: (project) => {
      const issues: QualityIssue[] = [];
      if (project.objects.length > 1) {
        const connectedIds = new Set<string>();
        project.links.forEach(link => {
          connectedIds.add(link.source);
          connectedIds.add(link.target);
        });

        project.objects.forEach(obj => {
          if (!connectedIds.has(obj.id)) {
            issues.push({
              ruleId: 'no-orphan-objects',
              severity: 'info',
              category: 'link',
              message: {
                en: `Object "${obj.name}" is not connected to any other object`,
                cn: `对象 "${obj.name}" 没有与其他对象连接`
              },
              target: { type: 'object', id: obj.id, name: obj.name },
              suggestion: {
                en: 'Consider how this object relates to others in the ontology',
                cn: '考虑该对象与本体中其他对象的关系'
              }
            });
          }
        });
      }
      return issues;
    }
  },

  // === Integration Rules ===
  {
    id: 'integration-has-mechanism',
    name: { en: 'Integration Mechanism', cn: '集成机制' },
    description: { en: 'Integrations should specify sync mechanism', cn: '集成应该指定同步机制' },
    category: 'integration',
    severity: 'warning',
    check: (project) => {
      const issues: QualityIssue[] = [];
      project.integrations.forEach(integration => {
        if (!integration.mechanism) {
          issues.push({
            ruleId: 'integration-has-mechanism',
            severity: 'warning',
            category: 'integration',
            message: {
              en: `Integration "${integration.systemName}" has no sync mechanism defined`,
              cn: `集成 "${integration.systemName}" 没有定义同步机制`
            },
            target: { type: 'integration', id: integration.targetObjectId, name: integration.systemName },
            suggestion: {
              en: 'Specify the integration mechanism (API, Webhook, Batch, etc.)',
              cn: '指定集成机制（API、Webhook、批量等）'
            }
          });
        }
      });
      return issues;
    }
  },
  {
    id: 'integration-has-data-points',
    name: { en: 'Integration Data Points', cn: '集成数据点' },
    description: { en: 'Integrations should specify data points', cn: '集成应该指定数据点' },
    category: 'integration',
    severity: 'warning',
    check: (project) => {
      const issues: QualityIssue[] = [];
      project.integrations.forEach(integration => {
        if (!integration.dataPoints || integration.dataPoints.length === 0) {
          issues.push({
            ruleId: 'integration-has-data-points',
            severity: 'warning',
            category: 'integration',
            message: {
              en: `Integration "${integration.systemName}" has no data points defined`,
              cn: `集成 "${integration.systemName}" 没有定义数据点`
            },
            target: { type: 'integration', id: integration.targetObjectId, name: integration.systemName },
            suggestion: {
              en: 'Specify what data fields are synced from this integration',
              cn: '指定从此集成同步哪些数据字段'
            }
          });
        }
      });
      return issues;
    }
  },

  // === Architecture Rules ===
  {
    id: 'has-objects',
    name: { en: 'Has Objects', cn: '有对象' },
    description: { en: 'Project should have at least one object', cn: '项目至少应该有一个对象' },
    category: 'architecture',
    severity: 'error',
    check: (project) => {
      if (project.objects.length === 0) {
        return [{
          ruleId: 'has-objects',
          severity: 'error',
          category: 'architecture',
          message: {
            en: 'No objects defined in the ontology',
            cn: '本体中没有定义对象'
          },
          suggestion: {
            en: 'Start by identifying the core business entities',
            cn: '首先识别核心业务实体'
          }
        }];
      }
      return [];
    }
  },
  {
    id: 'has-ai-features',
    name: { en: 'AI Features', cn: 'AI特性' },
    description: { en: 'Consider adding AI-enhanced features', cn: '考虑添加AI增强特性' },
    category: 'architecture',
    severity: 'info',
    check: (project) => {
      const issues: QualityIssue[] = [];
      const objectsWithAI = project.objects.filter(obj =>
        obj.aiFeatures && obj.aiFeatures.length > 0
      );

      if (project.objects.length > 0 && objectsWithAI.length === 0) {
        issues.push({
          ruleId: 'has-ai-features',
          severity: 'info',
          category: 'architecture',
          message: {
            en: 'No AI features defined in any object',
            cn: '没有任何对象定义了 AI 特性'
          },
          suggestion: {
            en: 'Consider adding Smart Properties, Parsing Pipelines, or Generative Actions',
            cn: '考虑添加智能属性、解析管道或生成式动作'
          }
        });
      }
      return issues;
    }
  }
];

// ============= Quality Check Runner =============

export function runQualityCheck(project: ProjectState): QualityReport {
  const issues: QualityIssue[] = [];

  // Run all rules
  qualityRules.forEach(rule => {
    const ruleIssues = rule.check(project);
    issues.push(...ruleIssues);
  });

  // Calculate stats
  const bySeverity: Record<Severity, number> = { error: 0, warning: 0, info: 0 };
  const byCategory: Record<Category, { total: number; issues: number }> = {
    object: { total: 0, issues: 0 },
    action: { total: 0, issues: 0 },
    link: { total: 0, issues: 0 },
    integration: { total: 0, issues: 0 },
    architecture: { total: 0, issues: 0 }
  };

  issues.forEach(issue => {
    bySeverity[issue.severity]++;
    byCategory[issue.category].issues++;
  });

  // Count total checks per category
  qualityRules.forEach(rule => {
    byCategory[rule.category].total++;
  });

  // Calculate score (errors: -10, warnings: -5, info: -1)
  const maxScore = 100;
  const errorPenalty = bySeverity.error * 10;
  const warningPenalty = bySeverity.warning * 5;
  const infoPenalty = bySeverity.info * 1;
  const totalPenalty = errorPenalty + warningPenalty + infoPenalty;
  const score = Math.max(0, maxScore - totalPenalty);

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  const totalChecks = qualityRules.length;
  const passed = totalChecks - issues.length;

  return {
    score,
    grade,
    totalChecks,
    passed: Math.max(0, passed),
    issues,
    byCategory,
    bySeverity
  };
}

// Get rule by ID
export function getRuleById(ruleId: string): QualityRule | undefined {
  return qualityRules.find(r => r.id === ruleId);
}

// Get all rules by category
export function getRulesByCategory(category: Category): QualityRule[] {
  return qualityRules.filter(r => r.category === category);
}
