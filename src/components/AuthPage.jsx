import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from "../config/api";
import '../styles/pages/AuthPage.scss';

const AuthPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const path = isLogin ? 'login' : 'register';

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/${path}`, formData);

      if (isLogin) {
        localStorage.setItem('token', res.data.access_token);
        onLoginSuccess(res.data.access_token);
        navigate('/');
      } else {
        alert("Registration successful! Please log in with your credentials.");
        setIsLogin(true);
        setFormData({ username: '', email: '', password: '' });
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "An error occurred. Please check your connection."
      );
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <h2>{t(isLogin ? 'sign_in' : 'create_account')}</h2>

        {error && (
          <p className="auth-error">{error}</p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t('username')}
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />

          {!isLogin && (
            <input
              type="email"
              placeholder={t('email_address')}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          )}

          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"} // Зміна типу інпуту
              placeholder={t('password')}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <button 
              type="button" 
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                /* Іконка Око перекреслене */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                /* Іконка Око */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          <button type="submit" className="auth-submit-btn">
            {t(isLogin ? 'login_btn' : 'register_btn')}
          </button>
        </form>

        <p
          className="auth-toggle"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
        >
          {t(isLogin ? 'no_account_signup' : 'have_account_signin')}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
