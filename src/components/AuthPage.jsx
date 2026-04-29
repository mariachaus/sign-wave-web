import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config/api";

const AuthPage = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    } //  catch (err) {
    //   setError(err.response?.data?.error || "An error occurred. Please check your connection.");
    // }
          catch (err) {
        setError(
          err.response?.data?.detail ||
          err.response?.data?.error ||
          "An error occurred. Please check your connection."
        );
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
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        {isLogin ? 'Sign In' : 'Create Account'}
      </h2>

      {error && (
        <p style={{ 
          color: '#d9534f', 
          background: '#f9dfde', 
          padding: '10px', 
          borderRadius: '4px', 
          fontSize: '14px',
          textAlign: 'center' 
        }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Username" 
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
          required 
        />

        {!isLogin && (
          <input 
            type="email" 
            placeholder="Email Address" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
            required 
          />
        )}

        <input 
          type="password" 
          placeholder="Password" 
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
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
          fontSize: '16px',
          marginTop: '10px',
          transition: 'background 0.3s'
        }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <p 
        onClick={() => {
          setIsLogin(!isLogin);
          setError('');
        }} 
        style={{ 
          cursor: 'pointer', 
          color: '#007bff', 
          marginTop: '20px', 
          textAlign: 'center',
          fontSize: '14px',
          textDecoration: 'underline'
        }}
      >
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
      </p>
    </div>
  );
};

export default AuthPage;