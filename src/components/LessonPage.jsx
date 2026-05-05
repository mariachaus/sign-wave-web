import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LessonController from './exercises/LessonController';
import AchievementPopup from './AchievementPopup';
import API_BASE_URL from '../config/api';
import '../styles/pages/LessonPage.scss';

const LessonPage = ({ models }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = localStorage.getItem('token');

  const [done, setDone] = useState(false);
  const [lessonKey, setLessonKey] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);

  // Попереджаємо при закритті вкладки / оновленні сторінки
  useEffect(() => {
    if (done) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [done]);

  const handleExit = () => {
    if (window.confirm(t('exit_lesson_confirm'))) {
      navigate('/learn');
    }
  };

  const handleLessonComplete = async (lessonId, heartsRemaining = 0) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: 100, errors: [], hearts_remaining: heartsRemaining }),
      });
      const data = await res.json();
      if (data.new_achievements?.length > 0) {
        setNewAchievements(data.new_achievements);
        return;
      }
    } catch (err) {
      console.error('Failed to save lesson completion:', err);
    }
    setDone(true);
  };

  if (newAchievements.length > 0) {
    return (
      <>
        <div className="lesson-page lesson-page--center">
          <div className="lesson-complete">
            <div className="lesson-complete__icon">✓</div>
            <h2 className="lesson-complete__title">{t('lesson_complete')}</h2>
          </div>
        </div>
        <AchievementPopup
          achievements={newAchievements}
          onClose={() => { setNewAchievements([]); setDone(true); }}
        />
      </>
    );
  }

  if (done) {
    return (
      <div className="lesson-page lesson-page--center">
        <div className="lesson-complete">
          <div className="lesson-complete__icon">✓</div>
          <h2 className="lesson-complete__title">{t('lesson_complete')}</h2>
          <button className="lesson-page__primary-btn" onClick={() => navigate('/learn')}>
            {t('back_to_lessons')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-page lesson-page--exercise">
      {/* Кнопка виходу з уроку */}
      <button className="lesson-exit-btn" onClick={handleExit} title={t('exit_lesson')}>
        ✕
      </button>

      <LessonController
        key={lessonKey}
        lessonId={parseInt(id)}
        models={models}
        onLessonComplete={handleLessonComplete}
        onLessonFailed={() => setLessonKey(k => k + 1)}
      />
    </div>
  );
};

export default LessonPage;
