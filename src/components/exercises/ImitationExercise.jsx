import React, { useState, useEffect } from 'react';
import WebcamAnalyzer from '../WebcamAnalyzer';

const ImitationExercise = ({ gesture, onSuccess, models }) => {
  const [progress, setProgress] = useState(0);

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
    </div>
  );
};

export default ImitationExercise;
