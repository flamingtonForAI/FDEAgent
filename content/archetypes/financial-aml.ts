/**
 * 金融服务反洗钱 Archetype
 * Financial Services AML & Fraud Detection Archetype
 *
 * 基于 Palantir 与 Societe Generale、UniCredit 合作案例的反洗钱原型
 * 覆盖：交易监控、可疑活动报告、KYC、欺诈检测
 *
 * 参考来源：
 * - Palantir Anti-Money Laundering Solutions
 * - Palantir & Societe Generale Partnership
 * - Palantir Foundry for Financial Services
 * - FATF Guidelines for AML/CFT
 *
 * 适用行业：银行、保险、证券、支付机构
 * 部署周期：4-6 周（含合规审查和系统对接）
 */

import { Archetype } from '../../types/archetype';

export const financialAmlArchetype: Archetype = {
  metadata: {
    id: 'financial-aml',
    name: 'Financial AML & Fraud Detection',
    description: {
      en: 'Comprehensive anti-money laundering and fraud detection platform inspired by Palantir partnerships with Societe Generale and major global banks, covering transaction monitoring, suspicious activity reporting, KYC, and multi-factor fraud detection with AI-powered risk scoring.',
      cn: '基于 Palantir 与法国兴业银行及全球主要银行合作案例的综合反洗钱与欺诈检测平台，覆盖交易监控、可疑活动报告、KYC 和多因子欺诈检测，配备AI驱动的风险评分能力。'
    },
    industry: 'financial-services',
    domain: 'aml-fraud-detection',
    version: '1.0.0',
    changelog: [
      {
        version: '1.0.0',
        date: '2026-02-06',
        changes: [
          'Initial archetype based on Palantir AML solutions',
          'Multi-factor transaction monitoring',
          'AI-powered alert prioritization',
          'Network analysis for money laundering',
          'Real-time fraud scoring'
        ]
      }
    ],
    origin: {
      sourceEngagement: 'Societe Generale, UniCredit, Global Banks',
      fdeContributors: ['Financial Crime Team', 'Compliance Analytics Group'],
      abstractionDate: '2026-02-06'
    },
    usage: {
      deployments: 28,
      industries: ['Retail Banking', 'Investment Banking', 'Insurance', 'Payment Services'],
      avgDeploymentTime: '5 weeks'
    }
  },

  ontology: {
    objects: [
      // ============= 客户 (Customer) =============
      {
        id: 'customer',
        name: 'Customer',
        nameCn: '客户',
        description: 'A bank customer with KYC profile and risk attributes',
        descriptionCn: '具有 KYC 档案和风险属性的银行客户',
        properties: [
          { name: 'customerId', type: 'string', description: 'Unique customer identifier' },
          { name: 'customerType', type: 'string', description: 'Individual/Corporate/Financial Institution' },
          { name: 'fullName', type: 'string', description: 'Legal name' },
          { name: 'dateOfBirth', type: 'date', description: 'Date of birth (individuals)' },
          { name: 'nationality', type: 'string', description: 'Nationality' },
          { name: 'residenceCountry', type: 'string', description: 'Country of residence' },
          { name: 'occupation', type: 'string', description: 'Occupation or business type' },
          { name: 'onboardingDate', type: 'date', description: 'Account opening date' },
          { name: 'kycStatus', type: 'string', description: 'Verified/Pending/Expired/Enhanced' },
          { name: 'kycLastReview', type: 'date', description: 'Last KYC review date' },
          { name: 'pepStatus', type: 'boolean', description: 'Politically Exposed Person flag' },
          { name: 'sanctionsStatus', type: 'string', description: 'Clear/Match/PotentialMatch' },
          { name: 'adverseMedia', type: 'boolean', description: 'Adverse media flag' },
          // AI-derived
          {
            name: 'riskScore',
            type: 'number',
            description: 'AI-calculated customer risk score 0-100',
            isAIDerived: true,
            logicDescription: 'ML model combining KYC factors, transaction patterns, and external data'
          },
          {
            name: 'riskCategory',
            type: 'string',
            description: 'Risk category (Low/Medium/High/Prohibited)',
            isAIDerived: true,
            logicDescription: 'Derived from risk score and policy rules'
          },
          {
            name: 'behaviorAnomaly',
            type: 'boolean',
            description: 'Unusual behavior detected flag',
            isAIDerived: true,
            logicDescription: 'Anomaly detection comparing to peer group and historical patterns'
          }
        ],
        primaryKey: 'customerId',
        actions: [
          {
            name: 'Initiate KYC Review',
            nameCn: '发起 KYC 审查',
            type: 'traditional',
            description: 'Initiate periodic or triggered KYC review',
            businessLayer: {
              description: '发起定期或触发式 KYC 审查',
              targetObject: 'Customer',
              executorRole: 'KYC Analyst',
              triggerCondition: 'KYC 到期或风险评分变化'
            },
            logicLayer: {
              preconditions: ['客户存在于系统中'],
              parameters: [
                { name: 'customerId', type: 'string', required: true, description: '客户ID' },
                { name: 'reviewType', type: 'string', required: true, description: '审查类型' },
                { name: 'triggerReason', type: 'string', required: true, description: '触发原因' }
              ],
              postconditions: ['KYC 状态更新为 Pending', '审查任务已创建'],
              sideEffects: ['分配给分析师', '请求客户补充文件']
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          },
          {
            name: 'Escalate to EDD',
            nameCn: '升级到增强尽调',
            type: 'traditional',
            description: 'Escalate customer to Enhanced Due Diligence review',
            businessLayer: {
              description: '将客户升级到增强尽职调查审查',
              targetObject: 'Customer',
              executorRole: 'Compliance Officer',
              triggerCondition: '风险评分超过阈值或 PEP/制裁匹配'
            },
            logicLayer: {
              preconditions: ['风险评分 > 70 或 PEP 匹配'],
              parameters: [
                { name: 'customerId', type: 'string', required: true, description: '客户ID' },
                { name: 'eddReason', type: 'string', required: true, description: 'EDD 原因' },
                { name: 'additionalDocuments', type: 'array', required: false, description: '所需补充文件' }
              ],
              postconditions: ['KYC 状态更新为 Enhanced', 'EDD 案例已创建'],
              sideEffects: ['通知高级合规官', '冻结高风险交易']
            },
            governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'high' }
          }
        ],
        aiFeatures: [
          {
            type: 'Smart Property (LLM Derived)',
            description: 'AI-calculated customer risk score and behavioral analysis'
          }
        ]
      },

      // ============= 交易 (Transaction) =============
      {
        id: 'transaction',
        name: 'Transaction',
        nameCn: '交易',
        description: 'A financial transaction subject to monitoring',
        descriptionCn: '受监控的金融交易',
        properties: [
          { name: 'transactionId', type: 'string', description: 'Unique transaction identifier' },
          { name: 'transactionType', type: 'string', description: 'Wire/ACH/Card/Cash/Check' },
          { name: 'direction', type: 'string', description: 'Inbound/Outbound/Internal' },
          { name: 'amount', type: 'number', description: 'Transaction amount' },
          { name: 'currency', type: 'string', description: 'Currency code' },
          { name: 'timestamp', type: 'timestamp', description: 'Transaction timestamp' },
          { name: 'originatorId', type: 'string', description: 'Sending customer ID' },
          { name: 'beneficiaryId', type: 'string', description: 'Receiving customer ID' },
          { name: 'originatorCountry', type: 'string', description: 'Origin country' },
          { name: 'beneficiaryCountry', type: 'string', description: 'Destination country' },
          { name: 'purpose', type: 'string', description: 'Stated transaction purpose' },
          { name: 'channel', type: 'string', description: 'Branch/Online/Mobile/ATM' },
          // AI-derived
          {
            name: 'suspicionScore',
            type: 'number',
            description: 'AI-calculated suspicion score 0-100',
            isAIDerived: true,
            logicDescription: 'Multi-factor model considering amount, pattern, counterparty, and geography'
          },
          {
            name: 'alertTriggers',
            type: 'array',
            description: 'Triggered alert rules',
            isAIDerived: true,
            logicDescription: 'Rule-based and ML-based alert detection'
          },
          {
            name: 'structuringFlag',
            type: 'boolean',
            description: 'Potential structuring detected',
            isAIDerived: true,
            logicDescription: 'Pattern analysis for deliberate threshold avoidance'
          }
        ],
        primaryKey: 'transactionId',
        actions: [
          {
            name: 'Flag for Review',
            nameCn: '标记审查',
            type: 'traditional',
            description: 'Flag transaction for manual review',
            businessLayer: {
              description: '标记交易进行人工审查',
              targetObject: 'Transaction',
              executorRole: 'Transaction Monitoring System',
              triggerCondition: '怀疑评分超过阈值'
            },
            logicLayer: {
              preconditions: ['交易已处理'],
              parameters: [
                { name: 'transactionId', type: 'string', required: true, description: '交易ID' },
                { name: 'flagReason', type: 'string', required: true, description: '标记原因' },
                { name: 'priority', type: 'string', required: true, description: '优先级' }
              ],
              postconditions: ['告警已创建', '交易已标记'],
              sideEffects: ['分配给分析师']
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Block Transaction',
            nameCn: '阻止交易',
            type: 'traditional',
            description: 'Block high-risk transaction pending review',
            businessLayer: {
              description: '阻止高风险交易等待审查',
              targetObject: 'Transaction',
              executorRole: 'Compliance Officer',
              triggerCondition: '极高风险评分或制裁匹配'
            },
            logicLayer: {
              preconditions: ['交易处于待处理状态', '风险评分 > 90 或制裁匹配'],
              parameters: [
                { name: 'transactionId', type: 'string', required: true, description: '交易ID' },
                { name: 'blockReason', type: 'string', required: true, description: '阻止原因' }
              ],
              postconditions: ['交易已阻止', '案例已升级'],
              sideEffects: ['通知客户', '通知管理层']
            },
            governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'high' }
          }
        ],
        aiFeatures: [
          {
            type: 'Smart Property (LLM Derived)',
            description: 'Real-time transaction risk scoring and pattern detection'
          }
        ]
      },

      // ============= 告警 (Alert) =============
      {
        id: 'alert',
        name: 'Alert',
        nameCn: '告警',
        description: 'A compliance alert requiring investigation',
        descriptionCn: '需要调查的合规告警',
        properties: [
          { name: 'alertId', type: 'string', description: 'Unique alert identifier' },
          { name: 'alertType', type: 'string', description: 'Transaction/Behavior/Sanctions/PEP/AdverseMedia' },
          { name: 'severity', type: 'string', description: 'Critical/High/Medium/Low' },
          { name: 'status', type: 'string', description: 'Open/InReview/Escalated/Closed' },
          { name: 'createdAt', type: 'timestamp', description: 'Alert creation time' },
          { name: 'customerId', type: 'string', description: 'Related customer' },
          { name: 'transactionIds', type: 'array', description: 'Related transactions' },
          { name: 'ruleId', type: 'string', description: 'Triggering rule ID' },
          { name: 'ruleDescription', type: 'string', description: 'Rule description' },
          { name: 'assignedTo', type: 'string', description: 'Assigned analyst' },
          { name: 'dueDate', type: 'date', description: 'Resolution due date' },
          { name: 'resolution', type: 'string', description: 'SAR/Dismiss/EDD/NoAction' },
          { name: 'resolutionNotes', type: 'string', description: 'Investigation notes' },
          // AI-derived
          {
            name: 'truePosLikelihood',
            type: 'number',
            description: 'AI-estimated true positive likelihood',
            isAIDerived: true,
            logicDescription: 'Based on historical disposition patterns and case similarity'
          },
          {
            name: 'suggestedResolution',
            type: 'string',
            description: 'AI-suggested resolution path',
            isAIDerived: true,
            logicDescription: 'Based on similar historical cases and investigation patterns'
          },
          {
            name: 'networkConnections',
            type: 'array',
            description: 'Related entities in money flow network',
            isAIDerived: true,
            logicDescription: 'Graph analysis of transaction flows and entity relationships'
          }
        ],
        primaryKey: 'alertId',
        actions: [
          {
            name: 'Assign Alert',
            nameCn: '分配告警',
            type: 'traditional',
            description: 'Assign alert to analyst for investigation',
            businessLayer: {
              description: '将告警分配给分析师进行调查',
              targetObject: 'Alert',
              executorRole: 'Team Lead',
              triggerCondition: '新告警创建或重新分配'
            },
            logicLayer: {
              preconditions: ['告警状态为 Open', '分析师可用'],
              parameters: [
                { name: 'alertId', type: 'string', required: true, description: '告警ID' },
                { name: 'analystId', type: 'string', required: true, description: '分析师ID' },
                { name: 'priority', type: 'string', required: false, description: '优先级调整' }
              ],
              postconditions: ['告警已分配', '状态更新为 InReview'],
              sideEffects: ['通知分析师', '启动 SLA 计时']
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Close Alert',
            nameCn: '关闭告警',
            type: 'traditional',
            description: 'Close alert with resolution decision',
            businessLayer: {
              description: '以决议结果关闭告警',
              targetObject: 'Alert',
              executorRole: 'AML Analyst',
              triggerCondition: '调查完成'
            },
            logicLayer: {
              preconditions: ['调查已完成', '决议已记录'],
              parameters: [
                { name: 'alertId', type: 'string', required: true, description: '告警ID' },
                { name: 'resolution', type: 'string', required: true, description: '决议' },
                { name: 'notes', type: 'string', required: true, description: '调查笔记' }
              ],
              postconditions: ['状态更新为 Closed', '决议已记录'],
              sideEffects: ['更新客户风险', '触发后续行动（如 SAR）']
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          },
          {
            name: 'File SAR',
            nameCn: '提交 SAR',
            type: 'traditional',
            description: 'File Suspicious Activity Report with regulator',
            businessLayer: {
              description: '向监管机构提交可疑活动报告',
              targetObject: 'Alert',
              executorRole: 'BSA Officer',
              triggerCondition: '告警决议为 SAR'
            },
            logicLayer: {
              preconditions: ['告警已关闭', '决议为 SAR', 'SAR 草稿已审核'],
              parameters: [
                { name: 'alertId', type: 'string', required: true, description: '告警ID' },
                { name: 'sarType', type: 'string', required: true, description: 'SAR 类型' },
                { name: 'narrative', type: 'string', required: true, description: 'SAR 叙述' }
              ],
              postconditions: ['SAR 已提交', '记录已保存'],
              sideEffects: ['通知高管', '更新客户档案']
            },
            governance: { permissionTier: 4, requiresHumanApproval: true, auditLog: true, riskLevel: 'high' }
          },
          {
            name: 'AI Generate Narrative',
            nameCn: 'AI 生成叙述',
            type: 'generative',
            description: 'AI-generate investigation narrative for SAR',
            aiLogic: 'Analyze case details and generate compliant SAR narrative',
            businessLayer: {
              description: 'AI 分析案例详情并生成合规的 SAR 叙述',
              targetObject: 'Alert',
              executorRole: 'AI Agent',
              triggerCondition: '分析师请求 SAR 草稿'
            },
            logicLayer: {
              preconditions: ['调查已完成', '相关数据已收集'],
              parameters: [
                { name: 'alertId', type: 'string', required: true, description: '告警ID' },
                { name: 'narrativeType', type: 'string', required: true, description: '叙述类型' }
              ],
              postconditions: ['叙述草稿已生成'],
              sideEffects: ['提交人工审核']
            },
            governance: { permissionTier: 2, requiresHumanApproval: true, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          {
            type: 'Smart Property (LLM Derived)',
            description: 'AI alert prioritization and false positive reduction'
          },
          {
            type: 'Generative Action (AI Output)',
            description: 'AI-generated investigation narratives and SAR drafts'
          }
        ]
      },

      // ============= 制裁名单 (Sanctions List) =============
      {
        id: 'sanctions-entry',
        name: 'Sanctions Entry',
        nameCn: '制裁名单条目',
        description: 'Entry from sanctions and watchlists',
        descriptionCn: '制裁名单和监控名单条目',
        properties: [
          { name: 'entryId', type: 'string', description: 'Unique entry identifier' },
          { name: 'listSource', type: 'string', description: 'OFAC/EU/UN/UK/Local' },
          { name: 'entityType', type: 'string', description: 'Individual/Entity/Vessel' },
          { name: 'name', type: 'string', description: 'Listed name' },
          { name: 'aliases', type: 'array', description: 'Known aliases' },
          { name: 'nationality', type: 'string', description: 'Nationality' },
          { name: 'dateOfBirth', type: 'date', description: 'Date of birth' },
          { name: 'sanctionProgram', type: 'string', description: 'Sanctions program' },
          { name: 'listingDate', type: 'date', description: 'Date added to list' },
          { name: 'status', type: 'string', description: 'Active/Removed' }
        ],
        primaryKey: 'entryId',
        actions: [],
        aiFeatures: [
          {
            type: 'Semantic Search (Vector Linking)',
            description: 'Fuzzy name matching and entity resolution against sanctions lists'
          }
        ]
      }
    ],

    links: [
      {
        id: 'customer-transaction',
        source: 'customer',
        target: 'transaction',
        label: 'initiates',
        isSemantic: true
      },
      {
        id: 'transaction-alert',
        source: 'transaction',
        target: 'alert',
        label: 'triggers',
        isSemantic: true
      },
      {
        id: 'customer-alert',
        source: 'customer',
        target: 'alert',
        label: 'subject_of',
        isSemantic: true
      },
      {
        id: 'customer-sanctions',
        source: 'customer',
        target: 'sanctions-entry',
        label: 'matches',
        isSemantic: true
      }
    ]
  },

  connectors: [
    {
      id: 'core-banking',
      name: 'Core Banking System',
      description: { en: 'Customer master data and account information', cn: '核心银行系统客户主数据和账户信息' },
      sourceType: 'api',
      sourceSystem: 'Core Banking System',
      connectionTemplate: {
        requiredFields: [
          { name: 'apiUrl', type: 'string', description: 'Core banking API URL' },
          { name: 'apiKey', type: 'secret', description: 'API key' }
        ]
      },
      sync: { direction: 'bidirectional', frequency: 'realtime', incrementalSync: true },
      mappedObjects: [{ objectId: 'customer', sourceEntity: 'CustomerMaster', fieldMappings: [] }]
    },
    {
      id: 'transaction-feed',
      name: 'Transaction Processing',
      description: { en: 'Real-time transaction feed', cn: '实时交易数据流' },
      sourceType: 'streaming',
      sourceSystem: 'Transaction Processing',
      connectionTemplate: {
        requiredFields: [
          { name: 'endpoint', type: 'string', description: 'Streaming endpoint' },
          { name: 'credentials', type: 'secret', description: 'Authentication' }
        ]
      },
      sync: { direction: 'inbound', frequency: 'streaming', incrementalSync: true },
      mappedObjects: [{ objectId: 'transaction', sourceEntity: 'TransactionEvent', fieldMappings: [] }]
    },
    {
      id: 'sanctions-provider',
      name: 'Sanctions Provider',
      description: { en: 'Global sanctions and watchlist data (Dow Jones/Refinitiv)', cn: '全球制裁和监视名单数据' },
      sourceType: 'api',
      sourceSystem: 'Sanctions Provider',
      connectionTemplate: {
        requiredFields: [
          { name: 'apiUrl', type: 'string', description: 'Sanctions API URL' },
          { name: 'apiKey', type: 'secret', description: 'API key' }
        ]
      },
      sync: { direction: 'inbound', frequency: 'daily', incrementalSync: true },
      mappedObjects: [{ objectId: 'sanctions-entry', sourceEntity: 'WatchlistEntry', fieldMappings: [] }]
    }
  ],

  workflows: [
    {
      id: 'aml-alert-workflow',
      name: 'AML Alert Investigation',
      description: { en: 'End-to-end AML alert investigation workflow', cn: '端到端反洗钱告警调查流程' },
      trigger: { type: 'event', config: { eventType: 'high_risk_alert' } },
      steps: [
        { id: 'triage', name: 'Alert Triage', description: { en: 'AI-assisted alert triage', cn: 'AI辅助告警分流' }, type: 'action', nextSteps: ['investigate'] },
        { id: 'investigate', name: 'Investigation', description: { en: 'Analyst investigation', cn: '分析师调查' }, type: 'action', nextSteps: ['decide'] },
        { id: 'decide', name: 'Decision', description: { en: 'File SAR or dismiss', cn: '提交SAR或关闭' }, type: 'action' }
      ],
      entryStep: 'triage',
      roles: ['AML Analyst', 'AML Manager', 'Compliance Officer'],
      sla: { maxDuration: '72h', escalationPath: ['AML Manager', 'BSA Officer'] }
    }
  ],

  rules: [
    {
      id: 'high-value-alert',
      name: 'High Value Transaction Alert',
      description: { en: 'Alert on high value transactions', cn: '高额交易告警' },
      type: 'trigger',
      appliesTo: ['transaction'],
      expression: 'amount > 10000 && suspicionScore > 0.7'
    }
  ],

  aiCapabilities: [
    {
      id: 'transaction-scoring',
      name: 'Transaction Risk Scoring',
      type: 'prediction',
      description: { en: 'Multi-factor ML model for transaction risk scoring', cn: '多因子交易风险评分ML模型' },
      enabledActions: ['AI Risk Score'],
      modelConfig: { modelType: 'risk-classifier', trainingDataRequirements: 'Historical transactions with SAR outcomes' }
    },
    {
      id: 'network-analysis',
      name: 'Money Flow Network Analysis',
      type: 'parsing',
      description: { en: 'Graph-based analysis to detect laundering networks', cn: '图分析检测洗钱网络' },
      enabledActions: ['AI Network Analysis'],
      modelConfig: { modelType: 'graph-model', trainingDataRequirements: 'Transaction graph data with labeled laundering cases' }
    },
    {
      id: 'sar-generation',
      name: 'SAR Narrative Generation',
      type: 'generation',
      description: { en: 'AI-assisted SAR narrative drafting', cn: 'AI辅助SAR叙述起草' },
      enabledActions: ['AI Generate SAR'],
      modelConfig: { modelType: 'llm', trainingDataRequirements: 'Historical SAR narratives' }
    }
  ],

  dashboards: [
    {
      id: 'aml-operations',
      name: 'AML Operations Dashboard',
      description: { en: 'Real-time AML operations monitoring', cn: '实时反洗钱运营监控' },
      targetRole: 'AML Manager',
      gridColumns: 12,
      gridRows: 8,
      widgets: [
        { id: 'alert-queue', type: 'list', title: { en: 'Alert Queue', cn: '告警队列' }, dataSource: { objectId: 'alert' }, layout: { x: 0, y: 0, width: 6, height: 4 } },
        { id: 'risk-heatmap', type: 'chart', title: { en: 'Risk Distribution', cn: '风险分布' }, dataSource: { objectId: 'customer', aggregation: 'count by riskRating' }, layout: { x: 6, y: 0, width: 6, height: 4 } },
        { id: 'kpis', type: 'kpi', title: { en: 'AML KPIs', cn: '反洗钱KPI' }, dataSource: { objectId: 'alert' }, layout: { x: 0, y: 4, width: 12, height: 2 } }
      ]
    }
  ],

  views: [
    {
      id: 'alert-list',
      name: 'AML Alerts',
      type: 'list',
      objectId: 'alert',
      fields: [
        { property: 'alertId', label: { en: 'Alert ID', cn: '告警ID' }, visible: true, sortable: true },
        { property: 'alertType', label: { en: 'Type', cn: '类型' }, visible: true, filterable: true },
        { property: 'riskScore', label: { en: 'Risk', cn: '风险' }, visible: true, sortable: true },
        { property: 'status', label: { en: 'Status', cn: '状态' }, visible: true, filterable: true }
      ],
      defaultSort: { property: 'riskScore', direction: 'desc' }
    }
  ],

  deployment: {
    requirements: {
      platform: ['DataPlatform', 'AgentFramework'],
      minVersion: '2.0.0',
      resources: { cpu: '8 cores', memory: '32GB', storage: '500GB' }
    },
    environmentVariables: [
      { name: 'CORE_BANKING_API', description: 'Core banking API URL', required: true },
      { name: 'SANCTIONS_API_KEY', description: 'Sanctions provider API key', required: true },
      { name: 'TRANSACTION_STREAM', description: 'Transaction streaming endpoint', required: true }
    ]
  },

  documentation: {
    quickStart: {
      en: '1. Connect to core banking system\\n2. Configure transaction streaming\\n3. Import sanctions data\\n4. Enable ML risk models\\n5. Configure alert thresholds',
      cn: '1. 连接核心银行系统\\n2. 配置交易流\\n3. 导入制裁数据\\n4. 启用ML风险模型\\n5. 配置告警阈值'
    },
    bestPractices: [
      'Enable real-time transaction scoring for immediate risk detection',
      'Use network analysis to uncover complex laundering schemes',
      'Leverage AI-generated SAR narratives to improve analyst productivity'
    ]
  }
};
