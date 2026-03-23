import { Tier, TIER_FEATURES, TierFeatureKey } from './tiers';

let currentTier: Tier = 'community';

export function setCurrentTier(tier: Tier): void {
  currentTier = tier;
}

export function getCurrentTier(): Tier {
  return currentTier;
}

export function canUse(feature: TierFeatureKey, tier?: Tier): boolean {
  const t = tier ?? currentTier;
  const features = TIER_FEATURES[t];
  return feature in features && Boolean(features[feature]);
}

export function getFeatureValue<K extends TierFeatureKey>(
  feature: K,
  tier?: Tier
): (typeof TIER_FEATURES)[Tier][K] {
  const t = tier ?? currentTier;
  return TIER_FEATURES[t][feature];
}

export function isExportFormatAvailable(format: string, tier?: Tier): boolean {
  const t = tier ?? currentTier;
  return (TIER_FEATURES[t].export as readonly string[]).includes(format);
}
