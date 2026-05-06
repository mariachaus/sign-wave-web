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

        <div className="lesson-result__stats">
          {xpEarned > 0 && (
            <div className="lesson-result__stat">
              <span className="lesson-result__stat-icon">⚡</span>
              <span className="lesson-result__stat-value">+{xpEarned}</span>
              <span className="lesson-result__stat-label">XP</span>
            </div>
          )}
          <div className="lesson-result__stat">
            <span className="lesson-result__stat-icon">🔥</span>
            <span className="lesson-result__stat-value">{currentStreak}</span>
            <span className="lesson-result__stat-label">{t('days_count') || 'days'}</span>
          </div>
          {flawless && (
            <div className="lesson-result__stat lesson-result__stat--gold">
              <span className="lesson-result__stat-icon">💛</span>
              <span className="lesson-result__stat-value">{t('flawless') || 'Flawless'}</span>
            </div>
          )}
        </div>

        <button className="lesson-result__btn" onClick={onClose}>
          {t('continue') || 'Continue'}
        </button>

      </div>
    </div>
  );
};

export default LessonResultPopup;
