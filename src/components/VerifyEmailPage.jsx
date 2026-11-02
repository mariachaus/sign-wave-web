import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../config/api';
import '../styles/pages/AuthPage.scss';

const VerifyEmailPage = ({ isAuthenticated, onVerified }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  // The token is single-use — StrictMode runs effects twice in dev, so send it only once
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;

    axios.post(`${API_BASE_URL}/api/auth/verify-email`, { token })
      .then(() => {
        setStatus('success');
        onVerified?.();
      })
      .catch(() => setStatus('error'));
  }, [token, onVerified]);

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo__icon">🤟</div>
          <h1 className="auth-logo__title">SignWave</h1>
        </div>

        {status === 'loading' && <div className="auth-info">{t('verify_email_loading')}</div>}
        {status === 'success' && <div className="auth-info">{t('verify_email_success')}</div>}
        {status === 'error' && <div className="auth-error">{t('verify_email_invalid')}</div>}

        {status !== 'loading' && (
          <p className="auth-switch">
            <Link to={isAuthenticated ? '/' : '/auth'} className="auth-switch__btn">
              {t('verify_email_continue')}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
