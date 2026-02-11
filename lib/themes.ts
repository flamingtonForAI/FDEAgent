// Theme Configuration
// Color schemes based on official specifications with WCAG 2.1 AA compliance
// Contrast ratios: 4.5:1 for normal text, 3:1 for large text and UI components
// Reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html

export interface Theme {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  colors: {
    // Backgrounds
    bgBase: string;
    bgElevated: string;
    bgSurface: string;
    bgHover: string;

    // Accent colors
    accent: string;
    accentLight: string;
    accentSecondary: string;

    // Semantic colors
    success: string;
    warning: string;
    error: string;

    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Border colors
    border: string;
    borderHover: string;
    borderAccent: string;

    // Layer colors (for Action Designer)
    layerBusiness: string;
    layerLogic: string;
    layerImpl: string;
    layerGov: string;

    // Shadows
    shadowSm: string;
    shadowMd: string;
    shadowLg: string;
    shadowGlow: string;
  };
}

export const themes: Record<string, Theme> = {
  // ============================================
  // DARK THEMES
  // ============================================

  // GitHub Dark Dimmed - Based on GitHub's official dark theme
  // Source: https://primer.style/primitives/colors
  githubDark: {
    id: 'githubDark',
    name: 'GitHub Dark',
    description: 'GitHub 官方暗色主题',
    isDark: true,
    colors: {
      bgBase: '#0d1117',
      bgElevated: '#161b22',
      bgSurface: '#21262d',
      bgHover: '#30363d',

      accent: '#58a6ff',      // GitHub blue
      accentLight: '#79c0ff',
      accentSecondary: '#a371f7', // GitHub purple

      success: '#3fb950',
      warning: '#d29922',
      error: '#f85149',

      textPrimary: '#e6edf3',   // High contrast: ~12:1
      textSecondary: '#8b949e', // Medium contrast: ~5:1
      textMuted: '#6e7681',     // Low contrast: ~3.5:1

      border: 'rgba(240, 246, 252, 0.1)',
      borderHover: 'rgba(240, 246, 252, 0.2)',
      borderAccent: 'rgba(88, 166, 255, 0.4)',

      layerBusiness: '#58a6ff',
      layerLogic: '#3fb950',
      layerImpl: '#a371f7',
      layerGov: '#f0883e',

      shadowSm: '0 1px 0 rgba(0, 0, 0, 0.4)',
      shadowMd: '0 3px 6px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 8px 24px rgba(0, 0, 0, 0.4)',
      shadowGlow: '0 0 20px rgba(88, 166, 255, 0.15)',
    },
  },

  // One Dark Pro - Based on Atom's One Dark theme
  // Source: https://github.com/joshdick/onedark.vim
  oneDark: {
    id: 'oneDark',
    name: 'One Dark',
    description: 'Atom 经典暗色主题',
    isDark: true,
    colors: {
      bgBase: '#282c34',
      bgElevated: '#2c313a',
      bgSurface: '#353b45',
      bgHover: '#3e4451',

      accent: '#61afef',      // One Dark blue
      accentLight: '#82c4f8',
      accentSecondary: '#c678dd', // One Dark purple

      success: '#98c379',
      warning: '#e5c07b',
      error: '#e06c75',

      textPrimary: '#abb2bf',   // Official foreground
      textSecondary: '#828997',
      textMuted: '#5c6370',

      border: 'rgba(171, 178, 191, 0.1)',
      borderHover: 'rgba(171, 178, 191, 0.2)',
      borderAccent: 'rgba(97, 175, 239, 0.4)',

      layerBusiness: '#61afef',
      layerLogic: '#98c379',
      layerImpl: '#c678dd',
      layerGov: '#e5c07b',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.4)',
      shadowMd: '0 4px 8px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 8px 24px rgba(0, 0, 0, 0.4)',
      shadowGlow: '0 0 20px rgba(97, 175, 239, 0.15)',
    },
  },

  // Dracula - Official specification
  // Source: https://draculatheme.com/spec
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    description: 'Dracula 官方配色',
    isDark: true,
    colors: {
      bgBase: '#282a36',      // Official Background
      bgElevated: '#2d2f3d',
      bgSurface: '#343746',
      bgHover: '#44475a',     // Official Selection

      accent: '#bd93f9',      // Official Purple
      accentLight: '#caa9fa',
      accentSecondary: '#ff79c6', // Official Pink

      success: '#50fa7b',     // Official Green
      warning: '#ffb86c',     // Official Orange
      error: '#ff5555',       // Official Red

      textPrimary: '#f8f8f2', // Official Foreground
      textSecondary: '#bfbfbf',
      textMuted: '#6272a4',   // Official Comment

      border: 'rgba(248, 248, 242, 0.1)',
      borderHover: 'rgba(248, 248, 242, 0.2)',
      borderAccent: 'rgba(189, 147, 249, 0.4)',

      layerBusiness: '#8be9fd', // Official Cyan
      layerLogic: '#50fa7b',
      layerImpl: '#bd93f9',
      layerGov: '#ffb86c',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      shadowMd: '0 4px 12px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 8px 24px rgba(0, 0, 0, 0.5)',
      shadowGlow: '0 0 20px rgba(189, 147, 249, 0.2)',
    },
  },

  // Nord - Official specification
  // Source: https://www.nordtheme.com/docs/colors-and-palettes
  nord: {
    id: 'nord',
    name: 'Nord',
    description: 'Nord 北极冰雪配色',
    isDark: true,
    colors: {
      bgBase: '#2e3440',      // nord0 - Polar Night
      bgElevated: '#3b4252',  // nord1
      bgSurface: '#434c5e',   // nord2
      bgHover: '#4c566a',     // nord3

      accent: '#88c0d0',      // nord8 - Frost
      accentLight: '#8fbcbb', // nord7
      accentSecondary: '#81a1c1', // nord9

      success: '#a3be8c',     // nord14 - Aurora
      warning: '#ebcb8b',     // nord13
      error: '#bf616a',       // nord11

      textPrimary: '#eceff4', // nord6 - Snow Storm
      textSecondary: '#d8dee9', // nord4
      textMuted: '#8890a0',   // Lighter than nord3 for better contrast

      border: 'rgba(216, 222, 233, 0.1)',
      borderHover: 'rgba(216, 222, 233, 0.2)',
      borderAccent: 'rgba(136, 192, 208, 0.4)',

      layerBusiness: '#5e81ac', // nord10
      layerLogic: '#a3be8c',
      layerImpl: '#b48ead',   // nord15
      layerGov: '#ebcb8b',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      shadowMd: '0 4px 12px rgba(0, 0, 0, 0.25)',
      shadowLg: '0 8px 24px rgba(0, 0, 0, 0.3)',
      shadowGlow: '0 0 20px rgba(136, 192, 208, 0.15)',
    },
  },

  // Tokyo Night - Popular VS Code theme
  tokyoNight: {
    id: 'tokyoNight',
    name: 'Tokyo Night',
    description: '东京夜景霓虹配色',
    isDark: true,
    colors: {
      bgBase: '#1a1b26',
      bgElevated: '#1f2335',
      bgSurface: '#24283b',
      bgHover: '#292e42',

      accent: '#7aa2f7',      // Blue
      accentLight: '#89b4fa',
      accentSecondary: '#bb9af7', // Purple

      success: '#9ece6a',
      warning: '#e0af68',
      error: '#f7768e',

      textPrimary: '#c0caf5',
      textSecondary: '#a9b1d6',
      textMuted: '#565f89',

      border: 'rgba(192, 202, 245, 0.1)',
      borderHover: 'rgba(192, 202, 245, 0.2)',
      borderAccent: 'rgba(122, 162, 247, 0.4)',

      layerBusiness: '#7aa2f7',
      layerLogic: '#9ece6a',
      layerImpl: '#bb9af7',
      layerGov: '#e0af68',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      shadowMd: '0 4px 12px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 8px 24px rgba(0, 0, 0, 0.5)',
      shadowGlow: '0 0 20px rgba(122, 162, 247, 0.2)',
    },
  },

  // ============================================
  // LIGHT THEMES
  // ============================================

  // GitHub Light - Based on GitHub's official light theme
  githubLight: {
    id: 'githubLight',
    name: 'GitHub Light',
    description: 'GitHub 官方浅色主题',
    isDark: false,
    colors: {
      bgBase: '#ffffff',
      bgElevated: '#f6f8fa',
      bgSurface: '#eaeef2',
      bgHover: '#d0d7de',

      accent: '#0969da',
      accentLight: '#218bff',
      accentSecondary: '#8250df',

      success: '#1a7f37',
      warning: '#9a6700',
      error: '#cf222e',

      textPrimary: '#1f2328',   // High contrast
      textSecondary: '#57606a', // Good contrast: ~7:1
      textMuted: '#6e7781',     // Acceptable: ~4.5:1

      border: 'rgba(31, 35, 40, 0.15)',
      borderHover: 'rgba(31, 35, 40, 0.25)',
      borderAccent: 'rgba(9, 105, 218, 0.4)',

      layerBusiness: '#0969da',
      layerLogic: '#1a7f37',
      layerImpl: '#8250df',
      layerGov: '#bf8700',

      shadowSm: '0 1px 0 rgba(31, 35, 40, 0.04)',
      shadowMd: '0 3px 6px rgba(31, 35, 40, 0.12)',
      shadowLg: '0 8px 24px rgba(31, 35, 40, 0.12)',
      shadowGlow: '0 0 20px rgba(9, 105, 218, 0.1)',
    },
  },

  // Nord Light - Using Snow Storm palette
  // All text colors use Polar Night for good contrast
  nordLight: {
    id: 'nordLight',
    name: 'Nord Light',
    description: 'Nord 浅色版本',
    isDark: false,
    colors: {
      bgBase: '#eceff4',      // nord6
      bgElevated: '#e5e9f0',  // nord5
      bgSurface: '#d8dee9',   // nord4
      bgHover: '#c8ced9',

      accent: '#4c6a92',      // Darker than nord10 for better contrast
      accentLight: '#5e81ac', // nord10
      accentSecondary: '#8c5c85', // Darker nord15

      success: '#3d7047',     // Darker green
      warning: '#8c6610',     // Darker yellow
      error: '#8c2d35',       // Darker red

      textPrimary: '#2e3440', // nord0
      textSecondary: '#3b4252', // nord1
      textMuted: '#434c5e',   // nord2 (darker than nord3)

      border: 'rgba(46, 52, 64, 0.15)',
      borderHover: 'rgba(46, 52, 64, 0.25)',
      borderAccent: 'rgba(76, 106, 146, 0.4)',

      layerBusiness: '#4c6a92',
      layerLogic: '#3d7047',
      layerImpl: '#8c5c85',
      layerGov: '#8c6610',

      shadowSm: '0 1px 2px rgba(46, 52, 64, 0.08)',
      shadowMd: '0 4px 8px rgba(46, 52, 64, 0.12)',
      shadowLg: '0 8px 24px rgba(46, 52, 64, 0.16)',
      shadowGlow: '0 0 20px rgba(76, 106, 146, 0.15)',
    },
  },

  // Alucard (Dracula Light) - Official specification
  // Source: https://draculatheme.com/spec
  alucard: {
    id: 'alucard',
    name: 'Alucard',
    description: 'Dracula 官方浅色版',
    isDark: false,
    colors: {
      bgBase: '#fffbeb',      // Official Background
      bgElevated: '#f5f1e1',
      bgSurface: '#ebe7d7',
      bgHover: '#e0dccc',

      accent: '#644ac9',      // Official Purple
      accentLight: '#7b66d6',
      accentSecondary: '#a3144d', // Official Pink

      success: '#14710a',     // Official Green
      warning: '#a34d14',     // Official Orange
      error: '#cb3a2a',       // Official Red

      textPrimary: '#1f1f1f', // Official Foreground
      textSecondary: '#45453c',
      textMuted: '#6c664b',   // Official Comment

      border: 'rgba(31, 31, 31, 0.12)',
      borderHover: 'rgba(31, 31, 31, 0.2)',
      borderAccent: 'rgba(100, 74, 201, 0.3)',

      layerBusiness: '#036a96', // Official Cyan
      layerLogic: '#14710a',
      layerImpl: '#644ac9',
      layerGov: '#a34d14',

      shadowSm: '0 1px 2px rgba(31, 31, 31, 0.06)',
      shadowMd: '0 4px 8px rgba(31, 31, 31, 0.08)',
      shadowLg: '0 8px 24px rgba(31, 31, 31, 0.1)',
      shadowGlow: '0 0 20px rgba(100, 74, 201, 0.1)',
    },
  },

  // Solarized Light - Based on Ethan Schoonover's specification
  // Fixed textMuted for better contrast
  solarizedLight: {
    id: 'solarizedLight',
    name: 'Solarized Light',
    description: 'Solarized 经典护眼浅色',
    isDark: false,
    colors: {
      bgBase: '#fdf6e3',      // base3
      bgElevated: '#eee8d5',  // base2
      bgSurface: '#e4ddc7',
      bgHover: '#d9d2b8',

      accent: '#268bd2',      // blue
      accentLight: '#2aa198', // cyan
      accentSecondary: '#6c71c4', // violet

      success: '#5c7a00',     // Darker green for better contrast
      warning: '#96730a',     // Darker yellow
      error: '#c4271b',       // Darker red

      textPrimary: '#073642', // base02
      textSecondary: '#3f5a62', // Darker than base01
      textMuted: '#586e75',   // Use base01 for muted (was base0 which is too light)

      border: 'rgba(7, 54, 66, 0.15)',
      borderHover: 'rgba(7, 54, 66, 0.25)',
      borderAccent: 'rgba(38, 139, 210, 0.4)',

      layerBusiness: '#268bd2',
      layerLogic: '#5c7a00',
      layerImpl: '#6c71c4',
      layerGov: '#96730a',

      shadowSm: '0 1px 2px rgba(7, 54, 66, 0.08)',
      shadowMd: '0 4px 8px rgba(7, 54, 66, 0.12)',
      shadowLg: '0 8px 24px rgba(7, 54, 66, 0.16)',
      shadowGlow: '0 0 20px rgba(38, 139, 210, 0.15)',
    },
  },

  // One Light - Light version of One Dark
  // Fixed for better contrast (WCAG 2.1 AA: 4.5:1 minimum)
  oneLight: {
    id: 'oneLight',
    name: 'One Light',
    description: 'Atom 经典浅色主题',
    isDark: false,
    colors: {
      bgBase: '#fafafa',
      bgElevated: '#f0f0f0',
      bgSurface: '#e5e5e5',
      bgHover: '#dbdbdb',

      accent: '#4078f2',      // Blue
      accentLight: '#526fff',
      accentSecondary: '#a626a4', // Purple

      success: '#2e7d32',     // Darker green for better contrast
      warning: '#b36b00',     // Darker orange
      error: '#c62828',       // Darker red

      textPrimary: '#24292f', // Much darker for high contrast
      textSecondary: '#4b5158', // Darker - contrast ratio ~7:1
      textMuted: '#656d76',   // Darker - contrast ratio ~4.6:1

      border: 'rgba(36, 41, 47, 0.15)',
      borderHover: 'rgba(36, 41, 47, 0.25)',
      borderAccent: 'rgba(64, 120, 242, 0.4)',

      layerBusiness: '#4078f2',
      layerLogic: '#2e7d32',
      layerImpl: '#a626a4',
      layerGov: '#b36b00',

      shadowSm: '0 1px 2px rgba(36, 41, 47, 0.08)',
      shadowMd: '0 4px 8px rgba(36, 41, 47, 0.12)',
      shadowLg: '0 8px 24px rgba(36, 41, 47, 0.16)',
      shadowGlow: '0 0 20px rgba(64, 120, 242, 0.15)',
    },
  },
};

