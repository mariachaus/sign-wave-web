import React from 'react';
import { useTranslation } from 'react-i18next';

const TheorySlide = ({ gesture, theoryText, onSuccess }) => {
  const { t } = useTranslation();

  return (
    <div className="theory-slide">
      <div className="theory-slide__card">
        <div className="theory-slide__visual">
          {gesture.illustration_url ? (
            <img src={gesture.illustration_url} alt="Theory" className="theory-slide__img" />
          ) : (
            <div className="theory-slide__placeholder">📖</div>
          )}
        </div>

        <div className="theory-slide__text">
          <h2 className="theory-slide__title">{gesture.name}</h2>
          <div className="theory-slide__divider" />
          <p className="theory-slide__desc">
            {theoryText || gesture.description || t('no_theory_available')}
          </p>
        </div>
      </div>

      <button className="exercise-btn exercise-btn--primary" onClick={onSuccess} style={{ marginTop: '40px' }}>
        {t('continue')} ➜
      </button>
    </div>
  );
};

export default TheorySlide;
