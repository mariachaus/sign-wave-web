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

          <input
            type="password"
            placeholder={t('password')}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

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
