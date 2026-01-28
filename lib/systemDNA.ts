/**
 * System DNA - Enterprise System Knowledge Base
 *
 * This module provides intelligent detection and knowledge about enterprise systems
 * like SAP, Salesforce, Oracle, etc. When these systems are mentioned in conversation,
 * we can suggest relevant objects, actions, and integration patterns.
 */

import { Language } from '../types';

// ============= Type Definitions =============

export interface SystemObject {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
  typicalProperties: string[];
}

export interface SystemAction {
  id: string;
  name: string;
  nameCn: string;
  targetObject: string;
  description: string;
  descriptionCn: string;
}

export interface IntegrationPattern {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
  syncType: 'realtime' | 'batch' | 'cdc' | 'event';
  complexity: 'low' | 'medium' | 'high';
}

export interface SystemDNA {
  id: string;
  name: string;
  nameCn: string;
  category: 'ERP' | 'CRM' | 'WMS' | 'HRM' | 'SCM' | 'MES' | 'PLM' | 'BI' | 'Custom';
  description: string;
  descriptionCn: string;
  keywords: string[];  // Trigger keywords for detection
  objects: SystemObject[];
  actions: SystemAction[];
  integrationPatterns: IntegrationPattern[];
  commonChallenges: { en: string; cn: string }[];
}

export interface DetectedSystem {
  system: SystemDNA;
  matchedKeyword: string;
  position: number;
  confidence: number;
}

// ============= System Knowledge Base =============

