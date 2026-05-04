import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../config/api';
import '../styles/pages/AdminPage.scss';

const USER_PAGE_SIZE = 25;
const GESTURE_PAGE_SIZE = 50;

const TAB_KEYS = [
  { key: 'overview', i18n: 'admin_tab_overview' },
  { key: 'users',    i18n: 'admin_tab_users' },
  { key: 'gestures', i18n: 'admin_tab_gestures' },
];

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview');

  const [stats, setStats] = useState(null);

  const [users, setUsers] = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [userRole, setUserRole] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const debouncedUserSearch = useDebounce(userSearch);

  const [gestures, setGestures] = useState([]);
  const [gestureTotal, setGestureTotal] = useState(0);
  const [gestureSearch, setGestureSearch] = useState('');
  const [gesturePage, setGesturePage] = useState(0);
  const [gestureStatus, setGestureStatus] = useState('');
  const [gestureDynamic, setGestureDynamic] = useState('');
  const debouncedGestureSearch = useDebounce(gestureSearch);
  const [editingId, setEditingId] = useState(null);
  const [editUrls, setEditUrls] = useState({ video_url: '', illustration_url: '', thumbnail_url: '' });
  const [showGestureForm, setShowGestureForm] = useState(false);
  const [newGesture, setNewGesture] = useState({ name_en: '', model_label: '', video_url: '', is_dynamic: false });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/admin/stats`, { headers: headers() })
      .then(res => setStats(res.data))
      .catch(err => { if (err.response?.status === 403) navigate('/'); });
  }, [navigate]);

  const loadUsers = useCallback((page = userPage) => {
    const params = { search: debouncedUserSearch, skip: page * USER_PAGE_SIZE, limit: USER_PAGE_SIZE };
    if (userRole) params.role = userRole;
    if (userStatus !== '') params.is_active = userStatus === 'true';
    axios.get(`${API_BASE_URL}/api/admin/users`, { headers: headers(), params })
      .then(res => { setUsers(res.data.users); setUserTotal(res.data.total); })
      .catch(() => {});
  }, [debouncedUserSearch, userPage, userRole, userStatus]);

  const loadGestures = useCallback((page = gesturePage) => {
    const params = { search: debouncedGestureSearch, skip: page * GESTURE_PAGE_SIZE, limit: GESTURE_PAGE_SIZE };
    if (gestureStatus !== '') params.is_active = gestureStatus === 'true';
    if (gestureDynamic !== '') params.is_dynamic = gestureDynamic === 'true';
    axios.get(`${API_BASE_URL}/api/admin/gestures`, { headers: headers(), params })
      .then(res => { setGestures(res.data.gestures); setGestureTotal(res.data.total); })
      .catch(() => {});
  }, [debouncedGestureSearch, gesturePage, gestureStatus, gestureDynamic]);

  useEffect(() => { if (tab === 'users')    loadUsers();    }, [tab, loadUsers]);
  useEffect(() => { if (tab === 'gestures') loadGestures(); }, [tab, loadGestures]);

  const fail = (err) => setErrorMsg(err.response?.data?.detail || t('admin_error_generic'));

  // users
  const patchUser = (id, data) =>
    axios.patch(`${API_BASE_URL}/api/admin/users/${id}`, data, { headers: headers() })
      .then(() => loadUsers(userPage)).catch(fail);

  const deleteUser = (id, name) => {
    if (!window.confirm(t('admin_confirm_delete_user', { name }))) return;
    axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, { headers: headers() })
      .then(() => loadUsers(userPage)).catch(fail);
  };

  // gestures
  const patchGesture = (id, data) =>
    axios.patch(`${API_BASE_URL}/api/admin/gestures/${id}`, data, { headers: headers() })
      .then(() => loadGestures(gesturePage)).catch(fail);

  const deleteGesture = (id, name) => {
    if (!window.confirm(t('admin_confirm_delete_gesture', { name }))) return;
    axios.delete(`${API_BASE_URL}/api/admin/gestures/${id}`, { headers: headers() })
      .then(() => loadGestures(gesturePage)).catch(fail);
  };

  const createGesture = () => {
    axios.post(`${API_BASE_URL}/api/admin/gestures`, newGesture, { headers: headers() })
      .then(() => {
        setGesturePage(0);
        loadGestures(0);
        setShowGestureForm(false);
        setNewGesture({ name_en: '', model_label: '', video_url: '', is_dynamic: false });
      }).catch(fail);
  };

  const startEditUrls = (g) => {
    setEditingId(g.id);
    setEditUrls({ video_url: g.video_url, illustration_url: g.illustration_url, thumbnail_url: g.thumbnail_url });
  };

  const saveUrls = (id) =>
    axios.patch(`${API_BASE_URL}/api/admin/gestures/${id}`, editUrls, { headers: headers() })
      .then(() => { loadGestures(gesturePage); setEditingId(null); })
      .catch(fail);

  return (
    <div className="admin-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <button className="page-header__back" onClick={() => navigate('/')} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="page-header__title">{t('admin_panel')}</h1>
      </div>

      {errorMsg && (
        <div className="admin-error" onClick={() => setErrorMsg('')}>
          {errorMsg} &times;
        </div>
      )}

      <div className="admin-tabs">
        {TAB_KEYS.map(item => (
          <button
            key={item.key}
            className={`admin-tab${tab === item.key ? ' admin-tab--active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {t(item.i18n)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
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

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div className="admin-section">
          <div className="admin-toolbar">
            <input
              className="admin-search"
              placeholder={t('admin_search_users')}
              value={userSearch}
              onChange={e => { setUserSearch(e.target.value); setUserPage(0); }}
            />
            <select className="admin-filter"
              value={userRole}
              onChange={e => { setUserRole(e.target.value); setUserPage(0); }}>
              <option value="">{t('admin_filter_all_roles')}</option>
              <option value="admin">{t('admin_role_admin')}</option>
              <option value="user">{t('admin_role_user')}</option>
            </select>
            <select className="admin-filter"
              value={userStatus}
              onChange={e => { setUserStatus(e.target.value); setUserPage(0); }}>
              <option value="">{t('admin_filter_all_statuses')}</option>
              <option value="true">{t('admin_badge_active')}</option>
              <option value="false">{t('admin_badge_inactive')}</option>
            </select>
            <div className="admin-pagination">
              <button className="admin-btn admin-btn--sm"
                disabled={userPage === 0}
                onClick={() => { setUserPage(p => p - 1); loadUsers(userPage - 1); }}>‹</button>
              <span className="admin-pagination__info">
                {userTotal === 0 ? '0' : `${userPage * USER_PAGE_SIZE + 1}–${Math.min((userPage + 1) * USER_PAGE_SIZE, userTotal)}`} / {userTotal}
              </span>
              <button className="admin-btn admin-btn--sm"
                disabled={(userPage + 1) * USER_PAGE_SIZE >= userTotal}
                onClick={() => { setUserPage(p => p + 1); loadUsers(userPage + 1); }}>›</button>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin_col_id')}</th><th>{t('admin_col_username')}</th><th>{t('admin_col_email')}</th>
                  <th>{t('admin_col_role')}</th><th>{t('admin_col_status')}</th><th>{t('admin_col_xp')}</th><th>{t('admin_col_joined')}</th><th>{t('admin_col_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={!u.is_active ? 'admin-table__row--muted' : ''}>
                    <td className="admin-table__id">{u.id}</td>
                    <td><strong>{u.username}</strong></td>
                    <td className="admin-table__secondary">{u.email}</td>
                    <td><span className={`admin-badge admin-badge--${u.role}`}>{u.role}</span></td>
                    <td>
                      <span className={`admin-badge admin-badge--${u.is_active ? 'on' : 'off'}`}>
                        {u.is_active ? t('admin_badge_active') : t('admin_badge_inactive')}
                      </span>
                    </td>
                    <td>{u.total_xp}</td>
                    <td className="admin-table__secondary">{u.created_at}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn--sm"
                          onClick={() => patchUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })}>
                          {u.role === 'admin' ? t('admin_make_user') : t('admin_make_admin')}
                        </button>
                        <button className="admin-btn admin-btn--sm"
                          onClick={() => patchUser(u.id, { is_active: !u.is_active })}>
                          {u.is_active ? t('admin_deactivate') : t('admin_activate')}
                        </button>
                        <button className="admin-btn admin-btn--sm admin-btn--danger"
                          onClick={() => deleteUser(u.id, u.username)}>
                          {t('admin_delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── GESTURES ── */}
      {tab === 'gestures' && (
        <div className="admin-section">
          <div className="admin-toolbar">
            <input
              className="admin-search"
              placeholder={t('admin_search_gestures')}
              value={gestureSearch}
              onChange={e => { setGestureSearch(e.target.value); setGesturePage(0); }}
            />
            <select className="admin-filter"
              value={gestureStatus}
              onChange={e => { setGestureStatus(e.target.value); setGesturePage(0); }}>
              <option value="">{t('admin_filter_all_statuses')}</option>
              <option value="true">{t('admin_badge_active')}</option>
              <option value="false">{t('admin_badge_inactive')}</option>
            </select>
            <select className="admin-filter"
              value={gestureDynamic}
              onChange={e => { setGestureDynamic(e.target.value); setGesturePage(0); }}>
              <option value="">{t('admin_filter_all_types')}</option>
              <option value="false">{t('admin_badge_static')}</option>
              <option value="true">{t('admin_badge_dynamic')}</option>
            </select>
            <button className="admin-btn" onClick={() => setShowGestureForm(v => !v)}>
              {showGestureForm ? t('admin_cancel') : t('admin_new_gesture')}
            </button>
            <div className="admin-pagination">
              <button className="admin-btn admin-btn--sm"
                disabled={gesturePage === 0}
                onClick={() => { setGesturePage(p => p - 1); loadGestures(gesturePage - 1); }}>‹</button>
              <span className="admin-pagination__info">
                {gestureTotal === 0 ? '0' : `${gesturePage * GESTURE_PAGE_SIZE + 1}–${Math.min((gesturePage + 1) * GESTURE_PAGE_SIZE, gestureTotal)}`} / {gestureTotal}
              </span>
              <button className="admin-btn admin-btn--sm"
                disabled={(gesturePage + 1) * GESTURE_PAGE_SIZE >= gestureTotal}
                onClick={() => { setGesturePage(p => p + 1); loadGestures(gesturePage + 1); }}>›</button>
            </div>
          </div>

          {showGestureForm && (
            <div className="admin-form">
              <label>
                {t('admin_col_name_en')}
                <input type="text" value={newGesture.name_en}
                  onChange={e => setNewGesture(p => ({ ...p, name_en: e.target.value }))}
                  placeholder={t('admin_col_name')} />
              </label>
              <label>
                {t('admin_col_model_label')}
                <input type="text" value={newGesture.model_label}
                  onChange={e => setNewGesture(p => ({ ...p, model_label: e.target.value }))}
                  placeholder={t('admin_col_model_label_req')} />
              </label>
              <label>
                {t('admin_label_video_url')}
                <input type="text" value={newGesture.video_url}
                  onChange={e => setNewGesture(p => ({ ...p, video_url: e.target.value }))}
                  placeholder={t('admin_col_video_url_req')} />
              </label>
              <label style={{ gap: '6px' }}>
                <input type="checkbox" checked={newGesture.is_dynamic}
                  onChange={e => setNewGesture(p => ({ ...p, is_dynamic: e.target.checked }))} />
                {t('admin_col_dynamic')}
              </label>
              <button className="admin-btn" onClick={createGesture}>{t('admin_create')}</button>
            </div>
          )}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin_col_id')}</th><th>{t('admin_col_name_en')}</th><th>{t('admin_col_model_label')}</th>
                  <th>{t('admin_col_dynamic')}</th><th>{t('admin_col_active')}</th><th>{t('admin_col_added')}</th><th>{t('admin_col_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {gestures.map(g => (
                  <React.Fragment key={g.id}>
                    <tr className={!g.is_active ? 'admin-table__row--muted' : ''}>
                      <td className="admin-table__id">{g.id}</td>
                      <td><strong>{g.name}</strong></td>
                      <td><code className="admin-code">{g.model_label}</code></td>
                      <td>
                        <span className={`admin-badge admin-badge--${g.is_dynamic ? 'on' : 'off'}`}>
                          {g.is_dynamic ? t('admin_badge_yes') : t('admin_badge_no')}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${g.is_active ? 'on' : 'off'}`}>
                          {g.is_active ? t('admin_badge_active') : t('admin_badge_inactive')}
                        </span>
                      </td>
                      <td className="admin-table__secondary">{g.created_at}</td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-btn admin-btn--sm"
                            onClick={() => patchGesture(g.id, { is_active: !g.is_active })}>
                            {g.is_active ? t('admin_deactivate') : t('admin_activate')}
                          </button>
                          <button className="admin-btn admin-btn--sm"
                            onClick={() => patchGesture(g.id, { is_dynamic: !g.is_dynamic })}>
                            {g.is_dynamic ? t('admin_make_static') : t('admin_make_dynamic')}
                          </button>
                          <button className="admin-btn admin-btn--sm"
                            onClick={() => editingId === g.id ? setEditingId(null) : startEditUrls(g)}>
                            {editingId === g.id ? t('admin_cancel') : t('admin_edit_urls')}
                          </button>
                          <button className="admin-btn admin-btn--sm admin-btn--danger"
                            onClick={() => deleteGesture(g.id, g.name)}>
                            {t('admin_delete')}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {editingId === g.id && (
                      <tr className="admin-table__url-row">
                        <td colSpan={7}>
                          <div className="admin-url-form">
                            <label>
                              {t('admin_label_video_url')}
                              <input type="text" value={editUrls.video_url}
                                onChange={e => setEditUrls(p => ({ ...p, video_url: e.target.value }))}
                                placeholder="https://…" />
                            </label>
                            <label>
                              {t('admin_label_illustration_url')}
                              <input type="text" value={editUrls.illustration_url}
                                onChange={e => setEditUrls(p => ({ ...p, illustration_url: e.target.value }))}
                                placeholder="https://…" />
                            </label>
                            <label>
                              {t('admin_label_thumbnail_url')}
                              <input type="text" value={editUrls.thumbnail_url}
                                onChange={e => setEditUrls(p => ({ ...p, thumbnail_url: e.target.value }))}
                                placeholder="https://…" />
                            </label>
                            <button className="admin-btn" onClick={() => saveUrls(g.id)}>{t('admin_save')}</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
