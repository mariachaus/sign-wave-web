import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TheorySlide from './TheorySlide';
import ImitationExercise from './ImitationExercise';
import QuizExercise from './QuizExercise';
import MatchingExercise from './MatchingExercise';
import RecallExercise from './RecallExercise';
import API_BASE_URL from '../../config/api';
import '../../styles/pages/Exercises.scss';

const HEARTS_MAX = 5;

const LessonController = ({ lessonId, models, onLessonComplete, onLessonFailed, startUrl }) => {
  const { t, i18n } = useTranslation();
  const token = localStorage.getItem('token');

  const [lessonData, setLessonData] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hearts, setHearts] = useState(HEARTS_MAX);
  const [failed, setFailed] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const lang = i18n.language || 'uk';
    const url = startUrl
      ? `${startUrl}?lang=${lang}`
      : `${API_BASE_URL}/api/lessons/${lessonId}/start?lang=${lang}`;
    setLoading(true);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => { setLessonData(data); setLoading(false); })
      .catch(err => { console.error('Failed to load lesson:', err); setError(err.message); setLoading(false); });
  }, [lessonId, token, i18n.language]);

  const handleError = (errorDetail) => {
    if (errorDetail?.gesture_id != null) setErrors(prev => [...prev, errorDetail]);
    setHearts(prev => {
      const next = prev - 1;
      if (next <= 0) setFailed(true);
      return Math.max(0, next);
    });
  };

  if (loading) return <div className="lesson-ctrl__center">Завантаження уроку...</div>;
  if (error)   return <div className="lesson-ctrl__center">Помилка: {error}</div>;
  if (!lessonData?.steps?.length) return <div className="lesson-ctrl__center">Урок не містить вправ.</div>;

  if (failed) {
    return (
      <div className="lesson-ctrl__failed">
        <div className="lesson-ctrl__failed-icon">💔</div>
        <h2>{t('lesson_failed')}</h2>
        <p>{t('hearts_run_out')}</p>
        <button className="exercise-btn exercise-btn--primary" onClick={onLessonFailed}>
          {t('try_again')}
        </button>
      </div>
    );
  }

  const steps = lessonData.steps;
  const currentStep = steps[currentStepIdx];

  const handleStepSuccess = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      onLessonComplete(lessonId, hearts, errors);
    }
  };

  const progress = Math.round(((currentStepIdx + 1) / steps.length) * 100);

  return (
    <div className="lesson-ctrl">
      <div className="lesson-ctrl__topbar">
        <div className="lesson-ctrl__hearts">
          {Array.from({ length: HEARTS_MAX }).map((_, i) =>
            i < hearts ? (
              <svg key={i} className="lesson-ctrl__heart lesson-ctrl__heart--active" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            ) : (
              <svg key={i} className="lesson-ctrl__heart" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
              </svg>
            )
          )}
        </div>
        <span className="lesson-ctrl__step-label">{currentStepIdx + 1} / {steps.length}</span>
      </div>

      <div className="lesson-ctrl__progress-track">
        <div className="lesson-ctrl__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {currentStep.type === 'theory' && (
        <TheorySlide
          gesture={currentStep.gesture}
          theoryText={currentStep.content}
          onSuccess={handleStepSuccess}
        />
      )}

      {currentStep.type === 'imitation' && (
        <ImitationExercise
          gesture={currentStep.gesture}
          models={models}
          onSuccess={handleStepSuccess}
        />
      )}

      {currentStep.type === 'quiz' && (
        <QuizExercise
          targetGesture={currentStep.target}
          allGestures={currentStep.options}
          mode={currentStep.mode}
          onSuccess={handleStepSuccess}
          onError={handleError}
        />
      )}

      {currentStep.type === 'matching' && (
        <MatchingExercise
          gestures={currentStep.gestures}
          onSuccess={handleStepSuccess}
          onError={handleError}
        />
      )}

      {currentStep.type === 'recall' && (
        <RecallExercise
          gesture={currentStep.gesture}
          models={models}
          onSuccess={handleStepSuccess}
        />
      )}
    </div>
  );
};

export default LessonController;
