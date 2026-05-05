import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../config/api';
import '../styles/pages/AuthPage.scss';

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const AuthPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (field) => (e) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const path = isLogin ? 'login' : 'register';
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/${path}`, formData);
      if (isLogin) {
        localStorage.setItem('token', res.data.access_token);
        onLoginSuccess(res.data.access_token);
        navigate('/');
      } else {
        alert('Registration successful! Please log in with your credentials.');
        setIsLogin(true);
        setFormData({ username: '', email: '', password: '' });
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'An error occurred. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(v => !v);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo__icon">🤟</div>
          <h1 className="auth-logo__title">SignWave</h1>
          <p className="auth-logo__sub">
            {isLogin ? t('sign_in_sub') || 'Sign in to continue learning' : t('sign_up_sub') || 'Start your sign language journey'}
          </p>
        </div>

        {/* Error */}
        {error && <div className="auth-error">{error}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Username */}
          <div className="auth-field">
            <label className="auth-field__label">{t('username')}</label>
            <div className="auth-field__wrap">
              <span className="auth-field__icon"><UserIcon /></span>
              <input
                className="auth-field__input"
                type="text"
                placeholder="your_username"
                value={formData.username}
                onChange={handleChange('username')}
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Email — register only */}
          {!isLogin && (
            <div className="auth-field">
              <label className="auth-field__label">{t('email_address')}</label>
              <div className="auth-field__wrap">
                <span className="auth-field__icon"><MailIcon /></span>
                <input
                  className="auth-field__input"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="auth-field">
            <label className="auth-field__label">{t('password')}</label>
            <div className="auth-field__wrap">
              <span className="auth-field__icon"><LockIcon /></span>
              <input
                className="auth-field__input auth-field__input--pw"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange('password')}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                className="auth-field__pw-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? (isLogin ? 'Signing in…' : 'Creating account…')
              : t(isLogin ? 'login_btn' : 'register_btn')}
          </button>
        </form>

        {/* Switch mode */}
        <p className="auth-switch">
          <button type="button" className="auth-switch__btn" onClick={switchMode}>
            {t(isLogin ? 'no_account_signup' : 'have_account_signin')}
          </button>
        </p>

      </div>
    </div>
  );
};

export default AuthPage;
