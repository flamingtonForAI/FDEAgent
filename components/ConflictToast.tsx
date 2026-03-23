/**
 * ConflictToast — Displays a dismissible warning when sync conflicts are detected.
 * Used by SyncContext to notify users that their local changes were overridden
 * by a newer cloud version (LWW strategy).
 */
import React from 'react';
import type { SyncConflict } from '../services/syncService';

interface ConflictToastProps {
  conflicts: SyncConflict[];
  onDismiss: () => void;
}

const ConflictToast: React.FC<ConflictToastProps> = ({ conflicts, onDismiss }) => {
  if (conflicts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn"
      style={{
        backgroundColor: 'var(--color-warning, #f59e0b)',
        color: 'white',
        maxWidth: '420px',
      }}
    >
      <span className="text-sm" style={{ lineHeight: 1.4 }}>
        {conflicts.length === 1
          ? `Your local changes to "${conflicts[0].projectName}" were overridden by a newer cloud version (updated ${new Date(conflicts[0].cloudUpdatedAt).toLocaleTimeString()}).`
          : `${conflicts.length} projects had local changes overridden by newer cloud versions.`}
      </span>
      <button
        onClick={onDismiss}
        className="ml-2 opacity-70 hover:opacity-100 shrink-0"
        style={{ fontSize: '18px', lineHeight: 1 }}
      >
        &times;
      </button>
    </div>
  );
};

export default ConflictToast;
