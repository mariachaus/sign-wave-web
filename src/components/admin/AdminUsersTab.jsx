import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API, headers, useDebounce } from './adminUtils';
import { IconSearch } from '../Icons';

const PAGE_SIZE = 25;

const AdminUsersTab = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const debouncedSearch = useDebounce(search);

  const fail = (err) => setErrorMsg(err.response?.data?.detail || t('admin_error_generic'));

  const load = useCallback((p = page) => {
    const params = { search: debouncedSearch, skip: p * PAGE_SIZE, limit: PAGE_SIZE };
    if (role) params.role = role;
    if (status !== '') params.is_active = status === 'true';
    axios.get(`${API}/api/admin/users`, { headers: headers(), params })
      .then(res => { setUsers(res.data.users); setTotal(res.data.total); })
      .catch(() => {});
  }, [debouncedSearch, page, role, status]);

  useEffect(() => { load(); }, [load]);

  const patch = (id, data) =>
    axios.patch(`${API}/api/admin/users/${id}`, data, { headers: headers() })
      .then(() => load(page)).catch(fail);

  const remove = (id, name) => {
    if (!window.confirm(t('admin_confirm_delete_user', { name }))) return;
    axios.delete(`${API}/api/admin/users/${id}`, { headers: headers() })
      .then(() => load(page)).catch(fail);
  };

  return (
    <div className="admin-section">
      {errorMsg && <div className="admin-error" onClick={() => setErrorMsg('')}>{errorMsg} &times;</div>}
      <div className="admin-toolbar">
        <div className="search-wrap">
          <IconSearch />
          <input
            className="admin-search"
            placeholder={t('admin_search_users')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select className="admin-filter" value={role}
          onChange={e => { setRole(e.target.value); setPage(0); }}>
          <option value="">{t('admin_filter_all_roles')}</option>
          <option value="admin">{t('admin_role_admin')}</option>
          <option value="user">{t('admin_role_user')}</option>
        </select>
        <select className="admin-filter" value={status}
          onChange={e => { setStatus(e.target.value); setPage(0); }}>
          <option value="">{t('admin_filter_all_statuses')}</option>
          <option value="true">{t('admin_badge_active')}</option>
          <option value="false">{t('admin_badge_inactive')}</option>
        </select>
        <div className="admin-pagination">
          <button className="admin-btn admin-btn--sm" disabled={page === 0}
            onClick={() => { setPage(p => p - 1); load(page - 1); }}>‹</button>
          <span className="admin-pagination__info">
            {total === 0 ? '0' : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)}`} / {total}
          </span>
          <button className="admin-btn admin-btn--sm" disabled={(page + 1) * PAGE_SIZE >= total}
            onClick={() => { setPage(p => p + 1); load(page + 1); }}>›</button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin_col_id')}</th><th>{t('admin_col_username')}</th><th>{t('admin_col_email')}</th>
              <th>{t('admin_col_role')}</th><th>{t('admin_col_status')}</th><th>{t('admin_col_xp')}</th>
              <th>{t('admin_col_joined')}</th><th>{t('admin_col_actions')}</th>
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
                      onClick={() => patch(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })}>
                      {u.role === 'admin' ? t('admin_make_user') : t('admin_make_admin')}
                    </button>
                    <button className="admin-btn admin-btn--sm"
                      onClick={() => patch(u.id, { is_active: !u.is_active })}>
                      {u.is_active ? t('admin_deactivate') : t('admin_activate')}
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--danger"
                      onClick={() => remove(u.id, u.username)}>
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
  );
};

export default AdminUsersTab;
