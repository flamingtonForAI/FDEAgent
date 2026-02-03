/**
 * ObjectEditor - Object 编辑器
 * 编辑单个 Object 的名称、描述、属性
 */
import React, { useState, useEffect } from 'react';
import { Language, OntologyObject, PropertyDefinition } from '../types';
import {
  X, Save, Plus, Trash2, GripVertical, Box, AlertCircle
} from 'lucide-react';

interface ObjectEditorProps {
  lang: Language;
  object: OntologyObject;
  onSave: (updated: OntologyObject) => void;
  onClose: () => void;
}

const translations = {
  en: {
    editObject: 'Edit Object',
    name: 'Name',
    nameCn: 'Chinese Name',
    description: 'Description',
    descriptionCn: 'Chinese Description',
    primaryKey: 'Primary Key',
    properties: 'Properties',
    addProperty: 'Add Property',
    propName: 'Property Name',
    propType: 'Type',
    propDesc: 'Description',
    propRequired: 'Required',
    save: 'Save',
    cancel: 'Cancel',
    noProperties: 'No properties defined',
    typeString: 'String',
    typeNumber: 'Number',
    typeBoolean: 'Boolean',
    typeDatetime: 'Datetime',
    typeArray: 'Array',
    typeObject: 'Object',
  },
  cn: {
    editObject: '编辑对象',
    name: '名称',
    nameCn: '中文名称',
    description: '描述',
    descriptionCn: '中文描述',
    primaryKey: '主键',
    properties: '属性列表',
    addProperty: '添加属性',
    propName: '属性名',
    propType: '类型',
    propDesc: '说明',
    propRequired: '必填',
    save: '保存',
    cancel: '取消',
    noProperties: '暂无属性',
    typeString: '字符串',
    typeNumber: '数字',
    typeBoolean: '布尔',
    typeDatetime: '日期时间',
    typeArray: '数组',
    typeObject: '对象',
  }
};

const propertyTypes = ['string', 'number', 'boolean', 'datetime', 'array', 'object'];

const ObjectEditor: React.FC<ObjectEditorProps> = ({
  lang,
  object,
  onSave,
  onClose
}) => {
  const t = translations[lang];
  const [editingObject, setEditingObject] = useState<OntologyObject>({ ...object });

  useEffect(() => {
    setEditingObject({ ...object });
  }, [object]);

  const handleSave = () => {
    onSave(editingObject);
    onClose();
  };

  const updateField = (field: keyof OntologyObject, value: any) => {
    setEditingObject(prev => ({ ...prev, [field]: value }));
  };

  const addProperty = () => {
    const newProp: PropertyDefinition = {
      name: '',
      type: 'string',
      description: '',
    };
    setEditingObject(prev => ({
      ...prev,
      properties: [...(prev.properties || []), newProp]
    }));
  };

  const updateProperty = (index: number, updates: Partial<PropertyDefinition>) => {
    setEditingObject(prev => ({
      ...prev,
      properties: prev.properties?.map((p, i) =>
        i === index ? { ...p, ...updates } : p
      ) || []
    }));
  };

  const removeProperty = (index: number) => {
    setEditingObject(prev => ({
      ...prev,
      properties: prev.properties?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)15', color: 'var(--color-accent)' }}
            >
              <Box size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t.editObject}
              </h2>
              <p className="text-xs text-muted">{object.name || 'New Object'}</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">{t.name} *</label>
              <input
                type="text"
                value={editingObject.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                placeholder="e.g., WorkOrder"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">{t.nameCn}</label>
              <input
                type="text"
                value={editingObject.nameCn || ''}
                onChange={(e) => updateField('nameCn', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                placeholder="例如：生产工单"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">{t.description}</label>
            <textarea
              value={editingObject.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              placeholder="Describe this object..."
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">{t.primaryKey}</label>
            <input
              type="text"
              value={editingObject.primaryKey || ''}
              onChange={(e) => updateField('primaryKey', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
              placeholder="e.g., id, workOrderId"
            />
          </div>

          {/* Properties */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t.properties} ({editingObject.properties?.length || 0})
              </label>
              <button
                onClick={addProperty}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
                style={{ backgroundColor: 'var(--color-accent)15', color: 'var(--color-accent)' }}
              >
                <Plus size={12} />
                {t.addProperty}
              </button>
            </div>

            {(!editingObject.properties || editingObject.properties.length === 0) ? (
              <div
                className="p-4 rounded-lg text-center text-sm text-muted"
                style={{ backgroundColor: 'var(--color-bg-surface)' }}
              >
                {t.noProperties}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 px-2 text-xs text-muted">
                  <div className="col-span-3">{t.propName}</div>
                  <div className="col-span-2">{t.propType}</div>
                  <div className="col-span-5">{t.propDesc}</div>
                  <div className="col-span-1 text-center">{t.propRequired}</div>
                  <div className="col-span-1"></div>
                </div>

                {editingObject.properties.map((prop, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg-surface)' }}
                  >
                    <input
                      type="text"
                      value={prop.name || ''}
                      onChange={(e) => updateProperty(index, { name: e.target.value })}
                      className="col-span-3 px-2 py-1.5 rounded text-xs focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      placeholder="name"
                    />
                    <select
                      value={prop.type || 'string'}
                      onChange={(e) => updateProperty(index, { type: e.target.value })}
                      className="col-span-2 px-2 py-1.5 rounded text-xs focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={prop.description || ''}
                      onChange={(e) => updateProperty(index, { description: e.target.value })}
                      className="col-span-5 px-2 py-1.5 rounded text-xs focus:outline-none"
                      style={{
                        backgroundColor: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      placeholder="description"
                    />
                    <div className="col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={prop.required || false}
                        onChange={(e) => updateProperty(index, { required: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                    </div>
                    <button
                      onClick={() => removeProperty(index)}
                      className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
          >
            <Save size={14} />
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObjectEditor;
