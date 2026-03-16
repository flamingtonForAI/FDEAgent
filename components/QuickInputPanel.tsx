import React, { useState } from 'react';
import { Box, Zap, Database, X, Plus, Trash2 } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface Props {
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

const QuickInputPanel: React.FC<Props> = ({ onSubmit, disabled, hasApiKey = true, onOpenSettings }) => {
  const { t, i18nLang } = useAppTranslation('modeling');
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
    return `${i18nLang === 'cn' ? '我想添加一个业务对象' : "I'd like to add a business object"}:

**${i18nLang === 'cn' ? '对象名称' : 'Object Name'}**: ${objectForm.name}
**${i18nLang === 'cn' ? '描述' : 'Description'}**: ${objectForm.description}
${attrs.length > 0 ? `**${i18nLang === 'cn' ? '关键属性' : 'Key Attributes'}**: ${attrs.join(', ')}` : ''}
${objectForm.relationships ? `**${i18nLang === 'cn' ? '关系' : 'Relationships'}**: ${objectForm.relationships}` : ''}`;
  };

  const formatActionMessage = (): string => {
    const preconds = actionForm.preconditions.filter(p => p.trim());
    return `${i18nLang === 'cn' ? '我想添加一个业务动作' : "I'd like to add a business action"}:

**${i18nLang === 'cn' ? '动作名称' : 'Action Name'}**: ${actionForm.name}
**${i18nLang === 'cn' ? '目标对象' : 'Target Object'}**: ${actionForm.targetObject}
**${i18nLang === 'cn' ? '描述' : 'Description'}**: ${actionForm.description}
**${i18nLang === 'cn' ? '执行者' : 'Executor'}**: ${actionForm.executor}
${preconds.length > 0 ? `**${i18nLang === 'cn' ? '前置条件' : 'Preconditions'}**: ${preconds.join('; ')}` : ''}
${actionForm.postconditions ? `**${i18nLang === 'cn' ? '后置状态' : 'Postcondition'}**: ${actionForm.postconditions}` : ''}`;
  };

  const formatIntegrationMessage = (): string => {
    const data = integrationForm.dataProvided.filter(d => d.trim());
    return `${i18nLang === 'cn' ? '我想添加一个外部系统集成' : "I'd like to add an external system integration"}:

**${i18nLang === 'cn' ? '系统名称' : 'System Name'}**: ${integrationForm.name}
**${i18nLang === 'cn' ? '类型' : 'Type'}**: ${integrationForm.type}
**${i18nLang === 'cn' ? '描述' : 'Description'}**: ${integrationForm.description}
${data.length > 0 ? `**${i18nLang === 'cn' ? '提供的数据' : 'Data Provided'}**: ${data.join(', ')}` : ''}`;
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
        <span className="text-xs text-muted">{t('quickInputPanel.quickAdd')}:</span>
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
          {t('quickInputPanel.addObject')}
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
          {t('quickInputPanel.addAction')}
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
          {t('quickInputPanel.addIntegration')}
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
                    {activeModal === 'object' && t('quickInputPanel.objectTitle')}
                    {activeModal === 'action' && t('quickInputPanel.actionTitle')}
                    {activeModal === 'integration' && t('quickInputPanel.integrationTitle')}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {activeModal === 'object' && t('quickInputPanel.objectDesc')}
                    {activeModal === 'action' && t('quickInputPanel.actionDesc')}
                    {activeModal === 'integration' && t('quickInputPanel.integrationDesc')}
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
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.objectName')} *</label>
                    <input
                      type="text"
                      value={objectForm.name}
                      onChange={(e) => setObjectForm({ ...objectForm, name: e.target.value })}
                      placeholder={t('quickInputPanel.objectNamePlaceholder')}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.objectDescription')} *</label>
                    <textarea
                      value={objectForm.description}
                      onChange={(e) => setObjectForm({ ...objectForm, description: e.target.value })}
                      placeholder={t('quickInputPanel.objectDescPlaceholder')}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.attributes')}</label>
                    {objectForm.attributes.map((attr, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={attr}
                          onChange={(e) => updateArrayItem(setObjectForm, 'attributes', i, e.target.value)}
                          placeholder={t('quickInputPanel.attributePlaceholder')}
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
                      {t('quickInputPanel.addAttribute')}
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.relationships')}</label>
                    <input
                      type="text"
                      value={objectForm.relationships}
                      onChange={(e) => setObjectForm({ ...objectForm, relationships: e.target.value })}
                      placeholder={t('quickInputPanel.relationshipsPlaceholder')}
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
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.actionName')} *</label>
                    <input
                      type="text"
                      value={actionForm.name}
                      onChange={(e) => setActionForm({ ...actionForm, name: e.target.value })}
                      placeholder={t('quickInputPanel.actionNamePlaceholder')}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.targetObject')} *</label>
                    <input
                      type="text"
                      value={actionForm.targetObject}
                      onChange={(e) => setActionForm({ ...actionForm, targetObject: e.target.value })}
                      placeholder={t('quickInputPanel.targetObjectPlaceholder')}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.actionDescription')}</label>
                    <textarea
                      value={actionForm.description}
                      onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
                      placeholder={t('quickInputPanel.actionDescPlaceholder')}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.executor')}</label>
                    <input
                      type="text"
                      value={actionForm.executor}
                      onChange={(e) => setActionForm({ ...actionForm, executor: e.target.value })}
                      placeholder={t('quickInputPanel.executorPlaceholder')}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.preconditions')}</label>
                    {actionForm.preconditions.map((pre, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={pre}
                          onChange={(e) => updateArrayItem(setActionForm, 'preconditions', i, e.target.value)}
                          placeholder={t('quickInputPanel.preconditionPlaceholder')}
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
                      {t('quickInputPanel.addPrecondition')}
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.postcondition')}</label>
                    <input
                      type="text"
                      value={actionForm.postconditions}
                      onChange={(e) => setActionForm({ ...actionForm, postconditions: e.target.value })}
                      placeholder={t('quickInputPanel.postconditionPlaceholder')}
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
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.integrationName')} *</label>
                    <input
                      type="text"
                      value={integrationForm.name}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, name: e.target.value })}
                      placeholder={t('quickInputPanel.integrationNamePlaceholder')}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.integrationType')} *</label>
                    <input
                      type="text"
                      value={integrationForm.type}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, type: e.target.value })}
                      placeholder={t('quickInputPanel.integrationTypePlaceholder')}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.integrationDescription')}</label>
                    <textarea
                      value={integrationForm.description}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, description: e.target.value })}
                      placeholder={t('quickInputPanel.integrationDescPlaceholder')}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none resize-none"
                      style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1.5 block">{t('quickInputPanel.dataProvided')}</label>
                    {integrationForm.dataProvided.map((data, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={data}
                          onChange={(e) => updateArrayItem(setIntegrationForm, 'dataProvided', i, e.target.value)}
                          placeholder={t('quickInputPanel.dataProvidedPlaceholder')}
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
                      {t('quickInputPanel.addData')}
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
                    {t('quickInputPanel.apiRequired')}
                  </span>
                  {onOpenSettings && (
                    <button
                      onClick={() => { handleClose(); onOpenSettings(); }}
                      className="text-xs font-medium px-2 py-1 rounded"
                      style={{ backgroundColor: 'var(--color-warning)', color: '#fff' }}
                    >
                      {t('quickInputPanel.configureApi')}
                    </button>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-muted hover:text-primary transition-colors"
                >
                  {t('quickInputPanel.cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || !hasApiKey || disabled}
                  className="btn-gradient px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t('quickInputPanel.submit')}
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
