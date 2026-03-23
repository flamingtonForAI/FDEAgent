import React from 'react';
import { WorkflowTab } from '../lib/navigation';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useAuth } from '../contexts/AuthContext';
import { UserMenu } from './auth';
import {
  MessageSquare, Database, Network, Settings as SettingsIcon, Sparkles,
  BrainCircuit, GraduationCap, Package, Rocket, LogIn, FolderOpen, CreditCard,
} from 'lucide-react';

interface PhaseReadiness {
  p2: { sublabel?: string };
  p3: { sublabel?: string; sublabelColor?: string };
  p4: { sublabel?: string; sublabelColor?: string };
  p5: { sublabel?: string; sublabelColor?: string };
}

interface SidebarProps {
  activeTab: WorkflowTab | 'archetypeViewer';
  setActiveTab: (tab: any) => void;
  activeProjectId: string | null;
  hasObjects: boolean;
  phaseReadiness: PhaseReadiness;
  activeProviderApiKey: string | undefined;
  getCurrentModelName: () => string;
  onOpenSettings: () => void;
  onOpenAuthModal: () => void;
  onResetArchetype: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, activeProjectId, hasObjects,
  phaseReadiness, activeProviderApiKey, getCurrentModelName,
  onOpenSettings, onOpenAuthModal, onResetArchetype,
}) => {
  const { t, lang } = useAppTranslation('nav');
  const { isAuthenticated } = useAuth();

  return (
    <aside className="w-64 glass-surface flex flex-col" style={{ borderRight: '1px solid var(--color-border)' }}>
      <div className="p-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-base)' }}>
            <Sparkles size={14} />
          </div>
          <h1 className="font-medium tracking-tight text-sm" style={{ color: 'var(--color-text-primary)' }}>{t('app.title')}</h1>
        </div>
        <p className="text-[11px] text-muted tracking-wider uppercase" style={{ fontWeight: 400 }}>{t('app.subtitle')}</p>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <NavSection label={t('app.sectionGettingStarted')} />
        <NavItem active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={<FolderOpen size={16} />} label={t('app.projects')} />
        <NavItem active={activeTab === 'quickStart'} onClick={() => setActiveTab('quickStart')} icon={<Rocket size={16} />} label={t('app.quickStart')} />

        <NavSection label={t('app.sectionCoreWorkflow')} />
        <NavItem active={activeTab === 'scouting'} onClick={() => setActiveTab('scouting')} icon={<MessageSquare size={16} />} label={t('app.phase1')} sublabel={t('app.phase1Desc')} disabled={!activeProjectId} />
        <NavItem active={activeTab === 'workbench' || activeTab === 'ontology' || activeTab === 'actionDesigner'} onClick={() => setActiveTab('workbench')} icon={<Database size={16} />} label={t('app.phase2')} sublabel={phaseReadiness.p2.sublabel || t('app.phase2Desc')} disabled={!activeProjectId} />
        <NavItem active={activeTab === 'systemMap' || activeTab === 'overview'} onClick={() => setActiveTab('systemMap')} icon={<Network size={16} />} label={t('app.phase3')} sublabel={phaseReadiness.p3.sublabel || t('app.phase3Desc')} sublabelColor={phaseReadiness.p3.sublabelColor} disabled={!activeProjectId || !hasObjects} />
        <NavItem active={activeTab === 'aiEnhancement' || activeTab === 'aip'} onClick={() => setActiveTab('aiEnhancement')} icon={<BrainCircuit size={16} />} label={t('app.phase4')} sublabel={phaseReadiness.p4.sublabel || t('app.phase4Desc')} sublabelColor={phaseReadiness.p4.sublabelColor} disabled={!activeProjectId || !hasObjects} />
        <NavItem active={activeTab === 'deliver'} onClick={() => setActiveTab('deliver')} icon={<Package size={16} />} label={t('app.phase5')} sublabel={phaseReadiness.p5.sublabel || t('app.phase5Desc')} sublabelColor={phaseReadiness.p5.sublabelColor} disabled={!activeProjectId || !hasObjects} />

        <NavSection label={t('app.sectionResources')} />
        <NavItem active={activeTab === 'academy'} onClick={() => setActiveTab('academy')} icon={<GraduationCap size={16} />} label={t('app.academy')} />
        <NavItem active={activeTab === 'archetypes' || activeTab === 'archetypeViewer'} onClick={() => { setActiveTab('archetypes'); onResetArchetype(); }} icon={<Package size={16} />} label={t('app.archetypes')} />
        <NavItem active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')} icon={<CreditCard size={16} />} label={t('app.pricing')} />
      </nav>

      <div className="p-3 space-y-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
        {isAuthenticated ? (
          <UserMenu lang={lang} />
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2.5">
              <LogIn size={15} />
              <span>{t('app.signIn')}</span>
            </div>
            <span className="text-xs" style={{ color: 'var(--color-accent)' }}>{t('app.cloudSync')}</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <div className="flex items-center gap-2">
            <SettingsIcon size={14} />
            <span>{t('app.settings')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs truncate max-w-[80px]" style={{ color: 'var(--color-accent)' }}>{getCurrentModelName()}</span>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeProviderApiKey ? 'var(--color-success)' : 'var(--color-warning)' }} />
          </div>
        </button>
      </div>
    </aside>
  );
};

const NavSection: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-3 pt-4 pb-2 first:pt-0">
    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
  </div>
);

const NavItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  sublabelColor?: string;
  disabled?: boolean;
}> = ({ active, onClick, icon, label, sublabel, sublabelColor, disabled }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
      disabled ? 'opacity-50 cursor-not-allowed' : active ? '' : 'text-muted hover:text-primary'
    }`}
    style={disabled ? undefined : active ? { color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-hover)', fontWeight: 500 } : undefined}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
    )}
    {icon}
    <div className="flex flex-col items-start flex-1">
      <span>{label}</span>
      {sublabel && (
        <span className="text-[10px] font-normal" style={{ color: sublabelColor || 'var(--color-text-muted)' }}>{sublabel}</span>
      )}
    </div>
  </button>
);
