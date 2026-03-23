/**
 * i18next initialization with Vite import.meta.glob backend.
 * Locale JSON files are lazy-loaded as separate chunks.
 */

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Build-time glob: Vite collects all locale JSON files and generates lazy loaders
const localeModules = import.meta.glob('../locales/*/*.json');

// Resolve a locale module path to its loader
const loadResource = (lang: string, ns: string) => {
  const path = `../locales/${lang}/${ns}.json`;
  const loader = localeModules[path];
  if (!loader) return Promise.reject(new Error(`Missing locale: ${path}`));
  return loader() as Promise<{ default: Record<string, string> }>;
};

// Custom i18next backend plugin using Vite's import.meta.glob
const ViteGlobBackend = {
  type: 'backend' as const,
  init() {},
  read(language: string, namespace: string, callback: (err: Error | null, data: Record<string, string> | null) => void) {
    loadResource(language, namespace)
      .then(mod => callback(null, mod.default))
      .catch(err => callback(err, null));
  },
};

// Language visibility configuration
// Controls which languages appear in the UI language selector
export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  status: 'available' | 'beta' | 'hidden';
  dir: 'ltr' | 'rtl';
}

export const allLanguages: LanguageOption[] = [
  { code: 'cn', label: 'Chinese', nativeLabel: '中文', status: 'available', dir: 'ltr' },
  { code: 'en', label: 'English', nativeLabel: 'English', status: 'available', dir: 'ltr' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', status: 'beta', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', status: 'beta', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', status: 'beta', dir: 'rtl' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', status: 'beta', dir: 'ltr' },
];

/** Languages visible in the UI selector (excludes hidden) */
export const availableLanguages = allLanguages.filter(l => l.status !== 'hidden');

/** Get language option by code */
export function getLanguageOption(code: string): LanguageOption | undefined {
  return allLanguages.find(l => l.code === code);
}

// Update document dir and lang on language change
i18next.on('languageChanged', (lng: string) => {
  const langOption = getLanguageOption(lng);
  document.documentElement.dir = langOption?.dir || 'ltr';
  document.documentElement.lang = lng === 'cn' ? 'zh-CN' : lng === 'ja' ? 'ja' : lng;
});

// Initialize i18next
i18next
  .use(ViteGlobBackend)
  .use(initReactI18next)
  .init({
    lng: 'cn',
    fallbackLng: ['en', 'cn'],
    defaultNS: 'common',
    ns: ['common', 'nav', 'academy', 'pricing'],
    partialBundledLanguages: true,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18next;
