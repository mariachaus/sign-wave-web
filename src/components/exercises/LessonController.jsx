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

  const handleError = () => {
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
      onLessonComplete(lessonId, hearts);
    }
  };

  const progress = Math.round(((currentStepIdx + 1) / steps.length) * 100);

  return (
    <div className="lesson-ctrl">
      <div className="lesson-ctrl__topbar">
        <div className="lesson-ctrl__hearts">
          {Array.from({ length: HEARTS_MAX }).map((_, i) => (
            <span key={i} className={`lesson-ctrl__heart${i < hearts ? ' lesson-ctrl__heart--active' : ''}`}>
              ♥
            </span>
          ))}
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