export const SYSTEM_DNA_DATABASE: SystemDNA[] = [
  // SAP ERP
  {
    id: 'sap-erp',
    name: 'SAP ERP',
    nameCn: 'SAP ERP',
    category: 'ERP',
    description: 'Enterprise resource planning system for large organizations',
    descriptionCn: '面向大型企业的资源计划管理系统',
    keywords: ['sap', 'sap erp', 'sap s/4', 's4hana', 'sap hana', 'sap ecc', 'sap r/3'],
    objects: [
      {
        id: 'sales-order',
        name: 'Sales Order',
        nameCn: '销售订单',
        description: 'Customer order for products or services (VA01)',
        descriptionCn: '客户的产品或服务订单（VA01）',
        typicalProperties: ['order_id', 'customer_id', 'order_date', 'delivery_date', 'total_amount', 'status', 'payment_terms']
      },
      {
        id: 'material',
        name: 'Material',
        nameCn: '物料',
        description: 'Products, raw materials, or services (MM01)',
        descriptionCn: '产品、原材料或服务（MM01）',
        typicalProperties: ['material_id', 'description', 'material_type', 'unit_of_measure', 'weight', 'volume', 'price']
      },
      {
        id: 'business-partner',
        name: 'Business Partner',
        nameCn: '业务伙伴',
        description: 'Customers, vendors, or other business entities',
        descriptionCn: '客户、供应商或其他业务实体',
        typicalProperties: ['partner_id', 'name', 'partner_type', 'address', 'contact', 'credit_limit', 'payment_terms']
      },
      {
        id: 'purchase-order',
        name: 'Purchase Order',
        nameCn: '采购订单',
        description: 'Order placed with vendors (ME21N)',
        descriptionCn: '向供应商发出的订单（ME21N）',
        typicalProperties: ['po_number', 'vendor_id', 'order_date', 'delivery_date', 'items', 'total_value', 'status']
      },
      {
        id: 'delivery',
        name: 'Delivery',
        nameCn: '交货单',
        description: 'Outbound delivery document (VL01N)',
        descriptionCn: '出库交货单据（VL01N）',
        typicalProperties: ['delivery_id', 'sales_order', 'ship_to', 'ship_date', 'items', 'tracking_number', 'status']
      }
    ],
    actions: [
      {
        id: 'create-sales-order',
        name: 'Create Sales Order',
        nameCn: '创建销售订单',
        targetObject: 'sales-order',
        description: 'Create a new sales order from customer request',
        descriptionCn: '根据客户请求创建新销售订单'
      },
      {
        id: 'release-purchase-order',
        name: 'Release Purchase Order',
        nameCn: '审批采购订单',
        targetObject: 'purchase-order',
        description: 'Approve and release PO for processing',
        descriptionCn: '审批并发布采购订单'
      },
      {
        id: 'post-goods-receipt',
        name: 'Post Goods Receipt',
        nameCn: '过账收货',
        targetObject: 'material',
        description: 'Record receipt of materials in inventory',
        descriptionCn: '在库存中记录物料收货'
      },
      {
        id: 'create-delivery',
        name: 'Create Delivery',
        nameCn: '创建交货单',
        targetObject: 'delivery',
        description: 'Generate delivery document for shipment',
        descriptionCn: '生成发货交货单据'
      }
    ],
    integrationPatterns: [
      {
        id: 'idoc',
        name: 'IDoc Integration',
        nameCn: 'IDoc 集成',
        description: 'SAP Intermediate Document for async data exchange',
        descriptionCn: 'SAP中间文档，用于异步数据交换',
        syncType: 'batch',
        complexity: 'medium'
      },
      {
        id: 'bapi-rfc',
        name: 'BAPI/RFC',
        nameCn: 'BAPI/RFC 接口',
        description: 'Business API for real-time synchronous calls',
        descriptionCn: '业务API，用于实时同步调用',
        syncType: 'realtime',
        complexity: 'medium'
      },
      {
        id: 'odata',
        name: 'OData Services',
        nameCn: 'OData 服务',
        description: 'RESTful API for S/4HANA (recommended)',
        descriptionCn: 'S/4HANA的RESTful API（推荐）',
        syncType: 'realtime',
        complexity: 'low'
      },
      {
        id: 'cdc',
        name: 'Change Data Capture',
        nameCn: '变更数据捕获',
        description: 'Capture changes from SAP tables in real-time',
        descriptionCn: '实时捕获SAP表的数据变更',
        syncType: 'cdc',
        complexity: 'high'
      }
    ],
    commonChallenges: [
      { en: 'Complex authorization model with multiple org levels', cn: '复杂的多组织层级授权模型' },
      { en: 'Custom fields and extensions vary by implementation', cn: '自定义字段和扩展因实施而异' },
      { en: 'Transaction codes vs modern APIs', cn: '事务码与现代API的选择' }
    ]
  },

  // Salesforce CRM
  {
    id: 'salesforce',
    name: 'Salesforce',
    nameCn: 'Salesforce',
    category: 'CRM',
    description: 'Cloud-based CRM platform for sales, service, and marketing',
    descriptionCn: '基于云的销售、服务和营销CRM平台',
    keywords: ['salesforce', 'sfdc', 'sales cloud', 'service cloud', 'sf crm', 'salesforce crm'],
    objects: [
      {
        id: 'account',
        name: 'Account',
        nameCn: '客户',
        description: 'Company or organization you do business with',
        descriptionCn: '与您有业务往来的公司或组织',
        typicalProperties: ['account_id', 'name', 'industry', 'annual_revenue', 'employees', 'billing_address', 'owner']
      },
      {
        id: 'contact',
        name: 'Contact',
        nameCn: '联系人',
        description: 'Individual person associated with an account',
        descriptionCn: '与客户关联的个人',
        typicalProperties: ['contact_id', 'first_name', 'last_name', 'email', 'phone', 'title', 'account_id']
      },
      {
        id: 'opportunity',
        name: 'Opportunity',
        nameCn: '商机',
        description: 'Potential sales deal being tracked',
        descriptionCn: '正在跟踪的潜在销售交易',
        typicalProperties: ['opportunity_id', 'name', 'amount', 'stage', 'close_date', 'probability', 'account_id', 'owner']
      },
      {
        id: 'lead',
        name: 'Lead',
        nameCn: '线索',
        description: 'Prospective customer not yet qualified',
        descriptionCn: '尚未验证的潜在客户',
        typicalProperties: ['lead_id', 'name', 'company', 'email', 'phone', 'status', 'source', 'rating']
      },
      {
        id: 'case',
        name: 'Case',
        nameCn: '服务工单',
        description: 'Customer service or support request',
        descriptionCn: '客户服务或支持请求',
        typicalProperties: ['case_id', 'subject', 'description', 'status', 'priority', 'contact_id', 'account_id', 'owner']
      }
    ],
    actions: [
      {
        id: 'convert-lead',
        name: 'Convert Lead',
        nameCn: '转化线索',
        targetObject: 'lead',
        description: 'Convert qualified lead to account/contact/opportunity',
        descriptionCn: '将合格线索转化为客户/联系人/商机'
      },
      {
        id: 'advance-stage',
        name: 'Advance Opportunity Stage',
        nameCn: '推进商机阶段',
        targetObject: 'opportunity',
        description: 'Move opportunity to next sales stage',
        descriptionCn: '将商机推进到下一销售阶段'
      },
      {
        id: 'close-case',
        name: 'Close Case',
        nameCn: '关闭工单',
        targetObject: 'case',
        description: 'Mark service case as resolved',
        descriptionCn: '将服务工单标记为已解决'
      },
      {
        id: 'log-activity',
        name: 'Log Activity',
        nameCn: '记录活动',
        targetObject: 'contact',
        description: 'Record call, email, or meeting with contact',
        descriptionCn: '记录与联系人的通话、邮件或会议'
      }
    ],
    integrationPatterns: [
      {
        id: 'rest-api',
        name: 'REST API',
        nameCn: 'REST API',
        description: 'Standard RESTful API for CRUD operations',
        descriptionCn: '标准RESTful API用于CRUD操作',
        syncType: 'realtime',
        complexity: 'low'
      },
      {
        id: 'bulk-api',
        name: 'Bulk API',
        nameCn: '批量 API',
        description: 'Optimized for large data volumes (50K+ records)',
        descriptionCn: '针对大数据量优化（5万+记录）',
        syncType: 'batch',
        complexity: 'medium'
      },
      {
        id: 'streaming-api',
        name: 'Streaming API',
        nameCn: '流式 API',
        description: 'Real-time event notifications via push',
        descriptionCn: '通过推送实现实时事件通知',
        syncType: 'event',
        complexity: 'medium'
      },
      {
        id: 'connect-api',
        name: 'Connect API',
        nameCn: 'Connect API',
        description: 'Platform events and change data capture',
        descriptionCn: '平台事件和变更数据捕获',
        syncType: 'cdc',
        complexity: 'medium'
      }
    ],
    commonChallenges: [
      { en: 'API rate limits and governor limits', cn: 'API速率限制和管理器限制' },
      { en: 'Custom objects and fields in each org', cn: '每个组织的自定义对象和字段' },
      { en: 'Multi-currency and multi-language support', cn: '多币种和多语言支持' }
    ]
  },

  // Oracle ERP
  {
    id: 'oracle-erp',
    name: 'Oracle ERP Cloud',
    nameCn: 'Oracle ERP Cloud',
    category: 'ERP',
    description: 'Cloud-based ERP suite for finance, procurement, and projects',
    descriptionCn: '基于云的财务、采购和项目ERP套件',
    keywords: ['oracle', 'oracle erp', 'oracle cloud', 'oracle fusion', 'oracle financials', 'oracle hcm'],
    objects: [
      {
        id: 'invoice',
        name: 'Invoice',
        nameCn: '发票',
        description: 'Accounts payable or receivable invoice',
        descriptionCn: '应付或应收发票',
        typicalProperties: ['invoice_id', 'vendor_id', 'invoice_date', 'due_date', 'amount', 'status', 'payment_terms']
      },
      {
        id: 'journal',
        name: 'Journal Entry',
        nameCn: '日记账',
        description: 'General ledger journal entry',
        descriptionCn: '总账日记账分录',
        typicalProperties: ['journal_id', 'period', 'ledger', 'debit', 'credit', 'description', 'status']
      },
      {
        id: 'requisition',
        name: 'Requisition',
        nameCn: '采购申请',
        description: 'Internal request for goods or services',
        descriptionCn: '内部商品或服务请求',
        typicalProperties: ['req_id', 'requester', 'items', 'total_amount', 'status', 'approver', 'needed_by_date']
      },
      {
        id: 'supplier',
        name: 'Supplier',
        nameCn: '供应商',
        description: 'Vendor or supplier master data',
        descriptionCn: '供应商主数据',
        typicalProperties: ['supplier_id', 'name', 'tax_id', 'payment_method', 'bank_account', 'address', 'status']
      }
    ],
    actions: [
      {
        id: 'approve-invoice',
        name: 'Approve Invoice',
        nameCn: '审批发票',
        targetObject: 'invoice',
        description: 'Approve invoice for payment processing',
        descriptionCn: '审批发票以进行付款处理'
      },
      {
        id: 'post-journal',
        name: 'Post Journal',
        nameCn: '过账日记账',
        targetObject: 'journal',
        description: 'Post journal entry to general ledger',
        descriptionCn: '将日记账过账到总账'
      },
      {
        id: 'submit-requisition',
        name: 'Submit Requisition',
        nameCn: '提交采购申请',
        targetObject: 'requisition',
        description: 'Submit requisition for approval workflow',
        descriptionCn: '提交采购申请进入审批流程'
      }
    ],
    integrationPatterns: [
      {
        id: 'rest-api',
        name: 'REST API',
        nameCn: 'REST API',
        description: 'Oracle REST Data Services for cloud integration',
        descriptionCn: 'Oracle REST数据服务用于云集成',
        syncType: 'realtime',
        complexity: 'low'
      },
      {
        id: 'fbdi',
        name: 'FBDI Import',
        nameCn: 'FBDI 导入',
        description: 'File-Based Data Import for bulk loads',
        descriptionCn: '基于文件的数据导入用于批量加载',
        syncType: 'batch',
        complexity: 'medium'
      },
      {
        id: 'bi-publisher',
        name: 'BI Publisher',
        nameCn: 'BI Publisher',
        description: 'Extract data via scheduled reports',
        descriptionCn: '通过计划报表提取数据',
        syncType: 'batch',
        complexity: 'low'
      }
    ],
    commonChallenges: [
      { en: 'Complex approval workflows and flexfields', cn: '复杂的审批流程和弹性域' },
      { en: 'Integration with on-premise Oracle systems', cn: '与本地Oracle系统的集成' },
      { en: 'Data security and access control', cn: '数据安全和访问控制' }
    ]
  },

  // WMS - Warehouse Management
  {
    id: 'wms',
    name: 'WMS (Warehouse Management)',
    nameCn: '仓储管理系统',
    category: 'WMS',
    description: 'Warehouse management system for inventory and fulfillment',
    descriptionCn: '用于库存和履约的仓储管理系统',
    keywords: ['wms', 'warehouse', '仓库', '仓储', 'manhattan', 'blue yonder', 'highjump', 'infor wms'],
    objects: [
      {
        id: 'inventory',
        name: 'Inventory',
        nameCn: '库存',
        description: 'Stock levels and locations',
        descriptionCn: '库存水平和位置',
        typicalProperties: ['sku', 'location', 'quantity', 'lot_number', 'expiry_date', 'status', 'last_count_date']
      },
      {
        id: 'location',
        name: 'Location',
        nameCn: '库位',
        description: 'Physical storage location in warehouse',
        descriptionCn: '仓库中的物理存储位置',
        typicalProperties: ['location_id', 'zone', 'aisle', 'rack', 'level', 'capacity', 'location_type']
      },
      {
        id: 'pick-order',
        name: 'Pick Order',
        nameCn: '拣货单',
        description: 'Order for picking items from warehouse',
        descriptionCn: '从仓库拣选物品的订单',
        typicalProperties: ['pick_id', 'order_id', 'items', 'priority', 'assigned_to', 'status', 'pick_path']
      },
      {
        id: 'shipment',
        name: 'Shipment',
        nameCn: '发货单',
        description: 'Outbound shipment to customer',
        descriptionCn: '发往客户的出库发货',
        typicalProperties: ['shipment_id', 'carrier', 'tracking', 'ship_date', 'destination', 'items', 'weight']
      }
    ],
    actions: [
      {
        id: 'receive-goods',
        name: 'Receive Goods',
        nameCn: '收货入库',
        targetObject: 'inventory',
        description: 'Receive and put away incoming goods',
        descriptionCn: '接收并上架入库商品'
      },
      {
        id: 'pick-items',
        name: 'Pick Items',
        nameCn: '拣货',
        targetObject: 'pick-order',
        description: 'Pick items from locations for order',
        descriptionCn: '从库位拣选订单商品'
      },
      {
        id: 'ship-order',
        name: 'Ship Order',
        nameCn: '发货',
        targetObject: 'shipment',
        description: 'Complete shipment and generate tracking',
        descriptionCn: '完成发货并生成追踪号'
      },
      {
        id: 'cycle-count',
        name: 'Cycle Count',
        nameCn: '循环盘点',
        targetObject: 'inventory',
        description: 'Perform inventory count for location',
        descriptionCn: '对库位进行库存盘点'
      }
    ],
    integrationPatterns: [
      {
        id: 'edi',
        name: 'EDI Messages',
        nameCn: 'EDI 消息',
        description: 'Electronic Data Interchange (940, 945, etc.)',
        descriptionCn: '电子数据交换（940、945等）',
        syncType: 'batch',
        complexity: 'medium'
      },
      {
        id: 'api',
        name: 'REST/SOAP API',
        nameCn: 'REST/SOAP 接口',
        description: 'Direct API integration for real-time updates',
        descriptionCn: '直接API集成用于实时更新',
        syncType: 'realtime',
        complexity: 'medium'
      },
      {
        id: 'file',
        name: 'File Exchange',
        nameCn: '文件交换',
        description: 'CSV/XML file drops for batch processing',
        descriptionCn: 'CSV/XML文件用于批量处理',
        syncType: 'batch',
        complexity: 'low'
      }
    ],
    commonChallenges: [
      { en: 'Real-time inventory accuracy', cn: '实时库存准确性' },
      { en: 'Multi-warehouse synchronization', cn: '多仓库同步' },
      { en: 'Integration with ERP and OMS', cn: '与ERP和OMS的集成' }
    ]
  },

  // Microsoft Dynamics
  {
    id: 'dynamics',
    name: 'Microsoft Dynamics 365',
    nameCn: 'Microsoft Dynamics 365',
    category: 'ERP',
    description: 'Microsoft cloud ERP and CRM platform',
    descriptionCn: '微软云端ERP和CRM平台',
    keywords: ['dynamics', 'dynamics 365', 'd365', 'microsoft dynamics', 'dynamics crm', 'dynamics erp', 'ax', 'nav'],
    objects: [
      {
        id: 'customer',
        name: 'Customer',
        nameCn: '客户',
        description: 'Customer account in D365',
        descriptionCn: 'D365中的客户账户',
        typicalProperties: ['customer_id', 'name', 'account_number', 'credit_limit', 'payment_terms', 'address', 'group']
      },
      {
        id: 'sales-order',
        name: 'Sales Order',
        nameCn: '销售订单',
        description: 'Customer sales order',
        descriptionCn: '客户销售订单',
        typicalProperties: ['order_id', 'customer_id', 'order_date', 'requested_date', 'lines', 'total', 'status']
      },
      {
        id: 'product',
        name: 'Product',
        nameCn: '产品',
        description: 'Product master in D365',
        descriptionCn: 'D365中的产品主数据',
        typicalProperties: ['product_id', 'name', 'category', 'unit', 'cost', 'price', 'status']
      }
    ],
    actions: [
      {
        id: 'create-order',
        name: 'Create Sales Order',
        nameCn: '创建销售订单',
        targetObject: 'sales-order',
        description: 'Create new sales order in D365',
        descriptionCn: '在D365中创建新销售订单'
      },
      {
        id: 'confirm-order',
        name: 'Confirm Order',
        nameCn: '确认订单',
        targetObject: 'sales-order',
        description: 'Confirm sales order for processing',
        descriptionCn: '确认销售订单以进行处理'
      }
    ],
    integrationPatterns: [
      {
        id: 'dataverse',
        name: 'Dataverse API',
        nameCn: 'Dataverse API',
        description: 'Native API for Dynamics data',
        descriptionCn: 'Dynamics数据的原生API',
        syncType: 'realtime',
        complexity: 'low'
      },
      {
        id: 'odata',
        name: 'OData Services',
        nameCn: 'OData 服务',
        description: 'RESTful OData endpoints',
        descriptionCn: 'RESTful OData端点',
        syncType: 'realtime',
        complexity: 'low'
      },
      {
        id: 'data-integrator',
        name: 'Data Integrator',
        nameCn: '数据集成器',
        description: 'Built-in integration templates',
        descriptionCn: '内置集成模板',
        syncType: 'batch',
        complexity: 'low'
      }
    ],
    commonChallenges: [
      { en: 'Customization vs configuration trade-offs', cn: '定制化与配置的权衡' },
      { en: 'Cross-module data consistency', cn: '跨模块数据一致性' },
      { en: 'Power Platform integration complexity', cn: 'Power Platform集成复杂性' }
    ]
  },

  // MES - Manufacturing Execution
  {
    id: 'mes',
    name: 'MES (Manufacturing Execution)',
    nameCn: '制造执行系统',
    category: 'MES',
    description: 'Manufacturing execution system for shop floor control',
    descriptionCn: '用于车间控制的制造执行系统',
    keywords: ['mes', 'manufacturing', '制造', '生产', 'shop floor', '车间', 'siemens opcenter', 'rockwell', 'aveva'],
    objects: [
      {
        id: 'work-order',
        name: 'Work Order',
        nameCn: '工单',
        description: 'Production work order',
        descriptionCn: '生产工单',
        typicalProperties: ['wo_id', 'product', 'quantity', 'start_date', 'due_date', 'status', 'priority', 'routing']
      },
      {
        id: 'equipment',
        name: 'Equipment',
        nameCn: '设备',
        description: 'Production equipment or machine',
        descriptionCn: '生产设备或机器',
        typicalProperties: ['equipment_id', 'name', 'type', 'location', 'status', 'last_maintenance', 'capacity']
      },
      {
        id: 'batch',
        name: 'Batch/Lot',
        nameCn: '批次',
        description: 'Production batch with traceability',
        descriptionCn: '可追溯的生产批次',
        typicalProperties: ['batch_id', 'product', 'quantity', 'production_date', 'expiry_date', 'quality_status', 'source_materials']
      }
    ],
    actions: [
      {
        id: 'start-production',
        name: 'Start Production',
        nameCn: '开始生产',
        targetObject: 'work-order',
        description: 'Begin production for work order',
        descriptionCn: '开始工单生产'
      },
      {
        id: 'record-output',
        name: 'Record Output',
        nameCn: '记录产出',
        targetObject: 'batch',
        description: 'Record production output and quality',
        descriptionCn: '记录生产产出和质量'
      },
      {
        id: 'report-downtime',
        name: 'Report Downtime',
        nameCn: '报告停机',
        targetObject: 'equipment',
        description: 'Report equipment downtime event',
        descriptionCn: '报告设备停机事件'
      }
    ],
    integrationPatterns: [
      {
        id: 'opcua',
        name: 'OPC-UA',
        nameCn: 'OPC-UA',
        description: 'Industrial protocol for machine data',
        descriptionCn: '机器数据的工业协议',
        syncType: 'realtime',
        complexity: 'high'
      },
      {
        id: 'mqtt',
        name: 'MQTT',
        nameCn: 'MQTT',
        description: 'Lightweight IoT messaging protocol',
        descriptionCn: '轻量级物联网消息协议',
        syncType: 'event',
        complexity: 'medium'
      },
      {
        id: 'rest',
        name: 'REST API',
        nameCn: 'REST API',
        description: 'HTTP-based API for business transactions',
        descriptionCn: '基于HTTP的业务事务API',
        syncType: 'realtime',
        complexity: 'low'
      }
    ],
    commonChallenges: [
      { en: 'Real-time data from PLC/SCADA', cn: '来自PLC/SCADA的实时数据' },
      { en: 'Batch traceability requirements', cn: '批次追溯要求' },
      { en: 'OT/IT security boundaries', cn: 'OT/IT安全边界' }
    ]
  }
];

