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
      <div className="glass-card rounded-xl p-4 pr-10 border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 shadow-xl shadow-yellow-500/10 max-w-xs">
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div className="text-3xl">{achievement.icon}</div>
          <div>
            <div className="text-xs text-yellow-400 mb-0.5">
              {lang === 'cn' ? '成就解锁!' : 'Achievement Unlocked!'}
            </div>
            <h4 className="text-white font-medium">
              {achievement.title[lang]}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {achievement.description[lang]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPopup;
