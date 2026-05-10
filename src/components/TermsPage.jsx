import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/pages/TermsPage.scss';

const TermsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="terms-page">
      <div className="terms-card">
        <div className="terms-header">
          <div className="terms-logo">
            <div className="terms-logo__icon">🤟</div>
            <h1 className="terms-logo__title">SignWave</h1>
          </div>
          <h2 className="terms-title">{t('terms_title') || 'Terms of Use'}</h2>
          <p className="terms-updated">{t('terms_updated') || 'Last updated: May 2026'}</p>
        </div>

        <div className="terms-body">

          <section className="terms-section">
            <h3>{t('terms_s1_title') || '1. Acceptance of Terms'}</h3>
            <p>{t('terms_s1_text') || 'By registering and using SignWave, you agree to these Terms of Use. If you do not agree, please do not use the application.'}</p>
          </section>

          <section className="terms-section">
            <h3>{t('terms_s2_title') || '2. Purpose of the Application'}</h3>
            <p>{t('terms_s2_text') || 'SignWave is an educational platform for learning Ukrainian Sign Language (USL). All content is provided for educational purposes only.'}</p>
          </section>

          <section className="terms-section">
            <h3>{t('terms_s3_title') || '3. User Accounts'}</h3>
            <p>{t('terms_s3_text') || 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration. You must be at least 13 years old to use this service.'}</p>
          </section>

          <section className="terms-section">
            <h3>{t('terms_s4_title') || '4. Camera and Data Usage'}</h3>
            <p>{t('terms_s4_text') || 'SignWave may request access to your camera for gesture recognition exercises. Camera data is processed locally in your browser and is not stored or transmitted to our servers. Your learning progress and account data are stored securely.'}</p>
          </section>

          <section className="terms-section">
            <h3>{t('terms_s5_title') || '5. Acceptable Use'}</h3>
            <p>{t('terms_s5_text') || 'You agree not to misuse the platform, attempt to gain unauthorized access, or interfere with other users. The application is for personal, non-commercial use only.'}</p>
          </section>

          <section className="terms-section">
            <h3>{t('terms_s6_title') || '6. Privacy'}</h3>
            <p>{t('terms_s6_text') || 'We collect minimal personal data necessary to provide the service (username, email, learning progress). Your data is not sold to third parties. You may request deletion of your account and data at any time through the Settings page.'}</p>
          </section>

          <section className="terms-section">
            <h3>{t('terms_s7_title') || '7. Disclaimer'}</h3>
            <p>{t('terms_s7_text') || 'SignWave is provided "as is" for educational purposes. We do not guarantee the accuracy of sign language content for professional or medical use. Always consult a certified interpreter for critical communication.'}</p>
          </section>

          <section className="terms-section">
            <h3>{t('terms_s8_title') || '8. Changes to Terms'}</h3>
            <p>{t('terms_s8_text') || 'We may update these terms from time to time. Continued use of the application after changes constitutes acceptance of the new terms.'}</p>
          </section>

        </div>

        <div className="terms-footer">
          <button className="terms-back-btn" onClick={() => navigate(-1)}>
            {t('back') || 'Back'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
