/**
 * 养殖业智能养殖 Archetype
 * Smart Aquaculture & Livestock Farming Archetype
 *
 * 来源：农业科技项目实施经验沉淀
 * 适用场景：水产养殖、畜牧养殖的智能化管理
 * 部署时间：预计 1-2 周（含IoT对接）
 */

import { Archetype } from '../../types/archetype';

export const aquacultureFarmingArchetype: Archetype = {
  metadata: {
    id: 'aquaculture-smart-farming',
    name: 'Smart Aquaculture & Livestock',
    description: {
      en: 'Intelligent aquaculture and livestock farming management with AI-powered feeding optimization, health monitoring, and yield prediction.',
      cn: '智能水产与畜牧养殖管理，具备AI智能投喂优化、健康监测和产量预测能力。'
    },
    industry: 'agriculture',
    domain: 'smart-farming',
    version: '1.0.0',
    changelog: [
      {
        version: '1.0.0',
        date: '2026-01-26',
        changes: ['Initial release with core farming management features']
      }
    ],
    origin: {
      sourceEngagement: 'Agricultural Technology Project',
      fdeContributors: ['Farm Tech Team'],
      abstractionDate: '2026-01-01'
    },
    usage: {
      deployments: 5,
      industries: ['Aquaculture', 'Livestock', 'Poultry'],
      avgDeploymentTime: '12 days'
    }
  },

  // ===== Semantic Layer - 业务概念模型 =====
  ontology: {
    objects: [
      {
        id: 'breeding-batch',
        name: 'Breeding Batch',
        nameCn: '养殖批次',
        description: 'A batch of livestock or aquatic animals being raised together',
        descriptionCn: '一批一起养殖的牲畜或水产动物',
        properties: [
          { name: 'batchId', type: 'string', description: 'Unique batch identifier' },
          { name: 'species', type: 'string', description: 'Species being raised' },
          { name: 'breed', type: 'string', description: 'Specific breed/variety' },
          { name: 'initialCount', type: 'number', description: 'Initial population count' },
          { name: 'currentCount', type: 'number', description: 'Current population count' },
          { name: 'startDate', type: 'datetime', description: 'Batch start date' },
          { name: 'expectedHarvestDate', type: 'datetime', description: 'Expected harvest date' },
          { name: 'status', type: 'string', description: 'Current status (growing/harvesting/completed)' },
          { name: 'facilityId', type: 'string', description: 'Assigned facility' },
          { name: 'avgWeight', type: 'number', description: 'Average weight (kg)' },
          { name: 'totalFeedConsumed', type: 'number', description: 'Total feed consumed (kg)' },
          { name: 'mortalityRate', type: 'number', description: 'Mortality rate (%)' },
          // AI-derived properties
          {
            name: 'healthScore',
            type: 'number',
            description: 'AI-predicted health score (0-100)',
            isAIDerived: true,
            logicDescription: 'ML model analyzing growth rate, behavior patterns, and environmental factors'
          },
          {
            name: 'predictedYield',
            type: 'number',
            description: 'AI-predicted harvest yield (kg)',
            isAIDerived: true,
            logicDescription: 'Prediction based on current growth trajectory and historical batch performance'
          },
          {
            name: 'optimalFeedAmount',
            type: 'number',
            description: 'AI-recommended daily feed amount (kg)',
            isAIDerived: true,
            logicDescription: 'Optimization considering growth stage, weight, environmental conditions'
          }
        ],
        primaryKey: 'batchId',
        actions: [
          {
            name: 'AI Feed Optimization',
            nameCn: 'AI 智能投喂',
            type: 'generative',
            description: 'AI-optimized feeding plan based on growth stage and conditions',
            descriptionCn: 'AI根据生长阶段和环境条件优化投喂计划',
            aiLogic: 'Optimize feed conversion ratio while maintaining health, considering weather, water quality, and growth targets',
            businessLayer: {
              description: '使用AI算法制定最优投喂方案，平衡生长速度和饲料成本',
              targetObject: 'Breeding Batch',
              executorRole: 'Farm Manager',
              triggerCondition: '每日投喂计划制定或环境条件显著变化'
            },
            logicLayer: {
              preconditions: ['批次状态为养殖中', '有最近的重量数据'],
              parameters: [
                { name: 'batchId', type: 'string', required: true, description: '批次ID' },
                { name: 'targetGrowthRate', type: 'number', required: false, description: '目标日增重(kg)' },
                { name: 'costPriority', type: 'string', required: false, description: '成本优先级(high/medium/low)' }
              ],
              postconditions: ['生成每日投喂计划', '更新投喂设备参数'],
              sideEffects: ['同步到自动投喂系统', '记录投喂日志']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/batches/{batchId}/ai-feed-plan',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'ai_optimize_feeding',
                description: 'Generate AI-optimized feeding plan for a breeding batch',
                parameters: {
                  type: 'object',
                  properties: {
                    batchId: { type: 'string' },
                    targetGrowthRate: { type: 'number' },
                    costPriority: { type: 'string', enum: ['high', 'medium', 'low'] }
                  },
                  required: ['batchId']
                }
              }
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: false,
              auditLog: true,
              riskLevel: 'low'
            }
          },
          {
            name: 'Health Check',
            nameCn: '健康检查',
            type: 'traditional',
            description: 'Record health inspection results',
            descriptionCn: '记录健康检查结果',
            businessLayer: {
              description: '兽医或养殖员进行健康检查并记录结果',
              targetObject: 'Breeding Batch',
              executorRole: 'Veterinarian',
              triggerCondition: '定期检查或发现异常'
            },
            logicLayer: {
              preconditions: ['批次状态为养殖中'],
              parameters: [
                { name: 'batchId', type: 'string', required: true, description: '批次ID' },
                { name: 'healthStatus', type: 'string', required: true, description: '健康状态' },
                { name: 'symptoms', type: 'array', required: false, description: '观察到的症状' },
                { name: 'treatment', type: 'string', required: false, description: '采取的措施' }
              ],
              postconditions: ['更新健康记录', '如异常则触发告警'],
              sideEffects: ['更新AI健康评分', '生成健康报告']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/batches/{batchId}/health-check',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 1,
              requiresHumanApproval: false,
              auditLog: true,
              riskLevel: 'low'
            }
          },
          {
            name: 'Start Harvest',
            nameCn: '开始收获',
            type: 'traditional',
            description: 'Initiate harvest process for the batch',
            descriptionCn: '启动批次收获流程',
            businessLayer: {
              description: '开始收获流程，准备出栏/捕捞',
              targetObject: 'Breeding Batch',
              executorRole: 'Farm Manager',
              triggerCondition: '达到出栏标准或市场时机合适'
            },
            logicLayer: {
              preconditions: ['批次状态为养殖中', '平均重量达标'],
              parameters: [
                { name: 'batchId', type: 'string', required: true, description: '批次ID' },
                { name: 'harvestQuantity', type: 'number', required: true, description: '收获数量' },
                { name: 'buyer', type: 'string', required: false, description: '买家信息' }
              ],
              postconditions: ['批次状态变为收获中', '生成出栏单据'],
              sideEffects: ['通知物流', '更新库存预测']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/batches/{batchId}/harvest',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: true,
              auditLog: true,
              riskLevel: 'medium'
            }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Health score prediction using ML' },
          { type: 'Smart Property', description: 'Yield prediction based on growth data' },
          { type: 'Generative Action', description: 'AI-optimized feeding recommendations' }
        ]
      },
      {
        id: 'facility',
        name: 'Facility',
        nameCn: '养殖设施',
        description: 'Farming facility (pond, barn, cage, etc.)',
        descriptionCn: '养殖设施（鱼塘、畜舍、网箱等）',
        properties: [
          { name: 'facilityId', type: 'string', description: 'Facility identifier' },
          { name: 'facilityName', type: 'string', description: 'Facility name' },
          { name: 'facilityType', type: 'string', description: 'Type (pond/barn/cage/pen)' },
          { name: 'capacity', type: 'number', description: 'Maximum capacity' },
          { name: 'currentOccupancy', type: 'number', description: 'Current occupancy' },
          { name: 'location', type: 'string', description: 'GPS location' },
          { name: 'status', type: 'string', description: 'Status (active/maintenance/empty)' },
          // Environmental sensors
          { name: 'temperature', type: 'number', description: 'Current temperature' },
          { name: 'humidity', type: 'number', description: 'Current humidity (%)' },
          { name: 'waterQualityPH', type: 'number', description: 'Water pH level (aquaculture)' },
          { name: 'dissolvedOxygen', type: 'number', description: 'Dissolved oxygen (mg/L)' },
          { name: 'ammoniaNitrogen', type: 'number', description: 'Ammonia nitrogen level' },
          // AI-derived
          {
            name: 'environmentRisk',
            type: 'number',
            description: 'Environment risk score (0-100)',
            isAIDerived: true,
            logicDescription: 'ML model analyzing sensor trends and weather forecast'
          }
        ],
        primaryKey: 'facilityId',
        actions: [
          {
            name: 'Adjust Environment',
            nameCn: '调节环境',
            type: 'generative',
            description: 'AI-recommended environment adjustment',
            descriptionCn: 'AI推荐的环境调节方案',
            aiLogic: 'Optimize environmental conditions for growth while minimizing energy costs',
            businessLayer: {
              description: '根据AI分析调节设施环境参数',
              targetObject: 'Facility',
              executorRole: 'Farm Operator',
              triggerCondition: '环境参数超出最优范围或天气预警'
            },
            logicLayer: {
              preconditions: ['设施状态为活跃'],
              parameters: [
                { name: 'facilityId', type: 'string', required: true, description: '设施ID' },
                { name: 'targetSpecies', type: 'string', required: false, description: '养殖品种' }
              ],
              postconditions: ['环境参数在最优范围内'],
              sideEffects: ['调节增氧机/换气扇/加热设备', '记录调节日志']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/facilities/{facilityId}/adjust-environment',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 1,
              requiresHumanApproval: false,
              auditLog: true,
              riskLevel: 'low'
            }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Environment risk prediction' },
          { type: 'Generative Action', description: 'AI environment optimization' }
        ]
      },
      {
        id: 'feed-inventory',
        name: 'Feed Inventory',
        nameCn: '饲料库存',
        description: 'Feed and nutrition inventory management',
        descriptionCn: '饲料与营养品库存管理',
        properties: [
          { name: 'feedId', type: 'string', description: 'Feed type identifier' },
          { name: 'feedName', type: 'string', description: 'Feed name' },
          { name: 'feedType', type: 'string', description: 'Feed type (pellet/powder/fresh)' },
          { name: 'proteinContent', type: 'number', description: 'Protein content (%)' },
          { name: 'currentStock', type: 'number', description: 'Current stock (kg)' },
          { name: 'reorderPoint', type: 'number', description: 'Reorder point (kg)' },
          { name: 'dailyConsumption', type: 'number', description: 'Average daily consumption (kg)' },
          { name: 'unitCost', type: 'number', description: 'Cost per kg' },
          { name: 'expiryDate', type: 'datetime', description: 'Expiry date' },
          // AI-derived
          {
            name: 'daysUntilStockout',
            type: 'number',
            description: 'Predicted days until stockout',
            isAIDerived: true,
            logicDescription: 'Based on consumption trends and planned feeding schedules'
          }
        ],
        primaryKey: 'feedId',
        actions: [
          {
            name: 'Auto Reorder',
            nameCn: '自动补货',
            type: 'generative',
            description: 'AI-triggered automatic reorder',
            descriptionCn: 'AI触发的自动补货',
            aiLogic: 'Predict optimal reorder timing and quantity based on consumption forecast',
            businessLayer: {
              description: '根据消耗预测自动生成采购订单',
              targetObject: 'Feed Inventory',
              executorRole: 'Procurement Manager',
              triggerCondition: '库存低于补货点或AI预测即将缺货'
            },
            logicLayer: {
              preconditions: ['库存低于阈值或AI预警'],
              parameters: [
                { name: 'feedId', type: 'string', required: true, description: '饲料ID' },
                { name: 'quantity', type: 'number', required: false, description: '订购数量' }
              ],
              postconditions: ['生成采购订单'],
              sideEffects: ['通知供应商', '更新预算']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/feed/{feedId}/reorder',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: true,
              auditLog: true,
              riskLevel: 'low'
            }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Stockout prediction' },
          { type: 'Generative Action', description: 'Intelligent reorder recommendations' }
        ]
      }
    ],
    links: [
      {
        id: 'batch-facility',
        source: 'breeding-batch',
        target: 'facility',
        label: 'housed_in',
        isSemantic: true
      },
      {
        id: 'batch-feed',
        source: 'breeding-batch',
        target: 'feed-inventory',
        label: 'consumes',
        isSemantic: true
      }
    ]
  },

  // ===== Kinetic Layer - 数据连接 =====
  connectors: [
    {
      id: 'iot-sensors',
      name: 'IoT Sensor Connector',
      description: {
        en: 'Real-time sensor data from farming facilities',
        cn: '养殖设施的实时传感器数据'
      },
      sourceType: 'iot',
      sourceSystem: 'Farm IoT Platform',
      connectionTemplate: {
        requiredFields: [
          { name: 'mqttBroker', type: 'string', description: 'MQTT broker URL' },
          { name: 'topic', type: 'string', description: 'Sensor data topic' }
        ]
      },
      sync: {
        direction: 'inbound',
        frequency: 'streaming'
      },
      mappedObjects: [
        {
          objectId: 'facility',
          sourceEntity: 'Sensor Telemetry',
          fieldMappings: [
            { sourceField: 'deviceId', targetProperty: 'facilityId' },
            { sourceField: 'temp', targetProperty: 'temperature' },
            { sourceField: 'humidity', targetProperty: 'humidity' },
            { sourceField: 'ph', targetProperty: 'waterQualityPH' },
            { sourceField: 'do', targetProperty: 'dissolvedOxygen' }
          ]
        }
      ]
    },
    {
      id: 'erp-integration',
      name: 'Farm ERP Connector',
      description: {
        en: 'Integration with farm management ERP system',
        cn: '与农场管理ERP系统集成'
      },
      sourceType: 'erp',
      sourceSystem: 'Farm ERP',
      connectionTemplate: {
        requiredFields: [
          { name: 'apiUrl', type: 'string', description: 'ERP API endpoint' },
          { name: 'apiKey', type: 'secret', description: 'API key' }
        ]
      },
      sync: {
        direction: 'bidirectional',
        frequency: 'hourly',
        incrementalSync: true
      },
      mappedObjects: [
        {
          objectId: 'breeding-batch',
          sourceEntity: 'Batch Master',
          fieldMappings: [
            { sourceField: 'batch_no', targetProperty: 'batchId' },
            { sourceField: 'species_code', targetProperty: 'species' },
            { sourceField: 'head_count', targetProperty: 'currentCount' }
          ]
        }
      ]
    }
  ],

  // ===== Dynamic Layer - 业务工作流 =====
  workflows: [
    {
      id: 'daily-feeding',
      name: 'Daily Feeding Workflow',
      description: {
        en: 'Automated daily feeding schedule with AI optimization',
        cn: '自动化每日投喂流程，包含AI优化'
      },
      trigger: {
        type: 'scheduled',
        config: { cron: '0 6 * * *', timezone: 'local' }
      },
      steps: [
        {
          id: 'check-environment',
          name: 'Check Environment',
          description: { en: 'Check facility environment conditions', cn: '检查设施环境条件' },
          type: 'action',
          actionRef: 'environment-check',
          nextSteps: ['generate-feed-plan']
        },
        {
          id: 'generate-feed-plan',
          name: 'AI Feed Plan',
          description: { en: 'Generate AI-optimized feeding plan', cn: '生成AI优化投喂计划' },
          type: 'action',
          actionRef: 'ai-optimize-feeding',
          nextSteps: ['execute-feeding']
        },
        {
          id: 'execute-feeding',
          name: 'Execute Feeding',
          description: { en: 'Execute automated feeding', cn: '执行自动投喂' },
          type: 'action',
          actionRef: 'auto-feed',
          nextSteps: ['log-consumption']
        },
        {
          id: 'log-consumption',
          name: 'Log Consumption',
          description: { en: 'Record feed consumption', cn: '记录饲料消耗' },
          type: 'action',
          actionRef: 'record-consumption',
          nextSteps: []
        }
      ],
      entryStep: 'check-environment',
      roles: ['Farm Manager', 'System'],
      sla: {
        maxDuration: '2h',
        escalationPath: ['Farm Supervisor']
      }
    },
    {
      id: 'disease-alert',
      name: 'Disease Alert Response',
      description: {
        en: 'Rapid response workflow for disease detection',
        cn: '疾病检测快速响应流程'
      },
      trigger: {
        type: 'event',
        config: { event: 'health.alert', condition: 'healthScore < 60' }
      },
      steps: [
        {
          id: 'isolate-batch',
          name: 'Isolate Batch',
          description: { en: 'Isolate affected batch', cn: '隔离受影响批次' },
          type: 'action',
          actionRef: 'isolate-batch',
          nextSteps: ['notify-vet']
        },
        {
          id: 'notify-vet',
          name: 'Notify Veterinarian',
          description: { en: 'Alert veterinarian for inspection', cn: '通知兽医检查' },
          type: 'notification',
          nextSteps: ['vet-inspection']
        },
        {
          id: 'vet-inspection',
          name: 'Veterinary Inspection',
          description: { en: 'Veterinarian performs inspection', cn: '兽医进行检查' },
          type: 'action',
          actionRef: 'health-check',
          nextSteps: []
        }
      ],
      entryStep: 'isolate-batch',
      roles: ['Farm Manager', 'Veterinarian'],
      sla: {
        maxDuration: '4h',
        escalationPath: ['Farm Owner']
      }
    }
  ],

  rules: [
    {
      id: 'water-quality-alert',
      name: 'Water Quality Alert',
      description: {
        en: 'Alert when water quality parameters are out of range',
        cn: '水质参数超标告警'
      },
      type: 'trigger',
      appliesTo: ['facility'],
      expression: 'waterQualityPH < 6.5 || waterQualityPH > 8.5 || dissolvedOxygen < 5',
      onViolation: {
        action: 'notify',
        message: {
          en: 'Facility {facilityId} water quality alert: pH={waterQualityPH}, DO={dissolvedOxygen}',
          cn: '设施 {facilityId} 水质告警：pH={waterQualityPH}，溶解氧={dissolvedOxygen}'
        }
      }
    },
    {
      id: 'low-feed-alert',
      name: 'Low Feed Inventory Alert',
      description: {
        en: 'Alert when feed inventory is low',
        cn: '饲料库存不足告警'
      },
      type: 'trigger',
      appliesTo: ['feed-inventory'],
      expression: 'currentStock < reorderPoint',
      onViolation: {
        action: 'notify',
        message: {
          en: 'Feed {feedName} stock is low: {currentStock}kg remaining',
          cn: '饲料 {feedName} 库存不足：剩余 {currentStock}kg'
        }
      }
    }
  ],

  // ===== AI Layer - AI能力 =====
  aiCapabilities: [
    {
      id: 'feed-optimization',
      name: 'Feed Optimization',
      type: 'optimization',
      description: {
        en: 'AI-powered feeding optimization for maximum FCR',
        cn: 'AI优化投喂方案，最大化饲料转化率'
      },
      enabledActions: ['ai-optimize-feeding'],
      modelConfig: {
        modelType: 'Reinforcement Learning + Regression',
        trainingDataRequirements: 'Historical feeding data, growth records, environmental data'
      }
    },
    {
      id: 'health-monitoring',
      name: 'Health Monitoring',
      type: 'prediction',
      description: {
        en: 'Early disease detection using behavior and environmental analysis',
        cn: '通过行为和环境分析进行疾病早期检测'
      },
      enabledActions: ['health-check'],
      modelConfig: {
        modelType: 'Anomaly Detection (Isolation Forest + LSTM)',
        trainingDataRequirements: 'Feeding behavior, mortality records, environmental patterns'
      }
    },
    {
      id: 'yield-prediction',
      name: 'Yield Prediction',
      type: 'prediction',
      description: {
        en: 'Harvest yield forecasting based on growth trajectory',
        cn: '基于生长轨迹的产量预测'
      },
      enabledActions: [],
      modelConfig: {
        modelType: 'Time-series Forecasting (Prophet/XGBoost)',
        trainingDataRequirements: 'Historical batch performance, market prices, seasonal patterns'
      }
    }
  ],

  // ===== UI Templates - 预配置界面 =====
  dashboards: [
    {
      id: 'farm-control',
      name: 'Farm Control Center',
      description: {
        en: 'Real-time farm monitoring dashboard',
        cn: '实时农场监控仪表盘'
      },
      targetRole: 'Farm Manager',
      gridColumns: 12,
      gridRows: 8,
      widgets: [
        {
          id: 'total-inventory',
          type: 'kpi',
          title: { en: 'Total Livestock', cn: '总存栏量' },
          dataSource: {
            objectId: 'breeding-batch',
            aggregation: 'SUM(currentCount)'
          },
          layout: { x: 0, y: 0, width: 3, height: 2 }
        },
        {
          id: 'avg-health',
          type: 'kpi',
          title: { en: 'Avg Health Score', cn: '平均健康评分' },
          dataSource: {
            objectId: 'breeding-batch',
            aggregation: 'AVG(healthScore)'
          },
          layout: { x: 3, y: 0, width: 3, height: 2 }
        },
        {
          id: 'env-alerts',
          type: 'kpi',
          title: { en: 'Environment Alerts', cn: '环境告警' },
          dataSource: {
            objectId: 'facility',
            query: 'environmentRisk > 70',
            aggregation: 'COUNT'
          },
          layout: { x: 6, y: 0, width: 3, height: 2 },
          style: { alertThreshold: 1 }
        },
        {
          id: 'facility-map',
          type: 'chart',
          title: { en: 'Facility Status', cn: '设施状态' },
          dataSource: { objectId: 'facility' },
          layout: { x: 0, y: 2, width: 6, height: 4 }
        },
        {
          id: 'batch-table',
          type: 'table',
          title: { en: 'Active Batches', cn: '在养批次' },
          dataSource: {
            objectId: 'breeding-batch',
            query: 'status = growing'
          },
          layout: { x: 6, y: 2, width: 6, height: 4 }
        }
      ],
      globalFilters: [
        { property: 'facilityId', label: 'Facility', type: 'select' },
        { property: 'species', label: 'Species', type: 'select' }
      ]
    }
  ],

  views: [
    {
      id: 'batch-list',
      name: 'Breeding Batches',
      type: 'list',
      objectId: 'breeding-batch',
      fields: [
        { property: 'batchId', label: { en: 'Batch ID', cn: '批次号' }, visible: true, sortable: true },
        { property: 'species', label: { en: 'Species', cn: '品种' }, visible: true, filterable: true },
        { property: 'currentCount', label: { en: 'Count', cn: '数量' }, visible: true, sortable: true },
        { property: 'avgWeight', label: { en: 'Avg Weight', cn: '平均重量' }, visible: true, sortable: true },
        { property: 'healthScore', label: { en: 'Health', cn: '健康评分' }, visible: true, sortable: true },
        { property: 'status', label: { en: 'Status', cn: '状态' }, visible: true, filterable: true }
      ],
      defaultSort: { property: 'healthScore', direction: 'asc' },
      availableActions: ['ai-optimize-feeding', 'health-check', 'start-harvest']
    }
  ],

  // ===== Deployment Config =====
  deployment: {
    requirements: {
      platform: ['DataPlatform', 'Custom'],
      minVersion: '2.0',
      resources: {
        cpu: '2 cores',
        memory: '8GB',
        storage: '50GB'
      }
    },
    environmentVariables: [
      { name: 'IOT_MQTT_BROKER', description: 'MQTT broker for sensor data', required: true },
      { name: 'ERP_API_URL', description: 'Farm ERP API endpoint', required: true },
      { name: 'AI_MODEL_ENDPOINT', description: 'AI model serving endpoint', required: false, default: 'internal' }
    ],
    dependencies: []
  },

  // ===== Documentation =====
  documentation: {
    quickStart: {
      en: `
## Quick Start Guide

1. **Configure IoT Sensors**
   - Set up MQTT broker connection for environmental sensors
   - Configure water quality sensors (pH, DO, temperature)
   - Set up feeding system integration

2. **Deploy Ontology**
   - Import object definitions
   - Configure data sync with farm ERP
   - Set up AI model endpoints

3. **Customize Thresholds**
   - Adjust water quality alert thresholds for your species
   - Configure feeding schedules
   - Set up health monitoring parameters

4. **Go Live**
   - Start with one facility for pilot
   - Monitor AI recommendations before full automation
   - Train staff on new workflows
      `,
      cn: `
## 快速启动指南

1. **配置IoT传感器**
   - 设置环境传感器的MQTT连接
   - 配置水质传感器（pH、溶解氧、温度）
   - 设置投喂系统集成

2. **部署Ontology**
   - 导入对象定义
   - 配置与农场ERP的数据同步
   - 设置AI模型端点

3. **自定义阈值**
   - 根据养殖品种调整水质告警阈值
   - 配置投喂计划
   - 设置健康监测参数

4. **上线**
   - 先在一个设施进行试点
   - 监测AI建议后再完全自动化
   - 培训员工使用新流程
      `
    },
    bestPractices: [
      'Start with environmental monitoring before AI feeding',
      'Validate AI feeding recommendations against actual results',
      'Maintain manual override capability for all automated systems',
      'Regular calibration of sensors is critical for AI accuracy'
    ]
  }
};
