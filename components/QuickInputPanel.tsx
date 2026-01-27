import React, { useState } from 'react';
import { Language } from '../types';
import { Box, Zap, Database, X, Plus, Trash2 } from 'lucide-react';

interface Props {
  lang: Language;
  onSubmit: (structuredInput: string) => void;
  disabled?: boolean;
  hasApiKey?: boolean;
  onOpenSettings?: () => void;
}

type ModalType = 'object' | 'action' | 'integration' | null;

interface ObjectForm {
  name: string;
  description: string;
  attributes: string[];
  relationships: string;
}

interface ActionForm {
  name: string;
  targetObject: string;
  description: string;
  executor: string;
  preconditions: string[];
  postconditions: string;
}

interface IntegrationForm {
  name: string;
  type: string;
  description: string;
  dataProvided: string[];
}

const translations = {
  en: {
    quickAdd: 'Quick Add',
    addObject: 'Add Object',
    addAction: 'Add Action',
    addIntegration: 'Add Integration',
    // Object form
    objectTitle: 'Define Object',
    objectDesc: 'Add a business entity to your ontology',
    objectName: 'Object Name',
    objectNamePlaceholder: 'e.g., Order, Customer, Product',
    objectDescription: 'Description',
    objectDescPlaceholder: 'What does this object represent?',
    attributes: 'Key Attributes',
    attributePlaceholder: 'e.g., status, createdDate',
    addAttribute: 'Add Attribute',
    relationships: 'Relationships',
    relationshipsPlaceholder: 'e.g., belongs to Customer, contains Products',
    // Action form
    actionTitle: 'Define Action',
    actionDesc: 'Add a business operation to your ontology',
    actionName: 'Action Name',
    actionNamePlaceholder: 'e.g., Approve Order, Ship Product',
    targetObject: 'Target Object',
    targetObjectPlaceholder: 'Which object does this action operate on?',
    actionDescription: 'What does this action do?',
    actionDescPlaceholder: 'Describe the business purpose',
    executor: 'Who executes?',
    executorPlaceholder: 'e.g., Manager, System, Customer',
    preconditions: 'Preconditions',
    preconditionPlaceholder: 'e.g., Order status is Pending',
    addPrecondition: 'Add Precondition',
    postcondition: 'Result/Postcondition',
    postconditionPlaceholder: 'What happens after this action?',
    // Integration form
    integrationTitle: 'Define Integration',
    integrationDesc: 'Add an external system or data source',
    integrationName: 'System Name',
    integrationNamePlaceholder: 'e.g., SAP ERP, Salesforce',
    integrationType: 'System Type',
    integrationTypePlaceholder: 'e.g., ERP, CRM, Database',
    integrationDescription: 'Description',
    integrationDescPlaceholder: 'What does this system do?',
    dataProvided: 'Data Provided',
    dataProvidedPlaceholder: 'e.g., Customer records, Order history',
    addData: 'Add Data',
    // Common
    cancel: 'Cancel',
    submit: 'Add to Conversation',
    apiRequired: 'AI settings required to send',
    configureApi: 'Configure AI Settings'
  },
  cn: {
    quickAdd: '快捷添加',
    addObject: '添加对象',
    addAction: '添加动作',
    addIntegration: '添加集成',
    // Object form
    objectTitle: '定义对象',
    objectDesc: '添加业务实体到本体',
    objectName: '对象名称',
    objectNamePlaceholder: '例如：订单、客户、产品',
    objectDescription: '描述',
    objectDescPlaceholder: '这个对象代表什么？',
    attributes: '关键属性',
    attributePlaceholder: '例如：状态、创建日期',
    addAttribute: '添加属性',
    relationships: '关系',
    relationshipsPlaceholder: '例如：属于客户、包含产品',
    // Action form
    actionTitle: '定义动作',
    actionDesc: '添加业务操作到本体',
    actionName: '动作名称',
    actionNamePlaceholder: '例如：审批订单、发货',
    targetObject: '目标对象',
    targetObjectPlaceholder: '这个动作操作哪个对象？',
    actionDescription: '动作描述',
    actionDescPlaceholder: '描述业务目的',
    executor: '执行者',
    executorPlaceholder: '例如：经理、系统、客户',
    preconditions: '前置条件',
    preconditionPlaceholder: '例如：订单状态为待审批',
    addPrecondition: '添加前置条件',
    postcondition: '结果/后置状态',
    postconditionPlaceholder: '执行后会发生什么？',
    // Integration form
    integrationTitle: '定义集成',
    integrationDesc: '添加外部系统或数据源',
    integrationName: '系统名称',
    integrationNamePlaceholder: '例如：SAP ERP、Salesforce',
    integrationType: '系统类型',
    integrationTypePlaceholder: '例如：ERP、CRM、数据库',
    integrationDescription: '描述',
    integrationDescPlaceholder: '这个系统做什么？',
    dataProvided: '提供的数据',
    dataProvidedPlaceholder: '例如：客户记录、订单历史',
    addData: '添加数据',
    // Common
    cancel: '取消',
    submit: '添加到对话',
    apiRequired: '需要配置 AI 设置才能发送',
    configureApi: '配置 AI 设置'
  }
};

