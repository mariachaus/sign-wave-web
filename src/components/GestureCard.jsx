import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/GestureCard.scss';

const GestureCard = ({ gesture, isActive }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`gesture-card ${isActive ? 'active' : ''}`}
      onClick={() => navigate(`/gestures/${gesture.id}`)}
    >
      <h3 className="gesture-card__name">{gesture.name}</h3>
      <div className="gesture-card__thumb">
        {gesture.thumbnail_url
          ? <img src={gesture.thumbnail_url} alt={gesture.name} />
          : <div />
        }
      </div>
    </div>
  );
};

export default GestureCard;
