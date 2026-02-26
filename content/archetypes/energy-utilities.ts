/**
 * 能源与公用事业 Archetype
 * Energy & Utilities Archetype
 *
 * 基于 Palantir 与 BP、PG&E 合作案例的能源行业原型
 * 覆盖：电网管理、野火预防、预测性维护、碳排放跟踪
 *
 * 参考来源：
 * - Palantir & PG&E Partnership (Smart Grid)
 * - Palantir & BP Partnership (Energy Optimization)
 * - Public Safety Power Shutoff (PSPS) Best Practices
 * - Palantir Vertex Digital Twin for Energy
 *
 * 适用行业：电力、天然气、可再生能源、公用事业
 * 部署周期：3-4 周（含数据对接和安全配置）
 */

import { Archetype } from '../../types/archetype';

export const energyUtilitiesArchetype: Archetype = {
  metadata: {
    id: 'energy-utilities',
    name: 'Energy & Utilities Operations',
    description: {
      en: 'Comprehensive energy and utilities management platform inspired by Palantir partnerships with BP and PG&E, covering grid operations, wildfire prevention, predictive maintenance, and carbon tracking with AI-powered risk assessment.',
      cn: '基于 Palantir 与 BP、PG&E 合作案例的综合能源与公用事业管理平台，覆盖电网运营、野火预防、预测性维护和碳排放跟踪，配备AI驱动的风险评估能力。'
    },
    industry: 'energy',
    domain: 'utilities-operations',
    version: '1.0.0',
    changelog: [
      {
        version: '1.0.0',
        date: '2026-02-06',
        changes: [
          'Initial archetype based on Palantir energy solutions',
          'PG&E-inspired grid modeling and PSPS',
          'BP-inspired asset optimization',
          'Wildfire risk assessment module',
          'Carbon footprint tracking'
        ]
      }
    ],
    origin: {
      sourceEngagement: 'PG&E, BP, European Utilities',
      fdeContributors: ['Energy Solutions Team', 'Infrastructure Analytics Group'],
      abstractionDate: '2026-02-06'
    },
    usage: {
      deployments: 22,
      industries: ['Electric Utilities', 'Gas Utilities', 'Renewable Energy', 'Oil & Gas'],
      avgDeploymentTime: '3.5 weeks'
    }
  },

  ontology: {
    objects: [
      // ============= 电网资产 (Grid Assets) =============
      {
        id: 'power-line',
        name: 'Power Line',
        nameCn: '电力线路',
        description: 'Transmission or distribution power line segment with risk attributes',
        descriptionCn: '具有风险属性的输配电线路段',
        properties: [
          { name: 'lineId', type: 'string', description: 'Unique line segment identifier' },
          { name: 'lineType', type: 'string', description: 'Transmission/Distribution' },
          { name: 'voltage', type: 'number', description: 'Voltage level in kV' },
          { name: 'length', type: 'number', description: 'Segment length in miles' },
          { name: 'material', type: 'string', description: 'Conductor material' },
          { name: 'installDate', type: 'date', description: 'Installation date' },
          { name: 'lastInspection', type: 'date', description: 'Last inspection date' },
          { name: 'condition', type: 'string', description: 'Good/Fair/Poor/Critical' },
          { name: 'vegetationClearance', type: 'number', description: 'Vegetation clearance in feet' },
          { name: 'terrainType', type: 'string', description: 'Urban/Rural/Mountainous/Forest' },
          { name: 'isUnderground', type: 'boolean', description: 'Underground or overhead' },
          { name: 'customersServed', type: 'number', description: 'Number of downstream customers' },
          // AI-derived
          {
            name: 'wildfireRiskScore',
            type: 'number',
            description: 'AI-calculated wildfire ignition risk 0-100',
            isAIDerived: true,
            logicDescription: 'ML model combining weather, vegetation, equipment age, and historical incidents'
          },
          {
            name: 'failureProbability',
            type: 'number',
            description: 'Predicted failure probability in next 30 days',
            isAIDerived: true,
            logicDescription: 'Predictive maintenance model based on age, load, and condition data'
          },
          {
            name: 'undergroundingPriority',
            type: 'number',
            description: 'Priority score for undergrounding project',
            isAIDerived: true,
            logicDescription: 'Composite score considering risk, cost, and customer impact'
          }
        ],
        primaryKey: 'lineId',
        actions: [
          {
            name: 'Schedule Inspection',
            nameCn: '安排检查',
            type: 'traditional',
            description: 'Schedule field inspection for power line',
            businessLayer: {
              description: '安排电力线路现场检查',
              targetObject: 'Power Line',
              executorRole: 'Grid Operations Manager',
              triggerCondition: '定期检查周期或风险评分超阈值'
            },
            logicLayer: {
              preconditions: ['线路存在于系统中', '有可用检查人员'],
              parameters: [
                { name: 'lineId', type: 'string', required: true, description: '线路ID' },
                { name: 'inspectionType', type: 'string', required: true, description: '检查类型' },
                { name: 'priority', type: 'string', required: true, description: '优先级' },
                { name: 'scheduledDate', type: 'date', required: true, description: '计划日期' }
              ],
              postconditions: ['检查任务已创建', '人员已分配'],
              sideEffects: ['通知检查团队', '更新检查计划表']
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Initiate Undergrounding',
            nameCn: '启动地埋化',
            type: 'traditional',
            description: 'Initiate project to underground at-risk power line',
            businessLayer: {
              description: '启动高风险电力线路地埋化项目',
              targetObject: 'Power Line',
              executorRole: 'Infrastructure Director',
              triggerCondition: '地埋化优先级评分达到阈值'
            },
            logicLayer: {
              preconditions: ['风险评分>80', '预算已批准', '许可证已获得'],
              parameters: [
                { name: 'lineId', type: 'string', required: true, description: '线路ID' },
                { name: 'projectScope', type: 'string', required: true, description: '项目范围' },
                { name: 'budget', type: 'number', required: true, description: '预算' },
                { name: 'timeline', type: 'string', required: true, description: '时间线' }
              ],
              postconditions: ['项目已创建', '资源已分配'],
              sideEffects: ['通知工程团队', '更新资本计划']
            },
            governance: { permissionTier: 4, requiresHumanApproval: true, auditLog: true, riskLevel: 'high' }
          }
        ],
        aiFeatures: [
          {
            type: 'Smart Property (LLM Derived)',
            description: 'AI-calculated wildfire risk and failure probability'
          }
        ]
      },

      // ============= PSPS 事件 (Public Safety Power Shutoff) =============
      {
        id: 'psps-event',
        name: 'PSPS Event',
        nameCn: 'PSPS 事件',
        description: 'Public Safety Power Shutoff event for wildfire risk mitigation',
        descriptionCn: '用于野火风险缓解的公共安全停电事件',
        properties: [
          { name: 'eventId', type: 'string', description: 'Unique event identifier' },
          { name: 'eventName', type: 'string', description: 'Event designation' },
          { name: 'status', type: 'string', description: 'Planning/Warning/Active/Restored' },
          { name: 'startTime', type: 'timestamp', description: 'Planned/actual start time' },
          { name: 'endTime', type: 'timestamp', description: 'Planned/actual end time' },
          { name: 'affectedCircuits', type: 'array', description: 'List of affected circuit IDs' },
          { name: 'affectedCustomers', type: 'number', description: 'Number of affected customers' },
          { name: 'weatherConditions', type: 'object', description: 'Triggering weather conditions' },
          { name: 'fireWeatherWatch', type: 'boolean', description: 'Fire weather watch in effect' },
          { name: 'redFlagWarning', type: 'boolean', description: 'Red flag warning in effect' },
          // AI-derived
          {
            name: 'scopeRecommendation',
            type: 'object',
            description: 'AI-recommended circuits to de-energize',
            isAIDerived: true,
            logicDescription: 'Optimization balancing risk reduction vs customer impact'
          },
          {
            name: 'durationEstimate',
            type: 'number',
            description: 'AI-estimated event duration in hours',
            isAIDerived: true,
            logicDescription: 'Based on weather forecast and historical restoration times'
          }
        ],
        primaryKey: 'eventId',
        actions: [
          {
            name: 'Declare PSPS',
            nameCn: '宣布 PSPS',
            type: 'traditional',
            description: 'Officially declare PSPS event and begin notifications',
            businessLayer: {
              description: '正式宣布 PSPS 事件并开始通知',
              targetObject: 'PSPS Event',
              executorRole: 'Emergency Operations Director',
              triggerCondition: '天气条件超过安全阈值'
            },
            logicLayer: {
              preconditions: ['风险评估已完成', '通知系统就绪'],
              parameters: [
                { name: 'eventId', type: 'string', required: true, description: '事件ID' },
                { name: 'plannedStart', type: 'timestamp', required: true, description: '计划开始时间' },
                { name: 'affectedCircuits', type: 'array', required: true, description: '受影响电路' }
              ],
              postconditions: ['状态更新为Warning', '72小时通知已发送'],
              sideEffects: ['触发客户通知', '通知应急服务', '更新公共门户']
            },
            governance: { permissionTier: 4, requiresHumanApproval: true, auditLog: true, riskLevel: 'high' }
          },
          {
            name: 'De-energize Circuits',
            nameCn: '断开电路',
            type: 'traditional',
            description: 'Execute circuit de-energization',
            businessLayer: {
              description: '执行电路断开操作',
              targetObject: 'PSPS Event',
              executorRole: 'Grid Control Operator',
              triggerCondition: 'PSPS 事件进入 Active 阶段'
            },
            logicLayer: {
              preconditions: ['事件状态为Warning', '所有通知已发送', '现场准备完成'],
              parameters: [
                { name: 'eventId', type: 'string', required: true, description: '事件ID' },
                { name: 'circuits', type: 'array', required: true, description: '要断开的电路' },
                { name: 'operatorConfirmation', type: 'boolean', required: true, description: '操作员确认' }
              ],
              postconditions: ['电路已断开', '状态更新为Active'],
              sideEffects: ['实时状态更新', '通知现场人员']
            },
            governance: { permissionTier: 4, requiresHumanApproval: true, auditLog: true, riskLevel: 'high' }
          },
          {
            name: 'Restore Power',
            nameCn: '恢复供电',
            type: 'traditional',
            description: 'Restore power after PSPS event conditions clear',
            businessLayer: {
              description: 'PSPS 事件条件解除后恢复供电',
              targetObject: 'PSPS Event',
              executorRole: 'Grid Control Operator',
              triggerCondition: '天气条件恢复安全'
            },
            logicLayer: {
              preconditions: ['天气条件安全', '线路巡检完成'],
              parameters: [
                { name: 'eventId', type: 'string', required: true, description: '事件ID' },
                { name: 'circuits', type: 'array', required: true, description: '要恢复的电路' },
                { name: 'patrolComplete', type: 'boolean', required: true, description: '巡检完成确认' }
              ],
              postconditions: ['电路已恢复', '状态更新为Restored'],
              sideEffects: ['客户通知', '事件报告生成']
            },
            governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          {
            type: 'Smart Property (LLM Derived)',
            description: 'AI-optimized PSPS scope recommendation'
          },
          {
            type: 'Generative Action (AI Output)',
            description: 'AI-generated customer impact analysis and communication'
          }
        ]
      },

      // ============= 能源资产 (Energy Assets) =============
      {
        id: 'energy-asset',
        name: 'Energy Asset',
        nameCn: '能源资产',
        description: 'Generation or storage asset (wind farm, solar array, battery, substation)',
        descriptionCn: '发电或储能资产（风电场、光伏阵列、电池、变电站）',
        properties: [
          { name: 'assetId', type: 'string', description: 'Unique asset identifier' },
          { name: 'assetName', type: 'string', description: 'Asset name' },
          { name: 'assetType', type: 'string', description: 'Wind/Solar/Battery/Gas/Substation' },
          { name: 'location', type: 'object', description: 'Geographic location' },
          { name: 'capacity', type: 'number', description: 'Rated capacity in MW' },
          { name: 'currentOutput', type: 'number', description: 'Current output in MW' },
          { name: 'status', type: 'string', description: 'Operating/Maintenance/Offline' },
          { name: 'efficiency', type: 'number', description: 'Current efficiency percentage' },
          { name: 'installDate', type: 'date', description: 'Commission date' },
          { name: 'lastMaintenance', type: 'date', description: 'Last maintenance date' },
          { name: 'carbonIntensity', type: 'number', description: 'CO2 per MWh' },
          // AI-derived
          {
            name: 'outputForecast24h',
            type: 'array',
            description: 'Hourly output forecast for next 24 hours',
            isAIDerived: true,
            logicDescription: 'Weather-based generation forecast model'
          },
          {
            name: 'maintenancePrediction',
            type: 'object',
            description: 'Predicted maintenance needs',
            isAIDerived: true,
            logicDescription: 'Predictive maintenance model based on sensor data and usage patterns'
          },
          {
            name: 'optimalDispatch',
            type: 'number',
            description: 'AI-recommended dispatch level',
            isAIDerived: true,
            logicDescription: 'Optimization considering demand, price, and carbon footprint'
          }
        ],
        primaryKey: 'assetId',
        actions: [
          {
            name: 'Adjust Output',
            nameCn: '调整输出',
            type: 'traditional',
            description: 'Adjust asset output level',
            businessLayer: {
              description: '调整资产输出水平',
              targetObject: 'Energy Asset',
              executorRole: 'Grid Operator',
              triggerCondition: '需求变化或调度指令'
            },
            logicLayer: {
              preconditions: ['资产处于运行状态', '在可调范围内'],
              parameters: [
                { name: 'assetId', type: 'string', required: true, description: '资产ID' },
                { name: 'targetOutput', type: 'number', required: true, description: '目标输出MW' },
                { name: 'rampRate', type: 'number', required: false, description: '调节速率' }
              ],
              postconditions: ['输出已调整', '状态已记录'],
              sideEffects: ['更新电网平衡', '记录碳排放']
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          },
          {
            name: 'Schedule Maintenance',
            nameCn: '安排维护',
            type: 'traditional',
            description: 'Schedule preventive or corrective maintenance',
            businessLayer: {
              description: '安排预防性或纠正性维护',
              targetObject: 'Energy Asset',
              executorRole: 'Maintenance Planner',
              triggerCondition: 'AI 预测维护需求或定期计划'
            },
            logicLayer: {
              preconditions: ['维护窗口可用', '备件就绪'],
              parameters: [
                { name: 'assetId', type: 'string', required: true, description: '资产ID' },
                { name: 'maintenanceType', type: 'string', required: true, description: '维护类型' },
                { name: 'scheduledDate', type: 'date', required: true, description: '计划日期' },
                { name: 'estimatedDuration', type: 'number', required: true, description: '预计时长' }
              ],
              postconditions: ['维护工单已创建', '资产已标记'],
              sideEffects: ['通知维护团队', '更新发电计划']
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          {
            type: 'Smart Property (LLM Derived)',
            description: 'AI-powered generation forecasting and maintenance prediction'
          }
        ]
      },

      // ============= 碳排放跟踪 (Carbon Tracking) =============
      {
        id: 'carbon-record',
        name: 'Carbon Record',
        nameCn: '碳排放记录',
        description: 'Carbon emission tracking record for regulatory compliance',
        descriptionCn: '用于监管合规的碳排放跟踪记录',
        properties: [
          { name: 'recordId', type: 'string', description: 'Unique record identifier' },
          { name: 'period', type: 'string', description: 'Reporting period' },
          { name: 'scope', type: 'string', description: 'Scope 1/2/3 emissions' },
          { name: 'source', type: 'string', description: 'Emission source' },
          { name: 'emissionsTonnes', type: 'number', description: 'CO2e in metric tonnes' },
          { name: 'methodology', type: 'string', description: 'Calculation methodology' },
          { name: 'verificationStatus', type: 'string', description: 'Verified/Pending/Draft' },
          { name: 'offsetCredits', type: 'number', description: 'Applied offset credits' },
          { name: 'netEmissions', type: 'number', description: 'Net emissions after offsets' }
        ],
        primaryKey: 'recordId',
        actions: [
          {
            name: 'Generate Report',
            nameCn: '生成报告',
            type: 'generative',
            description: 'AI-generate carbon emissions report for regulatory submission',
            aiLogic: 'Aggregate emission data across sources and generate formatted report',
            businessLayer: {
              description: 'AI 聚合各来源排放数据并生成格式化报告',
              targetObject: 'Carbon Record',
              executorRole: 'Sustainability Manager',
              triggerCondition: '报告周期结束'
            },
            logicLayer: {
              preconditions: ['数据收集完成', '计算已验证'],
              parameters: [
                { name: 'period', type: 'string', required: true, description: '报告期间' },
                { name: 'reportFormat', type: 'string', required: true, description: '报告格式' }
              ],
              postconditions: ['报告已生成', '待审核'],
              sideEffects: ['通知审核团队']
            },
            governance: { permissionTier: 2, requiresHumanApproval: true, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          {
            type: 'Generative Action (AI Output)',
            description: 'AI-generated sustainability reports and reduction recommendations'
          }
        ]
      }
    ],

    links: [
      {
        id: 'line-psps',
        source: 'power-line',
        target: 'psps-event',
        label: 'affected_by',
        isSemantic: true
      },
      {
        id: 'asset-line',
        source: 'energy-asset',
        target: 'power-line',
        label: 'connects_to',
        isSemantic: true
      },
      {
        id: 'asset-carbon',
        source: 'energy-asset',
        target: 'carbon-record',
        label: 'contributes_to',
        isSemantic: true
      }
    ]
  },

  connectors: [
    {
      id: 'scada-grid',
      name: 'SCADA Grid Control',
      description: { en: 'Real-time grid telemetry and control data', cn: 'SCADA 实时电网遥测和控制数据' },
      sourceType: 'streaming',
      sourceSystem: 'SCADA / Grid Control',
      connectionTemplate: {
        requiredFields: [
          { name: 'endpoint', type: 'string', description: 'SCADA endpoint' },
          { name: 'credentials', type: 'secret', description: 'Authentication' }
        ]
      },
      sync: { direction: 'bidirectional', frequency: 'streaming', incrementalSync: true },
      mappedObjects: [
        { objectId: 'power-line', sourceEntity: 'LineStatus', fieldMappings: [] },
        { objectId: 'energy-asset', sourceEntity: 'AssetTelemetry', fieldMappings: [] }
      ]
    },
    {
      id: 'weather-api',
      name: 'Weather Service',
      description: { en: 'Weather forecasts and fire weather alerts', cn: '天气预报和火灾天气警报' },
      sourceType: 'api',
      sourceSystem: 'Weather Service API',
      connectionTemplate: {
        requiredFields: [
          { name: 'apiUrl', type: 'string', description: 'Weather API URL' },
          { name: 'apiKey', type: 'secret', description: 'API key' }
        ]
      },
      sync: { direction: 'inbound', frequency: 'hourly', incrementalSync: true },
      mappedObjects: [
        { objectId: 'psps-event', sourceEntity: 'WeatherForecast', fieldMappings: [] }
      ]
    },
    {
      id: 'gis-assets',
      name: 'GIS Asset Registry',
      description: { en: 'Geospatial asset and infrastructure data', cn: 'GIS 资产和基础设施数据' },
      sourceType: 'database',
      sourceSystem: 'GIS / Asset Registry',
      connectionTemplate: {
        requiredFields: [
          { name: 'host', type: 'string', description: 'Database host' },
          { name: 'database', type: 'string', description: 'Database name' },
          { name: 'credentials', type: 'secret', description: 'Database credentials' }
        ]
      },
      sync: { direction: 'inbound', frequency: 'daily', incrementalSync: true },
      mappedObjects: [
        { objectId: 'power-line', sourceEntity: 'AssetRecord', fieldMappings: [] },
        { objectId: 'energy-asset', sourceEntity: 'AssetRecord', fieldMappings: [] }
      ]
    }
  ],

  workflows: [
    {
      id: 'psps-response',
      name: 'PSPS Response Workflow',
      description: { en: 'Public Safety Power Shutoff response workflow', cn: '公共安全停电响应流程' },
      trigger: { type: 'event', config: { eventType: 'fire_weather_alert' } },
      steps: [
        { id: 'assess', name: 'Risk Assessment', description: { en: 'Assess wildfire risk', cn: '评估野火风险' }, type: 'action', nextSteps: ['scope'] },
        { id: 'scope', name: 'Determine Scope', description: { en: 'AI-optimize PSPS scope', cn: 'AI优化PSPS范围' }, type: 'action', nextSteps: ['notify'] },
        { id: 'notify', name: 'Customer Notification', description: { en: 'Notify affected customers', cn: '通知受影响客户' }, type: 'notification', nextSteps: ['execute'] },
        { id: 'execute', name: 'Execute PSPS', description: { en: 'De-energize circuits', cn: '断开电路' }, type: 'action' }
      ],
      entryStep: 'assess',
      roles: ['Grid Operator', 'Safety Manager', 'Customer Service'],
      sla: { maxDuration: '4h', escalationPath: ['Operations Manager', 'VP Operations'] }
    }
  ],

  rules: [
    {
      id: 'high-risk-alert',
      name: 'High Wildfire Risk Alert',
      description: { en: 'Alert on high wildfire risk conditions', cn: '高野火风险条件告警' },
      type: 'trigger',
      appliesTo: ['power-line'],
      expression: 'wildfireRisk > 0.8'
    }
  ],

  aiCapabilities: [
    {
      id: 'wildfire-prediction',
      name: 'Wildfire Risk Prediction',
      type: 'prediction',
      description: { en: 'Real-time wildfire ignition risk calculation', cn: '实时野火点燃风险计算' },
      enabledActions: ['AI Risk Assessment'],
      modelConfig: { modelType: 'risk-model', trainingDataRequirements: 'Historical fire incidents and weather data' }
    },
    {
      id: 'psps-optimization',
      name: 'PSPS Scope Optimization',
      type: 'optimization',
      description: { en: 'Optimize PSPS scope to minimize customer impact', cn: '优化PSPS范围以最小化客户影响' },
      enabledActions: ['AI Optimize PSPS'],
      modelConfig: { modelType: 'optimization-model', trainingDataRequirements: 'Historical PSPS events and outcomes' }
    },
    {
      id: 'generation-forecast',
      name: 'Renewable Generation Forecast',
      type: 'prediction',
      description: { en: 'Weather-based generation forecasting', cn: '基于天气的发电预测' },
      enabledActions: ['AI Generation Forecast'],
      modelConfig: { modelType: 'forecast-model', trainingDataRequirements: 'Historical generation and weather data' }
    }
  ],

  dashboards: [
    {
      id: 'grid-operations',
      name: 'Grid Operations Dashboard',
      description: { en: 'Real-time grid operations monitoring', cn: '实时电网运营监控' },
      targetRole: 'Grid Operator',
      gridColumns: 12,
      gridRows: 8,
      widgets: [
        { id: 'grid-map', type: 'map', title: { en: 'Grid Map', cn: '电网地图' }, dataSource: { objectId: 'power-line' }, layout: { x: 0, y: 0, width: 8, height: 6 } },
        { id: 'risk-alerts', type: 'list', title: { en: 'High Risk Lines', cn: '高风险线路' }, dataSource: { objectId: 'power-line', query: 'wildfireRisk > 0.7' }, layout: { x: 8, y: 0, width: 4, height: 3 } },
        { id: 'psps-events', type: 'list', title: { en: 'Active PSPS', cn: '活跃PSPS事件' }, dataSource: { objectId: 'psps-event' }, layout: { x: 8, y: 3, width: 4, height: 3 } }
      ]
    }
  ],

  views: [
    {
      id: 'power-line-list',
      name: 'Power Lines',
      type: 'list',
      objectId: 'power-line',
      fields: [
        { property: 'lineId', label: { en: 'Line ID', cn: '线路ID' }, visible: true, sortable: true },
        { property: 'voltage', label: { en: 'Voltage', cn: '电压' }, visible: true, filterable: true },
        { property: 'wildfireRisk', label: { en: 'Risk', cn: '风险' }, visible: true, sortable: true },
        { property: 'status', label: { en: 'Status', cn: '状态' }, visible: true, filterable: true }
      ],
      defaultSort: { property: 'wildfireRisk', direction: 'desc' }
    }
  ],

  deployment: {
    requirements: {
      platform: ['DataPlatform', 'AgentFramework'],
      minVersion: '2.0.0',
      resources: { cpu: '8 cores', memory: '32GB', storage: '500GB' }
    },
    environmentVariables: [
      { name: 'SCADA_ENDPOINT', description: 'SCADA system endpoint', required: true },
      { name: 'WEATHER_API_KEY', description: 'Weather service API key', required: true },
      { name: 'GIS_DATABASE_URL', description: 'GIS database connection URL', required: true }
    ]
  },

  documentation: {
    quickStart: {
      en: '1. Connect to SCADA system\\n2. Configure weather data feed\\n3. Import GIS asset data\\n4. Enable wildfire risk models\\n5. Configure PSPS thresholds',
      cn: '1. 连接SCADA系统\\n2. 配置天气数据源\\n3. 导入GIS资产数据\\n4. 启用野火风险模型\\n5. 配置PSPS阈值'
    },
    bestPractices: [
      'Enable real-time monitoring for high-risk areas',
      'Use AI-optimized PSPS to minimize customer impact',
      'Integrate weather forecasts for proactive risk management'
    ]
  }
};
