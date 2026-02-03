/**
 * 制造业 MES 集成 Archetype
 * Manufacturing Execution System Integration Archetype
 *
 * 来源：FDE 在多个制造业客户的实施经验沉淀
 * 适用场景：离散制造、流程制造的生产执行管理
 * 部署时间：预计 1-2 周（含数据对接）
 */

import { Archetype } from '../../types/archetype';

export const manufacturingMESArchetype: Archetype = {
  metadata: {
    id: 'manufacturing-mes',
    name: 'Manufacturing MES Integration',
    description: {
      en: 'End-to-end manufacturing execution system integration with AI-powered scheduling optimization, real-time production monitoring, and predictive maintenance.',
      cn: '端到端制造执行系统集成，具备AI智能排程优化、实时生产监控和预测性维护能力。'
    },
    industry: 'manufacturing',
    domain: 'production-execution',
    version: '2.1.0',
    changelog: [
      {
        version: '2.1.0',
        date: '2026-01-20',
        changes: ['Added AI scheduling optimization', 'Enhanced IoT integration']
      },
      {
        version: '2.0.0',
        date: '2025-09-15',
        changes: ['Major refactor for multi-plant support', 'Added predictive maintenance']
      }
    ],
    origin: {
      sourceEngagement: 'Electronics Manufacturer (Fortune 500)',
      fdeContributors: ['Alex Chen', 'Sarah Wang'],
      abstractionDate: '2025-06-01'
    },
    usage: {
      deployments: 12,
      industries: ['Electronics', 'Automotive', 'Pharmaceutical'],
      avgDeploymentTime: '10 days'
    }
  },

  // ===== Semantic Layer - 业务概念模型 =====
  ontology: {
    objects: [
      {
        id: 'work-order',
        name: 'Work Order',
        nameCn: '生产工单',
        description: 'Manufacturing work order representing a production task',
        descriptionCn: '代表生产任务的制造工单',
        properties: [
          { name: 'workOrderId', type: 'string', description: 'Unique identifier' },
          { name: 'productCode', type: 'string', description: 'Product to manufacture' },
          { name: 'quantity', type: 'number', description: 'Target quantity' },
          { name: 'priority', type: 'string', description: 'Priority level (P1-P4)' },
          { name: 'status', type: 'string', description: 'Current status' },
          { name: 'plannedStart', type: 'datetime', description: 'Planned start time' },
          { name: 'plannedEnd', type: 'datetime', description: 'Planned end time' },
          { name: 'actualStart', type: 'datetime', description: 'Actual start time' },
          { name: 'actualEnd', type: 'datetime', description: 'Actual end time' },
          { name: 'completedQty', type: 'number', description: 'Completed quantity' },
          { name: 'scrapQty', type: 'number', description: 'Scrap quantity' },
          { name: 'assignedLine', type: 'string', description: 'Assigned production line' },
          // AI-derived properties
          {
            name: 'onTimeRisk',
            type: 'number',
            description: 'AI-predicted risk of delay (0-1)',
            isAIDerived: true,
            logicDescription: 'ML model considering historical performance, current WIP, equipment status'
          },
          {
            name: 'optimalSequence',
            type: 'number',
            description: 'AI-recommended sequence position',
            isAIDerived: true,
            logicDescription: 'Optimization considering changeover time, material availability, due date'
          }
        ],
        primaryKey: 'workOrderId',
        actions: [
          {
            name: 'AI Schedule',
            nameCn: 'AI 智能排程',
            type: 'generative',
            description: 'AI-optimized scheduling considering all constraints',
            descriptionCn: 'AI优化排程，综合考虑所有约束条件',
            aiLogic: 'Constraint optimization: minimize total tardiness + changeover time, subject to capacity, material, and maintenance constraints',
            businessLayer: {
              description: '使用AI算法为工单找到最优排程方案',
              targetObject: 'Work Order',
              executorRole: 'Production Planner',
              triggerCondition: '新工单创建或需要重排'
            },
            logicLayer: {
              preconditions: ['工单状态为待排程', '物料已齐套或有预计到货时间'],
              parameters: [
                { name: 'workOrderIds', type: 'array', required: true, description: '待排程工单ID列表' },
                { name: 'horizon', type: 'number', required: false, description: '排程时间范围(天)' },
                { name: 'objective', type: 'string', required: false, description: '优化目标(on-time/throughput/cost)' }
              ],
              postconditions: ['工单获得排程时间和产线分配', '产能被预留'],
              sideEffects: ['更新产能视图', '触发物料齐套检查', '通知车间主管']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/work-orders/ai-schedule',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'ai_schedule_work_orders',
                description: 'Use AI to optimally schedule work orders across production lines',
                parameters: {
                  type: 'object',
                  properties: {
                    workOrderIds: { type: 'array', items: { type: 'string' } },
                    horizon: { type: 'number', default: 7 },
                    objective: { type: 'string', enum: ['on-time', 'throughput', 'cost'] }
                  },
                  required: ['workOrderIds']
                }
              }
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: true,
              auditLog: true,
              riskLevel: 'medium'
            }
          },
          {
            name: 'Release to Production',
            nameCn: '下发生产',
            type: 'traditional',
            description: 'Release work order to shop floor',
            descriptionCn: '将工单下发到车间执行',
            businessLayer: {
              description: '确认排程后下发工单到车间',
              targetObject: 'Work Order',
              executorRole: 'Production Planner',
              triggerCondition: '排程已确认且物料齐套'
            },
            logicLayer: {
              preconditions: ['工单状态为已排程', '物料齐套率>=95%', '设备状态正常'],
              parameters: [
                { name: 'workOrderId', type: 'string', required: true, description: '工单ID' }
              ],
              postconditions: ['工单状态变为已下发', 'MES系统收到工单'],
              sideEffects: ['同步到MES', '发送通知到车间终端']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/work-orders/{workOrderId}/release',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'release_work_order',
                description: 'Release a scheduled work order to the shop floor for execution',
                parameters: {
                  type: 'object',
                  properties: {
                    workOrderId: { type: 'string' }
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
            name: 'Report Progress',
            nameCn: '报工',
            type: 'traditional',
            description: 'Report production progress',
            descriptionCn: '汇报生产进度',
            businessLayer: {
              description: '车间操作员汇报生产完成数量',
              targetObject: 'Work Order',
              executorRole: 'Operator',
              triggerCondition: '完成一批次生产'
            },
            logicLayer: {
              preconditions: ['工单状态为生产中'],
              parameters: [
                { name: 'workOrderId', type: 'string', required: true, description: '工单ID' },
                { name: 'completedQty', type: 'number', required: true, description: '完成数量' },
                { name: 'scrapQty', type: 'number', required: false, description: '报废数量' }
              ],
              postconditions: ['完成数量累加', '如达到目标则状态变为已完成'],
              sideEffects: ['更新实时看板', '更新OEE指标']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/work-orders/{workOrderId}/progress',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'report_progress',
                description: 'Report production progress for a work order',
                parameters: {
                  type: 'object',
                  properties: {
                    workOrderId: { type: 'string' },
                    completedQty: { type: 'number' },
                    scrapQty: { type: 'number' }
                  },
                  required: ['workOrderId', 'completedQty']
                }
              }
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
          {
            type: 'Smart Property',
            description: 'On-time delivery risk prediction using ML'
          },
          {
            type: 'Generative Action',
            description: 'AI-powered scheduling optimization'
          }
        ]
      },
      {
        id: 'production-line',
        name: 'Production Line',
        nameCn: '生产线',
        description: 'Manufacturing production line with equipment and capacity',
        descriptionCn: '包含设备和产能信息的生产线',
        properties: [
          { name: 'lineId', type: 'string', description: 'Line identifier' },
          { name: 'lineName', type: 'string', description: 'Line name' },
          { name: 'lineType', type: 'string', description: 'Line type (assembly/machining/packaging)' },
          { name: 'status', type: 'string', description: 'Current status' },
          { name: 'capacity', type: 'number', description: 'Standard capacity (units/hour)' },
          { name: 'currentOEE', type: 'number', description: 'Current OEE percentage' },
          { name: 'plantId', type: 'string', description: 'Plant location' },
          // AI-derived
          {
            name: 'predictedDowntime',
            type: 'number',
            description: 'Predicted downtime in next 24h (minutes)',
            isAIDerived: true,
            logicDescription: 'Predictive maintenance model based on sensor data and historical patterns'
          }
        ],
        primaryKey: 'lineId',
        actions: [
          {
            name: 'Start Changeover',
            nameCn: '开始换线',
            type: 'traditional',
            description: 'Initiate production line changeover',
            descriptionCn: '启动产线换线',
            businessLayer: {
              description: '开始产线换线，切换到新产品生产',
              targetObject: 'Production Line',
              executorRole: 'Line Supervisor',
              triggerCondition: '当前工单完成，下一工单产品不同'
            },
            logicLayer: {
              preconditions: ['产线状态为空闲或等待换线'],
              parameters: [
                { name: 'lineId', type: 'string', required: true, description: '产线ID' },
                { name: 'targetProduct', type: 'string', required: true, description: '目标产品' }
              ],
              postconditions: ['产线状态变为换线中'],
              sideEffects: ['记录换线开始时间']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/lines/{lineId}/changeover/start',
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
          {
            type: 'Smart Property',
            description: 'Predictive maintenance downtime forecast'
          }
        ]
      },
      {
        id: 'equipment',
        name: 'Equipment',
        nameCn: '设备',
        description: 'Production equipment with maintenance tracking',
        descriptionCn: '带维护追踪的生产设备',
        properties: [
          { name: 'equipmentId', type: 'string', description: 'Equipment ID' },
          { name: 'equipmentName', type: 'string', description: 'Equipment name' },
          { name: 'equipmentType', type: 'string', description: 'Equipment type' },
          { name: 'lineId', type: 'string', description: 'Associated production line' },
          { name: 'status', type: 'string', description: 'Current status' },
          { name: 'lastMaintenance', type: 'datetime', description: 'Last maintenance date' },
          { name: 'nextMaintenance', type: 'datetime', description: 'Next scheduled maintenance' },
          { name: 'runningHours', type: 'number', description: 'Total running hours' },
          // AI-derived
          {
            name: 'failureProbability',
            type: 'number',
            description: 'Predicted failure probability in next 7 days',
            isAIDerived: true,
            logicDescription: 'ML model using vibration, temperature, and usage patterns'
          },
          {
            name: 'recommendedAction',
            type: 'string',
            description: 'AI-recommended maintenance action',
            isAIDerived: true,
            logicDescription: 'Rule-based + ML recommendation engine'
          }
        ],
        primaryKey: 'equipmentId',
        actions: [
          {
            name: 'Schedule Maintenance',
            nameCn: '安排维护',
            type: 'generative',
            description: 'AI-optimized maintenance scheduling',
            descriptionCn: 'AI优化的维护排程',
            aiLogic: 'Balance failure risk vs production impact, find optimal maintenance window',
            businessLayer: {
              description: '基于预测性维护模型安排最优维护时间',
              targetObject: 'Equipment',
              executorRole: 'Maintenance Planner',
              triggerCondition: '故障概率超过阈值或接近计划维护时间'
            },
            logicLayer: {
              preconditions: ['设备有维护需求'],
              parameters: [
                { name: 'equipmentId', type: 'string', required: true, description: '设备ID' },
                { name: 'maintenanceType', type: 'string', required: true, description: '维护类型' },
                { name: 'urgency', type: 'string', required: false, description: '紧急程度' }
              ],
              postconditions: ['创建维护工单', '在排程中预留时间'],
              sideEffects: ['通知维护团队', '更新产能计划']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/equipment/{equipmentId}/maintenance/schedule',
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
          {
            type: 'Smart Property',
            description: 'Failure probability prediction'
          },
          {
            type: 'Generative Action',
            description: 'AI-optimized maintenance scheduling'
          }
        ]
      }
    ],
    links: [
      {
        id: 'wo-line',
        source: 'work-order',
        target: 'production-line',
        label: 'assigned_to',
        isSemantic: true
      },
      {
        id: 'line-equipment',
        source: 'production-line',
        target: 'equipment',
        label: 'contains',
        isSemantic: true
      }
    ]
  },

  // ===== Kinetic Layer - 数据连接 =====
  connectors: [
    {
      id: 'sap-erp',
      name: 'SAP S/4HANA Connector',
      description: {
        en: 'Bidirectional integration with SAP S/4HANA for work orders and materials',
        cn: '与 SAP S/4HANA 的双向集成，同步工单和物料数据'
      },
      sourceType: 'erp',
      sourceSystem: 'SAP S/4HANA',
      sourceVersion: '2021+',
      connectionTemplate: {
        requiredFields: [
          { name: 'hostname', type: 'string', description: 'SAP hostname', example: 'sap.company.com' },
          { name: 'client', type: 'string', description: 'SAP client number', example: '100' },
          { name: 'username', type: 'string', description: 'SAP username' },
          { name: 'password', type: 'secret', description: 'SAP password' }
        ],
        optionalFields: [
          { name: 'port', type: 'number', description: 'SAP port', default: 443 }
        ]
      },
      sync: {
        direction: 'bidirectional',
        frequency: 'hourly',
        incrementalSync: true,
        conflictResolution: 'source-wins'
      },
      mappedObjects: [
        {
          objectId: 'work-order',
          sourceEntity: 'AFKO (Production Order)',
          fieldMappings: [
            { sourceField: 'AUFNR', targetProperty: 'workOrderId' },
            { sourceField: 'PLNBEZ', targetProperty: 'productCode' },
            { sourceField: 'GAMNG', targetProperty: 'quantity' },
            { sourceField: 'STAT', targetProperty: 'status', transformation: 'STATUS_MAP' }
          ]
        }
      ]
    },
    {
      id: 'mes-integration',
      name: 'MES Real-time Connector',
      description: {
        en: 'Real-time integration with MES for production status and events',
        cn: '与 MES 的实时集成，获取生产状态和事件'
      },
      sourceType: 'mes',
      sourceSystem: 'Generic MES (OPC-UA)',
      connectionTemplate: {
        requiredFields: [
          { name: 'opcuaEndpoint', type: 'string', description: 'OPC-UA endpoint URL' },
          { name: 'securityMode', type: 'string', description: 'Security mode' }
        ]
      },
      sync: {
        direction: 'inbound',
        frequency: 'realtime',
        incrementalSync: true
      },
      mappedObjects: [
        {
          objectId: 'production-line',
          sourceEntity: 'Line Status Node',
          fieldMappings: [
            { sourceField: 'LineID', targetProperty: 'lineId' },
            { sourceField: 'Status', targetProperty: 'status' },
            { sourceField: 'CurrentOEE', targetProperty: 'currentOEE' }
          ]
        }
      ]
    },
    {
      id: 'iot-sensors',
      name: 'IoT Sensor Connector',
      description: {
        en: 'Streaming data from equipment sensors for predictive maintenance',
        cn: '从设备传感器获取流数据，用于预测性维护'
      },
      sourceType: 'iot',
      sourceSystem: 'Azure IoT Hub / AWS IoT',
      connectionTemplate: {
        requiredFields: [
          { name: 'connectionString', type: 'secret', description: 'IoT Hub connection string' },
          { name: 'consumerGroup', type: 'string', description: 'Consumer group name' }
        ]
      },
      sync: {
        direction: 'inbound',
        frequency: 'streaming'
      },
      mappedObjects: [
        {
          objectId: 'equipment',
          sourceEntity: 'Sensor Telemetry',
          fieldMappings: [
            { sourceField: 'deviceId', targetProperty: 'equipmentId' },
            { sourceField: 'vibration', targetProperty: '_raw_vibration' },
            { sourceField: 'temperature', targetProperty: '_raw_temperature' }
          ]
        }
      ]
    }
  ],

  // ===== Dynamic Layer - 业务工作流 =====
  workflows: [
    {
      id: 'daily-scheduling',
      name: 'Daily Production Scheduling',
      description: {
        en: 'Automated daily scheduling workflow with AI optimization',
        cn: '自动化每日排程工作流，包含AI优化'
      },
      trigger: {
        type: 'scheduled',
        config: { cron: '0 5 * * *', timezone: 'local' }
      },
      steps: [
        {
          id: 'fetch-orders',
          name: 'Fetch New Orders',
          description: { en: 'Fetch unscheduled orders from ERP', cn: '从ERP获取未排程订单' },
          type: 'action',
          actionRef: 'sync-from-sap',
          nextSteps: ['check-materials']
        },
        {
          id: 'check-materials',
          name: 'Check Material Availability',
          description: { en: 'Verify material availability', cn: '检查物料齐套率' },
          type: 'action',
          actionRef: 'material-check',
          nextSteps: ['ai-schedule']
        },
        {
          id: 'ai-schedule',
          name: 'AI Scheduling',
          description: { en: 'Run AI scheduling optimization', cn: '运行AI排程优化' },
          type: 'action',
          actionRef: 'ai-schedule-work-orders',
          nextSteps: ['notify-planners']
        },
        {
          id: 'notify-planners',
          name: 'Notify Planners',
          description: { en: 'Send schedule to planners for review', cn: '发送排程给计划员审核' },
          type: 'notification',
          nextSteps: []
        }
      ],
      entryStep: 'fetch-orders',
      roles: ['Production Planner', 'System'],
      sla: {
        maxDuration: '2h',
        escalationPath: ['Production Manager']
      }
    },
    {
      id: 'urgent-order-handling',
      name: 'Urgent Order Fast Track',
      description: {
        en: 'Expedited workflow for urgent orders',
        cn: '紧急订单快速处理流程'
      },
      trigger: {
        type: 'event',
        config: { event: 'order.created', condition: 'priority == P1' }
      },
      steps: [
        {
          id: 'assess-impact',
          name: 'Assess Schedule Impact',
          description: { en: 'AI assesses impact of inserting urgent order', cn: 'AI评估插入紧急订单的影响' },
          type: 'action',
          actionRef: 'assess-schedule-impact',
          nextSteps: ['approval-decision']
        },
        {
          id: 'approval-decision',
          name: 'Manager Approval',
          description: { en: 'Manager reviews and approves', cn: '经理审核批准' },
          type: 'condition',
          condition: {
            expression: 'impact.delayedOrders > 3',
            trueBranch: 'escalate-to-director',
            falseBranch: 'reschedule'
          }
        },
        {
          id: 'reschedule',
          name: 'Reschedule',
          description: { en: 'Execute rescheduling', cn: '执行重排' },
          type: 'action',
          actionRef: 'ai-reschedule',
          nextSteps: []
        },
        {
          id: 'escalate-to-director',
          name: 'Escalate',
          description: { en: 'Escalate to director for high-impact decisions', cn: '升级到总监处理高影响决策' },
          type: 'notification',
          nextSteps: []
        }
      ],
      entryStep: 'assess-impact',
      roles: ['Production Planner', 'Production Manager', 'Plant Director'],
      sla: {
        maxDuration: '4h',
        escalationPath: ['Plant Director', 'VP Operations']
      }
    }
  ],

  rules: [
    {
      id: 'oee-threshold',
      name: 'OEE Alert Rule',
      description: {
        en: 'Alert when OEE drops below threshold',
        cn: '当OEE低于阈值时告警'
      },
      type: 'trigger',
      appliesTo: ['production-line'],
      expression: 'currentOEE < 75',
      onViolation: {
        action: 'notify',
        message: {
          en: 'Production line {lineId} OEE dropped to {currentOEE}%',
          cn: '产线 {lineId} OEE下降到 {currentOEE}%'
        }
      }
    },
    {
      id: 'maintenance-required',
      name: 'Maintenance Alert Rule',
      description: {
        en: 'Alert when equipment failure probability exceeds threshold',
        cn: '当设备故障概率超过阈值时告警'
      },
      type: 'trigger',
      appliesTo: ['equipment'],
      expression: 'failureProbability > 0.7',
      onViolation: {
        action: 'notify',
        message: {
          en: 'Equipment {equipmentId} has high failure risk ({failureProbability})',
          cn: '设备 {equipmentId} 故障风险较高 ({failureProbability})'
        }
      }
    }
  ],

  // ===== AI Layer - AI能力 =====
  aiCapabilities: [
    {
      id: 'schedule-optimization',
      name: 'Schedule Optimization',
      type: 'optimization',
      description: {
        en: 'Multi-objective optimization for production scheduling',
        cn: '生产排程多目标优化'
      },
      enabledActions: ['ai-schedule-work-orders', 'ai-reschedule'],
      modelConfig: {
        modelType: 'Constraint Optimization + ML',
        trainingDataRequirements: 'Historical schedules, changeover times, production performance'
      }
    },
    {
      id: 'predictive-maintenance',
      name: 'Predictive Maintenance',
      type: 'prediction',
      description: {
        en: 'Equipment failure prediction using sensor data',
        cn: '基于传感器数据的设备故障预测'
      },
      enabledActions: ['schedule-maintenance'],
      modelConfig: {
        modelType: 'Time-series ML (LSTM/Transformer)',
        trainingDataRequirements: 'Sensor telemetry, maintenance logs, failure records'
      }
    },
    {
      id: 'demand-sensing',
      name: 'Demand Sensing',
      type: 'prediction',
      description: {
        en: 'Short-term demand forecasting for production planning',
        cn: '用于生产计划的短期需求预测'
      },
      enabledActions: [],
      modelConfig: {
        modelType: 'Gradient Boosting / Prophet',
        trainingDataRequirements: 'Historical orders, seasonal patterns, promotions'
      }
    }
  ],

  // ===== UI Templates - 预配置界面 =====
  dashboards: [
    {
      id: 'production-control',
      name: 'Production Control Center',
      description: {
        en: 'Real-time production monitoring dashboard',
        cn: '实时生产监控仪表盘'
      },
      targetRole: 'Production Manager',
      gridColumns: 12,
      gridRows: 8,
      widgets: [
        {
          id: 'oee-gauge',
          type: 'kpi',
          title: { en: 'Plant OEE', cn: '工厂OEE' },
          dataSource: {
            objectId: 'production-line',
            aggregation: 'AVG(currentOEE)'
          },
          layout: { x: 0, y: 0, width: 3, height: 2 }
        },
        {
          id: 'active-orders',
          type: 'kpi',
          title: { en: 'Active Orders', cn: '在制工单' },
          dataSource: {
            objectId: 'work-order',
            query: 'status IN (released, in_progress)',
            aggregation: 'COUNT'
          },
          layout: { x: 3, y: 0, width: 3, height: 2 }
        },
        {
          id: 'at-risk-orders',
          type: 'kpi',
          title: { en: 'At-Risk Orders', cn: '风险工单' },
          dataSource: {
            objectId: 'work-order',
            query: 'onTimeRisk > 0.5',
            aggregation: 'COUNT'
          },
          layout: { x: 6, y: 0, width: 3, height: 2 },
          style: { alertThreshold: 5 }
        },
        {
          id: 'schedule-timeline',
          type: 'timeline',
          title: { en: 'Production Schedule', cn: '生产排程' },
          dataSource: {
            objectId: 'work-order',
            query: 'status IN (scheduled, released, in_progress)'
          },
          layout: { x: 0, y: 2, width: 8, height: 4 }
        },
        {
          id: 'line-status',
          type: 'table',
          title: { en: 'Line Status', cn: '产线状态' },
          dataSource: {
            objectId: 'production-line'
          },
          layout: { x: 8, y: 2, width: 4, height: 4 }
        },
        {
          id: 'equipment-health',
          type: 'chart',
          title: { en: 'Equipment Health', cn: '设备健康' },
          dataSource: {
            objectId: 'equipment',
            query: 'failureProbability > 0'
          },
          layout: { x: 0, y: 6, width: 6, height: 2 }
        },
        {
          id: 'action-panel',
          type: 'action-panel',
          title: { en: 'Quick Actions', cn: '快捷操作' },
          dataSource: { objectId: 'work-order' },
          layout: { x: 6, y: 6, width: 6, height: 2 },
          interactions: {
            onClick: 'ai-schedule-work-orders'
          }
        }
      ],
      globalFilters: [
        { property: 'plantId', label: 'Plant', type: 'select' },
        { property: 'plannedStart', label: 'Date Range', type: 'date-range' }
      ]
    },
    {
      id: 'planner-workspace',
      name: 'Planner Workspace',
      description: {
        en: 'Daily planning workspace for production planners',
        cn: '计划员日常工作台'
      },
      targetRole: 'Production Planner',
      gridColumns: 12,
      gridRows: 8,
      widgets: [
        {
          id: 'unscheduled-orders',
          type: 'table',
          title: { en: 'Unscheduled Orders', cn: '待排程工单' },
          dataSource: {
            objectId: 'work-order',
            query: 'status = pending'
          },
          layout: { x: 0, y: 0, width: 6, height: 4 }
        },
        {
          id: 'capacity-chart',
          type: 'chart',
          title: { en: 'Capacity Utilization', cn: '产能利用率' },
          dataSource: {
            objectId: 'production-line'
          },
          layout: { x: 6, y: 0, width: 6, height: 4 }
        },
        {
          id: 'schedule-gantt',
          type: 'timeline',
          title: { en: 'Schedule Gantt', cn: '排程甘特图' },
          dataSource: {
            objectId: 'work-order'
          },
          layout: { x: 0, y: 4, width: 12, height: 4 }
        }
      ]
    }
  ],

  views: [
    {
      id: 'work-order-list',
      name: 'Work Orders',
      type: 'list',
      objectId: 'work-order',
      fields: [
        { property: 'workOrderId', label: { en: 'Order ID', cn: '工单号' }, visible: true, sortable: true },
        { property: 'productCode', label: { en: 'Product', cn: '产品' }, visible: true, filterable: true },
        { property: 'quantity', label: { en: 'Qty', cn: '数量' }, visible: true, sortable: true },
        { property: 'status', label: { en: 'Status', cn: '状态' }, visible: true, filterable: true },
        { property: 'plannedStart', label: { en: 'Planned Start', cn: '计划开始' }, visible: true, sortable: true },
        { property: 'onTimeRisk', label: { en: 'Risk', cn: '风险' }, visible: true, sortable: true }
      ],
      defaultSort: { property: 'plannedStart', direction: 'asc' },
      availableActions: ['ai-schedule-work-orders', 'release-work-order', 'report-progress']
    }
  ],

  // ===== Deployment Config =====
  deployment: {
    requirements: {
      platform: ['DataPlatform', 'Custom'],
      minVersion: '2.0',
      resources: {
        cpu: '4 cores',
        memory: '16GB',
        storage: '100GB'
      }
    },
    environmentVariables: [
      { name: 'SAP_HOST', description: 'SAP S/4HANA hostname', required: true },
      { name: 'SAP_CLIENT', description: 'SAP client number', required: true },
      { name: 'MES_OPCUA_ENDPOINT', description: 'MES OPC-UA endpoint', required: true },
      { name: 'IOT_CONNECTION_STRING', description: 'IoT Hub connection string', required: true },
      { name: 'AI_MODEL_ENDPOINT', description: 'AI model serving endpoint', required: false, default: 'internal' }
    ],
    dependencies: []
  },

  // ===== Documentation =====
  documentation: {
    quickStart: {
      en: `
## Quick Start Guide

1. **Configure Data Connectors**
   - Set up SAP S/4HANA connection for work orders
   - Configure MES OPC-UA endpoint for real-time status
   - Connect IoT Hub for sensor telemetry

2. **Deploy Ontology**
   - Import object definitions to your platform
   - Set up data sync schedules
   - Configure AI model endpoints

3. **Customize for Your Environment**
   - Map SAP fields to your specific configuration
   - Adjust OEE thresholds and alerting rules
   - Customize dashboards for your roles

4. **Go Live**
   - Run parallel testing with existing systems
   - Train users on new workflows
   - Enable AI features progressively
      `,
      cn: `
## 快速启动指南

1. **配置数据连接器**
   - 设置 SAP S/4HANA 连接以同步工单
   - 配置 MES OPC-UA 端点获取实时状态
   - 连接 IoT Hub 获取传感器数据

2. **部署 Ontology**
   - 将对象定义导入到你的平台
   - 设置数据同步计划
   - 配置 AI 模型端点

3. **定制适配**
   - 根据实际配置映射 SAP 字段
   - 调整 OEE 阈值和告警规则
   - 根据角色定制仪表盘

4. **上线**
   - 与现有系统并行测试
   - 培训用户使用新流程
   - 逐步启用 AI 功能
      `
    },
    bestPractices: [
      'Start with a single production line before scaling',
      'Validate AI scheduling results manually for the first 2 weeks',
      'Set up monitoring for data sync latency',
      'Establish feedback loop for continuous model improvement'
    ]
  }
};
