/**
 * IntegrationEditor — Modal editor for a single integration.
 * Follows the ObjectEditor/LinkEditor modal pattern from Phase 2.
 */
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, AlertTriangle } from 'lucide-react';
import type { ExternalIntegration, OntologyObject } from '../types';
import type { NormalizedIntegration } from '../lib/integrationNormalizer';
import { denormalizeIntegration } from '../lib/integrationNormalizer';
import { useAppTranslation } from '../hooks/useAppTranslation';
import FieldMappingTable from './FieldMappingTable';

const MECHANISM_OPTIONS = ['API', 'Webhook', 'Batch', 'CDC', 'File Import', 'AI Parsing'];
const DIRECTION_OPTIONS: NormalizedIntegration['direction'][] = ['import', 'export', 'bidirectional'];
const SYNC_MODE_OPTIONS: NormalizedIntegration['syncPolicy']['mode'][] = ['realtime', 'batch', 'event-driven', 'manual'];
const CONFLICT_OPTIONS: NormalizedIntegration['syncPolicy']['conflictStrategy'][] = [
  'source-wins', 'target-wins', 'manual-review', 'last-write-wins',
];

interface IntegrationEditorProps {
  integration: NormalizedIntegration;
  original?: ExternalIntegration;
  objects: OntologyObject[];
  onSave: (updated: ExternalIntegration) => void;
  onClose: () => void;
  onDelete?: () => void;
}

