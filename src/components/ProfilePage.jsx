import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../config/api";
import { useNavigate } from 'react-router-dom';

import defaultAvatar from "../assets/default-avatar.jpg"; 
import AchievementItem from './AchievementItem';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Ініціалізуємо навігацію

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Помилка завантаження профілю", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="loading" style={{ textAlign: 'center', marginTop: '50px' }}>Завантаження профілю...</div>;
  if (!profile) return <div className="error" style={{ textAlign: 'center', marginTop: '50px' }}>Користувача не знайдено</div>;

  const avatarImage = profile.avatar_url ? profile.avatar_url : defaultAvatar;

  return (
    <div className="profile-container" style={{ padding: '20px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Кнопка повернення */}
      <button 
        onClick={() => navigate('/')} 
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginBottom: '20px', color: '#007bff', display: 'flex', alignItems: 'center' }}
      >
        ⬅ Back to Dashboard
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
          <p style={{ color: '#888', fontSize: '14px', margin: '4px 0 0' }}>joined {profile.joined_at}</p>
        </div>
        
        {/* Іконка налаштувань */}
        <div 
          className="settings-icon" 
          onClick={() => navigate('/settings')}
          style={{ fontSize: '24px', cursor: 'pointer', color: '#666', padding: '10px' }}
        >
          ⚙️
        </div>
      </div>

      {/* Streaks Section */}
      <div className="streak-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #eee' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>{profile.current_streak} days</div>
          <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', marginTop: '4px' }}>current streak</div>
        </div>
        <div className="stat-card" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #eee' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>{profile.longest_streak} days</div>
          <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', marginTop: '4px' }}>longest streak</div>
        </div>
      </div>

      {/* Stats Section */}
      <h3 style={{ fontSize: '18px', color: '#444', marginBottom: '15px' }}>Stats</h3>
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px', maxWidth: '500px' }}>
        {[
          { label: 'errors made', value: profile.stats.errors_made },
          { label: 'errors corrected', value: profile.stats.errors_corrected },
          { label: 'xp earned', value: profile.total_xp },
          { label: 'signs learned', value: profile.stats.signs_learned }
        ].map((stat, index) => (
          <div key={index} className="stat-box" style={{ background: '#ececec', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#222' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Badges Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '18px', color: '#444', margin: 0 }}>Achievements</h3>
        <span style={{ fontSize: '13px', color: '#007bff', cursor: 'pointer' }}>View all</span>
      </div>

      <div className="badges-row" style={{ 
        display: 'flex', 
        gap: '5px', 
        overflowX: 'visible', 
        paddingBottom: '10px' 
      }}>
        {profile.achievements && profile.achievements.length > 0 ? (
          profile.achievements.map((ach) => (
            <AchievementItem key={ach.id} achievement={ach} />
          ))
        ) : (
          <p style={{ fontSize: '12px', color: '#999' }}>Ви ще не здобули жодного досягнення.</p>
        )}
      </div>
      
    </div>
  );
};

export default ProfilePage;