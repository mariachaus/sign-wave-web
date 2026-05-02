import React, { useState, useEffect } from 'react';
import ImitationExercise from './exercises/ImitationExercise';
import RecallExercise from './exercises/RecallExercise';
import MatchingExercise from './exercises/MatchingExercise';
import QuizExercise from './exercises/QuizExercise';
import TheorySlide from './exercises/TheorySlide';
import API_BASE_URL from "../config/api";

const LessonController = ({ lessonId, models, onLessonComplete }) => {
  const [lessonData, setLessonData] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    // Отримуємо план уроку з бекенда
    fetch(`${API_BASE_URL}/api/lessons/${lessonId}`)
      .then(res => res.json())
      .then(data => setLessonData(data));
  }, [lessonId]);

  if (!lessonData) return <div>Завантаження плану уроку...</div>;

  const currentStep = lessonData.steps[currentStepIdx];

  const handleStepSuccess = () => {
    if (currentStepIdx < lessonData.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      // Фініш уроку: відправляємо результат в public.user_lesson_progress
      onLessonComplete(lessonId);
    }
  };

  // Вибір компонента залежно від типу вправи в БД
  return (
    <div className="lesson-container">
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
        />
      )}
      
      {/* Додай інші типи за аналогією */}
    </div>
  );
};

export default LessonController;