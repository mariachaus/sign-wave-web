import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LessonController from './exercises/LessonController';
import AchievementPopup from './AchievementPopup';
import LessonResultPopup from './LessonResultPopup';
import ConfirmModal from './ConfirmModal';
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
  const [result, setResult] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (done) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [done]);

  const handleExit = () => setShowExitConfirm(true);

  const handleLessonComplete = async (lessonId, heartsRemaining = 0, errors = []) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: 100, errors, hearts_remaining: heartsRemaining }),
      });
      const data = await res.json();
      setResult({
        xpEarned: data.streak_xp ?? 0,
        currentStreak: data.current_streak ?? 0,
        heartsRemaining,
        achievements: data.new_achievements ?? [],
      });
    } catch (err) {
      console.error('Failed to save lesson completion:', err);
      setDone(true);
    }
  };

  // 1. Показуємо результат уроку
  if (result && newAchievements.length === 0) {
    return (
      <>
        <div className="lesson-page lesson-page--center" />
        <LessonResultPopup
          xpEarned={result.xpEarned}
          currentStreak={result.currentStreak}
          heartsRemaining={result.heartsRemaining}
          onClose={() => {
            if (result.achievements.length > 0) {
              setNewAchievements(result.achievements);
            } else {
              setResult(null);
              setDone(true);
            }
          }}
        />
      </>
    );
  }

  // 2. Потім досягнення
  if (newAchievements.length > 0) {
    return (
      <>
        <div className="lesson-page lesson-page--center" />
        <AchievementPopup
          achievements={newAchievements}
          onClose={() => { setNewAchievements([]); setResult(null); setDone(true); }}
        />
      </>
    );
  }

  // 3. Екран завершення з кнопкою
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
      <button className="lesson-exit-btn" onClick={handleExit} title={t('exit_lesson')}>
        ✕
      </button>

      {showExitConfirm && (
        <ConfirmModal
          message={t('exit_lesson_confirm')}
          confirmLabel={t('exit') || 'Exit'}
          cancelLabel={t('cancel') || 'Cancel'}
          onConfirm={() => navigate('/learn')}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}

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
