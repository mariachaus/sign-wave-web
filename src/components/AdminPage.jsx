import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API, headers } from './admin/adminUtils';
import AdminUsersTab from './admin/AdminUsersTab';
import AdminGesturesTab from './admin/AdminGesturesTab';
import AdminLevelsTab from './admin/AdminLevelsTab';
import AdminLessonsTab from './admin/AdminLessonsTab';
import AdminCategoriesTab from './admin/AdminCategoriesTab';
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
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10.5V4a2 2 0 0 0-4 0v7"/><path d="M10 10.5V6a2 2 0 0 0-4 0v10a6 6 0 0 0 12 0"/></svg>,
  },
  {
    key: 'levels', i18n: 'admin_tab_levels',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  },
  {
    key: 'lessons', i18n: 'admin_tab_lessons',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
  {
    key: 'categories', i18n: 'admin_tab_categories',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  },
];

const AdminPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [showClasses, setShowClasses] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState('');

  useEffect(() => {
    axios.get(`${API}/api/admin/stats`, { headers: headers() })
      .then(res => setStats(res.data))
      .catch(err => { if (err.response?.status === 403) navigate('/'); });
    axios.get(`${API}/api/admin/model-info`, { headers: headers() })
      .then(res => setModelInfo(res.data))
      .catch(() => {});
    axios.get(`${API}/api/admin/models`, { headers: headers() })
      .then(res => setAvailableModels(res.data))
      .catch(() => {});
  }, [navigate]);

  const handleActivate = async (filename) => {
    setActivating(true);
    setActivateError('');
    try {
      await axios.post(`${API}/api/admin/model-activate`, { model_file: filename }, { headers: headers() });
      const [info, models] = await Promise.all([
        axios.get(`${API}/api/admin/model-info`, { headers: headers() }),
        axios.get(`${API}/api/admin/models`, { headers: headers() }),
      ]);
      setModelInfo(info.data);
      setAvailableModels(models.data);
    } catch (e) {
      setActivateError(e.response?.data?.detail || t('admin_error_generic'));
    } finally {
      setActivating(false);
    }
  };

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
          <>
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

            {modelInfo && (
              <div className="admin-model-card">
                <div className="admin-model-card__header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                  <span className="admin-model-card__title">{t('admin_model_title')}</span>
                  <span className={`admin-badge ${modelInfo.model_loaded ? 'admin-badge--on' : 'admin-badge--off'}`}>
                    {modelInfo.model_loaded ? t('admin_model_loaded') : t('admin_model_not_loaded')}
                  </span>
                </div>

                <div className="admin-model-card__filename">{modelInfo.model_file}</div>

                <div className="admin-model-card__grid">
                  {[
                    { label: t('admin_model_classes'),  value: modelInfo.num_classes },
                    { label: t('admin_model_frames'),   value: modelInfo.window_frames },
                    { label: t('admin_model_features'), value: modelInfo.features_per_frame },
                    { label: t('admin_model_size'),     value: `${modelInfo.model_size_mb} MB` },
                    { label: t('admin_model_params'),   value: modelInfo.param_count != null ? modelInfo.param_count.toLocaleString() : '—' },
                  ].map(item => (
                    <div key={item.label} className="admin-model-card__item">
                      <div className="admin-model-card__item-value">{item.value}</div>
                      <div className="admin-model-card__item-label">{item.label}</div>
                    </div>
                  ))}
                </div>

                <button
                  className="admin-btn admin-btn--sm"
                  style={{ marginTop: 12 }}
                  onClick={() => setShowClasses(v => !v)}
                >
                  {showClasses ? t('admin_model_hide_classes') : t('admin_model_show_classes', { n: modelInfo.num_classes })}
                </button>

                {showClasses && (
                  <div className="admin-model-card__classes">
                    {modelInfo.classes.map(cls => (
                      <span key={cls} className="admin-code">{cls}</span>
                    ))}
                  </div>
                )}

                {availableModels.length > 0 && (
                  <div className="admin-model-card__switcher">
                    <div className="admin-model-card__switcher-title">{t('admin_model_available')}</div>
                    {activateError && <div className="admin-error" style={{ marginBottom: 8 }}>{activateError}</div>}
                    {availableModels.map(m => (
                      <div key={m.filename} className={`admin-model-row${m.is_active ? ' admin-model-row--active' : ''}`}>
                        <div className="admin-model-row__name">
                          <span className="admin-code">{m.filename}</span>
                          <span className="admin-model-row__meta">{m.size_mb} MB</span>
                          {!m.has_labels && <span className="admin-badge admin-badge--off">{t('admin_model_no_labels')}</span>}
                        </div>
                        {m.is_active
                          ? <span className="admin-badge admin-badge--on">{t('admin_model_loaded')}</span>
                          : <button
                              className="admin-btn admin-btn--sm admin-btn--primary"
                              disabled={activating}
                              onClick={() => handleActivate(m.filename)}
                            >
                              {activating ? '...' : t('admin_model_activate')}
                            </button>
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {tab === 'users'      && <AdminUsersTab />}
        {tab === 'gestures'   && <AdminGesturesTab />}
        {tab === 'levels'     && <AdminLevelsTab />}
        {tab === 'lessons'    && <AdminLessonsTab />}
        {tab === 'categories' && <AdminCategoriesTab />}
      </main>
    </div>
  );
};

export default AdminPage;
