import React, { useState, useRef, useEffect } from 'react';
import { themes, Theme, applyTheme } from '../../lib/themes';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeSelect = (theme: Theme) => {
    applyTheme(theme);
    onThemeChange(theme);
    setIsOpen(false);
  };

  const themeList = Object.values(themes);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass-surface hover:border-[var(--color-border-hover)] transition-all"
        title="切换主题"
      >
        {/* Theme icon */}
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: currentTheme.colors.accent }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
        <span className="text-xs text-[var(--color-text-secondary)] hidden sm:inline">
          {currentTheme.name}
        </span>
        <svg
          className={`w-3 h-3 text-[var(--color-text-muted)] transition-transform ${isOpen ? '' : 'rotate-180'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown - opens upward */}
      {isOpen && (
        <div
          className="absolute right-0 bottom-full mb-2 w-64 rounded-xl shadow-xl z-[100] overflow-hidden border border-[var(--color-border)]"
          style={{ backgroundColor: 'var(--color-bg-elevated)' }}
        >
          <div className="p-2 max-h-80 overflow-y-auto">
            <div className="text-xs text-[var(--color-text-muted)] px-3 py-2 uppercase tracking-wider">
              选择主题
            </div>
            {themeList.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                  currentTheme.id === theme.id
                    ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30'
                    : 'hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                {/* Color preview */}
                <div className="flex-shrink-0 flex gap-0.5">
                  <div
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: theme.colors.bgBase }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.colors.accentSecondary }}
                  />
                </div>

                {/* Theme info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        currentTheme.id === theme.id
                          ? 'text-[var(--color-accent)]'
                          : 'text-[var(--color-text-primary)]'
                      }`}
                    >
                      {theme.name}
                    </span>
                    {!theme.isDark && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-warning)]/20 text-[var(--color-warning)]">
                        Light
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">
                    {theme.description}
                  </p>
                </div>

                {/* Check mark */}
                {currentTheme.id === theme.id && (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: theme.colors.accent }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
