/**
 * 零售业 - 智能库存管理案例
 * Retail - Smart Inventory Management Case
 */

import { OntologyCase } from '../../types/case';

export const retailInventoryCase: OntologyCase = {
  metadata: {
    id: 'retail-inventory',
    title: {
      en: 'Smart Inventory Management',
      cn: '智能库存管理'
    },
    description: {
      en: 'An AI-powered inventory management system for omnichannel retail, featuring demand forecasting, automated replenishment, and cross-channel inventory optimization.',
      cn: '面向全渠道零售的AI驱动库存管理系统，具备需求预测、自动补货和跨渠道库存优化功能。'
    },
    industry: 'retail',
    tags: ['inventory', 'supply-chain', 'ai-augmented', 'analytics'],
    difficulty: 'intermediate',
    estimatedTime: '40min',
    version: '1.0.0',
    createdAt: '2026-01-19',
    updatedAt: '2026-01-19'
  },

  scenario: {
    background: {
      en: 'A fashion retailer operates 200+ stores and an e-commerce platform. They struggle with inventory imbalances - some stores have excess stock while others face stockouts. Manual replenishment decisions lead to lost sales and high markdown rates.',
      cn: '一家时尚零售商运营200+门店和电商平台。他们面临库存不平衡的困扰 - 部分门店库存积压，而其他门店缺货。人工补货决策导致销售损失和高折扣率。'
    },
    challenges: {
      en: [
        '15% stockout rate on popular items causes lost sales',
        '20% of inventory ends up as markdowns',
        'No visibility into real-time inventory across channels',
        'Seasonal demand patterns are hard to predict'
      ],
      cn: [
        '畅销品15%的缺货率导致销售损失',
        '20%的库存最终被折扣处理',
        '缺乏跨渠道实时库存可见性',
        '季节性需求模式难以预测'
      ]
    },
    goals: {
      en: [
        'Reduce stockout rate to under 5%',
        'Decrease markdown inventory to 10%',
        'Enable same-day inventory visibility',
        'Automate 80% of replenishment decisions'
      ],
      cn: [
        '将缺货率降至5%以下',
        '将折扣库存降至10%',
        '实现当日库存可见性',
        '自动化80%的补货决策'
      ]
    },
    stakeholders: [
      {
        role: 'Inventory Manager',
        description: {
          en: 'Oversees inventory levels across all channels',
          cn: '监管所有渠道的库存水平'
        }
      },
      {
        role: 'Store Manager',
        description: {
          en: 'Manages individual store inventory and sales',
          cn: '管理单店库存和销售'
        }
      },
      {
        role: 'Demand Planner',
        description: {
          en: 'Forecasts demand and plans inventory allocation',
          cn: '预测需求并规划库存分配'
        }
      },
      {
        role: 'E-commerce Manager',
        description: {
          en: 'Manages online inventory and fulfillment',
          cn: '管理在线库存和履约'
        }
      }
    ]
  },

  ontology: {
    objects: [
      {
        id: 'product',
        name: 'Product',
        nameCn: '商品',
        description: 'A sellable product item',
        descriptionCn: '可销售的商品',
        properties: [
          { name: 'sku', type: 'string', description: 'Stock keeping unit' },
          { name: 'name', type: 'string', description: 'Product name' },
          { name: 'category', type: 'string', description: 'Product category' },
          { name: 'brand', type: 'string', description: 'Brand name' },
          { name: 'season', type: 'string', description: 'Season (Spring/Summer/Fall/Winter)' },
          { name: 'price', type: 'number', description: 'Retail price' },
          { name: 'cost', type: 'number', description: 'Unit cost' },
          { name: 'lifecycle', type: 'string', description: 'Product lifecycle stage' }
        ],
        primaryKey: 'sku',
        actions: [
          {
            name: 'Forecast Demand',
            nameCn: '预测需求',
            description: 'Predict future demand using AI',
            descriptionCn: '使用AI预测未来需求',
            aiCapability: 'predict',
            businessLayer: {
              description: 'Generate demand forecast considering seasonality, trends, promotions, and external factors',
              targetObject: 'Product',
              executorRole: 'Demand Planner',
              triggerCondition: 'Weekly planning cycle or ad-hoc request'
            },
            logicLayer: {
              preconditions: ['At least 12 months of sales history'],
              parameters: [
                { name: 'sku', type: 'string', required: true, description: 'Product SKU' },
                { name: 'forecastHorizon', type: 'number', required: true, description: 'Days to forecast' },
                { name: 'includePromotion', type: 'boolean', required: false, description: 'Factor in planned promotions' }
              ],
              postconditions: ['Demand forecast is generated', 'Confidence interval is provided']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/products/{sku}/forecast',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'forecast_product_demand',
                description: 'Forecast product demand using ML models trained on historical sales, seasonality, and external factors',
                parameters: {
                  type: 'object',
                  properties: {
                    sku: { type: 'string', description: 'Product SKU' },
                    forecastHorizon: { type: 'number', description: 'Days ahead to forecast' },
                    granularity: { type: 'string', enum: ['daily', 'weekly'], description: 'Forecast granularity' }
                  },
                  required: ['sku', 'forecastHorizon']
                }
              }
            },
            governance: {
              permissionTier: 4,
              requiresHumanApproval: false,
              auditLog: true
            }
          },
          {
            name: 'Recommend Markdown',
            nameCn: '推荐折扣',
            description: 'Suggest optimal markdown price',
            descriptionCn: '建议最优折扣价格',
            aiCapability: 'recommend',
            businessLayer: {
              description: 'Calculate optimal markdown price to clear excess inventory while maximizing revenue',
              targetObject: 'Product',
              executorRole: 'Inventory Manager',
              triggerCondition: 'End of season or slow-moving inventory identified'
            },
            logicLayer: {
              preconditions: ['Product has excess inventory', 'Not already at minimum price'],
              parameters: [
                { name: 'sku', type: 'string', required: true, description: 'Product SKU' },
                { name: 'targetSellThrough', type: 'number', required: false, description: 'Target sell-through rate' },
                { name: 'minMargin', type: 'number', required: false, description: 'Minimum acceptable margin' }
              ],
              postconditions: ['Markdown recommendation generated', 'Expected revenue impact calculated']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/products/{sku}/markdown-recommendation',
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
        id: 'store',
        name: 'Store',
        nameCn: '门店',
        description: 'A retail store location',
        descriptionCn: '零售门店位置',
        properties: [
          { name: 'storeId', type: 'string', description: 'Store identifier' },
          { name: 'name', type: 'string', description: 'Store name' },
          { name: 'region', type: 'string', description: 'Geographic region' },
          { name: 'format', type: 'string', description: 'Store format (flagship/standard/outlet)' },
          { name: 'capacity', type: 'number', description: 'Storage capacity units' },
          { name: 'status', type: 'string', description: 'Store status (open/closed/renovation)' }
        ],
        primaryKey: 'storeId',
        actions: [
          {
            name: 'Calculate Optimal Stock',
            nameCn: '计算最优库存',
            description: 'Calculate optimal stock level for each product',
            descriptionCn: '计算每个商品的最优库存水平',
            aiCapability: 'optimize',
            businessLayer: {
              description: 'Determine ideal inventory level balancing service level and holding cost',
              targetObject: 'Store',
              executorRole: 'Inventory Manager',
              triggerCondition: 'Planning cycle or product assortment change'
            },
            logicLayer: {
              preconditions: ['Demand forecast available'],
              parameters: [
                { name: 'storeId', type: 'string', required: true, description: 'Store ID' },
                { name: 'targetServiceLevel', type: 'number', required: false, description: 'Target service level (e.g., 0.95)' }
              ],
              postconditions: ['Optimal stock levels calculated', 'Reorder points updated']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/stores/{storeId}/optimal-stock',
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
        id: 'inventory',
        name: 'Inventory',
        nameCn: '库存',
        description: 'Inventory position at a specific location',
        descriptionCn: '特定位置的库存状态',
        properties: [
          { name: 'inventoryId', type: 'string', description: 'Inventory record ID' },
          { name: 'sku', type: 'string', description: 'Product SKU' },
          { name: 'locationId', type: 'string', description: 'Store or warehouse ID' },
          { name: 'locationType', type: 'string', description: 'Location type (store/warehouse/transit)' },
          { name: 'onHand', type: 'number', description: 'Physical quantity on hand' },
          { name: 'allocated', type: 'number', description: 'Allocated to orders' },
          { name: 'available', type: 'number', description: 'Available for sale' },
          { name: 'inTransit', type: 'number', description: 'In transit to location' },
          { name: 'reorderPoint', type: 'number', description: 'Reorder trigger level' },
          { name: 'lastUpdated', type: 'datetime', description: 'Last update timestamp' }
        ],
        primaryKey: 'inventoryId',
        actions: [
          {
            name: 'Trigger Replenishment',
            nameCn: '触发补货',
            description: 'Create replenishment order when below reorder point',
            descriptionCn: '当低于补货点时创建补货单',
            aiCapability: 'automate',
            businessLayer: {
              description: 'Automatically initiate replenishment when inventory falls below threshold',
              targetObject: 'Inventory',
              executorRole: 'System',
              triggerCondition: 'Available inventory < reorder point'
            },
            logicLayer: {
              preconditions: [
                'Available inventory is below reorder point',
                'Product is active',
                'Source location has available stock'
              ],
              parameters: [
                { name: 'inventoryId', type: 'string', required: true, description: 'Inventory record' },
                { name: 'quantity', type: 'number', required: false, description: 'Override quantity' }
              ],
              postconditions: [
                'Replenishment order created',
                'Source inventory allocated',
                'In-transit quantity updated'
              ],
              sideEffects: ['Notify store manager', 'Update dashboard']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/inventory/{inventoryId}/replenish',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'trigger_replenishment',
                description: 'Create a replenishment order for inventory below reorder point',
                parameters: {
                  type: 'object',
                  properties: {
                    inventoryId: { type: 'string' },
                    quantity: { type: 'number' },
                    priority: { type: 'string', enum: ['normal', 'urgent'] }
                  },
                  required: ['inventoryId']
                }
              }
            },
            governance: {
              permissionTier: 3,
              requiresHumanApproval: false,
              auditLog: true
            }
          },
          {
            name: 'Transfer Stock',
            nameCn: '调拨库存',
            description: 'Transfer stock between locations',
            descriptionCn: '在位置间调拨库存',
            businessLayer: {
              description: 'Move inventory from overstocked to understocked locations',
              targetObject: 'Inventory',
              executorRole: 'Inventory Manager',
              triggerCondition: 'Imbalance detected or manual request'
            },
            logicLayer: {
              preconditions: [
                'Source has sufficient available stock',
                'Transfer makes economic sense (benefit > cost)'
              ],
              parameters: [
                { name: 'sourceInventoryId', type: 'string', required: true, description: 'Source inventory' },
                { name: 'targetLocationId', type: 'string', required: true, description: 'Target location' },
                { name: 'quantity', type: 'number', required: true, description: 'Quantity to transfer' },
                { name: 'reason', type: 'string', required: false, description: 'Transfer reason' }
              ],
              postconditions: [
                'Source inventory reduced',
                'Transfer order created',
                'Target in-transit increased'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/inventory/transfer',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: true,
              auditLog: true,
              riskLevel: 'low'
            }
          },
          {
            name: 'Adjust Inventory',
            nameCn: '调整库存',
            description: 'Adjust inventory quantity (cycle count, damage, etc.)',
            descriptionCn: '调整库存数量（盘点、损坏等）',
            businessLayer: {
              description: 'Record inventory adjustments for accuracy',
              targetObject: 'Inventory',
              executorRole: 'Store Manager',
              triggerCondition: 'Cycle count or discrepancy found'
            },
            logicLayer: {
              preconditions: [],
              parameters: [
                { name: 'inventoryId', type: 'string', required: true, description: 'Inventory record' },
                { name: 'adjustmentQty', type: 'number', required: true, description: 'Adjustment amount (+/-)' },
                { name: 'reason', type: 'string', required: true, description: 'Adjustment reason code' },
                { name: 'notes', type: 'string', required: false, description: 'Additional notes' }
              ],
              postconditions: ['On-hand quantity updated', 'Adjustment recorded']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/inventory/{inventoryId}/adjust',
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
        id: 'replenishment-order',
        name: 'Replenishment Order',
        nameCn: '补货单',
        description: 'Order to move inventory from source to destination',
        descriptionCn: '从源位置向目标位置移动库存的订单',
        properties: [
          { name: 'orderId', type: 'string', description: 'Order ID' },
          { name: 'sku', type: 'string', description: 'Product SKU' },
          { name: 'sourceLocation', type: 'string', description: 'Source warehouse/store' },
          { name: 'targetLocation', type: 'string', description: 'Target store' },
          { name: 'quantity', type: 'number', description: 'Quantity ordered' },
          { name: 'status', type: 'string', description: 'Order status' },
          { name: 'createdAt', type: 'datetime', description: 'Creation time' },
          { name: 'expectedArrival', type: 'datetime', description: 'Expected arrival' },
          { name: 'actualArrival', type: 'datetime', description: 'Actual arrival' }
        ],
        primaryKey: 'orderId',
        actions: [
          {
            name: 'Ship Order',
            nameCn: '发运订单',
            description: 'Mark order as shipped',
            descriptionCn: '标记订单为已发运',
            businessLayer: {
              description: 'Record shipment of replenishment order',
              targetObject: 'Replenishment Order',
              executorRole: 'Warehouse Staff'
            },
            logicLayer: {
              preconditions: ['Order status is "pending"', 'Items picked and packed'],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: 'Order ID' },
                { name: 'trackingNumber', type: 'string', required: false, description: 'Carrier tracking number' }
              ],
              postconditions: ['Status changes to "shipped"', 'Source inventory decremented']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/replenishment-orders/{orderId}/ship',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 3,
              requiresHumanApproval: false,
              auditLog: true
            }
          },
          {
            name: 'Receive Order',
            nameCn: '接收订单',
            description: 'Mark order as received at destination',
            descriptionCn: '标记订单在目标地点已接收',
            businessLayer: {
              description: 'Confirm receipt and update target inventory',
              targetObject: 'Replenishment Order',
              executorRole: 'Store Staff'
            },
            logicLayer: {
              preconditions: ['Order status is "shipped"'],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: 'Order ID' },
                { name: 'receivedQty', type: 'number', required: true, description: 'Quantity received' },
                { name: 'condition', type: 'string', required: false, description: 'Goods condition' }
              ],
              postconditions: [
                'Status changes to "received"',
                'Target inventory incremented',
                'In-transit quantity cleared'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/replenishment-orders/{orderId}/receive',
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
        id: 'inventory-product',
        name: 'For Product',
        nameCn: '对应商品',
        sourceObject: 'inventory',
        targetObject: 'product',
        cardinality: 'many-to-one',
        description: 'Inventory records are for specific products'
      },
      {
        id: 'inventory-store',
        name: 'At Location',
        nameCn: '位于',
        sourceObject: 'inventory',
        targetObject: 'store',
        cardinality: 'many-to-one',
        description: 'Inventory is held at stores'
      },
      {
        id: 'replenishment-inventory',
        name: 'Replenishes',
        nameCn: '补充',
        sourceObject: 'replenishment-order',
        targetObject: 'inventory',
        cardinality: 'many-to-one',
        description: 'Replenishment orders replenish inventory'
      }
    ],
    integrations: [
      {
        id: 'pos-integration',
        name: 'POS System',
        nameCn: 'POS系统',
        type: 'inbound',
        sourceSystem: 'Store POS',
        frequency: 'real-time',
        syncedObjects: ['inventory'],
        description: 'Sales transactions update inventory'
      },
      {
        id: 'wms-integration',
        name: 'WMS System',
        nameCn: 'WMS系统',
        type: 'bidirectional',
        sourceSystem: 'Warehouse Management',
        frequency: 'real-time',
        syncedObjects: ['inventory', 'replenishment-order'],
        description: 'Warehouse inventory and fulfillment'
      },
      {
        id: 'ecom-integration',
        name: 'E-commerce Platform',
        nameCn: '电商平台',
        type: 'bidirectional',
        sourceSystem: 'Shopify/Magento',
        frequency: 'real-time',
        syncedObjects: ['inventory', 'product'],
        description: 'Online inventory and orders'
      }
    ]
  },

  highlights: [
    {
      title: {
        en: 'AI-Driven Demand Forecasting',
        cn: 'AI驱动的需求预测'
      },
      description: {
        en: 'The Forecast Demand action uses machine learning to predict product demand, considering seasonality, trends, promotions, and external factors like weather and events.',
        cn: 'Forecast Demand动作使用机器学习预测商品需求，考虑季节性、趋势、促销活动以及天气和事件等外部因素。'
      },
      relatedElements: ['product', 'Forecast Demand']
    },
    {
      title: {
        en: 'Automated Replenishment',
        cn: '自动补货'
      },
      description: {
        en: 'When inventory falls below the reorder point, the system automatically triggers replenishment from the nearest source with available stock, minimizing stockouts.',
        cn: '当库存低于补货点时，系统自动从最近的有货源触发补货，最大限度减少缺货。'
      },
      relatedElements: ['inventory', 'Trigger Replenishment']
    },
    {
      title: {
        en: 'Cross-Location Optimization',
        cn: '跨位置优化'
      },
      description: {
        en: 'The Transfer Stock action enables intelligent redistribution of inventory between locations to balance stock levels and meet local demand.',
        cn: 'Transfer Stock动作实现智能的跨位置库存再分配，以平衡库存水平并满足本地需求。'
      },
      relatedElements: ['inventory', 'Transfer Stock']
    }
  ],

  learningPoints: [
    {
      concept: {
        en: 'Event-Driven Actions',
        cn: '事件驱动的动作'
      },
      explanation: {
        en: 'The Trigger Replenishment action is automatically triggered when inventory falls below the reorder point - this is event-driven design where business rules drive automation.',
        cn: 'Trigger Replenishment动作在库存低于补货点时自动触发 - 这是事件驱动设计，业务规则驱动自动化。'
      }
    },
    {
      concept: {
        en: 'Inventory as State Machine',
        cn: '库存作为状态机'
      },
      explanation: {
        en: 'Replenishment orders go through states: pending → shipped → received. Each action moves the order to the next state with clear preconditions and postconditions.',
        cn: '补货单经历状态：pending → shipped → received。每个动作将订单移至下一状态，有明确的前置条件和后置状态。'
      }
    },
    {
      concept: {
        en: 'Multi-Channel Inventory View',
        cn: '多渠道库存视图'
      },
      explanation: {
        en: 'The Inventory object maintains separate quantities: onHand, allocated, available, inTransit. This enables accurate available-to-promise across channels.',
        cn: 'Inventory对象维护独立的数量字段：onHand、allocated、available、inTransit。这实现了跨渠道准确的可承诺库存。'
      }
    }
  ],

  relatedCases: ['manufacturing-production', 'logistics-delivery']
};

export default retailInventoryCase;
