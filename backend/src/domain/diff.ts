/**
 * Diff Engine — compute structured diffs between two ProjectState snapshots.
 */

import type { ProjectState, OntologyObject, OntologyLink, AIPAction } from './types.js';

export interface DiffItem {
  type: 'added' | 'removed' | 'modified';
  id: string;
  name: string;
  details?: string;
}

export interface DiffResult {
  objects: DiffItem[];
  links: DiffItem[];
  actions: DiffItem[];
  summary: string;
}

/**
 * Compute a structured diff between two project states.
 */
export function diffProjectStates(
  before: ProjectState,
  after: ProjectState,
): DiffResult {
  const objects = diffById(
    before.objects ?? [],
    after.objects ?? [],
    (o) => o.id,
    (o) => o.name,
    diffObjectDetails,
  );

  const links = diffById(
    before.links ?? [],
    after.links ?? [],
    (l) => l.id,
    (l) => l.name || l.label || l.id,
    diffLinkDetails,
  );

  const actions = diffActions(before.objects ?? [], after.objects ?? []);

  const summary = buildSummary(objects, links, actions);

  return { objects, links, actions, summary };
}

// ─── Internal helpers ────────────────────────────────────────

function diffById<T>(
  before: T[],
  after: T[],
  getId: (item: T) => string,
  getName: (item: T) => string,
  getDetails: (a: T, b: T) => string | undefined,
): DiffItem[] {
  const result: DiffItem[] = [];
  const beforeMap = new Map(before.map((item) => [getId(item), item]));
  const afterMap = new Map(after.map((item) => [getId(item), item]));

  // Removed
  for (const [id, item] of beforeMap) {
    if (!afterMap.has(id)) {
      result.push({ type: 'removed', id, name: getName(item) });
    }
  }

  // Added or modified
  for (const [id, item] of afterMap) {
    const old = beforeMap.get(id);
    if (!old) {
      result.push({ type: 'added', id, name: getName(item) });
    } else {
      const details = getDetails(old, item);
      if (details) {
        result.push({ type: 'modified', id, name: getName(item), details });
      }
    }
  }

  return result;
}

function diffObjectDetails(a: OntologyObject, b: OntologyObject): string | undefined {
  const parts: string[] = [];

  if (a.name !== b.name) parts.push('name changed');
  if (a.description !== b.description) parts.push('description changed');

  // Properties diff — compare names, types, required, descriptions
  const propsAMap = new Map((a.properties ?? []).map((p) => [p.name, p]));
  const propsBMap = new Map((b.properties ?? []).map((p) => [p.name, p]));
  const propsAdded = [...propsBMap.keys()].filter((n) => !propsAMap.has(n)).length;
  const propsRemoved = [...propsAMap.keys()].filter((n) => !propsBMap.has(n)).length;
  let propsModified = 0;
  for (const [name, pa] of propsAMap) {
    const pb = propsBMap.get(name);
    if (pb && (pa.type !== pb.type || pa.required !== pb.required || pa.description !== pb.description)) {
      propsModified++;
    }
  }
  if (propsAdded > 0) parts.push(`${propsAdded} properties added`);
  if (propsRemoved > 0) parts.push(`${propsRemoved} properties removed`);
  if (propsModified > 0) parts.push(`${propsModified} properties modified`);

  // Actions count change
  const actionsA = a.actions?.length ?? 0;
  const actionsB = b.actions?.length ?? 0;
  if (actionsA !== actionsB) parts.push(`actions: ${actionsA} → ${actionsB}`);

  return parts.length > 0 ? parts.join(', ') : undefined;
}

function diffLinkDetails(a: OntologyLink, b: OntologyLink): string | undefined {
  const parts: string[] = [];

  if (a.cardinality !== b.cardinality) parts.push(`cardinality: ${a.cardinality} → ${b.cardinality}`);
  if ((a.source ?? a.sourceObject) !== (b.source ?? b.sourceObject)) parts.push('source changed');
  if ((a.target ?? a.targetObject) !== (b.target ?? b.targetObject)) parts.push('target changed');
  if (a.name !== b.name) parts.push('name changed');

  return parts.length > 0 ? parts.join(', ') : undefined;
}

/**
 * Diff actions across all objects. Match by name + targetObject (businessLayer).
 */
function diffActions(
  beforeObjects: OntologyObject[],
  afterObjects: OntologyObject[],
): DiffItem[] {
  const result: DiffItem[] = [];

  // Flatten actions with their parent object context
  type ActionEntry = { action: AIPAction; objectName: string };

  function flattenActions(objects: OntologyObject[]): Map<string, ActionEntry> {
    const map = new Map<string, ActionEntry>();
    for (const obj of objects) {
      for (const action of obj.actions ?? []) {
        const targetObj = action.businessLayer?.targetObject ?? obj.name;
        const key = `${action.name}::${targetObj}`;
        map.set(key, { action, objectName: obj.name });
      }
    }
    return map;
  }

  const beforeActions = flattenActions(beforeObjects);
  const afterActions = flattenActions(afterObjects);

  // Removed
  for (const [key, entry] of beforeActions) {
    if (!afterActions.has(key)) {
      result.push({
        type: 'removed',
        id: key,
        name: `${entry.objectName}.${entry.action.name}`,
      });
    }
  }

  // Added or modified
  for (const [key, entry] of afterActions) {
    const old = beforeActions.get(key);
    if (!old) {
      result.push({
        type: 'added',
        id: key,
        name: `${entry.objectName}.${entry.action.name}`,
      });
    } else {
      const details = diffActionDetails(old.action, entry.action);
      if (details) {
        result.push({
          type: 'modified',
          id: key,
          name: `${entry.objectName}.${entry.action.name}`,
          details,
        });
      }
    }
  }

  return result;
}

function diffActionDetails(a: AIPAction, b: AIPAction): string | undefined {
  const parts: string[] = [];
  if (a.description !== b.description) parts.push('description changed');
  if (a.type !== b.type) parts.push(`type: ${a.type} → ${b.type}`);
  if (JSON.stringify(a.governance) !== JSON.stringify(b.governance)) parts.push('governance changed');
  if (JSON.stringify(a.logicLayer) !== JSON.stringify(b.logicLayer)) parts.push('logic layer changed');
  return parts.length > 0 ? parts.join(', ') : undefined;
}

function buildSummary(
  objects: DiffItem[],
  links: DiffItem[],
  actions: DiffItem[],
): string {
  const counts = (items: DiffItem[]) => {
    const added = items.filter((i) => i.type === 'added').length;
    const removed = items.filter((i) => i.type === 'removed').length;
    const modified = items.filter((i) => i.type === 'modified').length;
    return { added, removed, modified };
  };

  const parts: string[] = [];

  for (const [label, items] of [
    ['object', objects],
    ['link', links],
    ['action', actions],
  ] as const) {
    const c = counts(items);
    const subParts: string[] = [];
    if (c.added > 0) subParts.push(`added ${c.added}`);
    if (c.removed > 0) subParts.push(`removed ${c.removed}`);
    if (c.modified > 0) subParts.push(`modified ${c.modified}`);
    if (subParts.length > 0) {
      parts.push(`${subParts.join(', ')} ${label}${(c.added + c.removed + c.modified) > 1 ? 's' : ''}`);
    }
  }

  return parts.length > 0 ? parts.join('; ') : 'No changes';
}
