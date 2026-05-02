import React, { useState, useEffect } from 'react';
import WebcamAnalyzer from './WebcamAnalyzer';

const ImitationExercise = ({ gesture, onSuccess, models }) => {
  const [progress, setProgress] = useState(0);

  // Функція, яку викличе WebcamAnalyzer, коли знайде жест
  const handleGestureDetected = (detectedLabel) => {
    if (detectedLabel === gesture.model_label) {
      setProgress(prev => Math.min(prev + 5, 100)); // Збільшуємо прогрес
    }
  };

  useEffect(() => {
    if (progress >= 100) {
      onSuccess(); // Перехід до наступного завдання
    }
  }, [progress, onSuccess]);

  return (
    <div style={exerciseLayout}>
      <div className="target-side">
        <h3>{gesture.name}</h3>
        <img src={gesture.illustration_url} alt="Reference" style={imgStyle} />
      </div>

      <div className="camera-side" style={{ position: 'relative' }}>
        <WebcamAnalyzer 
          poseModel={models.video.pose} 
          handModel={models.video.hand}
          onGestureDetected={handleGestureDetected}
        />
        {/* Прогрес-бар поверх камери */}
        <div style={{
          position: 'absolute', bottom: 20, left: '10%', width: '80%',
          height: 10, bg: '#333', borderRadius: 5
        }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#00FF00', transition: '0.1s' }} />
        </div>
      </div>
    </div>
  );
};

const exerciseLayout = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' };
const imgStyle = { width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '15px' };

export default ImitationExercise;