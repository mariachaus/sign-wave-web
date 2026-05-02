import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from "../config/api";
import WebcamAnalyzer from './WebcamAnalyzer';
import { applyTheme } from '../utils/theme';
import '../styles/pages/SettingsPage.scss';

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
    is_mirror_view: localStorage.getItem('mirror_view') !== 'false',
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
          setProfileData({ username: res.data.profile.username, email: res.data.profile.email });
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
            is_mirror_view: ui.is_mirror_view_enabled,
          });
          syncLocalData(ui);
          if (ui.language && ui.language !== i18n.language) i18n.changeLanguage(ui.language);
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
    localStorage.setItem('mirror_view', ui.is_mirror_view_enabled ?? ui.is_mirror_view);
    localStorage.setItem('font_size', ui.font_size);
    if (ui.theme) {
      localStorage.setItem('theme', ui.theme);
      applyTheme(ui.theme);
    }
    if (ui.language) localStorage.setItem('i18nextLng', ui.language);
  };

  const handleLanguageChange = (lang) => setUiSettings({ ...uiSettings, language: lang });

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
        is_mirror_view_enabled: uiSettings.is_mirror_view,
      };
      await axios.put(`${API_BASE_URL}/api/settings/update-ui`, dataToSave, {
        headers: { Authorization: `Bearer ${token}` }
      });
      i18n.changeLanguage(uiSettings.language);
      applyTheme(uiSettings.theme);
      showStatus(t('status_settings_saved'), 'success');
      syncLocalData(dataToSave);
    } catch (err) {
      showStatus(err.response?.data?.error || "UI update failed", 'error');
    }
  };

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
      showStatus(t('error_passwords_match'), 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/settings/change-password`, {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      }, { headers: { Authorization: `Bearer ${token}` } });
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
        showStatus("Delete failed", 'error');
      }
    }
  };

  const showStatus = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleBack = () => {
    if (showPreview) { setShowPreview(false); return; }
    activeTab === 'main' ? navigate('/profile') : setActiveTab('main');
  };

  const pageTitle = showPreview
    ? t('camera_preview')
    : { main: t('settings'), personal: t('personal_info'), password: t('password'), video: t('video_settings') }[activeTab];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="settings-back-btn" onClick={handleBack} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2>{pageTitle}</h2>
      </div>

      {message.text && (
        <div className={`status-message ${message.type}`}>{message.text}</div>
      )}

      {/* MAIN MENU */}
      {activeTab === 'main' && !showPreview && (
        <div className="settings-menu">
          <div className="menu-item" onClick={() => setActiveTab('personal')}>
            {t('personal_info')} <span>➜</span>
          </div>

          <div className="menu-item">
            {t('language')}
            <select value={uiSettings.language} onChange={(e) => handleLanguageChange(e.target.value)}>
              <option value="uk">Українська</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="menu-item">
            {t('dark_mode')}
            <input
              type="checkbox"
              checked={uiSettings.theme === 'dark'}
              onChange={(e) => {
                const newTheme = e.target.checked ? 'dark' : 'light';
                setUiSettings({ ...uiSettings, theme: newTheme });
                applyTheme(newTheme);
              }}
            />
          </div>

          <div className="menu-item">
            {t('text_size')}
            <select value={uiSettings.font_size} onChange={(e) => setUiSettings({ ...uiSettings, font_size: parseFloat(e.target.value) })}>
              <option value="0.8">{t('small')}</option>
              <option value="1.0">{t('medium')}</option>
              <option value="1.2">{t('large')}</option>
            </select>
          </div>

          <div className="menu-item" onClick={() => setActiveTab('video')}>
            {t('video_settings')} <span>➜</span>
          </div>

          <div className="menu-item">
            {t('email_subscription')}
            <input
              type="checkbox"
              checked={uiSettings.email_notifications}
              onChange={(e) => setUiSettings({ ...uiSettings, email_notifications: e.target.checked })}
            />
          </div>

          <button className="save-btn primary" onClick={handleUpdateUI}>{t('save_general')}</button>
          <button className="sign-out-btn" onClick={() => { localStorage.clear(); window.location.href = '/auth'; }}>
            {t('sign_out')}
          </button>
        </div>
      )}

      {/* PERSONAL INFO */}
      {activeTab === 'personal' && (
        <div className="settings-form">
          <label className="settings-label">{t('username')}</label>
          <input className="settings-input" type="text" value={profileData.username} onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} />

          <label className="settings-label">{t('email')}</label>
          <input className="settings-input" type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />

          <div className="settings-link" onClick={() => setActiveTab('password')}>{t('change_password')} ➜</div>

          <button className="save-btn" onClick={handleUpdateProfile}>{t('save_profile')}</button>
          <button className="save-btn danger" onClick={handleDeleteAccount}>{t('delete_account')}</button>
        </div>
      )}

      {/* PASSWORD */}
      {activeTab === 'password' && (
        <div className="settings-form">
          <input className="settings-input" type="password" placeholder={t('old_password')} value={passwordData.old_password} onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })} />
          <input className="settings-input" type="password" placeholder={t('new_password')} value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} style={{ marginTop: '10px' }} />
          <input className="settings-input" type="password" placeholder={t('confirm_password')} value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} style={{ marginTop: '10px' }} />
          <button className="save-btn" onClick={handleChangePassword}>{t('save_password')}</button>
        </div>
      )}

      {/* VIDEO SETTINGS */}
      {activeTab === 'video' && !showPreview && (
        <div className="settings-form">
          <div className="menu-item">
            {t('skeleton_visibility')}
            <input type="checkbox" checked={uiSettings.is_landmarks_visible} onChange={(e) => setUiSettings({ ...uiSettings, is_landmarks_visible: e.target.checked })} />
          </div>
          <div className="menu-item">
            {t('skeleton_color')}
            <input type="color" value={uiSettings.landmark_color} onChange={(e) => setUiSettings({ ...uiSettings, landmark_color: e.target.value })} />
          </div>
          <div className="menu-item">
            {t('mirror_view')}
            <input type="checkbox" checked={uiSettings.is_mirror_view} onChange={(e) => setUiSettings({ ...uiSettings, is_mirror_view: e.target.checked })} />
          </div>

          <button className="save-btn" onClick={handleUpdateUI}>{t('save_video')}</button>
          <button className="save-btn secondary" onClick={() => setShowPreview(true)}>📷 {t('test_camera')}</button>
        </div>
      )}

      {/* CAMERA PREVIEW */}
      {showPreview && (
        <div className="camera-preview">
          <div
            className="camera-preview__frame"
            style={{ border: `4px solid ${uiSettings.landmark_color}` }}
          >
            {models && (
              <WebcamAnalyzer poseModel={models.video.pose} handModel={models.video.hand} />
            )}
          </div>
          <button className="save-btn" style={{ marginTop: '15px' }} onClick={() => setShowPreview(false)}>
            {t('close_preview')}
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
