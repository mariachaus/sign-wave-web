import React from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="settings-container" style={{ padding: '20px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header із кнопкою назад */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('/profile')} // Повертаємося конкретно в профіль
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '24px', 
            cursor: 'pointer', 
            marginRight: '15px',
            padding: '5px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          ⬅️
        </button>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Settings</h2>
      </div>

      {/* Placeholder для майбутніх функцій */}
      <div style={{ 
        background: '#f9f9f9', 
        padding: '60px 20px', 
        borderRadius: '16px', 
        textAlign: 'center', 
        border: '2px dashed #d1d1d1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{ fontSize: '40px' }}>🛠️</div>
        <p style={{ color: '#666', fontSize: '16px', margin: 0, lineHeight: '1.5' }}>
          Цей розділ наразі в розробці. <br />
          Незабаром тут можна буде змінити аватар, оновити пароль та налаштувати сповіщення.
        </p>
        
        <button 
          onClick={() => navigate('/')}
          style={{ 
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          На головну сторінку
        </button>
      </div>

      {/* Приклад списку налаштувань (заглушка) */}
      <div style={{ marginTop: '30px' }}>
        <div style={{ padding: '15px 0', borderBottom: '1px solid #eee', color: '#999', cursor: 'not-allowed' }}>
          👤 Edit Profile (Coming soon)
        </div>
        <div style={{ padding: '15px 0', borderBottom: '1px solid #eee', color: '#999', cursor: 'not-allowed' }}>
          🔒 Security & Password
        </div>
        <div style={{ padding: '15px 0', color: '#999', cursor: 'not-allowed' }}>
          🔔 Notifications
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;