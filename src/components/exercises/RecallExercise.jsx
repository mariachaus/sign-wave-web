import React, { useState, useEffect } from 'react';
import WebcamAnalyzer from '../WebcamAnalyzer';
import { useTranslation } from 'react-i18next';

const RecallExercise = ({ gesture, onSuccess, models }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);

  const handleGestureDetected = (detectedLabel) => {
    if (detectedLabel === gesture.model_label) {
      setProgress(prev => Math.min(prev + 10, 100));
    }
  };

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => onSuccess(), 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onSuccess]);

  return (
    <div className="recall-exercise">
      <div className="recall-exercise__task">
        <p className="exercise-instruction">{t('show_gesture_for')}:</p>
        <h2 className="recall-exercise__word">{gesture.name.toUpperCase()}</h2>
        <div className="recall-exercise__hint">
          <small>{t('think_and_remember')}</small>
        </div>
      </div>

      <div className="recall-exercise__camera">
        <WebcamAnalyzer
          poseModel={models.video.pose}
          handModel={models.video.hand}
          onGestureDetected={handleGestureDetected}
        />
        <div className="recall-exercise__progress-wrap">
          <div
            className={`recall-exercise__progress-fill${progress >= 100 ? ' recall-exercise__progress-fill--done' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default RecallExercise;
