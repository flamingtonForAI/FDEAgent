/**
 * Bridge hook for gradual i18next migration.
 * Wraps useTranslation() and also exposes `lang` for components
 * that still accept it as a prop during the transition period.
 *
 * This file will be deleted in Phase 3 when prop drilling is removed.
 */

import { useTranslation } from 'react-i18next';
import type { Language } from '../types';

export function useAppTranslation(ns?: string | string[]) {
  const translation = useTranslation(ns as any);
  return {
    ...translation,
    // Loosen the key type during migration — strict key checking still
    // works via the locales/types.ts augmentation for direct useTranslation calls.
    t: translation.t as (key: string, options?: Record<string, unknown>) => string,
    lang: translation.i18n.language as Language,
  };
}
