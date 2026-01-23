/**
 * 制造业运营管理 Archetype (基于 ISA-95 标准)
 * Manufacturing Operations Management Archetype (ISA-95 Based)
 *
 * 遵循 ISA-95 (IEC/ISO 62264) 国际标准的制造业运营管理原型
 * 覆盖 MOM 四大领域：生产运营、质量运营、库存运营、维护运营
 *
 * 参考来源：
 * - ISA-95 Enterprise-Control System Integration Standard
 * - OPC Foundation ISA-95 Common Object Model
 * - Palantir Foundry Manufacturing Best Practices
 *
 * 适用行业：离散制造、流程制造、混合制造
 * 部署周期：2-4 周（含数据对接和配置）
 */

import { Archetype } from '../../types/archetype';

export const manufacturingISA95Archetype: Archetype = {
  metadata: {
    id: 'manufacturing-isa95-mom',
    name: 'Manufacturing Operations Management (ISA-95)',
    description: {
      en: 'Comprehensive manufacturing operations management based on ISA-95 standard, covering Production, Quality, Inventory, and Maintenance operations with unified resource models for Personnel, Equipment, Material, and Physical Assets.',
      cn: '基于 ISA-95 国际标准的全面制造运营管理方案，覆盖生产、质量、库存、维护四大运营领域，统一人员、设备、物料、资产四大资源模型。'
    },
    industry: 'manufacturing',
    domain: 'manufacturing-operations-management',
    version: '3.0.0',
    changelog: [
      {
        version: '3.0.0',
        date: '2026-01-23',
        changes: [
          'Full ISA-95 alignment with 4 MOM domains',
          'Added Physical Asset model distinct from Equipment',
          'Enhanced Quality Operations with SPC support',
          'Added Genealogy/Traceability support'
        ]
      }
    ],
    origin: {
      sourceEngagement: 'Multiple Fortune 500 Manufacturers',
      fdeContributors: ['ISA-95 Working Group', 'Manufacturing Excellence Team'],
      abstractionDate: '2025-12-01'
    },
    usage: {
      deployments: 45,
      industries: ['Automotive', 'Aerospace', 'Electronics', 'Pharmaceutical', 'Food & Beverage', 'Chemical'],
      avgDeploymentTime: '3 weeks'
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  //                    SEMANTIC LAYER - 语义层
  //           基于 ISA-95 的业务概念模型（资源 + 运营）
  // ═══════════════════════════════════════════════════════════════════
  ontology: {
    objects: [
      // ============= 资源模型 (ISA-95 Resource Models) =============

      // --- 人员模型 Personnel Model ---
      {
        id: 'personnel-class',
        name: 'Personnel Class',
        nameCn: '人员类别',
        description: 'A grouping of persons with similar skills, training, and certifications (e.g., Operator, Technician, Engineer)',
        descriptionCn: '具有相似技能、培训和认证的人员分组（如操作员、技术员、工程师）',
        properties: [
          { name: 'classId', type: 'string', description: 'Unique class identifier' },
          { name: 'className', type: 'string', description: 'Class name (e.g., CNC Operator, Quality Inspector)' },
          { name: 'description', type: 'string', description: 'Class description' },
          { name: 'requiredCertifications', type: 'array', description: 'Required certifications for this class' },
          { name: 'requiredTrainings', type: 'array', description: 'Required training courses' },
          { name: 'capabilities', type: 'array', description: 'Capabilities this class can perform' },
          { name: 'hierarchyLevel', type: 'string', description: 'Enterprise/Site/Area/WorkCenter/WorkUnit' }
        ],
        primaryKey: 'classId',
        actions: []
      },
      {
        id: 'person',
        name: 'Person',
        nameCn: '人员',
        description: 'An individual employee with specific qualifications and assigned roles',
        descriptionCn: '具有特定资质和分配角色的员工个人',
        properties: [
          { name: 'personId', type: 'string', description: 'Unique person identifier (employee ID)' },
          { name: 'name', type: 'string', description: 'Full name' },
          { name: 'personnelClasses', type: 'array', description: 'Assigned personnel classes/roles' },
          { name: 'certifications', type: 'array', description: 'Current certifications with expiry dates' },
          { name: 'trainings', type: 'array', description: 'Completed training records' },
          { name: 'availability', type: 'string', description: 'Current availability status' },
          { name: 'shift', type: 'string', description: 'Assigned shift' },
          { name: 'workCenter', type: 'string', description: 'Primary work center assignment' },
          { name: 'skills', type: 'array', description: 'Skill matrix with proficiency levels' },
          // AI-derived
          {
            name: 'predictedAbsence',
            type: 'number',
            description: 'Predicted absence probability for next week',
            isAIDerived: true,
            logicDescription: 'ML model based on historical patterns, calendar, and external factors'
          },
          {
            name: 'recommendedTraining',
            type: 'array',
            description: 'AI-recommended training based on skill gaps and upcoming assignments',
            isAIDerived: true
          }
        ],
        primaryKey: 'personId',
        actions: [
          {
            name: 'Assign to Work Order',
            nameCn: '分配到工单',
            type: 'traditional',
            description: 'Assign person to a work order based on required skills',
            descriptionCn: '根据所需技能将人员分配到工单',
            businessLayer: {
              description: '基于技能匹配和可用性分配人员',
              targetObject: 'Person',
              executorRole: 'Supervisor',
              triggerCondition: '工单需要人员分配'
            },
            logicLayer: {
              preconditions: ['人员可用', '具备所需技能和资质'],
              parameters: [
                { name: 'personId', type: 'string', required: true, description: '人员ID' },
                { name: 'workOrderId', type: 'string', required: true, description: '工单ID' },
                { name: 'role', type: 'string', required: true, description: '分配角色' }
              ],
              postconditions: ['人员状态更新为已分配', '工单人员需求已满足'],
              sideEffects: ['发送通知给人员', '更新排班表']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/persons/{personId}/assign',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'assign_person_to_work_order',
                description: 'Assign a person to work on a specific work order',
                parameters: {
                  type: 'object',
                  properties: {
                    personId: { type: 'string' },
                    workOrderId: { type: 'string' },
                    role: { type: 'string' }
                  },
                  required: ['personId', 'workOrderId', 'role']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Absence prediction and training recommendations' }
        ]
      },

      // --- 设备模型 Equipment Model ---
      {
        id: 'equipment-class',
        name: 'Equipment Class',
        nameCn: '设备类别',
        description: 'A grouping of equipment with similar capabilities (e.g., CNC Machine, Assembly Robot, Packaging Line)',
        descriptionCn: '具有相似能力的设备分组（如数控机床、装配机器人、包装线）',
        properties: [
          { name: 'classId', type: 'string', description: 'Unique class identifier' },
          { name: 'className', type: 'string', description: 'Class name' },
          { name: 'description', type: 'string', description: 'Class description' },
          { name: 'capabilities', type: 'array', description: 'Processing capabilities' },
          { name: 'standardCycleTime', type: 'number', description: 'Standard cycle time (seconds)' },
          { name: 'requiredMaintenanceTypes', type: 'array', description: 'Required maintenance types' }
        ],
        primaryKey: 'classId',
        actions: []
      },
      {
        id: 'equipment',
        name: 'Equipment',
        nameCn: '设备',
        description: 'A specific piece of production equipment that performs manufacturing operations',
        descriptionCn: '执行制造操作的具体生产设备',
        properties: [
          { name: 'equipmentId', type: 'string', description: 'Unique equipment identifier' },
          { name: 'equipmentName', type: 'string', description: 'Equipment name' },
          { name: 'equipmentClass', type: 'string', description: 'Equipment class reference' },
          { name: 'hierarchyLevel', type: 'string', description: 'Site/Area/WorkCenter/WorkUnit' },
          { name: 'parentEquipment', type: 'string', description: 'Parent equipment (for nested equipment)' },
          { name: 'location', type: 'string', description: 'Physical location' },
          { name: 'status', type: 'string', description: 'Operational status (Running/Idle/Down/Maintenance)' },
          { name: 'currentMode', type: 'string', description: 'Production/Manual/Maintenance/Cleaning' },
          { name: 'capabilities', type: 'array', description: 'Specific capabilities' },
          { name: 'currentOEE', type: 'number', description: 'Current OEE percentage' },
          { name: 'availability', type: 'number', description: 'Availability component of OEE' },
          { name: 'performance', type: 'number', description: 'Performance component of OEE' },
          { name: 'quality', type: 'number', description: 'Quality component of OEE' },
          { name: 'mtbf', type: 'number', description: 'Mean Time Between Failures (hours)' },
          { name: 'mttr', type: 'number', description: 'Mean Time To Repair (hours)' },
          { name: 'runningHours', type: 'number', description: 'Total running hours' },
          { name: 'cycleCount', type: 'number', description: 'Total cycle count' },
          // AI-derived
          {
            name: 'healthScore',
            type: 'number',
            description: 'AI-calculated equipment health score (0-100)',
            isAIDerived: true,
            logicDescription: 'Composite score from sensor data, maintenance history, and usage patterns'
          },
          {
            name: 'failureProbability7d',
            type: 'number',
            description: 'Probability of failure in next 7 days',
            isAIDerived: true,
            logicDescription: 'Predictive maintenance ML model (XGBoost/LSTM)'
          },
          {
            name: 'recommendedMaintenanceDate',
            type: 'datetime',
            description: 'AI-recommended optimal maintenance date',
            isAIDerived: true,
            logicDescription: 'Optimization balancing failure risk and production schedule'
          }
        ],
        primaryKey: 'equipmentId',
        actions: [
          {
            name: 'Change Status',
            nameCn: '变更状态',
            type: 'traditional',
            description: 'Change equipment operational status',
            descriptionCn: '变更设备运行状态',
            businessLayer: {
              description: '记录设备状态变更（运行、停机、维护等）',
              targetObject: 'Equipment',
              executorRole: 'Operator',
              triggerCondition: '设备状态发生变化'
            },
            logicLayer: {
              preconditions: ['操作员有权限'],
              parameters: [
                { name: 'equipmentId', type: 'string', required: true, description: '设备ID' },
                { name: 'newStatus', type: 'string', required: true, description: '新状态' },
                { name: 'reason', type: 'string', required: true, description: '原因代码' },
                { name: 'comments', type: 'string', required: false, description: '备注' }
              ],
              postconditions: ['设备状态更新', '状态变更记录生成'],
              sideEffects: ['更新OEE计算', '触发告警（如适用）']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/equipment/{equipmentId}/status',
              apiMethod: 'PUT',
              agentToolSpec: {
                name: 'change_equipment_status',
                description: 'Change the operational status of equipment',
                parameters: {
                  type: 'object',
                  properties: {
                    equipmentId: { type: 'string' },
                    newStatus: { type: 'string', enum: ['Running', 'Idle', 'Down', 'Maintenance', 'Cleaning'] },
                    reason: { type: 'string' },
                    comments: { type: 'string' }
                  },
                  required: ['equipmentId', 'newStatus', 'reason']
                }
              }
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Request Maintenance',
            nameCn: '请求维护',
            type: 'traditional',
            description: 'Submit maintenance request for equipment',
            descriptionCn: '提交设备维护请求',
            businessLayer: {
              description: '操作员或系统发起设备维护请求',
              targetObject: 'Equipment',
              executorRole: 'Operator',
              triggerCondition: '发现设备问题或预测性维护触发'
            },
            logicLayer: {
              preconditions: [],
              parameters: [
                { name: 'equipmentId', type: 'string', required: true, description: '设备ID' },
                { name: 'maintenanceType', type: 'string', required: true, description: '维护类型（预防/纠正/紧急）' },
                { name: 'priority', type: 'string', required: true, description: '优先级' },
                { name: 'description', type: 'string', required: true, description: '问题描述' }
              ],
              postconditions: ['维护工单创建'],
              sideEffects: ['通知维护团队', '更新设备状态']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/equipment/{equipmentId}/maintenance-request',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Health score and failure probability prediction' },
          { type: 'Smart Property', description: 'Optimal maintenance date recommendation' }
        ]
      },

      // --- 物料模型 Material Model ---
      {
        id: 'material-definition',
        name: 'Material Definition',
        nameCn: '物料定义',
        description: 'Definition of a type of material that may be produced, consumed, or stored (SKU/Part Number)',
        descriptionCn: '可能被生产、消耗或存储的物料类型定义（SKU/物料号）',
        properties: [
          { name: 'materialId', type: 'string', description: 'Material identifier (SKU/Part Number)' },
          { name: 'materialName', type: 'string', description: 'Material name' },
          { name: 'materialClass', type: 'string', description: 'Material class (Raw/WIP/Finished/Packaging)' },
          { name: 'description', type: 'string', description: 'Material description' },
          { name: 'unitOfMeasure', type: 'string', description: 'Base unit of measure' },
          { name: 'specifications', type: 'array', description: 'Quality specifications' },
          { name: 'shelfLife', type: 'number', description: 'Shelf life in days' },
          { name: 'storageRequirements', type: 'object', description: 'Storage requirements (temp, humidity)' },
          { name: 'hazardClass', type: 'string', description: 'Hazard classification if applicable' },
          { name: 'bom', type: 'array', description: 'Bill of Materials (for produced items)' },
          { name: 'routings', type: 'array', description: 'Manufacturing routings' },
          { name: 'alternativeMaterials', type: 'array', description: 'Allowed substitutes' },
          { name: 'suppliers', type: 'array', description: 'Approved suppliers' }
        ],
        primaryKey: 'materialId',
        actions: []
      },
      {
        id: 'material-lot',
        name: 'Material Lot',
        nameCn: '物料批次',
        description: 'A uniquely identifiable amount of material (batch/lot with traceability)',
        descriptionCn: '可唯一标识的物料数量（具有追溯性的批次）',
        properties: [
          { name: 'lotId', type: 'string', description: 'Unique lot identifier' },
          { name: 'materialId', type: 'string', description: 'Material definition reference' },
          { name: 'quantity', type: 'number', description: 'Current quantity' },
          { name: 'unitOfMeasure', type: 'string', description: 'Unit of measure' },
          { name: 'status', type: 'string', description: 'Status (Available/QA Hold/Quarantine/Consumed/Scrapped)' },
          { name: 'location', type: 'string', description: 'Current storage location' },
          { name: 'receiptDate', type: 'datetime', description: 'Date received' },
          { name: 'expirationDate', type: 'datetime', description: 'Expiration date' },
          { name: 'supplierLotNumber', type: 'string', description: 'Supplier lot number' },
          { name: 'supplierId', type: 'string', description: 'Supplier identifier' },
          { name: 'qualityStatus', type: 'string', description: 'Quality status (Pending/Approved/Rejected)' },
          { name: 'parentLots', type: 'array', description: 'Source lots (for produced materials)' },
          { name: 'childLots', type: 'array', description: 'Derived lots (sublots or produced items)' },
          { name: 'productionWorkOrders', type: 'array', description: 'Work orders that produced or consumed this lot' },
          { name: 'testResults', type: 'array', description: 'Quality test results' },
          // AI-derived
          {
            name: 'shelfLifeRemaining',
            type: 'number',
            description: 'Days until expiration',
            isAIDerived: false
          },
          {
            name: 'recommendedUsage',
            type: 'string',
            description: 'AI recommendation for usage priority (FIFO optimization)',
            isAIDerived: true,
            logicDescription: 'FIFO + expiration + quality grade optimization'
          }
        ],
        primaryKey: 'lotId',
        actions: [
          {
            name: 'Transfer',
            nameCn: '转移',
            type: 'traditional',
            description: 'Transfer material lot to a new location',
            descriptionCn: '将物料批次转移到新位置',
            businessLayer: {
              description: '在库位之间转移物料批次',
              targetObject: 'Material Lot',
              executorRole: 'Warehouse Operator',
              triggerCondition: '物料需要移动'
            },
            logicLayer: {
              preconditions: ['物料状态为可用', '目标库位有空间'],
              parameters: [
                { name: 'lotId', type: 'string', required: true, description: '批次ID' },
                { name: 'targetLocation', type: 'string', required: true, description: '目标库位' },
                { name: 'quantity', type: 'number', required: false, description: '转移数量（默认全部）' }
              ],
              postconditions: ['物料位置更新', '如部分转移则创建新批次'],
              sideEffects: ['更新库存记录', '生成转移记录']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/material-lots/{lotId}/transfer',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Hold',
            nameCn: '冻结',
            type: 'traditional',
            description: 'Place material lot on hold',
            descriptionCn: '冻结物料批次',
            businessLayer: {
              description: '因质量或其他原因冻结物料批次',
              targetObject: 'Material Lot',
              executorRole: 'Quality Inspector',
              triggerCondition: '发现质量问题或需要调查'
            },
            logicLayer: {
              preconditions: ['物料未被消耗'],
              parameters: [
                { name: 'lotId', type: 'string', required: true, description: '批次ID' },
                { name: 'holdReason', type: 'string', required: true, description: '冻结原因' },
                { name: 'holdType', type: 'string', required: true, description: 'QA Hold/Quarantine/Investigation' }
              ],
              postconditions: ['物料状态变为冻结'],
              sideEffects: ['通知质量团队', '阻止物料被使用']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/material-lots/{lotId}/hold',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          },
          {
            name: 'Release',
            nameCn: '解冻',
            type: 'traditional',
            description: 'Release material lot from hold',
            descriptionCn: '解冻物料批次',
            businessLayer: {
              description: '经审核后解除物料批次冻结',
              targetObject: 'Material Lot',
              executorRole: 'Quality Supervisor',
              triggerCondition: '调查完成，物料可以使用'
            },
            logicLayer: {
              preconditions: ['物料状态为冻结', '有解冻权限'],
              parameters: [
                { name: 'lotId', type: 'string', required: true, description: '批次ID' },
                { name: 'releaseReason', type: 'string', required: true, description: '解冻原因' },
                { name: 'qualityDecision', type: 'string', required: true, description: 'Approved/Rework/Scrap' }
              ],
              postconditions: ['物料状态更新'],
              sideEffects: ['记录解冻决定']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/material-lots/{lotId}/release',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Usage priority recommendation based on FIFO and quality' }
        ]
      },

      // --- 物理资产模型 Physical Asset Model ---
      {
        id: 'physical-asset',
        name: 'Physical Asset',
        nameCn: '物理资产',
        description: 'A physical piece of equipment or facility tracked for financial and maintenance purposes (distinct from Equipment which tracks operational capability)',
        descriptionCn: '用于财务和维护跟踪的物理设备或设施（区别于跟踪运营能力的设备）',
        properties: [
          { name: 'assetId', type: 'string', description: 'Asset tag / serial number' },
          { name: 'assetName', type: 'string', description: 'Asset name' },
          { name: 'assetClass', type: 'string', description: 'Asset classification' },
          { name: 'equipmentId', type: 'string', description: 'Linked equipment (if operational)' },
          { name: 'manufacturer', type: 'string', description: 'Manufacturer' },
          { name: 'model', type: 'string', description: 'Model number' },
          { name: 'serialNumber', type: 'string', description: 'Serial number' },
          { name: 'purchaseDate', type: 'datetime', description: 'Purchase date' },
          { name: 'purchasePrice', type: 'number', description: 'Original purchase price' },
          { name: 'currentValue', type: 'number', description: 'Current book value' },
          { name: 'warrantyExpiration', type: 'datetime', description: 'Warranty expiration date' },
          { name: 'location', type: 'string', description: 'Physical location' },
          { name: 'parentAsset', type: 'string', description: 'Parent asset (for nested assets)' },
          { name: 'childAssets', type: 'array', description: 'Child assets' },
          { name: 'maintenanceSchedule', type: 'array', description: 'Scheduled maintenance items' },
          { name: 'totalMaintenanceCost', type: 'number', description: 'Lifetime maintenance cost' }
        ],
        primaryKey: 'assetId',
        actions: []
      },

      // ============= 生产运营模型 (Production Operations) =============

      {
        id: 'operations-definition',
        name: 'Operations Definition',
        nameCn: '工艺定义',
        description: 'Definition of operations (routing) to produce a material, including process segments and resource requirements',
        descriptionCn: '生产物料的工艺定义，包括工序段和资源需求',
        properties: [
          { name: 'definitionId', type: 'string', description: 'Operations definition ID' },
          { name: 'version', type: 'string', description: 'Version number' },
          { name: 'status', type: 'string', description: 'Draft/Active/Obsolete' },
          { name: 'producedMaterial', type: 'string', description: 'Material being produced' },
          { name: 'description', type: 'string', description: 'Process description' },
          { name: 'segments', type: 'array', description: 'Process segments in sequence' },
          { name: 'standardBatchSize', type: 'number', description: 'Standard batch size' },
          { name: 'standardCycleTime', type: 'number', description: 'Standard cycle time' },
          { name: 'qualitySpecs', type: 'array', description: 'Quality specifications' },
          { name: 'validFrom', type: 'datetime', description: 'Effective from date' },
          { name: 'validTo', type: 'datetime', description: 'Effective to date' }
        ],
        primaryKey: 'definitionId',
        actions: []
      },
      {
        id: 'work-order',
        name: 'Work Order',
        nameCn: '生产工单',
        description: 'A request to produce a specific quantity of material following an operations definition',
        descriptionCn: '按照工艺定义生产特定数量物料的请求',
        properties: [
          { name: 'workOrderId', type: 'string', description: 'Work order number' },
          { name: 'workOrderType', type: 'string', description: 'Production/Rework/Trial' },
          { name: 'status', type: 'string', description: 'Created/Scheduled/Released/InProgress/Completed/Closed' },
          { name: 'materialId', type: 'string', description: 'Material to produce' },
          { name: 'operationsDefinition', type: 'string', description: 'Operations definition to follow' },
          { name: 'plannedQuantity', type: 'number', description: 'Planned production quantity' },
          { name: 'completedQuantity', type: 'number', description: 'Completed good quantity' },
          { name: 'scrapQuantity', type: 'number', description: 'Scrapped quantity' },
          { name: 'reworkQuantity', type: 'number', description: 'Rework quantity' },
          { name: 'priority', type: 'string', description: 'Priority (P1-P4)' },
          { name: 'plannedStart', type: 'datetime', description: 'Planned start date/time' },
          { name: 'plannedEnd', type: 'datetime', description: 'Planned end date/time' },
          { name: 'actualStart', type: 'datetime', description: 'Actual start date/time' },
          { name: 'actualEnd', type: 'datetime', description: 'Actual end date/time' },
          { name: 'dueDate', type: 'datetime', description: 'Customer due date' },
          { name: 'salesOrder', type: 'string', description: 'Linked sales order' },
          { name: 'customerOrder', type: 'string', description: 'Customer order reference' },
          { name: 'assignedEquipment', type: 'array', description: 'Assigned equipment' },
          { name: 'assignedPersonnel', type: 'array', description: 'Assigned personnel' },
          { name: 'materialConsumption', type: 'array', description: 'Consumed material lots' },
          { name: 'producedLots', type: 'array', description: 'Produced material lots' },
          { name: 'currentSegment', type: 'string', description: 'Current process segment' },
          { name: 'yieldPercentage', type: 'number', description: 'Current yield percentage' },
          // AI-derived
          {
            name: 'onTimeDeliveryRisk',
            type: 'number',
            description: 'Risk of missing due date (0-1)',
            isAIDerived: true,
            logicDescription: 'ML model considering progress, remaining work, equipment availability, historical performance'
          },
          {
            name: 'predictedCompletionTime',
            type: 'datetime',
            description: 'AI-predicted completion time',
            isAIDerived: true,
            logicDescription: 'Time series prediction based on current progress rate'
          },
          {
            name: 'bottleneckSegment',
            type: 'string',
            description: 'Identified bottleneck segment',
            isAIDerived: true,
            logicDescription: 'Analysis of segment durations vs. standard times'
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
            aiLogic: 'Multi-objective optimization: minimize (weighted) total tardiness, changeover time, WIP, and balance workload. Constraints: capacity, material availability, personnel availability, maintenance windows, sequence-dependent setup times.',
            businessLayer: {
              description: '使用AI算法为工单找到最优排程方案',
              targetObject: 'Work Order',
              executorRole: 'Production Planner',
              triggerCondition: '新工单创建或需要重排'
            },
            logicLayer: {
              preconditions: ['工单状态为Created', '物料可用或有预计到货'],
              parameters: [
                { name: 'workOrderIds', type: 'array', required: true, description: '待排程工单ID列表' },
                { name: 'horizon', type: 'number', required: false, description: '排程时间范围(天)' },
                { name: 'objective', type: 'string', required: false, description: 'on-time/throughput/cost/balanced' },
                { name: 'constraints', type: 'object', required: false, description: '额外约束条件' }
              ],
              postconditions: ['工单获得排程时间和资源分配', '产能被预留'],
              sideEffects: ['更新产能视图', '触发物料齐套检查', '通知相关人员']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/work-orders/ai-schedule',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'ai_schedule_work_orders',
                description: 'Use AI to optimally schedule work orders across production resources',
                parameters: {
                  type: 'object',
                  properties: {
                    workOrderIds: { type: 'array', items: { type: 'string' } },
                    horizon: { type: 'number', default: 14 },
                    objective: { type: 'string', enum: ['on-time', 'throughput', 'cost', 'balanced'] }
                  },
                  required: ['workOrderIds']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: true, auditLog: true, riskLevel: 'medium' }
          },
          {
            name: 'Release',
            nameCn: '下发',
            type: 'traditional',
            description: 'Release work order to shop floor',
            descriptionCn: '将工单下发到车间',
            businessLayer: {
              description: '确认排程后下发工单到车间执行',
              targetObject: 'Work Order',
              executorRole: 'Production Planner',
              triggerCondition: '排程已确认且物料齐套'
            },
            logicLayer: {
              preconditions: ['工单状态为Scheduled', '物料齐套率>=95%', '设备可用'],
              parameters: [
                { name: 'workOrderId', type: 'string', required: true, description: '工单ID' }
              ],
              postconditions: ['工单状态变为Released'],
              sideEffects: ['同步到MES', '发送通知到车间终端', '锁定物料']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/work-orders/{workOrderId}/release',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'release_work_order',
                description: 'Release a scheduled work order to the shop floor for execution',
                parameters: {
                  type: 'object',
                  properties: { workOrderId: { type: 'string' } },
                  required: ['workOrderId']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Start',
            nameCn: '开工',
            type: 'traditional',
            description: 'Start work order execution',
            descriptionCn: '开始执行工单',
            businessLayer: {
              description: '车间开始执行工单',
              targetObject: 'Work Order',
              executorRole: 'Operator',
              triggerCondition: '操作员准备就绪'
            },
            logicLayer: {
              preconditions: ['工单状态为Released', '设备准备就绪'],
              parameters: [
                { name: 'workOrderId', type: 'string', required: true, description: '工单ID' },
                { name: 'equipmentId', type: 'string', required: true, description: '使用的设备' },
                { name: 'operatorId', type: 'string', required: true, description: '操作员ID' }
              ],
              postconditions: ['工单状态变为InProgress', '记录实际开始时间'],
              sideEffects: ['更新设备状态', '开始OEE计时']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/work-orders/{workOrderId}/start',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Report Progress',
            nameCn: '报工',
            type: 'traditional',
            description: 'Report production progress',
            descriptionCn: '汇报生产进度',
            businessLayer: {
              description: '操作员汇报完成数量和消耗',
              targetObject: 'Work Order',
              executorRole: 'Operator',
              triggerCondition: '完成一批生产或工序'
            },
            logicLayer: {
              preconditions: ['工单状态为InProgress'],
              parameters: [
                { name: 'workOrderId', type: 'string', required: true, description: '工单ID' },
                { name: 'segmentId', type: 'string', required: true, description: '工序ID' },
                { name: 'goodQuantity', type: 'number', required: true, description: '合格数量' },
                { name: 'scrapQuantity', type: 'number', required: false, description: '报废数量' },
                { name: 'reworkQuantity', type: 'number', required: false, description: '返工数量' },
                { name: 'consumedMaterials', type: 'array', required: false, description: '消耗的物料批次' }
              ],
              postconditions: ['更新完成数量', '如全部完成则状态变为Completed'],
              sideEffects: ['更新实时看板', '更新物料库存', '触发质检（如需要）']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/work-orders/{workOrderId}/progress',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'report_work_order_progress',
                description: 'Report production progress for a work order segment',
                parameters: {
                  type: 'object',
                  properties: {
                    workOrderId: { type: 'string' },
                    segmentId: { type: 'string' },
                    goodQuantity: { type: 'number' },
                    scrapQuantity: { type: 'number' },
                    reworkQuantity: { type: 'number' }
                  },
                  required: ['workOrderId', 'segmentId', 'goodQuantity']
                }
              }
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Complete',
            nameCn: '完工',
            type: 'traditional',
            description: 'Complete work order',
            descriptionCn: '完成工单',
            businessLayer: {
              description: '标记工单完成',
              targetObject: 'Work Order',
              executorRole: 'Operator',
              triggerCondition: '所有数量已完成'
            },
            logicLayer: {
              preconditions: ['工单状态为InProgress'],
              parameters: [
                { name: 'workOrderId', type: 'string', required: true, description: '工单ID' },
                { name: 'producedLotId', type: 'string', required: true, description: '生产的物料批次ID' }
              ],
              postconditions: ['工单状态变为Completed', '记录实际完成时间'],
              sideEffects: ['释放设备', '更新库存', '触发最终质检']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/work-orders/{workOrderId}/complete',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'On-time delivery risk prediction' },
          { type: 'Smart Property', description: 'Completion time prediction' },
          { type: 'Smart Property', description: 'Bottleneck identification' },
          { type: 'Generative Action', description: 'AI-optimized scheduling' }
        ]
      },

      // ============= 质量运营模型 (Quality Operations) =============

      {
        id: 'quality-test-definition',
        name: 'Quality Test Definition',
        nameCn: '质量检验定义',
        description: 'Definition of a quality test including test method, specifications, and equipment',
        descriptionCn: '质量检验定义，包括检测方法、规格和设备',
        properties: [
          { name: 'testDefinitionId', type: 'string', description: 'Test definition ID' },
          { name: 'testName', type: 'string', description: 'Test name' },
          { name: 'testType', type: 'string', description: 'Incoming/In-Process/Final/Periodic' },
          { name: 'testMethod', type: 'string', description: 'Test method reference' },
          { name: 'measuredProperty', type: 'string', description: 'Property being measured' },
          { name: 'specification', type: 'object', description: 'Target, LSL, USL, tolerance' },
          { name: 'sampleSize', type: 'number', description: 'Required sample size' },
          { name: 'samplingPlan', type: 'string', description: 'Sampling plan code' },
          { name: 'frequency', type: 'string', description: 'Test frequency' },
          { name: 'requiredEquipment', type: 'array', description: 'Required test equipment' },
          { name: 'requiredCertifications', type: 'array', description: 'Required inspector certifications' }
        ],
        primaryKey: 'testDefinitionId',
        actions: []
      },
      {
        id: 'quality-test-result',
        name: 'Quality Test Result',
        nameCn: '质量检验结果',
        description: 'Result of a quality test performed on a material lot or work order',
        descriptionCn: '对物料批次或工单执行的质量检验结果',
        properties: [
          { name: 'testResultId', type: 'string', description: 'Test result ID' },
          { name: 'testDefinitionId', type: 'string', description: 'Test definition reference' },
          { name: 'materialLotId', type: 'string', description: 'Tested material lot' },
          { name: 'workOrderId', type: 'string', description: 'Related work order' },
          { name: 'testDate', type: 'datetime', description: 'Test date/time' },
          { name: 'inspectorId', type: 'string', description: 'Inspector who performed test' },
          { name: 'equipmentUsed', type: 'string', description: 'Test equipment used' },
          { name: 'measuredValue', type: 'number', description: 'Measured value' },
          { name: 'result', type: 'string', description: 'Pass/Fail/Marginal' },
          { name: 'sampleId', type: 'string', description: 'Sample identifier' },
          { name: 'comments', type: 'string', description: 'Inspector comments' },
          { name: 'attachments', type: 'array', description: 'Test result attachments' },
          // SPC data
          { name: 'controlChartData', type: 'object', description: 'SPC control chart data points' },
          // AI-derived
          {
            name: 'anomalyScore',
            type: 'number',
            description: 'AI anomaly detection score',
            isAIDerived: true,
            logicDescription: 'Isolation Forest / Autoencoder anomaly detection'
          },
          {
            name: 'trendAlert',
            type: 'string',
            description: 'SPC trend alert (shift, drift, pattern)',
            isAIDerived: true,
            logicDescription: 'Western Electric rules and ML pattern recognition'
          }
        ],
        primaryKey: 'testResultId',
        actions: [
          {
            name: 'Record Test Result',
            nameCn: '记录检验结果',
            type: 'traditional',
            description: 'Record quality test result',
            descriptionCn: '记录质量检验结果',
            businessLayer: {
              description: '检验员记录质量检验结果',
              targetObject: 'Quality Test Result',
              executorRole: 'Quality Inspector',
              triggerCondition: '完成检验'
            },
            logicLayer: {
              preconditions: ['检验员有资质'],
              parameters: [
                { name: 'testDefinitionId', type: 'string', required: true, description: '检验定义ID' },
                { name: 'materialLotId', type: 'string', required: true, description: '物料批次ID' },
                { name: 'measuredValue', type: 'number', required: true, description: '测量值' },
                { name: 'equipmentUsed', type: 'string', required: true, description: '使用的设备' }
              ],
              postconditions: ['检验结果记录', '自动判定Pass/Fail'],
              sideEffects: ['更新物料质量状态', '触发SPC分析', '如Fail则触发告警']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/quality/test-results',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Anomaly detection score' },
          { type: 'Smart Property', description: 'SPC trend alerts' }
        ]
      },
      {
        id: 'nonconformance',
        name: 'Nonconformance Report',
        nameCn: '不合格报告',
        description: 'Record of a quality nonconformance requiring disposition',
        descriptionCn: '需要处置的质量不合格记录',
        properties: [
          { name: 'ncrId', type: 'string', description: 'NCR number' },
          { name: 'status', type: 'string', description: 'Open/Under Review/Dispositioned/Closed' },
          { name: 'materialLotId', type: 'string', description: 'Affected material lot' },
          { name: 'workOrderId', type: 'string', description: 'Related work order' },
          { name: 'detectionPoint', type: 'string', description: 'Where detected (Incoming/In-Process/Final/Customer)' },
          { name: 'defectType', type: 'string', description: 'Type of defect' },
          { name: 'defectDescription', type: 'string', description: 'Detailed description' },
          { name: 'affectedQuantity', type: 'number', description: 'Affected quantity' },
          { name: 'reportedBy', type: 'string', description: 'Reporter ID' },
          { name: 'reportedDate', type: 'datetime', description: 'Report date' },
          { name: 'rootCause', type: 'string', description: 'Root cause analysis' },
          { name: 'disposition', type: 'string', description: 'Use As Is/Rework/Scrap/Return to Supplier' },
          { name: 'dispositionedBy', type: 'string', description: 'Person who dispositioned' },
          { name: 'correctiveAction', type: 'string', description: 'Corrective action reference' },
          { name: 'cost', type: 'number', description: 'Cost of nonconformance' },
          // AI-derived
          {
            name: 'similarNCRs',
            type: 'array',
            description: 'AI-identified similar NCRs for pattern analysis',
            isAIDerived: true,
            logicDescription: 'NLP similarity matching on defect descriptions'
          },
          {
            name: 'suggestedRootCause',
            type: 'string',
            description: 'AI-suggested root cause based on similar cases',
            isAIDerived: true,
            logicDescription: 'ML classification based on historical NCR data'
          }
        ],
        primaryKey: 'ncrId',
        actions: [
          {
            name: 'Create NCR',
            nameCn: '创建不合格报告',
            type: 'traditional',
            description: 'Create nonconformance report',
            descriptionCn: '创建不合格报告',
            businessLayer: {
              description: '发现质量问题时创建NCR',
              targetObject: 'Nonconformance Report',
              executorRole: 'Quality Inspector',
              triggerCondition: '发现不合格'
            },
            logicLayer: {
              preconditions: [],
              parameters: [
                { name: 'materialLotId', type: 'string', required: true, description: '物料批次ID' },
                { name: 'defectType', type: 'string', required: true, description: '缺陷类型' },
                { name: 'defectDescription', type: 'string', required: true, description: '缺陷描述' },
                { name: 'affectedQuantity', type: 'number', required: true, description: '影响数量' }
              ],
              postconditions: ['NCR创建', '物料被冻结'],
              sideEffects: ['通知质量团队', '触发AI相似案例分析']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/quality/ncrs',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Disposition NCR',
            nameCn: '处置不合格',
            type: 'traditional',
            description: 'Disposition nonconformance',
            descriptionCn: '处置不合格品',
            businessLayer: {
              description: '决定不合格品的处理方式',
              targetObject: 'Nonconformance Report',
              executorRole: 'Quality Engineer',
              triggerCondition: 'NCR需要处置'
            },
            logicLayer: {
              preconditions: ['NCR状态为Open或Under Review', '有处置权限'],
              parameters: [
                { name: 'ncrId', type: 'string', required: true, description: 'NCR ID' },
                { name: 'disposition', type: 'string', required: true, description: '处置决定' },
                { name: 'rootCause', type: 'string', required: false, description: '根本原因' },
                { name: 'correctiveAction', type: 'string', required: false, description: '纠正措施' }
              ],
              postconditions: ['NCR状态变为Dispositioned', '物料状态更新'],
              sideEffects: ['执行处置动作', '触发纠正措施流程']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/quality/ncrs/{ncrId}/disposition',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Similar NCR identification' },
          { type: 'Smart Property', description: 'Root cause suggestion' }
        ]
      },

      // ============= 维护运营模型 (Maintenance Operations) =============

      {
        id: 'maintenance-work-order',
        name: 'Maintenance Work Order',
        nameCn: '维护工单',
        description: 'A work order for equipment maintenance (preventive, corrective, or predictive)',
        descriptionCn: '设备维护工单（预防性、纠正性或预测性）',
        properties: [
          { name: 'maintenanceOrderId', type: 'string', description: 'Maintenance order number' },
          { name: 'orderType', type: 'string', description: 'Preventive/Corrective/Predictive/Emergency' },
          { name: 'status', type: 'string', description: 'Created/Scheduled/InProgress/Completed/Cancelled' },
          { name: 'priority', type: 'string', description: 'Priority (P1-P4)' },
          { name: 'equipmentId', type: 'string', description: 'Equipment to maintain' },
          { name: 'assetId', type: 'string', description: 'Physical asset reference' },
          { name: 'description', type: 'string', description: 'Work description' },
          { name: 'plannedStart', type: 'datetime', description: 'Planned start' },
          { name: 'plannedEnd', type: 'datetime', description: 'Planned end' },
          { name: 'plannedDuration', type: 'number', description: 'Planned duration (hours)' },
          { name: 'actualStart', type: 'datetime', description: 'Actual start' },
          { name: 'actualEnd', type: 'datetime', description: 'Actual end' },
          { name: 'actualDuration', type: 'number', description: 'Actual duration (hours)' },
          { name: 'assignedTechnicians', type: 'array', description: 'Assigned technicians' },
          { name: 'requiredParts', type: 'array', description: 'Required spare parts' },
          { name: 'usedParts', type: 'array', description: 'Actually used parts' },
          { name: 'laborCost', type: 'number', description: 'Labor cost' },
          { name: 'partsCost', type: 'number', description: 'Parts cost' },
          { name: 'totalCost', type: 'number', description: 'Total cost' },
          { name: 'failureCode', type: 'string', description: 'Failure code (for corrective)' },
          { name: 'rootCause', type: 'string', description: 'Root cause' },
          { name: 'actionTaken', type: 'string', description: 'Action taken' },
          // AI-derived
          {
            name: 'estimatedCompletionTime',
            type: 'datetime',
            description: 'AI-estimated completion time',
            isAIDerived: true,
            logicDescription: 'Based on similar work orders and current progress'
          }
        ],
        primaryKey: 'maintenanceOrderId',
        actions: [
          {
            name: 'Create Maintenance Order',
            nameCn: '创建维护工单',
            type: 'traditional',
            description: 'Create a maintenance work order',
            descriptionCn: '创建维护工单',
            businessLayer: {
              description: '创建设备维护工单',
              targetObject: 'Maintenance Work Order',
              executorRole: 'Maintenance Planner',
              triggerCondition: '计划维护或故障报修'
            },
            logicLayer: {
              preconditions: [],
              parameters: [
                { name: 'equipmentId', type: 'string', required: true, description: '设备ID' },
                { name: 'orderType', type: 'string', required: true, description: '工单类型' },
                { name: 'priority', type: 'string', required: true, description: '优先级' },
                { name: 'description', type: 'string', required: true, description: '工作描述' }
              ],
              postconditions: ['维护工单创建'],
              sideEffects: ['通知维护团队', '预留备件']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/maintenance/work-orders',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Schedule Maintenance',
            nameCn: '安排维护',
            type: 'generative',
            description: 'AI-optimized maintenance scheduling',
            descriptionCn: 'AI优化的维护排程',
            aiLogic: 'Optimize maintenance window considering: production schedule impact, technician availability, spare parts availability, equipment criticality, and failure risk',
            businessLayer: {
              description: '使用AI找到最佳维护时间窗口',
              targetObject: 'Maintenance Work Order',
              executorRole: 'Maintenance Planner',
              triggerCondition: '维护工单需要排程'
            },
            logicLayer: {
              preconditions: ['工单状态为Created'],
              parameters: [
                { name: 'maintenanceOrderId', type: 'string', required: true, description: '维护工单ID' },
                { name: 'preferredWindow', type: 'object', required: false, description: '偏好时间窗口' }
              ],
              postconditions: ['工单获得排程时间', '通知相关方'],
              sideEffects: ['更新生产排程', '预留技术人员']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/maintenance/work-orders/{maintenanceOrderId}/schedule',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 2, requiresHumanApproval: true, auditLog: true, riskLevel: 'medium' }
          },
          {
            name: 'Complete Maintenance',
            nameCn: '完成维护',
            type: 'traditional',
            description: 'Complete maintenance work order',
            descriptionCn: '完成维护工单',
            businessLayer: {
              description: '记录维护完成和结果',
              targetObject: 'Maintenance Work Order',
              executorRole: 'Maintenance Technician',
              triggerCondition: '维护工作完成'
            },
            logicLayer: {
              preconditions: ['工单状态为InProgress'],
              parameters: [
                { name: 'maintenanceOrderId', type: 'string', required: true, description: '工单ID' },
                { name: 'actionTaken', type: 'string', required: true, description: '采取的措施' },
                { name: 'usedParts', type: 'array', required: false, description: '使用的备件' },
                { name: 'rootCause', type: 'string', required: false, description: '根本原因（纠正性）' }
              ],
              postconditions: ['工单完成', '设备状态更新'],
              sideEffects: ['更新设备维护记录', '计算维护成本', '更新MTBF/MTTR']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/maintenance/work-orders/{maintenanceOrderId}/complete',
              apiMethod: 'POST'
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Completion time estimation' },
          { type: 'Generative Action', description: 'AI-optimized maintenance scheduling' }
        ]
      }
    ],

    links: [
      // Personnel relationships
      { id: 'person-class', source: 'person', target: 'personnel-class', label: 'has_role', isSemantic: true },
      { id: 'person-equipment', source: 'person', target: 'equipment', label: 'operates', isSemantic: true },

      // Equipment relationships
      { id: 'equipment-class', source: 'equipment', target: 'equipment-class', label: 'instance_of', isSemantic: true },
      { id: 'equipment-parent', source: 'equipment', target: 'equipment', label: 'part_of', isSemantic: true },
      { id: 'equipment-asset', source: 'equipment', target: 'physical-asset', label: 'is_asset', isSemantic: true },

      // Material relationships
      { id: 'lot-material', source: 'material-lot', target: 'material-definition', label: 'instance_of', isSemantic: true },
      { id: 'lot-parent', source: 'material-lot', target: 'material-lot', label: 'derived_from', isSemantic: true },

      // Work Order relationships
      { id: 'wo-material', source: 'work-order', target: 'material-definition', label: 'produces', isSemantic: true },
      { id: 'wo-definition', source: 'work-order', target: 'operations-definition', label: 'follows', isSemantic: true },
      { id: 'wo-equipment', source: 'work-order', target: 'equipment', label: 'uses', isSemantic: true },
      { id: 'wo-person', source: 'work-order', target: 'person', label: 'assigned_to', isSemantic: true },
      { id: 'wo-lot-consume', source: 'work-order', target: 'material-lot', label: 'consumes', isSemantic: true },
      { id: 'wo-lot-produce', source: 'work-order', target: 'material-lot', label: 'produces', isSemantic: true },

      // Quality relationships
      { id: 'test-lot', source: 'quality-test-result', target: 'material-lot', label: 'tests', isSemantic: true },
      { id: 'test-definition', source: 'quality-test-result', target: 'quality-test-definition', label: 'follows', isSemantic: true },
      { id: 'ncr-lot', source: 'nonconformance', target: 'material-lot', label: 'affects', isSemantic: true },

      // Maintenance relationships
      { id: 'maint-equipment', source: 'maintenance-work-order', target: 'equipment', label: 'maintains', isSemantic: true },
      { id: 'maint-asset', source: 'maintenance-work-order', target: 'physical-asset', label: 'services', isSemantic: true },
      { id: 'maint-person', source: 'maintenance-work-order', target: 'person', label: 'assigned_to', isSemantic: true }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  //                    KINETIC LAYER - 动力层
  //                      数据连接和集成
  // ═══════════════════════════════════════════════════════════════════
  connectors: [
    {
      id: 'sap-ecc-erp',
      name: 'SAP ECC/S4HANA ERP Connector',
      description: {
        en: 'Bidirectional integration with SAP ERP for master data, production orders, and inventory',
        cn: '与 SAP ERP 的双向集成，同步主数据、生产订单和库存'
      },
      sourceType: 'erp',
      sourceSystem: 'SAP ECC / S/4HANA',
      sourceVersion: 'ECC 6.0+ / S/4HANA 1909+',
      connectionTemplate: {
        requiredFields: [
          { name: 'hostname', type: 'string', description: 'SAP application server', example: 'sap.company.com' },
          { name: 'systemNumber', type: 'string', description: 'System number', example: '00' },
          { name: 'client', type: 'string', description: 'SAP client', example: '100' },
          { name: 'username', type: 'string', description: 'RFC user' },
          { name: 'password', type: 'secret', description: 'RFC password' }
        ],
        optionalFields: [
          { name: 'language', type: 'string', description: 'Logon language', default: 'EN' },
          { name: 'poolSize', type: 'number', description: 'Connection pool size', default: 5 }
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
          objectId: 'material-definition',
          sourceEntity: 'MARA/MAKT (Material Master)',
          fieldMappings: [
            { sourceField: 'MATNR', targetProperty: 'materialId' },
            { sourceField: 'MAKTX', targetProperty: 'materialName' },
            { sourceField: 'MTART', targetProperty: 'materialClass', transformation: 'MTART_MAP' },
            { sourceField: 'MEINS', targetProperty: 'unitOfMeasure' }
          ]
        },
        {
          objectId: 'work-order',
          sourceEntity: 'AFKO/AFPO (Production Order)',
          fieldMappings: [
            { sourceField: 'AUFNR', targetProperty: 'workOrderId' },
            { sourceField: 'PLNBEZ', targetProperty: 'materialId' },
            { sourceField: 'GAMNG', targetProperty: 'plannedQuantity' },
            { sourceField: 'GSTRP', targetProperty: 'plannedStart' },
            { sourceField: 'GLTRP', targetProperty: 'plannedEnd' }
          ]
        },
        {
          objectId: 'material-lot',
          sourceEntity: 'CHARG (Batch)',
          fieldMappings: [
            { sourceField: 'CHARG', targetProperty: 'lotId' },
            { sourceField: 'MATNR', targetProperty: 'materialId' },
            { sourceField: 'VFDAT', targetProperty: 'expirationDate' }
          ]
        }
      ]
    },
    {
      id: 'mes-opcua',
      name: 'MES OPC-UA Connector',
      description: {
        en: 'Real-time integration with MES via OPC-UA for equipment status and production events',
        cn: '通过 OPC-UA 与 MES 实时集成，获取设备状态和生产事件'
      },
      sourceType: 'mes',
      sourceSystem: 'Generic MES (OPC-UA)',
      connectionTemplate: {
        requiredFields: [
          { name: 'endpointUrl', type: 'string', description: 'OPC-UA endpoint URL', example: 'opc.tcp://mes-server:4840' },
          { name: 'securityPolicy', type: 'string', description: 'Security policy', example: 'Basic256Sha256' },
          { name: 'securityMode', type: 'string', description: 'Security mode', example: 'SignAndEncrypt' },
          { name: 'certificatePath', type: 'string', description: 'Client certificate path' },
          { name: 'privateKeyPath', type: 'secret', description: 'Private key path' }
        ]
      },
      sync: {
        direction: 'bidirectional',
        frequency: 'realtime'
      },
      mappedObjects: [
        {
          objectId: 'equipment',
          sourceEntity: 'Equipment Node',
          fieldMappings: [
            { sourceField: 'EquipmentID', targetProperty: 'equipmentId' },
            { sourceField: 'Status', targetProperty: 'status' },
            { sourceField: 'Mode', targetProperty: 'currentMode' },
            { sourceField: 'CycleCount', targetProperty: 'cycleCount' }
          ]
        },
        {
          objectId: 'work-order',
          sourceEntity: 'Work Order Node',
          fieldMappings: [
            { sourceField: 'WorkOrderID', targetProperty: 'workOrderId' },
            { sourceField: 'Status', targetProperty: 'status' },
            { sourceField: 'CompletedQty', targetProperty: 'completedQuantity' }
          ]
        }
      ]
    },
    {
      id: 'iot-platform',
      name: 'IoT Platform Connector',
      description: {
        en: 'Streaming data from equipment sensors for condition monitoring and predictive analytics',
        cn: '从设备传感器获取流数据，用于状态监测和预测分析'
      },
      sourceType: 'iot',
      sourceSystem: 'Azure IoT Hub / AWS IoT Core / Osisoft PI',
      connectionTemplate: {
        requiredFields: [
          { name: 'platform', type: 'string', description: 'IoT platform type', example: 'azure-iot-hub' },
          { name: 'connectionString', type: 'secret', description: 'Connection string or credentials' },
          { name: 'consumerGroup', type: 'string', description: 'Consumer group for event hub' }
        ]
      },
      sync: {
        direction: 'inbound',
        frequency: 'streaming'
      },
      mappedObjects: [
        {
          objectId: 'equipment',
          sourceEntity: 'Telemetry Stream',
          fieldMappings: [
            { sourceField: 'deviceId', targetProperty: 'equipmentId' },
            { sourceField: 'timestamp', targetProperty: '_telemetry_timestamp' },
            { sourceField: 'temperature', targetProperty: '_sensor_temperature' },
            { sourceField: 'vibration', targetProperty: '_sensor_vibration' },
            { sourceField: 'current', targetProperty: '_sensor_current' },
            { sourceField: 'pressure', targetProperty: '_sensor_pressure' }
          ]
        }
      ]
    },
    {
      id: 'lims-integration',
      name: 'LIMS Integration',
      description: {
        en: 'Integration with Laboratory Information Management System for quality test data',
        cn: '与实验室信息管理系统集成，获取质量检测数据'
      },
      sourceType: 'api',
      sourceSystem: 'LIMS (LabWare, STARLIMS, etc.)',
      connectionTemplate: {
        requiredFields: [
          { name: 'baseUrl', type: 'string', description: 'LIMS API base URL' },
          { name: 'apiKey', type: 'secret', description: 'API key or token' }
        ]
      },
      sync: {
        direction: 'bidirectional',
        frequency: 'hourly',
        incrementalSync: true
      },
      mappedObjects: [
        {
          objectId: 'quality-test-result',
          sourceEntity: 'Sample Result',
          fieldMappings: [
            { sourceField: 'sampleId', targetProperty: 'sampleId' },
            { sourceField: 'testCode', targetProperty: 'testDefinitionId' },
            { sourceField: 'result', targetProperty: 'measuredValue' },
            { sourceField: 'status', targetProperty: 'result' }
          ]
        }
      ]
    },
    {
      id: 'cmms-integration',
      name: 'CMMS Integration',
      description: {
        en: 'Integration with Computerized Maintenance Management System',
        cn: '与计算机化维护管理系统集成'
      },
      sourceType: 'api',
      sourceSystem: 'SAP PM / Maximo / Fiix',
      connectionTemplate: {
        requiredFields: [
          { name: 'baseUrl', type: 'string', description: 'CMMS API URL' },
          { name: 'credentials', type: 'secret', description: 'API credentials' }
        ]
      },
      sync: {
        direction: 'bidirectional',
        frequency: 'hourly',
        incrementalSync: true
      },
      mappedObjects: [
        {
          objectId: 'maintenance-work-order',
          sourceEntity: 'Work Order',
          fieldMappings: [
            { sourceField: 'workOrderNum', targetProperty: 'maintenanceOrderId' },
            { sourceField: 'assetNum', targetProperty: 'assetId' },
            { sourceField: 'status', targetProperty: 'status' },
            { sourceField: 'workType', targetProperty: 'orderType' }
          ]
        },
        {
          objectId: 'physical-asset',
          sourceEntity: 'Asset',
          fieldMappings: [
            { sourceField: 'assetNum', targetProperty: 'assetId' },
            { sourceField: 'description', targetProperty: 'assetName' },
            { sourceField: 'serialNum', targetProperty: 'serialNumber' }
          ]
        }
      ]
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                    DYNAMIC LAYER - 动态层
  //                    工作流和业务规则
  // ═══════════════════════════════════════════════════════════════════
  workflows: [
    {
      id: 'daily-production-scheduling',
      name: 'Daily Production Scheduling',
      description: {
        en: 'Automated daily scheduling workflow with AI optimization and capacity balancing',
        cn: '自动化每日排程工作流，包含AI优化和产能平衡'
      },
      trigger: {
        type: 'scheduled',
        config: { cron: '0 4 * * *', timezone: 'local' }
      },
      steps: [
        {
          id: 'sync-orders',
          name: 'Sync Orders from ERP',
          description: { en: 'Pull new production orders from ERP', cn: '从ERP拉取新生产订单' },
          type: 'action',
          actionRef: 'erp-sync',
          nextSteps: ['check-capacity']
        },
        {
          id: 'check-capacity',
          name: 'Check Capacity',
          description: { en: 'Verify equipment and personnel capacity', cn: '检查设备和人员产能' },
          type: 'action',
          actionRef: 'capacity-check',
          nextSteps: ['check-materials']
        },
        {
          id: 'check-materials',
          name: 'Check Material Availability',
          description: { en: 'Verify material availability for planned orders', cn: '检查计划订单的物料可用性' },
          type: 'action',
          actionRef: 'material-availability-check',
          nextSteps: ['ai-schedule']
        },
        {
          id: 'ai-schedule',
          name: 'AI Scheduling Optimization',
          description: { en: 'Run AI scheduling algorithm', cn: '运行AI排程算法' },
          type: 'action',
          actionRef: 'ai-schedule-work-orders',
          nextSteps: ['review-schedule']
        },
        {
          id: 'review-schedule',
          name: 'Planner Review',
          description: { en: 'Planner reviews and adjusts schedule', cn: '计划员审核和调整排程' },
          type: 'wait',
          timeout: { duration: '2h', action: 'escalate' },
          nextSteps: ['publish-schedule']
        },
        {
          id: 'publish-schedule',
          name: 'Publish Schedule',
          description: { en: 'Publish approved schedule to MES', cn: '发布审核后的排程到MES' },
          type: 'action',
          actionRef: 'publish-schedule',
          nextSteps: []
        }
      ],
      entryStep: 'sync-orders',
      roles: ['Production Planner', 'System'],
      sla: {
        maxDuration: '4h',
        escalationPath: ['Production Manager', 'Plant Director']
      }
    },
    {
      id: 'predictive-maintenance-trigger',
      name: 'Predictive Maintenance Trigger',
      description: {
        en: 'Triggered when AI detects high equipment failure probability',
        cn: '当AI检测到高设备故障概率时触发'
      },
      trigger: {
        type: 'condition',
        config: { condition: 'equipment.failureProbability7d > 0.7' }
      },
      steps: [
        {
          id: 'create-maint-request',
          name: 'Create Maintenance Request',
          description: { en: 'Auto-create maintenance work order', cn: '自动创建维护工单' },
          type: 'action',
          actionRef: 'create-maintenance-order',
          nextSteps: ['find-window']
        },
        {
          id: 'find-window',
          name: 'Find Optimal Window',
          description: { en: 'AI finds optimal maintenance window', cn: 'AI找到最佳维护窗口' },
          type: 'action',
          actionRef: 'schedule-maintenance',
          nextSteps: ['notify-planner']
        },
        {
          id: 'notify-planner',
          name: 'Notify Maintenance Planner',
          description: { en: 'Send notification for approval', cn: '发送通知请求批准' },
          type: 'notification',
          nextSteps: []
        }
      ],
      entryStep: 'create-maint-request',
      roles: ['Maintenance Planner', 'System']
    },
    {
      id: 'quality-ncr-workflow',
      name: 'Quality NCR Workflow',
      description: {
        en: 'Workflow for handling nonconformance reports',
        cn: '不合格报告处理工作流'
      },
      trigger: {
        type: 'event',
        config: { event: 'ncr.created' }
      },
      steps: [
        {
          id: 'ai-analysis',
          name: 'AI Analysis',
          description: { en: 'AI analyzes NCR and suggests root cause', cn: 'AI分析NCR并建议根本原因' },
          type: 'action',
          actionRef: 'ai-ncr-analysis',
          nextSteps: ['assign-investigator']
        },
        {
          id: 'assign-investigator',
          name: 'Assign Investigator',
          description: { en: 'Assign quality engineer to investigate', cn: '分配质量工程师调查' },
          type: 'action',
          actionRef: 'assign-ncr-investigator',
          nextSteps: ['investigation']
        },
        {
          id: 'investigation',
          name: 'Investigation',
          description: { en: 'Quality engineer investigates', cn: '质量工程师调查' },
          type: 'wait',
          timeout: { duration: '48h', action: 'escalate' },
          nextSteps: ['disposition-decision']
        },
        {
          id: 'disposition-decision',
          name: 'Disposition Decision',
          description: { en: 'Decide on material disposition', cn: '决定物料处置' },
          type: 'action',
          actionRef: 'disposition-ncr',
          nextSteps: ['close-ncr']
        },
        {
          id: 'close-ncr',
          name: 'Close NCR',
          description: { en: 'Close the NCR', cn: '关闭NCR' },
          type: 'action',
          actionRef: 'close-ncr',
          nextSteps: []
        }
      ],
      entryStep: 'ai-analysis',
      roles: ['Quality Inspector', 'Quality Engineer', 'Quality Manager'],
      sla: {
        maxDuration: '72h',
        escalationPath: ['Quality Manager', 'Plant Director']
      }
    },
    {
      id: 'material-traceability',
      name: 'Material Traceability Query',
      description: {
        en: 'Trace material genealogy forward or backward',
        cn: '正向或反向追溯物料谱系'
      },
      trigger: {
        type: 'manual',
        config: {}
      },
      steps: [
        {
          id: 'query-genealogy',
          name: 'Query Genealogy',
          description: { en: 'Query material lot relationships', cn: '查询物料批次关系' },
          type: 'action',
          actionRef: 'query-material-genealogy',
          nextSteps: ['build-report']
        },
        {
          id: 'build-report',
          name: 'Build Traceability Report',
          description: { en: 'Generate traceability report', cn: '生成追溯报告' },
          type: 'action',
          actionRef: 'generate-traceability-report',
          nextSteps: []
        }
      ],
      entryStep: 'query-genealogy',
      roles: ['Quality Engineer', 'Production Manager']
    }
  ],

  rules: [
    {
      id: 'oee-alert',
      name: 'OEE Threshold Alert',
      description: { en: 'Alert when equipment OEE drops below threshold', cn: '当设备OEE低于阈值时告警' },
      type: 'trigger',
      appliesTo: ['equipment'],
      expression: 'currentOEE < 65',
      onViolation: {
        action: 'notify',
        message: { en: 'Equipment {equipmentId} OEE is {currentOEE}% (threshold: 65%)', cn: '设备 {equipmentId} OEE为 {currentOEE}%（阈值：65%）' }
      }
    },
    {
      id: 'material-expiration-warning',
      name: 'Material Expiration Warning',
      description: { en: 'Warn when material lot is approaching expiration', cn: '物料批次临近过期时告警' },
      type: 'trigger',
      appliesTo: ['material-lot'],
      expression: 'shelfLifeRemaining <= 30 AND status = "Available"',
      onViolation: {
        action: 'notify',
        message: { en: 'Material lot {lotId} expires in {shelfLifeRemaining} days', cn: '物料批次 {lotId} 将在 {shelfLifeRemaining} 天后过期' }
      }
    },
    {
      id: 'work-order-delay-risk',
      name: 'Work Order Delay Risk',
      description: { en: 'Alert when work order has high delay risk', cn: '工单延迟风险高时告警' },
      type: 'trigger',
      appliesTo: ['work-order'],
      expression: 'onTimeDeliveryRisk > 0.6 AND status = "InProgress"',
      onViolation: {
        action: 'notify',
        message: { en: 'Work order {workOrderId} has {onTimeDeliveryRisk}% delay risk', cn: '工单 {workOrderId} 延迟风险为 {onTimeDeliveryRisk}%' }
      }
    },
    {
      id: 'equipment-failure-risk',
      name: 'Equipment Failure Risk',
      description: { en: 'Trigger predictive maintenance when failure risk is high', cn: '故障风险高时触发预测性维护' },
      type: 'trigger',
      appliesTo: ['equipment'],
      expression: 'failureProbability7d > 0.7',
      onViolation: {
        action: 'notify',
        message: { en: 'Equipment {equipmentId} has {failureProbability7d}% failure risk in next 7 days', cn: '设备 {equipmentId} 未来7天故障概率为 {failureProbability7d}%' }
      }
    },
    {
      id: 'spc-out-of-control',
      name: 'SPC Out of Control',
      description: { en: 'Alert when SPC detects out-of-control condition', cn: 'SPC检测到失控状态时告警' },
      type: 'trigger',
      appliesTo: ['quality-test-result'],
      expression: 'trendAlert IS NOT NULL',
      onViolation: {
        action: 'warn',
        message: { en: 'SPC alert: {trendAlert} detected for test {testDefinitionId}', cn: 'SPC告警：检测到 {trendAlert}，检验 {testDefinitionId}' }
      }
    },
    {
      id: 'first-pass-yield-threshold',
      name: 'First Pass Yield Threshold',
      description: { en: 'Alert when work order yield drops below threshold', cn: '工单良率低于阈值时告警' },
      type: 'trigger',
      appliesTo: ['work-order'],
      expression: 'yieldPercentage < 95 AND completedQuantity > 10',
      onViolation: {
        action: 'notify',
        message: { en: 'Work order {workOrderId} yield is {yieldPercentage}% (threshold: 95%)', cn: '工单 {workOrderId} 良率为 {yieldPercentage}%（阈值：95%）' }
      }
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                       AI LAYER - AI层
  //                    AI能力和模型配置
  // ═══════════════════════════════════════════════════════════════════
  aiCapabilities: [
    {
      id: 'production-scheduling-optimization',
      name: 'Production Scheduling Optimization',
      type: 'optimization',
      description: {
        en: 'Multi-objective optimization for production scheduling considering capacity, materials, changeover, and due dates',
        cn: '综合考虑产能、物料、换线和交期的多目标生产排程优化'
      },
      enabledActions: ['ai-schedule-work-orders'],
      modelConfig: {
        modelType: 'Constraint Programming (OR-Tools) + ML Prediction',
        trainingDataRequirements: 'Historical schedules, actual vs planned times, changeover matrices, equipment performance'
      }
    },
    {
      id: 'predictive-maintenance',
      name: 'Predictive Maintenance',
      type: 'prediction',
      description: {
        en: 'Equipment failure prediction using sensor data and maintenance history',
        cn: '使用传感器数据和维护历史进行设备故障预测'
      },
      enabledActions: ['schedule-maintenance'],
      modelConfig: {
        modelType: 'Time-series ML (LSTM/Transformer) + XGBoost',
        trainingDataRequirements: 'Sensor telemetry (vibration, temperature, current), maintenance logs, failure records, equipment specifications'
      }
    },
    {
      id: 'quality-anomaly-detection',
      name: 'Quality Anomaly Detection',
      type: 'prediction',
      description: {
        en: 'Detect quality anomalies and SPC violations in real-time',
        cn: '实时检测质量异常和SPC违规'
      },
      enabledActions: [],
      modelConfig: {
        modelType: 'Isolation Forest + Autoencoder + Western Electric Rules',
        trainingDataRequirements: 'Historical test results, SPC control charts, NCR records'
      }
    },
    {
      id: 'ncr-root-cause-analysis',
      name: 'NCR Root Cause Analysis',
      type: 'generation',
      description: {
        en: 'AI-assisted root cause analysis for nonconformance reports',
        cn: 'AI辅助的不合格报告根本原因分析'
      },
      enabledActions: ['ai-ncr-analysis'],
      modelConfig: {
        modelType: 'NLP (BERT/GPT) + Classification + Similarity Search',
        trainingDataRequirements: 'Historical NCRs with root causes, defect descriptions, corrective actions'
      }
    },
    {
      id: 'demand-sensing',
      name: 'Short-term Demand Sensing',
      type: 'prediction',
      description: {
        en: 'Short-term demand forecasting for production planning',
        cn: '用于生产计划的短期需求预测'
      },
      enabledActions: [],
      modelConfig: {
        modelType: 'Prophet / LightGBM / Temporal Fusion Transformer',
        trainingDataRequirements: 'Sales orders, forecasts, promotional calendars, economic indicators'
      }
    },
    {
      id: 'material-lot-optimization',
      name: 'Material Lot Selection Optimization',
      type: 'optimization',
      description: {
        en: 'Optimize material lot selection based on FIFO, expiration, and quality grade',
        cn: '基于先进先出、有效期和质量等级优化物料批次选择'
      },
      enabledActions: [],
      modelConfig: {
        modelType: 'Rule-based + ML ranking',
        trainingDataRequirements: 'Historical lot usage, expiration records, quality grades'
      }
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                      UI LAYER - 界面层
  //                   预配置的仪表盘和视图
  // ═══════════════════════════════════════════════════════════════════
  dashboards: [
    {
      id: 'plant-operations-center',
      name: 'Plant Operations Center',
      description: {
        en: 'Real-time plant operations monitoring for plant managers',
        cn: '面向工厂经理的实时工厂运营监控'
      },
      targetRole: 'Plant Manager',
      gridColumns: 12,
      gridRows: 8,
      widgets: [
        { id: 'plant-oee', type: 'kpi', title: { en: 'Plant OEE', cn: '工厂OEE' }, dataSource: { objectId: 'equipment', aggregation: 'AVG(currentOEE)' }, layout: { x: 0, y: 0, width: 2, height: 2 } },
        { id: 'active-orders', type: 'kpi', title: { en: 'Active Work Orders', cn: '在制工单' }, dataSource: { objectId: 'work-order', query: 'status IN (Released, InProgress)', aggregation: 'COUNT' }, layout: { x: 2, y: 0, width: 2, height: 2 } },
        { id: 'at-risk-orders', type: 'kpi', title: { en: 'At-Risk Orders', cn: '风险工单' }, dataSource: { objectId: 'work-order', query: 'onTimeDeliveryRisk > 0.5', aggregation: 'COUNT' }, layout: { x: 4, y: 0, width: 2, height: 2 }, style: { alertThreshold: 5 } },
        { id: 'open-ncrs', type: 'kpi', title: { en: 'Open NCRs', cn: '未关闭NCR' }, dataSource: { objectId: 'nonconformance', query: 'status != Closed', aggregation: 'COUNT' }, layout: { x: 6, y: 0, width: 2, height: 2 } },
        { id: 'pending-maintenance', type: 'kpi', title: { en: 'Pending Maintenance', cn: '待维护' }, dataSource: { objectId: 'maintenance-work-order', query: 'status IN (Created, Scheduled)', aggregation: 'COUNT' }, layout: { x: 8, y: 0, width: 2, height: 2 } },
        { id: 'first-pass-yield', type: 'kpi', title: { en: 'First Pass Yield', cn: '首次合格率' }, dataSource: { objectId: 'work-order', query: 'status = Completed', aggregation: 'AVG(yieldPercentage)' }, layout: { x: 10, y: 0, width: 2, height: 2 } },
        { id: 'schedule-timeline', type: 'timeline', title: { en: 'Production Schedule', cn: '生产排程' }, dataSource: { objectId: 'work-order', query: 'status IN (Scheduled, Released, InProgress)' }, layout: { x: 0, y: 2, width: 8, height: 3 } },
        { id: 'equipment-status', type: 'table', title: { en: 'Equipment Status', cn: '设备状态' }, dataSource: { objectId: 'equipment' }, layout: { x: 8, y: 2, width: 4, height: 3 } },
        { id: 'quality-trend', type: 'chart', title: { en: 'Quality Trend (7d)', cn: '质量趋势（7天）' }, dataSource: { objectId: 'quality-test-result' }, layout: { x: 0, y: 5, width: 4, height: 3 } },
        { id: 'equipment-health', type: 'chart', title: { en: 'Equipment Health Scores', cn: '设备健康评分' }, dataSource: { objectId: 'equipment', query: 'healthScore > 0' }, layout: { x: 4, y: 5, width: 4, height: 3 } },
        { id: 'maintenance-backlog', type: 'chart', title: { en: 'Maintenance Backlog', cn: '维护积压' }, dataSource: { objectId: 'maintenance-work-order' }, layout: { x: 8, y: 5, width: 4, height: 3 } }
      ],
      globalFilters: [
        { property: 'location', label: 'Area', type: 'select' },
        { property: 'shift', label: 'Shift', type: 'select' },
        { property: 'date', label: 'Date', type: 'date-range' }
      ]
    },
    {
      id: 'production-planner-workspace',
      name: 'Production Planner Workspace',
      description: {
        en: 'Daily planning workspace for production planners',
        cn: '生产计划员日常工作台'
      },
      targetRole: 'Production Planner',
      gridColumns: 12,
      gridRows: 8,
      widgets: [
        { id: 'unscheduled-orders', type: 'table', title: { en: 'Unscheduled Orders', cn: '待排程工单' }, dataSource: { objectId: 'work-order', query: 'status = Created' }, layout: { x: 0, y: 0, width: 6, height: 4 } },
        { id: 'capacity-utilization', type: 'chart', title: { en: 'Capacity Utilization', cn: '产能利用率' }, dataSource: { objectId: 'equipment' }, layout: { x: 6, y: 0, width: 6, height: 4 } },
        { id: 'schedule-gantt', type: 'timeline', title: { en: 'Schedule Gantt', cn: '排程甘特图' }, dataSource: { objectId: 'work-order' }, layout: { x: 0, y: 4, width: 12, height: 4 } }
      ]
    },
    {
      id: 'quality-control-dashboard',
      name: 'Quality Control Dashboard',
      description: {
        en: 'Quality monitoring and control dashboard',
        cn: '质量监控和控制仪表盘'
      },
      targetRole: 'Quality Manager',
      gridColumns: 12,
      gridRows: 8,
      widgets: [
        { id: 'fpy', type: 'kpi', title: { en: 'First Pass Yield', cn: '首次合格率' }, dataSource: { objectId: 'work-order', aggregation: 'AVG(yieldPercentage)' }, layout: { x: 0, y: 0, width: 3, height: 2 } },
        { id: 'open-ncrs-quality', type: 'kpi', title: { en: 'Open NCRs', cn: '未关闭NCR' }, dataSource: { objectId: 'nonconformance', query: 'status != Closed', aggregation: 'COUNT' }, layout: { x: 3, y: 0, width: 3, height: 2 } },
        { id: 'ncr-cost', type: 'kpi', title: { en: 'NCR Cost (MTD)', cn: 'NCR成本（月累计）' }, dataSource: { objectId: 'nonconformance', aggregation: 'SUM(cost)' }, layout: { x: 6, y: 0, width: 3, height: 2 } },
        { id: 'pending-inspections', type: 'kpi', title: { en: 'Pending Inspections', cn: '待检' }, dataSource: { objectId: 'material-lot', query: 'qualityStatus = Pending', aggregation: 'COUNT' }, layout: { x: 9, y: 0, width: 3, height: 2 } },
        { id: 'spc-chart', type: 'chart', title: { en: 'SPC Control Charts', cn: 'SPC控制图' }, dataSource: { objectId: 'quality-test-result' }, layout: { x: 0, y: 2, width: 8, height: 3 } },
        { id: 'defect-pareto', type: 'chart', title: { en: 'Defect Pareto', cn: '缺陷帕累托' }, dataSource: { objectId: 'nonconformance' }, layout: { x: 8, y: 2, width: 4, height: 3 } },
        { id: 'ncr-list', type: 'table', title: { en: 'Open NCRs', cn: '未关闭NCR列表' }, dataSource: { objectId: 'nonconformance', query: 'status != Closed' }, layout: { x: 0, y: 5, width: 12, height: 3 } }
      ]
    },
    {
      id: 'maintenance-dashboard',
      name: 'Maintenance Dashboard',
      description: {
        en: 'Equipment maintenance and reliability dashboard',
        cn: '设备维护和可靠性仪表盘'
      },
      targetRole: 'Maintenance Manager',
      gridColumns: 12,
      gridRows: 8,
      widgets: [
        { id: 'equipment-availability', type: 'kpi', title: { en: 'Equipment Availability', cn: '设备可用性' }, dataSource: { objectId: 'equipment', aggregation: 'AVG(availability)' }, layout: { x: 0, y: 0, width: 3, height: 2 } },
        { id: 'mtbf-avg', type: 'kpi', title: { en: 'Avg MTBF', cn: '平均MTBF' }, dataSource: { objectId: 'equipment', aggregation: 'AVG(mtbf)' }, layout: { x: 3, y: 0, width: 3, height: 2 } },
        { id: 'mttr-avg', type: 'kpi', title: { en: 'Avg MTTR', cn: '平均MTTR' }, dataSource: { objectId: 'equipment', aggregation: 'AVG(mttr)' }, layout: { x: 6, y: 0, width: 3, height: 2 } },
        { id: 'overdue-pm', type: 'kpi', title: { en: 'Overdue PM', cn: '逾期预防维护' }, dataSource: { objectId: 'maintenance-work-order', query: 'orderType = Preventive AND status != Completed AND plannedEnd < NOW()', aggregation: 'COUNT' }, layout: { x: 9, y: 0, width: 3, height: 2 } },
        { id: 'health-heatmap', type: 'map', title: { en: 'Equipment Health Map', cn: '设备健康热图' }, dataSource: { objectId: 'equipment' }, layout: { x: 0, y: 2, width: 6, height: 3 } },
        { id: 'failure-prediction', type: 'table', title: { en: 'Failure Risk (7d)', cn: '故障风险（7天）' }, dataSource: { objectId: 'equipment', query: 'failureProbability7d > 0.3' }, layout: { x: 6, y: 2, width: 6, height: 3 } },
        { id: 'maintenance-schedule', type: 'timeline', title: { en: 'Maintenance Schedule', cn: '维护排程' }, dataSource: { objectId: 'maintenance-work-order', query: 'status IN (Scheduled, InProgress)' }, layout: { x: 0, y: 5, width: 12, height: 3 } }
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
        { property: 'workOrderId', label: { en: 'Order #', cn: '工单号' }, visible: true, sortable: true, filterable: true },
        { property: 'materialId', label: { en: 'Material', cn: '物料' }, visible: true, filterable: true },
        { property: 'plannedQuantity', label: { en: 'Qty', cn: '数量' }, visible: true, sortable: true },
        { property: 'status', label: { en: 'Status', cn: '状态' }, visible: true, filterable: true },
        { property: 'priority', label: { en: 'Priority', cn: '优先级' }, visible: true, filterable: true },
        { property: 'plannedStart', label: { en: 'Planned Start', cn: '计划开始' }, visible: true, sortable: true },
        { property: 'dueDate', label: { en: 'Due Date', cn: '交期' }, visible: true, sortable: true },
        { property: 'onTimeDeliveryRisk', label: { en: 'Risk', cn: '风险' }, visible: true, sortable: true }
      ],
      defaultSort: { property: 'dueDate', direction: 'asc' },
      availableActions: ['ai-schedule-work-orders', 'release-work-order', 'start-work-order', 'report-progress', 'complete-work-order']
    },
    {
      id: 'equipment-list',
      name: 'Equipment',
      type: 'list',
      objectId: 'equipment',
      fields: [
        { property: 'equipmentId', label: { en: 'Equipment ID', cn: '设备ID' }, visible: true, sortable: true },
        { property: 'equipmentName', label: { en: 'Name', cn: '名称' }, visible: true },
        { property: 'status', label: { en: 'Status', cn: '状态' }, visible: true, filterable: true },
        { property: 'currentOEE', label: { en: 'OEE', cn: 'OEE' }, visible: true, sortable: true },
        { property: 'healthScore', label: { en: 'Health', cn: '健康度' }, visible: true, sortable: true },
        { property: 'failureProbability7d', label: { en: 'Failure Risk', cn: '故障风险' }, visible: true, sortable: true }
      ],
      defaultSort: { property: 'healthScore', direction: 'asc' },
      availableActions: ['change-equipment-status', 'request-maintenance']
    },
    {
      id: 'material-lot-list',
      name: 'Material Lots',
      type: 'list',
      objectId: 'material-lot',
      fields: [
        { property: 'lotId', label: { en: 'Lot ID', cn: '批次ID' }, visible: true, sortable: true },
        { property: 'materialId', label: { en: 'Material', cn: '物料' }, visible: true, filterable: true },
        { property: 'quantity', label: { en: 'Qty', cn: '数量' }, visible: true, sortable: true },
        { property: 'status', label: { en: 'Status', cn: '状态' }, visible: true, filterable: true },
        { property: 'location', label: { en: 'Location', cn: '库位' }, visible: true, filterable: true },
        { property: 'expirationDate', label: { en: 'Expiration', cn: '过期日期' }, visible: true, sortable: true },
        { property: 'qualityStatus', label: { en: 'QA Status', cn: '质量状态' }, visible: true, filterable: true }
      ],
      defaultSort: { property: 'expirationDate', direction: 'asc' },
      availableActions: ['transfer-lot', 'hold-lot', 'release-lot']
    },
    {
      id: 'ncr-list',
      name: 'Nonconformance Reports',
      type: 'list',
      objectId: 'nonconformance',
      fields: [
        { property: 'ncrId', label: { en: 'NCR #', cn: 'NCR号' }, visible: true, sortable: true },
        { property: 'status', label: { en: 'Status', cn: '状态' }, visible: true, filterable: true },
        { property: 'materialLotId', label: { en: 'Lot', cn: '批次' }, visible: true },
        { property: 'defectType', label: { en: 'Defect', cn: '缺陷类型' }, visible: true, filterable: true },
        { property: 'affectedQuantity', label: { en: 'Qty', cn: '数量' }, visible: true },
        { property: 'reportedDate', label: { en: 'Reported', cn: '报告日期' }, visible: true, sortable: true },
        { property: 'disposition', label: { en: 'Disposition', cn: '处置' }, visible: true, filterable: true }
      ],
      defaultSort: { property: 'reportedDate', direction: 'desc' },
      availableActions: ['create-ncr', 'disposition-ncr']
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                   DEPLOYMENT CONFIG - 部署配置
  // ═══════════════════════════════════════════════════════════════════
  deployment: {
    requirements: {
      platform: ['Palantir Foundry', 'Custom Platform'],
      minVersion: '3.0',
      resources: {
        cpu: '8 cores',
        memory: '32GB',
        storage: '500GB'
      }
    },
    environmentVariables: [
      { name: 'ERP_SYSTEM_TYPE', description: 'ERP system type (SAP_ECC, SAP_S4, Oracle)', required: true },
      { name: 'ERP_CONNECTION_STRING', description: 'ERP connection parameters', required: true },
      { name: 'MES_OPCUA_ENDPOINT', description: 'MES OPC-UA endpoint URL', required: true },
      { name: 'IOT_PLATFORM', description: 'IoT platform type (azure, aws, osisoft)', required: false, default: 'azure' },
      { name: 'IOT_CONNECTION_STRING', description: 'IoT Hub connection string', required: true },
      { name: 'LIMS_API_ENDPOINT', description: 'LIMS API endpoint (if applicable)', required: false },
      { name: 'CMMS_API_ENDPOINT', description: 'CMMS API endpoint (if applicable)', required: false },
      { name: 'AI_MODEL_ENDPOINT', description: 'AI model serving endpoint', required: false, default: 'internal' },
      { name: 'TIMEZONE', description: 'Plant timezone', required: true, default: 'UTC' }
    ],
    dependencies: []
  },

  // ═══════════════════════════════════════════════════════════════════
  //                   DOCUMENTATION - 文档
  // ═══════════════════════════════════════════════════════════════════
  documentation: {
    quickStart: {
      en: `
# Manufacturing Operations Management Quick Start

## Overview
This archetype implements ISA-95 based Manufacturing Operations Management (MOM) covering:
- **Production Operations**: Work orders, scheduling, execution tracking
- **Quality Operations**: Testing, NCRs, SPC, traceability
- **Inventory Operations**: Material lots, warehousing, FIFO
- **Maintenance Operations**: Preventive, corrective, predictive maintenance

## Deployment Steps

### 1. Data Integration Setup (Week 1)
\`\`\`
1. Configure ERP connector (SAP/Oracle)
   - Map material master, production orders, batches
   - Set up bidirectional sync schedule

2. Configure MES connector (OPC-UA)
   - Connect to equipment status nodes
   - Set up real-time event subscriptions

3. Configure IoT connector
   - Connect sensor telemetry streams
   - Map device IDs to equipment
\`\`\`

### 2. Ontology Configuration (Week 2)
\`\`\`
1. Import object definitions
2. Configure field mappings for your ERP
3. Set up sync schedules and conflict resolution
4. Configure business rules and thresholds
\`\`\`

### 3. AI Model Deployment (Week 2-3)
\`\`\`
1. Deploy scheduling optimization model
2. Deploy predictive maintenance model
3. Deploy quality anomaly detection
4. Configure model endpoints and refresh schedules
\`\`\`

### 4. Dashboard & Workflow Setup (Week 3)
\`\`\`
1. Configure dashboards for each role
2. Set up workflow triggers and notifications
3. Configure alert thresholds
4. Test end-to-end workflows
\`\`\`

### 5. User Acceptance & Go-Live (Week 4)
\`\`\`
1. User training sessions
2. Parallel run with existing systems
3. Go-live with monitoring
4. Continuous improvement cycle
\`\`\`

## Key Performance Indicators
- OEE improvement: 5-15%
- Schedule adherence: 90%+
- Unplanned downtime reduction: 20-40%
- NCR processing time reduction: 50%+
`,
      cn: `
# 制造运营管理快速启动指南

## 概述
本原型基于 ISA-95 标准实现制造运营管理（MOM），覆盖：
- **生产运营**：工单、排程、执行跟踪
- **质量运营**：检验、不合格品、SPC、追溯
- **库存运营**：物料批次、仓储、先进先出
- **维护运营**：预防性、纠正性、预测性维护

## 部署步骤

### 1. 数据集成设置（第1周）
\`\`\`
1. 配置ERP连接器（SAP/Oracle）
   - 映射物料主数据、生产订单、批次
   - 设置双向同步计划

2. 配置MES连接器（OPC-UA）
   - 连接设备状态节点
   - 设置实时事件订阅

3. 配置IoT连接器
   - 连接传感器遥测流
   - 映射设备ID到设备对象
\`\`\`

### 2. 本体配置（第2周）
\`\`\`
1. 导入对象定义
2. 根据您的ERP配置字段映射
3. 设置同步计划和冲突解决
4. 配置业务规则和阈值
\`\`\`

### 3. AI模型部署（第2-3周）
\`\`\`
1. 部署排程优化模型
2. 部署预测性维护模型
3. 部署质量异常检测
4. 配置模型端点和刷新计划
\`\`\`

### 4. 仪表盘和工作流设置（第3周）
\`\`\`
1. 为每个角色配置仪表盘
2. 设置工作流触发器和通知
3. 配置告警阈值
4. 测试端到端工作流
\`\`\`

### 5. 用户验收和上线（第4周）
\`\`\`
1. 用户培训
2. 与现有系统并行运行
3. 上线并监控
4. 持续改进循环
\`\`\`

## 关键绩效指标
- OEE提升：5-15%
- 排程执行率：90%+
- 计划外停机减少：20-40%
- NCR处理时间减少：50%+
`
    },
    bestPractices: [
      'Start with a pilot area/line before plant-wide rollout',
      'Validate AI model predictions manually for first 2-4 weeks',
      'Establish data quality monitoring for sync pipelines',
      'Create feedback loops for continuous model improvement',
      'Align with ISA-95 naming conventions for easier integration',
      'Implement proper change management for workflow updates',
      'Monitor system performance and scale resources as needed'
    ]
  }
};
