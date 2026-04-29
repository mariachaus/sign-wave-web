import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../config/api";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Імпортуємо хук

import defaultAvatar from "../assets/default-avatar.jpg"; 
import AchievementItem from './AchievementItem';

const ProfilePage = () => {
  const { t } = useTranslation(); // Ініціалізуємо переклад
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userId = token?.split('-').pop();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/user/profile`,
          {
            params: { user_id: userId },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
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

  if (loading) return <div className="loading" style={{ textAlign: 'center', marginTop: '50px' }}>{t('profile_loading')}</div>;

  if (!profile) return (
    <div className="error" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>{t('user_not_found')}</h2>
      <p>{t('session_error')}</p>
      <button 
        onClick={() => {
          localStorage.removeItem('token');
          navigate('/auth');
        }}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer' 
        }}
      >
        {t('go_to_login')}
      </button>
    </div>
  );

  const avatarImage = profile.avatar_url ? profile.avatar_url : defaultAvatar;

  return (
    <div className="profile-container" style={{ padding: '20px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          background: 'none', 
          border: 'none', 
          fontSize: '18px', 
          cursor: 'pointer', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          color: '#333'
        }}
      >
        ⬅️ <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{t('back_to_dashboard')}</span>
      </button>

      {/* Header Section */}
      <div className="profile-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <div className="avatar-wrapper" style={{ marginRight: '20px' }}>
          <img 
            src={avatarImage} 
            alt="User Avatar" 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '2px solid #eee' 
            }} 
            onError={(e) => { e.target.src = defaultAvatar; }}
          />
        </div>
        <div style={{ flexGrow: 1 }}>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>{profile.username}</h2>
          <p style={{ color: '#888', fontSize: '14px', margin: '4px 0 0' }}>
            {t('joined')} {profile.joined_at}
          </p>
        </div>
        
        <div 
          className="settings-icon" 
          onClick={() => navigate('/settings')}
          style={{ fontSize: '24px', cursor: 'pointer', color: '#666', padding: '10px' }}
        >
          ⚙️
        </div>
      </div>

      {/* Streaks */}
      <div className="streak-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #eee' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>
             {profile.current_streak} {t('days_count')}
          </div>
          <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>{t('current_streak')}</div>
        </div>
        <div className="stat-card" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #eee' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>
             {profile.longest_streak} {t('days_count')}
          </div>
          <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>{t('longest_streak')}</div>
        </div>
      </div>

      {/* Stats */}
      <h3 style={{ fontSize: '18px', color: '#444', marginBottom: '15px' }}>{t('stats')}</h3>
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px', maxWidth: '500px'}}>
        {[
          { label: t('errors_made'), value: profile.stats.errors_made },
          { label: t('errors_corrected'), value: profile.stats.errors_corrected },
          { label: t('xp_earned'), value: profile.total_xp },
          { label: t('signs_learned'), value: profile.stats.signs_learned }
        ].map((stat, index) => (
          <div key={index} className="stat-box" style={{ background: '#ececec', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#222' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '18px', color: '#444', margin: 0 }}>{t('achievements')}</h3>
        <span style={{ fontSize: '13px', color: '#007bff', cursor: 'pointer' }}>{t('view_all')}</span>
      </div>

      <div className="badges-row" style={{ display: 'flex', gap: '5px', overflowX: 'visible', paddingBottom: '10px' }}>
        {profile.achievements && profile.achievements.length > 0 ? (
          profile.achievements.map((ach) => (
            <AchievementItem key={ach.id} achievement={ach} />
          ))
        ) : (
          <p style={{ fontSize: '12px', color: '#999' }}>{t('no_achievements')}</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;