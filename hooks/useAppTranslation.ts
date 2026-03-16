/**
 * Bridge hook for i18next integration.
 * Wraps useTranslation() and exposes:
 *  - `t(key)` — i18next translation function (loose key types)
 *  - `lang`   — current language code
 *  - `lt(obj)` — resolve a bilingual data object ({en, cn, ...}) to current language with fallback
 */

import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { lt as ltHelper, type LocalizedText } from '../lib/localizedText';
import type { Language } from '../types';

// Languages that have bilingual data content (archetype/case/exercise data objects).
// When i18next language is not in this set, data access via [lang] falls back to 'en'.
// Add new languages here once their data-layer content is populated.
const DATA_LANGUAGES = new Set(['cn', 'en']);

export function useAppTranslation(ns?: string | string[]) {
  const translation = useTranslation(ns as any);
  const i18nLang = translation.i18n.language;
  // For data access ([lang] indexing on bilingual objects), fall back to 'en'
  // when the current language has no data-layer content yet.
  // t() is unaffected — it uses i18next's internal language with its own fallback chain.
  const lang = (DATA_LANGUAGES.has(i18nLang) ? i18nLang : 'en') as Language;
  // Resolve bilingual data objects: lt(data.title) → data.title[lang] || .en || .cn
  const lt = useCallback(
    (text: LocalizedText | string | Record<string, string> | undefined | null) =>
      ltHelper((text ?? '') as LocalizedText | string, i18nLang),
    [i18nLang]
  );
  return {
    ...translation,
    t: translation.t as (key: string, options?: Record<string, unknown>) => string,
    /** Language code safe for data access (bilingual objects). Falls back to 'en' for unsupported languages. */
    lang,
    /** The raw i18next language code (may not have data-layer content). */
    i18nLang: i18nLang as Language,
    /** Resolve a bilingual data object to the current language with en→cn fallback */
    lt,
  };
}
