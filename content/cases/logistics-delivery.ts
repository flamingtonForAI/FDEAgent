/**
 * 物流业 - 智能配送调度案例
 * Logistics - Smart Delivery Scheduling Case
 */

import { OntologyCase } from '../../types/case';

export const logisticsDeliveryCase: OntologyCase = {
  metadata: {
    id: 'logistics-delivery',
    title: {
      en: 'Smart Delivery Scheduling',
      cn: '智能配送调度'
    },
    description: {
      en: 'An AI-powered last-mile delivery management system featuring real-time route optimization, dynamic scheduling, and predictive delivery time estimation.',
      cn: '一套AI驱动的最后一公里配送管理系统，具备实时路线优化、动态调度和预测性配送时间估算功能。'
    },
    industry: 'logistics',
    tags: ['delivery', 'workforce', 'ai-augmented', 'analytics'],
    difficulty: 'advanced',
    estimatedTime: '50min',
    version: '1.0.0',
    createdAt: '2026-01-19',
    updatedAt: '2026-01-19'
  },

  scenario: {
    background: {
      en: 'A regional logistics company handles 10,000+ daily deliveries across a metropolitan area. They operate a fleet of 200 vehicles with varying capacities. Customer expectations for accurate delivery windows and real-time tracking are increasing.',
      cn: '一家区域物流公司每天在都市区处理10,000+次配送。他们运营着200辆不同容量的车辆。客户对准确配送时间窗口和实时追踪的期望不断提高。'
    },
    challenges: {
      en: [
        'Manual route planning takes 4+ hours daily and misses optimization opportunities',
        '25% of deliveries miss the promised time window',
        'Fuel costs are 20% above industry average due to inefficient routing',
        'Unable to dynamically handle same-day order additions'
      ],
      cn: [
        '人工路线规划每天需要4小时以上，错失优化机会',
        '25%的配送错过承诺的时间窗口',
        '由于路线效率低，燃油成本比行业平均高20%',
        '无法动态处理当日新增订单'
      ]
    },
    goals: {
      en: [
        'Reduce route planning time to under 30 minutes',
        'Achieve 95%+ on-time delivery rate',
        'Reduce fuel consumption by 15%',
        'Enable dynamic same-day order insertion'
      ],
      cn: [
        '将路线规划时间缩短至30分钟以内',
        '实现95%以上的准时送达率',
        '减少15%的燃油消耗',
        '支持当日订单动态插入'
      ]
    },
    stakeholders: [
      {
        role: 'Dispatch Manager',
        description: {
          en: 'Plans routes and assigns drivers to deliveries',
          cn: '规划路线并将司机分配到配送任务'
        }
      },
      {
        role: 'Driver',
        description: {
          en: 'Executes deliveries following optimized routes',
          cn: '按照优化路线执行配送'
        }
      },
      {
        role: 'Customer Service',
        description: {
          en: 'Handles customer inquiries and delivery changes',
          cn: '处理客户咨询和配送变更'
        }
      },
      {
        role: 'Fleet Manager',
        description: {
          en: 'Manages vehicle availability and maintenance',
          cn: '管理车辆可用性和维护'
        }
      }
    ]
  },

  ontology: {
    objects: [
      {
        id: 'delivery-order',
        name: 'Delivery Order',
        nameCn: '配送订单',
        description: 'A customer delivery request',
        descriptionCn: '客户配送请求',
        properties: [
          { name: 'orderId', type: 'string', description: 'Order identifier' },
          { name: 'customerId', type: 'string', description: 'Customer ID' },
          { name: 'address', type: 'string', description: 'Delivery address' },
          { name: 'coordinates', type: 'object', description: 'GPS coordinates (lat, lng)' },
          { name: 'timeWindow', type: 'object', description: 'Preferred delivery window' },
          { name: 'priority', type: 'string', description: 'Delivery priority' },
          { name: 'packageSize', type: 'string', description: 'Package size category' },
          { name: 'weight', type: 'number', description: 'Package weight in kg' },
          { name: 'status', type: 'string', description: 'Order status' },
          { name: 'assignedRoute', type: 'string', description: 'Assigned route ID' },
          { name: 'assignedDriver', type: 'string', description: 'Assigned driver ID' },
          { name: 'estimatedArrival', type: 'datetime', description: 'Predicted arrival time' },
          { name: 'actualDelivery', type: 'datetime', description: 'Actual delivery time' },
          { name: 'proofOfDelivery', type: 'string', description: 'POD image/signature' }
        ],
        primaryKey: 'orderId',
        actions: [
          {
            name: 'Estimate Delivery Time',
            nameCn: '估算配送时间',
            description: 'Predict accurate delivery time using AI',
            descriptionCn: '使用AI预测准确的配送时间',
            aiCapability: 'predict',
            businessLayer: {
              description: 'Calculate expected delivery time considering traffic, driver location, and route',
              targetObject: 'Delivery Order',
              executorRole: 'System',
              triggerCondition: 'Order assigned or status changed'
            },
            logicLayer: {
              preconditions: ['Order has assigned route and driver'],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: 'Order ID' },
                { name: 'useRealTimeTraffic', type: 'boolean', required: false, description: 'Include live traffic data' }
              ],
              postconditions: ['estimatedArrival is updated', 'Customer notification triggered']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/orders/{orderId}/estimate-eta',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'estimate_delivery_eta',
                description: 'Predict delivery arrival time using ML model trained on historical delivery data and real-time conditions',
                parameters: {
                  type: 'object',
                  properties: {
                    orderId: { type: 'string' },
                    useRealTimeTraffic: { type: 'boolean', default: true }
                  },
                  required: ['orderId']
                }
              }
            },
            governance: {
              permissionTier: 4,
              requiresHumanApproval: false,
              auditLog: false
            }
          },
          {
            name: 'Reschedule Delivery',
            nameCn: '重新调度配送',
            description: 'Change delivery time or date',
            descriptionCn: '更改配送时间或日期',
            businessLayer: {
              description: 'Handle customer request to change delivery window',
              targetObject: 'Delivery Order',
              executorRole: 'Customer Service',
              triggerCondition: 'Customer request or delivery failure'
            },
            logicLayer: {
              preconditions: [
                'Order is not yet delivered',
                'New time slot is available'
              ],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: 'Order ID' },
                { name: 'newTimeWindow', type: 'object', required: true, description: 'New delivery window' },
                { name: 'reason', type: 'string', required: true, description: 'Reschedule reason' }
              ],
              postconditions: [
                'Order removed from current route',
                'Order queued for re-routing',
                'Customer notified'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/orders/{orderId}/reschedule',
              apiMethod: 'PUT'
            },
            governance: {
              permissionTier: 3,
              requiresHumanApproval: false,
              auditLog: true
            }
          },
          {
            name: 'Complete Delivery',
            nameCn: '完成配送',
            description: 'Mark order as delivered',
            descriptionCn: '标记订单为已送达',
            businessLayer: {
              description: 'Record successful delivery with proof',
              targetObject: 'Delivery Order',
              executorRole: 'Driver',
              triggerCondition: 'Package handed to customer'
            },
            logicLayer: {
              preconditions: ['Driver at delivery location', 'Order status is "out_for_delivery"'],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: 'Order ID' },
                { name: 'signature', type: 'string', required: false, description: 'Customer signature' },
                { name: 'photo', type: 'string', required: false, description: 'Proof of delivery photo' },
                { name: 'recipientName', type: 'string', required: false, description: 'Person who received' }
              ],
              postconditions: [
                'Status changes to "delivered"',
                'Actual delivery time recorded',
                'POD saved'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/orders/{orderId}/complete',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 3,
              requiresHumanApproval: false,
              auditLog: true
            }
          },
          {
            name: 'Report Failed Delivery',
            nameCn: '报告配送失败',
            description: 'Record unsuccessful delivery attempt',
            descriptionCn: '记录配送尝试失败',
            businessLayer: {
              description: 'Document why delivery could not be completed',
              targetObject: 'Delivery Order',
              executorRole: 'Driver',
              triggerCondition: 'Unable to complete delivery'
            },
            logicLayer: {
              preconditions: ['Order status is "out_for_delivery"'],
              parameters: [
                { name: 'orderId', type: 'string', required: true, description: 'Order ID' },
                { name: 'failureReason', type: 'string', required: true, description: 'Reason code' },
                { name: 'notes', type: 'string', required: false, description: 'Additional details' },
                { name: 'photo', type: 'string', required: false, description: 'Photo evidence' }
              ],
              postconditions: [
                'Status changes to "failed_attempt"',
                'Attempt count incremented',
                'Customer service notified'
              ],
              sideEffects: ['Trigger reschedule workflow', 'Update driver metrics']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/orders/{orderId}/fail',
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
        id: 'route',
        name: 'Route',
        nameCn: '路线',
        description: 'A planned delivery route for a driver',
        descriptionCn: '司机的计划配送路线',
        properties: [
          { name: 'routeId', type: 'string', description: 'Route identifier' },
          { name: 'date', type: 'date', description: 'Route date' },
          { name: 'driverId', type: 'string', description: 'Assigned driver' },
          { name: 'vehicleId', type: 'string', description: 'Assigned vehicle' },
          { name: 'status', type: 'string', description: 'Route status' },
          { name: 'stops', type: 'array', description: 'Ordered list of stops' },
          { name: 'totalDistance', type: 'number', description: 'Total distance in km' },
          { name: 'estimatedDuration', type: 'number', description: 'Estimated time in minutes' },
          { name: 'startTime', type: 'datetime', description: 'Route start time' },
          { name: 'endTime', type: 'datetime', description: 'Route end time' },
          { name: 'currentStop', type: 'number', description: 'Current stop index' }
        ],
        primaryKey: 'routeId',
        actions: [
          {
            name: 'Optimize Route',
            nameCn: '优化路线',
            description: 'Calculate optimal stop sequence using AI',
            descriptionCn: '使用AI计算最优停靠顺序',
            aiCapability: 'optimize',
            businessLayer: {
              description: 'Find the best sequence of stops minimizing distance while meeting time windows',
              targetObject: 'Route',
              executorRole: 'Dispatch Manager',
              triggerCondition: 'New route created or stops changed'
            },
            logicLayer: {
              preconditions: ['Route has at least one stop', 'All stops have valid coordinates'],
              parameters: [
                { name: 'routeId', type: 'string', required: true, description: 'Route ID' },
                { name: 'optimizationGoal', type: 'string', required: false, description: 'distance/time/balanced' },
                { name: 'respectTimeWindows', type: 'boolean', required: false, description: 'Enforce customer time windows' }
              ],
              postconditions: [
                'Stops are reordered optimally',
                'Total distance/time recalculated',
                'ETAs updated for all stops'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/routes/{routeId}/optimize',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'optimize_delivery_route',
                description: 'Optimize delivery route using vehicle routing problem (VRP) solver with time windows',
                parameters: {
                  type: 'object',
                  properties: {
                    routeId: { type: 'string' },
                    optimizationGoal: { type: 'string', enum: ['distance', 'time', 'balanced'] },
                    maxComputeTime: { type: 'number', description: 'Max seconds for optimization' }
                  },
                  required: ['routeId']
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
            name: 'Insert Stop',
            nameCn: '插入停靠点',
            description: 'Add a new delivery stop to existing route',
            descriptionCn: '向现有路线添加新的配送停靠点',
            aiCapability: 'optimize',
            businessLayer: {
              description: 'Dynamically add same-day order to in-progress route',
              targetObject: 'Route',
              executorRole: 'Dispatch Manager',
              triggerCondition: 'Same-day order needs assignment'
            },
            logicLayer: {
              preconditions: [
                'Route has capacity for additional stop',
                'New stop is geographically compatible'
              ],
              parameters: [
                { name: 'routeId', type: 'string', required: true, description: 'Route ID' },
                { name: 'orderId', type: 'string', required: true, description: 'Order to insert' },
                { name: 'position', type: 'string', required: false, description: 'optimal/next/end' }
              ],
              postconditions: [
                'Order added to route',
                'Route re-optimized',
                'Driver notified of change'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/routes/{routeId}/insert-stop',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'insert_delivery_stop',
                description: 'Insert a new delivery into an existing route at the optimal position',
                parameters: {
                  type: 'object',
                  properties: {
                    routeId: { type: 'string' },
                    orderId: { type: 'string' },
                    position: { type: 'string', enum: ['optimal', 'next', 'end'] }
                  },
                  required: ['routeId', 'orderId']
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
            name: 'Start Route',
            nameCn: '开始路线',
            description: 'Begin execution of the route',
            descriptionCn: '开始执行路线',
            businessLayer: {
              description: 'Driver starts their delivery route',
              targetObject: 'Route',
              executorRole: 'Driver'
            },
            logicLayer: {
              preconditions: ['Route status is "planned"', 'Vehicle is checked and ready'],
              parameters: [
                { name: 'routeId', type: 'string', required: true, description: 'Route ID' },
                { name: 'startLocation', type: 'object', required: false, description: 'Actual start coordinates' }
              ],
              postconditions: [
                'Status changes to "in_progress"',
                'Start time recorded',
                'Tracking enabled'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/routes/{routeId}/start',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 3,
              requiresHumanApproval: false,
              auditLog: true
            }
          },
          {
            name: 'Complete Route',
            nameCn: '完成路线',
            description: 'Mark route as completed',
            descriptionCn: '标记路线为已完成',
            businessLayer: {
              description: 'Driver finishes all stops and returns',
              targetObject: 'Route',
              executorRole: 'Driver'
            },
            logicLayer: {
              preconditions: ['All stops completed or accounted for'],
              parameters: [
                { name: 'routeId', type: 'string', required: true, description: 'Route ID' },
                { name: 'endLocation', type: 'object', required: false, description: 'Final location' },
                { name: 'odometerEnd', type: 'number', required: false, description: 'End odometer reading' }
              ],
              postconditions: [
                'Status changes to "completed"',
                'End time recorded',
                'Actual metrics calculated'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/routes/{routeId}/complete',
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
        id: 'driver',
        name: 'Driver',
        nameCn: '司机',
        description: 'Delivery driver',
        descriptionCn: '配送司机',
        properties: [
          { name: 'driverId', type: 'string', description: 'Driver identifier' },
          { name: 'name', type: 'string', description: 'Driver name' },
          { name: 'phone', type: 'string', description: 'Contact phone' },
          { name: 'status', type: 'string', description: 'Current status (available/on_route/break/off_duty)' },
          { name: 'currentLocation', type: 'object', description: 'Real-time GPS location' },
          { name: 'assignedVehicle', type: 'string', description: 'Current vehicle ID' },
          { name: 'rating', type: 'number', description: 'Customer rating (1-5)' },
          { name: 'completedDeliveries', type: 'number', description: 'Total deliveries completed' },
          { name: 'onTimeRate', type: 'number', description: 'On-time delivery percentage' }
        ],
        primaryKey: 'driverId',
        actions: [
          {
            name: 'Assign to Route',
            nameCn: '分配路线',
            description: 'Assign driver to a delivery route',
            descriptionCn: '将司机分配到配送路线',
            aiCapability: 'recommend',
            businessLayer: {
              description: 'Match optimal driver to route based on location, skills, and workload',
              targetObject: 'Driver',
              executorRole: 'Dispatch Manager',
              triggerCondition: 'Route created and needs driver'
            },
            logicLayer: {
              preconditions: ['Driver status is "available"', 'Driver is qualified for vehicle type'],
              parameters: [
                { name: 'driverId', type: 'string', required: true, description: 'Driver ID' },
                { name: 'routeId', type: 'string', required: true, description: 'Route to assign' }
              ],
              postconditions: [
                'Driver assigned to route',
                'Driver status changes to "assigned"',
                'Driver notified'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/drivers/{driverId}/assign',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: false,
              auditLog: true
            }
          },
          {
            name: 'Update Location',
            nameCn: '更新位置',
            description: 'Update driver real-time location',
            descriptionCn: '更新司机实时位置',
            businessLayer: {
              description: 'Continuous GPS tracking during route',
              targetObject: 'Driver',
              executorRole: 'System',
              triggerCondition: 'GPS ping from driver app'
            },
            logicLayer: {
              preconditions: [],
              parameters: [
                { name: 'driverId', type: 'string', required: true, description: 'Driver ID' },
                { name: 'latitude', type: 'number', required: true, description: 'Latitude' },
                { name: 'longitude', type: 'number', required: true, description: 'Longitude' },
                { name: 'speed', type: 'number', required: false, description: 'Current speed' },
                { name: 'heading', type: 'number', required: false, description: 'Direction' }
              ],
              postconditions: ['Location updated', 'ETAs recalculated if significant change']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/drivers/{driverId}/location',
              apiMethod: 'PUT'
            },
            governance: {
              permissionTier: 4,
              requiresHumanApproval: false,
              auditLog: false
            }
          }
        ]
      },
      {
        id: 'vehicle',
        name: 'Vehicle',
        nameCn: '车辆',
        description: 'Delivery vehicle',
        descriptionCn: '配送车辆',
        properties: [
          { name: 'vehicleId', type: 'string', description: 'Vehicle identifier' },
          { name: 'plateNumber', type: 'string', description: 'License plate' },
          { name: 'type', type: 'string', description: 'Vehicle type (van/truck/bike)' },
          { name: 'capacity', type: 'number', description: 'Cargo capacity in cubic meters' },
          { name: 'maxWeight', type: 'number', description: 'Max weight capacity in kg' },
          { name: 'status', type: 'string', description: 'Vehicle status' },
          { name: 'currentLocation', type: 'object', description: 'Current GPS location' },
          { name: 'fuelLevel', type: 'number', description: 'Fuel level percentage' },
          { name: 'nextMaintenance', type: 'date', description: 'Next scheduled maintenance' },
          { name: 'odometer', type: 'number', description: 'Current odometer reading' }
        ],
        primaryKey: 'vehicleId',
        actions: [
          {
            name: 'Check Availability',
            nameCn: '检查可用性',
            description: 'Check if vehicle is available for assignment',
            descriptionCn: '检查车辆是否可分配',
            businessLayer: {
              description: 'Verify vehicle status, fuel, and maintenance for route assignment',
              targetObject: 'Vehicle',
              executorRole: 'Dispatch Manager'
            },
            logicLayer: {
              preconditions: [],
              parameters: [
                { name: 'vehicleId', type: 'string', required: true, description: 'Vehicle ID' },
                { name: 'requiredCapacity', type: 'number', required: false, description: 'Needed capacity' },
                { name: 'routeDate', type: 'date', required: false, description: 'Intended use date' }
              ],
              postconditions: ['Availability status returned']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/vehicles/{vehicleId}/availability',
              apiMethod: 'GET'
            },
            governance: {
              permissionTier: 4,
              requiresHumanApproval: false,
              auditLog: false
            }
          },
          {
            name: 'Schedule Maintenance',
            nameCn: '安排维护',
            description: 'Schedule vehicle maintenance',
            descriptionCn: '安排车辆维护',
            businessLayer: {
              description: 'Plan maintenance window to minimize impact on operations',
              targetObject: 'Vehicle',
              executorRole: 'Fleet Manager'
            },
            logicLayer: {
              preconditions: ['Vehicle not assigned to active route'],
              parameters: [
                { name: 'vehicleId', type: 'string', required: true, description: 'Vehicle ID' },
                { name: 'maintenanceType', type: 'string', required: true, description: 'Type of maintenance' },
                { name: 'scheduledDate', type: 'date', required: true, description: 'Maintenance date' }
              ],
              postconditions: [
                'Maintenance scheduled',
                'Vehicle blocked for that period'
              ]
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/vehicles/{vehicleId}/maintenance',
              apiMethod: 'POST'
            },
            governance: {
              permissionTier: 2,
              requiresHumanApproval: true,
              auditLog: true
            }
          }
        ]
      }
    ],
    links: [
      {
        id: 'order-route',
        name: 'Assigned To',
        nameCn: '分配到',
        sourceObject: 'delivery-order',
        targetObject: 'route',
        cardinality: 'many-to-one',
        description: 'Orders are assigned to routes'
      },
      {
        id: 'route-driver',
        name: 'Driven By',
        nameCn: '由...驾驶',
        sourceObject: 'route',
        targetObject: 'driver',
        cardinality: 'many-to-one',
        description: 'Routes are executed by drivers'
      },
      {
        id: 'route-vehicle',
        name: 'Uses Vehicle',
        nameCn: '使用车辆',
        sourceObject: 'route',
        targetObject: 'vehicle',
        cardinality: 'many-to-one',
        description: 'Routes use specific vehicles'
      },
      {
        id: 'driver-vehicle',
        name: 'Operates',
        nameCn: '操作',
        sourceObject: 'driver',
        targetObject: 'vehicle',
        cardinality: 'one-to-one',
        description: 'Driver currently operating vehicle'
      }
    ],
    integrations: [
      {
        id: 'tms-integration',
        name: 'TMS System',
        nameCn: 'TMS系统',
        type: 'bidirectional',
        sourceSystem: 'Transportation Management',
        frequency: 'real-time',
        syncedObjects: ['delivery-order', 'route'],
        description: 'Order management and route planning'
      },
      {
        id: 'gps-integration',
        name: 'GPS Tracking',
        nameCn: 'GPS追踪',
        type: 'inbound',
        sourceSystem: 'Fleet GPS',
        frequency: 'streaming',
        syncedObjects: ['driver', 'vehicle'],
        description: 'Real-time location tracking'
      },
      {
        id: 'traffic-integration',
        name: 'Traffic API',
        nameCn: '交通API',
        type: 'inbound',
        sourceSystem: 'Google Maps / HERE',
        frequency: 'on-demand',
        syncedObjects: ['route'],
        description: 'Real-time traffic data for routing'
      },
      {
        id: 'customer-integration',
        name: 'Customer Notifications',
        nameCn: '客户通知',
        type: 'outbound',
        sourceSystem: 'SMS/Push Gateway',
        frequency: 'event-driven',
        syncedObjects: ['delivery-order'],
        description: 'Customer delivery notifications'
      }
    ]
  },

  highlights: [
    {
      title: {
        en: 'AI Route Optimization',
        cn: 'AI路线优化'
      },
      description: {
        en: 'The Optimize Route action uses Vehicle Routing Problem (VRP) algorithms enhanced with ML to find optimal sequences that minimize distance/time while respecting customer time windows.',
        cn: 'Optimize Route动作使用ML增强的车辆路径问题(VRP)算法，在尊重客户时间窗口的同时找到最小化距离/时间的最优序列。'
      },
      relatedElements: ['route', 'Optimize Route']
    },
    {
      title: {
        en: 'Dynamic Order Insertion',
        cn: '动态订单插入'
      },
      description: {
        en: 'The Insert Stop action enables same-day orders to be dynamically added to in-progress routes, automatically finding the optimal insertion point.',
        cn: 'Insert Stop动作支持当日订单动态添加到进行中的路线，自动找到最优插入点。'
      },
      relatedElements: ['route', 'Insert Stop']
    },
    {
      title: {
        en: 'Real-Time ETA Prediction',
        cn: '实时ETA预测'
      },
      description: {
        en: 'Continuous ETA updates based on driver location, traffic conditions, and historical delivery times at similar locations.',
        cn: '基于司机位置、交通状况和类似位置的历史配送时间持续更新ETA。'
      },
      relatedElements: ['delivery-order', 'Estimate Delivery Time', 'driver', 'Update Location']
    }
  ],

  learningPoints: [
    {
      concept: {
        en: 'Real-Time System Integration',
        cn: '实时系统集成'
      },
      explanation: {
        en: 'GPS streaming data flows continuously into the system, triggering ETA recalculations. This shows how streaming integrations differ from batch integrations.',
        cn: 'GPS流数据持续流入系统，触发ETA重新计算。这展示了流式集成与批量集成的不同。'
      }
    },
    {
      concept: {
        en: 'Cascading State Changes',
        cn: '级联状态变更'
      },
      explanation: {
        en: 'When an order is completed, it affects route progress, driver metrics, and customer notifications - demonstrating how actions can trigger cascading effects.',
        cn: '当订单完成时，会影响路线进度、司机指标和客户通知 - 展示了动作如何触发级联效果。'
      }
    },
    {
      concept: {
        en: 'Optimization Under Constraints',
        cn: '约束下的优化'
      },
      explanation: {
        en: 'Route optimization must balance multiple constraints: time windows, vehicle capacity, driver hours, and traffic. The AI must find feasible solutions, not just optimal ones.',
        cn: '路线优化必须平衡多个约束：时间窗口、车辆容量、司机工时和交通。AI必须找到可行解，而不仅仅是最优解。'
      }
    },
    {
      concept: {
        en: 'Human-in-the-Loop for Exceptions',
        cn: '异常情况的人机协作'
      },
      explanation: {
        en: 'Status tracking (Tier 1-2) is fully automated, while route reassignment (Tier 3) requires confirmation, and maintenance scheduling (Tier 4) needs multi-approval because it impacts fleet capacity.',
        cn: '状态跟踪(Tier 1-2)完全自动化，而路线重新分配(Tier 3)需要确认，维护调度(Tier 4)需要多级审批，因为它影响车队容量。'
      }
    }
  ],

  relatedCases: ['manufacturing-production', 'retail-inventory']
};

export default logisticsDeliveryCase;
