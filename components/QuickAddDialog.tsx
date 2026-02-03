import React, { useState, useEffect, useRef } from 'react';
import { X, Package, Link2, Zap } from 'lucide-react';
import { Language, OntologyObject, OntologyLink, AIPAction } from '../types';

type AddType = 'object' | 'link' | 'action';

interface QuickAddDialogProps {
  type: AddType;
  lang: Language;
  objects: OntologyObject[];  // 用于 link/action 的对象选择
  onClose: () => void;
  onAddObject: (obj: Partial<OntologyObject>) => void;
  onAddLink: (link: Partial<OntologyLink>) => void;
  onAddAction: (objectId: string, action: Partial<AIPAction>) => void;
}

const translations = {
  en: {
    addObject: 'Add Object',
    addLink: 'Add Link',
    addAction: 'Add Action',
    name: 'Name',
    description: 'Description',
    sourceObject: 'Source Object',
    targetObject: 'Target Object',
    relationLabel: 'Relation Label',
    targetObjectAction: 'Target Object',
    actionType: 'Action Type',
    traditional: 'Traditional',
    generative: 'AI Generative',
    cancel: 'Cancel',
    add: 'Add',
    namePlaceholder: 'e.g., Order, Customer, Product',
    descPlaceholder: 'Brief description of this element',
    relationPlaceholder: 'e.g., contains, references, generates',
    actionNamePlaceholder: 'e.g., Approve, Submit, Cancel',
    selectObject: 'Select an object',
    noObjects: 'Please add objects first',
    needTwoObjects: 'Need at least 2 objects to create a link',
  },
  cn: {
    addObject: '添加对象',
    addLink: '添加关系',
    addAction: '添加动作',
    name: '名称',
    description: '描述',
    sourceObject: '源对象',
    targetObject: '目标对象',
    relationLabel: '关系标签',
    targetObjectAction: '所属对象',
    actionType: '动作类型',
    traditional: '传统动作',
    generative: 'AI 生成',
    cancel: '取消',
    add: '添加',
    namePlaceholder: '例如：订单、客户、产品',
    descPlaceholder: '简要描述这个元素',
    relationPlaceholder: '例如：包含、关联、生成',
    actionNamePlaceholder: '例如：审批、提交、取消',
    selectObject: '请选择对象',
    noObjects: '请先添加对象',
    needTwoObjects: '需要至少2个对象才能创建关系',
  }
};

