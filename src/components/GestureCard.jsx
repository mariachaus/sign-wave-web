import React from 'react';
import { useNavigate } from 'react-router-dom';

const GestureCard = ({ gesture, isActive }) => { // Додали isActive
  const navigate = useNavigate();

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '128px', 
    height: '176px', 
    // Якщо активний — колір #555 (темно-сірий), якщо ні — #9ca3af (світло-сірий)
    backgroundColor: isActive ? '#555' : '#9ca3af', 
    borderRadius: '24px', 
    padding: '16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    marginBottom: '16px',
    border: isActive ? '2px solid white' : 'none' // Можна додати обводку для акценту
  };

  const circleStyle = {
    width: '80px', 
    height: '80px', 
    backgroundColor: '#d1d5db', 
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #e5e7eb'
  };

  const handleCardClick = () => {
    navigate(`/gestures/${gesture.id}`);
  };

  return (
    <div 
      style={cardStyle} 
      onClick={handleCardClick}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <h3 style={{ 
        color: isActive ? 'white' : 'black', // Білий текст на темному фоні
        fontSize: '1.2rem', 
        fontWeight: '500', 
        margin: 0, 
        textTransform: 'lowercase', 
        textAlign: 'center' 
      }}>
        {gesture.name}
      </h3>
      <div style={circleStyle}>
        {gesture.thumbnail_url ? (
          <img 
            src={gesture.thumbnail_url} 
            alt={gesture.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e7eb' }} />
        )}
      </div>
    </div>
  );
};

export default GestureCard;