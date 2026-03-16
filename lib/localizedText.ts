/**
 * Localized text utilities for archetype data layer.
 * Used when archetype metadata (name, description) needs multi-language support.
 */

export type LocalizedText = {
  en: string;
  cn: string;
  [k: string]: string | undefined;
};

/**
 * Resolve a LocalizedText or plain string to the requested language.
 * Falls back: requested lang → en → cn → ''
 */
export function lt(text: LocalizedText | string, lang: string): string {
  if (typeof text === 'string') return text;
  return text[lang] || text.en || text.cn || '';
}
