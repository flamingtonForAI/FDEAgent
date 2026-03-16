import React, { useState } from 'react';
import { OntologyObject, AIPAction, ActionParameter } from '../types';
import {
  Zap, ChevronRight, Briefcase, GitBranch, Code, Shield,
  Plus, Trash2, Save, Edit3, CheckCircle, FileJson, Bot
} from 'lucide-react';
import APISpecViewer from './APISpecViewer';
import ToolSpecViewer from './ToolSpecViewer';
import { useAppTranslation } from '../hooks/useAppTranslation';

type LayerTab = 'business' | 'logic' | 'implementation' | 'governance' | 'api' | 'tool';

interface Props {
  objects: OntologyObject[];
  onUpdateAction: (objectId: string, actionIndex: number, updatedAction: AIPAction) => void;
}

const ActionDesigner: React.FC<Props> = ({ objects, onUpdateAction }) => {
  const { t } = useAppTranslation('modeling');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(
    objects.length > 0 ? objects[0].id : null
  );
  const [selectedActionIndex, setSelectedActionIndex] = useState<number | null>(null);
  const [editingAction, setEditingAction] = useState<AIPAction | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<LayerTab>('business');

  const selectedObject = objects.find(o => o.id === selectedObjectId);
  const selectedAction = selectedObject && selectedActionIndex !== null
    ? selectedObject.actions[selectedActionIndex]
    : null;

  const handleSelectAction = (index: number) => {
    setSelectedActionIndex(index);
    if (selectedObject) {
      setEditingAction(JSON.parse(JSON.stringify(selectedObject.actions[index])));
    }
  };

  const handleSave = () => {
    if (selectedObjectId && selectedActionIndex !== null && editingAction) {
      onUpdateAction(selectedObjectId, selectedActionIndex, editingAction);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  const updateEditingAction = (updates: Partial<AIPAction>) => {
    if (editingAction) {
      setEditingAction({ ...editingAction, ...updates });
    }
  };

  const addToArray = (field: 'preconditions' | 'postconditions' | 'sideEffects') => {
    if (!editingAction) return;
    const layer = editingAction.logicLayer || { preconditions: [], parameters: [], postconditions: [], sideEffects: [] };
    const arr = layer[field] || [];
    setEditingAction({
      ...editingAction,
      logicLayer: { ...layer, [field]: [...arr, ''] }
    });
  };

  const updateArrayItem = (field: 'preconditions' | 'postconditions' | 'sideEffects', index: number, value: string) => {
    if (!editingAction?.logicLayer) return;
    const arr = [...(editingAction.logicLayer[field] || [])];
    arr[index] = value;
    setEditingAction({
      ...editingAction,
      logicLayer: { ...editingAction.logicLayer, [field]: arr }
    });
  };

  const removeArrayItem = (field: 'preconditions' | 'postconditions' | 'sideEffects', index: number) => {
    if (!editingAction?.logicLayer) return;
    const arr = [...(editingAction.logicLayer[field] || [])];
    arr.splice(index, 1);
    setEditingAction({
      ...editingAction,
      logicLayer: { ...editingAction.logicLayer, [field]: arr }
    });
  };

  const addParameter = () => {
    if (!editingAction) return;
    const layer = editingAction.logicLayer || { preconditions: [], parameters: [], postconditions: [], sideEffects: [] };
    const params = layer.parameters || [];
    setEditingAction({
      ...editingAction,
      logicLayer: {
        ...layer,
        parameters: [...params, { name: '', type: 'string', required: true, description: '' }]
      }
    });
  };

  const updateParameter = (index: number, updates: Partial<ActionParameter>) => {
    if (!editingAction?.logicLayer) return;
    const params = [...(editingAction.logicLayer.parameters || [])];
    params[index] = { ...params[index], ...updates };
    setEditingAction({
      ...editingAction,
      logicLayer: { ...editingAction.logicLayer, parameters: params }
    });
  };

  const removeParameter = (index: number) => {
    if (!editingAction?.logicLayer) return;
    const params = [...(editingAction.logicLayer.parameters || [])];
    params.splice(index, 1);
    setEditingAction({
      ...editingAction,
      logicLayer: { ...editingAction.logicLayer, parameters: params }
    });
  };

  const tabs: { id: LayerTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'business', label: t('actionDesigner.businessLayer'), icon: <Briefcase size={14} />, color: 'blue' },
    { id: 'logic', label: t('actionDesigner.logicLayer'), icon: <GitBranch size={14} />, color: 'emerald' },
    { id: 'implementation', label: t('actionDesigner.implementationLayer'), icon: <Code size={14} />, color: 'purple' },
    { id: 'governance', label: t('actionDesigner.governance'), icon: <Shield size={14} />, color: 'orange' },
    { id: 'api', label: t('actionDesigner.apiSpec'), icon: <FileJson size={14} />, color: 'purple' },
    { id: 'tool', label: t('actionDesigner.toolSpec'), icon: <Bot size={14} />, color: 'amber' },
  ];

  if (objects.length === 0) {
    return (
      <div className="p-8 h-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
        <div className="text-center text-muted">
          <Zap size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">{t('actionDesigner.noObjects')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-bg-elevated)] flex">
      {/* Left Panel - Object & Action List */}
      <div className="w-64 border-r border-white/[0.06] flex flex-col">
        {/* Object Selector */}
        <div className="p-4 border-b border-white/[0.06]">
          <label htmlFor="object-selector" className="text-micro text-muted block mb-2">{t('actionDesigner.selectObject')}</label>
          <select
            id="object-selector"
            value={selectedObjectId || ''}
            onChange={(e) => {
              setSelectedObjectId(e.target.value);
              setSelectedActionIndex(null);
              setEditingAction(null);
            }}
            className="w-full glass-surface rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/30"
            aria-describedby="object-selector-description"
          >
            {objects.map(obj => (
              <option key={obj.id} value={obj.id}>{obj.name}</option>
            ))}
          </select>
          <span id="object-selector-description" className="sr-only">Select an ontology object to view and edit its actions</span>
        </div>

        {/* Action List */}
        <div className="flex-1 overflow-y-auto p-4">
          <label className="text-micro text-muted block mb-2">{t('actionDesigner.selectAction')}</label>
          {selectedObject && selectedObject.actions.length > 0 ? (
            <div className="space-y-1.5">
              {selectedObject.actions.map((action, idx) => (
                <button
                  key={action.name}
                  onClick={() => handleSelectAction(idx)}
                  className={`relative w-full text-left p-3 rounded-lg transition-colors ${
                    selectedActionIndex === idx
                      ? 'bg-amber-500/10 text-white'
                      : 'hover:bg-white/[0.04] text-muted'
                  }`}
                >
                  {selectedActionIndex === idx && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-amber-500" />
                  )}
                  <div className="flex items-center gap-2">
                    {action.type === 'generative' ? (
                      <Zap size={14} className="text-amber-400" />
                    ) : (
                      <ChevronRight size={14} className="text-muted" />
                    )}
                    <span className="text-sm">{action.name}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">{t('actionDesigner.noActions')}</p>
          )}
        </div>
      </div>

      {/* Right Panel - Action Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {editingAction ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                  <Edit3 size={16} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-white">{editingAction.name}</h2>
                  <p className="text-xs text-muted">{t('actionDesigner.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {showSaved && (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs animate-fadeIn">
                    <CheckCircle size={14} />
                    {t('actionDesigner.saved')}
                  </span>
                )}
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 btn-gradient px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  <Save size={14} />
                  {t('actionDesigner.save')}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-white/[0.06]">
              <div className="flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-item flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Business Layer */}
              {activeTab === 'business' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="text-xs text-muted block mb-2">{t('actionDesigner.description')}</label>
                    <textarea
                      value={editingAction.businessLayer?.description || ''}
                      onChange={(e) => updateEditingAction({
                        businessLayer: { ...editingAction.businessLayer, description: e.target.value, targetObject: editingAction.businessLayer?.targetObject || '', executorRole: editingAction.businessLayer?.executorRole || '' }
                      })}
                      className="w-full glass-surface rounded-lg px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-blue-500/30"
                      rows={3}
                      placeholder={t('actionDesigner.descriptionPlaceholder')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted block mb-2">{t('actionDesigner.targetObject')}</label>
                      <input
                        type="text"
                        value={editingAction.businessLayer?.targetObject || ''}
                        onChange={(e) => updateEditingAction({
                          businessLayer: { ...editingAction.businessLayer, description: editingAction.businessLayer?.description || '', targetObject: e.target.value, executorRole: editingAction.businessLayer?.executorRole || '' }
                        })}
                        className="w-full glass-surface rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/30"
                        placeholder={t('actionDesigner.targetObjectPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-2">{t('actionDesigner.executorRole')}</label>
                      <input
                        type="text"
                        value={editingAction.businessLayer?.executorRole || ''}
                        onChange={(e) => updateEditingAction({
                          businessLayer: { ...editingAction.businessLayer, description: editingAction.businessLayer?.description || '', targetObject: editingAction.businessLayer?.targetObject || '', executorRole: e.target.value }
                        })}
                        className="w-full glass-surface rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/30"
                        placeholder={t('actionDesigner.executorRolePlaceholder')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-2">{t('actionDesigner.triggerCondition')}</label>
                    <input
                      type="text"
                      value={editingAction.businessLayer?.triggerCondition || ''}
                      onChange={(e) => updateEditingAction({
                        businessLayer: { ...editingAction.businessLayer, description: editingAction.businessLayer?.description || '', targetObject: editingAction.businessLayer?.targetObject || '', executorRole: editingAction.businessLayer?.executorRole || '', triggerCondition: e.target.value }
                      })}
                      className="w-full glass-surface rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/30"
                      placeholder={t('actionDesigner.triggerConditionPlaceholder')}
                    />
                  </div>
                </div>
              )}

              {/* Logic Layer */}
              {activeTab === 'logic' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Preconditions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs text-muted">{t('actionDesigner.preconditions')}</label>
                      <button onClick={() => addToArray('preconditions')} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        <Plus size={12} /> {t('actionDesigner.addItem')}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(editingAction.logicLayer?.preconditions || []).map((pre, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={pre}
                            onChange={(e) => updateArrayItem('preconditions', idx, e.target.value)}
                            className="flex-1 glass-surface rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                            placeholder={t('actionDesigner.preconditionPlaceholder')}
                          />
                          <button onClick={() => removeArrayItem('preconditions', idx)} className="text-muted hover:text-red-400 p-2 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {(editingAction.logicLayer?.preconditions || []).length === 0 && (
                        <p className="text-xs text-muted">{t('actionDesigner.noPreconditions')}</p>
                      )}
                    </div>
                  </div>

                  {/* Parameters */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs text-muted">{t('actionDesigner.parameters')}</label>
                      <button onClick={addParameter} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        <Plus size={12} /> {t('actionDesigner.addItem')}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(editingAction.logicLayer?.parameters || []).map((param, idx) => (
                        <div key={idx} className="flex gap-2 items-center glass-surface rounded-lg p-3">
                          <input
                            type="text"
                            value={param.name}
                            onChange={(e) => updateParameter(idx, { name: e.target.value })}
                            placeholder={t('actionDesigner.paramName')}
                            className="w-32 bg-[var(--color-bg-base)]/30 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                          <select
                            value={param.type}
                            onChange={(e) => updateParameter(idx, { type: e.target.value as ActionParameter['type'] })}
                            className="w-24 bg-[var(--color-bg-base)]/30 border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                          >
                            <option value="string">string</option>
                            <option value="number">number</option>
                            <option value="boolean">boolean</option>
                            <option value="date">date</option>
                            <option value="object">object</option>
                            <option value="array">array</option>
                          </select>
                          <label className="flex items-center gap-1.5 text-xs text-muted">
                            <input
                              type="checkbox"
                              checked={param.required}
                              onChange={(e) => updateParameter(idx, { required: e.target.checked })}
                              className="rounded border-white/20"
                            />
                            {t('actionDesigner.paramRequired')}
                          </label>
                          <input
                            type="text"
                            value={param.description}
                            onChange={(e) => updateParameter(idx, { description: e.target.value })}
                            placeholder={t('actionDesigner.paramDescription')}
                            className="flex-1 bg-[var(--color-bg-base)]/30 border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                          <button onClick={() => removeParameter(idx)} className="text-muted hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Postconditions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs text-muted">{t('actionDesigner.postconditions')}</label>
                      <button onClick={() => addToArray('postconditions')} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        <Plus size={12} /> {t('actionDesigner.addItem')}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(editingAction.logicLayer?.postconditions || []).map((post, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={post}
                            onChange={(e) => updateArrayItem('postconditions', idx, e.target.value)}
                            className="flex-1 glass-surface rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                          />
                          <button onClick={() => removeArrayItem('postconditions', idx)} className="text-muted hover:text-red-400 p-2 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Side Effects */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs text-muted">{t('actionDesigner.sideEffects')}</label>
                      <button onClick={() => addToArray('sideEffects')} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        <Plus size={12} /> {t('actionDesigner.addItem')}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(editingAction.logicLayer?.sideEffects || []).map((effect, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={effect}
                            onChange={(e) => updateArrayItem('sideEffects', idx, e.target.value)}
                            className="flex-1 glass-surface rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                          />
                          <button onClick={() => removeArrayItem('sideEffects', idx)} className="text-muted hover:text-red-400 p-2 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Implementation Layer */}
              {activeTab === 'implementation' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted block mb-2">{t('actionDesigner.apiEndpoint')}</label>
                      <input
                        type="text"
                        value={editingAction.implementationLayer?.apiEndpoint || ''}
                        onChange={(e) => updateEditingAction({
                          implementationLayer: { ...editingAction.implementationLayer, apiEndpoint: e.target.value }
                        })}
                        placeholder="/api/resource/{id}/action"
                        className="w-full glass-surface rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-purple-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-2">{t('actionDesigner.apiMethod')}</label>
                      <select
                        value={editingAction.implementationLayer?.apiMethod || 'POST'}
                        onChange={(e) => updateEditingAction({
                          implementationLayer: { ...editingAction.implementationLayer, apiMethod: e.target.value as any }
                        })}
                        className="w-full glass-surface rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/30"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted block mb-2">{t('actionDesigner.agentToolName')}</label>
                      <input
                        type="text"
                        value={editingAction.implementationLayer?.agentToolSpec?.name || ''}
                        onChange={(e) => updateEditingAction({
                          implementationLayer: {
                            ...editingAction.implementationLayer,
                            agentToolSpec: {
                              name: e.target.value,
                              description: editingAction.implementationLayer?.agentToolSpec?.description || '',
                              parameters: editingAction.implementationLayer?.agentToolSpec?.parameters || {}
                            }
                          }
                        })}
                        placeholder="action_name"
                        className="w-full glass-surface rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-purple-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-2">{t('actionDesigner.agentToolDesc')}</label>
                      <input
                        type="text"
                        value={editingAction.implementationLayer?.agentToolSpec?.description || ''}
                        onChange={(e) => updateEditingAction({
                          implementationLayer: {
                            ...editingAction.implementationLayer,
                            agentToolSpec: {
                              name: editingAction.implementationLayer?.agentToolSpec?.name || '',
                              description: e.target.value,
                              parameters: editingAction.implementationLayer?.agentToolSpec?.parameters || {}
                            }
                          }
                        })}
                        className="w-full glass-surface rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Governance Layer */}
              {activeTab === 'governance' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted block mb-2">{t('actionDesigner.permissionTier')}</label>
                      <select
                        value={editingAction.governance?.permissionTier || 1}
                        onChange={(e) => updateEditingAction({
                          governance: {
                            ...editingAction.governance,
                            permissionTier: parseInt(e.target.value) as 1|2|3|4,
                            requiresHumanApproval: editingAction.governance?.requiresHumanApproval || false,
                            auditLog: editingAction.governance?.auditLog || true
                          }
                        })}
                        className="w-full glass-surface rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/30"
                      >
                        <option value={1}>Tier 1 - Full Auto (Read/Low-risk writes)</option>
                        <option value={2}>Tier 2 - Auto + Audit (Standard operations)</option>
                        <option value={3}>Tier 3 - Human Confirm (Business critical)</option>
                        <option value={4}>Tier 4 - Multi-Approve (High-risk/Irreversible)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-2">{t('actionDesigner.riskLevel')}</label>
                      <select
                        value={editingAction.governance?.riskLevel || 'low'}
                        onChange={(e) => updateEditingAction({
                          governance: {
                            ...editingAction.governance,
                            permissionTier: editingAction.governance?.permissionTier || 1,
                            requiresHumanApproval: editingAction.governance?.requiresHumanApproval || false,
                            auditLog: editingAction.governance?.auditLog || true,
                            riskLevel: e.target.value as 'low'|'medium'|'high'
                          }
                        })}
                        className="w-full glass-surface rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/30"
                      >
                        <option value="low">{t('actionDesigner.low')}</option>
                        <option value="medium">{t('actionDesigner.medium')}</option>
                        <option value="high">{t('actionDesigner.high')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingAction.governance?.requiresHumanApproval || false}
                        onChange={(e) => updateEditingAction({
                          governance: {
                            ...editingAction.governance,
                            permissionTier: editingAction.governance?.permissionTier || 1,
                            requiresHumanApproval: e.target.checked,
                            auditLog: editingAction.governance?.auditLog || true
                          }
                        })}
                        className="rounded border-white/20"
                      />
                      {t('actionDesigner.requiresApproval')}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingAction.governance?.auditLog ?? true}
                        onChange={(e) => updateEditingAction({
                          governance: {
                            ...editingAction.governance,
                            permissionTier: editingAction.governance?.permissionTier || 1,
                            requiresHumanApproval: editingAction.governance?.requiresHumanApproval || false,
                            auditLog: e.target.checked
                          }
                        })}
                        className="rounded border-white/20"
                      />
                      {t('actionDesigner.auditLog')}
                    </label>
                  </div>
                </div>
              )}

              {/* API Spec Tab */}
              {activeTab === 'api' && (
                <div className="animate-fadeIn -m-6 h-[calc(100%+3rem)]">
                  <APISpecViewer
                    objects={objects}
                    selectedObjectId={selectedObjectId || undefined}
                    selectedAction={editingAction || undefined}
                  />
                </div>
              )}

              {/* Tool Spec Tab */}
              {activeTab === 'tool' && (
                <div className="animate-fadeIn -m-6 h-[calc(100%+3rem)]">
                  <ToolSpecViewer
                    objects={objects}
                    selectedObjectId={selectedObjectId || undefined}
                    selectedAction={editingAction || undefined}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-muted">
            <div className="text-center">
              <Edit3 size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">{t('actionDesigner.selectToEdit')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionDesigner;
