import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/components/LessonResultPopup.scss';

const LessonResultPopup = ({ xpEarned, currentStreak, heartsRemaining, onClose }) => {
  const { t } = useTranslation();
  const flawless = heartsRemaining >= 5;

  return (
    <div className="lesson-result-overlay" onClick={onClose}>
      <div className="lesson-result" onClick={e => e.stopPropagation()}>

        <div className="lesson-result__icon">✓</div>
        <h2 className="lesson-result__title">{t('lesson_complete')}</h2>

        {xpEarned > 0 && (
          <div className="lesson-result__stats">
            <div className="lesson-result__stat">
              <span className="lesson-result__stat-icon">⚡</span>
              <span className="lesson-result__stat-value">+{xpEarned}</span>
              <span className="lesson-result__stat-label">XP</span>
            </div>
          </div>
        )}
        {flawless && (
          <div className="lesson-result__flawless">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{t('flawless') || 'Flawless'}</span>
          </div>
        )}

        <button className="lesson-result__btn" onClick={onClose}>
          {t('continue') || 'Continue'}
        </button>

      </div>
    </div>
  );
};

export default LessonResultPopup;
