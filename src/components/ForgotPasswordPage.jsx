import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../config/api';
import '../styles/pages/AuthPage.scss';

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setSent(true);
    } catch {
      setError(t('admin_error_generic'));
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
          <p className="auth-logo__sub">{t('forgot_password_sub')}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {sent && <div className="auth-info">{t('forgot_password_sent')}</div>}

        {!sent && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-field__label">{t('email_address')}</label>
              <div className="auth-field__wrap">
                <span className="auth-field__icon"><MailIcon /></span>
                <input
                  className="auth-field__input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? t('sending') : t('forgot_password_btn')}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/auth" className="auth-switch__btn">
            {t('forgot_password_back')}
          </Link>
        </p>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
