/**
 * Change Audit Tracker
 *
 * Tracks all changes to the project state, providing a complete history
 * of modifications for audit, undo/redo, and collaboration purposes.
 */

import { ProjectState, OntologyObject, OntologyLink, Language } from '../types';

export type ChangeType =
  | 'object_added'
  | 'object_updated'
  | 'object_deleted'
  | 'action_added'
  | 'action_updated'
  | 'action_deleted'
  | 'link_added'
  | 'link_updated'
  | 'link_deleted'
  | 'property_added'
  | 'property_updated'
  | 'property_deleted'
  | 'integration_added'
  | 'integration_deleted'
  | 'ai_feature_added'
  | 'ai_feature_deleted'
  | 'project_imported'
  | 'project_reset';

export interface ChangeRecord {
  id: string;
  timestamp: string;
  type: ChangeType;
  entityType: 'object' | 'action' | 'link' | 'property' | 'integration' | 'ai_feature' | 'project';
  entityId: string;
  entityName: string;
  parentId?: string;
  parentName?: string;
  before?: any;
  after?: any;
  description: string;
  source: 'user' | 'ai' | 'import' | 'system';
}

export interface AuditLog {
  projectId: string;
  changes: ChangeRecord[];
  createdAt: string;
  lastModified: string;
}

// Storage key for localStorage
const AUDIT_LOG_KEY = 'ontology-audit-log';

