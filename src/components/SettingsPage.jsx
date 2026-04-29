import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from "../config/api";
import WebcamAnalyzer from './WebcamAnalyzer';

const SettingsPage = ({ models }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('main');
  const [showPreview, setShowPreview] = useState(false);

  const [profileData, setProfileData] = useState({ username: '', email: '' });
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  
  const [uiSettings, setUiSettings] = useState({
    theme: localStorage.getItem('theme') || 'system',
    language: localStorage.getItem('i18nextLng') || 'uk', 
    font_size: parseFloat(localStorage.getItem('font_size')) || 1.0,
    email_notifications: true,
    is_landmarks_visible: localStorage.getItem('is_landmarks_visible') !== 'false',
    landmark_color: localStorage.getItem('skeleton_color') || '#00FF00',
    is_mirror_view: localStorage.getItem('mirror_view') !== 'false'
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/settings/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.profile) {
          setProfileData({ 
            username: res.data.profile.username, 
            email: res.data.profile.email 
          });
        }
        
        if (res.data.ui) {
          const ui = res.data.ui;
          setUiSettings({
            theme: ui.theme,
            language: ui.language || 'uk',
            font_size: ui.font_size,
            email_notifications: ui.email_notifications,
            is_landmarks_visible: ui.is_landmarks_visible,
            landmark_color: ui.landmark_color,
            is_mirror_view: ui.is_mirror_view_enabled 
          });
          
          syncLocalData(ui);

          // При завантаженні синхронізуємо мову інтерфейсу з БД
          if (ui.language && ui.language !== i18n.language) {
            i18n.changeLanguage(ui.language);
          }
        }
      } catch (err) {
        console.error("Error fetching settings data", err);
      }
    };
    fetchSettings();
  }, []);

  const syncLocalData = (ui) => {
    localStorage.setItem('skeleton_color', ui.landmark_color);
    localStorage.setItem('is_landmarks_visible', ui.is_landmarks_visible);
    localStorage.setItem('mirror_view', ui.is_mirror_view_enabled);
    localStorage.setItem('font_size', ui.font_size);
    localStorage.setItem('theme', ui.theme);
    if (ui.language) localStorage.setItem('i18nextLng', ui.language);
  };

  // Тільки оновлюємо стан, не змінюємо мову інтерфейсу відразу
  const handleLanguageChange = (lang) => {
    setUiSettings({ ...uiSettings, language: lang });
  };

  const handleUpdateUI = async () => {
    try {
      const token = localStorage.getItem('token');
      const dataToSave = {
        theme: uiSettings.theme,
        language: uiSettings.language, 
        landmark_color: uiSettings.landmark_color,
        is_landmarks_visible: uiSettings.is_landmarks_visible,
        font_size: uiSettings.font_size,
        email_notifications: uiSettings.email_notifications,
        is_mirror_view_enabled: uiSettings.is_mirror_view 
      };

      await axios.put(`${API_BASE_URL}/api/settings/update-ui`, dataToSave, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // ТЕПЕР ТУТ: змінюємо мову i18next після збереження в БД
      i18n.changeLanguage(uiSettings.language);
      
      showStatus(t('status_settings_saved'), 'success');
      syncLocalData(dataToSave);
    } catch (err) {
      showStatus(err.response?.data?.error || "UI update failed", 'error');
    }
  };

  // ... (решта функцій handleUpdateProfile, handleChangePassword, handleDeleteAccount без змін)

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/settings/update-profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showStatus(t('status_profile_updated'), 'success');
    } catch (err) {
      showStatus(err.response?.data?.error || "Update failed", 'error');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      showStatus(t('error_passwords_match'), "error");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/settings/change-password`, {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showStatus(t('status_password_changed'), 'success');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      showStatus(err.response?.data?.error || "Password change failed", 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t('confirm_delete_account'))) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/api/settings/delete-account`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.clear();
        window.location.href = '/auth';
      } catch (err) {
        showStatus("Delete failed", "error");
      }
    }
  };

  const showStatus = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = '/auth';
  };

  return (
    <div className="settings-container" style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => {
            if (showPreview) { setShowPreview(false); return; }
            activeTab === 'main' ? navigate('/profile') : setActiveTab('main');
          }} 
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
          ⬅️
        </button>
        <h2 style={{ marginLeft: '15px' }}>
          {showPreview ? t('camera_preview') : (
            <>
              {activeTab === 'main' && t('settings')}
              {activeTab === 'personal' && t('personal_info')}
              {activeTab === 'password' && t('password')}
              {activeTab === 'video' && t('video_settings')}
            </>
          )}
        </h2>
      </div>

      {message.text && (
        <div style={{ 
          padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24'
        }}>{message.text}</div>
      )}

      {/* --- MAIN MENU --- */}
      {activeTab === 'main' && !showPreview && (
        <div className="settings-menu">
          <div className="menu-item" onClick={() => setActiveTab('personal')} style={menuItemStyle}>
            {t('personal_info')} <span>➜</span>
          </div>

          <div className="menu-item" style={menuItemStyle}>
            {t('language')}
            <select 
              value={uiSettings.language} 
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{marginLeft: 'auto', padding: '5px', borderRadius: '5px'}}
            >
              <option value="uk">Українська</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div className="menu-item" style={menuItemStyle}>
            {t('dark_mode')} 
            <input 
              type="checkbox" 
              checked={uiSettings.theme === 'dark'}
              onChange={(e) => setUiSettings({...uiSettings, theme: e.target.checked ? 'dark' : 'light'})}
              style={{marginLeft: 'auto'}} 
            />
          </div>

          <div className="menu-item" style={menuItemStyle}>
            {t('text_size')} 
            <select 
              value={uiSettings.font_size} 
              onChange={(e) => setUiSettings({...uiSettings, font_size: parseFloat(e.target.value)})}
              style={{marginLeft: 'auto'}}
            >
              <option value="0.8">{t('small')}</option>
              <option value="1.0">{t('medium')}</option>
              <option value="1.2">{t('large')}</option>
            </select>
          </div>

          <div className="menu-item" onClick={() => setActiveTab('video')} style={menuItemStyle}>
            {t('video_settings')} <span>➜</span>
          </div>

          <div className="menu-item" style={menuItemStyle}>
            {t('email_subscription')} 
            <input 
              type="checkbox" 
              checked={uiSettings.email_notifications}
              onChange={(e) => setUiSettings({...uiSettings, email_notifications: e.target.checked})}
              style={{marginLeft: 'auto'}} 
            />
          </div>
          
          <button onClick={handleUpdateUI} style={{...saveBtnStyle, backgroundColor: '#007bff'}}>{t('save_general')}</button>
          <button onClick={handleSignOut} style={signOutBtnStyle}>{t('sign_out')}</button>
        </div>
      )}

      {/* --- PERSONAL INFO --- */}
      {activeTab === 'personal' && (
        <div className="settings-form">
          <label style={labelStyle}>{t('username')}</label>
          <input type="text" value={profileData.username} onChange={(e) => setProfileData({...profileData, username: e.target.value})} style={inputStyle} />

          <label style={labelStyle}>{t('email')}</label>
          <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} style={inputStyle} />

          <div onClick={() => setActiveTab('password')} style={{color: '#007bff', cursor: 'pointer', margin: '15px 0'}}>{t('change_password')} ➜</div>
          
          <button onClick={handleUpdateProfile} style={saveBtnStyle}>{t('save_profile')}</button>
          <button onClick={handleDeleteAccount} style={{...saveBtnStyle, backgroundColor: '#dc3545', marginTop: '10px'}}>{t('delete_account')}</button>
        </div>
      )}

      {/* --- PASSWORD --- */}
      {activeTab === 'password' && (
        <div className="settings-form">
          <input type="password" placeholder={t('old_password')} value={passwordData.old_password} onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})} style={inputStyle} />
          <input type="password" placeholder={t('new_password')} value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} style={{...inputStyle, marginTop: '10px'}} />
          <input type="password" placeholder={t('confirm_password')} value={passwordData.confirm_password} onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})} style={{...inputStyle, marginTop: '10px'}} />
          <button onClick={handleChangePassword} style={{...saveBtnStyle, marginTop: '30px'}}>{t('save_password')}</button>
        </div>
      )}

      {/* --- VIDEO SETTINGS --- */}
      {activeTab === 'video' && !showPreview && (
        <div className="settings-form">
          <div style={menuItemStyle}>
            {t('skeleton_visibility')} 
            <input 
              type="checkbox" 
              checked={uiSettings.is_landmarks_visible}
              onChange={(e) => setUiSettings({...uiSettings, is_landmarks_visible: e.target.checked})}
            />
          </div>
          <div style={menuItemStyle}>
            {t('skeleton_color')} 
            <input 
              type="color" 
              value={uiSettings.landmark_color}
              onChange={(e) => setUiSettings({...uiSettings, landmark_color: e.target.value})}
            />
          </div>
          <div style={menuItemStyle}>
            {t('mirror_view')} 
            <input 
              type="checkbox" 
              checked={uiSettings.is_mirror_view}
              onChange={(e) => setUiSettings({...uiSettings, is_mirror_view: e.target.checked})}
            />
          </div>
          
          <button onClick={handleUpdateUI} style={saveBtnStyle}>{t('save_video')}</button>
          
          <button 
            style={{...saveBtnStyle, backgroundColor: '#6c757d', marginTop: '10px'}} 
            onClick={() => setShowPreview(true)}
          >
            📷 {t('test_camera')}
          </button>
        </div>
      )}

      {showPreview && (
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <div style={{ 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: `4px solid ${uiSettings.landmark_color}`,
            backgroundColor: '#000',
            lineHeight: 0
          }}>
             {models && (
               <WebcamAnalyzer 
                 poseModel={models.video.pose} 
                 handModel={models.video.hand} 
               />
             )}
          </div>
          <button 
            onClick={() => setShowPreview(false)} 
            style={{...saveBtnStyle, backgroundColor: '#333', marginTop: '15px'}}
          >
            {t('close_preview')}
          </button>
        </div>
      )}
    </div>
  );
};

const menuItemStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', cursor: 'pointer', alignItems: 'center' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px', boxSizing: 'border-box', backgroundColor: '#f0f0f0' };
const labelStyle = { display: 'block', marginTop: '15px', fontWeight: 'bold', fontSize: '14px' };
const saveBtnStyle = { width: '100%', padding: '12px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', marginTop: '20px' };
const signOutBtnStyle = { marginTop: '40px', width: '100px', padding: '8px', borderRadius: '15px', border: 'none', background: '#666', color: '#fff', cursor: 'pointer' };

export default SettingsPage;