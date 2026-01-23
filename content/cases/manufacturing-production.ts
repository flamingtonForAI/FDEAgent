/**
 * 制造业 - 生产计划管理案例
 * Manufacturing - Production Planning Case
 */

import { OntologyCase } from '../../types/case';

export const manufacturingProductionCase: OntologyCase = {
  metadata: {
    id: 'manufacturing-production',
    title: {
      en: 'Smart Production Planning',
      cn: '智能生产计划管理'
    },
    description: {
      en: 'An intelligent production planning system for discrete manufacturing, featuring AI-optimized scheduling, real-time capacity balancing, and predictive maintenance integration.',
      cn: '面向离散制造业的智能生产计划系统，具备AI优化排程、实时产能平衡和预测性维护集成功能。'
    },
    industry: 'manufacturing',
    tags: ['production', 'maintenance', 'ai-augmented', 'analytics'],
    difficulty: 'intermediate',
    estimatedTime: '45min',
    version: '1.0.0',
    createdAt: '2026-01-19',
    updatedAt: '2026-01-19'
  },

  scenario: {
    background: {
      en: 'A medium-sized electronics manufacturer produces 500+ SKUs across 3 production lines. They face challenges in balancing customer demand, equipment availability, and material constraints while minimizing changeover time and maximizing throughput.',
      cn: '一家中型电子制造商在3条生产线上生产500+个SKU。他们面临平衡客户需求、设备可用性和物料约束的挑战，同时需要最小化换线时间并最大化产出。'
    },
    challenges: {
      en: [
        'Manual scheduling takes 2+ days and often results in suboptimal plans',
        'Unexpected equipment downtime causes 15% schedule disruption',
        'Material shortages discovered too late, causing production delays',
        'Difficult to respond quickly to urgent customer orders'
      ],
      cn: [
        '人工排程需要2天以上，且常常产出次优计划',
        '意外设备停机导致15%的计划中断',
        '物料短缺发现太晚，造成生产延误',
        '难以快速响应紧急客户订单'
      ]
    },
    goals: {
      en: [
        'Reduce scheduling time from 2 days to 2 hours',
        'Achieve 95%+ schedule adherence rate',
        'Enable real-time rescheduling for urgent orders',
        'Integrate predictive maintenance to prevent unplanned downtime'
      ],
      cn: [
        '将排程时间从2天缩短到2小时',
        '实现95%以上的计划执行率',
        '支持紧急订单的实时重排',
        '集成预测性维护以防止计划外停机'
      ]
    },
    stakeholders: [
      {
        role: 'Production Planner',
        description: {
          en: 'Creates and adjusts production schedules, balances workloads across lines',
          cn: '创建和调整生产计划，平衡各产线工作量'
        }
      },
      {
        role: 'Shop Floor Supervisor',
        description: {
          en: 'Executes production orders, reports progress and issues',
          cn: '执行生产工单，汇报进度和问题'
        }
      },
      {
        role: 'Maintenance Engineer',
        description: {
          en: 'Maintains equipment, schedules preventive maintenance',
          cn: '维护设备，安排预防性维护'
        }
      },
      {
        role: 'Material Planner',
        description: {
          en: 'Ensures material availability for production',
          cn: '确保生产所需物料的可用性'
        }
      }
    ]
  },

  ontology: {
    objects: [
      {
        id: 'production-order',
        name: 'Production Order',
        nameCn: '生产工单',
        description: 'A manufacturing order to produce a specific quantity of a product',
        descriptionCn: '生产特定数量产品的制造订单',
        properties: [
          { name: 'orderId', type: 'string', description: 'Unique order identifier' },
          { name: 'productSKU', type: 'string', description: 'Product SKU to produce' },
          { name: 'quantity', type: 'number', description: 'Quantity to produce' },
          { name: 'priority', type: 'string', description: 'Order priority (normal/urgent/critical)' },
          { name: 'dueDate', type: 'datetime', description: 'Required completion date' },
          { name: 'status', type: 'string', description: 'Order status' },
          { name: 'assignedLine', type: 'string', description: 'Assigned production line' },
          { name: 'scheduledStart', type: 'datetime', description: 'Scheduled start time' },
          { name: 'scheduledEnd', type: 'datetime', description: 'Scheduled end time' },
          { name: 'actualStart', type: 'datetime', description: 'Actual start time' },
          { name: 'actualEnd', type: 'datetime', description: 'Actual end time' },
          { name: 'completedQuantity', type: 'number', description: 'Quantity completed' }
        ],
        primaryKey: 'orderId',
        actions: [
          {
            name: 'Schedule Order',
            nameCn: '排程工单',
            description: 'Assign production order to a line and time slot',
            descriptionCn: '将生产工单分配到产线和时间段',
            aiCapability: 'optimize',
            businessLayer: {
              description: 'Optimize order placement considering line capability, changeover time, and material availability',
              targetObject: 'Production Order',
              executorRole: 'Production Planner',
              triggerCondition: 'New order created or rescheduling requested'
            },
            logicLayer: {
              preconditions: [
                'Order status is "pending"',
                'Required materials are available or will be available',
                'At least one capable production line exists'
              ],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: 'Order to schedule' },
                { name: 'preferredLine', type: 'string', required: false, description: 'Preferred production line' },
                { name: 'earliestStart', type: 'date', required: false, description: 'Earliest possible start' }
              ],
              postconditions: [
                'Order status changes to "scheduled"',
                'Line capacity is reserved',
                'Material reservation is created'
              ],
              sideEffects: ['Notify shop floor supervisor', 'Update capacity dashboard']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/production-orders/{orderId}/schedule',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'schedule_production_order',
                description: 'Schedule a production order to optimal line and time slot using AI optimization',
                parameters: {
                  type: 'object',
                  properties: {
                    orderId: { type: 'string', description: 'Production order ID' },
                    preferredLine: { type: 'string', description: 'Preferred line ID' },
                    constraints: { type: 'object', description: 'Scheduling constraints' }
                  },
                  required: ['orderId']
                }
              }
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: false,
              auditLog: true,
              riskLevel: 'medium'
            }
          },
          {
            name: 'Reschedule Order',
            nameCn: '重排工单',
            description: 'Move order to different time slot or line',
            descriptionCn: '将工单移至不同时间段或产线',
            aiCapability: 'optimize',
            businessLayer: {
              description: 'Reschedule order due to priority change, equipment issue, or optimization',
              targetObject: 'Production Order',
              executorRole: 'Production Planner',
              triggerCondition: 'Priority changed or conflict detected'
            },
            logicLayer: {
              preconditions: [
                'Order status is "scheduled" or "in_progress"',
                'New slot is available'
              ],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: 'Order to reschedule' },
                { name: 'newLine', type: 'string', required: false, description: 'New production line' },
                { name: 'newStartTime', type: 'date', required: false, description: 'New start time' },
                { name: 'reason', type: 'string', required: true, description: 'Reason for rescheduling' }
              ],
              postconditions: [
                'Order schedule is updated',
                'Previous slot is released',
                'Affected orders are re-optimized'
              ],
              sideEffects: ['Notify affected parties', 'Log schedule change']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/production-orders/{orderId}/reschedule',
              apiMethod: 'PUT'
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: true,
              auditLog: true,
              riskLevel: 'medium'
            }
          },
          {
            name: 'Start Production',
            nameCn: '开始生产',
            description: 'Mark order as in progress',
            descriptionCn: '标记工单为进行中',
            businessLayer: {
              description: 'Begin production execution for the order',
              targetObject: 'Production Order',
              executorRole: 'Shop Floor Supervisor',
              triggerCondition: 'Scheduled start time reached and resources ready'
            },
            logicLayer: {
              preconditions: [
                'Order status is "scheduled"',
                'Materials are staged',
                'Equipment is ready'
              ],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: 'Order to start' },
                { name: 'operatorId', type: 'string', required: true, description: 'Operator starting production' }
              ],
              postconditions: [
                'Order status changes to "in_progress"',
                'Actual start time is recorded'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/production-orders/{orderId}/start',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 3,
              requiresHumanApproval: false,
              auditLog: true
            }
          },
          {
            name: 'Complete Production',
            nameCn: '完成生产',
            description: 'Mark order as completed',
            descriptionCn: '标记工单为已完成',
            businessLayer: {
              description: 'Finish production and record actual quantities',
              targetObject: 'Production Order',
              executorRole: 'Shop Floor Supervisor',
              triggerCondition: 'All units produced or order terminated'
            },
            logicLayer: {
              preconditions: [
                'Order status is "in_progress"'
              ],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: 'Order to complete' },
                { name: 'completedQty', type: 'number', required: true, description: 'Actual completed quantity' },
                { name: 'scrapQty', type: 'number', required: false, description: 'Scrapped quantity' }
              ],
              postconditions: [
                'Order status changes to "completed"',
                'Actual end time is recorded',
                'Inventory is updated'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/production-orders/{orderId}/complete',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 3,
              requiresHumanApproval: false,
              auditLog: true
            }
          }
        ]
      },
      {
        id: 'production-line',
        name: 'Production Line',
        nameCn: '生产线',
        description: 'A manufacturing production line with specific capabilities',
        descriptionCn: '具有特定能力的制造生产线',
        properties: [
          { name: 'lineId', type: 'string', description: 'Unique line identifier' },
          { name: 'name', type: 'string', description: 'Line name' },
          { name: 'status', type: 'string', description: 'Current status (running/idle/maintenance/down)' },
          { name: 'capabilities', type: 'array', description: 'Product types this line can produce' },
          { name: 'currentOrder', type: 'string', description: 'Currently running order ID' },
          { name: 'efficiency', type: 'number', description: 'Current efficiency percentage' },
          { name: 'nextMaintenance', type: 'datetime', description: 'Next scheduled maintenance' }
        ],
        primaryKey: 'lineId',
        actions: [
          {
            name: 'Update Line Status',
            nameCn: '更新产线状态',
            description: 'Update the operational status of the line',
            descriptionCn: '更新产线的运行状态',
            businessLayer: {
              description: 'Record line status changes for capacity planning',
              targetObject: 'Production Line',
              executorRole: 'Shop Floor Supervisor'
            },
            logicLayer: {
              preconditions: [],
              parameters: [
                { name: 'lineId', type: 'string', required: true, description: 'Line identifier' },
                { name: 'newStatus', type: 'string', required: true, description: 'New status' },
                { name: 'reason', type: 'string', required: false, description: 'Status change reason' }
              ],
              postconditions: ['Line status is updated', 'Capacity is recalculated']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/production-lines/{lineId}/status',
              apiMethod: 'PUT'
            },
            governance: {
              permissionTier: 3,
              requiresHumanApproval: false,
              auditLog: true
            }
          },
          {
            name: 'Schedule Maintenance',
            nameCn: '安排维护',
            description: 'Schedule preventive maintenance for the line',
            descriptionCn: '为产线安排预防性维护',
            aiCapability: 'predict',
            businessLayer: {
              description: 'Plan maintenance window based on production schedule and equipment health',
              targetObject: 'Production Line',
              executorRole: 'Maintenance Engineer',
              triggerCondition: 'Maintenance due or predicted failure'
            },
            logicLayer: {
              preconditions: [
                'Line is not in critical production period'
              ],
              parameters: [
                { name: 'lineId', type: 'string', required: true, description: 'Line identifier' },
                { name: 'maintenanceType', type: 'string', required: true, description: 'Type of maintenance' },
                { name: 'scheduledTime', type: 'date', required: true, description: 'Maintenance window' },
                { name: 'estimatedDuration', type: 'number', required: true, description: 'Expected duration in hours' }
              ],
              postconditions: [
                'Maintenance is scheduled',
                'Production capacity is adjusted',
                'Orders are rescheduled if needed'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/production-lines/{lineId}/maintenance',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: true,
              auditLog: true,
              riskLevel: 'medium'
            }
          }
        ]
      },
      {
        id: 'equipment',
        name: 'Equipment',
        nameCn: '设备',
        description: 'Manufacturing equipment that requires monitoring and maintenance',
        descriptionCn: '需要监控和维护的制造设备',
        properties: [
          { name: 'equipmentId', type: 'string', description: 'Unique equipment identifier' },
          { name: 'name', type: 'string', description: 'Equipment name' },
          { name: 'type', type: 'string', description: 'Equipment type' },
          { name: 'lineId', type: 'string', description: 'Associated production line' },
          { name: 'status', type: 'string', description: 'Current status' },
          { name: 'healthScore', type: 'number', description: 'AI-predicted health score (0-100)' },
          { name: 'lastMaintenance', type: 'datetime', description: 'Last maintenance date' },
          { name: 'runningHours', type: 'number', description: 'Total running hours' },
          { name: 'predictedFailure', type: 'datetime', description: 'AI-predicted failure time' }
        ],
        primaryKey: 'equipmentId',
        actions: [
          {
            name: 'Predict Failure',
            nameCn: '预测故障',
            description: 'Use AI to predict equipment failure',
            descriptionCn: '使用AI预测设备故障',
            aiCapability: 'predict',
            businessLayer: {
              description: 'Analyze sensor data to predict when equipment might fail',
              targetObject: 'Equipment',
              executorRole: 'System',
              triggerCondition: 'Scheduled analysis or anomaly detected'
            },
            logicLayer: {
              preconditions: ['Sufficient sensor data available'],
              parameters: [
                { name: 'equipmentId', type: 'string', required: true, description: 'Equipment to analyze' },
                { name: 'analysisWindow', type: 'number', required: false, description: 'Days to look ahead' }
              ],
              postconditions: [
                'Health score is updated',
                'Predicted failure time is calculated',
                'Alert is generated if failure imminent'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/equipment/{equipmentId}/predict-failure',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'predict_equipment_failure',
                description: 'Predict when equipment might fail using ML analysis of sensor data',
                parameters: {
                  type: 'object',
                  properties: {
                    equipmentId: { type: 'string' },
                    analysisWindow: { type: 'number', default: 30 }
                  },
                  required: ['equipmentId']
                }
              }
            },
            governance: {
              permissionTier: 4,
              requiresHumanApproval: false,
              auditLog: true
            }
          }
        ]
      },
      {
        id: 'material',
        name: 'Material',
        nameCn: '物料',
        description: 'Raw materials and components used in production',
        descriptionCn: '生产中使用的原材料和组件',
        properties: [
          { name: 'materialId', type: 'string', description: 'Material identifier' },
          { name: 'name', type: 'string', description: 'Material name' },
          { name: 'currentStock', type: 'number', description: 'Current stock quantity' },
          { name: 'reservedStock', type: 'number', description: 'Reserved for orders' },
          { name: 'availableStock', type: 'number', description: 'Available for new orders' },
          { name: 'reorderPoint', type: 'number', description: 'Minimum stock level' },
          { name: 'leadTime', type: 'number', description: 'Procurement lead time in days' }
        ],
        primaryKey: 'materialId',
        actions: [
          {
            name: 'Check Availability',
            nameCn: '检查可用性',
            description: 'Check if material is available for production',
            descriptionCn: '检查物料是否可用于生产',
            businessLayer: {
              description: 'Verify material availability for order scheduling',
              targetObject: 'Material',
              executorRole: 'Material Planner'
            },
            logicLayer: {
              preconditions: [],
              parameters: [
                { name: 'materialId', type: 'string', required: true, description: 'Material to check' },
                { name: 'requiredQty', type: 'number', required: true, description: 'Required quantity' },
                { name: 'requiredDate', type: 'date', required: true, description: 'When needed' }
              ],
              postconditions: ['Availability status returned']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/materials/{materialId}/availability',
              apiMethod: 'GET'
            },
            governance: {
              permissionTier: 4,
              requiresHumanApproval: false,
              auditLog: false
            }
          },
          {
            name: 'Reserve Material',
            nameCn: '预留物料',
            description: 'Reserve material for a production order',
            descriptionCn: '为生产工单预留物料',
            businessLayer: {
              description: 'Lock material allocation for scheduled orders',
              targetObject: 'Material',
              executorRole: 'System',
              triggerCondition: 'Order scheduled'
            },
            logicLayer: {
              preconditions: ['Sufficient available stock'],
              parameters: [
                { name: 'materialId', type: 'string', required: true, description: 'Material to reserve' },
                { name: 'quantity', type: 'number', required: true, description: 'Quantity to reserve' },
                { name: 'orderId', type: 'string', required: true, description: 'Associated order' }
              ],
              postconditions: [
                'Reserved stock is increased',
                'Available stock is decreased'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/materials/{materialId}/reserve',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 3,
              requiresHumanApproval: false,
              auditLog: true
            }
          }
        ]
      }
    ],
    links: [
      {
        id: 'order-line',
        name: 'Scheduled On',
        nameCn: '排程于',
        sourceObject: 'production-order',
        targetObject: 'production-line',
        cardinality: 'many-to-one',
        description: 'Production orders are scheduled on production lines'
      },
      {
        id: 'line-equipment',
        name: 'Contains',
        nameCn: '包含',
        sourceObject: 'production-line',
        targetObject: 'equipment',
        cardinality: 'one-to-many',
        description: 'Production lines contain multiple equipment'
      },
      {
        id: 'order-material',
        name: 'Requires',
        nameCn: '需要',
        sourceObject: 'production-order',
        targetObject: 'material',
        cardinality: 'many-to-many',
        description: 'Production orders require materials'
      }
    ],
    integrations: [
      {
        id: 'erp-integration',
        name: 'ERP System',
        nameCn: 'ERP系统',
        type: 'bidirectional',
        sourceSystem: 'SAP ERP',
        frequency: 'real-time',
        syncedObjects: ['production-order', 'material'],
        description: 'Sync orders and material data with ERP'
      },
      {
        id: 'mes-integration',
        name: 'MES System',
        nameCn: 'MES系统',
        type: 'bidirectional',
        sourceSystem: 'Shop Floor MES',
        frequency: 'real-time',
        syncedObjects: ['production-line', 'equipment'],
        description: 'Real-time production execution data'
      },
      {
        id: 'iot-integration',
        name: 'IoT Platform',
        nameCn: 'IoT平台',
        type: 'inbound',
        sourceSystem: 'Equipment Sensors',
        frequency: 'streaming',
        syncedObjects: ['equipment'],
        description: 'Equipment sensor data for predictive maintenance'
      }
    ]
  },

  highlights: [
    {
      title: {
        en: 'AI-Optimized Scheduling',
        cn: 'AI优化排程'
      },
      description: {
        en: 'The Schedule Order action uses AI to find optimal production slots considering multiple constraints: line capability, changeover time, material availability, and order priority.',
        cn: 'Schedule Order动作使用AI在多个约束条件下找到最优生产时段：产线能力、换线时间、物料可用性和订单优先级。'
      },
      relatedElements: ['production-order', 'Schedule Order']
    },
    {
      title: {
        en: 'Predictive Maintenance Integration',
        cn: '预测性维护集成'
      },
      description: {
        en: 'Equipment health is continuously monitored using IoT sensor data. AI predicts potential failures, allowing maintenance to be scheduled during low-impact windows.',
        cn: '使用IoT传感器数据持续监控设备健康状态。AI预测潜在故障，允许在低影响窗口期安排维护。'
      },
      relatedElements: ['equipment', 'Predict Failure', 'Schedule Maintenance']
    },
    {
      title: {
        en: 'Material Availability Chain',
        cn: '物料可用性链'
      },
      description: {
        en: 'The system automatically checks and reserves materials when orders are scheduled, preventing material shortages from disrupting production.',
        cn: '系统在工单排程时自动检查和预留物料，防止物料短缺中断生产。'
      },
      relatedElements: ['material', 'Check Availability', 'Reserve Material']
    }
  ],

  learningPoints: [
    {
      concept: {
        en: 'Decision-First Action Design',
        cn: 'Decision-First动作设计'
      },
      explanation: {
        en: 'The "Schedule Order" action is designed around the decision point - where should this order be produced and when? This is fundamentally a decision, not just a data update.',
        cn: '"Schedule Order"动作围绕决策点设计 - 这个工单应该在哪里生产、什么时候生产？这本质上是一个决策，而不仅仅是数据更新。'
      }
    },
    {
      concept: {
        en: 'AI Capability Alignment',
        cn: 'AI能力对齐'
      },
      explanation: {
        en: 'Actions are tagged with appropriate AI capabilities: "optimize" for scheduling decisions, "predict" for failure forecasting. This enables proper AI model selection.',
        cn: '动作被标记了适当的AI能力："optimize"用于排程决策，"predict"用于故障预测。这使得AI模型选择更加准确。'
      }
    },
    {
      concept: {
        en: 'Governance Tiering',
        cn: '治理分层'
      },
      explanation: {
        en: 'Actions have different permission tiers: scheduling (Tier 2) requires more authorization than status updates (Tier 3), reflecting business risk levels.',
        cn: '动作有不同的权限等级：排程(Tier 2)比状态更新(Tier 3)需要更多授权，反映了业务风险级别。'
      }
    },
    {
      concept: {
        en: 'Precondition and Postcondition Design',
        cn: '前置条件和后置状态设计'
      },
      explanation: {
        en: 'Each action clearly defines what must be true before execution (preconditions) and what will be true after (postconditions). This enables validation and workflow automation.',
        cn: '每个动作清楚地定义了执行前必须为真的条件（前置条件）和执行后将为真的状态（后置状态）。这支持了验证和工作流自动化。'
      }
    }
  ],

  relatedCases: ['retail-inventory', 'logistics-delivery']
};

export default manufacturingProductionCase;
