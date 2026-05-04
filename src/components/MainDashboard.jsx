import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ImageBlock from './ImageBlock';
import WebcamAnalyzer from './WebcamAnalyzer';
import VideoUploadBlock from './VideoUploadBlock';
import { downloadCSVDataset } from '../utils/csv_manager';
import { downloadJSONDataset } from '../utils/json_manager';
import API_BASE_URL from '../config/api';
import '../styles/pages/MainDashboard.scss';

const MainDashboard = ({ models }) => {
  const [tab, setTab] = useState('image');
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
    <>
      <nav className="main-nav">
        <button
          className={`nav-tab ${tab === 'image' ? 'active' : ''}`}
          onClick={() => setTab('image')}
        >
          🖼️ {t('tab_image')}
        </button>
        <button
          className={`nav-tab ${tab === 'webcam' ? 'active' : ''}`}
          onClick={() => setTab('webcam')}
        >
          🎥 {t('tab_webcam')}
        </button>
        <button
          className={`nav-tab ${tab === 'videoData' ? 'active' : ''}`}
          onClick={() => setTab('videoData')}
        >
          🎬 {t('tab_video_data')}
        </button>
        <button
          className="nav-tab"
          onClick={() => navigate('/gestures')}
        >
          📖 {t('library_of_gestures')}
        </button>

        <button
          className="nav-tab"
          onClick={() => navigate('/learn')}
        >
          🎓 {t('learn')}
        </button>

        <button
          className="nav-profile-btn"
          onClick={() => navigate('/profile')}
        >
          👤 {t('my_profile')}
        </button>
      </nav>

      <div className="dashboard-widgets">

        {/* Stats row */}
        <div className="widgets-stats-row">
          <div className="widget-stat widget-stat--streak">
            <span className="widget-stat__icon">🔥</span>
            <div>
              <div className="widget-stat__value">{streak ? streak.current_streak : 0}</div>
              <div className="widget-stat__label">{t('current_streak')}</div>
            </div>
            {streak?.freeze_shields > 0 && (
              <div className="widget-stat__badge">🛡️ ×{streak.freeze_shields}</div>
            )}
          </div>
          <div className="widget-stat widget-stat--xp">
            <span className="widget-stat__icon">⭐</span>
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
                  {t('view_details')} →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <section id="demos">
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
              💾 {t('download_csv')}
            </button>
          </div>
        )}

        {tab === 'webcam' && (
          <div className="dashboard-content webcam-mode">
            <h1>{t('live_testing')}</h1>
            <WebcamAnalyzer poseModel={models.video.pose} handModel={models.video.hand} />
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
              💾 {t('download_json')}
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default MainDashboard;
