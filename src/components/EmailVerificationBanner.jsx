import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../config/api';
import { getApiErrorMessage } from '../utils/apiError';
import '../styles/components/EmailVerificationBanner.scss';

const EmailVerificationBanner = ({ email }) => {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setSending(true);
    setMessage('');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/resend-verification`);
      setMessage(t('verify_banner_sent'));
    } catch (err) {
      setMessage(getApiErrorMessage(err, t('admin_error_generic')));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="email-verify-banner" role="status">
      <span className="email-verify-banner__text">{t('verify_banner_text', { email })}</span>
      {message
        ? <span className="email-verify-banner__message">{message}</span>
        : (
          <button
            type="button"
            className="email-verify-banner__btn"
            onClick={handleResend}
            disabled={sending}
          >
            {t('verify_banner_resend')}
          </button>
        )}
    </div>
  );
};

export default EmailVerificationBanner;
