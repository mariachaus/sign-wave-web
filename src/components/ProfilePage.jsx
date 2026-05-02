import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../config/api";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import defaultAvatar from "../assets/default-avatar.jpg";
import AchievementItem from './AchievementItem';
import '../styles/pages/ProfilePage.scss';

const ProfilePage = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userId = token?.split('-').pop();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/auth'); return; }

        const res = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          params: { user_id: userId },
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error loading user profile", err);
        if (err.response?.status === 401 || err.response?.status === 404) {
          localStorage.removeItem('token');
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, userId]);

  if (loading) return (
    <div className="profile-state">{t('profile_loading')}</div>
  );

  if (!profile) return (
    <div className="profile-state">
      <h2>{t('user_not_found')}</h2>
      <p>{t('session_error')}</p>
      <button
        className="btn-primary"
        onClick={() => { localStorage.removeItem('token'); navigate('/auth'); }}
      >
        {t('go_to_login')}
      </button>
    </div>
  );

  const avatarImage = profile.avatar_url || defaultAvatar;

  return (
    <div className="profile-page">
      <div className="profile-back-btn">
        <button className="gestures-page__back" onClick={() => navigate('/')} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2>{t('back_to_dashboard')}</h2>
      </div>

      <div className="profile-header">
        <div className="avatar-wrapper">
          <img
            src={avatarImage}
            alt="User Avatar"
            onError={(e) => { e.target.src = defaultAvatar; }}
          />
        </div>
        <div className="profile-info">
          <h2>{profile.username}</h2>
          <p>{t('joined')} {profile.joined_at}</p>
        </div>
        <div className="settings-icon" onClick={() => navigate('/settings')}>⚙️</div>
      </div>

      <div className="streak-grid">
        <div className="stat-card">
          <div className="stat-card__value">{profile.current_streak} {t('days_count')}</div>
          <div className="stat-card__label">{t('current_streak')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{profile.longest_streak} {t('days_count')}</div>
          <div className="stat-card__label">{t('longest_streak')}</div>
        </div>
      </div>

      <h3 className="section-title">{t('stats')}</h3>
      <div className="stats-grid">
        {[
          { label: t('errors_made'),     value: profile.stats.errors_made },
          { label: t('errors_corrected'), value: profile.stats.errors_corrected },
          { label: t('xp_earned'),       value: profile.total_xp },
          { label: t('signs_learned'),   value: profile.stats.signs_learned },
        ].map((stat, i) => (
          <div key={i} className="stat-box">
            <div className="stat-box__value">{stat.value}</div>
            <div className="stat-box__label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="achievements-header">
        <h3>{t('achievements')}</h3>
        <span className="view-all-link">{t('view_all')}</span>
      </div>

      <div className="badges-row">
        {profile.achievements?.length > 0
          ? profile.achievements.map((ach) => <AchievementItem key={ach.id} achievement={ach} />)
          : <p className="empty-state">{t('no_achievements')}</p>
        }
      </div>
    </div>
  );
};

export default ProfilePage;
