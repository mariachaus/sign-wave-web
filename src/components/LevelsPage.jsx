import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../config/api';
import '../styles/pages/LevelsPage.scss';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const LevelsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/lessons/levels?lang=${i18n.language}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => { setLevels(data); setLoading(false); })
      .catch(err => { console.error('Failed to fetch levels:', err); setError(err.message); setLoading(false); });
  }, [i18n.language, token]);

  const handleLessonClick = (lesson) => {
    if (lesson.is_locked) return;
    navigate(`/lesson/${lesson.id}`);
  };

  const totalLessons = levels.reduce((sum, l) => sum + l.lessons.length, 0);
  const totalCompleted = levels.reduce((sum, l) => sum + l.lessons.filter(ls => ls.is_completed).length, 0);
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  if (loading) {
    return <div className="levels-page levels-page--loading">{t('profile_loading')}</div>;
  }

  if (error) {
    return <div className="levels-page levels-page--loading">{t('user_not_found')}</div>;
  }

  return (
    <div className="levels-page">
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate('/')} aria-label="Go back">
          <BackIcon />
        </button>
        <h2 className="page-header__title">{t('learn')}</h2>
      </div>

      {levels.length > 0 && (
        <div className="levels-overall-progress">
          <div className="levels-overall-progress__top">
            <span className="levels-overall-progress__label">{t('overall_progress')}</span>
            <span className="levels-overall-progress__pct">{overallPct}%</span>
          </div>
          <div className="levels-overall-progress__bar">
            <div className="levels-overall-progress__fill" style={{ width: `${overallPct}%` }} />
          </div>
          <div className="levels-overall-progress__sub">
            {totalCompleted} / {totalLessons} {t('lessons_completed')}
          </div>
        </div>
      )}

      {levels.length === 0 && (
        <p className="levels-page__empty">{t('no_lessons_available')}</p>
      )}

      {levels.map(level => {
        const completedCount = level.lessons.filter(l => l.is_completed).length;
        const totalCount = level.lessons.length;
        const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        return (
          <section key={level.id} className="level-section">
            <div className="level-section__header">
              <div className="level-section__meta">
                <h2 className="level-section__name">{level.name}</h2>
                {level.description && (
                  <p className="level-section__desc">{level.description}</p>
                )}
              </div>
              <div className="level-section__progress-info">
                <span className="level-section__progress-text">
                  {completedCount}/{totalCount} {t('completed_short')}
                </span>
                <div className="level-section__progress-bar">
                  <div
                    className="level-section__progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="lesson-list">
              {level.lessons.map(lesson => (
                <button
                  key={lesson.id}
                  className={[
                    'lesson-card',
                    lesson.is_completed ? 'lesson-card--completed' : '',
                    lesson.is_locked ? 'lesson-card--locked' : '',
                  ].join(' ')}
                  onClick={() => handleLessonClick(lesson)}
                  disabled={lesson.is_locked}
                  title={lesson.is_locked ? t('complete_previous_lesson') : undefined}
                >
                  <div className="lesson-card__icon">
                    {lesson.is_completed ? <CheckIcon /> : lesson.is_locked ? <LockIcon /> : lesson.order_index}
                  </div>

                  <div className="lesson-card__body">
                    <span className="lesson-card__name">{lesson.name}</span>
                    {lesson.description && (
                      <span className="lesson-card__desc">{lesson.description}</span>
                    )}
                  </div>

                  {lesson.is_completed && (
                    <span className="lesson-card__badge">{t('completed')}</span>
                  )}

                  {!lesson.is_locked && !lesson.is_completed && (
                    <svg className="lesson-card__arrow" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default LevelsPage;
