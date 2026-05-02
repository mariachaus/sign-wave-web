import React, { useState, useEffect } from 'react';
import WebcamAnalyzer from './WebcamAnalyzer';
import { useTranslation } from 'react-i18next';

const RecallExercise = ({ gesture, onSuccess, models }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);

  // Обробка розпізнаного жесту
  const handleGestureDetected = (detectedLabel) => {
    // Якщо ШІ впізнав той жест, який ми загадали текстом
    if (detectedLabel === gesture.model_label) {
      setProgress(prev => Math.min(prev + 10, 100)); // Крок +10 для швидшої реакції
    }
  };

  useEffect(() => {
    if (progress >= 100) {
      // Можна додати невелику затримку перед успіхом, 
      // щоб юзер побачив повну зелену смужку
      const timer = setTimeout(() => onSuccess(), 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onSuccess]);

  return (
    <div style={containerStyle}>
      {/* Секція завдання */}
      <div style={taskSectionStyle}>
        <p style={instructionStyle}>{t('show_gesture_for')}:</p>
        <h2 style={wordStyle}>{gesture.name.toUpperCase()}</h2>
        
        {/* Підказка (можна зробити кнопку "Показати підказку", якщо юзер забув) */}
        <div style={hintPlaceholderStyle}>
           <small style={{ color: '#555' }}>{t('think_and_remember')}</small>
        </div>
      </div>

      {/* Секція камери */}
      <div style={cameraSectionStyle}>
        <WebcamAnalyzer 
          poseModel={models.video.pose} 
          handModel={models.video.hand}
          onGestureDetected={handleGestureDetected}
        />
        
        {/* Смужка прогресу */}
        <div style={progressWrapperStyle}>
          <div style={{ 
            ...progressBarStyle, 
            width: `${progress}%`,
            backgroundColor: progress === 100 ? '#00FF00' : '#FFD700' 
          }} />
        </div>
      </div>
    </div>
  );
};

// Стилі
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '30px',
  padding: '20px',
  color: 'white'
};

const taskSectionStyle = {
  textAlign: 'center',
  padding: '20px',
  backgroundColor: '#2a2a2a',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '640px'
};

const instructionStyle = { fontSize: '18px', color: '#888', marginBottom: '10px' };
const wordStyle = { fontSize: '48px', fontWeight: 'bold', margin: 0, letterSpacing: '2px' };
const hintPlaceholderStyle = { marginTop: '10px', height: '20px' };

const cameraSectionStyle = { position: 'relative', width: '100%', maxWidth: '640px' };

const progressWrapperStyle = {
  position: 'absolute',
  bottom: '80px', // Вище кнопок керування камерою
  left: '10%',
  width: '80%',
  height: '12px',
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderRadius: '10px',
  overflow: 'hidden',
  zIndex: 11
};

const progressBarStyle = {
  height: '100%',
  transition: 'width 0.3s ease, background-color 0.3s ease'
};

export default RecallExercise;