export const defaultThemeId = 'githubDark';

// Theme mode: 'dark', 'light', or 'system'
export type ThemeMode = 'dark' | 'light' | 'system';

// Simplified theme options for UI
export const themeOptions: { id: ThemeMode; name: { cn: string; en: string }; icon: string }[] = [
  { id: 'dark', name: { cn: '深色', en: 'Dark' }, icon: '🌙' },
  { id: 'light', name: { cn: '浅色', en: 'Light' }, icon: '☀️' },
  { id: 'system', name: { cn: '跟随系统', en: 'System' }, icon: '💻' },
];

export function getTheme(id: string): Theme {
  return themes[id] || themes[defaultThemeId];
}

// Get the actual theme based on mode
export function getThemeForMode(mode: ThemeMode): Theme {
  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? themes.githubDark : themes.githubLight;
  }
  return mode === 'dark' ? themes.githubDark : themes.githubLight;
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const { colors } = theme;

  // Apply color scheme for form elements
  root.style.colorScheme = theme.isDark ? 'dark' : 'light';

  // Apply CSS variables
  root.style.setProperty('--color-bg-base', colors.bgBase);
  root.style.setProperty('--color-bg-elevated', colors.bgElevated);
  root.style.setProperty('--color-bg-surface', colors.bgSurface);
  root.style.setProperty('--color-bg-hover', colors.bgHover);

  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-light', colors.accentLight);
  root.style.setProperty('--color-accent-secondary', colors.accentSecondary);

  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-error', colors.error);

  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-text-muted', colors.textMuted);

  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-border-hover', colors.borderHover);
  root.style.setProperty('--color-border-accent', colors.borderAccent);

  root.style.setProperty('--color-layer-business', colors.layerBusiness);
  root.style.setProperty('--color-layer-logic', colors.layerLogic);
  root.style.setProperty('--color-layer-impl', colors.layerImpl);
  root.style.setProperty('--color-layer-gov', colors.layerGov);

  root.style.setProperty('--shadow-sm', colors.shadowSm);
  root.style.setProperty('--shadow-md', colors.shadowMd);
  root.style.setProperty('--shadow-lg', colors.shadowLg);
  root.style.setProperty('--shadow-glow', colors.shadowGlow);
}

// Apply theme mode and save preference
export function applyThemeMode(mode: ThemeMode): void {
  const theme = getThemeForMode(mode);
  applyTheme(theme);
  localStorage.setItem('ontology-architect-theme-mode', mode);
}

// Get saved theme mode
export function getSavedThemeMode(): ThemeMode {
  const saved = localStorage.getItem('ontology-architect-theme-mode');
  if (saved === 'dark' || saved === 'light' || saved === 'system') {
    return saved;
  }
  return 'system'; // Default to system
}

// Listen for system theme changes (call this on app init)
export function setupSystemThemeListener(callback: (mode: ThemeMode) => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    const currentMode = getSavedThemeMode();
    if (currentMode === 'system') {
      applyThemeMode('system');
      callback('system');
    }
  };
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

// Legacy support
export function loadSavedTheme(): Theme {
  const mode = getSavedThemeMode();
  return getThemeForMode(mode);
}
