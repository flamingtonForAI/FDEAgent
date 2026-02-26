/**
 * 汽车供应链 Archetype
 * Automotive Supply Chain Archetype
 *
 * 基于 Palantir 与 Stellantis、Lear Corp 合作案例的汽车行业原型
 * 覆盖：生产计划、供应链可视化、质量管理、车联网数据
 *
 * 参考来源：
 * - Palantir & Stellantis Global Partnership
 * - Palantir & Lear Corp Manufacturing Operations
 * - Palantir Warp Speed Manufacturing OS
 * - Automotive Industry Best Practices
 *
 * 适用行业：汽车制造、零部件供应商、出行服务
 * 部署周期：3-5 周（含工厂数据对接）
 */

import { Archetype } from '../../types/archetype';

export const automotiveSupplyChainArchetype: Archetype = {
  metadata: {
    id: 'automotive-supply-chain',
    name: 'Automotive Supply Chain & Manufacturing',
    description: {
      en: 'Comprehensive automotive manufacturing and supply chain platform inspired by Palantir partnerships with Stellantis and Lear Corp, covering production planning, supply visibility, quality management, and connected vehicle analytics with AI-powered demand sensing.',
      cn: '基于 Palantir 与 Stellantis、Lear Corp 合作案例的综合汽车制造与供应链平台，覆盖生产计划、供应可视化、质量管理和车联网分析，配备AI驱动的需求感知能力。'
    },
    industry: 'automotive',
    domain: 'supply-chain-manufacturing',
    version: '1.0.0',
    changelog: [
      {
        version: '1.0.0',
        date: '2026-02-06',
        changes: [
          'Initial archetype based on Stellantis deployment',
          'Digital twin of manufacturing operations',
          'Multi-tier supplier visibility',
          'Connected vehicle data integration',
          'AI quality prediction'
        ]
      }
    ],
    origin: {
      sourceEngagement: 'Stellantis, Lear Corp, VW Group',
      fdeContributors: ['Manufacturing Excellence Team', 'Supply Chain Analytics Group'],
      abstractionDate: '2026-02-06'
    },
    usage: {
      deployments: 18,
      industries: ['OEM Automotive', 'Tier 1 Suppliers', 'Tier 2 Suppliers', 'Mobility Services'],
      avgDeploymentTime: '4 weeks'
    }
  },

  ontology: {
    objects: [
      // ============= 车辆 (Vehicle) =============
      {
        id: 'vehicle',
        name: 'Vehicle',
        nameCn: '车辆',
        description: 'A manufactured vehicle with configuration and quality data',
        descriptionCn: '具有配置和质量数据的制造车辆',
        properties: [
          { name: 'vin', type: 'string', description: 'Vehicle Identification Number' },
          { name: 'model', type: 'string', description: 'Vehicle model' },
          { name: 'trim', type: 'string', description: 'Trim level' },
          { name: 'plant', type: 'string', description: 'Manufacturing plant' },
          { name: 'productionDate', type: 'date', description: 'Production completion date' },
          { name: 'buildStatus', type: 'string', description: 'Planned/InProduction/Complete/Shipped' },
          { name: 'configuration', type: 'object', description: 'Vehicle configuration options' },
          { name: 'orderId', type: 'string', description: 'Customer order reference' },
          { name: 'destinationDealer', type: 'string', description: 'Destination dealer code' },
          { name: 'qualityScore', type: 'number', description: 'Quality inspection score' },
          { name: 'holdStatus', type: 'string', description: 'None/QualityHold/PartsHold' },
          // AI-derived (connected vehicle)
          {
            name: 'predictedIssues',
            type: 'array',
            description: 'Predicted quality issues from connected data',
            isAIDerived: true,
            logicDescription: 'ML analysis of vehicle telemetry patterns indicating potential issues'
          },
          {
            name: 'warrantyRisk',
            type: 'number',
            description: 'Predicted warranty claim risk 0-100',
            isAIDerived: true,
            logicDescription: 'Based on build configuration, supplier quality, and field data'
          }
        ],
        primaryKey: 'vin',
        actions: [
          {
            name: 'Place on Hold',
            nameCn: '暂停',
            type: 'traditional',
            description: 'Place vehicle on quality or parts hold',
            businessLayer: {
              description: '将车辆置于质量或零件暂停状态',
              targetObject: 'Vehicle',
              executorRole: 'Quality Engineer',
              triggerCondition: '质量问题检测或零件短缺'
            },
            logicLayer: {
              preconditions: ['车辆在生产或完成状态'],
              parameters: [
                { name: 'vin', type: 'string', required: true, description: 'VIN' },
                { name: 'holdType', type: 'string', required: true, description: '暂停类型' },
                { name: 'reason', type: 'string', required: true, description: '原因' },
                { name: 'affectedComponents', type: 'array', required: false, description: '受影响组件' }
              ],
              postconditions: ['车辆已暂停', '问题已记录'],
              sideEffects: ['通知生产线', '更新交付计划']
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          },
          {
            name: 'Release from Hold',
            nameCn: '解除暂停',
            type: 'traditional',
            description: 'Release vehicle from hold after issue resolution',
            businessLayer: {
              description: '问题解决后解除车辆暂停',
              targetObject: 'Vehicle',
              executorRole: 'Quality Manager',
              triggerCondition: '问题已修复并验证'
            },
            logicLayer: {
              preconditions: ['车辆处于暂停状态', '修复已验证'],
              parameters: [
                { name: 'vin', type: 'string', required: true, description: 'VIN' },
                { name: 'resolutionNotes', type: 'string', required: true, description: '解决说明' },
                { name: 'inspectorId', type: 'string', required: true, description: '检验员ID' }
              ],
              postconditions: ['暂停已解除', '车辆恢复流程'],
              sideEffects: ['更新质量记录', '通知物流']
            },
            governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          {
            type: 'Smart Property (LLM Derived)',
            description: 'AI-predicted quality issues from connected vehicle data'
          }
        ]
      },

      // ============= 生产订单 (Production Order) =============
      {
        id: 'production-order',
        name: 'Production Order',
        nameCn: '生产订单',
        description: 'A manufacturing order for vehicle production',
        descriptionCn: '车辆生产的制造订单',
        properties: [
          { name: 'orderId', type: 'string', description: 'Production order ID' },
          { name: 'model', type: 'string', description: 'Vehicle model' },
          { name: 'quantity', type: 'number', description: 'Order quantity' },
          { name: 'plant', type: 'string', description: 'Manufacturing plant' },
          { name: 'productionLine', type: 'string', description: 'Production line' },
          { name: 'scheduledStart', type: 'date', description: 'Scheduled start date' },
          { name: 'scheduledEnd', type: 'date', description: 'Scheduled end date' },
          { name: 'status', type: 'string', description: 'Planned/Released/InProgress/Complete' },
          { name: 'priority', type: 'string', description: 'Normal/Rush/Expedite' },
          { name: 'completedQuantity', type: 'number', description: 'Completed units' },
          // AI-derived
          {
            name: 'completionPrediction',
            type: 'date',
            description: 'AI-predicted completion date',
            isAIDerived: true,
            logicDescription: 'Based on current production rate, supply status, and historical delays'
          },
          {
            name: 'riskFactors',
            type: 'array',
            description: 'Identified production risks',
            isAIDerived: true,
            logicDescription: 'Analysis of supply constraints, quality issues, and capacity bottlenecks'
          }
        ],
        primaryKey: 'orderId',
        actions: [
          {
            name: 'Release to Production',
            nameCn: '下发生产',
            type: 'traditional',
            description: 'Release order to production floor',
            businessLayer: {
              description: '将订单下发到生产车间',
              targetObject: 'Production Order',
              executorRole: 'Production Planner',
              triggerCondition: '物料就绪且产能可用'
            },
            logicLayer: {
              preconditions: ['所有物料可用', '产能已分配', '质量参数已设定'],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: '订单ID' },
                { name: 'releaseDate', type: 'date', required: true, description: '下发日期' }
              ],
              postconditions: ['状态更新为 Released', '工位已通知'],
              sideEffects: ['生成作业指导', '准备物料配送']
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          },
          {
            name: 'Reschedule Order',
            nameCn: '重新排程',
            type: 'traditional',
            description: 'Reschedule production order due to constraints',
            businessLayer: {
              description: '因约束条件重新安排生产订单',
              targetObject: 'Production Order',
              executorRole: 'Production Manager',
              triggerCondition: '供应中断或产能变化'
            },
            logicLayer: {
              preconditions: ['订单未完成'],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: '订单ID' },
                { name: 'newStartDate', type: 'date', required: true, description: '新开始日期' },
                { name: 'rescheduleReason', type: 'string', required: true, description: '重排原因' }
              ],
              postconditions: ['日期已更新', '下游已通知'],
              sideEffects: ['更新物料计划', '通知经销商']
            },
            governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'high' }
          }
        ],
        aiFeatures: [
          {
            type: 'Smart Property (LLM Derived)',
            description: 'AI production completion prediction and risk identification'
          }
        ]
      },

      // ============= 供应商 (Supplier) =============
      {
        id: 'supplier',
        name: 'Supplier',
        nameCn: '供应商',
        description: 'A parts supplier in the automotive supply chain',
        descriptionCn: '汽车供应链中的零部件供应商',
        properties: [
          { name: 'supplierId', type: 'string', description: 'Unique supplier identifier' },
          { name: 'supplierName', type: 'string', description: 'Supplier company name' },
          { name: 'tier', type: 'string', description: 'Tier 1/Tier 2/Tier 3' },
          { name: 'location', type: 'object', description: 'Primary location' },
          { name: 'category', type: 'string', description: 'Component category' },
          { name: 'certifications', type: 'array', description: 'Quality certifications' },
          { name: 'performanceScore', type: 'number', description: 'Supplier performance score' },
          { name: 'deliveryReliability', type: 'number', description: 'On-time delivery %' },
          { name: 'qualityPPM', type: 'number', description: 'Quality defects PPM' },
          { name: 'riskStatus', type: 'string', description: 'Normal/Watch/Critical' },
          // AI-derived
          {
            name: 'disruptionRisk',
            type: 'number',
            description: 'AI-assessed supply disruption risk 0-100',
            isAIDerived: true,
            logicDescription: 'Based on financial health, geopolitical factors, and historical performance'
          },
          {
            name: 'qualityTrend',
            type: 'string',
            description: 'Quality trend direction',
            isAIDerived: true,
            logicDescription: 'Trending analysis of quality metrics over time'
          }
        ],
        primaryKey: 'supplierId',
        actions: [
          {
            name: 'Escalate Supplier',
            nameCn: '升级供应商问题',
            type: 'traditional',
            description: 'Escalate supplier to watch or critical status',
            businessLayer: {
              description: '将供应商升级到观察或关键状态',
              targetObject: 'Supplier',
              executorRole: 'Supply Chain Manager',
              triggerCondition: '绩效下降或风险增加'
            },
            logicLayer: {
              preconditions: ['有绩效数据支持'],
              parameters: [
                { name: 'supplierId', type: 'string', required: true, description: '供应商ID' },
                { name: 'newStatus', type: 'string', required: true, description: '新状态' },
                { name: 'reason', type: 'string', required: true, description: '原因' },
                { name: 'requiredActions', type: 'array', required: true, description: '要求的改进措施' }
              ],
              postconditions: ['状态已更新', '改进计划已创建'],
              sideEffects: ['通知供应商', '触发备选方案评估']
            },
            governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'high' }
          }
        ],
        aiFeatures: [
          {
            type: 'Smart Property (LLM Derived)',
            description: 'AI-assessed supplier risk and quality trend prediction'
          }
        ]
      },

      // ============= 零部件 (Part) =============
      {
        id: 'part',
        name: 'Part',
        nameCn: '零部件',
        description: 'A component part used in vehicle assembly',
        descriptionCn: '用于车辆装配的组件零部件',
        properties: [
          { name: 'partNumber', type: 'string', description: 'Part number' },
          { name: 'partName', type: 'string', description: 'Part description' },
          { name: 'category', type: 'string', description: 'Part category' },
          { name: 'supplierId', type: 'string', description: 'Primary supplier' },
          { name: 'alternateSuppliers', type: 'array', description: 'Alternate supplier IDs' },
          { name: 'unitCost', type: 'number', description: 'Unit cost' },
          { name: 'leadTimeDays', type: 'number', description: 'Standard lead time' },
          { name: 'safetyStock', type: 'number', description: 'Safety stock level' },
          { name: 'currentInventory', type: 'number', description: 'Current inventory level' },
          { name: 'inTransit', type: 'number', description: 'Quantity in transit' },
          { name: 'status', type: 'string', description: 'Active/PhaseOut/Obsolete' },
          // AI-derived
          {
            name: 'stockoutRisk',
            type: 'number',
            description: 'AI-predicted stockout risk in next 7 days',
            isAIDerived: true,
            logicDescription: 'Based on demand forecast, inventory, in-transit, and supplier reliability'
          },
          {
            name: 'demandForecast',
            type: 'array',
            description: 'Weekly demand forecast',
            isAIDerived: true,
            logicDescription: 'ML demand forecasting based on production schedule and historical usage'
          }
        ],
        primaryKey: 'partNumber',
        actions: [
          {
            name: 'Create Emergency Order',
            nameCn: '创建紧急订单',
            type: 'traditional',
            description: 'Create expedited purchase order for critical shortage',
            businessLayer: {
              description: '为关键短缺创建加急采购订单',
              targetObject: 'Part',
              executorRole: 'Buyer',
              triggerCondition: '缺料风险高或已缺料'
            },
            logicLayer: {
              preconditions: ['供应商可接受紧急订单'],
              parameters: [
                { name: 'partNumber', type: 'string', required: true, description: '零件号' },
                { name: 'quantity', type: 'number', required: true, description: '数量' },
                { name: 'supplierId', type: 'string', required: true, description: '供应商ID' },
                { name: 'requiredDate', type: 'date', required: true, description: '需求日期' }
              ],
              postconditions: ['订单已创建', '供应商已确认'],
              sideEffects: ['更新成本预测', '通知生产计划']
            },
            governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'high' }
          },
          {
            name: 'AI Recommend Rebalancing',
            nameCn: 'AI推荐库存再平衡',
            type: 'generative',
            description: 'AI-generated inventory rebalancing recommendations',
            aiLogic: 'Analyze inventory across plants and recommend transfers to prevent stockouts',
            businessLayer: {
              description: 'AI 分析各工厂库存并推荐调拨以防止缺料',
              targetObject: 'Part',
              executorRole: 'AI Agent',
              triggerCondition: '检测到库存不平衡'
            },
            logicLayer: {
              preconditions: ['多工厂库存数据可用'],
              parameters: [
                { name: 'partNumber', type: 'string', required: true, description: '零件号' }
              ],
              postconditions: ['推荐已生成'],
              sideEffects: ['通知物流团队审核']
            },
            governance: { permissionTier: 2, requiresHumanApproval: true, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          {
            type: 'Smart Property (LLM Derived)',
            description: 'AI stockout risk prediction and demand forecasting'
          },
          {
            type: 'Generative Action (AI Output)',
            description: 'AI-generated inventory rebalancing and sourcing recommendations'
          }
        ]
      }
    ],

    links: [
      {
        id: 'vehicle-order',
        source: 'vehicle',
        target: 'production-order',
        label: 'produced_by',
        isSemantic: true
      },
      {
        id: 'order-part',
        source: 'production-order',
        target: 'part',
        label: 'requires',
        isSemantic: true
      },
      {
        id: 'part-supplier',
        source: 'part',
        target: 'supplier',
        label: 'supplied_by',
        isSemantic: true
      },
      {
        id: 'vehicle-part',
        source: 'vehicle',
        target: 'part',
        label: 'contains',
        isSemantic: true
      }
    ]
  },

  connectors: [
    {
      id: 'mes-system',
      name: 'MES Integration',
      description: { en: 'Production tracking and quality data from MES', cn: 'MES制造执行系统生产跟踪和质量数据' },
      sourceType: 'streaming',
      sourceSystem: 'MES (Manufacturing Execution)',
      connectionTemplate: {
        requiredFields: [
          { name: 'endpoint', type: 'string', description: 'MES streaming endpoint' },
          { name: 'credentials', type: 'secret', description: 'Authentication' }
        ]
      },
      sync: { direction: 'bidirectional', frequency: 'streaming', incrementalSync: true },
      mappedObjects: [
        { objectId: 'vehicle', sourceEntity: 'VehicleBuild', fieldMappings: [] },
        { objectId: 'production-order', sourceEntity: 'WorkOrder', fieldMappings: [] }
      ]
    },
    {
      id: 'erp-system',
      name: 'ERP Integration',
      description: { en: 'Master data and inventory from ERP', cn: 'ERP系统主数据和库存' },
      sourceType: 'erp',
      sourceSystem: 'ERP (SAP/Oracle)',
      connectionTemplate: {
        requiredFields: [
          { name: 'apiUrl', type: 'string', description: 'ERP API URL' },
          { name: 'apiKey', type: 'secret', description: 'API key' }
        ]
      },
      sync: { direction: 'bidirectional', frequency: 'realtime', incrementalSync: true },
      mappedObjects: [
        { objectId: 'part', sourceEntity: 'Material', fieldMappings: [] },
        { objectId: 'supplier', sourceEntity: 'Vendor', fieldMappings: [] }
      ]
    },
    {
      id: 'connected-vehicle',
      name: 'Connected Vehicle Platform',
      description: { en: 'Vehicle telematics and diagnostic data', cn: '车联网平台遥测和诊断数据' },
      sourceType: 'iot',
      sourceSystem: 'Connected Vehicle Platform',
      connectionTemplate: {
        requiredFields: [
          { name: 'apiUrl', type: 'string', description: 'Telematics API URL' },
          { name: 'apiKey', type: 'secret', description: 'API key' }
        ]
      },
      sync: { direction: 'inbound', frequency: 'hourly', incrementalSync: true },
      mappedObjects: [{ objectId: 'vehicle', sourceEntity: 'TelemetryData', fieldMappings: [] }]
    }
  ],

  workflows: [
    {
      id: 'quality-issue-response',
      name: 'Quality Issue Response',
      description: { en: 'End-to-end quality issue detection and response', cn: '端到端质量问题检测和响应' },
      trigger: { type: 'event', config: { eventType: 'quality_alert' } },
      steps: [
        { id: 'detect', name: 'AI Detection', description: { en: 'AI quality anomaly detection', cn: 'AI质量异常检测' }, type: 'action', nextSteps: ['investigate'] },
        { id: 'investigate', name: 'Root Cause', description: { en: 'Root cause analysis', cn: '根因分析' }, type: 'action', nextSteps: ['contain'] },
        { id: 'contain', name: 'Containment', description: { en: 'Containment actions', cn: '遏制行动' }, type: 'action', nextSteps: ['resolve'] },
        { id: 'resolve', name: 'Resolution', description: { en: 'Permanent fix', cn: '永久修复' }, type: 'action' }
      ],
      entryStep: 'detect',
      roles: ['Quality Engineer', 'Plant Manager', 'Supplier Quality'],
      sla: { maxDuration: '24h', escalationPath: ['Quality Manager', 'VP Manufacturing'] }
    }
  ],

  rules: [
    {
      id: 'supplier-risk-alert',
      name: 'Supplier Risk Alert',
      description: { en: 'Alert on high supplier disruption risk', cn: '高供应商中断风险告警' },
      type: 'trigger',
      appliesTo: ['supplier'],
      expression: 'disruptionRisk > 0.7'
    }
  ],

  aiCapabilities: [
    {
      id: 'quality-prediction',
      name: 'Predictive Quality Analytics',
      type: 'prediction',
      description: { en: 'Predict quality issues before they occur', cn: '预测质量问题' },
      enabledActions: ['AI Quality Prediction'],
      modelConfig: { modelType: 'quality-model', trainingDataRequirements: 'Historical quality data with warranty outcomes' }
    },
    {
      id: 'supply-disruption',
      name: 'Supply Disruption Warning',
      type: 'prediction',
      description: { en: 'AI early warning for supply chain disruptions', cn: 'AI供应链中断预警' },
      enabledActions: ['AI Disruption Alert'],
      modelConfig: { modelType: 'risk-model', trainingDataRequirements: 'Historical supplier performance and disruption data' }
    },
    {
      id: 'inventory-optimization',
      name: 'Inventory Optimization',
      type: 'optimization',
      description: { en: 'AI-optimized inventory allocation', cn: 'AI优化库存分配' },
      enabledActions: ['AI Inventory Rebalance'],
      modelConfig: { modelType: 'optimization-model', trainingDataRequirements: 'Historical demand and inventory data' }
    }
  ],

  dashboards: [
    {
      id: 'supply-chain-control',
      name: 'Supply Chain Control Tower',
      description: { en: 'End-to-end supply chain visibility', cn: '端到端供应链可视化' },
      targetRole: 'Supply Chain Manager',
      gridColumns: 12,
      gridRows: 8,
      widgets: [
        { id: 'supplier-map', type: 'map', title: { en: 'Supplier Map', cn: '供应商地图' }, dataSource: { objectId: 'supplier' }, layout: { x: 0, y: 0, width: 8, height: 5 } },
        { id: 'risk-alerts', type: 'list', title: { en: 'Risk Alerts', cn: '风险告警' }, dataSource: { objectId: 'supplier', query: 'disruptionRisk > 0.5' }, layout: { x: 8, y: 0, width: 4, height: 3 } },
        { id: 'production-status', type: 'chart', title: { en: 'Production', cn: '生产状态' }, dataSource: { objectId: 'production-order', aggregation: 'count by status' }, layout: { x: 8, y: 3, width: 4, height: 2 } }
      ]
    }
  ],

  views: [
    {
      id: 'supplier-list',
      name: 'Suppliers',
      type: 'list',
      objectId: 'supplier',
      fields: [
        { property: 'supplierId', label: { en: 'Supplier ID', cn: '供应商ID' }, visible: true, sortable: true },
        { property: 'supplierName', label: { en: 'Name', cn: '名称' }, visible: true },
        { property: 'tier', label: { en: 'Tier', cn: '层级' }, visible: true, filterable: true },
        { property: 'disruptionRisk', label: { en: 'Risk', cn: '风险' }, visible: true, sortable: true }
      ],
      defaultSort: { property: 'disruptionRisk', direction: 'desc' }
    }
  ],

  deployment: {
    requirements: {
      platform: ['DataPlatform', 'AgentFramework'],
      minVersion: '2.0.0',
      resources: { cpu: '8 cores', memory: '32GB', storage: '500GB' }
    },
    environmentVariables: [
      { name: 'MES_ENDPOINT', description: 'MES streaming endpoint', required: true },
      { name: 'ERP_API_URL', description: 'ERP API URL', required: true },
      { name: 'TELEMATICS_API', description: 'Connected vehicle API', required: false }
    ]
  },

  documentation: {
    quickStart: {
      en: '1. Connect to MES system\\n2. Integrate ERP data\\n3. Configure supplier network\\n4. Enable AI quality models\\n5. Set up disruption alerts',
      cn: '1. 连接MES系统\\n2. 集成ERP数据\\n3. 配置供应商网络\\n4. 启用AI质量模型\\n5. 设置中断告警'
    },
    bestPractices: [
      'Enable real-time MES integration for production visibility',
      'Use AI-powered supplier risk monitoring',
      'Leverage connected vehicle data for quality insights'
    ]
  }
};
