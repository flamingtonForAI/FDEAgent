/**
 * DiffViewer — structured diff display between two version snapshots.
 * Added items = green, removed = red, modified = yellow.
 */

import React, { useState, useEffect } from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { apiClient } from '../services/apiClient';
import { Plus, Minus, Pencil } from 'lucide-react';

interface DiffItem {
  type: 'added' | 'removed' | 'modified';
  id: string;
  name: string;
  details?: string;
}

interface DiffResponse {
  before: number;
  after: number;
  objects: DiffItem[];
  links: DiffItem[];
  actions: DiffItem[];
  summary: string;
}

interface Props {
  projectId: string;
  versionA: number;
  versionB: number;
}

const TYPE_COLORS: Record<DiffItem['type'], string> = {
  added: 'var(--color-success, #22c55e)',
  removed: 'var(--color-error, #ef4444)',
  modified: 'var(--color-warning, #eab308)',
};

const TYPE_ICONS: Record<DiffItem['type'], React.ReactNode> = {
  added: <Plus size={12} />,
  removed: <Minus size={12} />,
  modified: <Pencil size={12} />,
};

export default function DiffViewer({ projectId, versionA, versionB }: Props) {
  const { t } = useAppTranslation('common');
  const [diff, setDiff] = useState<DiffResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId || !versionA || !versionB) return;
    setLoading(true);
    apiClient
      .get<DiffResponse>(`/projects/${projectId}/versions/${versionA}/diff/${versionB}`)
      .then(setDiff)
      .catch(() => setDiff(null))
      .finally(() => setLoading(false));
  }, [projectId, versionA, versionB]);

  if (loading) return <p style={{ opacity: 0.6 }}>{t('loading')}</p>;
  if (!diff) return null;

  const sections = [
    { label: t('objects'), items: diff.objects },
    { label: t('links'), items: diff.links },
    { label: t('actions'), items: diff.actions },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '13px', opacity: 0.7 }}>
        {diff.summary}
      </div>

      {sections.map(({ label, items }) =>
        items.length > 0 ? (
          <div key={label}>
            <div style={{
              fontWeight: 600,
              fontSize: '13px',
              marginBottom: '4px',
              color: 'var(--color-text-secondary)',
            }}>
              {label}
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px',
                  borderLeft: `3px solid ${TYPE_COLORS[item.type]}`,
                  marginBottom: '2px',
                  background: 'var(--color-bg-primary)',
                  borderRadius: '0 4px 4px 0',
                }}
              >
                <span style={{ color: TYPE_COLORS[item.type] }}>
                  {TYPE_ICONS[item.type]}
                </span>
                <span style={{ fontWeight: 500, fontSize: '13px' }}>{item.name}</span>
                {item.details && (
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>
                    {item.details}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : null,
      )}
    </div>
  );
}