// ============= Detection Functions =============

/**
 * Detect enterprise systems mentioned in text
 */
export function detectSystems(text: string): DetectedSystem[] {
  const lowerText = text.toLowerCase();
  const detected: DetectedSystem[] = [];
  const seenSystems = new Set<string>();

  for (const system of SYSTEM_DNA_DATABASE) {
    for (const keyword of system.keywords) {
      const index = lowerText.indexOf(keyword.toLowerCase());
      if (index !== -1 && !seenSystems.has(system.id)) {
        seenSystems.add(system.id);
        detected.push({
          system,
          matchedKeyword: keyword,
          position: index,
          confidence: keyword.length > 3 ? 0.9 : 0.7  // Longer keywords = higher confidence
        });
        break;  // Found this system, move to next
      }
    }
  }

  // Sort by position (first mentioned first)
  return detected.sort((a, b) => a.position - b.position);
}

/**
 * Get system by ID
 */
export function getSystemById(id: string): SystemDNA | undefined {
  return SYSTEM_DNA_DATABASE.find(s => s.id === id);
}

/**
 * Get localized text based on language
 */
export function getLocalizedText(
  item: { name: string; nameCn: string } | { description: string; descriptionCn: string },
  lang: Language
): string {
  if ('name' in item && 'nameCn' in item) {
    return lang === 'cn' ? item.nameCn : item.name;
  }
  if ('description' in item && 'descriptionCn' in item) {
    return lang === 'cn' ? item.descriptionCn : item.description;
  }
  return '';
}