const IntegrationEditor: React.FC<IntegrationEditorProps> = ({
  integration,
  original,
  objects,
  onSave,
  onClose,
  onDelete,
}) => {
  const { t } = useAppTranslation('integration');
  const [form, setForm] = useState<NormalizedIntegration>({ ...integration });

  useEffect(() => {
    setForm({ ...integration });
  }, [integration]);

  const update = <K extends keyof NormalizedIntegration>(key: K, val: NormalizedIntegration[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const updateSync = <K extends keyof NormalizedIntegration['syncPolicy']>(
    key: K,
    val: NormalizedIntegration['syncPolicy'][K],
  ) => {
    setForm(prev => ({
      ...prev,
      syncPolicy: { ...prev.syncPolicy, [key]: val },
    }));
  };

  const handleSave = () => {
    onSave(denormalizeIntegration(form, original));
    onClose();
  };

  // Data points management
  const addDataPoint = () => update('dataPoints', [...form.dataPoints, '']);
  const updateDataPoint = (idx: number, val: string) =>
    update('dataPoints', form.dataPoints.map((dp, i) => (i === idx ? val : dp)));
  const removeDataPoint = (idx: number) =>
    update('dataPoints', form.dataPoints.filter((_, i) => i !== idx));

  const targetObject = objects.find(o => o.id === form.targetObjectId) || null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {onDelete ? t('editor.editTitle') : t('editor.newTitle')}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* System name */}
          <Field label={t('editor.systemName')}>
            <input
              type="text"
              value={form.systemName}
              onChange={e => update('systemName', e.target.value)}
              className="input-field"
              style={inputStyle}
            />
          </Field>

          {/* Description */}
          <Field label={t('editor.description')} hint={t('editor.descriptionHint')}>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={2}
              className="input-field"
              style={inputStyle}
            />
          </Field>

          {/* Target object */}
          <Field label={t('editor.targetObject')}>
            <select
              value={form.targetObjectId}
              onChange={e => update('targetObjectId', e.target.value)}
              className="input-field"
              style={inputStyle}
            >
              <option value="">{t('editor.selectObject')}</option>
              {objects.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name} {o.nameCn ? `(${o.nameCn})` : ''}
                </option>
              ))}
            </select>
          </Field>

          {/* Mechanism */}
          <Field label={t('editor.mechanism')}>
            <select
              value={form.mechanism}
              onChange={e => update('mechanism', e.target.value)}
              className="input-field"
              style={inputStyle}
            >
              {MECHANISM_OPTIONS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>

          {/* Direction */}
          <Field label={t('editor.direction')}>
            <div className="flex gap-3">
              {DIRECTION_OPTIONS.map(d => (
                <label key={d} className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
                  <input
                    type="radio"
                    name="direction"
                    checked={form.direction === d}
                    onChange={() => update('direction', d)}
                  />
                  {t(`editor.direction_${d}`)}
                </label>
              ))}
            </div>
          </Field>

          {/* Sync policy section */}
          <div
            className="rounded-lg p-4 space-y-4"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div>
              <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {t('editor.syncPolicy')}
              </h4>
              <p className="text-[10px] text-muted mt-0.5">{t('editor.syncPolicyHint')}</p>
            </div>

            {/* Mode */}
            <Field label={t('editor.syncMode')}>
              <select
                value={form.syncPolicy.mode}
                onChange={e => updateSync('mode', e.target.value as NormalizedIntegration['syncPolicy']['mode'])}
                className="input-field"
                style={inputStyle}
              >
                {SYNC_MODE_OPTIONS.map(m => (
                  <option key={m} value={m}>{t(`editor.syncMode_${m}`)}</option>
                ))}
              </select>
            </Field>

            {/* Frequency — only shown for batch */}
            {form.syncPolicy.mode === 'batch' && (
              <Field label={t('editor.frequency')}>
                <select
                  value={form.syncPolicy.frequency}
                  onChange={e => updateSync('frequency', e.target.value)}
                  className="input-field"
                  style={inputStyle}
                >
                  <option value="">{t('editor.selectFrequency')}</option>
                  <option value="hourly">{t('editor.freq_hourly')}</option>
                  <option value="daily">{t('editor.freq_daily')}</option>
                  <option value="weekly">{t('editor.freq_weekly')}</option>
                </select>
              </Field>
            )}

            {/* Conflict strategy */}
            <Field label={t('editor.conflictStrategy')}>
              <select
                value={form.syncPolicy.conflictStrategy}
                onChange={e =>
                  updateSync('conflictStrategy', e.target.value as NormalizedIntegration['syncPolicy']['conflictStrategy'])
                }
                className="input-field"
                style={inputStyle}
              >
                {CONFLICT_OPTIONS.map(c => (
                  <option key={c} value={c}>{t(`editor.conflict_${c}`)}</option>
                ))}
              </select>
            </Field>

            {/* Retry policy */}
            <Field label={t('editor.retryPolicy')}>
              <textarea
                value={form.syncPolicy.retryPolicy}
                onChange={e => updateSync('retryPolicy', e.target.value)}
                rows={2}
                placeholder={t('editor.retryPolicyPlaceholder')}
                className="input-field"
                style={inputStyle}
              />
            </Field>
          </div>

          {/* Data points */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {t('editor.dataPoints')}
              </label>
              <button
                type="button"
                onClick={addDataPoint}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded"
                style={{ color: 'var(--color-accent)' }}
              >
                <Plus size={10} /> {t('editor.addDataPoint')}
              </button>
            </div>
            {form.dataPoints.map((dp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={dp}
                  onChange={e => updateDataPoint(idx, e.target.value)}
                  className="flex-1 input-field"
                  style={inputStyle}
                  placeholder={t('editor.dataPointPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => removeDataPoint(idx)}
                  className="p-1 rounded hover:bg-[var(--color-bg-hover)]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Field mappings — show when target object selected */}
          {form.targetObjectId && (
            <FieldMappingTable
              mappings={form.fieldMappings}
              targetObject={targetObject}
              onChange={mappings => update('fieldMappings', mappings)}
            />
          )}
        </div>

        {/* Incomplete integration warning */}
        {(!form.targetObjectId || !form.mechanism) && form.systemName.trim() && (
          <div
            className="flex items-center gap-2 px-6 py-2 text-xs"
            style={{
              backgroundColor: 'var(--color-warning-bg, rgba(250,200,50,0.08))',
              color: 'var(--color-warning, #e6a700)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <AlertTriangle size={14} />
            {t('editor.incompleteWarning')}
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-red-500/10"
                style={{ color: 'var(--color-error, #e53e3e)' }}
              >
                <Trash2 size={14} />
                {t('editor.delete')}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t('editor.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!form.systemName.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'white',
              }}
            >
              <Save size={14} />
              {t('editor.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 13,
  width: '100%',
};

const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
      {label}
    </label>
    {hint && <p className="text-[10px] text-muted">{hint}</p>}
    {children}
  </div>
);

export default IntegrationEditor;
