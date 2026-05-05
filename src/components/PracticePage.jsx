import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LessonController from './exercises/LessonController';
import AchievementPopup from './AchievementPopup';
import API_BASE_URL from '../config/api';
import '../styles/pages/LessonPage.scss';

const PracticePage = ({ models }) => {
  const { gestureId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [done, setDone] = useState(false);
  const [practiceKey, setPracticeKey] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/lessons/practice/${gestureId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.new_achievements?.length > 0) {
        setNewAchievements(data.new_achievements);
        return;
      }
    } catch (err) {
      console.error('Failed to complete practice:', err);
    }
    setDone(true);
  };

  if (newAchievements.length > 0) {
    return (
      <>
        <div className="lesson-page lesson-page--center">
          <div className="lesson-complete">
            <div className="lesson-complete__icon">✓</div>
            <h2 className="lesson-complete__title">{t('practice_complete')}</h2>
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
          <h2 className="lesson-complete__title">{t('practice_complete')}</h2>
          <button className="lesson-page__primary-btn" onClick={() => navigate(-1)}>
            {t('back_to_dashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-page lesson-page--exercise">
      <button className="lesson-exit-btn" onClick={() => navigate(-1)} title={t('exit_lesson')}>
        ✕
      </button>

      <LessonController
        key={practiceKey}
        startUrl={`${API_BASE_URL}/api/lessons/practice/${gestureId}`}
        models={models}
        onLessonComplete={handleComplete}
        onLessonFailed={() => setPracticeKey(k => k + 1)}
      />
    </div>
  );
};

export default PracticePage;
