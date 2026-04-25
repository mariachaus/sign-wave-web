import React, { useState } from 'react';
import API_BASE_URL from "../config/api";

import axios from 'axios';

const AuthPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  // Додали email у початковий стан
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const path = isLogin ? 'login' : 'register';
    
    try {
      // Бекенд очікує об'єкт з username, email (для реєстрації) та password
      const res = await axios.post(`${API_BASE_URL}/api/auth/${path}`, formData);
      
      if (isLogin) {
        localStorage.setItem('token', res.data.access_token);
        onLoginSuccess(res.data.access_token);
      } else {
        alert("Реєстрація успішна! Тепер увійдіть за допомогою свого логіну.");
        setIsLogin(true);
      }
    } catch (err) {
      // Виводимо конкретну помилку від Flask (наприклад, "Користувач вже існує")
      setError(err.response?.data?.error || "Сталася помилка. Перевірте з'єднання з сервером.");
    }
  };

  return (
    <div className="auth-container" style={{ 
      maxWidth: '400px', 
      margin: '80px auto', 
      padding: '30px', 
      border: '1px solid #ddd', 
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {isLogin ? 'Вхід у систему' : 'Створити акаунт'}
      </h2>

      {error && <p style={{ color: '#d9534f', background: '#f9dfde', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Логін (username)" 
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required 
        />

        {/* ПРИХОВАНЕ ПОЛЕ EMAIL: показуємо тільки при реєстрації */}
        {!isLogin && (
          <input 
            type="email" 
            placeholder="Електронна пошта" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required 
          />
        )}

        <input 
          type="password" 
          placeholder="Пароль" 
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required 
        />

        <button type="submit" style={{ 
          padding: '12px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          {isLogin ? 'Увійти' : 'Зареєструватися'}
        </button>
      </form>

      <p onClick={() => {
        setIsLogin(!isLogin);
        setError(''); // Очищуємо помилки при перемиканні
      }} style={{ 
        cursor: 'pointer', 
        color: '#007bff', 
        marginTop: '20px', 
        textAlign: 'center',
        fontSize: '14px'
      }}>
        {isLogin ? 'Ще не маєте акаунту? Реєстрація' : 'Вже є акаунт? Увійти'}
      </p>
    </div>
  );
};

export default AuthPage;