// Generate unique ID
const generateId = (): string => {
  return `change_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

// Get change type label
export const getChangeTypeLabel = (type: ChangeType, lang: Language): string => {
  const labels: Record<ChangeType, { en: string; cn: string }> = {
    object_added: { en: 'Object Added', cn: '添加对象' },
    object_updated: { en: 'Object Updated', cn: '更新对象' },
    object_deleted: { en: 'Object Deleted', cn: '删除对象' },
    action_added: { en: 'Action Added', cn: '添加动作' },
    action_updated: { en: 'Action Updated', cn: '更新动作' },
    action_deleted: { en: 'Action Deleted', cn: '删除动作' },
    link_added: { en: 'Link Added', cn: '添加关系' },
    link_updated: { en: 'Link Updated', cn: '更新关系' },
    link_deleted: { en: 'Link Deleted', cn: '删除关系' },
    property_added: { en: 'Property Added', cn: '添加属性' },
    property_updated: { en: 'Property Updated', cn: '更新属性' },
    property_deleted: { en: 'Property Deleted', cn: '删除属性' },
    integration_added: { en: 'Integration Added', cn: '添加集成' },
    integration_deleted: { en: 'Integration Deleted', cn: '删除集成' },
    ai_feature_added: { en: 'AI Feature Added', cn: '添加AI特性' },
    ai_feature_deleted: { en: 'AI Feature Deleted', cn: '删除AI特性' },
    project_imported: { en: 'Project Imported', cn: '导入项目' },
    project_reset: { en: 'Project Reset', cn: '重置项目' }
  };
  return lang === 'cn' ? labels[type].cn : labels[type].en;
};

// Get change type color
export const getChangeTypeColor = (type: ChangeType): string => {
  if (type.includes('added')) return 'var(--color-success)';
  if (type.includes('updated')) return 'var(--color-warning)';
  if (type.includes('deleted')) return 'var(--color-error)';
  return 'var(--color-info)';
};

// Load audit log from localStorage
export const loadAuditLog = (): AuditLog => {
  try {
    const stored = localStorage.getItem(AUDIT_LOG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load audit log:', e);
  }

  return {
    projectId: `project_${Date.now()}`,
    changes: [],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
};

// Save audit log to localStorage
export const saveAuditLog = (log: AuditLog): void => {
  try {
    log.lastModified = new Date().toISOString();
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(log));
  } catch (e) {
    console.error('Failed to save audit log:', e);
  }
};

// Add a change record
export const addChangeRecord = (
  type: ChangeType,
  entityType: ChangeRecord['entityType'],
  entityId: string,
  entityName: string,
  description: string,
  options?: {
    parentId?: string;
    parentName?: string;
    before?: any;
    after?: any;
    source?: ChangeRecord['source'];
  }
): ChangeRecord => {
  const log = loadAuditLog();

  const record: ChangeRecord = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    type,
    entityType,
    entityId,
    entityName,
    description,
    source: options?.source || 'user',
    ...(options?.parentId && { parentId: options.parentId }),
    ...(options?.parentName && { parentName: options.parentName }),
    ...(options?.before !== undefined && { before: options.before }),
    ...(options?.after !== undefined && { after: options.after })
  };

  log.changes.push(record);

  // Keep only last 500 changes to prevent storage overflow
  if (log.changes.length > 500) {
    log.changes = log.changes.slice(-500);
  }

  saveAuditLog(log);
  return record;
};

// Compare two project states and generate change records
export const diffProjectStates = (
  before: ProjectState,
  after: ProjectState,
  source: ChangeRecord['source'] = 'user'
): ChangeRecord[] => {
  const changes: ChangeRecord[] = [];

  // Compare objects
  const beforeObjectIds = new Set(before.objects.map(o => o.id));
  const afterObjectIds = new Set(after.objects.map(o => o.id));

  // Added objects
  after.objects.forEach(obj => {
    if (!beforeObjectIds.has(obj.id)) {
      changes.push({
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: 'object_added',
        entityType: 'object',
        entityId: obj.id,
        entityName: obj.name,
        after: obj,
        description: `Added object: ${obj.name}`,
        source
      });
    }
  });

  // Deleted objects
  before.objects.forEach(obj => {
    if (!afterObjectIds.has(obj.id)) {
      changes.push({
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: 'object_deleted',
        entityType: 'object',
        entityId: obj.id,
        entityName: obj.name,
        before: obj,
        description: `Deleted object: ${obj.name}`,
        source
      });
    }
  });

  // Updated objects
  after.objects.forEach(afterObj => {
    const beforeObj = before.objects.find(o => o.id === afterObj.id);
    if (beforeObj) {
      // Check for changes
      if (JSON.stringify(beforeObj) !== JSON.stringify(afterObj)) {
        // Check specific changes
        if (beforeObj.name !== afterObj.name ||
            beforeObj.description !== afterObj.description) {
          changes.push({
            id: generateId(),
            timestamp: new Date().toISOString(),
            type: 'object_updated',
            entityType: 'object',
            entityId: afterObj.id,
            entityName: afterObj.name,
            before: { name: beforeObj.name, description: beforeObj.description },
            after: { name: afterObj.name, description: afterObj.description },
            description: `Updated object: ${afterObj.name}`,
            source
          });
        }

        // Check properties
        const beforeProps = new Set((beforeObj.properties || []).map(p => p.name));
        const afterProps = new Set((afterObj.properties || []).map(p => p.name));

        (afterObj.properties || []).forEach(prop => {
          if (!beforeProps.has(prop.name)) {
            changes.push({
              id: generateId(),
              timestamp: new Date().toISOString(),
              type: 'property_added',
              entityType: 'property',
              entityId: prop.name,
              entityName: prop.name,
              parentId: afterObj.id,
              parentName: afterObj.name,
              after: prop,
              description: `Added property ${prop.name} to ${afterObj.name}`,
              source
            });
          }
        });

        (beforeObj.properties || []).forEach(prop => {
          if (!afterProps.has(prop.name)) {
            changes.push({
              id: generateId(),
              timestamp: new Date().toISOString(),
              type: 'property_deleted',
              entityType: 'property',
              entityId: prop.name,
              entityName: prop.name,
              parentId: afterObj.id,
              parentName: afterObj.name,
              before: prop,
              description: `Deleted property ${prop.name} from ${afterObj.name}`,
              source
            });
          }
        });

        // Check actions
        const beforeActions = new Set((beforeObj.actions || []).map(a => a.name));
        const afterActions = new Set((afterObj.actions || []).map(a => a.name));

        (afterObj.actions || []).forEach(action => {
          if (!beforeActions.has(action.name)) {
            changes.push({
              id: generateId(),
              timestamp: new Date().toISOString(),
              type: 'action_added',
              entityType: 'action',
              entityId: action.name,
              entityName: action.name,
              parentId: afterObj.id,
              parentName: afterObj.name,
              after: action,
              description: `Added action ${action.name} to ${afterObj.name}`,
              source
            });
          }
        });

        (beforeObj.actions || []).forEach(action => {
          if (!afterActions.has(action.name)) {
            changes.push({
              id: generateId(),
              timestamp: new Date().toISOString(),
              type: 'action_deleted',
              entityType: 'action',
              entityId: action.name,
              entityName: action.name,
              parentId: afterObj.id,
              parentName: afterObj.name,
              before: action,
              description: `Deleted action ${action.name} from ${afterObj.name}`,
              source
            });
          }
        });
      }
    }
  });

  // Compare links
  const beforeLinkKeys = new Set(before.links.map(l => `${l.source || l.sourceId}-${l.target || l.targetId}`));
  const afterLinkKeys = new Set(after.links.map(l => `${l.source || l.sourceId}-${l.target || l.targetId}`));

  after.links.forEach(link => {
    const key = `${link.source || link.sourceId}-${link.target || link.targetId}`;
    if (!beforeLinkKeys.has(key)) {
      changes.push({
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: 'link_added',
        entityType: 'link',
        entityId: link.id,
        entityName: link.label || 'link',
        after: link,
        description: `Added link: ${link.label || 'relationship'}`,
        source
      });
    }
  });

  before.links.forEach(link => {
    const key = `${link.source || link.sourceId}-${link.target || link.targetId}`;
    if (!afterLinkKeys.has(key)) {
      changes.push({
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: 'link_deleted',
        entityType: 'link',
        entityId: link.id,
        entityName: link.label || 'link',
        before: link,
        description: `Deleted link: ${link.label || 'relationship'}`,
        source
      });
    }
  });

  // Compare integrations
  const beforeIntNames = new Set((before.integrations || []).map(i => i.systemName));
  const afterIntNames = new Set((after.integrations || []).map(i => i.systemName));

  (after.integrations || []).forEach(integration => {
    if (!beforeIntNames.has(integration.systemName)) {
      changes.push({
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: 'integration_added',
        entityType: 'integration',
        entityId: integration.systemName,
        entityName: integration.systemName,
        after: integration,
        description: `Added integration: ${integration.systemName}`,
        source
      });
    }
  });

  (before.integrations || []).forEach(integration => {
    if (!afterIntNames.has(integration.systemName)) {
      changes.push({
        id: generateId(),
        timestamp: new Date().toISOString(),
        type: 'integration_deleted',
        entityType: 'integration',
        entityId: integration.systemName,
        entityName: integration.systemName,
        before: integration,
        description: `Deleted integration: ${integration.systemName}`,
        source
      });
    }
  });

  return changes;
};

// Get changes for a specific time period
export const getChangesByPeriod = (
  startDate: Date,
  endDate: Date = new Date()
): ChangeRecord[] => {
  const log = loadAuditLog();
  return log.changes.filter(change => {
    const changeDate = new Date(change.timestamp);
    return changeDate >= startDate && changeDate <= endDate;
  });
};

// Get changes for a specific entity
export const getChangesForEntity = (entityId: string): ChangeRecord[] => {
  const log = loadAuditLog();
  return log.changes.filter(change =>
    change.entityId === entityId || change.parentId === entityId
  );
};

// Get summary of changes
export const getChangeSummary = (changes: ChangeRecord[]): {
  added: number;
  updated: number;
  deleted: number;
  byType: Record<string, number>;
} => {
  const summary = {
    added: 0,
    updated: 0,
    deleted: 0,
    byType: {} as Record<string, number>
  };

  changes.forEach(change => {
    if (change.type.includes('added')) summary.added++;
    else if (change.type.includes('updated')) summary.updated++;
    else if (change.type.includes('deleted')) summary.deleted++;

    summary.byType[change.type] = (summary.byType[change.type] || 0) + 1;
  });

  return summary;
};

// Clear audit log
export const clearAuditLog = (): void => {
  const newLog: AuditLog = {
    projectId: `project_${Date.now()}`,
    changes: [],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
  saveAuditLog(newLog);
};

// Export audit log to JSON
export const exportAuditLogToJSON = (): string => {
  const log = loadAuditLog();
  return JSON.stringify(log, null, 2);
};

// Format change for display
export const formatChangeForDisplay = (change: ChangeRecord, lang: Language): string => {
  const typeLabel = getChangeTypeLabel(change.type, lang);
  const time = new Date(change.timestamp).toLocaleString();

  if (change.parentName) {
    return lang === 'cn'
      ? `[${time}] ${typeLabel}: ${change.entityName} (${change.parentName})`
      : `[${time}] ${typeLabel}: ${change.entityName} (in ${change.parentName})`;
  }

  return `[${time}] ${typeLabel}: ${change.entityName}`;
};
