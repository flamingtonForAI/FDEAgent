import type { OntologyLink, ProjectState } from '../types';

export type CanonicalCardinality = '1:1' | '1:N' | 'N:1' | 'N:N';

const CARDINALITY_MAP: Record<string, CanonicalCardinality> = {
  '1:1': '1:1',
  '1:N': '1:N',
  'N:1': 'N:1',
  'N:N': 'N:N',
  'one-to-one': '1:1',
  oneToOne: '1:1',
  'one-to-many': '1:N',
  oneToMany: '1:N',
  'many-to-one': 'N:1',
  manyToOne: 'N:1',
  'many-to-many': 'N:N',
  manyToMany: 'N:N',
};

const isCardinalityDebugEnabled = (): boolean => {
  const isDev = typeof import.meta !== 'undefined' && Boolean((import.meta as any).env?.DEV);
  if (!isDev || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('ontology-debug-cardinality') === '1';
  } catch {
    return false;
  }
};

export function normalizeCardinality(
  value?: OntologyLink['cardinality']
): CanonicalCardinality | undefined {
  if (!value) return undefined;
  const normalized = CARDINALITY_MAP[value] || undefined;
  if (isCardinalityDebugEnabled() && normalized && normalized !== value) {
    console.debug('[Cardinality] normalized:', value, '->', normalized);
  }
  return normalized;
}

export function normalizeLink(link: OntologyLink): OntologyLink {
  return {
    ...link,
    source: link.source || link.sourceObject || link.sourceObjectId || '',
    target: link.target || link.targetObject || link.targetObjectId || '',
    label: link.label || link.name || '',
    cardinality: normalizeCardinality(link.cardinality),
  };
}

export function normalizeLinks(links: OntologyLink[] = []): OntologyLink[] {
  return links.map(normalizeLink);
}

export function normalizeProjectState(state: ProjectState): ProjectState {
  return {
    ...state,
    links: normalizeLinks(state.links || []),
  };
}
