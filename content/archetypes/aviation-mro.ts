/**
 * 航空业 MRO 运维 Archetype
 * Aviation MRO (Maintenance, Repair, Overhaul) Archetype
 *
 * 来源：航空维修项目实施经验沉淀
 * 适用场景：航空公司、MRO服务商的飞机维护管理
 * 部署时间：预计 2-3 周（含适航认证对接）
 */

import { Archetype } from '../../types/archetype';

export const aviationMROArchetype: Archetype = {
  metadata: {
    id: 'aviation-mro-operations',
    name: 'Aviation MRO Operations',
    description: {
      en: 'Comprehensive aircraft maintenance management with AI-powered predictive maintenance, parts optimization, and regulatory compliance tracking.',
      cn: '全面的飞机维护管理，具备AI预测性维护、备件优化和适航合规追踪能力。'
    },
    industry: 'aviation',
    domain: 'mro-operations',
    version: '1.0.0',
    changelog: [
      {
        version: '1.0.0',
        date: '2026-01-26',
        changes: ['Initial release with core MRO management features']
      }
    ],
    origin: {
      sourceEngagement: 'Airline MRO Digital Transformation',
      fdeContributors: ['Aviation Tech Team'],
      abstractionDate: '2026-01-01'
    },
    usage: {
      deployments: 3,
      industries: ['Airlines', 'MRO Providers', 'Aircraft Leasing'],
      avgDeploymentTime: '18 days'
    }
  },

  // ===== Semantic Layer - 业务概念模型 =====
  ontology: {
    objects: [
      {
        id: 'aircraft',
        name: 'Aircraft',
        nameCn: '飞机',
        description: 'Aircraft asset with maintenance and operational history',
        descriptionCn: '包含维护和运行历史的飞机资产',
        properties: [
          { name: 'tailNumber', type: 'string', description: 'Aircraft registration number' },
          { name: 'aircraftType', type: 'string', description: 'Aircraft type (e.g., B737-800)' },
          { name: 'serialNumber', type: 'string', description: 'Manufacturer serial number' },
          { name: 'operator', type: 'string', description: 'Operating airline' },
          { name: 'baseStation', type: 'string', description: 'Home base airport' },
          { name: 'manufactureDate', type: 'datetime', description: 'Date of manufacture' },
          { name: 'totalFlightHours', type: 'number', description: 'Total flight hours' },
          { name: 'totalCycles', type: 'number', description: 'Total flight cycles' },
          { name: 'status', type: 'string', description: 'Status (operational/maintenance/aog)' },
          { name: 'nextCheckType', type: 'string', description: 'Next scheduled check type' },
          { name: 'nextCheckDue', type: 'datetime', description: 'Next check due date' },
          // AI-derived properties
          {
            name: 'healthIndex',
            type: 'number',
            description: 'AI-computed aircraft health index (0-100)',
            isAIDerived: true,
            logicDescription: 'Composite score from component health, maintenance history, and flight data'
          },
          {
            name: 'predictedAOGRisk',
            type: 'number',
            description: 'Predicted AOG (Aircraft on Ground) risk in next 30 days',
            isAIDerived: true,
            logicDescription: 'ML model analyzing component degradation, weather, and operational intensity'
          },
          {
            name: 'optimalCheckWindow',
            type: 'string',
            description: 'AI-recommended optimal maintenance window',
            isAIDerived: true,
            logicDescription: 'Optimization considering fleet availability, hangar capacity, and crew schedules'
          }
        ],
        primaryKey: 'tailNumber',
        actions: [
          {
            name: 'AI Maintenance Forecast',
            nameCn: 'AI 维护预测',
            type: 'generative',
            description: 'AI-powered predictive maintenance analysis',
            descriptionCn: 'AI驱动的预测性维护分析',
            aiLogic: 'Analyze flight data, component telemetry, and historical patterns to predict maintenance needs',
            businessLayer: {
              description: '使用AI分析飞行数据和部件状态，预测维护需求',
              targetObject: 'Aircraft',
              executorRole: 'Maintenance Planner',
              triggerCondition: '定期分析或部件告警触发'
            },
            logicLayer: {
              preconditions: ['飞机有有效的ACARS/飞行数据'],
              parameters: [
                { name: 'tailNumber', type: 'string', required: true, description: '飞机注册号' },
                { name: 'forecastHorizon', type: 'number', required: false, description: '预测时间范围(天)' },
                { name: 'includeComponents', type: 'array', required: false, description: '包含的部件ATA章节' }
              ],
              postconditions: ['生成维护预测报告', '更新部件健康评分'],
              sideEffects: ['更新维护计划', '触发备件需求预测']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/aircraft/{tailNumber}/ai-maintenance-forecast',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'ai_maintenance_forecast',
                description: 'Generate AI-powered predictive maintenance forecast for an aircraft',
                parameters: {
                  type: 'object',
                  properties: {
                    tailNumber: { type: 'string' },
                    forecastHorizon: { type: 'number', default: 30 },
                    includeComponents: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['tailNumber']
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
            name: 'Schedule Check',
            nameCn: '安排检查',
            type: 'traditional',
            description: 'Schedule maintenance check for aircraft',
            descriptionCn: '为飞机安排维护检查',
            businessLayer: {
              description: '安排定检或非计划维护',
              targetObject: 'Aircraft',
              executorRole: 'Maintenance Planner',
              triggerCondition: '接近检查到期或预测性维护建议'
            },
            logicLayer: {
              preconditions: ['飞机未在AOG状态', '有可用的维护机位'],
              parameters: [
                { name: 'tailNumber', type: 'string', required: true, description: '飞机注册号' },
                { name: 'checkType', type: 'string', required: true, description: '检查类型(A/B/C/D)' },
                { name: 'scheduledDate', type: 'datetime', required: true, description: '计划开始日期' },
                { name: 'hangarId', type: 'string', required: true, description: '机库ID' }
              ],
              postconditions: ['创建维护工单', '预留机库和人员'],
              sideEffects: ['更新飞行计划', '通知机组调度', '触发备件准备']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/aircraft/{tailNumber}/schedule-check',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: true,
              auditLog: true,
              riskLevel: 'medium'
            }
          },
          {
            name: 'Release to Service',
            nameCn: '放行',
            type: 'traditional',
            description: 'Release aircraft back to service after maintenance',
            descriptionCn: '维护完成后放行飞机',
            businessLayer: {
              description: '完成维护后签署放行证书',
              targetObject: 'Aircraft',
              executorRole: 'Licensed Engineer',
              triggerCondition: '所有维护工作完成且检验通过'
            },
            logicLayer: {
              preconditions: ['所有工卡已关闭', '所有MEL项目已处理', '适航文件完整'],
              parameters: [
                { name: 'tailNumber', type: 'string', required: true, description: '飞机注册号' },
                { name: 'workOrderId', type: 'string', required: true, description: '工单ID' },
                { name: 'engineerLicense', type: 'string', required: true, description: '放行人员执照号' },
                { name: 'remarks', type: 'string', required: false, description: '放行备注' }
              ],
              postconditions: ['飞机状态变为可运行', '生成放行证书'],
              sideEffects: ['更新适航记录', '通知运控中心', '同步到CAMO系统']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/aircraft/{tailNumber}/release',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 3,
              requiresHumanApproval: true,
              auditLog: true,
              riskLevel: 'high'
            }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Aircraft health index calculation' },
          { type: 'Smart Property', description: 'AOG risk prediction' },
          { type: 'Generative Action', description: 'AI predictive maintenance forecast' }
        ]
      },
      {
        id: 'work-order',
        name: 'Maintenance Work Order',
        nameCn: '维护工单',
        description: 'Maintenance work order with task cards and sign-offs',
        descriptionCn: '包含工卡和签署的维护工单',
        properties: [
          { name: 'workOrderId', type: 'string', description: 'Work order number' },
          { name: 'tailNumber', type: 'string', description: 'Aircraft registration' },
          { name: 'checkType', type: 'string', description: 'Check type (A/B/C/D/Line)' },
          { name: 'status', type: 'string', description: 'Status (planned/in-progress/completed)' },
          { name: 'priority', type: 'string', description: 'Priority (routine/urgent/aog)' },
          { name: 'scheduledStart', type: 'datetime', description: 'Scheduled start' },
          { name: 'scheduledEnd', type: 'datetime', description: 'Scheduled end' },
          { name: 'actualStart', type: 'datetime', description: 'Actual start' },
          { name: 'actualEnd', type: 'datetime', description: 'Actual end' },
          { name: 'hangarId', type: 'string', description: 'Assigned hangar' },
          { name: 'totalTaskCards', type: 'number', description: 'Total task cards' },
          { name: 'completedTaskCards', type: 'number', description: 'Completed task cards' },
          { name: 'totalManHours', type: 'number', description: 'Estimated man-hours' },
          { name: 'actualManHours', type: 'number', description: 'Actual man-hours' },
          // AI-derived
          {
            name: 'completionForecast',
            type: 'datetime',
            description: 'AI-predicted completion time',
            isAIDerived: true,
            logicDescription: 'ML model considering task progress, crew availability, and parts status'
          },
          {
            name: 'delayRisk',
            type: 'number',
            description: 'Risk of schedule delay (0-100)',
            isAIDerived: true,
            logicDescription: 'Based on progress rate, pending parts, and crew allocation'
          }
        ],
        primaryKey: 'workOrderId',
        actions: [
          {
            name: 'AI Resource Optimization',
            nameCn: 'AI 资源优化',
            type: 'generative',
            description: 'AI-optimized crew and resource allocation',
            descriptionCn: 'AI优化的人员和资源分配',
            aiLogic: 'Optimize crew assignment considering skills, certifications, availability, and task dependencies',
            businessLayer: {
              description: '使用AI优化维护人员和资源分配',
              targetObject: 'Maintenance Work Order',
              executorRole: 'Maintenance Controller',
              triggerCondition: '工单创建或进度偏差'
            },
            logicLayer: {
              preconditions: ['工单状态为计划中或进行中'],
              parameters: [
                { name: 'workOrderId', type: 'string', required: true, description: '工单ID' },
                { name: 'optimizationGoal', type: 'string', required: false, description: '优化目标(time/cost/quality)' }
              ],
              postconditions: ['生成优化的人员分配方案'],
              sideEffects: ['更新班组排班', '调整工卡优先级']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/work-orders/{workOrderId}/ai-optimize',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'ai_optimize_resources',
                description: 'AI-optimize crew and resource allocation for a work order',
                parameters: {
                  type: 'object',
                  properties: {
                    workOrderId: { type: 'string' },
                    optimizationGoal: { type: 'string', enum: ['time', 'cost', 'quality'] }
                  },
                  required: ['workOrderId']
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
            name: 'Sign Off Task',
            nameCn: '签署工卡',
            type: 'traditional',
            description: 'Sign off completed task card',
            descriptionCn: '签署完成的工卡',
            businessLayer: {
              description: '维护人员完成工作后签署工卡',
              targetObject: 'Maintenance Work Order',
              executorRole: 'Technician',
              triggerCondition: '完成工卡任务'
            },
            logicLayer: {
              preconditions: ['工卡任务已完成', '所需备件已安装'],
              parameters: [
                { name: 'workOrderId', type: 'string', required: true, description: '工单ID' },
                { name: 'taskCardId', type: 'string', required: true, description: '工卡ID' },
                { name: 'technicianId', type: 'string', required: true, description: '技术员ID' },
                { name: 'remarks', type: 'string', required: false, description: '工作备注' }
              ],
              postconditions: ['工卡状态更新为已完成'],
              sideEffects: ['更新工单进度', '记录工时']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/work-orders/{workOrderId}/tasks/{taskCardId}/sign-off',
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
          { type: 'Smart Property', description: 'Completion time forecast' },
          { type: 'Smart Property', description: 'Delay risk prediction' },
          { type: 'Generative Action', description: 'AI resource optimization' }
        ]
      },
      {
        id: 'component',
        name: 'Aircraft Component',
        nameCn: '飞机部件',
        description: 'Rotable and life-limited component tracking',
        descriptionCn: '周转件和寿命件追踪',
        properties: [
          { name: 'partNumber', type: 'string', description: 'Part number' },
          { name: 'serialNumber', type: 'string', description: 'Serial number' },
          { name: 'description', type: 'string', description: 'Component description' },
          { name: 'ataChapter', type: 'string', description: 'ATA chapter code' },
          { name: 'installedOn', type: 'string', description: 'Installed aircraft' },
          { name: 'installedPosition', type: 'string', description: 'Installation position' },
          { name: 'status', type: 'string', description: 'Status (serviceable/unserviceable/in-shop)' },
          { name: 'tsnHours', type: 'number', description: 'Time since new (hours)' },
          { name: 'tsnCycles', type: 'number', description: 'Cycles since new' },
          { name: 'tsoHours', type: 'number', description: 'Time since overhaul (hours)' },
          { name: 'tsoCycles', type: 'number', description: 'Cycles since overhaul' },
          { name: 'lifeLimitHours', type: 'number', description: 'Life limit (hours)' },
          { name: 'lifeLimitCycles', type: 'number', description: 'Life limit (cycles)' },
          { name: 'nextOverhaulDue', type: 'datetime', description: 'Next overhaul due date' },
          // AI-derived
          {
            name: 'remainingUsefulLife',
            type: 'number',
            description: 'AI-predicted remaining useful life (%)',
            isAIDerived: true,
            logicDescription: 'Degradation model based on usage patterns and operational conditions'
          },
          {
            name: 'failureProbability',
            type: 'number',
            description: 'Probability of failure in next 500 flight hours',
            isAIDerived: true,
            logicDescription: 'Survival analysis model with sensor data and maintenance history'
          }
        ],
        primaryKey: 'serialNumber',
        actions: [
          {
            name: 'AI Removal Recommendation',
            nameCn: 'AI 拆换建议',
            type: 'generative',
            description: 'AI-recommended proactive component removal',
            descriptionCn: 'AI建议的主动部件拆换',
            aiLogic: 'Analyze degradation patterns to recommend optimal removal timing before failure',
            businessLayer: {
              description: 'AI分析部件状态，建议最佳拆换时机',
              targetObject: 'Aircraft Component',
              executorRole: 'Reliability Engineer',
              triggerCondition: '部件健康评分下降或接近寿命极限'
            },
            logicLayer: {
              preconditions: ['部件在机上运行'],
              parameters: [
                { name: 'serialNumber', type: 'string', required: true, description: '部件序号' },
                { name: 'urgency', type: 'string', required: false, description: '紧急程度' }
              ],
              postconditions: ['生成拆换建议报告'],
              sideEffects: ['触发备件需求', '更新维护计划']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/components/{serialNumber}/ai-removal-recommendation',
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
          { type: 'Smart Property', description: 'Remaining useful life prediction' },
          { type: 'Smart Property', description: 'Failure probability prediction' },
          { type: 'Generative Action', description: 'AI proactive removal recommendation' }
        ]
      },
      {
        id: 'spare-parts',
        name: 'Spare Parts Inventory',
        nameCn: '备件库存',
        description: 'Spare parts inventory and procurement tracking',
        descriptionCn: '备件库存和采购追踪',
        properties: [
          { name: 'partNumber', type: 'string', description: 'Part number' },
          { name: 'description', type: 'string', description: 'Part description' },
          { name: 'ataChapter', type: 'string', description: 'ATA chapter' },
          { name: 'quantityOnHand', type: 'number', description: 'Quantity in stock' },
          { name: 'quantityReserved', type: 'number', description: 'Quantity reserved' },
          { name: 'quantityAvailable', type: 'number', description: 'Quantity available' },
          { name: 'reorderPoint', type: 'number', description: 'Reorder point' },
          { name: 'leadTimeDays', type: 'number', description: 'Lead time (days)' },
          { name: 'unitCost', type: 'number', description: 'Unit cost' },
          { name: 'warehouseLocation', type: 'string', description: 'Warehouse location' },
          // AI-derived
          {
            name: 'forecastDemand30d',
            type: 'number',
            description: 'AI-forecasted demand in next 30 days',
            isAIDerived: true,
            logicDescription: 'Demand forecasting based on fleet maintenance schedule and failure predictions'
          },
          {
            name: 'optimalStockLevel',
            type: 'number',
            description: 'AI-recommended optimal stock level',
            isAIDerived: true,
            logicDescription: 'Service level optimization considering criticality and lead time'
          }
        ],
        primaryKey: 'partNumber',
        actions: [
          {
            name: 'AI Stock Optimization',
            nameCn: 'AI 库存优化',
            type: 'generative',
            description: 'AI-optimized inventory levels',
            descriptionCn: 'AI优化的库存水平',
            aiLogic: 'Optimize stock levels balancing service level, carrying cost, and AOG risk',
            businessLayer: {
              description: '使用AI优化备件库存水平',
              targetObject: 'Spare Parts Inventory',
              executorRole: 'Materials Manager',
              triggerCondition: '定期优化或需求预测变化'
            },
            logicLayer: {
              preconditions: ['有历史消耗数据'],
              parameters: [
                { name: 'partNumber', type: 'string', required: true, description: '备件号' },
                { name: 'targetServiceLevel', type: 'number', required: false, description: '目标服务水平(%)' }
              ],
              postconditions: ['更新建议库存水平'],
              sideEffects: ['生成采购建议']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/spare-parts/{partNumber}/ai-optimize',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: false,
              auditLog: true,
              riskLevel: 'low'
            }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Demand forecasting' },
          { type: 'Smart Property', description: 'Optimal stock level calculation' },
          { type: 'Generative Action', description: 'AI inventory optimization' }
        ]
      }
    ],
    links: [
      {
        id: 'aircraft-workorder',
        source: 'work-order',
        target: 'aircraft',
        label: 'for_aircraft',
        isSemantic: true
      },
      {
        id: 'aircraft-component',
        source: 'component',
        target: 'aircraft',
        label: 'installed_on',
        isSemantic: true
      },
      {
        id: 'component-parts',
        source: 'component',
        target: 'spare-parts',
        label: 'corresponds_to',
        isSemantic: true
      }
    ]
  },

  // ===== Kinetic Layer - 数据连接 =====
  connectors: [
    {
      id: 'acars-data',
      name: 'ACARS Flight Data Connector',
      description: {
        en: 'Real-time ACARS data for predictive maintenance',
        cn: 'ACARS实时飞行数据用于预测性维护'
      },
      sourceType: 'iot',
      sourceSystem: 'ACARS/FOQA',
      connectionTemplate: {
        requiredFields: [
          { name: 'acarsEndpoint', type: 'string', description: 'ACARS data endpoint' },
          { name: 'apiKey', type: 'secret', description: 'API key' }
        ]
      },
      sync: {
        direction: 'inbound',
        frequency: 'streaming'
      },
      mappedObjects: [
        {
          objectId: 'aircraft',
          sourceEntity: 'Flight Report',
          fieldMappings: [
            { sourceField: 'registration', targetProperty: 'tailNumber' },
            { sourceField: 'flight_hours', targetProperty: 'totalFlightHours' },
            { sourceField: 'cycles', targetProperty: 'totalCycles' }
          ]
        }
      ]
    },
    {
      id: 'mro-system',
      name: 'MRO System Connector',
      description: {
        en: 'Integration with MRO management system (AMOS, TRAX, etc.)',
        cn: '与MRO管理系统集成（AMOS、TRAX等）'
      },
      sourceType: 'mes',
      sourceSystem: 'MRO System (AMOS/TRAX)',
      connectionTemplate: {
        requiredFields: [
          { name: 'apiUrl', type: 'string', description: 'MRO system API URL' },
          { name: 'username', type: 'string', description: 'Username' },
          { name: 'password', type: 'secret', description: 'Password' }
        ]
      },
      sync: {
        direction: 'bidirectional',
        frequency: 'realtime',
        incrementalSync: true
      },
      mappedObjects: [
        {
          objectId: 'work-order',
          sourceEntity: 'Work Order',
          fieldMappings: [
            { sourceField: 'wo_number', targetProperty: 'workOrderId' },
            { sourceField: 'ac_reg', targetProperty: 'tailNumber' },
            { sourceField: 'wo_status', targetProperty: 'status' }
          ]
        },
        {
          objectId: 'component',
          sourceEntity: 'Component',
          fieldMappings: [
            { sourceField: 'part_no', targetProperty: 'partNumber' },
            { sourceField: 'serial_no', targetProperty: 'serialNumber' },
            { sourceField: 'tsn', targetProperty: 'tsnHours' }
          ]
        }
      ]
    },
    {
      id: 'erp-materials',
      name: 'ERP Materials Connector',
      description: {
        en: 'Integration with ERP for materials and procurement',
        cn: '与ERP集成物料和采购数据'
      },
      sourceType: 'erp',
      sourceSystem: 'SAP/Oracle',
      connectionTemplate: {
        requiredFields: [
          { name: 'hostname', type: 'string', description: 'ERP hostname' },
          { name: 'client', type: 'string', description: 'Client ID' }
        ]
      },
      sync: {
        direction: 'bidirectional',
        frequency: 'hourly',
        incrementalSync: true
      },
      mappedObjects: [
        {
          objectId: 'spare-parts',
          sourceEntity: 'Material Master',
          fieldMappings: [
            { sourceField: 'MATNR', targetProperty: 'partNumber' },
            { sourceField: 'LABST', targetProperty: 'quantityOnHand' },
            { sourceField: 'STPRS', targetProperty: 'unitCost' }
          ]
        }
      ]
    }
  ],

  // ===== Dynamic Layer - 业务工作流 =====
  workflows: [
    {
      id: 'scheduled-check',
      name: 'Scheduled Check Workflow',
      description: {
        en: 'End-to-end workflow for scheduled maintenance checks',
        cn: '定检维护端到端工作流'
      },
      trigger: {
        type: 'event',
        config: { event: 'check.due', condition: 'daysUntilDue < 14' }
      },
      steps: [
        {
          id: 'plan-check',
          name: 'Plan Check',
          description: { en: 'Create work order and plan resources', cn: '创建工单并规划资源' },
          type: 'action',
          actionRef: 'schedule-check',
          nextSteps: ['prepare-parts']
        },
        {
          id: 'prepare-parts',
          name: 'Prepare Parts',
          description: { en: 'Reserve and kit required parts', cn: '预留并配套所需备件' },
          type: 'action',
          actionRef: 'kit-parts',
          nextSteps: ['execute-check']
        },
        {
          id: 'execute-check',
          name: 'Execute Check',
          description: { en: 'Perform maintenance tasks', cn: '执行维护任务' },
          type: 'action',
          actionRef: 'sign-off-tasks',
          nextSteps: ['quality-inspection']
        },
        {
          id: 'quality-inspection',
          name: 'Quality Inspection',
          description: { en: 'QA inspection and documentation', cn: 'QA检验和文档' },
          type: 'action',
          actionRef: 'qa-inspection',
          nextSteps: ['release-aircraft']
        },
        {
          id: 'release-aircraft',
          name: 'Release Aircraft',
          description: { en: 'Sign release to service', cn: '签署放行' },
          type: 'action',
          actionRef: 'release-to-service',
          nextSteps: []
        }
      ],
      entryStep: 'plan-check',
      roles: ['Maintenance Planner', 'Technician', 'QA Inspector', 'Licensed Engineer'],
      sla: {
        maxDuration: '48h',
        escalationPath: ['Maintenance Manager', 'VP Maintenance']
      }
    },
    {
      id: 'aog-response',
      name: 'AOG Response Workflow',
      description: {
        en: 'Rapid response workflow for Aircraft on Ground situations',
        cn: '飞机AOG快速响应工作流'
      },
      trigger: {
        type: 'event',
        config: { event: 'aircraft.aog', condition: 'true' }
      },
      steps: [
        {
          id: 'assess-situation',
          name: 'Assess Situation',
          description: { en: 'AI-assisted fault diagnosis', cn: 'AI辅助故障诊断' },
          type: 'action',
          actionRef: 'ai-fault-diagnosis',
          nextSteps: ['locate-parts']
        },
        {
          id: 'locate-parts',
          name: 'Locate Parts',
          description: { en: 'Find required parts across network', cn: '在网络中定位所需备件' },
          type: 'action',
          actionRef: 'locate-parts',
          nextSteps: ['dispatch-team']
        },
        {
          id: 'dispatch-team',
          name: 'Dispatch Team',
          description: { en: 'Send maintenance team and parts', cn: '派遣维护团队和备件' },
          type: 'notification',
          nextSteps: ['execute-repair']
        },
        {
          id: 'execute-repair',
          name: 'Execute Repair',
          description: { en: 'Perform repair on site', cn: '现场执行维修' },
          type: 'action',
          actionRef: 'sign-off-tasks',
          nextSteps: ['release-aircraft']
        },
        {
          id: 'release-aircraft',
          name: 'Release Aircraft',
          description: { en: 'Release back to service', cn: '放行恢复运行' },
          type: 'action',
          actionRef: 'release-to-service',
          nextSteps: []
        }
      ],
      entryStep: 'assess-situation',
      roles: ['AOG Controller', 'Line Maintenance', 'Materials'],
      sla: {
        maxDuration: '6h',
        escalationPath: ['Maintenance Director', 'COO']
      }
    }
  ],

  rules: [
    {
      id: 'component-life-alert',
      name: 'Component Life Limit Alert',
      description: {
        en: 'Alert when component approaches life limit',
        cn: '部件接近寿命极限告警'
      },
      type: 'trigger',
      appliesTo: ['component'],
      expression: 'remainingUsefulLife < 15',
      onViolation: {
        action: 'notify',
        message: {
          en: 'Component {partNumber} S/N {serialNumber} has {remainingUsefulLife}% RUL remaining',
          cn: '部件 {partNumber} 序号 {serialNumber} 剩余使用寿命 {remainingUsefulLife}%'
        }
      }
    },
    {
      id: 'aog-parts-alert',
      name: 'Critical Parts Stockout Alert',
      description: {
        en: 'Alert when critical parts inventory is low',
        cn: '关键备件库存不足告警'
      },
      type: 'trigger',
      appliesTo: ['spare-parts'],
      expression: 'quantityAvailable < reorderPoint && ataChapter IN ("21", "24", "27", "32")',
      onViolation: {
        action: 'notify',
        message: {
          en: 'Critical part {partNumber} stock low: {quantityAvailable} available',
          cn: '关键备件 {partNumber} 库存不足：可用 {quantityAvailable}'
        }
      }
    }
  ],

  // ===== AI Layer - AI能力 =====
  aiCapabilities: [
    {
      id: 'predictive-maintenance',
      name: 'Predictive Maintenance',
      type: 'prediction',
      description: {
        en: 'Aircraft and component failure prediction using flight data',
        cn: '使用飞行数据进行飞机和部件故障预测'
      },
      enabledActions: ['ai-maintenance-forecast', 'ai-removal-recommendation'],
      modelConfig: {
        modelType: 'Survival Analysis + Deep Learning',
        trainingDataRequirements: 'ACARS data, maintenance history, component removals, shop findings'
      }
    },
    {
      id: 'resource-optimization',
      name: 'Resource Optimization',
      type: 'optimization',
      description: {
        en: 'Crew and resource allocation optimization',
        cn: '人员和资源分配优化'
      },
      enabledActions: ['ai-optimize-resources'],
      modelConfig: {
        modelType: 'Constraint Optimization + ML',
        trainingDataRequirements: 'Crew skills, certifications, task durations, historical productivity'
      }
    },
    {
      id: 'inventory-optimization',
      name: 'Inventory Optimization',
      type: 'optimization',
      description: {
        en: 'Spare parts inventory optimization',
        cn: '备件库存优化'
      },
      enabledActions: ['ai-stock-optimization'],
      modelConfig: {
        modelType: 'Demand Forecasting + Service Level Optimization',
        trainingDataRequirements: 'Historical consumption, fleet schedules, lead times, AOG events'
      }
    }
  ],

  // ===== UI Templates - 预配置界面 =====
  dashboards: [
    {
      id: 'mcc-control',
      name: 'Maintenance Control Center',
      description: {
        en: 'Real-time maintenance operations dashboard',
        cn: '实时维护运控仪表盘'
      },
      targetRole: 'Maintenance Controller',
      gridColumns: 12,
      gridRows: 8,
      widgets: [
        {
          id: 'fleet-health',
          type: 'kpi',
          title: { en: 'Fleet Health', cn: '机队健康' },
          dataSource: {
            objectId: 'aircraft',
            aggregation: 'AVG(healthIndex)'
          },
          layout: { x: 0, y: 0, width: 3, height: 2 }
        },
        {
          id: 'active-checks',
          type: 'kpi',
          title: { en: 'Active Checks', cn: '在修飞机' },
          dataSource: {
            objectId: 'work-order',
            query: 'status = in-progress',
            aggregation: 'COUNT'
          },
          layout: { x: 3, y: 0, width: 3, height: 2 }
        },
        {
          id: 'aog-aircraft',
          type: 'kpi',
          title: { en: 'AOG Aircraft', cn: 'AOG飞机' },
          dataSource: {
            objectId: 'aircraft',
            query: 'status = aog',
            aggregation: 'COUNT'
          },
          layout: { x: 6, y: 0, width: 3, height: 2 },
          style: { alertThreshold: 1 }
        },
        {
          id: 'fleet-status',
          type: 'chart',
          title: { en: 'Fleet Status', cn: '机队状态' },
          dataSource: { objectId: 'aircraft' },
          layout: { x: 0, y: 2, width: 6, height: 3 }
        },
        {
          id: 'work-orders',
          type: 'table',
          title: { en: 'Active Work Orders', cn: '进行中工单' },
          dataSource: {
            objectId: 'work-order',
            query: 'status IN (planned, in-progress)'
          },
          layout: { x: 6, y: 2, width: 6, height: 3 }
        },
        {
          id: 'component-alerts',
          type: 'table',
          title: { en: 'Component Alerts', cn: '部件告警' },
          dataSource: {
            objectId: 'component',
            query: 'failureProbability > 0.3'
          },
          layout: { x: 0, y: 5, width: 6, height: 3 }
        },
        {
          id: 'parts-critical',
          type: 'table',
          title: { en: 'Critical Parts Status', cn: '关键备件状态' },
          dataSource: {
            objectId: 'spare-parts',
            query: 'quantityAvailable < reorderPoint'
          },
          layout: { x: 6, y: 5, width: 6, height: 3 }
        }
      ],
      globalFilters: [
        { property: 'aircraftType', label: 'Aircraft Type', type: 'select' },
        { property: 'baseStation', label: 'Base', type: 'select' }
      ]
    }
  ],

  views: [
    {
      id: 'aircraft-list',
      name: 'Aircraft Fleet',
      type: 'list',
      objectId: 'aircraft',
      fields: [
        { property: 'tailNumber', label: { en: 'Tail #', cn: '注册号' }, visible: true, sortable: true },
        { property: 'aircraftType', label: { en: 'Type', cn: '机型' }, visible: true, filterable: true },
        { property: 'totalFlightHours', label: { en: 'FH', cn: '飞行小时' }, visible: true, sortable: true },
        { property: 'healthIndex', label: { en: 'Health', cn: '健康指数' }, visible: true, sortable: true },
        { property: 'predictedAOGRisk', label: { en: 'AOG Risk', cn: 'AOG风险' }, visible: true, sortable: true },
        { property: 'status', label: { en: 'Status', cn: '状态' }, visible: true, filterable: true },
        { property: 'nextCheckDue', label: { en: 'Next Check', cn: '下次检查' }, visible: true, sortable: true }
      ],
      defaultSort: { property: 'predictedAOGRisk', direction: 'desc' },
      availableActions: ['ai-maintenance-forecast', 'schedule-check']
    }
  ],

  // ===== Deployment Config =====
  deployment: {
    requirements: {
      platform: ['DataPlatform', 'Custom'],
      minVersion: '2.0',
      resources: {
        cpu: '8 cores',
        memory: '32GB',
        storage: '500GB'
      }
    },
    environmentVariables: [
      { name: 'ACARS_ENDPOINT', description: 'ACARS data feed endpoint', required: true },
      { name: 'MRO_SYSTEM_URL', description: 'MRO system API URL', required: true },
      { name: 'ERP_HOST', description: 'ERP system hostname', required: true },
      { name: 'AI_MODEL_ENDPOINT', description: 'AI model serving endpoint', required: false, default: 'internal' }
    ],
    dependencies: []
  },

  // ===== Documentation =====
  documentation: {
    quickStart: {
      en: `
## Quick Start Guide

1. **Configure Data Sources**
   - Set up ACARS/FOQA data feed for flight data
   - Configure MRO system integration (AMOS, TRAX, etc.)
   - Connect ERP for materials data

2. **Deploy Ontology**
   - Import aircraft and component masters
   - Configure maintenance program rules
   - Set up AI model endpoints

3. **Customize for Your Operation**
   - Configure fleet-specific parameters
   - Set maintenance thresholds and alerts
   - Customize dashboards for your roles

4. **Regulatory Compliance**
   - Ensure data retention meets regulatory requirements
   - Configure audit trails for airworthiness
   - Set up approval workflows for critical actions

5. **Go Live**
   - Start with predictive monitoring (read-only)
   - Validate AI recommendations against engineering judgment
   - Progressively enable automated actions
      `,
      cn: `
## 快速启动指南

1. **配置数据源**
   - 设置ACARS/FOQA飞行数据接入
   - 配置MRO系统集成（AMOS、TRAX等）
   - 连接ERP获取物料数据

2. **部署Ontology**
   - 导入飞机和部件主数据
   - 配置维护大纲规则
   - 设置AI模型端点

3. **定制适配**
   - 配置机队特定参数
   - 设置维护阈值和告警
   - 为不同角色定制仪表盘

4. **适航合规**
   - 确保数据保留符合监管要求
   - 配置适航审计追踪
   - 设置关键操作的审批流程

5. **上线**
   - 从预测监控开始（只读）
   - 验证AI建议与工程判断一致
   - 逐步启用自动化操作
      `
    },
    bestPractices: [
      'Validate AI predictions against actual maintenance findings',
      'Maintain human oversight for all safety-critical decisions',
      'Ensure regulatory compliance for all maintenance records',
      'Regular calibration of predictive models with shop findings'
    ]
  }
};
