import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Toggle = ({ checked, onChange }) => (
  <label className="settings-toggle">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="settings-toggle__track">
      <span className="settings-toggle__thumb" />
    </span>
  </label>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from "../config/api";
import WebcamAnalyzer from './WebcamAnalyzer';
import ConfirmModal from './ConfirmModal';
import { IconUser, IconGlobe, IconMoon, IconMail, IconCamera, IconTextSize } from './Icons';
import { applyTheme, applyFontSize } from '../utils/theme';
import '../styles/pages/SettingsPage.scss';

const SettingsPage = ({ models }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? 'main');
  const [showPreview, setShowPreview] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [profileData, setProfileData] = useState({ username: '', email: '' });
  const [originalProfile, setOriginalProfile] = useState({ username: '', email: '' });
  const [originalEmail, setOriginalEmail] = useState('');
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });

  const [uiSettings, setUiSettings] = useState({
    theme: localStorage.getItem('theme') || 'system',
    language: localStorage.getItem('i18nextLng') || 'uk',
    font_size: parseFloat(localStorage.getItem('font_size')) || 1.0,
    email_notifications: true,
    is_landmarks_visible: localStorage.getItem('is_landmarks_visible') !== 'false',
    landmark_color: localStorage.getItem('skeleton_color') || '#00FF00',
    connection_color: localStorage.getItem('connection_color') || '#FF0000',
    is_mirror_view: localStorage.getItem('mirror_view') !== 'false',
  });
  const [originalUiSettings, setOriginalUiSettings] = useState(null);

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
          setOriginalProfile({ username: res.data.profile.username, email: res.data.profile.email });
          setOriginalEmail(res.data.profile.email);
        }
        if (res.data.ui) {
          const ui = res.data.ui;
          const loadedUi = {
            theme: ui.theme,
            language: ui.language || 'uk',
            font_size: ui.font_size,
            email_notifications: ui.email_notifications,
            is_landmarks_visible: ui.is_landmarks_visible,
            landmark_color: ui.landmark_color,
            connection_color: ui.connection_color || '#FF0000',
            is_mirror_view: ui.is_mirror_view_enabled,
          };
          setUiSettings(loadedUi);
          setOriginalUiSettings(loadedUi);
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
    if (ui.connection_color) localStorage.setItem('connection_color', ui.connection_color);
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
        connection_color: uiSettings.connection_color,
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
      applyFontSize(uiSettings.font_size);
      showStatus(t('status_settings_saved'), 'success');
      syncLocalData(dataToSave);
      setOriginalUiSettings({ ...uiSettings });
    } catch (err) {
      showStatus(err.response?.data?.error || "UI update failed", 'error');
    }
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/settings/update-profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOriginalEmail(profileData.email);
      showStatus(t('status_profile_updated'), 'success');
    } catch (err) {
      showStatus(err.response?.data?.error || "Update failed", 'error');
    }
  };

  const handleCancelProfile = () => {
    setProfileData(originalProfile);
  };

  const handleCancelVideo = () => {
    if (originalUiSettings) setUiSettings(originalUiSettings);
  };

  const handleUpdateProfile = () => {
    if (profileData.email !== originalEmail) {
      setShowEmailConfirm(true);
    } else {
      saveProfile();
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

  const handleDeleteAccount = () => setShowDeleteConfirm(true);

  const confirmDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/settings/delete-account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.clear();
      window.location.href = import.meta.env.BASE_URL + 'auth';
    } catch (err) {
      showStatus("Delete failed", 'error');
    }
  };

  const showStatus = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleBack = () => {
    if (showPreview) { setShowPreview(false); return; }
    activeTab === 'main' ? navigate(-1) : setActiveTab('main');
  };

  const pageTitle = showPreview
    ? t('camera_preview')
    : { main: t('settings'), personal: t('personal_info'), password: t('password'), video: t('video_settings') }[activeTab];

  return (
    <div className="settings-container">
      <div className="page-header">
        <button className="page-header__back" onClick={handleBack} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="page-header__title">{pageTitle}</h2>
      </div>

      {message.text && (
        <div className={`status-message ${message.type}`}>{message.text}</div>
      )}

      {/* MAIN MENU */}
      {activeTab === 'main' && !showPreview && (
        <div className="settings-menu">
          <div className="menu-item" onClick={() => setActiveTab('personal')}>
            <span className="menu-item__left"><IconUser size={18} />{t('personal_info')}</span>
            <span>➜</span>
          </div>

          <div className="menu-item">
            <span className="menu-item__left"><IconGlobe size={18} />{t('language')}</span>
            <select value={uiSettings.language} onChange={(e) => handleLanguageChange(e.target.value)}>
              <option value="uk">Українська</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="menu-item">
            <span className="menu-item__left"><IconMoon size={18} />{t('dark_mode')}</span>
            <Toggle
              checked={uiSettings.theme === 'dark'}
              onChange={(e) => {
                const newTheme = e.target.checked ? 'dark' : 'light';
                setUiSettings({ ...uiSettings, theme: newTheme });
                applyTheme(newTheme);
              }}
            />
          </div>

          <div className="font-size-picker">
            <span className="menu-item__left font-size-picker__title"><IconTextSize size={18} />{t('text_size')}</span>
            <div className="font-size-picker__options">
              {[
                { value: 0.8, label: t('small'),   letterSize: '14px' },
                { value: 1.0, label: t('medium'),  letterSize: '20px' },
                { value: 1.2, label: t('large'),   letterSize: '26px' },
              ].map(({ value, label, letterSize }) => (
                <button
                  key={value}
                  className={`font-size-picker__btn${uiSettings.font_size === value ? ' font-size-picker__btn--active' : ''}`}
                  onClick={() => setUiSettings({ ...uiSettings, font_size: value })}
                >
                  <span className="font-size-picker__letter" style={{ fontSize: letterSize }}>A</span>
                  <span className="font-size-picker__label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="menu-item" onClick={() => setActiveTab('video')}>
            <span className="menu-item__left"><IconCamera size={18} />{t('video_settings')}</span>
            <span>➜</span>
          </div>

          <div className="menu-item">
            <span className="menu-item__left"><IconMail size={18} />{t('email_subscription')}</span>
            <Toggle
              checked={uiSettings.email_notifications}
              onChange={(e) => setUiSettings({ ...uiSettings, email_notifications: e.target.checked })}
            />
          </div>

          <button className="save-btn primary" onClick={handleUpdateUI}>{t('save_general')}</button>

          <div className="menu-item" onClick={() => navigate('/terms')} style={{ marginTop: 8 }}>
            {t('terms_of_use') || 'Terms of Use'} <span>➜</span>
          </div>
        </div>
      )}

      {/* PERSONAL INFO */}
      {activeTab === 'personal' && (
        <div className="settings-form">
          <label className="settings-label">{t('username')}</label>
          <input className="settings-input" type="text" value={profileData.username} onChange={(e) => setProfileData({ ...profileData, username: e.target.value })} />

          <label className="settings-label">{t('email')}</label>
          <input className="settings-input" type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />

          <label className="settings-label">{t('password')}</label>
          <input className="settings-input settings-input--disabled" type="password" value="••••••••" readOnly disabled />
          <button className="save-btn change-password-btn" onClick={() => setActiveTab('password')}>
            {t('change_password')}
          </button>

          <div className="settings-btn-row">
            <button className="save-btn" onClick={handleUpdateProfile}>{t('save_profile')}</button>
            <button className="save-btn secondary" onClick={handleCancelProfile}>{t('cancel')}</button>
          </div>
          <button className="save-btn danger" onClick={handleDeleteAccount}>{t('delete_account')}</button>
        </div>
      )}

      {/* PASSWORD */}
      {activeTab === 'password' && (
        <div className="settings-form">
          {[
            { placeholder: t('old_password'),     key: 'old_password',     isFirst: true },
            { placeholder: t('new_password'),     key: 'new_password',     isFirst: false },
            { placeholder: t('confirm_password'), key: 'confirm_password', isFirst: false },
          ].map(({ placeholder, key, isFirst }) => (
            <div key={key} className="settings-pw-wrap">
              <input
                className="settings-input"
                type={showPasswords ? 'text' : 'password'}
                placeholder={placeholder}
                value={passwordData[key]}
                onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
              />
              {isFirst && (
                <button
                  type="button"
                  className="settings-pw-toggle"
                  onClick={() => setShowPasswords(v => !v)}
                  aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                >
                  {showPasswords ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              )}
            </div>
          ))}
          <button className="save-btn" onClick={handleChangePassword}>{t('save_password')}</button>
        </div>
      )}

      {/* VIDEO SETTINGS */}
      {activeTab === 'video' && !showPreview && (
        <div className="settings-form">
          <div className="menu-item">
            {t('skeleton_visibility')}
            <Toggle checked={uiSettings.is_landmarks_visible} onChange={(e) => setUiSettings({ ...uiSettings, is_landmarks_visible: e.target.checked })} />
          </div>
          <div className="menu-item">
            {t('skeleton_color')}
            <input type="color" value={uiSettings.landmark_color} onChange={(e) => setUiSettings({ ...uiSettings, landmark_color: e.target.value })} />
          </div>
          <div className="menu-item">
            {t('connection_color')}
            <input type="color" value={uiSettings.connection_color} onChange={(e) => setUiSettings({ ...uiSettings, connection_color: e.target.value })} />
          </div>
          <div className="menu-item">
            {t('mirror_view')}
            <Toggle checked={uiSettings.is_mirror_view} onChange={(e) => setUiSettings({ ...uiSettings, is_mirror_view: e.target.checked })} />
          </div>

          <div className="settings-btn-row">
            <button className="save-btn" onClick={handleUpdateUI}>{t('save_video')}</button>
            <button className="save-btn secondary" onClick={handleCancelVideo}>{t('cancel')}</button>
          </div>
          <button className="save-btn secondary" onClick={() => setShowPreview(true)}>{t('test_camera')}</button>

          <div className="settings-tips">
            <p className="settings-tips__title">{t('detection_tips_title')}</p>
            <ul className="settings-tips__list">
              <li>{t('detection_tip_lighting')}</li>
              <li>{t('detection_tip_clothing')}</li>
              <li>{t('detection_tip_backlight')}</li>
            </ul>
          </div>
        </div>
      )}

      {/* CAMERA PREVIEW */}
      {showPreview && (
        <div className="camera-preview">
          {models && (
            <WebcamAnalyzer poseModel={models.video.pose} handModel={models.video.hand} isMirror={uiSettings.is_mirror_view} />
          )}
          <button className="save-btn danger" onClick={() => setShowPreview(false)}>
            {t('close_preview')}
          </button>
        </div>
      )}
      {showEmailConfirm && (
        <ConfirmModal
          message={t('confirm_email_change', { email: profileData.email })}
          confirmLabel={t('confirm')}
          cancelLabel={t('cancel')}
          variant="primary"
          onConfirm={() => { setShowEmailConfirm(false); saveProfile(); }}
          onCancel={() => setShowEmailConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          message={t('confirm_delete_account')}
          confirmLabel={t('delete_account')}
          cancelLabel={t('cancel')}
          variant="danger"
          onConfirm={confirmDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

export default SettingsPage;
