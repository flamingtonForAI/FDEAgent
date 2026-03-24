import React, { useState } from 'react';
import {
  Lock, Trash2, LogOut, AlertTriangle, Loader2, Check, Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import type { DeletionCheckResponse } from '../../services/authService';

export default function AccountTab() {
  const { user, changePassword, logoutAll, getDeletionCheck, deleteAccount, logout } = useAuth();
  const { t } = useAppTranslation('common');

  // Change password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  // Logout all state
  const [logoutAllStatus, setLogoutAllStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Delete account state
  const [deletionCheck, setDeletionCheck] = useState<DeletionCheckResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) {
      setPwError(t('auth.account.passwordMismatch'));
      return;
    }
    setPwStatus('loading');
    setPwError('');
    try {
      await changePassword(currentPw, newPw);
      setPwStatus('success');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      setPwStatus('error');
      setPwError(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllStatus('loading');
    try {
      await logoutAll();
    } catch {
      setLogoutAllStatus('idle');
    }
  };

  const handleDeleteCheck = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const check = await getDeletionCheck();
      setDeletionCheck(check);
      if (check.canDelete) {
        setShowDeleteConfirm(true);
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteAccount(deletePw, deleteEmail);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed');
      setDeleteLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  };

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div>
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
          {t('auth.account.profile')}
        </h3>
        <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex justify-between text-xs">
            <span className="text-muted">{t('auth.account.email')}</span>
            <span style={{ color: 'var(--color-text-primary)' }}>{user?.email}</span>
          </div>
          {user?.createdAt && (
            <div className="flex justify-between text-xs">
              <span className="text-muted">{t('auth.account.memberSince')}</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          )}
          {user?.lastLoginAt && (
            <div className="flex justify-between text-xs">
              <span className="text-muted">{t('auth.account.lastLogin')}</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{new Date(user.lastLoginAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div>
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
          <Lock size={14} className="inline mr-1.5" />
          {t('auth.account.changePassword')}
        </h3>
        <div className="space-y-3">
          <input
            type="password"
            placeholder={t('auth.account.currentPassword')}
            value={currentPw}
            onChange={e => setCurrentPw(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder={t('auth.account.newPassword')}
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder={t('auth.account.confirmNewPassword')}
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={inputStyle}
          />
          <button
            onClick={handleChangePassword}
            disabled={!currentPw || !newPw || !confirmPw || pwStatus === 'loading'}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            {pwStatus === 'loading' ? <Loader2 size={14} className="inline animate-spin" /> : null}
            {' '}{t('auth.account.updatePassword')}
          </button>
          {pwStatus === 'success' && (
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ color: 'var(--color-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Check size={14} />
              {t('auth.account.passwordUpdated')}
            </div>
          )}
          {pwError && (
            <div className="text-xs px-3 py-2 rounded-lg" style={{ color: 'var(--color-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              {pwError}
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <AlertTriangle size={14} style={{ color: 'var(--color-error)' }} />
          <h3 className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
            {t('auth.account.dangerZone')}
          </h3>
        </div>

        {/* Logout All Devices */}
        <div className="mb-4">
          <p className="text-xs text-muted mb-2">{t('auth.account.logoutAllDesc')}</p>
          <button
            onClick={handleLogoutAll}
            disabled={logoutAllStatus === 'loading'}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--color-error)' }}
          >
            <LogOut size={14} className="inline mr-1.5" />
            {logoutAllStatus === 'loading' ? <Loader2 size={14} className="inline animate-spin mr-1" /> : null}
            {t('auth.account.logoutAll')}
          </button>
          {logoutAllStatus === 'success' && (
            <p className="text-xs mt-2" style={{ color: 'var(--color-success)' }}>
              {t('auth.account.logoutAllSuccess')}
            </p>
          )}
        </div>

        {/* Delete Account */}
        <div>
          <p className="text-xs text-muted mb-2">{t('auth.account.deleteAccountDesc')}</p>

          {!showDeleteConfirm ? (
            <div>
              <button
                onClick={handleDeleteCheck}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--color-error)' }}
              >
                {deleteLoading ? <Loader2 size={14} className="inline animate-spin mr-1" /> : <Trash2 size={14} className="inline mr-1.5" />}
                {t('auth.account.deleteAccount')}
              </button>

              {deletionCheck && !deletionCheck.canDelete && (
                <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-warning)' }}>
                    {t('auth.account.cannotDelete')}
                  </p>
                  {deletionCheck.blockers.map((b, i) => (
                    <p key={i} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{b}</p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <h4 className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
                {t('auth.account.confirmDelete')}
              </h4>

              {deletionCheck && (
                <div className="text-xs space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <p>{t('auth.account.impactSummary')}</p>
                  {deletionCheck.impact.sharedMemberships > 0 && (
                    <p>• {t('auth.account.impactMemberships', { count: deletionCheck.impact.sharedMemberships })}</p>
                  )}
                  {deletionCheck.impact.versions > 0 && (
                    <p>• {t('auth.account.impactVersions', { count: deletionCheck.impact.versions })}</p>
                  )}
                  {deletionCheck.impact.chatMessages > 0 && (
                    <p>• {t('auth.account.impactMessages', { count: deletionCheck.impact.chatMessages })}</p>
                  )}
                </div>
              )}

              <input
                type="password"
                placeholder={t('auth.account.enterPassword')}
                value={deletePw}
                onChange={e => setDeletePw(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={inputStyle}
              />
              <input
                type="email"
                placeholder={t('auth.account.enterEmail')}
                value={deleteEmail}
                onChange={e => setDeleteEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={inputStyle}
              />

              {deleteError && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>{deleteError}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeletePw(''); setDeleteEmail(''); setDeleteError(''); }}
                  className="flex-1 px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={!deletePw || !deleteEmail || deleteLoading}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                  style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                >
                  {deleteLoading ? <Loader2 size={14} className="inline animate-spin mr-1" /> : null}
                  {t('auth.account.permanentlyDelete')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
