/**
 * FieldMappingTable — Manual field-level mapping editor.
 * Embedded inside IntegrationEditor when a targetObjectId is selected.
 */
import React from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import type { FieldMapping, OntologyObject } from '../types';
import { useAppTranslation } from '../hooks/useAppTranslation';

const TRANSFORM_OPTIONS: FieldMapping['transform'][] = [
  'direct', 'concat', 'unit-conversion', 'lookup', 'date-format', 'custom',
];

interface FieldMappingTableProps {
  mappings: FieldMapping[];
  targetObject: OntologyObject | null;
  onChange: (mappings: FieldMapping[]) => void;
}

const FieldMappingTable: React.FC<FieldMappingTableProps> = ({
  mappings,
  targetObject,
  onChange,
}) => {
  const { t } = useAppTranslation('integration');
  const targetProps = targetObject?.properties || [];

  const addRow = () => {
    onChange([
      ...mappings,
      { sourceField: '', targetPropertyName: '', transform: 'direct' },
    ]);
  };

  const updateRow = (idx: number, patch: Partial<FieldMapping>) => {
    onChange(mappings.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };

  const removeRow = (idx: number) => {
    onChange(mappings.filter((_, i) => i !== idx));
  };

  const isUnresolved = (m: FieldMapping) =>
    m.targetPropertyName !== '' &&
    !targetProps.some(p => p.name === m.targetPropertyName);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {t('fieldMapping.title')}
        </h4>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors"
          style={{
            color: 'var(--color-accent)',
            backgroundColor: 'var(--color-accent)10',
          }}
        >
          <Plus size={12} /> {t('fieldMapping.addRow')}
        </button>
      </div>

      {mappings.length === 0 ? (
        <p className="text-xs text-muted italic py-4 text-center">
          {t('fieldMapping.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr
                className="text-left"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <th className="px-2 py-1.5 font-medium">{t('fieldMapping.sourceField')}</th>
                <th className="px-2 py-1.5 font-medium w-6"></th>
                <th className="px-2 py-1.5 font-medium">{t('fieldMapping.targetProperty')}</th>
                <th className="px-2 py-1.5 font-medium">{t('fieldMapping.transform')}</th>
                <th className="px-2 py-1.5 font-medium">{t('fieldMapping.note')}</th>
                <th className="px-2 py-1.5 font-medium w-12 text-center">{t('fieldMapping.required')}</th>
                <th className="px-2 py-1.5 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m, idx) => {
                const unresolved = isUnresolved(m);
                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: unresolved
                        ? 'var(--color-warning-bg, rgba(250,200,50,0.08))'
                        : undefined,
                    }}
                  >
                    {/* Source field */}
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={m.sourceField}
                        onChange={e => updateRow(idx, { sourceField: e.target.value })}
                        placeholder="e.g. order_id"
                        className="w-full px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: 'var(--color-bg-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </td>

                    {/* Arrow */}
                    <td className="px-1 text-center text-muted">→</td>

                    {/* Target property dropdown */}
                    <td className="px-2 py-1">
                      <div className="flex items-center gap-1">
                        {unresolved && (
                          <AlertTriangle size={12} style={{ color: 'var(--color-warning, #e6a700)', flexShrink: 0 }} />
                        )}
                        <select
                          value={m.targetPropertyName}
                          onChange={e => updateRow(idx, { targetPropertyName: e.target.value })}
                          className="w-full px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: 'var(--color-bg-surface)',
                            border: `1px solid ${unresolved ? 'var(--color-warning, #e6a700)' : 'var(--color-border)'}`,
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          <option value="">{t('fieldMapping.selectTarget')}</option>
                          {targetProps.map(p => (
                            <option key={p.name} value={p.name}>
                              {p.name} ({p.type})
                            </option>
                          ))}
                          {/* Show unresolved option so it doesn't silently disappear */}
                          {unresolved && (
                            <option value={m.targetPropertyName}>
                              ⚠ &quot;{m.targetPropertyName}&quot; ({t('fieldMapping.notFound')})
                            </option>
                          )}
                        </select>
                      </div>
                    </td>

                    {/* Transform */}
                    <td className="px-2 py-1">
                      <select
                        value={m.transform || 'direct'}
                        onChange={e =>
                          updateRow(idx, { transform: e.target.value as FieldMapping['transform'] })
                        }
                        className="w-full px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: 'var(--color-bg-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {TRANSFORM_OPTIONS.map(v => (
                          <option key={v} value={v}>
                            {t(`fieldMapping.transform_${v}`)}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Transform note (expands when custom) */}
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={m.transformNote || ''}
                        onChange={e => updateRow(idx, { transformNote: e.target.value })}
                        placeholder={m.transform === 'custom' ? t('fieldMapping.customNotePlaceholder') : ''}
                        className="w-full px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: 'var(--color-bg-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </td>

                    {/* Required toggle */}
                    <td className="px-2 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={m.required || false}
                        onChange={e => updateRow(idx, { required: e.target.checked })}
                        className="rounded"
                      />
                    </td>

                    {/* Delete */}
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="p-1 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mapping completeness hint */}
      {targetObject && mappings.length > 0 && (
        <p className="text-[10px] text-muted">
          {mappings.length} / {targetProps.length} {t('fieldMapping.propertiesMapped')}
        </p>
      )}
    </div>
  );
};

export default FieldMappingTable;
