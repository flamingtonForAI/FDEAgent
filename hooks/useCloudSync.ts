import { useEffect } from 'react';
import { ProjectState } from '../types';
import { storage } from '../lib/storageFacade';
import { syncService } from '../services/syncService';
import { useSync } from '../contexts/SyncContext';

/**
 * Handles cloud sync side-effects:
 * 1. Queues project data to cloud when authenticated
 * 2. Persists local→cloud ID mappings from sync API responses
 */
export function useCloudSync(
  isAuthenticated: boolean,
  activeProjectId: string | null,
  currentOntology: ProjectState | null,
) {
  const { sync } = useSync();

  // Cloud sync for authenticated users
  useEffect(() => {
    if (!isAuthenticated || !activeProjectId || !currentOntology) return;

    const hasData = currentOntology.objects.length > 0 ||
                    currentOntology.industry ||
                    currentOntology.useCase;

    if (!hasData) return;

    const mappedCloudProjectId = storage.getCloudProjectIdByLocalId(activeProjectId);
    const isLocalOnlyId = activeProjectId.startsWith('proj-');
    const syncProjectId = mappedCloudProjectId || (isLocalOnlyId ? undefined : activeProjectId);

    sync({
      projects: [{
        id: syncProjectId,
        localId: activeProjectId,
        // "now" is correct: this effect fires in response to currentOntology changing,
        // so the local modification time IS the current instant.
        localUpdatedAt: new Date().toISOString(),
        name: currentOntology.projectName || 'Untitled Project',
        industry: currentOntology.industry,
        useCase: currentOntology.useCase,
        status: currentOntology.status,
        objects: currentOntology.objects,
        links: currentOntology.links,
        integrations: currentOntology.integrations,
        aiRequirements: currentOntology.aiRequirements,
      }],
    });
  }, [currentOntology, isAuthenticated, activeProjectId, sync]);

  // Persist local→cloud project ID mappings returned by sync API
  useEffect(() => {
    const unsubscribe = syncService.subscribe((result) => {
      const mappings = result?.results.projects?.mappings;
      if (!mappings || mappings.length === 0) return;

      for (const mapping of mappings) {
        storage.setCloudProjectIdByLocalId(mapping.localId, mapping.cloudId);
      }
    });

    return unsubscribe;
  }, []);
}
