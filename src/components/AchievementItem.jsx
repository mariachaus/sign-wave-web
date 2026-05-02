import React from 'react';
import '../styles/components/AchievementItem.scss';

const AchievementItem = ({ achievement }) => {
  return (
    <div className="achievement-wrapper">
      <div className="achievement-card">
        {/* Блок з іконкою (тільки тут працює clip-path) */}
        <div className="achievement-icon-container">
          <div className="achievement-icon-shape">
            {achievement.icon_url ? (
              <img src={achievement.icon_url} alt={achievement.title} />
            ) : (
              <span className="default-icon">🏆</span>
            )}
          </div>
        </div>

        {/* Тултіп тепер СУСІД іконки, тому його не обріже */}
        <div className="achievement-tooltip">
          <p className="tooltip-description">{achievement.description}</p>
          <div className="tooltip-reward">+{achievement.points_awarded} XP</div>
          {achievement.earned_at && (
            <div className="tooltip-date">
              Earned: {new Date(achievement.earned_at).toLocaleDateString('uk-UA')}
            </div>
          )}
        </div>

        {/* Назва знизу */}
        <div className="achievement-title">{achievement.title}</div>
      </div>
    </div>
  );
};

export default AchievementItem;