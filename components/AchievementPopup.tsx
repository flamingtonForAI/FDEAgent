import React from 'react';
import { Language } from '../types';
import { Achievement } from '../hooks/useProgress';
import { X } from 'lucide-react';

interface Props {
  lang: Language;
  achievement: Achievement;
  onDismiss: () => void;
}

const AchievementPopup: React.FC<Props> = ({ lang, achievement, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <div className="glass-card rounded-xl p-4 pr-10 border-2 shadow-xl max-w-xs" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-bg-hover)' }}>
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-muted hover:text-primary transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div className="text-3xl">{achievement.icon}</div>
          <div>
            <div className="text-xs mb-0.5" style={{ color: 'var(--color-accent)' }}>
              {lang === 'cn' ? '成就解锁!' : 'Achievement Unlocked!'}
            </div>
            <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {achievement.title[lang]}
            </h4>
            <p className="text-xs text-muted mt-1">
              {achievement.description[lang]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPopup;
