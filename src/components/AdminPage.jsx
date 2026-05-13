import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API, headers } from './admin/adminUtils';
import AdminUsersTab from './admin/AdminUsersTab';
import AdminGesturesTab from './admin/AdminGesturesTab';
import AdminLevelsTab from './admin/AdminLevelsTab';
import AdminLessonsTab from './admin/AdminLessonsTab';
import '../styles/pages/AdminPage.scss';

const TAB_KEYS = [
  {
    key: 'overview', i18n: 'admin_tab_overview',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  },
  {
    key: 'users', i18n: 'admin_tab_users',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    key: 'gestures', i18n: 'admin_tab_gestures',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10.5V4a2 2 0 0 0-4 0v7"/><path d="M10 10.5V6a2 2 0 0 0-4 0v10a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-3a2 2 0 0 0-4 0"/></svg>,
  },
  {
    key: 'levels', i18n: 'admin_tab_levels',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  },
  {
    key: 'lessons', i18n: 'admin_tab_lessons',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
];

const AdminPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/admin/stats`, { headers: headers() })
      .then(res => setStats(res.data))
      .catch(err => { if (err.response?.status === 403) navigate('/'); });
  }, [navigate]);

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <button className="admin-sidebar__back" onClick={() => navigate('/')} aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <span className="admin-sidebar__title">{t('admin_panel')}</span>
        </div>
        <nav className="admin-sidebar__nav">
          {TAB_KEYS.map(item => (
            <button
              key={item.key}
              className={`admin-nav-item${tab === item.key ? ' admin-nav-item--active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              {item.icon}
              {t(item.i18n)}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        {tab === 'overview' && stats && (
          <div className="admin-stats">
            {[
              { label: t('admin_total_users'),     value: stats.total_users },
              { label: t('admin_active_users'),    value: stats.active_users },
              { label: t('admin_total_gestures'),  value: stats.total_gestures },
              { label: t('admin_active_gestures'), value: stats.active_gestures },
              { label: t('admin_total_lessons'),   value: stats.total_lessons },
              { label: t('admin_total_xp'),        value: stats.total_xp.toLocaleString() },
            ].map(s => (
              <div key={s.label} className="admin-stat-card">
                <div className="admin-stat-card__value">{s.value}</div>
                <div className="admin-stat-card__label">{s.label}</div>
              </div>
            ))}
          </div>
        )}
        {tab === 'users'    && <AdminUsersTab />}
        {tab === 'gestures' && <AdminGesturesTab />}
        {tab === 'levels'   && <AdminLevelsTab />}
        {tab === 'lessons'  && <AdminLessonsTab />}
      </main>
    </div>
  );
};

export default AdminPage;
