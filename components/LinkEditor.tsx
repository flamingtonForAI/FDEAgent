/**
 * LinkEditor - Link 编辑器
 * 编辑单个 Link 的源对象、目标对象、关系类型
 */
import React, { useState, useEffect } from 'react';
import { Language, OntologyObject, OntologyLink } from '../types';
import { X, Save, Link2, ArrowRight } from 'lucide-react';

interface LinkEditorProps {
  lang: Language;
  link: OntologyLink;
  objects: OntologyObject[];
  onSave: (updated: OntologyLink) => void;
  onClose: () => void;
  onDelete?: () => void;
}

const translations = {
  en: {
    editLink: 'Edit Relationship',
    createLink: 'Create Relationship',
    source: 'Source Object',
    target: 'Target Object',
    label: 'Relationship Type',
    labelPlaceholder: 'e.g., has_many, belongs_to, contains',
    description: 'Description',
    descriptionPlaceholder: 'Describe this relationship...',
    isSemantic: 'Semantic Relationship',
    semanticHelp: 'Semantic relationships represent meaningful business connections',
    cardinality: 'Cardinality',
    oneToOne: 'One to One (1:1)',
    oneToMany: 'One to Many (1:N)',
    manyToOne: 'Many to One (N:1)',
    manyToMany: 'Many to Many (N:N)',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    selectObject: 'Select an object',
    preview: 'Preview',
  },
  cn: {
    editLink: '编辑关联',
    createLink: '创建关联',
    source: '源对象',
    target: '目标对象',
    label: '关系类型',
    labelPlaceholder: '例如：has_many, belongs_to, contains',
    description: '描述',
    descriptionPlaceholder: '描述这个关系...',
    isSemantic: '语义关系',
    semanticHelp: '语义关系代表有意义的业务关联',
    cardinality: '基数',
    oneToOne: '一对一 (1:1)',
    oneToMany: '一对多 (1:N)',
    manyToOne: '多对一 (N:1)',
    manyToMany: '多对多 (N:N)',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    selectObject: '选择对象',
    preview: '预览',
  }
};

const LinkEditor: React.FC<LinkEditorProps> = ({
  lang,
  link,
  objects,
  onSave,
  onClose,
  onDelete
}) => {
  const t = translations[lang];
  const [editingLink, setEditingLink] = useState<OntologyLink>({ ...link });
  const isNew = !link.id || link.id === '';

  useEffect(() => {
    setEditingLink({ ...link });
  }, [link]);

  const handleSave = () => {
    // Generate ID if new
    const linkToSave = {
      ...editingLink,
      id: editingLink.id || `link-${Date.now()}`
    };
    onSave(linkToSave);
    onClose();
  };

  const updateField = (field: keyof OntologyLink, value: any) => {
    setEditingLink(prev => ({ ...prev, [field]: value }));
  };

  const sourceObject = objects.find(o => o.id === editingLink.source);
  const targetObject = objects.find(o => o.id === editingLink.target);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-warning)15', color: 'var(--color-warning)' }}
            >
              <Link2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {isNew ? t.createLink : t.editLink}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Preview */}
          <div
            className="p-4 rounded-lg flex items-center justify-center gap-3"
            style={{ backgroundColor: 'var(--color-bg-surface)' }}
          >
            <div
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: sourceObject ? 'var(--color-accent)20' : 'var(--color-bg-hover)',
                color: sourceObject ? 'var(--color-accent)' : 'var(--color-text-muted)'
              }}
            >
              {sourceObject?.name || t.selectObject}
            </div>
            <div className="flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
              <div className="w-8 h-0.5" style={{ backgroundColor: 'var(--color-warning)' }} />
              <span className="text-xs font-mono">{editingLink.label || '...'}</span>
              <ArrowRight size={14} />
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: targetObject ? 'var(--color-success)20' : 'var(--color-bg-hover)',
                color: targetObject ? 'var(--color-success)' : 'var(--color-text-muted)'
              }}
            >
              {targetObject?.name || t.selectObject}
            </div>
          </div>

          {/* Source & Target */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">{t.source} *</label>
              <select
                value={editingLink.source || ''}
                onChange={(e) => updateField('source', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
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
              <label className="block text-xs text-muted mb-1.5">{t.target} *</label>
              <select
                value={editingLink.target || ''}
                onChange={(e) => updateField('target', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
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
          </div>

          {/* Relationship Type */}
          <div>
            <label className="block text-xs text-muted mb-1.5">{t.label} *</label>
            <input
              type="text"
              value={editingLink.label || ''}
              onChange={(e) => updateField('label', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              placeholder={t.labelPlaceholder}
            />
          </div>

          {/* Cardinality */}
          <div>
            <label className="block text-xs text-muted mb-1.5">{t.cardinality}</label>
            <select
              value={editingLink.cardinality || '1:N'}
              onChange={(e) => updateField('cardinality', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              <option value="1:1">{t.oneToOne}</option>
              <option value="1:N">{t.oneToMany}</option>
              <option value="N:1">{t.manyToOne}</option>
              <option value="N:N">{t.manyToMany}</option>
            </select>
          </div>

          {/* Semantic Toggle */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-surface)' }}
          >
            <div>
              <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{t.isSemantic}</div>
              <div className="text-xs text-muted">{t.semanticHelp}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={editingLink.isSemantic !== false}
                onChange={(e) => updateField('isSemantic', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 rounded-full peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"
                style={{
                  backgroundColor: editingLink.isSemantic !== false ? 'var(--color-accent)' : 'var(--color-bg-hover)'
                }}
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div>
            {onDelete && !isNew && (
              <button
                onClick={() => {
                  if (window.confirm(lang === 'cn' ? '确定删除此关联？' : 'Delete this relationship?')) {
                    onDelete();
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-lg text-sm transition-colors text-red-400 hover:bg-red-400/10"
              >
                {t.delete}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={!editingLink.source || !editingLink.target || !editingLink.label}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
            >
              <Save size={14} />
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkEditor;
