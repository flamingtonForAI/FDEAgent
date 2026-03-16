import React, { useState } from 'react';
import { ProjectState } from '../types';
import { useProject } from '../contexts/ProjectContext';
import { useAppTranslation } from '../hooks/useAppTranslation';
import {
  GraduationCap, Package, MessageSquare, ArrowRight, Database, Zap, Link2,
  ClipboardList, CheckCircle2, FolderPlus, Rocket, Sparkles, Play,
  Target, Layers, Cpu, FileText, Users, ShoppingCart, Building2,
  ChevronRight, BookOpen, Lightbulb, MousePointerClick
} from 'lucide-react';
import NewProjectDialog from './NewProjectDialog';

type NavigableTab = 'projects' | 'academy' | 'archetypes' | 'scouting' | 'workbench' | 'ontology' | 'actionDesigner' | 'systemMap' | 'aiEnhancement' | 'overview';

interface QuickStartProps {
  project: ProjectState;
  onNavigate: (tab: NavigableTab) => void;
}


const QuickStart: React.FC<QuickStartProps> = ({ project, onNavigate }) => {
  const { t, lang } = useAppTranslation('nav');
  const { projects, activeProject, isInitialized } = useProject();
  const [showNewProject, setShowNewProject] = useState(false);
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);

  // Show loading state
  if (!isInitialized) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  const concepts = [
    { id: 'object', icon: <Database size={24} />, title: t('quickStart.conceptObject'), desc: t('quickStart.conceptObjectDesc'), color: '#3b82f6' },
    { id: 'action', icon: <Zap size={24} />, title: t('quickStart.conceptAction'), desc: t('quickStart.conceptActionDesc'), color: '#10b981' },
    { id: 'link', icon: <Link2 size={24} />, title: t('quickStart.conceptLink'), desc: t('quickStart.conceptLinkDesc'), color: '#f59e0b' },
    { id: 'ai', icon: <Sparkles size={24} />, title: t('quickStart.conceptAI'), desc: t('quickStart.conceptAIDesc'), color: '#8b5cf6' },
  ];

  const phases = [
    { num: 1, title: t('quickStart.phase1Title'), desc: t('quickStart.phase1Desc'), icon: <MessageSquare size={20} />, color: '#3b82f6' },
    { num: 2, title: t('quickStart.phase2Title'), desc: t('quickStart.phase2Desc'), icon: <ClipboardList size={20} />, color: '#8b5cf6' },
    { num: 3, title: t('quickStart.phase3Title'), desc: t('quickStart.phase3Desc'), icon: <Layers size={20} />, color: '#10b981' },
    { num: 4, title: t('quickStart.phase4Title'), desc: t('quickStart.phase4Desc'), icon: <Cpu size={20} />, color: '#f59e0b' },
  ];

  const examples = [
    { id: 'retail', icon: <ShoppingCart size={20} />, title: t('quickStart.exampleRetail'), desc: t('quickStart.exampleRetailDesc') },
    { id: 'manufacturing', icon: <Building2 size={20} />, title: t('quickStart.exampleManufacturing'), desc: t('quickStart.exampleManufacturingDesc') },
    { id: 'healthcare', icon: <Users size={20} />, title: t('quickStart.exampleHealthcare'), desc: t('quickStart.exampleHealthcareDesc') },
  ];

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <div
        className="relative py-16 px-8"
        style={{
          background: 'linear-gradient(135deg, var(--color-bg-surface) 0%, var(--color-bg-base) 100%)',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
          >
            <Rocket size={32} />
          </div>
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('quickStart.heroTitle')}
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {t('quickStart.heroSubtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12 space-y-16">

        {/* What is Ontology */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-accent)15', color: 'var(--color-accent)' }}
            >
              <Lightbulb size={20} />
            </div>
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t('quickStart.whatIsOntology')}
            </h2>
          </div>
          <p
            className="text-base leading-relaxed pl-13"
            style={{ color: 'var(--color-text-secondary)', paddingLeft: '52px' }}
          >
            {t('quickStart.ontologyDesc')}
          </p>
        </section>

        {/* Core Concepts - 4 cards */}
        <section>
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('quickStart.coreConceptsTitle')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {concepts.map(concept => (
              <div
                key={concept.id}
                className="p-5 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)'
                }}
                onClick={() => setExpandedConcept(expandedConcept === concept.id ? null : concept.id)}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${concept.color}15`, color: concept.color }}
                >
                  {concept.icon}
                </div>
                <h3
                  className="font-medium mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {concept.title}
                </h3>
                <p className="text-xs text-muted">{concept.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4-Phase Workflow */}
        <section>
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('quickStart.fourPhasesTitle')}
          </h2>
          <div className="relative">
            {/* Connection line */}
            <div
              className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {phases.map((phase, index) => (
                <div
                  key={phase.num}
                  className="relative p-5 rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {/* Phase number circle */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-4 relative z-10"
                    style={{ backgroundColor: phase.color, color: '#fff' }}
                  >
                    {phase.num}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: phase.color }}>{phase.icon}</span>
                    <h3
                      className="font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {phase.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Start Steps */}
        <section
          className="p-8 rounded-2xl"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)'
          }}
        >
          <h2
            className="text-xl font-semibold mb-6 text-center"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('quickStart.quickStartTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: 1, title: t('quickStart.step1Title'), desc: t('quickStart.step1Desc'), icon: <FolderPlus size={24} /> },
              { num: 2, title: t('quickStart.step2Title'), desc: t('quickStart.step2Desc'), icon: <MessageSquare size={24} /> },
              { num: 3, title: t('quickStart.step3Title'), desc: t('quickStart.step3Desc'), icon: <FileText size={24} /> },
            ].map((step, index) => (
              <div key={step.num} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
                >
                  {step.num}
                </div>
                <div>
                  <h3
                    className="font-medium mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Paths */}
        <section>
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('quickStart.pathsTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Beginner Path */}
            <button
              onClick={() => onNavigate('academy')}
              className="group p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '2px solid var(--color-info)'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-info)15', color: 'var(--color-info)' }}
              >
                <GraduationCap size={24} />
              </div>
              <h3
                className="font-medium mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t('quickStart.pathBeginner')}
              </h3>
              <p className="text-sm text-muted mb-4">{t('quickStart.pathBeginnerDesc')}</p>
              <div
                className="flex items-center gap-1 text-sm font-medium group-hover:translate-x-1 transition-transform"
                style={{ color: 'var(--color-info)' }}
              >
                {t('quickStart.pathBeginnerAction')}
                <ChevronRight size={16} />
              </div>
            </button>

            {/* Template Path */}
            <button
              onClick={() => onNavigate('archetypes')}
              className="group p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '2px solid var(--color-success)'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-success)15', color: 'var(--color-success)' }}
              >
                <Package size={24} />
              </div>
              <h3
                className="font-medium mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t('quickStart.pathTemplate')}
              </h3>
              <p className="text-sm text-muted mb-4">{t('quickStart.pathTemplateDesc')}</p>
              <div
                className="flex items-center gap-1 text-sm font-medium group-hover:translate-x-1 transition-transform"
                style={{ color: 'var(--color-success)' }}
              >
                {t('quickStart.pathTemplateAction')}
                <ChevronRight size={16} />
              </div>
            </button>

            {/* Direct Path */}
            <button
              onClick={() => setShowNewProject(true)}
              className="group p-6 rounded-xl text-left transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '2px solid var(--color-accent)'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-accent)15', color: 'var(--color-accent)' }}
              >
                <Rocket size={24} />
              </div>
              <h3
                className="font-medium mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {t('quickStart.pathDive')}
              </h3>
              <p className="text-sm text-muted mb-4">{t('quickStart.pathDiveDesc')}</p>
              <div
                className="flex items-center gap-1 text-sm font-medium group-hover:translate-x-1 transition-transform"
                style={{ color: 'var(--color-accent)' }}
              >
                {t('quickStart.pathDiveAction')}
                <ChevronRight size={16} />
              </div>
            </button>
          </div>
        </section>

        {/* Industry Examples */}
        <section>
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('quickStart.examplesTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {examples.map(example => (
              <div
                key={example.id}
                onClick={() => onNavigate('archetypes')}
                className="p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ color: 'var(--color-accent)' }}>{example.icon}</span>
                  <h3
                    className="font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {example.title}
                  </h3>
                </div>
                <p className="text-xs text-muted">{example.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tips */}
        <section
          className="p-6 rounded-xl"
          style={{
            backgroundColor: 'var(--color-warning)08',
            border: '1px solid var(--color-warning)30'
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={20} style={{ color: 'var(--color-warning)' }} />
            <h3
              className="font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {t('quickStart.tipsTitle')}
            </h3>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
              {t('quickStart.tip1')}
            </li>
            <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
              {t('quickStart.tip2')}
            </li>
            <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
              {t('quickStart.tip3')}
            </li>
          </ul>
        </section>

        {/* Final CTA */}
        <section
          className="text-center py-12 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent)10 0%, var(--color-accent)05 100%)',
            border: '1px solid var(--color-accent)30'
          }}
        >
          <h2
            className="text-2xl font-semibold mb-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('quickStart.ctaTitle')}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setShowNewProject(true)}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
            >
              {t('quickStart.ctaCreate')}
            </button>
            <button
              onClick={() => onNavigate('archetypes')}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            >
              {t('quickStart.ctaExplore')}
            </button>
            <button
              onClick={() => onNavigate('academy')}
              className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-accent)'
              }}
            >
              {t('quickStart.ctaLearn')} →
            </button>
          </div>
        </section>

        {/* Spacer for bottom chat bar */}
        <div className="h-24" />
      </div>

      {/* New Project Dialog */}
      {showNewProject && (
        <NewProjectDialog
          onClose={() => setShowNewProject(false)}
          onCreated={() => {
            setShowNewProject(false);
            onNavigate('scouting');
          }}
        />
      )}
    </div>
  );
};

export default QuickStart;
