import React from 'react';
import ChatMessagesPanel from '../components/ChatMessagesPanel';
import type { ProjectState, ChatMessage, Language } from '../types';

interface ScoutingPageProps {
  lang: Language;
  messages: ChatMessage[];
  project: ProjectState;
  isLoading: boolean;
  hasApiKey: boolean;
  onDesignTrigger: () => void;
  onOpenSettings: () => void;
}

/**
 * 需求勘察页面 (Phase 1: Discovery)
 * 对话式需求收集，AI 引导识别 Objects & Actions
 */
export const ScoutingPage: React.FC<ScoutingPageProps> = ({
  lang,
  messages,
  project,
  isLoading,
  hasApiKey,
  onDesignTrigger,
  onOpenSettings,
}) => (
  <ChatMessagesPanel
    lang={lang}
    messages={messages}
    project={project}
    isLoading={isLoading}
    hasApiKey={hasApiKey}
    onDesignTrigger={onDesignTrigger}
    onOpenSettings={onOpenSettings}
  />
);
