/**
 * Sync Context
 * Manages synchronization state and provides sync methods
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { syncService, type FullSyncState, type BatchSyncInput } from '../services/syncService';
import { useAuth } from './AuthContext';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface SyncContextType {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  error: string | null;
  hasPendingChanges: boolean;
  sync: (data: BatchSyncInput) => void;
  forceSync: () => Promise<void>;
  fetchFullState: () => Promise<FullSyncState | null>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      if (status === 'offline') {
        setStatus('idle');
        // Trigger sync if there are pending changes
        if (hasPendingChanges) {
          void syncService.forceSync();
        }
      }
    };

    const handleOffline = () => {
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    if (!navigator.onLine) {
      setStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [status, hasPendingChanges]);

  useEffect(() => {
    const unsubscribe = syncService.subscribe((result, syncError) => {
      if (result) {
        setStatus('synced');
        setLastSyncedAt(new Date(result.syncedAt));
        setHasPendingChanges(false);
        setError(null);
        return;
      }

      if (syncError) {
        setStatus(navigator.onLine ? 'error' : 'offline');
        setError(syncError.message);
        setHasPendingChanges(syncService.hasPendingSync());
      }
    });

    return unsubscribe;
  }, []);

  // Sync before page unload if authenticated
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated && syncService.hasPendingSync()) {
        // Use sendBeacon for reliability
        syncService.forceSync();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated]);

  const sync = useCallback(
    (data: BatchSyncInput) => {
      if (!isAuthenticated) return;

      setHasPendingChanges(true);
      setStatus('syncing');

      syncService.queueSync(data);
    },
    [isAuthenticated]
  );

  const forceSync = useCallback(async () => {
    if (!isAuthenticated) return;

    setStatus('syncing');
    try {
      const result = await syncService.forceSync();
      if (result) {
        setStatus('synced');
        setLastSyncedAt(new Date(result.syncedAt));
        setHasPendingChanges(false);
        setError(null);
      } else if (!syncService.hasPendingSync()) {
        setStatus('idle');
        setHasPendingChanges(false);
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Sync failed');
    }
  }, [isAuthenticated]);

  const fetchFullState = useCallback(async (): Promise<FullSyncState | null> => {
    if (!isAuthenticated) return null;

    setStatus('syncing');
    try {
      const state = await syncService.getFullState();
      setStatus('synced');
      setLastSyncedAt(new Date(state.syncedAt));
      setError(null);
      return state;
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to fetch state');
      return null;
    }
  }, [isAuthenticated]);

  const value: SyncContextType = {
    status,
    lastSyncedAt,
    error,
    hasPendingChanges,
    sync,
    forceSync,
    fetchFullState,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextType {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}

export { SyncContext };
