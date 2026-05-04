import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AchievementItem from './AchievementItem';
import '../styles/pages/AchievementsPage.scss';

const AchievementsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_BASE_URL}/api/user/achievements`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setAchievements(res.data))
      .catch(err => console.error('Failed to load achievements:', err))
      .finally(() => setLoading(false));
  }, []);

  const earned = achievements.filter(a => a.earned);
  const unearned = achievements.filter(a => !a.earned);

  return (
    <div className="achievements-page">
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate('/profile')} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="page-header__title">{t('achievements')}</h2>
      </div>

      {loading ? (
        <div className="achievements-page__loading">{t('profile_loading')}</div>
      ) : (
        <>
          <p className="achievements-page__count">
            {earned.length} / {achievements.length} {t('earned')}
          </p>

          {earned.length > 0 && (
            <div className="achievements-page__grid">
              {earned.map(ach => (
                <AchievementItem key={ach.id} achievement={ach} />
              ))}
            </div>
          )}

          {unearned.length > 0 && (
            <>
              <p className="achievements-page__section-label">{t('locked_achievements')}</p>
              <div className="achievements-page__grid achievements-page__grid--locked">
                {unearned.map(ach => (
                  <AchievementItem key={ach.id} achievement={ach} locked />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AchievementsPage;
