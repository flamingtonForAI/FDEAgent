/**
 * ProjectMembers — member list with invite dialog for project sharing.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { apiClient } from '../services/apiClient';
import { Users, UserPlus, Trash2, Shield, Eye, Edit } from 'lucide-react';

interface MemberInfo {
  userId: string;
  email: string;
  role: string;
  invitedBy?: string;
  createdAt: string;
}

interface MembersResponse {
  owner: { id: string; email: string; role: string } | null;
  members: MemberInfo[];
}

interface Props {
  projectId: string;
  isOwner: boolean;
}

export default function ProjectMembers({ projectId, isOwner }: Props) {
  const { t } = useAppTranslation('common');
  const [data, setData] = useState<MembersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor'>('viewer');
  const [inviteError, setInviteError] = useState('');

  const loadMembers = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const result = await apiClient.get<MembersResponse>(
        `/projects/${projectId}/members`,
      );
      setData(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleInvite = async () => {
    setInviteError('');
    try {
      await apiClient.post(`/projects/${projectId}/members`, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail('');
      setShowInvite(false);
      loadMembers();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite');
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm(t('sharing.confirmRemove'))) return;
    try {
      await apiClient.delete(`/projects/${projectId}/members/${userId}`);
      loadMembers();
    } catch {
      // silently fail
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await apiClient.put(`/projects/${projectId}/members/${userId}`, { role: newRole });
      loadMembers();
    } catch {
      // silently fail
    }
  };

  const roleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Shield size={14} />;
      case 'editor': return <Edit size={14} />;
      default: return <Eye size={14} />;
    }
  };

  if (loading && !data) return <p style={{ opacity: 0.6 }}>{t('loading')}</p>;

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: '16px',
      background: 'var(--color-bg-secondary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Users size={16} />
        <span style={{ fontWeight: 600, fontSize: '14px' }}>{t('sharing.title')}</span>
        {isOwner && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              background: 'transparent',
              color: 'var(--color-accent)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            <UserPlus size={12} />
            {t('sharing.invite')}
          </button>
        )}
      </div>

      {showInvite && (
        <div style={{
          padding: '12px',
          marginBottom: '12px',
          border: '1px solid var(--color-border)',
          borderRadius: '6px',
          background: 'var(--color-bg-primary)',
        }}>
          <input
            type="email"
            placeholder={t('sharing.emailPlaceholder')}
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'viewer' | 'editor')}
              style={{
                padding: '6px 8px',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="viewer">{t('sharing.viewer')}</option>
              <option value="editor">{t('sharing.editor')}</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={!inviteEmail}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                background: 'var(--color-accent)',
                color: '#fff',
                cursor: inviteEmail ? 'pointer' : 'default',
                opacity: inviteEmail ? 1 : 0.5,
              }}
            >
              {t('sharing.send')}
            </button>
          </div>
          {inviteError && (
            <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>
              {inviteError}
            </p>
          )}
        </div>
      )}

      {/* Owner */}
      {data?.owner && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 0',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {roleIcon('owner')}
          <span style={{ flex: 1, fontSize: '13px' }}>{data.owner.email}</span>
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'var(--color-accent)',
            color: '#fff',
          }}>
            {t('sharing.owner')}
          </span>
        </div>
      )}

      {/* Members */}
      {data?.members.map((m) => (
        <div
          key={m.userId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 0',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {roleIcon(m.role)}
          <span style={{ flex: 1, fontSize: '13px' }}>{m.email}</span>
          {isOwner ? (
            <>
              <select
                value={m.role}
                onChange={(e) => handleChangeRole(m.userId, e.target.value)}
                style={{
                  padding: '2px 4px',
                  fontSize: '11px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '3px',
                  background: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="viewer">{t('sharing.viewer')}</option>
                <option value="editor">{t('sharing.editor')}</option>
              </select>
              <button
                onClick={() => handleRemove(m.userId)}
                title={t('sharing.remove')}
                style={{
                  padding: '4px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-error)',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <span style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-secondary)',
            }}>
              {t(`sharing.${m.role}`)}
            </span>
          )}
        </div>
      ))}

      {data?.members.length === 0 && (
        <p style={{ fontSize: '12px', opacity: 0.5, padding: '8px 0' }}>
          {t('sharing.noMembers')}
        </p>
      )}
    </div>
  );
}
