export type Tier = 'community' | 'cloud' | 'enterprise';

export interface TierFeatures {
  readonly maxProjects: number;
  readonly export: readonly string[];
  readonly aiProviders: 'byok' | 'managed' | 'managed+custom';
  readonly collaboration: boolean;
  readonly sso: boolean;
  readonly audit?: boolean;
  readonly rbac?: boolean;
}

export const TIER_FEATURES: Record<Tier, TierFeatures> = {
  community: {
    maxProjects: 10,
    export: ['json', 'markdown', 'yaml'],
    aiProviders: 'byok',
    collaboration: false,
    sso: false,
  },
  cloud: {
    maxProjects: Infinity,
    export: ['json', 'markdown', 'yaml', 'html', 'zip', 'mermaid'],
    aiProviders: 'managed',
    collaboration: true,
    sso: false,
  },
  enterprise: {
    maxProjects: Infinity,
    export: ['json', 'markdown', 'yaml', 'html', 'zip', 'mermaid'],
    aiProviders: 'managed+custom',
    collaboration: true,
    sso: true,
    audit: true,
    rbac: true,
  },
} as const;

export type TierFeatureKey = keyof TierFeatures;

export const TIER_LABELS: Record<Tier, { en: string; cn: string }> = {
  community: { en: 'Community', cn: '社区版' },
  cloud: { en: 'Cloud Pro', cn: '云专业版' },
  enterprise: { en: 'Enterprise', cn: '企业版' },
};