const QuickAddDialog: React.FC<QuickAddDialogProps> = ({
  type,
  lang,
  objects,
  onClose,
  onAddObject,
  onAddLink,
  onAddAction
}) => {
  const t = translations[lang];
  const inputRef = useRef<HTMLInputElement>(null);

  // Object form state
  const [objectName, setObjectName] = useState('');
  const [objectDesc, setObjectDesc] = useState('');

  // Link form state
  const [linkSource, setLinkSource] = useState('');
  const [linkTarget, setLinkTarget] = useState('');
  const [linkLabel, setLinkLabel] = useState('');

  // Action form state
  const [actionTargetObject, setActionTargetObject] = useState('');
  const [actionName, setActionName] = useState('');
  const [actionDesc, setActionDesc] = useState('');
  const [actionType, setActionType] = useState<'traditional' | 'generative'>('traditional');

  // Focus on first input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [objectName, objectDesc, linkSource, linkTarget, linkLabel, actionTargetObject, actionName, actionDesc]);

  const handleSubmit = () => {
    if (type === 'object') {
      if (!objectName.trim()) return;
      onAddObject({
        id: `obj-${Date.now()}`,
        name: objectName.trim(),
        description: objectDesc.trim(),
        properties: [],
        actions: [],
        aiFeatures: []
      });
      onClose();
    } else if (type === 'link') {
      if (!linkSource || !linkTarget || !linkLabel.trim()) return;
      onAddLink({
        id: `link-${Date.now()}`,
        source: linkSource,
        target: linkTarget,
        label: linkLabel.trim()
      });
      onClose();
    } else if (type === 'action') {
      if (!actionTargetObject || !actionName.trim()) return;
      onAddAction(actionTargetObject, {
        name: actionName.trim(),
        description: actionDesc.trim(),
        type: actionType
      });
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'object': return <Package size={20} style={{ color: 'var(--color-accent)' }} />;
      case 'link': return <Link2 size={20} style={{ color: 'var(--color-success)' }} />;
      case 'action': return <Zap size={20} style={{ color: 'var(--color-warning, #d29922)' }} />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'object': return t.addObject;
      case 'link': return t.addLink;
      case 'action': return t.addAction;
    }
  };

  const canSubmit = () => {
    switch (type) {
      case 'object': return objectName.trim().length > 0;
      case 'link': return linkSource && linkTarget && linkLabel.trim().length > 0;
      case 'action': return actionTargetObject && actionName.trim().length > 0;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-2xl"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {getTitle()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-bg-hover)]"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {type === 'object' && (
            <>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                  {t.name} *
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={objectName}
                  onChange={e => setObjectName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                  {t.description}
                </label>
                <textarea
                  value={objectDesc}
                  onChange={e => setObjectDesc(e.target.value)}
                  placeholder={t.descPlaceholder}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
            </>
          )}

          {type === 'link' && (
            <>
              {objects.length < 2 ? (
                <div
                  className="text-center py-6 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-surface)' }}
                >
                  <Link2 size={32} className="mx-auto mb-2 text-muted" />
                  <p className="text-sm text-muted">{t.needTwoObjects}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                      {t.sourceObject} *
                    </label>
                    <select
                      ref={inputRef as any}
                      value={linkSource}
                      onChange={e => setLinkSource(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <option value="">{t.selectObject}</option>
                      {objects.map(obj => (
                        <option key={obj.id} value={obj.name}>{obj.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                      {t.relationLabel} *
                    </label>
                    <input
                      type="text"
                      value={linkLabel}
                      onChange={e => setLinkLabel(e.target.value)}
                      placeholder={t.relationPlaceholder}
                      className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                      {t.targetObject} *
                    </label>
                    <select
                      value={linkTarget}
                      onChange={e => setLinkTarget(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <option value="">{t.selectObject}</option>
                      {objects.map(obj => (
                        <option key={obj.id} value={obj.name}>{obj.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          )}

          {type === 'action' && (
            <>
              {objects.length === 0 ? (
                <div
                  className="text-center py-6 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-surface)' }}
                >
                  <Zap size={32} className="mx-auto mb-2 text-muted" />
                  <p className="text-sm text-muted">{t.noObjects}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                      {t.targetObjectAction} *
                    </label>
                    <select
                      ref={inputRef as any}
                      value={actionTargetObject}
                      onChange={e => setActionTargetObject(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <option value="">{t.selectObject}</option>
                      {objects.map(obj => (
                        <option key={obj.id} value={obj.id}>{obj.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                      {t.name} *
                    </label>
                    <input
                      type="text"
                      value={actionName}
                      onChange={e => setActionName(e.target.value)}
                      placeholder={t.actionNamePlaceholder}
                      className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                      {t.description}
                    </label>
                    <textarea
                      value={actionDesc}
                      onChange={e => setActionDesc(e.target.value)}
                      placeholder={t.descPlaceholder}
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">
                      {t.actionType}
                    </label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="actionType"
                          checked={actionType === 'traditional'}
                          onChange={() => setActionType('traditional')}
                          className="accent-[var(--color-accent)]"
                        />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {t.traditional}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="actionType"
                          checked={actionType === 'generative'}
                          onChange={() => setActionType('generative')}
                          className="accent-[var(--color-accent)]"
                        />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {t.generative}
                        </span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-5 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg transition-colors hover:bg-[var(--color-bg-hover)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="px-5 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canSubmit() ? 'var(--color-accent)' : 'var(--color-bg-hover)',
              color: canSubmit() ? '#fff' : 'var(--color-text-muted)'
            }}
          >
            {t.add}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddDialog;
