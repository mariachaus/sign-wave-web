import React, { useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../config/api';
import '../styles/pages/AuthPage.scss';

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

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo__icon">🤟</div>
            <h1 className="auth-logo__title">SignWave</h1>
          </div>
          <div className="auth-error">{t('reset_password_invalid')}</div>
          <p className="auth-switch">
            <Link to="/auth" className="auth-switch__btn">{t('forgot_password_back')}</Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('error_passwords_match'));
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        detail === 'Invalid or expired token'
          ? t('reset_password_invalid')
          : t('admin_error_generic')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo__icon">🤟</div>
          <h1 className="auth-logo__title">SignWave</h1>
          <p className="auth-logo__sub">{t('reset_password_sub')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-info">{t('reset_password_success')}</div>}

        {!success && (
          <form className="auth-form" onSubmit={handleSubmit}>

            <div className="auth-field">
              <label className="auth-field__label">{t('new_password')}</label>
              <div className="auth-field__wrap">
                <span className="auth-field__icon"><LockIcon /></span>
                <input
                  className="auth-field__input auth-field__input--pw"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
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

            <div className="auth-field">
              <label className="auth-field__label">{t('confirm_password_label')}</label>
              <div className="auth-field__wrap">
                <span className="auth-field__icon"><LockIcon /></span>
                <input
                  className="auth-field__input auth-field__input--pw"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? t('resetting') : t('reset_password_btn')}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/auth" className="auth-switch__btn">{t('forgot_password_back')}</Link>
        </p>

      </div>
    </div>
  );
};

export default ResetPasswordPage;