const QuickInputPanel: React.FC<Props> = ({ lang, onSubmit, disabled, hasApiKey = true, onOpenSettings }) => {
  const t = translations[lang];
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Object form state
  const [objectForm, setObjectForm] = useState<ObjectForm>({
    name: '',
    description: '',
    attributes: [''],
    relationships: ''
  });

  // Action form state
  const [actionForm, setActionForm] = useState<ActionForm>({
    name: '',
    targetObject: '',
    description: '',
    executor: '',
    preconditions: [''],
    postconditions: ''
  });

  // Integration form state
  const [integrationForm, setIntegrationForm] = useState<IntegrationForm>({
    name: '',
    type: '',
    description: '',
    dataProvided: ['']
  });

  const resetForms = () => {
    setObjectForm({ name: '', description: '', attributes: [''], relationships: '' });
    setActionForm({ name: '', targetObject: '', description: '', executor: '', preconditions: [''], postconditions: '' });
    setIntegrationForm({ name: '', type: '', description: '', dataProvided: [''] });
  };

  const handleClose = () => {
    setActiveModal(null);
    resetForms();
  };

  const formatObjectMessage = (): string => {
    const attrs = objectForm.attributes.filter(a => a.trim());
    return `${lang === 'cn' ? '我想添加一个业务对象' : "I'd like to add a business object"}:

**${lang === 'cn' ? '对象名称' : 'Object Name'}**: ${objectForm.name}
**${lang === 'cn' ? '描述' : 'Description'}**: ${objectForm.description}
${attrs.length > 0 ? `**${lang === 'cn' ? '关键属性' : 'Key Attributes'}**: ${attrs.join(', ')}` : ''}
${objectForm.relationships ? `**${lang === 'cn' ? '关系' : 'Relationships'}**: ${objectForm.relationships}` : ''}`;
  };

  const formatActionMessage = (): string => {
    const preconds = actionForm.preconditions.filter(p => p.trim());
    return `${lang === 'cn' ? '我想添加一个业务动作' : "I'd like to add a business action"}:

**${lang === 'cn' ? '动作名称' : 'Action Name'}**: ${actionForm.name}
**${lang === 'cn' ? '目标对象' : 'Target Object'}**: ${actionForm.targetObject}
**${lang === 'cn' ? '描述' : 'Description'}**: ${actionForm.description}
**${lang === 'cn' ? '执行者' : 'Executor'}**: ${actionForm.executor}
${preconds.length > 0 ? `**${lang === 'cn' ? '前置条件' : 'Preconditions'}**: ${preconds.join('; ')}` : ''}
${actionForm.postconditions ? `**${lang === 'cn' ? '后置状态' : 'Postcondition'}**: ${actionForm.postconditions}` : ''}`;
  };

  const formatIntegrationMessage = (): string => {
    const data = integrationForm.dataProvided.filter(d => d.trim());
    return `${lang === 'cn' ? '我想添加一个外部系统集成' : "I'd like to add an external system integration"}:

**${lang === 'cn' ? '系统名称' : 'System Name'}**: ${integrationForm.name}
**${lang === 'cn' ? '类型' : 'Type'}**: ${integrationForm.type}
**${lang === 'cn' ? '描述' : 'Description'}**: ${integrationForm.description}
${data.length > 0 ? `**${lang === 'cn' ? '提供的数据' : 'Data Provided'}**: ${data.join(', ')}` : ''}`;
  };

  const handleSubmit = () => {
    let message = '';
    switch (activeModal) {
      case 'object':
        message = formatObjectMessage();
        break;
      case 'action':
        message = formatActionMessage();
        break;
      case 'integration':
        message = formatIntegrationMessage();
        break;
    }
    if (message) {
      onSubmit(message);
      handleClose();
    }
  };

  const isFormValid = (): boolean => {
    switch (activeModal) {
      case 'object':
        return objectForm.name.trim() !== '' && objectForm.description.trim() !== '';
      case 'action':
        return actionForm.name.trim() !== '' && actionForm.targetObject.trim() !== '';
      case 'integration':
        return integrationForm.name.trim() !== '' && integrationForm.type.trim() !== '';
      default:
        return false;
    }
  };

  // Helper to add/remove array items
  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<any>>, key: string) => {
    setter((prev: any) => ({ ...prev, [key]: [...prev[key], ''] }));
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<any>>, key: string, index: number) => {
    setter((prev: any) => ({
      ...prev,
      [key]: prev[key].filter((_: any, i: number) => i !== index)
    }));
  };

  const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<any>>, key: string, index: number, value: string) => {
    setter((prev: any) => ({
      ...prev,
      [key]: prev[key].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  return (
    <>
      {/* Quick Add Buttons - Always enabled to allow form filling */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted">{t.quickAdd}:</span>
        <button
          onClick={() => setActiveModal('object')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:opacity-80"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-hover)',
            color: 'var(--color-text-primary)'
          }}
        >
          <Box size={12} style={{ color: 'var(--color-accent)' }} />
          {t.addObject}
        </button>
        <button
          onClick={() => setActiveModal('action')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:opacity-80"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-hover)',
            color: 'var(--color-text-primary)'
          }}
        >
          <Zap size={12} style={{ color: 'var(--color-success)' }} />
          {t.addAction}
        </button>
        <button
          onClick={() => setActiveModal('integration')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:opacity-80"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border-hover)',
            color: 'var(--color-text-primary)'
          }}
        >
          <Database size={12} style={{ color: 'var(--color-accent-secondary)' }} />
          {t.addIntegration}
        </button>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-[var(--color-bg-base)]/90 z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-lg shadow-2xl animate-slideUp max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-5 flex items-center justify-between flex-shrink-0" style={{ borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                  {activeModal === 'object' && <Box size={20} style={{ color: 'var(--color-accent)' }} />}
                  {activeModal === 'action' && <Zap size={20} style={{ color: 'var(--color-success)' }} />}
                  {activeModal === 'integration' && <Database size={20} style={{ color: 'var(--color-accent-secondary)' }} />}
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {activeModal === 'object' && t.objectTitle}
                    {activeModal === 'action' && t.actionTitle}
                    {activeModal === 'integration' && t.integrationTitle}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {activeModal === 'object' && t.objectDesc}
                    {activeModal === 'action' && t.actionDesc}
                    {activeModal === 'integration' && t.integrationDesc}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="text-muted hover:text-primary transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Object Form */}
              {activeModal === 'object' && (
                <>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.objectName} *</label>
                    <input
                      type="text"
                      value={objectForm.name}
                      onChange={(e) => setObjectForm({ ...objectForm, name: e.target.value })}
                      placeholder={t.objectNamePlaceholder}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.objectDescription} *</label>
                    <textarea
                      value={objectForm.description}
                      onChange={(e) => setObjectForm({ ...objectForm, description: e.target.value })}
                      placeholder={t.objectDescPlaceholder}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.attributes}</label>
                    {objectForm.attributes.map((attr, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={attr}
                          onChange={(e) => updateArrayItem(setObjectForm, 'attributes', i, e.target.value)}
                          placeholder={t.attributePlaceholder}
                          className="flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none"
                          style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        />
                        {objectForm.attributes.length > 1 && (
                          <button
                            onClick={() => removeArrayItem(setObjectForm, 'attributes', i)}
                            className="p-2 text-muted transition-colors"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem(setObjectForm, 'attributes')}
                      className="flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      <Plus size={12} />
                      {t.addAttribute}
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.relationships}</label>
                    <input
                      type="text"
                      value={objectForm.relationships}
                      onChange={(e) => setObjectForm({ ...objectForm, relationships: e.target.value })}
                      placeholder={t.relationshipsPlaceholder}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                </>
              )}

              {/* Action Form */}
              {activeModal === 'action' && (
                <>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.actionName} *</label>
                    <input
                      type="text"
                      value={actionForm.name}
                      onChange={(e) => setActionForm({ ...actionForm, name: e.target.value })}
                      placeholder={t.actionNamePlaceholder}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.targetObject} *</label>
                    <input
                      type="text"
                      value={actionForm.targetObject}
                      onChange={(e) => setActionForm({ ...actionForm, targetObject: e.target.value })}
                      placeholder={t.targetObjectPlaceholder}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.actionDescription}</label>
                    <textarea
                      value={actionForm.description}
                      onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
                      placeholder={t.actionDescPlaceholder}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.executor}</label>
                    <input
                      type="text"
                      value={actionForm.executor}
                      onChange={(e) => setActionForm({ ...actionForm, executor: e.target.value })}
                      placeholder={t.executorPlaceholder}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.preconditions}</label>
                    {actionForm.preconditions.map((pre, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={pre}
                          onChange={(e) => updateArrayItem(setActionForm, 'preconditions', i, e.target.value)}
                          placeholder={t.preconditionPlaceholder}
                          className="flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none"
                          style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        />
                        {actionForm.preconditions.length > 1 && (
                          <button
                            onClick={() => removeArrayItem(setActionForm, 'preconditions', i)}
                            className="p-2 text-muted transition-colors"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem(setActionForm, 'preconditions')}
                      className="flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: 'var(--color-success)' }}
                    >
                      <Plus size={12} />
                      {t.addPrecondition}
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.postcondition}</label>
                    <input
                      type="text"
                      value={actionForm.postconditions}
                      onChange={(e) => setActionForm({ ...actionForm, postconditions: e.target.value })}
                      placeholder={t.postconditionPlaceholder}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                </>
              )}

              {/* Integration Form */}
              {activeModal === 'integration' && (
                <>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.integrationName} *</label>
                    <input
                      type="text"
                      value={integrationForm.name}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, name: e.target.value })}
                      placeholder={t.integrationNamePlaceholder}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.integrationType} *</label>
                    <input
                      type="text"
                      value={integrationForm.type}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, type: e.target.value })}
                      placeholder={t.integrationTypePlaceholder}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.integrationDescription}</label>
                    <textarea
                      value={integrationForm.description}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, description: e.target.value })}
                      placeholder={t.integrationDescPlaceholder}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t.dataProvided}</label>
                    {integrationForm.dataProvided.map((data, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={data}
                          onChange={(e) => updateArrayItem(setIntegrationForm, 'dataProvided', i, e.target.value)}
                          placeholder={t.dataProvidedPlaceholder}
                          className="flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none"
                          style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                        />
                        {integrationForm.dataProvided.length > 1 && (
                          <button
                            onClick={() => removeArrayItem(setIntegrationForm, 'dataProvided', i)}
                            className="p-2 text-muted transition-colors"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem(setIntegrationForm, 'dataProvided')}
                      className="flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: 'var(--color-accent-secondary)' }}
                    >
                      <Plus size={12} />
                      {t.addData}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 flex-shrink-0" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--color-border)' }}>
              {/* API Key Warning */}
              {!hasApiKey && (
                <div
                  className="mb-3 p-3 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: 'var(--color-warning)15', border: '1px solid var(--color-warning)30' }}
                >
                  <span className="text-xs" style={{ color: 'var(--color-warning)' }}>
                    {t.apiRequired}
                  </span>
                  {onOpenSettings && (
                    <button
                      onClick={() => { handleClose(); onOpenSettings(); }}
                      className="text-xs font-medium px-2 py-1 rounded"
                      style={{ backgroundColor: 'var(--color-warning)', color: '#fff' }}
                    >
                      {t.configureApi}
                    </button>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-muted hover:text-primary transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || !hasApiKey || disabled}
                  className="btn-gradient px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t.submit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickInputPanel;
