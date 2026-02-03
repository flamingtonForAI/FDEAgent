/**
 * 医疗临床运营 Archetype (基于 HL7 FHIR 标准)
 * Healthcare Clinical Operations Archetype (HL7 FHIR Based)
 *
 * 基于 HL7 FHIR R4 国际标准的医疗临床运营原型
 * 覆盖：患者管理、临床工作流、医嘱管理、检验检查、护理协调
 *
 * 参考来源：
 * - HL7 FHIR R4 (Fast Healthcare Interoperability Resources)
 * - US Core Implementation Guide
 * - SMART on FHIR Application Framework
 * - Industry Healthcare Best Practices
 *
 * 适用行业：医院、诊所、医疗集团、健康管理
 * 部署周期：3-4 周（含数据对接和合规配置）
 */

import { Archetype } from '../../types/archetype';

export const healthcareFHIRArchetype: Archetype = {
  metadata: {
    id: 'healthcare-fhir-clinical',
    name: 'Healthcare Clinical Operations (FHIR)',
    description: {
      en: 'Comprehensive healthcare clinical operations management based on HL7 FHIR R4 standard, covering Patient Management, Clinical Workflows, Order Management, Diagnostics, and Care Coordination with AI-powered clinical decision support.',
      cn: '基于 HL7 FHIR R4 国际标准的全面医疗临床运营管理方案，覆盖患者管理、临床工作流、医嘱管理、检验检查和护理协调，配备AI驱动的临床决策支持能力。'
    },
    industry: 'healthcare',
    domain: 'clinical-operations',
    version: '2.0.0',
    changelog: [
      {
        version: '2.0.0',
        date: '2026-01-26',
        changes: [
          'Full HL7 FHIR R4 alignment',
          'US Core profile compliance',
          'Clinical decision support integration',
          'Care coordination workflows',
          'HIPAA-compliant audit logging'
        ]
      }
    ],
    origin: {
      sourceEngagement: 'Leading Healthcare Systems',
      fdeContributors: ['Healthcare Excellence Team', 'Clinical Informatics Group'],
      abstractionDate: '2025-10-20'
    },
    usage: {
      deployments: 28,
      industries: ['Hospitals', 'Ambulatory Care', 'Health Systems', 'Specialty Clinics', 'Home Health'],
      avgDeploymentTime: '3.5 weeks'
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  //                    SEMANTIC LAYER - 语义层
  //           基于 HL7 FHIR 的医疗业务概念模型
  // ═══════════════════════════════════════════════════════════════════
  ontology: {
    objects: [
      // ============= 患者模型 (Patient Model) =============
      {
        id: 'patient',
        name: 'Patient',
        nameCn: '患者',
        description: 'Demographics and administrative information about a patient (FHIR Patient Resource)',
        descriptionCn: '患者的人口统计学和行政管理信息（FHIR Patient资源）',
        properties: [
          { name: 'patientId', type: 'string', description: 'Medical Record Number (MRN)' },
          { name: 'identifier', type: 'array', description: 'Additional identifiers (SSN, insurance ID, etc.)' },
          { name: 'name', type: 'object', description: 'Patient name (given, family)' },
          { name: 'birthDate', type: 'date', description: 'Date of birth' },
          { name: 'gender', type: 'string', description: 'Administrative gender' },
          { name: 'address', type: 'array', description: 'Patient addresses' },
          { name: 'telecom', type: 'array', description: 'Contact points (phone, email)' },
          { name: 'maritalStatus', type: 'string', description: 'Marital status' },
          { name: 'contact', type: 'array', description: 'Emergency contacts' },
          { name: 'communication', type: 'array', description: 'Language preferences' },
          { name: 'generalPractitioner', type: 'string', description: 'Primary care provider reference' },
          { name: 'managingOrganization', type: 'string', description: 'Organization managing the record' },
          { name: 'active', type: 'boolean', description: 'Whether record is active' },
          { name: 'deceasedBoolean', type: 'boolean', description: 'Indicates if patient is deceased' },
          // Clinical summary (AI-derived)
          {
            name: 'riskScore',
            type: 'number',
            description: 'Composite health risk score (0-100)',
            isAIDerived: true,
            logicDescription: 'ML model based on conditions, medications, social determinants, and utilization'
          },
          {
            name: 'predictedReadmissionRisk',
            type: 'number',
            description: '30-day readmission risk probability',
            isAIDerived: true,
            logicDescription: 'LACE+ model enhanced with additional clinical factors'
          },
          {
            name: 'careGaps',
            type: 'array',
            description: 'Identified gaps in preventive care',
            isAIDerived: true,
            logicDescription: 'Based on HEDIS/CMS quality measures and patient history'
          },
          {
            name: 'predictedNoShowRisk',
            type: 'number',
            description: 'Probability of missing next appointment',
            isAIDerived: true,
            logicDescription: 'ML model using historical patterns, demographics, and appointment type'
          }
        ],
        primaryKey: 'patientId',
        actions: [
          {
            name: 'Update Demographics',
            nameCn: '更新人口统计信息',
            type: 'traditional',
            description: 'Update patient demographic information',
            descriptionCn: '更新患者人口统计信息',
            businessLayer: {
              description: '更新患者基本信息如地址、联系方式等',
              targetObject: 'Patient',
              executorRole: 'Registration Staff / Patient Portal',
              triggerCondition: '患者信息变更'
            },
            logicLayer: {
              preconditions: ['患者记录存在', '用户有更新权限'],
              parameters: [
                { name: 'patientId', type: 'string', required: true, description: '患者ID' },
                { name: 'demographics', type: 'object', required: true, description: '更新的信息' }
              ],
              postconditions: ['信息已更新', '审计日志已记录'],
              sideEffects: ['同步到关联系统', '通知护理团队']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/patients/{patientId}',
              apiMethod: 'PATCH',
              agentToolSpec: {
                name: 'update_patient_demographics',
                description: 'Update patient demographic information',
                parameters: {
                  type: 'object',
                  properties: {
                    patientId: { type: 'string' },
                    demographics: { type: 'object' }
                  },
                  required: ['patientId', 'demographics']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Risk stratification and care gap identification' }
        ]
      },

      // ============= 就诊模型 (Encounter Model) =============
      {
        id: 'encounter',
        name: 'Encounter',
        nameCn: '就诊',
        description: 'An interaction between a patient and healthcare provider (FHIR Encounter Resource)',
        descriptionCn: '患者与医疗服务提供者之间的交互（FHIR Encounter资源）',
        properties: [
          { name: 'encounterId', type: 'string', description: 'Unique encounter identifier' },
          { name: 'status', type: 'string', description: 'planned/arrived/triaged/in-progress/onleave/finished/cancelled' },
          { name: 'class', type: 'string', description: 'Classification: inpatient/outpatient/emergency/home' },
          { name: 'type', type: 'array', description: 'Specific type of encounter (e.g., annual checkup)' },
          { name: 'priority', type: 'string', description: 'Encounter priority (routine, urgent, emergency)' },
          { name: 'subject', type: 'string', description: 'Patient reference' },
          { name: 'participant', type: 'array', description: 'Providers involved in encounter' },
          { name: 'period', type: 'object', description: 'Start and end time' },
          { name: 'length', type: 'number', description: 'Duration in minutes' },
          { name: 'reasonCode', type: 'array', description: 'Coded reason for encounter' },
          { name: 'reasonReference', type: 'array', description: 'Reason as condition/procedure reference' },
          { name: 'diagnosis', type: 'array', description: 'Diagnoses related to encounter' },
          { name: 'location', type: 'array', description: 'Location(s) where encounter occurred' },
          { name: 'serviceProvider', type: 'string', description: 'Organization responsible' },
          { name: 'hospitalization', type: 'object', description: 'Details for inpatient stays' },
          // AI-derived
          {
            name: 'acuityLevel',
            type: 'number',
            description: 'AI-assessed acuity level (1-5)',
            isAIDerived: true,
            logicDescription: 'NLP analysis of chief complaint, vitals, and history'
          },
          {
            name: 'estimatedLOS',
            type: 'number',
            description: 'Estimated length of stay (hours)',
            isAIDerived: true,
            logicDescription: 'ML model based on diagnosis, patient factors, and historical patterns'
          }
        ],
        primaryKey: 'encounterId',
        actions: [
          {
            name: 'Check In Patient',
            nameCn: '患者签到',
            type: 'traditional',
            description: 'Check in patient for scheduled encounter',
            descriptionCn: '为预约就诊的患者签到',
            businessLayer: {
              description: '患者到达后签到并更新就诊状态',
              targetObject: 'Encounter',
              executorRole: 'Front Desk / Kiosk',
              triggerCondition: '患者到达预约地点'
            },
            logicLayer: {
              preconditions: ['就诊状态为planned', '在预约时间窗口内'],
              parameters: [
                { name: 'encounterId', type: 'string', required: true, description: '就诊ID' },
                { name: 'arrivalTime', type: 'datetime', required: false, description: '到达时间' }
              ],
              postconditions: ['就诊状态更新为arrived', '等候队列已更新'],
              sideEffects: ['通知护理团队', '更新等候室显示']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/encounters/{encounterId}/check-in',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'check_in_patient',
                description: 'Check in patient for scheduled encounter',
                parameters: {
                  type: 'object',
                  properties: {
                    encounterId: { type: 'string' },
                    arrivalTime: { type: 'string', format: 'date-time' }
                  },
                  required: ['encounterId']
                }
              }
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Discharge Patient',
            nameCn: '患者出院',
            type: 'traditional',
            description: 'Complete discharge process for inpatient encounter',
            descriptionCn: '完成住院患者的出院流程',
            businessLayer: {
              description: '完成出院评估、医嘱和文书',
              targetObject: 'Encounter',
              executorRole: 'Attending Physician / Discharge Coordinator',
              triggerCondition: '患者符合出院条件'
            },
            logicLayer: {
              preconditions: ['所有出院条件已满足', '出院医嘱已完成', '出院教育已提供'],
              parameters: [
                { name: 'encounterId', type: 'string', required: true, description: '就诊ID' },
                { name: 'dischargeDisposition', type: 'string', required: true, description: '出院去向' },
                { name: 'dischargeInstructions', type: 'string', required: true, description: '出院指导' }
              ],
              postconditions: ['就诊状态为finished', '出院摘要已生成'],
              sideEffects: ['发送给PCP', '安排随访', '更新床位状态']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/encounters/{encounterId}/discharge',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'discharge_patient',
                description: 'Complete discharge process for inpatient',
                parameters: {
                  type: 'object',
                  properties: {
                    encounterId: { type: 'string' },
                    dischargeDisposition: { type: 'string', enum: ['home', 'snf', 'rehab', 'ama', 'expired'] },
                    dischargeInstructions: { type: 'string' }
                  },
                  required: ['encounterId', 'dischargeDisposition', 'dischargeInstructions']
                }
              }
            },
            governance: { permissionTier: 3, requiresHumanApproval: true, auditLog: true, riskLevel: 'high' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Acuity assessment and length of stay prediction' }
        ]
      },

      // ============= 临床诊断模型 (Condition Model) =============
      {
        id: 'condition',
        name: 'Condition',
        nameCn: '临床诊断',
        description: 'A clinical condition, problem, diagnosis, or health concern (FHIR Condition Resource)',
        descriptionCn: '临床状况、问题、诊断或健康关注点（FHIR Condition资源）',
        properties: [
          { name: 'conditionId', type: 'string', description: 'Unique condition identifier' },
          { name: 'clinicalStatus', type: 'string', description: 'active/recurrence/relapse/inactive/remission/resolved' },
          { name: 'verificationStatus', type: 'string', description: 'unconfirmed/provisional/differential/confirmed/refuted' },
          { name: 'category', type: 'array', description: 'problem-list-item/encounter-diagnosis/health-concern' },
          { name: 'severity', type: 'string', description: 'Severity (mild/moderate/severe)' },
          { name: 'code', type: 'object', description: 'Condition code (ICD-10, SNOMED CT)' },
          { name: 'bodySite', type: 'array', description: 'Anatomical location' },
          { name: 'subject', type: 'string', description: 'Patient reference' },
          { name: 'encounter', type: 'string', description: 'Encounter when condition was recorded' },
          { name: 'onsetDateTime', type: 'datetime', description: 'When condition started' },
          { name: 'abatementDateTime', type: 'datetime', description: 'When condition resolved' },
          { name: 'recordedDate', type: 'datetime', description: 'When condition was recorded' },
          { name: 'recorder', type: 'string', description: 'Who recorded the condition' },
          { name: 'asserter', type: 'string', description: 'Who asserted the condition' },
          { name: 'evidence', type: 'array', description: 'Supporting evidence' },
          { name: 'note', type: 'array', description: 'Clinical notes' },
          // AI-derived
          {
            name: 'progressionRisk',
            type: 'number',
            description: 'Risk of condition progression/worsening',
            isAIDerived: true,
            logicDescription: 'ML model based on condition type, patient factors, and treatment adherence'
          },
          {
            name: 'complicationRisk',
            type: 'array',
            description: 'Likely complications and their probabilities',
            isAIDerived: true,
            logicDescription: 'Clinical knowledge graph with patient-specific risk factors'
          }
        ],
        primaryKey: 'conditionId',
        actions: [
          {
            name: 'Add Diagnosis',
            nameCn: '添加诊断',
            type: 'traditional',
            description: 'Record a new diagnosis for patient',
            descriptionCn: '为患者记录新诊断',
            businessLayer: {
              description: '根据临床评估添加诊断',
              targetObject: 'Condition',
              executorRole: 'Physician',
              triggerCondition: '临床评估完成'
            },
            logicLayer: {
              preconditions: ['患者存在有效就诊', '用户有诊断权限'],
              parameters: [
                { name: 'patientId', type: 'string', required: true, description: '患者ID' },
                { name: 'encounterId', type: 'string', required: true, description: '就诊ID' },
                { name: 'code', type: 'object', required: true, description: '诊断编码(ICD-10/SNOMED)' },
                { name: 'category', type: 'string', required: true, description: '诊断类别' },
                { name: 'severity', type: 'string', required: false, description: '严重程度' }
              ],
              postconditions: ['诊断已记录', '问题列表已更新'],
              sideEffects: ['触发临床决策支持', '更新风险评分']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/conditions',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'add_diagnosis',
                description: 'Record a new diagnosis for patient',
                parameters: {
                  type: 'object',
                  properties: {
                    patientId: { type: 'string' },
                    encounterId: { type: 'string' },
                    code: { type: 'object', properties: { system: { type: 'string' }, code: { type: 'string' }, display: { type: 'string' } } },
                    category: { type: 'string' },
                    severity: { type: 'string' }
                  },
                  required: ['patientId', 'encounterId', 'code', 'category']
                }
              }
            },
            governance: { permissionTier: 3, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Disease progression and complication risk prediction' }
        ]
      },

      // ============= 药物医嘱模型 (Medication Request Model) =============
      {
        id: 'medication-request',
        name: 'Medication Request',
        nameCn: '药物医嘱',
        description: 'An order or request for medication (FHIR MedicationRequest Resource)',
        descriptionCn: '药物医嘱或处方请求（FHIR MedicationRequest资源）',
        properties: [
          { name: 'medicationRequestId', type: 'string', description: 'Unique request identifier' },
          { name: 'status', type: 'string', description: 'active/on-hold/cancelled/completed/stopped/draft' },
          { name: 'intent', type: 'string', description: 'proposal/plan/order/instance-order/filler-order' },
          { name: 'category', type: 'array', description: 'inpatient/outpatient/community/discharge' },
          { name: 'priority', type: 'string', description: 'routine/urgent/asap/stat' },
          { name: 'medicationCodeableConcept', type: 'object', description: 'Medication code (RxNorm)' },
          { name: 'subject', type: 'string', description: 'Patient reference' },
          { name: 'encounter', type: 'string', description: 'Associated encounter' },
          { name: 'authoredOn', type: 'datetime', description: 'When request was authored' },
          { name: 'requester', type: 'string', description: 'Prescriber reference' },
          { name: 'reasonCode', type: 'array', description: 'Reason for prescription' },
          { name: 'dosageInstruction', type: 'array', description: 'Dosage instructions' },
          { name: 'dispenseRequest', type: 'object', description: 'Dispensing details' },
          { name: 'substitution', type: 'object', description: 'Generic substitution allowed' },
          { name: 'priorPrescription', type: 'string', description: 'Prior prescription reference' },
          // AI-derived
          {
            name: 'drugInteractionAlerts',
            type: 'array',
            description: 'Potential drug-drug interactions',
            isAIDerived: true,
            logicDescription: 'Real-time check against patient medication list using clinical database'
          },
          {
            name: 'allergyAlerts',
            type: 'array',
            description: 'Potential allergy conflicts',
            isAIDerived: true,
            logicDescription: 'Cross-reference with documented allergies and intolerances'
          },
          {
            name: 'adherencePrediction',
            type: 'number',
            description: 'Predicted medication adherence probability',
            isAIDerived: true,
            logicDescription: 'ML model based on complexity, cost, patient history, and social factors'
          }
        ],
        primaryKey: 'medicationRequestId',
        actions: [
          {
            name: 'Prescribe Medication',
            nameCn: '开具处方',
            type: 'ai-assisted',
            description: 'Create a new medication prescription with AI safety checks',
            descriptionCn: '创建新药物处方并进行AI安全检查',
            businessLayer: {
              description: '开具药物处方，自动进行药物相互作用和过敏检查',
              targetObject: 'Medication Request',
              executorRole: 'Physician / NP / PA',
              triggerCondition: '临床需要药物治疗'
            },
            logicLayer: {
              preconditions: ['用户有处方权限', '患者过敏信息已核实'],
              parameters: [
                { name: 'patientId', type: 'string', required: true, description: '患者ID' },
                { name: 'medication', type: 'object', required: true, description: '药物信息' },
                { name: 'dosage', type: 'object', required: true, description: '剂量信息' },
                { name: 'quantity', type: 'number', required: true, description: '数量' },
                { name: 'refills', type: 'number', required: false, description: '续药次数' }
              ],
              postconditions: ['处方已创建', '安全检查已完成'],
              sideEffects: ['发送到药房', '更新用药列表', '记录审计日志']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/medication-requests',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'prescribe_medication',
                description: 'Create a medication prescription with safety checks',
                parameters: {
                  type: 'object',
                  properties: {
                    patientId: { type: 'string' },
                    medication: { type: 'object', properties: { code: { type: 'string' }, display: { type: 'string' } } },
                    dosage: { type: 'object' },
                    quantity: { type: 'number' },
                    refills: { type: 'number' }
                  },
                  required: ['patientId', 'medication', 'dosage', 'quantity']
                }
              }
            },
            governance: { permissionTier: 3, requiresHumanApproval: false, auditLog: true, riskLevel: 'high' }
          },
          {
            name: 'Discontinue Medication',
            nameCn: '停药',
            type: 'traditional',
            description: 'Discontinue an active medication order',
            descriptionCn: '停止有效的药物医嘱',
            businessLayer: {
              description: '停止当前药物医嘱',
              targetObject: 'Medication Request',
              executorRole: 'Physician',
              triggerCondition: '临床判断需要停药'
            },
            logicLayer: {
              preconditions: ['医嘱状态为active', '用户有停药权限'],
              parameters: [
                { name: 'medicationRequestId', type: 'string', required: true, description: '医嘱ID' },
                { name: 'reason', type: 'string', required: true, description: '停药原因' }
              ],
              postconditions: ['医嘱状态更新为stopped', '停药原因已记录'],
              sideEffects: ['通知药房', '更新用药列表']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/medication-requests/{medicationRequestId}/discontinue',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'discontinue_medication',
                description: 'Discontinue active medication order',
                parameters: {
                  type: 'object',
                  properties: {
                    medicationRequestId: { type: 'string' },
                    reason: { type: 'string' }
                  },
                  required: ['medicationRequestId', 'reason']
                }
              }
            },
            governance: { permissionTier: 3, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Drug interaction detection and adherence prediction' },
          { type: 'AI-Assisted Action', description: 'Intelligent prescription safety checks' }
        ]
      },

      // ============= 检验医嘱模型 (Service Request Model) =============
      {
        id: 'service-request',
        name: 'Service Request',
        nameCn: '检查医嘱',
        description: 'A request for diagnostic or treatment services (FHIR ServiceRequest Resource)',
        descriptionCn: '诊断或治疗服务请求（FHIR ServiceRequest资源）',
        properties: [
          { name: 'serviceRequestId', type: 'string', description: 'Unique request identifier' },
          { name: 'status', type: 'string', description: 'draft/active/on-hold/revoked/completed' },
          { name: 'intent', type: 'string', description: 'proposal/plan/order/filler-order' },
          { name: 'category', type: 'array', description: 'Service category' },
          { name: 'priority', type: 'string', description: 'routine/urgent/asap/stat' },
          { name: 'code', type: 'object', description: 'Service/procedure code (CPT, LOINC)' },
          { name: 'subject', type: 'string', description: 'Patient reference' },
          { name: 'encounter', type: 'string', description: 'Associated encounter' },
          { name: 'authoredOn', type: 'datetime', description: 'When request was created' },
          { name: 'requester', type: 'string', description: 'Ordering provider' },
          { name: 'performer', type: 'array', description: 'Requested performer' },
          { name: 'reasonCode', type: 'array', description: 'Clinical reason' },
          { name: 'insurance', type: 'array', description: 'Insurance coverage' },
          { name: 'note', type: 'array', description: 'Clinical notes' },
          { name: 'patientInstruction', type: 'string', description: 'Instructions for patient' }
        ],
        primaryKey: 'serviceRequestId',
        actions: [
          {
            name: 'Order Lab Test',
            nameCn: '开具检验医嘱',
            type: 'traditional',
            description: 'Order a laboratory test',
            descriptionCn: '开具实验室检验医嘱',
            businessLayer: {
              description: '创建检验医嘱并发送到实验室',
              targetObject: 'Service Request',
              executorRole: 'Physician / NP / PA',
              triggerCondition: '临床需要诊断检验'
            },
            logicLayer: {
              preconditions: ['用户有开具检验权限', '患者身份已确认'],
              parameters: [
                { name: 'patientId', type: 'string', required: true, description: '患者ID' },
                { name: 'encounterId', type: 'string', required: true, description: '就诊ID' },
                { name: 'testCode', type: 'object', required: true, description: '检验代码(LOINC)' },
                { name: 'priority', type: 'string', required: false, description: '优先级' },
                { name: 'specimenInstructions', type: 'string', required: false, description: '采样说明' }
              ],
              postconditions: ['医嘱已创建', '发送到实验室系统'],
              sideEffects: ['生成采样任务', '通知护理团队']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/service-requests/lab',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'order_lab_test',
                description: 'Order a laboratory test',
                parameters: {
                  type: 'object',
                  properties: {
                    patientId: { type: 'string' },
                    encounterId: { type: 'string' },
                    testCode: { type: 'object' },
                    priority: { type: 'string', enum: ['routine', 'urgent', 'stat'] },
                    specimenInstructions: { type: 'string' }
                  },
                  required: ['patientId', 'encounterId', 'testCode']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Order Imaging Study',
            nameCn: '开具影像检查',
            type: 'ai-assisted',
            description: 'Order imaging study with AI appropriateness guidance',
            descriptionCn: '开具影像检查医嘱，带AI适宜性指导',
            businessLayer: {
              description: '创建影像检查医嘱，AI提供适宜性建议',
              targetObject: 'Service Request',
              executorRole: 'Physician',
              triggerCondition: '临床需要影像诊断'
            },
            logicLayer: {
              preconditions: ['用户有开具影像权限', '临床适应症已记录'],
              parameters: [
                { name: 'patientId', type: 'string', required: true, description: '患者ID' },
                { name: 'studyCode', type: 'object', required: true, description: '检查代码(CPT)' },
                { name: 'clinicalIndication', type: 'string', required: true, description: '临床适应症' },
                { name: 'priority', type: 'string', required: false, description: '优先级' }
              ],
              postconditions: ['医嘱已创建', 'ACR适宜性评分已记录'],
              sideEffects: ['发送到放射科', '安排检查时间']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/service-requests/imaging',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'order_imaging_study',
                description: 'Order imaging study with appropriateness check',
                parameters: {
                  type: 'object',
                  properties: {
                    patientId: { type: 'string' },
                    studyCode: { type: 'object' },
                    clinicalIndication: { type: 'string' },
                    priority: { type: 'string' }
                  },
                  required: ['patientId', 'studyCode', 'clinicalIndication']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          { type: 'AI-Assisted Action', description: 'Imaging appropriateness criteria guidance' }
        ]
      },

      // ============= 检验结果模型 (Observation Model) =============
      {
        id: 'observation',
        name: 'Observation',
        nameCn: '观察结果',
        description: 'Measurements, test results, or simple assertions (FHIR Observation Resource)',
        descriptionCn: '测量值、检验结果或简单陈述（FHIR Observation资源）',
        properties: [
          { name: 'observationId', type: 'string', description: 'Unique observation identifier' },
          { name: 'status', type: 'string', description: 'registered/preliminary/final/amended/cancelled' },
          { name: 'category', type: 'array', description: 'vital-signs/laboratory/imaging/exam' },
          { name: 'code', type: 'object', description: 'Observation code (LOINC)' },
          { name: 'subject', type: 'string', description: 'Patient reference' },
          { name: 'encounter', type: 'string', description: 'Associated encounter' },
          { name: 'effectiveDateTime', type: 'datetime', description: 'When observation was made' },
          { name: 'issued', type: 'datetime', description: 'When result was available' },
          { name: 'performer', type: 'array', description: 'Who performed observation' },
          { name: 'valueQuantity', type: 'object', description: 'Numeric result with units' },
          { name: 'valueString', type: 'string', description: 'Text result' },
          { name: 'valueCodeableConcept', type: 'object', description: 'Coded result' },
          { name: 'interpretation', type: 'array', description: 'High/Low/Normal/Critical' },
          { name: 'referenceRange', type: 'array', description: 'Normal reference range' },
          { name: 'note', type: 'array', description: 'Comments' },
          // AI-derived
          {
            name: 'trendAnalysis',
            type: 'object',
            description: 'Historical trend analysis',
            isAIDerived: true,
            logicDescription: 'Time series analysis of patient historical values'
          },
          {
            name: 'clinicalSignificance',
            type: 'string',
            description: 'AI assessment of clinical significance',
            isAIDerived: true,
            logicDescription: 'Contextual analysis considering patient history and conditions'
          }
        ],
        primaryKey: 'observationId',
        actions: [
          {
            name: 'Record Vital Signs',
            nameCn: '记录生命体征',
            type: 'traditional',
            description: 'Record patient vital signs',
            descriptionCn: '记录患者生命体征',
            businessLayer: {
              description: '记录患者生命体征测量值',
              targetObject: 'Observation',
              executorRole: 'Nurse / MA / Patient Device',
              triggerCondition: '护理流程或患者自测'
            },
            logicLayer: {
              preconditions: ['患者存在有效就诊或监测计划'],
              parameters: [
                { name: 'patientId', type: 'string', required: true, description: '患者ID' },
                { name: 'vitals', type: 'array', required: true, description: '生命体征数组' }
              ],
              postconditions: ['生命体征已记录', '异常已标记'],
              sideEffects: ['触发临床警报（如异常）', '更新患者摘要']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/observations/vitals',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'record_vital_signs',
                description: 'Record patient vital signs',
                parameters: {
                  type: 'object',
                  properties: {
                    patientId: { type: 'string' },
                    vitals: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          code: { type: 'string' },
                          value: { type: 'number' },
                          unit: { type: 'string' }
                        }
                      }
                    }
                  },
                  required: ['patientId', 'vitals']
                }
              }
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Trend analysis and clinical significance assessment' }
        ]
      },

      // ============= 护理计划模型 (Care Plan Model) =============
      {
        id: 'care-plan',
        name: 'Care Plan',
        nameCn: '护理计划',
        description: 'A plan for patient care activities and goals (FHIR CarePlan Resource)',
        descriptionCn: '患者护理活动和目标计划（FHIR CarePlan资源）',
        properties: [
          { name: 'carePlanId', type: 'string', description: 'Unique care plan identifier' },
          { name: 'status', type: 'string', description: 'draft/active/on-hold/revoked/completed' },
          { name: 'intent', type: 'string', description: 'proposal/plan/order/option' },
          { name: 'category', type: 'array', description: 'Care plan category' },
          { name: 'title', type: 'string', description: 'Care plan title' },
          { name: 'description', type: 'string', description: 'Summary of care plan' },
          { name: 'subject', type: 'string', description: 'Patient reference' },
          { name: 'period', type: 'object', description: 'Care plan period' },
          { name: 'created', type: 'datetime', description: 'Creation date' },
          { name: 'author', type: 'string', description: 'Care plan author' },
          { name: 'careTeam', type: 'array', description: 'Care team members' },
          { name: 'addresses', type: 'array', description: 'Conditions addressed' },
          { name: 'goal', type: 'array', description: 'Care goals' },
          { name: 'activity', type: 'array', description: 'Planned activities' },
          { name: 'note', type: 'array', description: 'Notes' },
          // AI-derived
          {
            name: 'adherenceScore',
            type: 'number',
            description: 'Care plan adherence score',
            isAIDerived: true,
            logicDescription: 'Calculated from completed vs planned activities and goal progress'
          },
          {
            name: 'recommendedInterventions',
            type: 'array',
            description: 'AI-recommended care interventions',
            isAIDerived: true,
            logicDescription: 'Based on evidence-based guidelines and patient-specific factors'
          }
        ],
        primaryKey: 'carePlanId',
        actions: [
          {
            name: 'Create Care Plan',
            nameCn: '创建护理计划',
            type: 'ai-assisted',
            description: 'Create a new care plan with AI recommendations',
            descriptionCn: '创建新护理计划，带AI推荐',
            businessLayer: {
              description: '基于患者情况和循证指南创建护理计划',
              targetObject: 'Care Plan',
              executorRole: 'Care Manager / Physician',
              triggerCondition: '新诊断或护理需求变化'
            },
            logicLayer: {
              preconditions: ['患者记录完整', '用户有护理计划权限'],
              parameters: [
                { name: 'patientId', type: 'string', required: true, description: '患者ID' },
                { name: 'conditions', type: 'array', required: true, description: '针对的诊断' },
                { name: 'goals', type: 'array', required: true, description: '护理目标' },
                { name: 'activities', type: 'array', required: false, description: '计划活动' }
              ],
              postconditions: ['护理计划已创建', '护理团队已通知'],
              sideEffects: ['生成提醒任务', '安排随访']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/care-plans',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'create_care_plan',
                description: 'Create care plan with AI recommendations',
                parameters: {
                  type: 'object',
                  properties: {
                    patientId: { type: 'string' },
                    conditions: { type: 'array', items: { type: 'string' } },
                    goals: { type: 'array' },
                    activities: { type: 'array' }
                  },
                  required: ['patientId', 'conditions', 'goals']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'Adherence tracking and intervention recommendations' },
          { type: 'AI-Assisted Action', description: 'Evidence-based care plan generation' }
        ]
      },

      // ============= 预约模型 (Appointment Model) =============
      {
        id: 'appointment',
        name: 'Appointment',
        nameCn: '预约',
        description: 'A booking for a healthcare event (FHIR Appointment Resource)',
        descriptionCn: '医疗服务事件的预约（FHIR Appointment资源）',
        properties: [
          { name: 'appointmentId', type: 'string', description: 'Unique appointment identifier' },
          { name: 'status', type: 'string', description: 'proposed/pending/booked/arrived/fulfilled/cancelled/noshow' },
          { name: 'serviceCategory', type: 'array', description: 'Service category' },
          { name: 'serviceType', type: 'array', description: 'Specific service type' },
          { name: 'specialty', type: 'array', description: 'Provider specialty' },
          { name: 'appointmentType', type: 'object', description: 'Type of appointment' },
          { name: 'reasonCode', type: 'array', description: 'Reason for appointment' },
          { name: 'priority', type: 'number', description: 'Priority (0-9)' },
          { name: 'start', type: 'datetime', description: 'Start date/time' },
          { name: 'end', type: 'datetime', description: 'End date/time' },
          { name: 'minutesDuration', type: 'number', description: 'Duration in minutes' },
          { name: 'slot', type: 'array', description: 'Time slot reference' },
          { name: 'participant', type: 'array', description: 'Participants (patient, providers)' },
          { name: 'requestedPeriod', type: 'array', description: 'Requested date/time ranges' },
          // AI-derived
          {
            name: 'noShowProbability',
            type: 'number',
            description: 'Predicted no-show probability',
            isAIDerived: true,
            logicDescription: 'ML model based on patient history, appointment type, day/time, weather'
          },
          {
            name: 'suggestedOverbooking',
            type: 'boolean',
            description: 'Suggest overbooking based on no-show risk',
            isAIDerived: true,
            logicDescription: 'Recommendation based on provider capacity and historical patterns'
          }
        ],
        primaryKey: 'appointmentId',
        actions: [
          {
            name: 'Schedule Appointment',
            nameCn: '预约挂号',
            type: 'traditional',
            description: 'Schedule a new appointment',
            descriptionCn: '创建新预约',
            businessLayer: {
              description: '为患者预约医疗服务',
              targetObject: 'Appointment',
              executorRole: 'Scheduler / Patient Portal / Call Center',
              triggerCondition: '患者请求或临床需求'
            },
            logicLayer: {
              preconditions: ['时间槽可用', '患者资格已验证'],
              parameters: [
                { name: 'patientId', type: 'string', required: true, description: '患者ID' },
                { name: 'providerId', type: 'string', required: true, description: '医生ID' },
                { name: 'appointmentType', type: 'string', required: true, description: '预约类型' },
                { name: 'startTime', type: 'datetime', required: true, description: '开始时间' },
                { name: 'duration', type: 'number', required: false, description: '时长(分钟)' }
              ],
              postconditions: ['预约已创建', '时间槽已占用'],
              sideEffects: ['发送确认通知', '添加到医生日程']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/appointments',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'schedule_appointment',
                description: 'Schedule a new appointment',
                parameters: {
                  type: 'object',
                  properties: {
                    patientId: { type: 'string' },
                    providerId: { type: 'string' },
                    appointmentType: { type: 'string' },
                    startTime: { type: 'string', format: 'date-time' },
                    duration: { type: 'number' }
                  },
                  required: ['patientId', 'providerId', 'appointmentType', 'startTime']
                }
              }
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          },
          {
            name: 'Cancel Appointment',
            nameCn: '取消预约',
            type: 'traditional',
            description: 'Cancel an existing appointment',
            descriptionCn: '取消现有预约',
            businessLayer: {
              description: '取消预约并释放时间槽',
              targetObject: 'Appointment',
              executorRole: 'Scheduler / Patient',
              triggerCondition: '患者请求或临床原因'
            },
            logicLayer: {
              preconditions: ['预约存在且未完成'],
              parameters: [
                { name: 'appointmentId', type: 'string', required: true, description: '预约ID' },
                { name: 'reason', type: 'string', required: true, description: '取消原因' }
              ],
              postconditions: ['预约状态为cancelled', '时间槽已释放'],
              sideEffects: ['发送取消通知', '触发等候列表']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/appointments/{appointmentId}/cancel',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'cancel_appointment',
                description: 'Cancel an appointment',
                parameters: {
                  type: 'object',
                  properties: {
                    appointmentId: { type: 'string' },
                    reason: { type: 'string' }
                  },
                  required: ['appointmentId', 'reason']
                }
              }
            },
            governance: { permissionTier: 1, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ],
        aiFeatures: [
          { type: 'Smart Property', description: 'No-show prediction and scheduling optimization' }
        ]
      },

      // ============= 护理团队模型 (Care Team Model) =============
      {
        id: 'care-team',
        name: 'Care Team',
        nameCn: '护理团队',
        description: 'A care team assigned to patient care (FHIR CareTeam Resource)',
        descriptionCn: '负责患者护理的团队（FHIR CareTeam资源）',
        properties: [
          { name: 'careTeamId', type: 'string', description: 'Unique care team identifier' },
          { name: 'status', type: 'string', description: 'proposed/active/suspended/inactive' },
          { name: 'category', type: 'array', description: 'Care team category' },
          { name: 'name', type: 'string', description: 'Care team name' },
          { name: 'subject', type: 'string', description: 'Patient reference' },
          { name: 'period', type: 'object', description: 'Care team active period' },
          { name: 'participant', type: 'array', description: 'Team members with roles' },
          { name: 'reasonCode', type: 'array', description: 'Why care team exists' },
          { name: 'managingOrganization', type: 'array', description: 'Managing organizations' },
          { name: 'telecom', type: 'array', description: 'Team contact information' },
          { name: 'note', type: 'array', description: 'Notes' }
        ],
        primaryKey: 'careTeamId',
        actions: [
          {
            name: 'Add Team Member',
            nameCn: '添加团队成员',
            type: 'traditional',
            description: 'Add a provider to the care team',
            descriptionCn: '添加医疗人员到护理团队',
            businessLayer: {
              description: '将医疗人员添加到患者护理团队',
              targetObject: 'Care Team',
              executorRole: 'Care Coordinator',
              triggerCondition: '护理需求变化或专科会诊'
            },
            logicLayer: {
              preconditions: ['护理团队存在', '提供者有相关资质'],
              parameters: [
                { name: 'careTeamId', type: 'string', required: true, description: '护理团队ID' },
                { name: 'providerId', type: 'string', required: true, description: '医疗人员ID' },
                { name: 'role', type: 'string', required: true, description: '角色' }
              ],
              postconditions: ['成员已添加', '通知已发送'],
              sideEffects: ['更新访问权限', '发送加入通知']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/care-teams/{careTeamId}/members',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'add_care_team_member',
                description: 'Add provider to care team',
                parameters: {
                  type: 'object',
                  properties: {
                    careTeamId: { type: 'string' },
                    providerId: { type: 'string' },
                    role: { type: 'string' }
                  },
                  required: ['careTeamId', 'providerId', 'role']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'low' }
          }
        ]
      },

      // ============= 过敏信息模型 (Allergy Intolerance Model) =============
      {
        id: 'allergy-intolerance',
        name: 'Allergy Intolerance',
        nameCn: '过敏史',
        description: 'Allergy or intolerance information (FHIR AllergyIntolerance Resource)',
        descriptionCn: '过敏或不耐受信息（FHIR AllergyIntolerance资源）',
        properties: [
          { name: 'allergyId', type: 'string', description: 'Unique allergy identifier' },
          { name: 'clinicalStatus', type: 'string', description: 'active/inactive/resolved' },
          { name: 'verificationStatus', type: 'string', description: 'unconfirmed/confirmed/refuted' },
          { name: 'type', type: 'string', description: 'allergy/intolerance' },
          { name: 'category', type: 'array', description: 'food/medication/environment/biologic' },
          { name: 'criticality', type: 'string', description: 'low/high/unable-to-assess' },
          { name: 'code', type: 'object', description: 'Allergen code' },
          { name: 'patient', type: 'string', description: 'Patient reference' },
          { name: 'onsetDateTime', type: 'datetime', description: 'When allergy was identified' },
          { name: 'recordedDate', type: 'datetime', description: 'When recorded' },
          { name: 'recorder', type: 'string', description: 'Who recorded' },
          { name: 'asserter', type: 'string', description: 'Who asserted' },
          { name: 'lastOccurrence', type: 'datetime', description: 'Last reaction date' },
          { name: 'reaction', type: 'array', description: 'Reaction details' },
          { name: 'note', type: 'array', description: 'Notes' }
        ],
        primaryKey: 'allergyId',
        actions: [
          {
            name: 'Document Allergy',
            nameCn: '记录过敏',
            type: 'traditional',
            description: 'Document a new allergy or intolerance',
            descriptionCn: '记录新的过敏或不耐受',
            businessLayer: {
              description: '记录患者过敏或不耐受信息',
              targetObject: 'Allergy Intolerance',
              executorRole: 'Nurse / Physician / Patient Portal',
              triggerCondition: '发现新过敏或患者报告'
            },
            logicLayer: {
              preconditions: ['患者记录存在'],
              parameters: [
                { name: 'patientId', type: 'string', required: true, description: '患者ID' },
                { name: 'allergen', type: 'object', required: true, description: '过敏原' },
                { name: 'reaction', type: 'array', required: false, description: '反应描述' },
                { name: 'criticality', type: 'string', required: false, description: '严重程度' }
              ],
              postconditions: ['过敏已记录', '标记已更新'],
              sideEffects: ['触发用药检查', '更新患者摘要']
            },
            implementationLayer: {
              apiEndpoint: '/api/v1/allergy-intolerances',
              apiMethod: 'POST',
              agentToolSpec: {
                name: 'document_allergy',
                description: 'Document allergy or intolerance',
                parameters: {
                  type: 'object',
                  properties: {
                    patientId: { type: 'string' },
                    allergen: { type: 'object' },
                    reaction: { type: 'array' },
                    criticality: { type: 'string', enum: ['low', 'high'] }
                  },
                  required: ['patientId', 'allergen']
                }
              }
            },
            governance: { permissionTier: 2, requiresHumanApproval: false, auditLog: true, riskLevel: 'medium' }
          }
        ]
      }
    ],

    // ============= 关系定义 (Relationships) =============
    links: [
      { sourceId: 'patient', targetId: 'encounter', relation: 'has', description: 'Patient encounters' },
      { sourceId: 'patient', targetId: 'condition', relation: 'has', description: 'Patient conditions' },
      { sourceId: 'patient', targetId: 'medication-request', relation: 'has', description: 'Patient medications' },
      { sourceId: 'patient', targetId: 'observation', relation: 'has', description: 'Patient observations' },
      { sourceId: 'patient', targetId: 'appointment', relation: 'has', description: 'Patient appointments' },
      { sourceId: 'patient', targetId: 'care-plan', relation: 'has', description: 'Patient care plans' },
      { sourceId: 'patient', targetId: 'care-team', relation: 'managed by', description: 'Patient care team' },
      { sourceId: 'patient', targetId: 'allergy-intolerance', relation: 'has', description: 'Patient allergies' },
      { sourceId: 'encounter', targetId: 'condition', relation: 'diagnoses', description: 'Encounter diagnoses' },
      { sourceId: 'encounter', targetId: 'medication-request', relation: 'generates', description: 'Encounter medications' },
      { sourceId: 'encounter', targetId: 'service-request', relation: 'generates', description: 'Encounter orders' },
      { sourceId: 'encounter', targetId: 'observation', relation: 'produces', description: 'Encounter observations' },
      { sourceId: 'service-request', targetId: 'observation', relation: 'results in', description: 'Order results' },
      { sourceId: 'care-plan', targetId: 'condition', relation: 'addresses', description: 'Care plan conditions' },
      { sourceId: 'care-team', targetId: 'care-plan', relation: 'manages', description: 'Team care plans' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  //                    KINETIC LAYER - 动态层
  //           数据连接器配置（EHR、LIS、RIS、药房）
  // ═══════════════════════════════════════════════════════════════════
  connectors: [
    {
      id: 'ehr-system',
      name: 'EHR System Connector (Epic/Cerner)',
      sourceType: 'ehr',
      targetObjects: ['patient', 'encounter', 'condition', 'medication-request', 'observation', 'appointment'],
      syncFrequency: 'real-time',
      configuration: {
        connectionType: 'FHIR R4 API + HL7v2',
        supportedSystems: ['Epic', 'Cerner', 'MEDITECH', 'Allscripts'],
        dataFormat: 'FHIR JSON + HL7v2',
        authMethod: 'SMART on FHIR OAuth2'
      },
      fieldMapping: [
        { source: 'Patient.id', target: 'patient.patientId', transformation: 'none' },
        { source: 'Encounter.id', target: 'encounter.encounterId', transformation: 'none' },
        { source: 'Condition.code.coding[0]', target: 'condition.code', transformation: 'extract_coding()' }
      ]
    },
    {
      id: 'lab-system',
      name: 'Laboratory Information System (LIS)',
      sourceType: 'lis',
      targetObjects: ['service-request', 'observation'],
      syncFrequency: 'real-time',
      configuration: {
        connectionType: 'HL7v2 + FHIR',
        supportedSystems: ['Sunquest', 'Cerner PathNet', 'Epic Beaker'],
        dataFormat: 'HL7v2.5.1 ORU/ORM + FHIR',
        authMethod: 'VPN + Service Account'
      },
      fieldMapping: [
        { source: 'OBR.3', target: 'service-request.serviceRequestId', transformation: 'none' },
        { source: 'OBX.5', target: 'observation.valueQuantity', transformation: 'parse_hl7_value()' },
        { source: 'OBX.8', target: 'observation.interpretation', transformation: 'map_interpretation()' }
      ]
    },
    {
      id: 'radiology-system',
      name: 'Radiology Information System (RIS/PACS)',
      sourceType: 'ris',
      targetObjects: ['service-request', 'observation'],
      syncFrequency: 'real-time',
      configuration: {
        connectionType: 'HL7v2 + DICOM',
        supportedSystems: ['Nuance PowerScribe', 'Sectra', 'Philips'],
        dataFormat: 'HL7v2 ORU + DICOM SR',
        authMethod: 'Service Account'
      },
      fieldMapping: [
        { source: 'AccessionNumber', target: 'service-request.serviceRequestId', transformation: 'none' },
        { source: 'ReportText', target: 'observation.valueString', transformation: 'none' }
      ]
    },
    {
      id: 'pharmacy-system',
      name: 'Pharmacy System Connector',
      sourceType: 'pharmacy',
      targetObjects: ['medication-request'],
      syncFrequency: 'real-time',
      configuration: {
        connectionType: 'NCPDP SCRIPT + FHIR',
        supportedSystems: ['Omnicell', 'BD Pyxis', 'Epic Willow'],
        dataFormat: 'NCPDP SCRIPT 2017071 + FHIR',
        authMethod: 'Surescripts + OAuth2'
      },
      fieldMapping: [
        { source: 'Message.Body.RxHistoryResponse', target: 'medication-request', transformation: 'parse_script()' }
      ]
    },
    {
      id: 'scheduling-system',
      name: 'Scheduling System Connector',
      sourceType: 'scheduling',
      targetObjects: ['appointment'],
      syncFrequency: 'real-time',
      configuration: {
        connectionType: 'FHIR + Proprietary API',
        supportedSystems: ['Epic Cadence', 'Cerner Scheduling', 'athenahealth'],
        dataFormat: 'FHIR JSON',
        authMethod: 'OAuth2'
      },
      fieldMapping: [
        { source: 'Appointment.id', target: 'appointment.appointmentId', transformation: 'none' },
        { source: 'Appointment.participant', target: 'appointment.participant', transformation: 'none' }
      ]
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                    DYNAMIC LAYER - 动态层
  //           业务流程和规则
  // ═══════════════════════════════════════════════════════════════════
  workflows: [
    {
      id: 'patient-admission-workflow',
      name: 'Patient Admission Workflow',
      nameCn: '患者入院流程',
      description: 'End-to-end workflow for inpatient admission',
      descriptionCn: '住院患者入院端到端流程',
      triggerType: 'event',
      triggerCondition: 'Admission order placed',
      steps: [
        { order: 1, name: 'Verify Insurance', action: 'Eligibility verification', condition: 'Always', nextOnSuccess: 2, nextOnFailure: 'Financial Counseling' },
        { order: 2, name: 'Bed Assignment', action: 'AI-optimized bed assignment', condition: 'Eligible', nextOnSuccess: 3, nextOnFailure: 'Waitlist' },
        { order: 3, name: 'Create Encounter', action: 'Create inpatient encounter', condition: 'Bed assigned', nextOnSuccess: 4, nextOnFailure: null },
        { order: 4, name: 'Initial Assessment', action: 'Nursing assessment due', condition: 'Encounter created', nextOnSuccess: 5, nextOnFailure: null },
        { order: 5, name: 'Medication Reconciliation', action: 'Reconcile home medications', condition: 'Assessment complete', nextOnSuccess: 6, nextOnFailure: null },
        { order: 6, name: 'Care Plan Initiation', action: 'Create initial care plan', condition: 'Medications reconciled', nextOnSuccess: 'Complete', nextOnFailure: null }
      ],
      sla: { targetTime: '2 hours', escalationTime: '4 hours' }
    },
    {
      id: 'discharge-planning-workflow',
      name: 'Discharge Planning Workflow',
      nameCn: '出院计划流程',
      description: 'Proactive discharge planning from admission',
      descriptionCn: '从入院开始的前瞻性出院计划',
      triggerType: 'event',
      triggerCondition: 'Patient admitted OR LOS > predicted threshold',
      steps: [
        { order: 1, name: 'Assess Discharge Needs', action: 'Social work screening', condition: 'Always', nextOnSuccess: 2, nextOnFailure: null },
        { order: 2, name: 'Predict LOS', action: 'AI LOS prediction', condition: 'Assessment complete', nextOnSuccess: 3, nextOnFailure: 'Use historical average' },
        { order: 3, name: 'Identify Barriers', action: 'Flag potential barriers', condition: 'LOS predicted', nextOnSuccess: 4, nextOnFailure: null },
        { order: 4, name: 'Coordinate Services', action: 'Arrange post-acute care', condition: 'Barriers identified', nextOnSuccess: 5, nextOnFailure: 'Escalate' },
        { order: 5, name: 'Patient Education', action: 'Discharge teaching', condition: 'Services arranged', nextOnSuccess: 6, nextOnFailure: null },
        { order: 6, name: 'Schedule Follow-up', action: 'Book post-discharge appointments', condition: 'Education complete', nextOnSuccess: 'Complete', nextOnFailure: null }
      ],
      sla: { targetTime: '24 hours before discharge', escalationTime: '12 hours before' }
    },
    {
      id: 'sepsis-alert-workflow',
      name: 'Sepsis Early Warning Workflow',
      nameCn: '脓毒症早期预警流程',
      description: 'AI-powered sepsis detection and response',
      descriptionCn: 'AI驱动的脓毒症检测和响应',
      triggerType: 'event',
      triggerCondition: 'AI sepsis risk score > 70 OR SIRS criteria met',
      steps: [
        { order: 1, name: 'Alert Fired', action: 'Generate sepsis alert', condition: 'Risk threshold exceeded', nextOnSuccess: 2, nextOnFailure: null },
        { order: 2, name: 'Nurse Review', action: 'Bedside nurse assessment', condition: 'Alert active', nextOnSuccess: 3, nextOnFailure: 'Document false positive' },
        { order: 3, name: 'Provider Notification', action: 'Page attending/rapid response', condition: 'Nurse confirms concern', nextOnSuccess: 4, nextOnFailure: null },
        { order: 4, name: 'Sepsis Bundle', action: 'Initiate SEP-1 bundle orders', condition: 'Provider responds', nextOnSuccess: 5, nextOnFailure: 'Escalate' },
        { order: 5, name: 'Monitor Response', action: 'Track lactate clearance', condition: 'Bundle initiated', nextOnSuccess: 'Complete', nextOnFailure: 'ICU escalation' }
      ],
      sla: { targetTime: '1 hour for bundle', escalationTime: '30 minutes' }
    },
    {
      id: 'care-gap-outreach-workflow',
      name: 'Care Gap Outreach Workflow',
      nameCn: '护理缺口外联流程',
      description: 'Proactive outreach for preventive care gaps',
      descriptionCn: '预防性护理缺口的主动外联',
      triggerType: 'schedule',
      triggerCondition: 'Daily at 8 AM',
      steps: [
        { order: 1, name: 'Identify Gaps', action: 'AI identifies care gaps', condition: 'Always', nextOnSuccess: 2, nextOnFailure: null },
        { order: 2, name: 'Prioritize Patients', action: 'Risk-stratify patient list', condition: 'Gaps identified', nextOnSuccess: 3, nextOnFailure: null },
        { order: 3, name: 'Generate Outreach List', action: 'Create call list by priority', condition: 'Prioritized', nextOnSuccess: 4, nextOnFailure: null },
        { order: 4, name: 'Automated Outreach', action: 'Send reminders (text/email/portal)', condition: 'List generated', nextOnSuccess: 5, nextOnFailure: null },
        { order: 5, name: 'Phone Outreach', action: 'Care coordinator calls', condition: 'No response to automated', nextOnSuccess: 6, nextOnFailure: null },
        { order: 6, name: 'Schedule Appointment', action: 'Book preventive visit', condition: 'Patient reached', nextOnSuccess: 'Complete', nextOnFailure: 'Document barrier' }
      ],
      sla: { targetTime: '48 hours', escalationTime: '1 week' }
    }
  ],

  businessRules: [
    {
      id: 'br-medication-allergy',
      name: 'Medication Allergy Check',
      category: 'clinical-safety',
      condition: 'When prescribing any medication',
      action: 'Check against documented allergies; block if match found with override option',
      priority: 1
    },
    {
      id: 'br-drug-interaction',
      name: 'Drug-Drug Interaction Check',
      category: 'clinical-safety',
      condition: 'When prescribing medication',
      action: 'Check for Level 1 (contraindicated) and Level 2 (major) interactions; require acknowledgment',
      priority: 1
    },
    {
      id: 'br-controlled-substance',
      name: 'Controlled Substance Prescribing',
      category: 'compliance',
      condition: 'When prescribing Schedule II-V medications',
      action: 'Verify DEA license; check state PDMP; require indication documentation',
      priority: 1
    },
    {
      id: 'br-imaging-appropriateness',
      name: 'Imaging Appropriateness Criteria',
      category: 'clinical-quality',
      condition: 'When ordering CT/MRI with contrast',
      action: 'Display ACR appropriateness score; require clinical decision support acknowledgment',
      priority: 2
    },
    {
      id: 'br-readmission-risk',
      name: 'High Readmission Risk Protocol',
      category: 'care-management',
      condition: 'When readmission risk score > 50%',
      action: 'Auto-assign care manager; schedule 48-hour post-discharge call; flag for transitional care',
      priority: 2
    },
    {
      id: 'br-hipaa-access',
      name: 'HIPAA Access Logging',
      category: 'compliance',
      condition: 'Any access to patient information',
      action: 'Log user, timestamp, data accessed, purpose; alert on break-the-glass access',
      priority: 1
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                    AI LAYER - AI能力层
  // ═══════════════════════════════════════════════════════════════════
  aiCapabilities: [
    {
      id: 'clinical-risk-stratification',
      name: 'Clinical Risk Stratification',
      nameCn: '临床风险分层',
      type: 'predictive',
      description: 'ML-based patient risk scoring for multiple outcomes',
      descriptionCn: '基于机器学习的多结局患者风险评分',
      inputObjects: ['patient', 'condition', 'medication-request', 'observation', 'encounter'],
      outputProperties: ['patient.riskScore', 'patient.predictedReadmissionRisk'],
      modelDetails: {
        algorithm: 'Gradient Boosting + Deep Learning ensemble',
        features: ['Demographics', 'Diagnoses', 'Medications', 'Labs', 'Vitals', 'Utilization', 'Social determinants'],
        trainingFrequency: 'Monthly with daily scoring',
        accuracy: 'AUC-ROC > 0.80 for 30-day readmission'
      }
    },
    {
      id: 'clinical-nlp',
      name: 'Clinical NLP Engine',
      nameCn: '临床自然语言处理引擎',
      type: 'extraction',
      description: 'Extract structured data from clinical notes',
      descriptionCn: '从临床笔记中提取结构化数据',
      inputObjects: ['encounter'],
      outputProperties: ['encounter.acuityLevel'],
      modelDetails: {
        algorithm: 'Clinical BERT + Named Entity Recognition',
        features: ['Progress notes', 'Discharge summaries', 'Radiology reports', 'Pathology reports'],
        trainingFrequency: 'Quarterly',
        accuracy: 'F1 > 0.85 for key clinical entities'
      }
    },
    {
      id: 'sepsis-prediction',
      name: 'Sepsis Early Detection',
      nameCn: '脓毒症早期预测',
      type: 'predictive',
      description: 'Real-time sepsis risk monitoring',
      descriptionCn: '实时脓毒症风险监测',
      inputObjects: ['patient', 'observation', 'encounter'],
      outputProperties: [],
      modelDetails: {
        algorithm: 'LSTM with attention mechanism',
        features: ['Vital signs time series', 'Lab trends', 'Nursing assessments', 'Medication administration'],
        trainingFrequency: 'Monthly',
        accuracy: 'Sensitivity 85%, Specificity 90%, 4-hour advance warning'
      }
    },
    {
      id: 'care-gap-detection',
      name: 'Care Gap Detection',
      nameCn: '护理缺口检测',
      type: 'rules-ml-hybrid',
      description: 'Identify gaps in preventive and chronic care',
      descriptionCn: '识别预防性和慢性病护理缺口',
      inputObjects: ['patient', 'condition', 'observation', 'medication-request', 'encounter'],
      outputProperties: ['patient.careGaps'],
      modelDetails: {
        algorithm: 'Rules engine + ML prioritization',
        features: ['HEDIS measures', 'CMS quality measures', 'Clinical guidelines', 'Patient preferences'],
        trainingFrequency: 'Quarterly measure updates',
        accuracy: '95% gap identification rate vs. manual review'
      }
    },
    {
      id: 'appointment-optimization',
      name: 'Appointment No-Show Prediction',
      nameCn: '预约爽约预测',
      type: 'predictive',
      description: 'Predict appointment no-shows for scheduling optimization',
      descriptionCn: '预测预约爽约以优化排班',
      inputObjects: ['patient', 'appointment'],
      outputProperties: ['patient.predictedNoShowRisk', 'appointment.noShowProbability'],
      modelDetails: {
        algorithm: 'XGBoost',
        features: ['Historical attendance', 'Appointment type', 'Lead time', 'Day/time', 'Demographics', 'Transportation access'],
        trainingFrequency: 'Weekly',
        accuracy: 'AUC-ROC > 0.78'
      }
    },
    {
      id: 'clinical-decision-support',
      name: 'Clinical Decision Support',
      nameCn: '临床决策支持',
      type: 'recommendation',
      description: 'Evidence-based treatment recommendations',
      descriptionCn: '基于证据的治疗建议',
      inputObjects: ['patient', 'condition', 'medication-request', 'observation'],
      outputProperties: ['care-plan.recommendedInterventions', 'medication-request.drugInteractionAlerts'],
      modelDetails: {
        algorithm: 'Knowledge graph + ML ranking',
        features: ['Clinical guidelines', 'Drug databases', 'Patient-specific factors', 'Outcome data'],
        trainingFrequency: 'Continuous guideline updates',
        accuracy: 'Physician acceptance rate > 70%'
      }
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                    UI LAYER - 界面层
  // ═══════════════════════════════════════════════════════════════════
  dashboards: [
    {
      id: 'clinical-command-center',
      name: 'Clinical Command Center',
      nameCn: '临床指挥中心',
      description: 'Real-time hospital operations visibility',
      targetAudience: ['CNO', 'CMO', 'Bed Management'],
      layout: 'grid',
      widgets: [
        { type: 'kpi', title: 'Current Census', dataSource: 'encounter', metric: 'count where status = in-progress', filters: ['class=inpatient'] },
        { type: 'kpi', title: 'ED Boarding', dataSource: 'encounter', metric: 'count where location = ED AND status = triaged AND wait > 4h', filters: [] },
        { type: 'kpi', title: 'Discharges Today', dataSource: 'encounter', metric: 'count where status = finished', filters: ['today'] },
        { type: 'kpi', title: 'Expected Admissions', dataSource: 'appointment', metric: 'count where appointmentType = admission', filters: ['today'] },
        { type: 'chart', title: 'Census by Unit', chartType: 'bar', dataSource: 'encounter', metric: 'count by location', filters: ['inpatient'] },
        { type: 'chart', title: 'ED Wait Times', chartType: 'line', dataSource: 'encounter', metric: 'avg(waitTime) by hour', filters: ['ED', 'today'] },
        { type: 'map', title: 'Bed Status', dataSource: 'location', metric: 'occupancy by floor', filters: [] },
        { type: 'table', title: 'High Acuity Patients', dataSource: 'patient', columns: ['name', 'unit', 'acuity', 'riskScore', 'alerts'], filters: ['acuityLevel >= 4'] }
      ],
      refreshInterval: 60
    },
    {
      id: 'patient-360',
      name: 'Patient 360 View',
      nameCn: '患者360视图',
      description: 'Comprehensive patient clinical summary',
      targetAudience: ['Physician', 'Nurse', 'Care Manager'],
      layout: 'tabs',
      widgets: [
        { type: 'kpi', title: 'Risk Score', dataSource: 'patient', metric: 'riskScore', filters: ['current patient'] },
        { type: 'kpi', title: 'Readmission Risk', dataSource: 'patient', metric: 'predictedReadmissionRisk', filters: ['current patient'] },
        { type: 'kpi', title: 'Active Conditions', dataSource: 'condition', metric: 'count where clinicalStatus = active', filters: ['current patient'] },
        { type: 'kpi', title: 'Active Medications', dataSource: 'medication-request', metric: 'count where status = active', filters: ['current patient'] },
        { type: 'chart', title: 'Lab Trends', chartType: 'line', dataSource: 'observation', metric: 'value by date', filters: ['category = laboratory'] },
        { type: 'chart', title: 'Vital Signs', chartType: 'sparkline', dataSource: 'observation', metric: 'value by time', filters: ['category = vital-signs'] },
        { type: 'timeline', title: 'Care Timeline', dataSource: 'encounter', metric: 'events by date', filters: ['current patient'] },
        { type: 'table', title: 'Care Gaps', dataSource: 'patient', columns: ['gap', 'priority', 'dueDate', 'action'], filters: ['careGaps'] }
      ],
      refreshInterval: 300
    },
    {
      id: 'care-management-worklist',
      name: 'Care Management Worklist',
      nameCn: '护理管理工作列表',
      description: 'Risk-stratified patient worklist for care managers',
      targetAudience: ['Care Manager', 'Population Health'],
      layout: 'list',
      widgets: [
        { type: 'kpi', title: 'High Risk Patients', dataSource: 'patient', metric: 'count where riskScore > 70', filters: ['assigned panel'] },
        { type: 'kpi', title: 'Pending Outreach', dataSource: 'patient', metric: 'count where outreachDue = true', filters: ['assigned panel'] },
        { type: 'kpi', title: 'Care Gaps Open', dataSource: 'patient', metric: 'sum(careGaps.length)', filters: ['assigned panel'] },
        { type: 'table', title: 'Patient Worklist', dataSource: 'patient', columns: ['name', 'riskScore', 'careGaps', 'lastContact', 'nextAction', 'priority'], filters: ['sortBy riskScore desc'] },
        { type: 'chart', title: 'Risk Distribution', chartType: 'histogram', dataSource: 'patient', metric: 'riskScore distribution', filters: ['assigned panel'] }
      ],
      refreshInterval: 300
    },
    {
      id: 'quality-dashboard',
      name: 'Quality Metrics Dashboard',
      nameCn: '质量指标仪表板',
      description: 'Clinical quality measures and compliance tracking',
      targetAudience: ['Quality Director', 'CMO', 'Compliance'],
      layout: 'grid',
      widgets: [
        { type: 'kpi', title: 'HEDIS Composite', dataSource: 'quality-measure', metric: 'avg(score)', filters: ['HEDIS measures'] },
        { type: 'kpi', title: 'Readmission Rate', dataSource: 'encounter', metric: '30-day readmission rate', filters: [] },
        { type: 'kpi', title: 'Sepsis Bundle Compliance', dataSource: 'encounter', metric: 'SEP-1 compliance rate', filters: [] },
        { type: 'chart', title: 'Quality Trends', chartType: 'line', dataSource: 'quality-measure', metric: 'score by month', filters: ['last 12 months'] },
        { type: 'chart', title: 'Care Gap Closure Rate', chartType: 'bar', dataSource: 'patient', metric: 'gap closure rate by type', filters: [] },
        { type: 'table', title: 'Measure Performance', dataSource: 'quality-measure', columns: ['measure', 'target', 'current', 'trend', 'gap'], filters: [] }
      ],
      refreshInterval: 3600
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  //                    DEPLOYMENT CONFIG - 部署配置
  // ═══════════════════════════════════════════════════════════════════
  deployment: {
    prerequisites: [
      'Data platform with Healthcare module',
      'EHR FHIR R4 API access (Epic/Cerner/etc.)',
      'HL7v2 interface engine access',
      'HIPAA BAA in place',
      'IRB approval for AI models (if applicable)'
    ],
    phases: [
      {
        phase: 1,
        name: 'Foundation & Compliance',
        duration: '5-7 days',
        deliverables: [
          'HIPAA-compliant data pipeline setup',
          'Patient/Encounter/Provider master data',
          'Access control and audit logging',
          'FHIR bulk export configuration'
        ]
      },
      {
        phase: 2,
        name: 'Clinical Data Integration',
        duration: '5-7 days',
        deliverables: [
          'Conditions/Problems integration',
          'Medications and allergies sync',
          'Lab results pipeline (LIS)',
          'Vital signs and observations'
        ]
      },
      {
        phase: 3,
        name: 'AI Models & Analytics',
        duration: '5-7 days',
        deliverables: [
          'Risk stratification model deployment',
          'Care gap detection rules',
          'No-show prediction model',
          'Clinical NLP for notes processing'
        ]
      },
      {
        phase: 4,
        name: 'Workflows & Dashboards',
        duration: '4-5 days',
        deliverables: [
          'Clinical command center dashboard',
          'Patient 360 view',
          'Care management worklist',
          'Alert workflows and escalations'
        ]
      }
    ],
    roleConfig: [
      { role: 'Physician', permissions: ['read:all-clinical', 'write:orders', 'write:notes', 'write:diagnoses'] },
      { role: 'Nurse', permissions: ['read:assigned-patients', 'write:vitals', 'write:assessments', 'execute:nursing-tasks'] },
      { role: 'Care Manager', permissions: ['read:panel-patients', 'write:care-plans', 'write:outreach-notes'] },
      { role: 'Scheduler', permissions: ['read:schedule', 'write:appointments'] },
      { role: 'Quality Analyst', permissions: ['read:quality-data', 'read:aggregate-clinical'] },
      { role: 'Admin', permissions: ['read:audit-logs', 'write:system-config'] }
    ],
    integrationPoints: [
      { system: 'EHR', direction: 'bidirectional', frequency: 'real-time', dataVolume: 'Varies by census' },
      { system: 'LIS', direction: 'inbound', frequency: 'real-time', dataVolume: '10K-100K results/day' },
      { system: 'RIS/PACS', direction: 'inbound', frequency: 'real-time', dataVolume: '1K-10K studies/day' },
      { system: 'Pharmacy', direction: 'bidirectional', frequency: 'real-time', dataVolume: 'Varies' },
      { system: 'Scheduling', direction: 'bidirectional', frequency: 'real-time', dataVolume: '1K-10K appts/day' }
    ]
  }
};
