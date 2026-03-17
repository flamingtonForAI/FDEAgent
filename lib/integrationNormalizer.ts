/**
 * integrationNormalizer — Normalize/denormalize ExternalIntegration data.
 *
 * Old data uses mixed field names (systemName vs sourceSystem vs name,
 * top-level frequency vs syncPolicy.frequency, type vs mechanism).
 * This module provides a single read model for editors and display.
 */
import type { ExternalIntegration, FieldMapping } from '../types';

// ---------------------------------------------------------------------------
// Normalized read model
// ---------------------------------------------------------------------------

export interface NormalizedIntegration {
  id: string;
  systemName: string;
  description: string;
  targetObjectId: string;
  mechanism: string;
  direction: 'import' | 'export' | 'bidirectional';
  dataPoints: string[];
  syncPolicy: {
    mode: 'realtime' | 'batch' | 'event-driven' | 'manual';
    frequency: string;
    retryPolicy: string;
    conflictStrategy: 'source-wins' | 'target-wins' | 'manual-review' | 'last-write-wins';
  };
  fieldMappings: FieldMapping[];
}

// ---------------------------------------------------------------------------
// Infer sync mode from legacy frequency string
// ---------------------------------------------------------------------------

const REALTIME_KEYWORDS = ['realtime', 'real-time', 'streaming', 'live', 'continuous'];
const EVENT_KEYWORDS = ['event', 'event-driven', 'cdc', 'webhook', 'trigger'];
const MANUAL_KEYWORDS = ['on-demand', 'on demand', 'manual', 'ad-hoc', 'ad hoc', 'as-needed'];

function inferModeFromFrequency(
  freq: string | undefined
): NormalizedIntegration['syncPolicy']['mode'] | null {
  if (!freq) return null;
  const lower = freq.toLowerCase().trim();
  if (REALTIME_KEYWORDS.some(k => lower.includes(k))) return 'realtime';
  if (EVENT_KEYWORDS.some(k => lower.includes(k))) return 'event-driven';
  if (MANUAL_KEYWORDS.some(k => lower.includes(k))) return 'manual';
  // Anything that looks like a schedule interval → batch
  if (/hourly|daily|weekly|monthly|cron|minute|interval|scheduled/i.test(lower)) return 'batch';
  return null;
}

// ---------------------------------------------------------------------------
// Stable ID generation for legacy integrations without id
// ---------------------------------------------------------------------------

const _stableIdCache = new WeakMap<ExternalIntegration, string>();
let _idCounter = 0;

function stableId(raw: ExternalIntegration): string {
  if (raw.id) return raw.id as string;
  let cached = _stableIdCache.get(raw);
  if (!cached) {
    cached = `int-auto-${++_idCounter}`;
    _stableIdCache.set(raw, cached);
  }
  return cached;
}

// ---------------------------------------------------------------------------
// normalize: raw ExternalIntegration → NormalizedIntegration
// ---------------------------------------------------------------------------

export function normalizeIntegration(raw: ExternalIntegration): NormalizedIntegration {
  const legacyFreq = (raw.frequency || '') as string;
  const explicitMode = raw.syncPolicy?.mode;
  const inferredMode = !explicitMode ? inferModeFromFrequency(legacyFreq) : null;

  // For batch mode, keep the frequency string. For inferred realtime/event-driven,
  // the legacy frequency was really describing the mode, not a schedule interval.
  const resolvedMode = explicitMode || inferredMode || 'batch';
  const resolvedFrequency = (raw.syncPolicy?.frequency || legacyFreq || '') as string;

  return {
    id: stableId(raw),
    systemName: (raw.systemName || raw.sourceSystem || raw.name || '') as string,
    description: (raw.description || '') as string,
    targetObjectId: (raw.targetObjectId || '') as string,
    mechanism: (raw.mechanism || raw.type || 'API') as string,
    direction: raw.direction || 'import',
    dataPoints: Array.isArray(raw.dataPoints) ? raw.dataPoints : [],
    syncPolicy: {
      mode: resolvedMode,
      frequency: resolvedFrequency,
      retryPolicy: (raw.syncPolicy?.retryPolicy || '') as string,
      conflictStrategy: raw.syncPolicy?.conflictStrategy || 'source-wins',
    },
    fieldMappings: Array.isArray(raw.fieldMappings) ? raw.fieldMappings : [],
  };
}

// ---------------------------------------------------------------------------
// denormalize: NormalizedIntegration → ExternalIntegration (merge over original)
// ---------------------------------------------------------------------------

export function denormalizeIntegration(
  normalized: NormalizedIntegration,
  original?: ExternalIntegration
): ExternalIntegration {
  const base: ExternalIntegration = original ? { ...original } : {};

  // Overwrite canonical fields
  base.id = normalized.id;
  base.systemName = normalized.systemName;
  base.description = normalized.description;
  base.targetObjectId = normalized.targetObjectId;
  base.mechanism = normalized.mechanism;
  base.direction = normalized.direction;
  base.dataPoints = normalized.dataPoints;
  base.syncPolicy = {
    mode: normalized.syncPolicy.mode,
    frequency: normalized.syncPolicy.frequency,
    retryPolicy: normalized.syncPolicy.retryPolicy,
    conflictStrategy: normalized.syncPolicy.conflictStrategy,
  };
  base.fieldMappings = normalized.fieldMappings;

  return base;
}

// ---------------------------------------------------------------------------
// Statistics helper
// ---------------------------------------------------------------------------

export interface IntegrationStats {
  total: number;
  realtime: number;
  batch: number;
  unconfigured: number;
}

export function computeIntegrationStats(
  integrations: ExternalIntegration[] | undefined
): IntegrationStats {
  const list = integrations || [];
  let realtime = 0;
  let batch = 0;
  let unconfigured = 0;

  for (const raw of list) {
    const n = normalizeIntegration(raw);
    const mode = n.syncPolicy.mode;
    if (mode === 'realtime' || mode === 'event-driven') realtime++;
    if (mode === 'batch') batch++;
    if (!n.targetObjectId || !n.mechanism) unconfigured++;
  }

  return { total: list.length, realtime, batch, unconfigured };
}

// ---------------------------------------------------------------------------
// Empty template for new integrations
// ---------------------------------------------------------------------------

export function createEmptyNormalized(): NormalizedIntegration {
  return {
    id: `int-${Date.now()}-${++_idCounter}`,
    systemName: '',
    description: '',
    targetObjectId: '',
    mechanism: 'API',
    direction: 'import',
    dataPoints: [],
    syncPolicy: {
      mode: 'batch',
      frequency: '',
      retryPolicy: '',
      conflictStrategy: 'source-wins',
    },
    fieldMappings: [],
  };
}
