import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WebcamAnalyzer from '../WebcamAnalyzer';

const SKIP_DELAY_MS = 15000;

const ImitationExercise = ({ gesture, onSuccess, models }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), SKIP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

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