/**
 * Generate integration draft from detected system
 */
export function generateIntegrationDraft(
  system: SystemDNA,
  lang: Language
): {
  integration: {
    systemName: string;
    dataPoints: string[];
    mechanism: string;
    targetObjectId: string;
  };
  suggestedObjects: Array<{
    name: string;
    description: string;
    properties: string[];
  }>;
  suggestedActions: Array<{
    name: string;
    targetObject: string;
    description: string;
  }>;
} {
  // Pick the most common integration pattern
  const recommendedPattern = system.integrationPatterns.find(p => p.complexity === 'low')
    || system.integrationPatterns[0];

  return {
    integration: {
      systemName: lang === 'cn' ? system.nameCn : system.name,
      dataPoints: system.objects.slice(0, 3).map(o => lang === 'cn' ? o.nameCn : o.name),
      mechanism: lang === 'cn' ? recommendedPattern.nameCn : recommendedPattern.name,
      targetObjectId: system.objects[0]?.id || ''
    },
    suggestedObjects: system.objects.map(obj => ({
      name: lang === 'cn' ? obj.nameCn : obj.name,
      description: lang === 'cn' ? obj.descriptionCn : obj.description,
      properties: obj.typicalProperties
    })),
    suggestedActions: system.actions.map(act => ({
      name: lang === 'cn' ? act.nameCn : act.name,
      targetObject: act.targetObject,
      description: lang === 'cn' ? act.descriptionCn : act.description
    }))
  };
}

/**
 * Get category display name
 */
export function getCategoryName(category: SystemDNA['category'], lang: Language): string {
  const names: Record<SystemDNA['category'], { en: string; cn: string }> = {
    ERP: { en: 'ERP System', cn: 'ERP系统' },
    CRM: { en: 'CRM System', cn: 'CRM系统' },
    WMS: { en: 'Warehouse Management', cn: '仓储管理' },
    HRM: { en: 'HR Management', cn: '人力资源' },
    SCM: { en: 'Supply Chain', cn: '供应链' },
    MES: { en: 'Manufacturing Execution', cn: '制造执行' },
    PLM: { en: 'Product Lifecycle', cn: '产品生命周期' },
    BI: { en: 'Business Intelligence', cn: '商业智能' },
    Custom: { en: 'Custom System', cn: '自定义系统' }
  };
  return lang === 'cn' ? names[category].cn : names[category].en;
}
