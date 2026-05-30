import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HERO_SIGNS = [
  { word: 'Привіт',    emoji: '👋', bg: '#EDE9FE' },
  { word: 'Будь ласка',emoji: '🙏', bg: '#D1FAE5' },
  { word: 'Добре',     emoji: '👍', bg: '#FFE4E6' },
  { word: 'Я',      emoji: '🤞', bg: '#FEF3C7' },
];

import { IconDownload, IconFlame, IconStar } from './Icons';
import axios from 'axios';
import ImageBlock from './ImageBlock';
import WebcamAnalyzer from './WebcamAnalyzer';
import VideoUploadBlock from './VideoUploadBlock';
import VideoInferenceBlock from './VideoInferenceBlock';
import { downloadCSVDataset } from '../utils/csv_manager';
import { downloadJSONDataset } from '../utils/json_manager';
import API_BASE_URL from '../config/api';
import '../styles/pages/MainDashboard.scss';

const MainDashboard = ({ models, isAdmin, isAuthenticated, isLoaded }) => {
  const [tab, setTab] = useState(null);
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
    if (!isAuthenticated) return;
    const lang = i18n.language || 'en';
    fetchWidgets(lang);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchWidgets(i18n.language || 'en');
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [i18n.language, isAuthenticated]);

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

  const [animSign, setAnimSign] = useState(0);
  useEffect(() => {
    if (isAuthenticated) return;
    const id = setInterval(() => setAnimSign(v => (v + 1) % HERO_SIGNS.length), 2200);
    return () => clearInterval(id);
  }, [isAuthenticated]);


  if (!isAuthenticated) {
    const sign = HERO_SIGNS[animSign];
    const features = [
      { icon: '📚', key: 'welcome_feature_lessons',     color: '#EDE9FE' },
      { icon: '📷', key: 'welcome_feature_webcam',      color: '#D1FAE5' },
      { icon: '🔁', key: 'welcome_feature_sm2',         color: '#FEF3C7' },
      { icon: '🔥', key: 'welcome_feature_gamification',color: '#FFE4E6' },
    ];
    return (
      <div className="dw">
        {/* lang switcher */}
        <div className="dw__lang">
          {['uk','en'].map(lng => (
            <button key={lng}
              className={`dw__lang-btn${i18n.language===lng?' dw__lang-btn--active':''}`}
              onClick={() => i18n.changeLanguage(lng)}>
              {{ uk: 'УКР', en: 'ENG' }[lng]}
            </button>
          ))}
        </div>

        {/* ── HERO ── */}
        <section className="dw__hero">
          {/* left */}
          <div className="dw__hero-text">
            <div className="dw__badge-chip">
              <span className="dw__badge-dot" />
              {i18n.language === 'uk' ? 'Нове: розпізнавання через камеру' : 'New: camera-based recognition'}
            </div>
            <h1 className="dw__title">
              {i18n.language === 'uk'
                ? <>Говори <span className="dw__title-accent">руками</span>.</>
                : <>Speak with your <span className="dw__title-accent">hands</span>.</>}
            </h1>
            <p className="dw__subtitle">{t('welcome_subtitle')}</p>
            <div className="dw__actions">
              <Link to="/auth" className="dw__btn dw__btn--primary">{t('welcome_get_started')}</Link>
              <span className="dw__signin">
                {t('welcome_already_account')}{' '}
                <Link to="/auth" className="dw__link">{t('sign_in')}</Link>
              </span>
            </div>
          </div>

          {/* right: animated sign card */}
          <div className="dw__hero-visual">
            {/* decorative blob */}
            <div className="dw__blob" />

            {/* floating badges */}
            <div className="dw__float dw__float--tl">
              <span style={{ color: 'oklch(74% 0.18 45)', flexShrink: 0 }}><IconFlame size={20} /></span>
              <div><div className="dw__float-val">14 {i18n.language==='uk'?'днів':'days'}</div><div className="dw__float-sub">{i18n.language==='uk'?'стрік':'streak'}</div></div>
            </div>
            <div className="dw__float dw__float--tr">
              <span style={{ color: 'oklch(74% 0.18 75)', flexShrink: 0 }}><IconStar size={20} /></span>
              <div><div className="dw__float-val">+25 XP</div><div className="dw__float-sub">{i18n.language==='uk'?'зароблено':'earned'}</div></div>
            </div>
            <div className="dw__float dw__float--bl">
              <span className="dw__float-check">✓</span>
              <div><div className="dw__float-val">{i18n.language==='uk'?'Урок пройдено':'Lesson done'}</div><div className="dw__float-sub">А-Г</div></div>
            </div>
            <div className="dw__float dw__float--br">
              <span style={{ flexShrink: 0 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="oklch(74% 0.18 55)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" fill="oklch(74% 0.18 55)" fillOpacity="0.2"/><path d="M10 14.66L7 22H17L14 14.66Z" fill="oklch(74% 0.18 55)" fillOpacity="0.2" stroke="none"/><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg></span>
              <div><div className="dw__float-val">{i18n.language==='uk'?'Досягнення!':'Badge unlocked'}</div><div className="dw__float-sub">{i18n.language==='uk'?'Перший жест':'First Sign'}</div></div>
            </div>

            {/* center card */}
            <div className="dw__sign-card">
              <div className="dw__sign-visual" style={{ background: `linear-gradient(135deg, ${sign.bg}, ${sign.bg}88)` }}>
                <div key={animSign} className="dw__sign-emoji">{sign.emoji}</div>
              </div>
              <div className="dw__sign-label">{i18n.language==='uk'?'Жест для':'Sign for'}</div>
              <div key={`w-${animSign}`} className="dw__sign-word">{sign.word}</div>
              <div className="dw__sign-dots">
                {HERO_SIGNS.map((_, i) => (
                  <div key={i} className={`dw__sign-dot${i===animSign?' dw__sign-dot--active':''}`} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="dw__features">
          <div className="dw__features-header">
            <span className="dw__features-chip">
              {i18n.language === 'uk' ? 'Що ви отримаєте' : 'What you get'}
            </span>
            <h2 className="dw__features-title">
              {i18n.language === 'uk' ? 'Все, щоб жести залишились з вами' : 'Everything to make signing stick'}
            </h2>
          </div>
          <div className="dw__features-grid">
            {[
              {
                icon: '📚',
                color: 'oklch(94% 0.06 290)',
                uk_title: 'Структуровані уроки',
                en_title: 'Bite-sized lessons',
                uk_desc: 'Вивчайте алфавіт, привітання та повсякденні фрази за 5–10 хвилин.',
                en_desc: 'Learn the alphabet, greetings and everyday phrases in 5–10 minute lessons.',
              },
              {
                icon: '📹',
                color: 'oklch(95% 0.06 165)',
                uk_title: 'Практика через камеру',
                en_title: 'Practice with camera',
                uk_desc: 'Показуйте жест у камеру — система перевірить правильність форми руки в реальному часі.',
                en_desc: "Sign back to your screen — we'll check your handshape in real time.",
              },
              {
                icon: '🔥',
                color: 'oklch(95% 0.06 25)',
                uk_title: 'Щоденні стріки',
                en_title: 'Daily streaks',
                uk_desc: 'Маленькі щоденні цілі формують звичку. Не переривайте ланцюжок!',
                en_desc: "Tiny daily goals that build a habit. Don't break the chain!",
              },
              {
                icon: '📖',
                color: 'oklch(96% 0.06 75)',
                uk_title: 'Словник жестів',
                en_title: 'Sign dictionary',
                uk_desc: 'Знаходьте будь-який жест, дивіться як він виконується та зберігайте улюблені.',
                en_desc: 'Look up any sign, see how it\'s made, save your favourites.',
              },
            ].map(f => (
              <div key={f.en_title} className="dw__feature-card">
                <div className="dw__feature-icon" style={{ background: f.color }}>{f.icon}</div>
                <h3 className="dw__feature-title">{i18n.language === 'uk' ? f.uk_title : f.en_title}</h3>
                <p className="dw__feature-desc">{i18n.language === 'uk' ? f.uk_desc : f.en_desc}</p>
              </div>
            ))}
          </div>
        </section>


        {/* ── WHY SIGN LANGUAGE ── */}
        <section className="dw__why">
          <div className="dw__why-inner">
            <span className="dw__why-chip">
              {i18n.language === 'uk' ? 'Навіщо жестова мова?' : 'Why sign language?'}
            </span>
            <h2 className="dw__why-heading">
              {i18n.language === 'uk'
                ? '430 мільйонів людей по всьому світу. Один простий навик, що вас з\'єднає.'
                : '430 million people worldwide. One simple skill that connects you.'}
            </h2>
            <p className="dw__why-body">
              {i18n.language === 'uk'
                ? 'Жестова мова відкриває розмови з людьми з порушенням слуху — колегами, друзями, сусідами та родиною. Це також одна з найкрасивіших і найвиразніших мов у світі.'
                : "Sign language opens conversations with deaf colleagues, friends, neighbours, and family. It's also one of the most beautiful, expressive languages in the world."}
            </p>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="dw__cta">
          <div className="dw__cta-box">
            <span className="dw__cta-deco dw__cta-deco--tl">🤟</span>
            <span className="dw__cta-deco dw__cta-deco--br">👋</span>
            <span className="dw__cta-deco dw__cta-deco--tr">✋</span>
            <span className="dw__cta-deco dw__cta-deco--bl">🙏</span>
            <div className="dw__cta-inner">
              <h2 className="dw__cta-heading">
                {i18n.language === 'uk'
                  ? 'Ваш перший жест — за один крок.'
                  : 'Your first sign is one tap away.'}
              </h2>
              <p className="dw__cta-sub">
                {i18n.language === 'uk'
                  ? 'Лише п\'ять хвилин на день.'
                  : 'Just five minutes a day.'}
              </p>
              <div className="dw__cta-actions">
                <Link to="/auth" className="dw__cta-btn dw__cta-btn--white">
                  {i18n.language === 'uk' ? 'Створити акаунт' : 'Create account'}
                </Link>
                <Link to="/auth" className="dw__cta-btn dw__cta-btn--ghost">
                  {i18n.language === 'uk' ? 'Увійти' : 'Sign in'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="dw__footer">
          <div className="dw__footer-left">
            <span className="dw__footer-logo-icon">🤟</span>
            <span className="dw__footer-logo-name">SignWave</span>
            <span className="dw__footer-year">© {new Date().getFullYear()}</span>
          </div>
          <div className="dw__footer-right">
            <Link to="/terms" className="dw__link">{t('terms_of_use')}</Link>
          </div>
        </footer>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="loading-container">
        <p>Loading models and data... Please wait</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <nav className="dashboard-sidebar__nav">

          <button className={`dashboard-nav-item${tab === null ? ' dashboard-nav-item--active' : ''}`} onClick={() => setTab(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {t('dashboard') || 'Dashboard'}
          </button>

          <div className="dashboard-sidebar__divider" />
          <span className="dashboard-sidebar__label">{t('learn')}</span>
          <button className="dashboard-nav-item" onClick={() => navigate('/learn')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            {t('learn')}
          </button>
          <button className="dashboard-nav-item" onClick={() => navigate('/gestures')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            {t('library_of_gestures')}
          </button>
          <button className="dashboard-nav-item" onClick={() => navigate('/practice')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            {t('practice')}
          </button>

          {isAdmin && (
            <>
              <div className="dashboard-sidebar__divider" />
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
              <button className={`dashboard-nav-item${tab === 'inferenceTest' ? ' dashboard-nav-item--active' : ''}`} onClick={() => setTab('inferenceTest')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Inference Test
              </button>
            </>
          )}

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
                <div className="shield-badge__popup">
                  <p className="shield-badge__popup-title">{t('shield_info_title')}</p>
                  <ul className="shield-badge__popup-list">
                    <li>{t('shield_info_tip1')}</li>
                    <li>{t('shield_info_tip2')}</li>
                    <li>{t('shield_info_tip3')}</li>
                  </ul>
                </div>
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
            <ImageBlock
              poseModel={models.image.pose}
              handModel={models.image.hand}
              onAddRecord={(r) => setImageDataset(prev => [...prev, r])}
            />
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

        {tab === 'inferenceTest' && (
          <div className="dashboard-content">
            <h1>Video Inference Test</h1>
            <VideoInferenceBlock
              poseModel={models.video.pose}
              handModel={models.video.hand}
            />
          </div>
        )}
      </section>}
      </main>
    </div>
  );
};

export default MainDashboard;
