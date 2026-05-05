import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/components/AchievementPopup.scss';

const AchievementPopup = ({ achievements, onClose }) => {
  const { t } = useTranslation();
  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="achievement-popup-overlay" onClick={onClose}>
      <div className="achievement-popup" onClick={e => e.stopPropagation()}>
        <div className="achievement-popup__label">
          {t('achievement_unlocked') || 'Achievement Unlocked!'}
        </div>

        <div className="achievement-popup__icons">
          {achievements.map(a => (
            <div key={a.id} className="achievement-popup__icon">
              {a.icon_url
                ? <img src={a.icon_url} alt={a.title} onError={e => { e.target.style.display = 'none'; }} />
                : '🏆'}
            </div>
          ))}
        </div>

        <div className="achievement-popup__list">
          {achievements.map(a => (
            <div key={a.id} className="achievement-popup__item">
              <span className="achievement-popup__item-title">{a.title}</span>
              <span className="achievement-popup__item-xp">+{a.points_awarded} XP</span>
            </div>
          ))}
        </div>

        <button className="achievement-popup__btn" onClick={onClose}>
          {t('continue') || 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default AchievementPopup;
