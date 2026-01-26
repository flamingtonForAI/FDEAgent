// Theme Configuration
// Multiple color schemes with theme switching support

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
  palantir: {
    id: 'palantir',
    name: 'Palantir Dark',
    description: '深蓝灰 + 金色点缀，专业数据平台风格',
    isDark: true,
    colors: {
      bgBase: '#0d1117',
      bgElevated: '#161b22',
      bgSurface: '#1c2128',
      bgHover: '#252c35',

      accent: '#d4a656',
      accentLight: '#e6be7a',
      accentSecondary: '#4a9eff',

      success: '#3fb950',
      warning: '#d29922',
      error: '#f85149',

      textPrimary: '#e6edf3',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',

      border: 'rgba(139, 148, 158, 0.15)',
      borderHover: 'rgba(139, 148, 158, 0.3)',
      borderAccent: 'rgba(212, 166, 86, 0.4)',

      layerBusiness: '#58a6ff',
      layerLogic: '#3fb950',
      layerImpl: '#a371f7',
      layerGov: '#d4a656',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      shadowMd: '0 4px 12px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 8px 24px rgba(0, 0, 0, 0.5)',
      shadowGlow: '0 0 20px rgba(212, 166, 86, 0.15)',
    },
  },

  github: {
    id: 'github',
    name: 'GitHub Dark',
    description: '经典 GitHub 暗色主题，蓝色点缀',
    isDark: true,
    colors: {
      bgBase: '#0d1117',
      bgElevated: '#161b22',
      bgSurface: '#21262d',
      bgHover: '#30363d',

      accent: '#58a6ff',
      accentLight: '#79c0ff',
      accentSecondary: '#a371f7',

      success: '#3fb950',
      warning: '#d29922',
      error: '#f85149',

      textPrimary: '#c9d1d9',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',

      border: 'rgba(240, 246, 252, 0.1)',
      borderHover: 'rgba(240, 246, 252, 0.2)',
      borderAccent: 'rgba(88, 166, 255, 0.4)',

      layerBusiness: '#58a6ff',
      layerLogic: '#3fb950',
      layerImpl: '#a371f7',
      layerGov: '#f0883e',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      shadowMd: '0 4px 12px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 8px 24px rgba(0, 0, 0, 0.5)',
      shadowGlow: '0 0 20px rgba(88, 166, 255, 0.15)',
    },
  },

  nord: {
    id: 'nord',
    name: 'Nord',
    description: '北极风格，冷色调蓝灰配色',
    isDark: true,
    colors: {
      bgBase: '#2e3440',
      bgElevated: '#3b4252',
      bgSurface: '#434c5e',
      bgHover: '#4c566a',

      accent: '#88c0d0',
      accentLight: '#8fbcbb',
      accentSecondary: '#81a1c1',

      success: '#a3be8c',
      warning: '#ebcb8b',
      error: '#bf616a',

      textPrimary: '#eceff4',
      textSecondary: '#d8dee9',
      textMuted: '#a5aab3',

      border: 'rgba(216, 222, 233, 0.1)',
      borderHover: 'rgba(216, 222, 233, 0.2)',
      borderAccent: 'rgba(136, 192, 208, 0.4)',

      layerBusiness: '#81a1c1',
      layerLogic: '#a3be8c',
      layerImpl: '#b48ead',
      layerGov: '#ebcb8b',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.4)',
      shadowMd: '0 4px 12px rgba(0, 0, 0, 0.3)',
      shadowLg: '0 8px 24px rgba(0, 0, 0, 0.4)',
      shadowGlow: '0 0 20px rgba(136, 192, 208, 0.15)',
    },
  },

  dracula: {
    id: 'dracula',
    name: 'Dracula',
    description: '经典 Dracula 主题，紫粉色调',
    isDark: true,
    colors: {
      bgBase: '#282a36',
      bgElevated: '#343746',
      bgSurface: '#3d4056',
      bgHover: '#44475a',

      accent: '#bd93f9',
      accentLight: '#caa9fa',
      accentSecondary: '#ff79c6',

      success: '#50fa7b',
      warning: '#ffb86c',
      error: '#ff5555',

      textPrimary: '#f8f8f2',
      textSecondary: '#c5c8d4',
      textMuted: '#6272a4',

      border: 'rgba(248, 248, 242, 0.1)',
      borderHover: 'rgba(248, 248, 242, 0.2)',
      borderAccent: 'rgba(189, 147, 249, 0.4)',

      layerBusiness: '#8be9fd',
      layerLogic: '#50fa7b',
      layerImpl: '#bd93f9',
      layerGov: '#ffb86c',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      shadowMd: '0 4px 12px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 8px 24px rgba(0, 0, 0, 0.5)',
      shadowGlow: '0 0 20px rgba(189, 147, 249, 0.2)',
    },
  },

  monokai: {
    id: 'monokai',
    name: 'Monokai Pro',
    description: '经典 Monokai 主题，温暖的深色调',
    isDark: true,
    colors: {
      bgBase: '#2d2a2e',
      bgElevated: '#353236',
      bgSurface: '#403e41',
      bgHover: '#4a474b',

      accent: '#ffd866',
      accentLight: '#ffe599',
      accentSecondary: '#78dce8',

      success: '#a9dc76',
      warning: '#fc9867',
      error: '#ff6188',

      textPrimary: '#fcfcfa',
      textSecondary: '#c1c0c0',
      textMuted: '#939293',

      border: 'rgba(252, 252, 250, 0.1)',
      borderHover: 'rgba(252, 252, 250, 0.2)',
      borderAccent: 'rgba(255, 216, 102, 0.4)',

      layerBusiness: '#78dce8',
      layerLogic: '#a9dc76',
      layerImpl: '#ab9df2',
      layerGov: '#ffd866',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      shadowMd: '0 4px 12px rgba(0, 0, 0, 0.4)',
      shadowLg: '0 8px 24px rgba(0, 0, 0, 0.5)',
      shadowGlow: '0 0 20px rgba(255, 216, 102, 0.15)',
    },
  },

  light: {
    id: 'light',
    name: 'GitHub Light',
    description: '经典 GitHub 浅色主题，清爽专业',
    isDark: false,
    colors: {
      bgBase: '#ffffff',
      bgElevated: '#f6f8fa',
      bgSurface: '#f0f2f5',
      bgHover: '#e8eaed',

      accent: '#0969da',
      accentLight: '#218bff',
      accentSecondary: '#8250df',

      success: '#1a7f37',
      warning: '#9a6700',
      error: '#cf222e',

      textPrimary: '#1f2328',
      textSecondary: '#656d76',
      textMuted: '#8b949e',

      border: 'rgba(31, 35, 40, 0.15)',
      borderHover: 'rgba(31, 35, 40, 0.25)',
      borderAccent: 'rgba(9, 105, 218, 0.4)',

      layerBusiness: '#0969da',
      layerLogic: '#1a7f37',
      layerImpl: '#8250df',
      layerGov: '#bf8700',

      shadowSm: '0 1px 2px rgba(31, 35, 40, 0.1)',
      shadowMd: '0 4px 12px rgba(31, 35, 40, 0.1)',
      shadowLg: '0 8px 24px rgba(31, 35, 40, 0.15)',
      shadowGlow: '0 0 20px rgba(9, 105, 218, 0.1)',
    },
  },

  solarizedLight: {
    id: 'solarizedLight',
    name: 'Solarized Light',
    description: '经典护眼浅色主题，米黄底色',
    isDark: false,
    colors: {
      bgBase: '#fdf6e3',
      bgElevated: '#eee8d5',
      bgSurface: '#e8e2ce',
      bgHover: '#ddd6c1',

      accent: '#268bd2',
      accentLight: '#2aa198',
      accentSecondary: '#6c71c4',

      success: '#859900',
      warning: '#b58900',
      error: '#dc322f',

      textPrimary: '#073642',
      textSecondary: '#586e75',
      textMuted: '#93a1a1',

      border: 'rgba(7, 54, 66, 0.12)',
      borderHover: 'rgba(7, 54, 66, 0.2)',
      borderAccent: 'rgba(38, 139, 210, 0.4)',

      layerBusiness: '#268bd2',
      layerLogic: '#859900',
      layerImpl: '#6c71c4',
      layerGov: '#b58900',

      shadowSm: '0 1px 2px rgba(7, 54, 66, 0.08)',
      shadowMd: '0 4px 12px rgba(7, 54, 66, 0.08)',
      shadowLg: '0 8px 24px rgba(7, 54, 66, 0.12)',
      shadowGlow: '0 0 20px rgba(38, 139, 210, 0.1)',
    },
  },

  rosePineDawn: {
    id: 'rosePineDawn',
    name: 'Rose Pine Dawn',
    description: '柔和粉紫色调，温暖舒适',
    isDark: false,
    colors: {
      bgBase: '#faf4ed',
      bgElevated: '#fffaf3',
      bgSurface: '#f2e9e1',
      bgHover: '#e4dcd4',

      accent: '#907aa9',
      accentLight: '#b4a4c4',
      accentSecondary: '#d7827e',

      success: '#56949f',
      warning: '#ea9d34',
      error: '#b4637a',

      textPrimary: '#575279',
      textSecondary: '#797593',
      textMuted: '#9893a5',

      border: 'rgba(87, 82, 121, 0.12)',
      borderHover: 'rgba(87, 82, 121, 0.2)',
      borderAccent: 'rgba(144, 122, 169, 0.4)',

      layerBusiness: '#286983',
      layerLogic: '#56949f',
      layerImpl: '#907aa9',
      layerGov: '#ea9d34',

      shadowSm: '0 1px 2px rgba(87, 82, 121, 0.08)',
      shadowMd: '0 4px 12px rgba(87, 82, 121, 0.08)',
      shadowLg: '0 8px 24px rgba(87, 82, 121, 0.12)',
      shadowGlow: '0 0 20px rgba(144, 122, 169, 0.12)',
    },
  },

  catppuccinLatte: {
    id: 'catppuccinLatte',
    name: 'Catppuccin Latte',
    description: '奶油拿铁色调，柔和温暖',
    isDark: false,
    colors: {
      bgBase: '#eff1f5',
      bgElevated: '#e6e9ef',
      bgSurface: '#dce0e8',
      bgHover: '#ccd0da',

      accent: '#8839ef',
      accentLight: '#a86de9',
      accentSecondary: '#1e66f5',

      success: '#40a02b',
      warning: '#df8e1d',
      error: '#d20f39',

      textPrimary: '#4c4f69',
      textSecondary: '#6c6f85',
      textMuted: '#9ca0b0',

      border: 'rgba(76, 79, 105, 0.12)',
      borderHover: 'rgba(76, 79, 105, 0.2)',
      borderAccent: 'rgba(136, 57, 239, 0.3)',

      layerBusiness: '#1e66f5',
      layerLogic: '#40a02b',
      layerImpl: '#8839ef',
      layerGov: '#df8e1d',

      shadowSm: '0 1px 2px rgba(76, 79, 105, 0.08)',
      shadowMd: '0 4px 12px rgba(76, 79, 105, 0.08)',
      shadowLg: '0 8px 24px rgba(76, 79, 105, 0.12)',
      shadowGlow: '0 0 20px rgba(136, 57, 239, 0.1)',
    },
  },

  paperLight: {
    id: 'paperLight',
    name: 'Paper',
    description: '纸张白色，极简纯净风格',
    isDark: false,
    colors: {
      bgBase: '#f8f8f8',
      bgElevated: '#ffffff',
      bgSurface: '#f0f0f0',
      bgHover: '#e8e8e8',

      accent: '#4a7c59',
      accentLight: '#6b9b7a',
      accentSecondary: '#5b7e9a',

      success: '#4a7c59',
      warning: '#c4841d',
      error: '#c94f4f',

      textPrimary: '#2c2c2c',
      textSecondary: '#5a5a5a',
      textMuted: '#8a8a8a',

      border: 'rgba(0, 0, 0, 0.08)',
      borderHover: 'rgba(0, 0, 0, 0.15)',
      borderAccent: 'rgba(74, 124, 89, 0.3)',

      layerBusiness: '#5b7e9a',
      layerLogic: '#4a7c59',
      layerImpl: '#7a6b9a',
      layerGov: '#c4841d',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      shadowMd: '0 4px 12px rgba(0, 0, 0, 0.06)',
      shadowLg: '0 8px 24px rgba(0, 0, 0, 0.08)',
      shadowGlow: '0 0 20px rgba(74, 124, 89, 0.08)',
    },
  },
};

export const defaultThemeId = 'palantir';

export function getTheme(id: string): Theme {
  return themes[id] || themes[defaultThemeId];
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const { colors } = theme;

  // Apply color scheme
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

  // Store theme preference
  localStorage.setItem('ontology-architect-theme', theme.id);
}

export function loadSavedTheme(): Theme {
  const savedThemeId = localStorage.getItem('ontology-architect-theme');
  return getTheme(savedThemeId || defaultThemeId);
}
