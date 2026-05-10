import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../config/api";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import defaultAvatar from "../assets/default-avatar.jpg";
import AchievementItem from './AchievementItem';
import StreakCalendar from './StreakCalendar';
import '../styles/pages/ProfilePage.scss';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const ProfilePage = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);

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

  if (loading) return <div className="profile-state">{t('profile_loading')}</div>;

  if (!profile) return (
    <div className="profile-state">
      <h2>{t('user_not_found')}</h2>
      <p>{t('session_error')}</p>
      <button className="profile-state__btn"
        onClick={() => { localStorage.removeItem('token'); navigate('/auth'); }}>
        {t('go_to_login')}
      </button>
    </div>
  );

  const avatarImage = profile.avatar_url || defaultAvatar;

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_BASE_URL}/api/user/upload-avatar`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setProfile(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload failed');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const stats = [
    { icon: '🔥', value: profile.current_streak, unit: t('days_count'), label: t('current_streak') },
    { icon: '⚡', value: profile.longest_streak,  unit: t('days_count'), label: t('longest_streak') },
    { icon: '✋', value: profile.stats?.signs_learned ?? 0, label: t('signs_learned') },
    { icon: '⭐', value: profile.total_xp,                  label: t('xp_earned') },
  ];

  const allAchievements      = profile.achievements ?? [];
  const earnedAchievements   = allAchievements.filter(a => a.earned !== false);
  const unearnedAchievements = allAchievements.filter(a => a.earned === false);

  return (
    <div className="profile-page">

      {/* ── Page header ── */}
      <div className="profile-topbar">
        <button className="profile-topbar__back" onClick={() => navigate('/')} aria-label="Go back">
          <BackIcon />
        </button>
        <h1 className="profile-topbar__title">{t('profile')}</h1>
        <button className="profile-topbar__settings" onClick={() => navigate('/settings')} aria-label="Settings">
          <SettingsIcon />
        </button>
      </div>

      {/* ── User card ── */}
      <div className="profile-user-card">
        <div
          className={`profile-user-card__avatar ${avatarUploading ? 'profile-user-card__avatar--uploading' : ''}`}
          onClick={handleAvatarClick}
          title="Change avatar"
        >
          <img src={avatarImage} alt="avatar" onError={e => { e.target.src = defaultAvatar; }} />
          <div className="profile-user-card__avatar-overlay">
            {avatarUploading
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            }
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>
        <div className="profile-user-card__info">
          <h2 className="profile-user-card__name">{profile.username}</h2>
          <p className="profile-user-card__joined">{t('joined')} {profile.joined_at}</p>
        </div>
        <button className="profile-edit-btn" onClick={() => navigate('/settings', { state: { tab: 'personal' } })}>
          <EditIcon /> {t('edit') || 'Edit'}
        </button>
      </div>

      {/* ── Stats 2×2 ── */}
      <div className="profile-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="profile-stat-card">
            <div className="profile-stat-card__icon">{s.icon}</div>
            <div className="profile-stat-card__value">
              {s.value}{s.unit ? <span className="profile-stat-card__unit"> {s.unit}</span> : null}
            </div>
            <div className="profile-stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Streak Calendar ── */}
      <h3 className="profile-section-title">{t('streak_calendar') || 'Streak Calendar'}</h3>
      <div className="profile-calendar-card">
        <StreakCalendar />
      </div>

      {/* ── Achievements ── */}
      <div className="profile-achievements-header">
        <h3 className="profile-section-title" style={{ margin: 0 }}>{t('achievements')}</h3>
        <button className="profile-view-all" onClick={() => navigate('/achievements')}>
          {t('view_all')}
        </button>
      </div>

      {earnedAchievements.length > 0 ? (
        <div className="profile-badges-scroll">
          {earnedAchievements.map(ach => (
            <div key={ach.id} className="profile-badge-card">
              <AchievementItem achievement={ach} />
            </div>
          ))}
        </div>
      ) : (
        <p className="profile-empty">{t('no_achievements')}</p>
      )}

      {unearnedAchievements.length > 0 && (
        <div className="profile-locked-list">
          {unearnedAchievements.map(ach => (
            <div key={ach.id} className="profile-locked-item">
              <AchievementItem achievement={ach} />
              <span className="profile-locked-chip">{t('locked_achievements')}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
