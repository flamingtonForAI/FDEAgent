/**
 * 零售全渠道运营 Archetype
 * Retail Omnichannel Operations Archetype
 *
 * 基于行业最佳实践的全渠道零售运营原型
 * 覆盖：库存管理、订单履约、门店运营、顾客体验、供应链协同
 *
 * 参考来源：
 * - NIST Supply Chain Reference Ontology (SCRO)
 * - GS1 Global Standards for Retail
 * - Industry Retail Best Practices
 * - NRF (National Retail Federation) Guidelines
 *
 * 适用行业：零售、快消品、时尚服装、电商
 * 部署周期：2-3 周（含数据对接和配置）
 */

import { Archetype } from '../../types/archetype';

export const retailOmnichannelArchetype: Archetype = {
  metadata: {
    id: 'retail-omnichannel',
    name: 'Retail Omnichannel Operations',
    description: {
      en: 'Comprehensive omnichannel retail operations management covering unified inventory, order fulfillment, store operations, customer experience, and supply chain collaboration with AI-powered demand sensing and dynamic pricing.',
      cn: '全面的全渠道零售运营管理方案，覆盖统一库存、订单履约、门店运营、顾客体验和供应链协同，配备AI驱动的需求感知和动态定价能力。'
    },
    industry: 'retail',
    domain: 'omnichannel-operations',
    version: '2.0.0',
    changelog: [
      {
        version: '2.0.0',
        date: '2026-01-26',
        changes: [
          'Unified inventory visibility across all channels',
          'BOPIS/BORIS fulfillment workflows',
          'AI-powered demand sensing and allocation',
          'Dynamic pricing engine integration',
          'Customer 360 with journey analytics'
        ]
      }
    ],
    origin: {
      sourceEngagement: 'Leading Omnichannel Retailers',
      fdeContributors: ['Retail Excellence Team', 'Supply Chain Analytics Group'],
      abstractionDate: '2025-11-15'
    },
    usage: {
      deployments: 38,
      industries: ['Fashion Retail', 'Grocery', 'Consumer Electronics', 'Home Improvement', 'Pharmacy'],
      avgDeploymentTime: '2.5 weeks'
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  //                    SEMANTIC LAYER - 语义层
  //           零售全渠道业务概念模型
  // ═══════════════════════════════════════════════════════════════════
  ontology: {
    objects: [
      // ============= 商品主数据 (Product Master Data) =============
      {
        id: 'product',
        name: 'Product',
        nameCn: '商品',
        description: 'A sellable item with SKU-level attributes, pricing, and category hierarchy',
        descriptionCn: '具有SKU级别属性、定价和品类层级的可销售商品',
        properties: [
          { name: 'productId', type: 'string', description: 'Unique product identifier (SKU)' },
          { name: 'gtin', type: 'string', description: 'Global Trade Item Number (EAN/UPC)' },
          { name: 'productName', type: 'string', description: 'Product display name' },
          { name: 'description', type: 'string', description: 'Product description' },
          { name: 'brand', type: 'string', description: 'Brand name' },
          { name: 'categoryPath', type: 'array', description: 'Category hierarchy path' },
          { name: 'attributes', type: 'object', description: 'Product attributes (size, color, etc.)' },
          { name: 'basePrice', type: 'number', description: 'Base retail price' },
          { name: 'costPrice', type: 'number', description: 'Cost/purchase price' },
          { name: 'status', type: 'string', description: 'Active/Discontinued/Seasonal' },
          { name: 'lifecycle', type: 'string', description: 'New/Growth/Mature/Decline' },
          { name: 'replenishmentType', type: 'string', description: 'Continuous/Seasonal/One-time' },
          { name: 'minOrderQuantity', type: 'number', description: 'Minimum order quantity' },
          { name: 'leadTimeDays', type: 'number', description: 'Supplier lead time in days' },
          // AI-derived
          {
            name: 'demandForecast7d',
            type: 'number',
            description: '7-day demand forecast units',
            isAIDerived: true,
            logicDescription: 'ML model considering seasonality, promotions, weather, and trends'
          },
          {
            name: 'priceElasticity',
            type: 'number',
            description: 'Estimated price elasticity of demand',
            isAIDerived: true,
            logicDescription: 'Calculated from historical price-quantity relationships'
          },
          {
            name: 'recommendedPrice',
            type: 'number',
            description: 'AI-recommended optimal price',
            isAIDerived: true,
            logicDescription: 'Dynamic pricing based on demand, competition, and inventory'
          }
        ],
        primaryKey: 'productId',
        actions: [
          {
            name: 'Update Price',
            nameCn: '更新价格',
            type: 'traditional',
            description: 'Update product retail price',
            descriptionCn: '更新商品零售价格',
            businessLayer: {
              description: '根据定价策略更新商品价格',
              targetObject: 'Product',
              executorRole: 'Category Manager',
              triggerCondition: '定价策略变更或竞争对手价格变动'
            },
            logicLayer: {
              preconditions: ['商品状态为Active', '价格变动在授权范围内'],
              parameters: [
                { name: 'productId', type: 'string', required: true, description: '商品ID' },
                { name: 'newPrice', type: 'number', required: true, description: '新价格' },
                { name: 'effectiveDate', type: 'date', required: true, description: '生效日期' },
                { name: 'reason', type: 'string', required: false, description: '变更原因' }
              ],
              postconditions: ['价格已更新', '价格历史已记录'],
              sideEffects: ['同步到所有销售渠道', '更新促销计算']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/products/{productId}/price',
              apiMethod: 'PUT',
              agentToolSpec: {
                name: 'update_product_price',
                description: 'Update the retail price of a product',
                parameters: {
                  type: 'object',
                  properties: {
                    productId: { type: 'string' },
                    newPrice: { type: 'number' },
                    effectiveDate: { type: 'string', format: 'date' },
                    reason: { type: 'string' }
                  },
                  required: ['productId', 'newPrice', 'effectiveDate']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Demand forecasting and dynamic pricing recommendations' }
        ]
      },

      // ============= 库存模型 (Inventory Model) =============
      {
        id: 'location',
        name: 'Location',
        nameCn: '位置',
        description: 'A physical or virtual location that holds inventory (store, warehouse, DC)',
        descriptionCn: '持有库存的物理或虚拟位置（门店、仓库、配送中心）',
        properties: [
          { name: 'locationId', type: 'string', description: 'Unique location identifier' },
          { name: 'locationName', type: 'string', description: 'Location display name' },
          { name: 'locationType', type: 'string', description: 'Store/Warehouse/DC/Virtual' },
          { name: 'address', type: 'object', description: 'Physical address' },
          { name: 'geoCoordinates', type: 'object', description: 'Latitude/Longitude' },
          { name: 'region', type: 'string', description: 'Geographic region' },
          { name: 'timezone', type: 'string', description: 'Local timezone' },
          { name: 'operatingHours', type: 'object', description: 'Operating hours by day' },
          { name: 'fulfillmentCapabilities', type: 'array', description: 'Ship-from-store, BOPIS, etc.' },
          { name: 'storageCapacity', type: 'number', description: 'Total storage capacity' },
          { name: 'status', type: 'string', description: 'Open/Closed/Renovation' }
        ],
        primaryKey: 'locationId',
        actions: []
      },
      {
        id: 'inventory-position',
        name: 'Inventory Position',
        nameCn: '库存位置',
        description: 'Real-time inventory position for a product at a location',
        descriptionCn: '商品在特定位置的实时库存状态',
        properties: [
          { name: 'inventoryId', type: 'string', description: 'Composite key: productId + locationId' },
          { name: 'productId', type: 'string', description: 'Product reference' },
          { name: 'locationId', type: 'string', description: 'Location reference' },
          { name: 'onHandQty', type: 'number', description: 'Physical on-hand quantity' },
          { name: 'allocatedQty', type: 'number', description: 'Allocated to orders' },
          { name: 'reservedQty', type: 'number', description: 'Reserved (cart, wishlist)' },
          { name: 'inTransitQty', type: 'number', description: 'In transit to this location' },
          { name: 'availableToPromise', type: 'number', description: 'ATP = OnHand - Allocated - Reserved + InTransit' },
          { name: 'safetyStock', type: 'number', description: 'Safety stock level' },
          { name: 'reorderPoint', type: 'number', description: 'Reorder trigger point' },
          { name: 'maxStock', type: 'number', description: 'Maximum stock level' },
          { name: 'lastCountDate', type: 'date', description: 'Last physical count date' },
          { name: 'lastSaleDate', type: 'date', description: 'Last sale date' },
          // AI-derived
          {
            name: 'daysOfSupply',
            type: 'number',
            description: 'Estimated days of supply based on demand forecast',
            isAIDerived: true,
            logicDescription: 'ATP / predicted daily demand rate'
          },
          {
            name: 'stockoutRisk',
            type: 'number',
            description: 'Probability of stockout in next 7 days',
            isAIDerived: true,
            logicDescription: 'ML model considering demand variability and supply reliability'
          },
          {
            name: 'recommendedReorderQty',
            type: 'number',
            description: 'AI-recommended reorder quantity',
            isAIDerived: true,
            logicDescription: 'Economic order quantity with demand sensing adjustments'
          }
        ],
        primaryKey: 'inventoryId',
        actions: [
          {
            name: 'Adjust Inventory',
            nameCn: '调整库存',
            type: 'traditional',
            description: 'Adjust inventory quantity due to count, damage, or shrinkage',
            descriptionCn: '因盘点、损坏或损耗调整库存数量',
            businessLayer: {
              description: '记录库存调整并更新系统数量',
              targetObject: 'Inventory Position',
              executorRole: 'Store Manager / Inventory Clerk',
              triggerCondition: '盘点差异、损坏报告或损耗发现'
            },
            logicLayer: {
              preconditions: ['调整数量合理', '调整原因已说明'],
              parameters: [
                { name: 'inventoryId', type: 'string', required: true, description: '库存ID' },
                { name: 'adjustmentQty', type: 'number', required: true, description: '调整数量(正/负)' },
                { name: 'reason', type: 'string', required: true, description: '调整原因' },
                { name: 'referenceDoc', type: 'string', required: false, description: '参考文档' }
              ],
              postconditions: ['库存数量已更新', '调整记录已创建'],
              sideEffects: ['更新ATP', '触发补货检查']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/inventory/{inventoryId}/adjust',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'adjust_inventory',
                description: 'Adjust inventory quantity for a product at a location',
                parameters: {
                  type: 'object',
                  properties: {
                    inventoryId: { type: 'string' },
                    adjustmentQty: { type: 'number' },
                    reason: { type: 'string' },
                    referenceDoc: { type: 'string' }
                  },
                  required: ['inventoryId', 'adjustmentQty', 'reason']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Transfer Inventory',
            nameCn: '转移库存',
            type: 'traditional',
            description: 'Transfer inventory between locations',
            descriptionCn: '在位置之间转移库存',
            businessLayer: {
              description: '创建库存转移单并执行转移',
              targetObject: 'Inventory Position',
              executorRole: 'Inventory Planner',
              triggerCondition: '库存不平衡或补货需求'
            },
            logicLayer: {
              preconditions: ['源位置有足够库存', '目标位置有接收能力'],
              parameters: [
                { name: 'productId', type: 'string', required: true, description: '商品ID' },
                { name: 'fromLocationId', type: 'string', required: true, description: '源位置ID' },
                { name: 'toLocationId', type: 'string', required: true, description: '目标位置ID' },
                { name: 'quantity', type: 'number', required: true, description: '转移数量' },
                { name: 'priority', type: 'string', required: false, description: '优先级' }
              ],
              postconditions: ['转移单已创建', '源位置库存已预留', '目标位置在途增加'],
              sideEffects: ['通知物流团队', '更新两地ATP']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/inventory/transfer',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'transfer_inventory',
                description: 'Transfer inventory from one location to another',
                parameters: {
                  type: 'object',
                  properties: {
                    productId: { type: 'string' },
                    fromLocationId: { type: 'string' },
                    toLocationId: { type: 'string' },
                    quantity: { type: 'number' },
                    priority: { type: 'string', enum: ['normal', 'urgent'] }
                  },
                  required: ['productId', 'fromLocationId', 'toLocationId', 'quantity']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Stockout risk prediction and reorder recommendations' }
        ]
      },

      // ============= 订单模型 (Order Model) =============
      {
        id: 'customer',
        name: 'Customer',
        nameCn: '顾客',
        description: 'A customer with profile, preferences, and purchase history',
        descriptionCn: '包含档案、偏好和购买历史的顾客',
        properties: [
          { name: 'customerId', type: 'string', description: 'Unique customer identifier' },
          { name: 'email', type: 'string', description: 'Email address' },
          { name: 'phone', type: 'string', description: 'Phone number' },
          { name: 'firstName', type: 'string', description: 'First name' },
          { name: 'lastName', type: 'string', description: 'Last name' },
          { name: 'loyaltyTier', type: 'string', description: 'Loyalty program tier' },
          { name: 'loyaltyPoints', type: 'number', description: 'Current loyalty points' },
          { name: 'preferredChannel', type: 'string', description: 'Online/Store/Mobile' },
          { name: 'preferredStore', type: 'string', description: 'Preferred store location' },
          { name: 'communicationPrefs', type: 'object', description: 'Communication preferences' },
          { name: 'addresses', type: 'array', description: 'Saved addresses' },
          { name: 'paymentMethods', type: 'array', description: 'Saved payment methods' },
          { name: 'firstPurchaseDate', type: 'date', description: 'First purchase date' },
          { name: 'lastPurchaseDate', type: 'date', description: 'Most recent purchase date' },
          { name: 'totalSpend', type: 'number', description: 'Lifetime total spend' },
          { name: 'orderCount', type: 'number', description: 'Total order count' },
          // AI-derived
          {
            name: 'customerSegment',
            type: 'string',
            description: 'AI-derived customer segment',
            isAIDerived: true,
            logicDescription: 'Clustering based on RFM, preferences, and behavior patterns'
          },
          {
            name: 'churnRisk',
            type: 'number',
            description: 'Probability of churn in next 90 days',
            isAIDerived: true,
            logicDescription: 'ML model based on engagement decline and purchase patterns'
          },
          {
            name: 'nextPurchaseCategory',
            type: 'string',
            description: 'Predicted next purchase category',
            isAIDerived: true,
            logicDescription: 'Recommendation model based on purchase history and similar customers'
          },
          {
            name: 'lifetimeValuePrediction',
            type: 'number',
            description: 'Predicted customer lifetime value',
            isAIDerived: true,
            logicDescription: 'CLV model considering retention probability and purchase patterns'
          }
        ],
        primaryKey: 'customerId',
        actions: [
          {
            name: 'Update Loyalty Tier',
            nameCn: '更新会员等级',
            type: 'automated',
            description: 'Automatically update customer loyalty tier based on spend',
            descriptionCn: '根据消费额自动更新顾客会员等级',
            businessLayer: {
              description: '当消费额达到阈值时自动升级会员等级',
              targetObject: 'Customer',
              executorRole: 'System',
              triggerCondition: '累计消费额达到升级阈值'
            },
            logicLayer: {
              preconditions: ['消费额已验证', '顾客账户有效'],
              parameters: [
                { name: 'customerId', type: 'string', required: true, description: '顾客ID' },
                { name: 'newTier', type: 'string', required: true, description: '新等级' }
              ],
              postconditions: ['等级已更新', '相应权益已激活'],
              sideEffects: ['发送恭喜通知', '更新权益配置']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/customers/{customerId}/loyalty/tier',
              apiMethod: 'PUT',
              agentToolSpec: {
                name: 'update_customer_loyalty_tier',
                description: 'Update customer loyalty tier',
                parameters: {
                  type: 'object',
                  properties: {
                    customerId: { type: 'string' },
                    newTier: { type: 'string', enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] }
                  },
                  required: ['customerId', 'newTier']
                }
              }
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Customer segmentation, churn prediction, and CLV estimation' }
        ]
      },
      {
        id: 'order',
        name: 'Order',
        nameCn: '订单',
        description: 'A customer order with line items and fulfillment details',
        descriptionCn: '包含行项目和履约详情的顾客订单',
        properties: [
          { name: 'orderId', type: 'string', description: 'Unique order identifier' },
          { name: 'customerId', type: 'string', description: 'Customer reference' },
          { name: 'orderDate', type: 'datetime', description: 'Order placement date/time' },
          { name: 'channel', type: 'string', description: 'Order channel (Web/Mobile/Store/Call)' },
          { name: 'status', type: 'string', description: 'Placed/Confirmed/Processing/Shipped/Delivered/Cancelled' },
          { name: 'lineItems', type: 'array', description: 'Order line items' },
          { name: 'subtotal', type: 'number', description: 'Subtotal before discounts/tax' },
          { name: 'discountAmount', type: 'number', description: 'Total discount amount' },
          { name: 'taxAmount', type: 'number', description: 'Tax amount' },
          { name: 'shippingAmount', type: 'number', description: 'Shipping charges' },
          { name: 'totalAmount', type: 'number', description: 'Order total' },
          { name: 'paymentStatus', type: 'string', description: 'Pending/Authorized/Captured/Refunded' },
          { name: 'fulfillmentType', type: 'string', description: 'Ship-to-Home/BOPIS/Curbside/SameDay' },
          { name: 'fulfillmentLocationId', type: 'string', description: 'Fulfillment location' },
          { name: 'shippingAddress', type: 'object', description: 'Delivery address' },
          { name: 'promisedDeliveryDate', type: 'date', description: 'Promised delivery date' },
          { name: 'actualDeliveryDate', type: 'date', description: 'Actual delivery date' },
          // AI-derived
          {
            name: 'fraudRiskScore',
            type: 'number',
            description: 'Fraud risk score (0-100)',
            isAIDerived: true,
            logicDescription: 'ML model analyzing transaction patterns, device, location, and history'
          },
          {
            name: 'deliveryRiskFlag',
            type: 'boolean',
            description: 'Flag for potential delivery issues',
            isAIDerived: true,
            logicDescription: 'Prediction based on address quality, carrier performance, weather'
          }
        ],
        primaryKey: 'orderId',
        actions: [
          {
            name: 'Cancel Order',
            nameCn: '取消订单',
            type: 'traditional',
            description: 'Cancel an order and release inventory',
            descriptionCn: '取消订单并释放库存',
            businessLayer: {
              description: '取消订单并处理退款和库存释放',
              targetObject: 'Order',
              executorRole: 'Customer Service / Customer',
              triggerCondition: '顾客请求或系统检测到问题'
            },
            logicLayer: {
              preconditions: ['订单状态允许取消', '未开始发货'],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: '订单ID' },
                { name: 'reason', type: 'string', required: true, description: '取消原因' },
                { name: 'initiatedBy', type: 'string', required: true, description: '发起人' }
              ],
              postconditions: ['订单状态更新为Cancelled', '库存已释放', '退款已发起'],
              sideEffects: ['发送取消确认邮件', '更新顾客历史']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/orders/{orderId}/cancel',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'cancel_order',
                description: 'Cancel a customer order',
                parameters: {
                  type: 'object',
                  properties: {
                    orderId: { type: 'string' },
                    reason: { type: 'string' },
                    initiatedBy: { type: 'string', enum: ['customer', 'system', 'agent'] }
                  },
                  required: ['orderId', 'reason', 'initiatedBy']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          },
          {
            name: 'Route Order for Fulfillment',
            nameCn: '路由订单履约',
            type: 'ai-assisted',
            description: 'AI-assisted routing of order to optimal fulfillment location',
            descriptionCn: 'AI辅助将订单路由到最优履约位置',
            businessLayer: {
              description: '使用AI算法选择最佳履约位置，考虑库存、成本和时效',
              targetObject: 'Order',
              executorRole: 'Order Management System',
              triggerCondition: '新订单确认或履约位置需要重新路由'
            },
            logicLayer: {
              preconditions: ['订单已确认', '至少一个位置有库存'],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: '订单ID' },
                { name: 'constraints', type: 'object', required: false, description: '路由约束条件' }
              ],
              postconditions: ['履约位置已分配', '库存已分配'],
              sideEffects: ['更新库存分配', '通知履约位置']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/orders/{orderId}/route',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'route_order_fulfillment',
                description: 'Route order to optimal fulfillment location using AI',
                parameters: {
                  type: 'object',
                  properties: {
                    orderId: { type: 'string' },
                    constraints: {
                      type: 'object',
                      properties: {
                        preferStorePickup: { type: 'boolean' },
                        maxDeliveryDays: { type: 'number' },
                        costPriority: { type: 'string', enum: ['lowest', 'balanced', 'fastest'] }
                      }
                    }
                  },
                  required: ['orderId']
                }
              }
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Fraud detection and delivery risk prediction' },
          { type: 'AI-Assisted Action', description: 'Intelligent order routing optimization' }
        ]
      },

      // ============= 促销模型 (Promotion Model) =============
      {
        id: 'promotion',
        name: 'Promotion',
        nameCn: '促销',
        description: 'A promotional offer with rules, eligibility, and redemption tracking',
        descriptionCn: '包含规则、资格条件和兑换跟踪的促销活动',
        properties: [
          { name: 'promotionId', type: 'string', description: 'Unique promotion identifier' },
          { name: 'promotionName', type: 'string', description: 'Promotion display name' },
          { name: 'description', type: 'string', description: 'Promotion description' },
          { name: 'promotionType', type: 'string', description: 'Percentage/Fixed/BOGO/Bundle/FreeShipping' },
          { name: 'discountValue', type: 'number', description: 'Discount value (amount or percentage)' },
          { name: 'startDate', type: 'datetime', description: 'Promotion start date/time' },
          { name: 'endDate', type: 'datetime', description: 'Promotion end date/time' },
          { name: 'eligibleProducts', type: 'array', description: 'Eligible product IDs or categories' },
          { name: 'eligibleCustomers', type: 'array', description: 'Eligible customer segments or IDs' },
          { name: 'eligibleChannels', type: 'array', description: 'Eligible sales channels' },
          { name: 'minimumPurchase', type: 'number', description: 'Minimum purchase amount' },
          { name: 'maximumDiscount', type: 'number', description: 'Maximum discount cap' },
          { name: 'redemptionLimit', type: 'number', description: 'Total redemption limit' },
          { name: 'redemptionCount', type: 'number', description: 'Current redemption count' },
          { name: 'status', type: 'string', description: 'Draft/Active/Paused/Expired' },
          { name: 'stackable', type: 'boolean', description: 'Can combine with other promotions' },
          // AI-derived
          {
            name: 'predictedUplift',
            type: 'number',
            description: 'Predicted sales uplift percentage',
            isAIDerived: true,
            logicDescription: 'ML model based on similar past promotions and market conditions'
          },
          {
            name: 'cannibalizationRisk',
            type: 'number',
            description: 'Risk of cannibalizing full-price sales',
            isAIDerived: true,
            logicDescription: 'Analysis of customer purchase patterns and price sensitivity'
          }
        ],
        primaryKey: 'promotionId',
        actions: [
          {
            name: 'Activate Promotion',
            nameCn: '激活促销',
            type: 'traditional',
            description: 'Activate a promotion to make it available',
            descriptionCn: '激活促销使其可用',
            businessLayer: {
              description: '将促销状态从Draft改为Active',
              targetObject: 'Promotion',
              executorRole: 'Marketing Manager',
              triggerCondition: '促销审批通过且到达开始时间'
            },
            logicLayer: {
              preconditions: ['促销配置完整', '库存充足'],
              parameters: [
                { name: 'promotionId', type: 'string', required: true, description: '促销ID' }
              ],
              postconditions: ['促销状态为Active', '可在所有渠道使用'],
              sideEffects: ['同步到POS系统', '更新网站显示']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/promotions/{promotionId}/activate',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'activate_promotion',
                description: 'Activate a promotion',
                parameters: {
                  type: 'object',
                  properties: {
                    promotionId: { type: 'string' }
                  },
                  required: ['promotionId']
                }
              }
            },
            governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Promotion effectiveness prediction' }
        ]
      },

      // ============= 供应商模型 (Supplier Model) =============
      {
        id: 'supplier',
        name: 'Supplier',
        nameCn: '供应商',
        description: 'A supplier/vendor with performance metrics and agreements',
        descriptionCn: '包含绩效指标和协议的供应商',
        properties: [
          { name: 'supplierId', type: 'string', description: 'Unique supplier identifier' },
          { name: 'supplierName', type: 'string', description: 'Supplier name' },
          { name: 'contactInfo', type: 'object', description: 'Contact information' },
          { name: 'categories', type: 'array', description: 'Product categories supplied' },
          { name: 'leadTimeDays', type: 'number', description: 'Standard lead time in days' },
          { name: 'minimumOrderValue', type: 'number', description: 'Minimum order value' },
          { name: 'paymentTerms', type: 'string', description: 'Payment terms' },
          { name: 'status', type: 'string', description: 'Active/Probation/Suspended' },
          { name: 'onTimeDeliveryRate', type: 'number', description: 'On-time delivery percentage' },
          { name: 'qualityScore', type: 'number', description: 'Quality score (0-100)' },
          { name: 'fillRate', type: 'number', description: 'Order fill rate percentage' },
          // AI-derived
          {
            name: 'riskScore',
            type: 'number',
            description: 'Supplier risk score',
            isAIDerived: true,
            logicDescription: 'ML model analyzing financial health, performance trends, and market factors'
          },
          {
            name: 'predictedLeadTime',
            type: 'number',
            description: 'Predicted actual lead time based on current conditions',
            isAIDerived: true,
            logicDescription: 'Prediction based on recent performance and known disruptions'
          }
        ],
        primaryKey: 'supplierId',
        actions: []
      },
      {
        id: 'purchase-order',
        name: 'Purchase Order',
        nameCn: '采购订单',
        description: 'A purchase order to supplier for inventory replenishment',
        descriptionCn: '向供应商采购库存补货的采购订单',
        properties: [
          { name: 'poNumber', type: 'string', description: 'Purchase order number' },
          { name: 'supplierId', type: 'string', description: 'Supplier reference' },
          { name: 'orderDate', type: 'date', description: 'Order date' },
          { name: 'expectedDeliveryDate', type: 'date', description: 'Expected delivery date' },
          { name: 'status', type: 'string', description: 'Draft/Submitted/Confirmed/Shipped/Received/Closed' },
          { name: 'lineItems', type: 'array', description: 'Order line items' },
          { name: 'totalAmount', type: 'number', description: 'Total order amount' },
          { name: 'deliveryLocationId', type: 'string', description: 'Delivery location' },
          { name: 'receivedQty', type: 'number', description: 'Total quantity received' },
          { name: 'receivedDate', type: 'date', description: 'Actual receipt date' }
        ],
        primaryKey: 'poNumber',
        actions: [
          {
            name: 'Submit Purchase Order',
            nameCn: '提交采购订单',
            type: 'traditional',
            description: 'Submit PO to supplier',
            descriptionCn: '向供应商提交采购订单',
            businessLayer: {
              description: '将采购订单提交给供应商',
              targetObject: 'Purchase Order',
              executorRole: 'Procurement Specialist',
              triggerCondition: '采购订单准备完成'
            },
            logicLayer: {
              preconditions: ['订单内容完整', '预算已批准'],
              parameters: [
                { name: 'poNumber', type: 'string', required: true, description: '采购订单号' }
              ],
              postconditions: ['订单已发送', '状态更新为Submitted'],
              sideEffects: ['发送EDI/邮件给供应商', '更新预算使用']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/purchase-orders/{poNumber}/submit',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'submit_purchase_order',
                description: 'Submit purchase order to supplier',
                parameters: {
                  type: 'object',
                  properties: {
                    poNumber: { type: 'string' }
                  },
                  required: ['poNumber']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          },
          {
            name: 'Receive Shipment',
            nameCn: '接收发货',
            type: 'traditional',
            description: 'Record receipt of shipment against PO',
            descriptionCn: '记录针对采购订单的发货接收',
            businessLayer: {
              description: '记录实际收货数量并更新库存',
              targetObject: 'Purchase Order',
              executorRole: 'Warehouse Clerk',
              triggerCondition: '供应商发货到达'
            },
            logicLayer: {
              preconditions: ['采购订单存在且状态正确', '收货数量已核实'],
              parameters: [
                { name: 'poNumber', type: 'string', required: true, description: '采购订单号' },
                { name: 'receivedItems', type: 'array', required: true, description: '收货明细' }
              ],
              postconditions: ['库存已更新', '收货记录已创建'],
              sideEffects: ['触发质检流程', '更新应付账款']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/purchase-orders/{poNumber}/receive',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'receive_po_shipment',
                description: 'Record receipt of shipment for purchase order',
                parameters: {
                  type: 'object',
                  properties: {
                    poNumber: { type: 'string' },
                    receivedItems: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          productId: { type: 'string' },
                          quantity: { type: 'number' },
                          condition: { type: 'string' }
                        }
                      }
                    }
                  },
                  required: ['poNumber', 'receivedItems']
                }
              }
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ]
      },

      // ============= 门店运营模型 (Store Operations Model) =============
      {
        id: 'store-task',
        name: 'Store Task',
        nameCn: '门店任务',
        description: 'An operational task for store associates',
        descriptionCn: '门店员工的运营任务',
        properties: [
          { name: 'taskId', type: 'string', description: 'Unique task identifier' },
          { name: 'locationId', type: 'string', description: 'Store location' },
          { name: 'taskType', type: 'string', description: 'Replenishment/Markdown/Display/Pickup/Return' },
          { name: 'priority', type: 'string', description: 'High/Medium/Low' },
          { name: 'status', type: 'string', description: 'Pending/InProgress/Completed/Cancelled' },
          { name: 'assignedTo', type: 'string', description: 'Assigned associate' },
          { name: 'dueTime', type: 'datetime', description: 'Due date/time' },
          { name: 'completedTime', type: 'datetime', description: 'Completion time' },
          { name: 'details', type: 'object', description: 'Task-specific details' },
          // AI-derived
          {
            name: 'estimatedDuration',
            type: 'number',
            description: 'Estimated task duration in minutes',
            isAIDerived: true,
            logicDescription: 'Based on task type, quantity, and historical completion times'
          }
        ],
        primaryKey: 'taskId',
        actions: [
          {
            name: 'Complete Task',
            nameCn: '完成任务',
            type: 'traditional',
            description: 'Mark store task as completed',
            descriptionCn: '将门店任务标记为已完成',
            businessLayer: {
              description: '标记任务完成并记录结果',
              targetObject: 'Store Task',
              executorRole: 'Store Associate',
              triggerCondition: '任务已执行完成'
            },
            logicLayer: {
              preconditions: ['任务状态为InProgress', '执行者是分配的员工'],
              parameters: [
                { name: 'taskId', type: 'string', required: true, description: '任务ID' },
                { name: 'notes', type: 'string', required: false, description: '完成备注' }
              ],
              postconditions: ['任务状态为Completed', '完成时间已记录'],
              sideEffects: ['更新员工任务计数', '触发后续任务']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/store-tasks/{taskId}/complete',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'complete_store_task',
                description: 'Mark a store task as completed',
                parameters: {
                  type: 'object',
                  properties: {
                    taskId: { type: 'string' },
                    notes: { type: 'string' }
                  },
                  required: ['taskId']
                }
              }
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ]
      }
    ],

    // ============= 关系定义 (Relationships) =============
    // 使用标准字段: id, source, target, label (符合 OntologyLink 类型定义)
    links: [
      { id: 'link-product-inventory', source: 'product', target: 'inventory-position', label: 'has inventory at' },
      { id: 'link-location-inventory', source: 'location', target: 'inventory-position', label: 'holds' },
      { id: 'link-customer-order', source: 'customer', target: 'order', label: 'places' },
      { id: 'link-order-product', source: 'order', target: 'product', label: 'contains' },
      { id: 'link-order-location', source: 'order', target: 'location', label: 'fulfilled by' },
      { id: 'link-promotion-product', source: 'promotion', target: 'product', label: 'applies to' },
      { id: 'link-supplier-product', source: 'supplier', target: 'product', label: 'supplies' },
      { id: 'link-po-supplier', source: 'purchase-order', target: 'supplier', label: 'sent to' },
      { id: 'link-po-product', source: 'purchase-order', target: 'product', label: 'orders' },
      { id: 'link-task-location', source: 'store-task', target: 'location', label: 'at' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  //                    KINETIC LAYER - 动态层
  //           数据连接器配置（POS、ERP、电商平台）
  // ═══════════════════════════════════════════════════════════════════
  connectors: [
    {
      id: 'pos-system',
      name: 'POS System Connector',
      sourceType: 'pos',
      targetObjects: ['order', 'customer', 'inventory-position'],
      syncFrequency: 'real-time',
      configuration: {
        connectionType: 'API',
        supportedSystems: ['Oracle Retail', 'NCR', 'Square', 'Shopify POS'],
        dataFormat: 'JSON',
        authMethod: 'OAuth2'
      },
      fieldMapping: [
        { source: 'transaction_id', target: 'order.orderId', transformation: 'prefix("POS-")' },
        { source: 'customer_email', target: 'customer.email', transformation: 'lowercase()' },
        { source: 'items[].sku', target: 'order.lineItems[].productId', transformation: 'none' },
        { source: 'store_id', target: 'order.fulfillmentLocationId', transformation: 'none' }
      ]
    },
    {
      id: 'ecommerce-platform',
      name: 'E-commerce Platform Connector',
      sourceType: 'ecommerce',
      targetObjects: ['order', 'customer', 'product'],
      syncFrequency: 'real-time',
      configuration: {
        connectionType: 'Webhook + API',
        supportedSystems: ['Shopify', 'Magento', 'Salesforce Commerce Cloud', 'BigCommerce'],
        dataFormat: 'JSON',
        authMethod: 'API Key + Webhook Signature'
      },
      fieldMapping: [
        { source: 'order_number', target: 'order.orderId', transformation: 'prefix("WEB-")' },
        { source: 'customer.id', target: 'customer.customerId', transformation: 'none' },
        { source: 'line_items', target: 'order.lineItems', transformation: 'standardize_line_items()' }
      ]
    },
    {
      id: 'erp-system',
      name: 'ERP System Connector (SAP/Oracle)',
      sourceType: 'erp',
      targetObjects: ['product', 'supplier', 'purchase-order', 'inventory-position'],
      syncFrequency: 'hourly',
      configuration: {
        connectionType: 'RFC/BAPI or REST',
        supportedSystems: ['SAP S/4HANA', 'Oracle EBS', 'Microsoft Dynamics'],
        dataFormat: 'IDOC/JSON',
        authMethod: 'Service Account'
      },
      fieldMapping: [
        { source: 'MATNR', target: 'product.productId', transformation: 'remove_leading_zeros()' },
        { source: 'LIFNR', target: 'supplier.supplierId', transformation: 'none' },
        { source: 'EBELN', target: 'purchase-order.poNumber', transformation: 'none' }
      ]
    },
    {
      id: 'wms-system',
      name: 'Warehouse Management System Connector',
      sourceType: 'wms',
      targetObjects: ['inventory-position', 'location', 'purchase-order'],
      syncFrequency: 'real-time',
      configuration: {
        connectionType: 'API',
        supportedSystems: ['Manhattan WMS', 'Blue Yonder', 'SAP EWM'],
        dataFormat: 'JSON/XML',
        authMethod: 'OAuth2'
      },
      fieldMapping: [
        { source: 'item_id', target: 'inventory-position.productId', transformation: 'none' },
        { source: 'location_id', target: 'inventory-position.locationId', transformation: 'none' },
        { source: 'quantity_on_hand', target: 'inventory-position.onHandQty', transformation: 'to_integer()' }
      ]
    },
    {
      id: 'loyalty-platform',
      name: 'Loyalty Platform Connector',
      sourceType: 'loyalty',
      targetObjects: ['customer'],
      syncFrequency: 'near-real-time',
      configuration: {
        connectionType: 'API',
        supportedSystems: ['Salesforce Loyalty', 'Oracle CrowdTwist', 'Annex Cloud'],
        dataFormat: 'JSON',
        authMethod: 'OAuth2'
      },
      fieldMapping: [
        { source: 'member_id', target: 'customer.customerId', transformation: 'none' },
        { source: 'tier', target: 'customer.loyaltyTier', transformation: 'none' },
        { source: 'points_balance', target: 'customer.loyaltyPoints', transformation: 'to_integer()' }
      ]
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                    DYNAMIC LAYER - 动态层
  //           业务流程和规则
  // ═══════════════════════════════════════════════════════════════════
  workflows: [
    {
      id: 'order-fulfillment-workflow',
      name: 'Omnichannel Order Fulfillment',
      nameCn: '全渠道订单履约流程',
      description: 'End-to-end order fulfillment workflow supporting all fulfillment methods',
      descriptionCn: '支持所有履约方式的端到端订单履约流程',
      triggerType: 'event',
      triggerCondition: 'New order placed',
      steps: [
        { order: 1, name: 'Fraud Check', action: 'AI fraud scoring', condition: 'Always', nextOnSuccess: 2, nextOnFailure: 'Hold for Review' },
        { order: 2, name: 'Inventory Check', action: 'Verify ATP at eligible locations', condition: 'Fraud score < 70', nextOnSuccess: 3, nextOnFailure: 'Backorder' },
        { order: 3, name: 'Optimal Routing', action: 'AI-powered fulfillment location selection', condition: 'Inventory available', nextOnSuccess: 4, nextOnFailure: 'Manual Assignment' },
        { order: 4, name: 'Allocate Inventory', action: 'Reserve inventory at selected location', condition: 'Location selected', nextOnSuccess: 5, nextOnFailure: 'Retry Routing' },
        { order: 5, name: 'Generate Pick List', action: 'Create picking instructions', condition: 'Inventory allocated', nextOnSuccess: 6, nextOnFailure: null },
        { order: 6, name: 'Notify Location', action: 'Send fulfillment notification', condition: 'Pick list ready', nextOnSuccess: 7, nextOnFailure: null },
        { order: 7, name: 'Track Fulfillment', action: 'Monitor fulfillment progress', condition: 'Notification sent', nextOnSuccess: 'Complete', nextOnFailure: 'Escalate' }
      ],
      sla: { targetTime: '4 hours', escalationTime: '6 hours' }
    },
    {
      id: 'bopis-workflow',
      name: 'Buy Online Pick Up In Store (BOPIS)',
      nameCn: '线上购买门店取货流程',
      description: 'Workflow for BOPIS orders from placement to customer pickup',
      descriptionCn: '从下单到顾客取货的BOPIS订单流程',
      triggerType: 'event',
      triggerCondition: 'Order placed with BOPIS fulfillment',
      steps: [
        { order: 1, name: 'Verify Store Inventory', action: 'Check selected store ATP', condition: 'Always', nextOnSuccess: 2, nextOnFailure: 'Suggest Alternatives' },
        { order: 2, name: 'Reserve Inventory', action: 'Create store reservation', condition: 'ATP > 0', nextOnSuccess: 3, nextOnFailure: null },
        { order: 3, name: 'Create Pickup Task', action: 'Generate store task for picking', condition: 'Inventory reserved', nextOnSuccess: 4, nextOnFailure: null },
        { order: 4, name: 'Pick and Stage', action: 'Store associate picks items', condition: 'Task created', nextOnSuccess: 5, nextOnFailure: 'Escalate' },
        { order: 5, name: 'Send Ready Notification', action: 'Notify customer order is ready', condition: 'Items staged', nextOnSuccess: 6, nextOnFailure: null },
        { order: 6, name: 'Customer Pickup', action: 'Complete handoff to customer', condition: 'Customer arrives', nextOnSuccess: 'Complete', nextOnFailure: 'Return to Stock' }
      ],
      sla: { targetTime: '2 hours', escalationTime: '4 hours' }
    },
    {
      id: 'replenishment-workflow',
      name: 'Demand-Driven Replenishment',
      nameCn: '需求驱动补货流程',
      description: 'AI-powered inventory replenishment workflow',
      descriptionCn: 'AI驱动的库存补货流程',
      triggerType: 'schedule',
      triggerCondition: 'Daily at 6 AM or when stockout risk > 80%',
      steps: [
        { order: 1, name: 'Demand Sensing', action: 'Generate demand forecasts', condition: 'Always', nextOnSuccess: 2, nextOnFailure: 'Use Historical Average' },
        { order: 2, name: 'Calculate Requirements', action: 'Determine replenishment needs', condition: 'Forecasts ready', nextOnSuccess: 3, nextOnFailure: null },
        { order: 3, name: 'Optimize Allocation', action: 'AI allocation across locations', condition: 'Requirements calculated', nextOnSuccess: 4, nextOnFailure: 'Manual Review' },
        { order: 4, name: 'Generate POs', action: 'Create purchase orders for suppliers', condition: 'Allocation optimized', nextOnSuccess: 5, nextOnFailure: null },
        { order: 5, name: 'Generate Transfers', action: 'Create inter-location transfers', condition: 'POs created', nextOnSuccess: 6, nextOnFailure: null },
        { order: 6, name: 'Submit Orders', action: 'Send POs to suppliers', condition: 'Transfers created', nextOnSuccess: 'Complete', nextOnFailure: 'Hold for Approval' }
      ],
      sla: { targetTime: '30 minutes', escalationTime: '2 hours' }
    },
    {
      id: 'markdown-optimization-workflow',
      name: 'AI Markdown Optimization',
      nameCn: 'AI降价优化流程',
      description: 'AI-driven markdown optimization for aging inventory',
      descriptionCn: 'AI驱动的老库存降价优化流程',
      triggerType: 'schedule',
      triggerCondition: 'Weekly on Monday',
      steps: [
        { order: 1, name: 'Identify Candidates', action: 'Find slow-moving inventory', condition: 'Always', nextOnSuccess: 2, nextOnFailure: null },
        { order: 2, name: 'Calculate Optimal Price', action: 'AI pricing for sell-through', condition: 'Candidates identified', nextOnSuccess: 3, nextOnFailure: 'Use Standard Rules' },
        { order: 3, name: 'Margin Validation', action: 'Ensure minimum margin', condition: 'Prices calculated', nextOnSuccess: 4, nextOnFailure: 'Adjust Price' },
        { order: 4, name: 'Generate Recommendations', action: 'Create markdown proposals', condition: 'Margins validated', nextOnSuccess: 5, nextOnFailure: null },
        { order: 5, name: 'Manager Review', action: 'Human approval of markdowns', condition: 'Proposals ready', nextOnSuccess: 6, nextOnFailure: 'Revise' },
        { order: 6, name: 'Execute Markdowns', action: 'Apply approved price changes', condition: 'Approved', nextOnSuccess: 'Complete', nextOnFailure: null }
      ],
      sla: { targetTime: '4 hours', escalationTime: '24 hours' }
    }
  ],

  businessRules: [
    {
      id: 'br-inventory-allocation',
      name: 'Inventory Allocation Priority',
      category: 'inventory',
      condition: 'When allocating inventory across channels',
      action: 'Priority order: BOPIS > Same-day > Standard ship',
      priority: 1
    },
    {
      id: 'br-safety-stock',
      name: 'Dynamic Safety Stock',
      category: 'inventory',
      condition: 'When calculating safety stock levels',
      action: 'Safety stock = 1.65 * σ * √(lead time days) * demand variability factor',
      priority: 1
    },
    {
      id: 'br-ship-from-store',
      name: 'Ship-from-Store Eligibility',
      category: 'fulfillment',
      condition: 'When evaluating stores for SFS',
      action: 'Only eligible if: store ATP > safety stock AND store is open AND no more than 50 SFS orders/day',
      priority: 2
    },
    {
      id: 'br-fraud-threshold',
      name: 'Fraud Review Threshold',
      category: 'order',
      condition: 'When fraud score exceeds threshold',
      action: 'Orders with fraud score >= 70 require manual review; >= 90 auto-cancel',
      priority: 1
    },
    {
      id: 'br-promotion-stacking',
      name: 'Promotion Stacking Rules',
      category: 'pricing',
      condition: 'When multiple promotions apply',
      action: 'Apply best single non-stackable promo OR sum of stackable promos, whichever is greater; max total discount 50%',
      priority: 1
    },
    {
      id: 'br-return-window',
      name: 'Return Window Policy',
      category: 'order',
      condition: 'When processing return request',
      action: 'Standard 30-day window; Loyalty Gold/Platinum 90-day; Holiday purchases extended to Jan 31',
      priority: 2
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                    AI LAYER - AI能力层
  // ═══════════════════════════════════════════════════════════════════
  aiCapabilities: [
    {
      id: 'demand-sensing',
      name: 'AI Demand Sensing',
      nameCn: 'AI需求感知',
      type: 'predictive',
      description: 'ML-based demand forecasting incorporating multiple signals',
      descriptionCn: '融合多信号源的机器学习需求预测',
      inputObjects: ['product', 'inventory-position', 'order', 'promotion'],
      outputProperties: ['product.demandForecast7d', 'inventory-position.daysOfSupply'],
      modelDetails: {
        algorithm: 'Gradient Boosting + LSTM ensemble',
        features: ['Historical sales', 'Seasonality', 'Promotions', 'Weather', 'Events', 'Competition', 'Price'],
        trainingFrequency: 'Weekly',
        accuracy: 'MAPE < 15% at SKU-location level'
      }
    },
    {
      id: 'dynamic-pricing',
      name: 'Dynamic Pricing Engine',
      nameCn: '动态定价引擎',
      type: 'optimization',
      description: 'AI-powered price optimization for revenue and margin',
      descriptionCn: 'AI驱动的收入和毛利优化定价',
      inputObjects: ['product', 'inventory-position', 'order', 'customer'],
      outputProperties: ['product.recommendedPrice', 'product.priceElasticity'],
      modelDetails: {
        algorithm: 'Multi-objective optimization with elasticity models',
        features: ['Demand elasticity', 'Competition prices', 'Inventory levels', 'Margin targets', 'Customer segments'],
        trainingFrequency: 'Daily',
        accuracy: 'Revenue lift 3-8% in controlled tests'
      }
    },
    {
      id: 'fraud-detection',
      name: 'Order Fraud Detection',
      nameCn: '订单欺诈检测',
      type: 'classification',
      description: 'Real-time fraud scoring for e-commerce orders',
      descriptionCn: '电商订单实时欺诈评分',
      inputObjects: ['order', 'customer'],
      outputProperties: ['order.fraudRiskScore'],
      modelDetails: {
        algorithm: 'XGBoost with behavioral features',
        features: ['Device fingerprint', 'IP geolocation', 'Payment method', 'Order velocity', 'Customer history', 'Address verification'],
        trainingFrequency: 'Weekly with daily fine-tuning',
        accuracy: 'Precision 95%, Recall 80% at 70 threshold'
      }
    },
    {
      id: 'customer-segmentation',
      name: 'Customer Segmentation & CLV',
      nameCn: '顾客分群与生命周期价值',
      type: 'clustering',
      description: 'AI-driven customer segmentation with lifetime value prediction',
      descriptionCn: 'AI驱动的顾客分群与生命周期价值预测',
      inputObjects: ['customer', 'order'],
      outputProperties: ['customer.customerSegment', 'customer.lifetimeValuePrediction', 'customer.churnRisk'],
      modelDetails: {
        algorithm: 'K-means clustering + BG/NBD for CLV',
        features: ['RFM metrics', 'Channel preference', 'Category affinity', 'Price sensitivity', 'Promotion response'],
        trainingFrequency: 'Monthly',
        accuracy: 'CLV prediction R² > 0.7'
      }
    },
    {
      id: 'fulfillment-optimization',
      name: 'Fulfillment Location Optimization',
      nameCn: '履约位置优化',
      type: 'optimization',
      description: 'AI-powered order routing to optimal fulfillment location',
      descriptionCn: 'AI驱动的订单路由到最优履约位置',
      inputObjects: ['order', 'inventory-position', 'location'],
      outputProperties: ['order.fulfillmentLocationId'],
      modelDetails: {
        algorithm: 'Mixed Integer Programming with ML scoring',
        features: ['Distance to customer', 'Location capacity', 'Inventory position', 'Fulfillment cost', 'SLA requirements'],
        trainingFrequency: 'Real-time optimization',
        accuracy: 'Cost reduction 5-12% vs. nearest-location rule'
      }
    },
    {
      id: 'personalized-recommendations',
      name: 'Personalized Product Recommendations',
      nameCn: '个性化商品推荐',
      type: 'recommendation',
      description: 'AI product recommendations based on customer behavior',
      descriptionCn: '基于顾客行为的AI商品推荐',
      inputObjects: ['customer', 'product', 'order'],
      outputProperties: ['customer.nextPurchaseCategory'],
      modelDetails: {
        algorithm: 'Collaborative filtering + content-based hybrid',
        features: ['Purchase history', 'Browse history', 'Similar customers', 'Product attributes', 'Trending items'],
        trainingFrequency: 'Daily',
        accuracy: 'CTR improvement 25-40%'
      }
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                    UI LAYER - 界面层
  // ═══════════════════════════════════════════════════════════════════
  dashboards: [
    {
      id: 'omnichannel-command-center',
      name: 'Omnichannel Command Center',
      nameCn: '全渠道指挥中心',
      description: 'Real-time view of all channel operations',
      targetAudience: ['VP Operations', 'Store Operations Director'],
      layout: 'grid',
      widgets: [
        { type: 'kpi', title: 'Sales Today', dataSource: 'order', metric: 'sum(totalAmount)', filters: ['today'] },
        { type: 'kpi', title: 'Orders Today', dataSource: 'order', metric: 'count', filters: ['today'] },
        { type: 'kpi', title: 'BOPIS Orders', dataSource: 'order', metric: 'count', filters: ['fulfillmentType=BOPIS', 'today'] },
        { type: 'kpi', title: 'Average Order Value', dataSource: 'order', metric: 'avg(totalAmount)', filters: ['today'] },
        { type: 'chart', title: 'Sales by Channel', chartType: 'donut', dataSource: 'order', metric: 'sum(totalAmount) by channel', filters: ['today'] },
        { type: 'chart', title: 'Hourly Order Trend', chartType: 'line', dataSource: 'order', metric: 'count by hour', filters: ['today'] },
        { type: 'map', title: 'Store Performance', dataSource: 'location', metric: 'sales by location', filters: ['type=Store'] },
        { type: 'table', title: 'Top Performing Stores', dataSource: 'location', columns: ['name', 'sales', 'orders', 'conversion'], filters: ['top 10'] }
      ],
      refreshInterval: 60
    },
    {
      id: 'inventory-intelligence',
      name: 'Inventory Intelligence Dashboard',
      nameCn: '库存智能仪表板',
      description: 'AI-powered inventory visibility and optimization',
      targetAudience: ['Inventory Planner', 'Merchandise Manager'],
      layout: 'grid',
      widgets: [
        { type: 'kpi', title: 'Total Inventory Value', dataSource: 'inventory-position', metric: 'sum(onHandQty * costPrice)', filters: [] },
        { type: 'kpi', title: 'Stockout SKUs', dataSource: 'inventory-position', metric: 'count where onHandQty = 0', filters: [] },
        { type: 'kpi', title: 'High Risk Stockouts', dataSource: 'inventory-position', metric: 'count where stockoutRisk > 80', filters: [] },
        { type: 'chart', title: 'Inventory by Category', chartType: 'treemap', dataSource: 'inventory-position', metric: 'sum(value) by category', filters: [] },
        { type: 'chart', title: 'Days of Supply Distribution', chartType: 'histogram', dataSource: 'inventory-position', metric: 'daysOfSupply distribution', filters: [] },
        { type: 'table', title: 'Stockout Risk Alerts', dataSource: 'inventory-position', columns: ['product', 'location', 'onHandQty', 'stockoutRisk', 'recommendedAction'], filters: ['stockoutRisk > 50'] },
        { type: 'table', title: 'Overstock Items', dataSource: 'inventory-position', columns: ['product', 'location', 'onHandQty', 'daysOfSupply', 'recommendedMarkdown'], filters: ['daysOfSupply > 90'] }
      ],
      refreshInterval: 300
    },
    {
      id: 'customer-360',
      name: 'Customer 360 Dashboard',
      nameCn: '顾客360仪表板',
      description: 'Unified customer view with AI insights',
      targetAudience: ['Marketing Manager', 'Customer Service'],
      layout: 'tabs',
      widgets: [
        { type: 'kpi', title: 'Active Customers', dataSource: 'customer', metric: 'count where lastPurchaseDate > -90d', filters: [] },
        { type: 'kpi', title: 'Average CLV', dataSource: 'customer', metric: 'avg(lifetimeValuePrediction)', filters: [] },
        { type: 'kpi', title: 'At-Risk Customers', dataSource: 'customer', metric: 'count where churnRisk > 70', filters: [] },
        { type: 'chart', title: 'Customer Segments', chartType: 'pie', dataSource: 'customer', metric: 'count by customerSegment', filters: [] },
        { type: 'chart', title: 'CLV Distribution', chartType: 'histogram', dataSource: 'customer', metric: 'lifetimeValuePrediction distribution', filters: [] },
        { type: 'table', title: 'High-Value At-Risk', dataSource: 'customer', columns: ['name', 'segment', 'totalSpend', 'churnRisk', 'daysSinceLastPurchase'], filters: ['lifetimeValuePrediction > 1000', 'churnRisk > 50'] }
      ],
      refreshInterval: 3600
    },
    {
      id: 'store-operations',
      name: 'Store Operations Dashboard',
      nameCn: '门店运营仪表板',
      description: 'Real-time store task management and performance',
      targetAudience: ['Store Manager', 'District Manager'],
      layout: 'grid',
      widgets: [
        { type: 'kpi', title: 'Open Tasks', dataSource: 'store-task', metric: 'count where status IN (Pending, InProgress)', filters: ['locationId = current'] },
        { type: 'kpi', title: 'Overdue Tasks', dataSource: 'store-task', metric: 'count where dueTime < now AND status != Completed', filters: ['locationId = current'] },
        { type: 'kpi', title: 'BOPIS Ready', dataSource: 'order', metric: 'count where fulfillmentType = BOPIS AND status = Ready', filters: ['locationId = current'] },
        { type: 'chart', title: 'Task Completion Trend', chartType: 'line', dataSource: 'store-task', metric: 'count by status by hour', filters: ['today'] },
        { type: 'table', title: 'Pending Tasks', dataSource: 'store-task', columns: ['taskType', 'priority', 'dueTime', 'assignedTo', 'estimatedDuration'], filters: ['status = Pending'] }
      ],
      refreshInterval: 60
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                    DEPLOYMENT CONFIG - 部署配置
  // ═══════════════════════════════════════════════════════════════════
  deployment: {
    prerequisites: [
      'Data platform with connection license',
      'POS system with real-time transaction feed',
      'E-commerce platform API access',
      'ERP/WMS inventory feed'
    ],
    phases: [
      {
        phase: 1,
        name: 'Foundation',
        duration: '3-4 days',
        deliverables: [
          'Product master data pipeline',
          'Location hierarchy setup',
          'Historical transaction import',
          'Basic inventory visibility'
        ]
      },
      {
        phase: 2,
        name: 'Order Management',
        duration: '3-4 days',
        deliverables: [
          'Real-time order sync from all channels',
          'Unified customer profile',
          'Basic fulfillment workflow',
          'Order tracking dashboard'
        ]
      },
      {
        phase: 3,
        name: 'AI & Optimization',
        duration: '4-5 days',
        deliverables: [
          'Demand forecasting models',
          'Fulfillment optimization',
          'Customer segmentation',
          'Dynamic pricing (if applicable)'
        ]
      },
      {
        phase: 4,
        name: 'Advanced Workflows',
        duration: '3-4 days',
        deliverables: [
          'BOPIS workflow with store tasks',
          'Automated replenishment',
          'Markdown optimization',
          'Full dashboard suite'
        ]
      }
    ],
    roleConfig: [
      { role: 'VP Operations', permissions: ['read:all', 'write:dashboard-config'] },
      { role: 'Inventory Planner', permissions: ['read:all', 'write:inventory', 'write:purchase-order'] },
      { role: 'Store Manager', permissions: ['read:store-data', 'write:store-task', 'write:inventory-adjust'] },
      { role: 'Category Manager', permissions: ['read:all', 'write:product', 'write:promotion'] },
      { role: 'Customer Service', permissions: ['read:customer', 'read:order', 'write:order-status'] }
    ],
    integrationPoints: [
      { system: 'POS', direction: 'inbound', frequency: 'real-time', dataVolume: '10K-1M txn/day' },
      { system: 'E-commerce', direction: 'bidirectional', frequency: 'real-time', dataVolume: '1K-100K orders/day' },
      { system: 'ERP', direction: 'bidirectional', frequency: 'hourly', dataVolume: 'Varies' },
      { system: 'WMS', direction: 'bidirectional', frequency: 'real-time', dataVolume: 'Varies' }
    ]
  }
};
