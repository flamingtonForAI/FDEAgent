import React from 'react';
import { ProjectState } from '../types';
import QualityPanel from './QualityPanel';
import ReadinessPanel from './ReadinessPanel';
import { Compass, X, ShieldCheck } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface ReviewPanelProps {
  project: ProjectState;
  reviewTab: 'quality' | 'readiness';
  setReviewTab: (tab: 'quality' | 'readiness') => void;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const ReviewPanel: React.FC<ReviewPanelProps> = ({
  project, reviewTab, setReviewTab, onClose, onNavigate,
}) => {
  const { t } = useAppTranslation('nav');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-[var(--color-bg-base)]/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg h-full glass-surface animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
              <Compass size={20} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('review')}</h3>
              <p className="text-xs text-muted">{t('reviewSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setReviewTab('quality')}
            className="px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{ color: reviewTab === 'quality' ? 'var(--color-success)' : 'var(--color-text-muted)' }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} />
              {t('quality')}
            </div>
            {reviewTab === 'quality' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-success)' }} />
            )}
          </button>
          <button
            onClick={() => setReviewTab('readiness')}
            className="px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{ color: reviewTab === 'readiness' ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
          >
            <div className="flex items-center gap-2">
              <Compass size={14} />
              {t('readiness')}
            </div>
            {reviewTab === 'readiness' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--color-accent)' }} />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {reviewTab === 'quality' ? (
            <QualityPanel project={project} onNavigate={onNavigate} />
          ) : (
            <ReadinessPanel project={project} onNavigate={onNavigate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPanel;
