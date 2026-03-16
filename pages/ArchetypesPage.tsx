import React from 'react';
import ArchetypeBrowser from '../components/ArchetypeBrowser';
import type { AISettings } from '../types';

interface ArchetypesPageProps {
  aiSettings: AISettings;
  onSelectArchetype: (archetypeId: string) => void;
  onApplyArchetype: (archetypeId: string, skipConfirm?: boolean) => void;
}

/**
 * 行业模板库页面
 * 浏览和应用预置行业模板
 */
export const ArchetypesPage: React.FC<ArchetypesPageProps> = ({
  aiSettings,
  onSelectArchetype,
  onApplyArchetype
}) => (
  <ArchetypeBrowser
    aiSettings={aiSettings}
    onSelectArchetype={onSelectArchetype}
    onApplyArchetype={onApplyArchetype}
  />
);

export default ArchetypesPage;
