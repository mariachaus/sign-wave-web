import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { IconDownload, IconFlame, IconStar } from './Icons';
import axios from 'axios';
import ImageBlock from './ImageBlock';
import WebcamAnalyzer from './WebcamAnalyzer';
import VideoUploadBlock from './VideoUploadBlock';
import { downloadCSVDataset } from '../utils/csv_manager';
import { downloadJSONDataset } from '../utils/json_manager';
import API_BASE_URL from '../config/api';
import '../styles/pages/MainDashboard.scss';

const MainDashboard = ({ models, isAdmin }) => {
  const [tab, setTab] = useState(isAdmin ? 'image' : null);
  const [imageDataset, setImageDataset] = useState([]);
  const [videoDataset, setVideoDataset] = useState([]);
  const [streak, setStreak] = useState(null);
  const [totalXP, setTotalXP] = useState(0);
  const [nextLesson, setNextLesson] = useState(null);
  const [dailyGesture, setDailyGesture] = useState(null);
  const [dailyTasks, setDailyTasks] = useState([]);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const fetchWidgets = (lang) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.get(`${API_BASE_URL}/api/user/streak`, { headers })
      .then(res => setStreak(res.data))
      .catch(() => {});

    axios.get(`${API_BASE_URL}/api/user/profile`, { headers })
      .then(res => setTotalXP(res.data.total_xp || 0))
      .catch(() => {});

    axios.get(`${API_BASE_URL}/api/lessons/next?lang=${lang}`, { headers })
      .then(res => setNextLesson(res.data))
      .catch(() => {});

    axios.get(`${API_BASE_URL}/api/gestures/daily?lang=${lang}`, { headers })
      .then(res => setDailyGesture(res.data))
      .catch(() => {});

    axios.get(`${API_BASE_URL}/api/daily-tasks/?lang=${lang}`, { headers })
      .then(res => setDailyTasks(res.data))
      .catch(err => console.error('Daily tasks error:', err.response?.data || err.message));
  };

  useEffect(() => {
    const lang = i18n.language || 'en';
    fetchWidgets(lang);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchWidgets(i18n.language || 'en');
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [i18n.language]);

  const taskLabel = (task) => {
    switch (task.task_type) {
      case 'complete_lesson':         return t('task_complete_lesson');
      case 'complete_lesson_perfect': return t('task_complete_lesson_perfect');
      case 'practice_gesture':        return t('task_practice_gesture', { name: task.gesture_name || '?' });
      case 'practice_count':          return t('task_practice_count', { n: task.target_value });
      case 'earn_xp':                 return t('task_earn_xp', { n: task.target_value });
      default:                        return task.task_type;
    }
  };

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <nav className="dashboard-sidebar__nav">

          {isAdmin && (
            <>
              <span className="dashboard-sidebar__label">ML Tools</span>
              <button className={`dashboard-nav-item${tab === 'image' ? ' dashboard-nav-item--active' : ''}`} onClick={() => setTab('image')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {t('tab_image')}
              </button>
              <button className={`dashboard-nav-item${tab === 'webcam' ? ' dashboard-nav-item--active' : ''}`} onClick={() => setTab('webcam')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                {t('tab_webcam')}
              </button>
              <button className={`dashboard-nav-item${tab === 'videoData' ? ' dashboard-nav-item--active' : ''}`} onClick={() => setTab('videoData')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><polygon points="10 11 8 13 10 15 10 11"/><line x1="16" y1="13" x2="12" y2="13"/></svg>
                {t('tab_video_data')}
              </button>
              <div className="dashboard-sidebar__divider" />
            </>
          )}

          <span className="dashboard-sidebar__label">{t('learn')}</span>
          <button className="dashboard-nav-item" onClick={() => navigate('/learn')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            {t('learn')}
          </button>
          <button className="dashboard-nav-item" onClick={() => navigate('/gestures')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            {t('library_of_gestures')}
          </button>
          <button className="dashboard-nav-item" onClick={() => navigate('/flashcards')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 2H8a2 2 0 0 0-2 2v2h12V4a2 2 0 0 0-2-2z"/></svg>
            {t('flashcards')}
          </button>

          <div className="dashboard-sidebar__bottom">
            <button className="dashboard-nav-item" onClick={() => navigate('/profile')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {t('my_profile')}
            </button>
            <button className="dashboard-nav-item" onClick={() => navigate('/settings')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              {t('settings')}
            </button>
          </div>

        </nav>
      </aside>

      <main className="dashboard-main">
      <div className="dashboard-widgets">

        {/* Stats row */}
        <div className="widgets-stats-row">
          <div className="widget-stat widget-stat--streak">
            <span className="widget-stat__icon"><IconFlame /></span>
            <div>
              <div className="widget-stat__value">{streak ? streak.current_streak : 0}</div>
              <div className="widget-stat__label">{t('current_streak')}</div>
            </div>
            {streak?.freeze_shields > 0 && (
              <div className="widget-stat__badge shield-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                ×{streak.freeze_shields}
                <span className="shield-badge__tooltip">{t('freeze_shields_tooltip')}</span>
              </div>
            )}
          </div>
          <div className="widget-stat widget-stat--xp">
            <span className="widget-stat__icon"><IconStar /></span>
            <div>
              <div className="widget-stat__value">{totalXP.toLocaleString()}</div>
              <div className="widget-stat__label">XP {t('earned') || 'earned'}</div>
            </div>
          </div>
        </div>

        {/* Continue lesson */}
        {nextLesson && (
          <div className="widget-next-lesson">
            <div className="widget-next-lesson__text">
              <div className="widget-next-lesson__meta">{nextLesson.level_name}</div>
              <div className="widget-next-lesson__name">{nextLesson.lesson_name}</div>
            </div>
            <button
              className="widget-next-lesson__btn"
              onClick={() => navigate(`/lesson/${nextLesson.lesson_id}`)}
            >
              {t('continue')} →
            </button>
          </div>
        )}

        {/* Daily tasks */}
        {dailyTasks.length > 0 && (
          <div className="widget-daily-tasks">
            <div className="widget-daily-tasks__header">
              <span>{t('daily_tasks')}</span>
              <span className="widget-daily-tasks__count">
                {dailyTasks.filter(t => t.is_completed).length}/{dailyTasks.length}
              </span>
            </div>
            <div className="widget-daily-tasks__progress">
              <div
                className="widget-daily-tasks__progress-fill"
                style={{ width: `${(dailyTasks.filter(t => t.is_completed).length / dailyTasks.length) * 100}%` }}
              />
            </div>
            {dailyTasks.map(task => (
              <div key={task.id} className={`daily-task${task.is_completed ? ' daily-task--done' : ''}`}>
                <div className="daily-task__left">
                  <div className="daily-task__checkbox">
                    {task.is_completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span className="daily-task__label">{taskLabel(task)}</span>
                </div>
                <div className="daily-task__right">
                  <div className="daily-task__bar-wrap">
                    <div
                      className="daily-task__bar"
                      style={{ width: `${task.is_completed ? 100 : Math.min(100, Math.round(((task.current_value || 0) / (task.target_value || 1)) * 100))}%` }}
                    />
                  </div>
                  <span className="daily-task__xp">+{task.xp_reward} XP</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sign of the day */}
        {dailyGesture && (
          <div className="widget-god">
            <div className="widget-god__chip">{t('gesture_of_day')}</div>
            <div className="widget-god__content">
              {dailyGesture.illustration_url ? (
                <img src={dailyGesture.illustration_url} alt={dailyGesture.name} className="widget-god__thumb" />
              ) : (
                <div className="widget-god__thumb-placeholder">🤟</div>
              )}
              <div className="widget-god__info">
                <div className="widget-god__name">{dailyGesture.name}</div>
                <button className="widget-god__btn" onClick={() => navigate(`/gestures/${dailyGesture.id}`)}>
                  {t('view_details')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isAdmin && <section id="demos">
        {tab === 'image' && (
          <div className="dashboard-content image-mode">
            <h1>{t('image_detection')}</h1>
            <div className="upload-grid">
              <ImageBlock
                poseModel={models.image.pose}
                handModel={models.image.hand}
                onAddRecord={(r) => setImageDataset(prev => [...prev, r])}
              />
            </div>
            <button className="download-btn" onClick={() => downloadCSVDataset(imageDataset)}>
              <IconDownload /> {t('download_csv')}
            </button>
          </div>
        )}

        {tab === 'webcam' && (
          <div className="dashboard-content webcam-mode">
            <h1>{t('live_testing')}</h1>
            <WebcamAnalyzer poseModel={models.video.pose} handModel={models.video.hand} isMirror={localStorage.getItem('mirror_view') !== 'false'} />
          </div>
        )}

        {tab === 'videoData' && (
          <div className="dashboard-content video-data-mode">
            <h1>{t('extract_sequences')}</h1>
            <VideoUploadBlock
              poseModel={models.video.pose}
              handModel={models.video.hand}
              onAddSequence={(s) => setVideoDataset(prev => [...prev, s])}
            />
            <button className="download-btn" onClick={() => downloadJSONDataset(videoDataset)}>
              <IconDownload /> {t('download_json')}{videoDataset.length > 0 && ` (${videoDataset.length})`}
            </button>
          </div>
        )}
      </section>}
      </main>
    </div>
  );
};

export default MainDashboard;
