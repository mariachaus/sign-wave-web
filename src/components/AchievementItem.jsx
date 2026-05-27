import React, { useState, useEffect } from 'react';
import '../styles/components/AchievementItem.scss';

const AchievementItem = ({ achievement, locked = false }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!showModal) return;
    const handler = (e) => { if (e.key === 'Escape') setShowModal(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showModal]);

  return (
    <>
      <div className="achievement-wrapper" onClick={() => setShowModal(true)}>
        <div className={`achievement-card${locked ? ' achievement-card--locked' : ''}`}>
          <div className="achievement-icon-container">
            <div className="achievement-icon-shape">
              {achievement.icon_url ? (
                <img src={achievement.icon_url} alt={achievement.title} />
              ) : (
                <span className="default-icon">🏆</span>
              )}
            </div>
          </div>
          <div className="achievement-title">{achievement.title}</div>
        </div>
      </div>

      {showModal && (
        <div className="ach-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ach-modal" onClick={e => e.stopPropagation()}>
            <button className="ach-modal__close" onClick={() => setShowModal(false)}>×</button>

            <div className="ach-modal__icon">
              {achievement.icon_url ? (
                <img src={achievement.icon_url} alt={achievement.title} />
              ) : (
                <span>🏆</span>
              )}
            </div>

            <h3 className="ach-modal__name">{achievement.title}</h3>
            <p className="ach-modal__desc">{achievement.description}</p>
            <div className="ach-modal__xp">+{achievement.points_awarded} XP</div>

            {achievement.earned_at && (
              <div className="ach-modal__date">
                {new Date(achievement.earned_at).toLocaleDateString('uk-UA')}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AchievementItem;
