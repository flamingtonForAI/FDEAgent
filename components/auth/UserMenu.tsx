/**
 * User Menu Component
 * Displays user info and account actions in the header
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  LogOut,
  Cloud,
  CloudOff,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSync } from '../../contexts/SyncContext';

interface UserMenuProps {
  lang?: 'en' | 'cn';
}

const translations = {
  en: {
    signIn: 'Sign In',
    signOut: 'Sign Out',
    synced: 'Synced',
    syncing: 'Syncing...',
    offline: 'Offline',
    syncError: 'Sync Error',
    pendingChanges: 'Pending changes',
    lastSynced: 'Last synced',
  },
  cn: {
    signIn: '登录',
    signOut: '退出登录',
    synced: '已同步',
    syncing: '同步中...',
    offline: '离线',
    syncError: '同步失败',
    pendingChanges: '待同步',
    lastSynced: '上次同步',
  },
};

export const UserMenu: React.FC<UserMenuProps> = ({ lang = 'cn' }) => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { status, lastSyncedAt, hasPendingChanges, forceSync } = useSync();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await forceSync(); // Sync before logout
    await logout();
  };

  const getSyncStatusDisplay = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: <RefreshCw size={14} className="animate-spin" />,
          text: t.syncing,
          color: 'text-amber-400',
        };
      case 'synced':
        return {
          icon: <Cloud size={14} />,
          text: t.synced,
          color: 'text-green-400',
        };
      case 'offline':
        return {
          icon: <CloudOff size={14} />,
          text: t.offline,
          color: 'text-gray-400',
        };
      case 'error':
        return {
          icon: <CloudOff size={14} />,
          text: t.syncError,
          color: 'text-red-400',
        };
      default:
        return {
          icon: <Cloud size={14} />,
          text: hasPendingChanges ? t.pendingChanges : t.synced,
          color: hasPendingChanges ? 'text-amber-400' : 'text-muted',
        };
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const syncStatus = getSyncStatusDisplay();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-surface hover:bg-white/5 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <User size={14} className="text-white" />
        </div>
        <span className="text-sm text-white max-w-[120px] truncate">
          {user?.email.split('@')[0]}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg glass-surface border border-white/10 shadow-xl z-50 overflow-hidden">
          {/* User Info */}
          <div className="p-4 border-b border-white/10">
            <p className="text-sm font-medium text-white truncate">
              {user?.email}
            </p>
            <div className={`flex items-center gap-1.5 mt-1 ${syncStatus.color}`}>
              {syncStatus.icon}
              <span className="text-xs">{syncStatus.text}</span>
            </div>
            {lastSyncedAt && status === 'synced' && (
              <p className="text-xs text-muted mt-1">
                {t.lastSynced}: {lastSyncedAt.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="p-2">
            {hasPendingChanges && (
              <button
                onClick={() => {
                  forceSync();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg hover:bg-white/5 transition-colors text-amber-400"
              >
                <RefreshCw size={16} />
                <span>{lang === 'cn' ? '立即同步' : 'Sync Now'}</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-lg hover:bg-white/5 transition-colors text-red-400"
            >
              <LogOut size={16} />
              <span>{t.signOut}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
