import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import WebcamAnalyzer from '../WebcamAnalyzer';
import { IconInfo } from '../Icons';

const SKIP_DELAY_MS = 15000;

const ImitationExercise = ({ gesture, onSuccess, models }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const tipsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), SKIP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showTips) return;
    const handler = (e) => {
      if (tipsRef.current && !tipsRef.current.contains(e.target)) setShowTips(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTips]);

  const handleGestureDetected = (detectedLabel) => {
    if (detectedLabel === gesture.model_label) {
      setProgress(prev => Math.min(prev + 5, 100));
    }
  };

  useEffect(() => {
    if (progress >= 100) onSuccess();
  }, [progress, onSuccess]);

  return (
    <div className="imitation-exercise">
      <div className="imitation-exercise__target">
        <h3 className="imitation-exercise__name">{gesture.name}</h3>
        <img src={gesture.illustration_url} alt="Reference" className="imitation-exercise__img" />
      </div>

      <div className="imitation-exercise__camera">
        <div className="imitation-exercise__tips-wrap" ref={tipsRef}>
          <button
            className="imitation-exercise__tips-btn"
            onClick={() => setShowTips(v => !v)}
            aria-label={t('detection_tips_title')}
          >
            <IconInfo size={16} />
          </button>
          {showTips && (
            <div className="imitation-exercise__tips-popup">
              <p className="imitation-exercise__tips-title">{t('detection_tips_title')}</p>
              <ul className="imitation-exercise__tips-list">
                <li>{t('detection_tip_lighting')}</li>
                <li>{t('detection_tip_clothing')}</li>
                <li>{t('detection_tip_backlight')}</li>
              </ul>
            </div>
          )}
        </div>

        <WebcamAnalyzer
          poseModel={models.video.pose}
          handModel={models.video.hand}
          onGestureDetected={handleGestureDetected}
        />
        <div className="imitation-exercise__progress-wrap">
          <div className="imitation-exercise__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {showSkip && (
        <button className="exercise-btn exercise-btn--skip" onClick={onSuccess}>
          {t('skip_gesture')}
        </button>
      )}
    </div>
  );
};

export default ImitationExercise;
