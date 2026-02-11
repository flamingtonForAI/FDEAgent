import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Monitor, ChevronDown, Check } from 'lucide-react';
import { ThemeMode, themeOptions, applyThemeMode, getSavedThemeMode, setupSystemThemeListener } from '../../lib/themes';

interface ThemeSwitcherProps {
  lang?: 'cn' | 'en';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ lang = 'cn' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<ThemeMode>(() => getSavedThemeMode());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Setup system theme listener
  useEffect(() => {
    const cleanup = setupSystemThemeListener((mode) => {
      if (mode === 'system') {
        setCurrentMode('system');
      }
    });
    return cleanup;
  }, []);

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

  const handleModeSelect = (mode: ThemeMode) => {
    applyThemeMode(mode);
    setCurrentMode(mode);
    setIsOpen(false);
  };

  const currentOption = themeOptions.find(o => o.id === currentMode) || themeOptions[0];

  const getIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'dark': return <Moon size={16} />;
      case 'light': return <Sun size={16} />;
      case 'system': return <Monitor size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)'
        }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-border-hover)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
        title={lang === 'cn' ? '切换主题' : 'Switch theme'}
      >
        {getIcon(currentMode)}
        <span className="text-xs hidden sm:inline">
          {currentOption.name[lang]}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--color-text-muted)' }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 bottom-full mb-2 w-48 rounded-xl shadow-xl z-[100] overflow-hidden"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div className="p-1.5">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleModeSelect(option.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left"
                style={{
                  backgroundColor: currentMode === option.id
                    ? 'var(--color-bg-hover)'
                    : 'transparent',
                  color: currentMode === option.id
                    ? 'var(--color-accent)'
                    : 'var(--color-text-primary)'
                }}
                onMouseOver={(e) => {
                  if (currentMode !== option.id) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentMode !== option.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span className="flex-shrink-0" style={{
                  color: currentMode === option.id
                    ? 'var(--color-accent)'
                    : 'var(--color-text-muted)'
                }}>
                  {getIcon(option.id)}
                </span>
                <span className="flex-1 text-sm font-medium">
                  {option.name[lang]}
                </span>
                {currentMode === option.id && (
                  <Check size={16} style={{ color: 'var(--color-accent)' }} />
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
