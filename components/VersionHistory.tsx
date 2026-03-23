/**
 * VersionHistory — displays version list with diff and restore capabilities.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { apiClient } from '../services/apiClient';
import { History, RotateCcw, ArrowLeftRight, ChevronDown, ChevronUp } from 'lucide-react';

interface VersionEntry {
  id: string;
  version: number;
  changeSummary: string | null;
  createdBy: string | null;
  createdAt: string;
}

interface Props {
  projectId: string;
  onRestored?: () => void;
}

export default function VersionHistory({ projectId, onRestored }: Props) {
  const { t } = useAppTranslation('common');
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [restoring, setRestoring] = useState<number | null>(null);

  const loadVersions = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await apiClient.get<VersionEntry[]>(
        `/projects/${projectId}/versions`,
      );
      setVersions(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (expanded) loadVersions();
  }, [expanded, loadVersions]);

  const handleRestore = async (version: number) => {
    if (!confirm(t('versionHistory.confirmRestore'))) return;
    setRestoring(version);
    try {
      await apiClient.post(`/projects/${projectId}/versions/${version}/restore`);
      onRestored?.();
      loadVersions();
    } catch {
      // silently fail
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'var(--color-bg-secondary)',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          padding: '12px 16px',
          border: 'none',
          background: 'transparent',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        <History size={16} />
        <span>{t('versionHistory.title')}</span>
        <span style={{ marginLeft: 'auto', opacity: 0.6 }}>
          {versions.length > 0 && `${versions.length} ${t('versionHistory.versions')}`}
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          {loading && <p style={{ opacity: 0.6 }}>{t('loading')}</p>}
          {!loading && versions.length === 0 && (
            <p style={{ opacity: 0.6 }}>{t('versionHistory.noVersions')}</p>
          )}
          {versions.map((v) => (
            <div
              key={v.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span style={{
                fontWeight: 600,
                minWidth: '36px',
                color: 'var(--color-accent)',
              }}>
                v{v.version}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px' }}>
                  {v.changeSummary || t('versionHistory.noSummary')}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.5 }}>
                  {formatDate(v.createdAt)}
                </div>
              </div>
              <button
                onClick={() => handleRestore(v.version)}
                disabled={restoring === v.version}
                title={t('versionHistory.restore')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  opacity: restoring === v.version ? 0.5 : 1,
                }}
              >
                <RotateCcw size={12} />
                {t('versionHistory.restore')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
