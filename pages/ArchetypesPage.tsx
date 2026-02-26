import React from 'react';
import ArchetypeBrowser from '../components/ArchetypeBrowser';
import type { Language, AISettings } from '../types';

interface ArchetypesPageProps {
  lang: Language;
  aiSettings: AISettings;
  onSelectArchetype: (archetypeId: string) => void;
  onApplyArchetype: (archetypeId: string, skipConfirm?: boolean) => void;
}

/**
 * 行业模板库页面
 * 浏览和应用预置行业模板
 */
export const ArchetypesPage: React.FC<ArchetypesPageProps> = ({ 
  lang, 
  aiSettings, 
  onSelectArchetype, 
  onApplyArchetype 
}) => (
  <ArchetypeBrowser
    lang={lang}
    aiSettings={aiSettings}
    onSelectArchetype={onSelectArchetype}
    onApplyArchetype={onApplyArchetype}
  />
);
