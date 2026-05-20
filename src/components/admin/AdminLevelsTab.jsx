import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API, headers } from './adminUtils';
import { IconPlus } from '../Icons';

const AdminLevelsTab = () => {
  const { t } = useTranslation();
  const [levels, setLevels] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newLevel, setNewLevel] = useState({ name_uk: '', name_en: '', description_uk: '', description_en: '', is_active: true });
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({ name_uk: '', name_en: '', description_uk: '', description_en: '', is_active: true });

  const fail = (err) => setErrorMsg(err.response?.data?.detail || t('admin_error_generic'));

  const load = useCallback(() => {
    axios.get(`${API}/api/admin/levels`, { headers: headers() })
      .then(res => setLevels(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = () => {
    axios.post(`${API}/api/admin/levels`, newLevel, { headers: headers() })
      .then(() => {
        load();
        setShowForm(false);
        setNewLevel({ name_uk: '', name_en: '', description_uk: '', description_en: '', is_active: true });
      }).catch(fail);
  };

  const patch = (id, data) =>
    axios.patch(`${API}/api/admin/levels/${id}`, data, { headers: headers() })
      .then(() => load()).catch(fail);

  const saveEdit = (id) =>
    axios.patch(`${API}/api/admin/levels/${id}`, editFields, { headers: headers() })
      .then(() => { load(); setEditingId(null); }).catch(fail);

  const remove = (id, name) => {
    if (!window.confirm(t('admin_confirm_delete_level', { name }))) return;
    axios.delete(`${API}/api/admin/levels/${id}`, { headers: headers() })
      .then(() => load()).catch(fail);
  };

  return (
    <div className="admin-section">
      {errorMsg && <div className="admin-error" onClick={() => setErrorMsg('')}>{errorMsg} &times;</div>}
      <div className="admin-toolbar">
        <button className="admin-btn" onClick={() => setShowForm(v => !v)}>
          {showForm ? t('admin_cancel') : <><IconPlus /> {t('admin_new_level')}</>}
        </button>
        <span className="admin-total">{levels.length} total</span>
      </div>

      {showForm && (
        <div className="admin-form">
          <div className="admin-form__row">
            <label>
              Назва (УКР) *
              <input type="text" value={newLevel.name_uk} placeholder="Початківець"
                onChange={e => setNewLevel(p => ({ ...p, name_uk: e.target.value }))} />
            </label>
            <label>
              Name (EN)
              <input type="text" value={newLevel.name_en} placeholder="Beginner"
                onChange={e => setNewLevel(p => ({ ...p, name_en: e.target.value }))} />
            </label>
          </div>
          <div className="admin-form__row">
            <label>
              Опис (УКР)
              <input type="text" value={newLevel.description_uk} placeholder="Необов'язково"
                onChange={e => setNewLevel(p => ({ ...p, description_uk: e.target.value }))} />
            </label>
            <label>
              Description (EN)
              <input type="text" value={newLevel.description_en} placeholder="Optional"
                onChange={e => setNewLevel(p => ({ ...p, description_en: e.target.value }))} />
            </label>
          </div>
          <label style={{ gap: '6px' }}>
            <input type="checkbox" checked={newLevel.is_active}
              onChange={e => setNewLevel(p => ({ ...p, is_active: e.target.checked }))} />
            {t('admin_col_active')}
          </label>
          <button className="admin-btn admin-btn--primary" onClick={create}>{t('admin_create')}</button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin_col_id')}</th>
              <th>УКР / EN</th>
              <th>{t('admin_col_active')}</th>
              <th>{t('admin_col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {levels.map(lv => (
              <React.Fragment key={lv.id}>
                <tr className={!lv.is_active ? 'admin-table__row--muted' : ''}>
                  <td className="admin-table__id">{lv.id}</td>
                  <td>
                    {lv.name_uk && <div><strong>{lv.name_uk}</strong></div>}
                    {lv.name_en && <div className="admin-table__secondary">{lv.name_en}</div>}
                    {!lv.name_uk && !lv.name_en && <span className="admin-table__secondary">—</span>}
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${lv.is_active ? 'on' : 'off'}`}>
                      {lv.is_active ? t('admin_badge_active') : t('admin_badge_inactive')}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn--sm"
                        onClick={() => patch(lv.id, { is_active: !lv.is_active })}>
                        {lv.is_active ? t('admin_deactivate') : t('admin_activate')}
                      </button>
                      <button className={`admin-btn admin-btn--sm${editingId === lv.id ? ' admin-btn--active' : ''}`}
                        onClick={() => {
                          if (editingId === lv.id) { setEditingId(null); return; }
                          setEditingId(lv.id);
                          setEditFields({ name_uk: lv.name_uk || '', name_en: lv.name_en || '', description_uk: lv.description_uk || '', description_en: lv.description_en || '', is_active: lv.is_active });
                        }}>
                        {editingId === lv.id ? t('admin_cancel') : t('edit')}
                      </button>
                      <button className="admin-btn admin-btn--sm admin-btn--danger"
                        onClick={() => remove(lv.id, lv.name_uk || lv.name_en || String(lv.id))}>
                        {t('admin_delete')}
                      </button>
                    </div>
                  </td>
                </tr>

                {editingId === lv.id && (
                  <tr className="admin-table__url-row">
                    <td colSpan={4}>
                      <div className="admin-url-form">
                        <div className="admin-form__row">
                          <label>
                            Назва (УКР)
                            <input type="text" value={editFields.name_uk}
                              onChange={e => setEditFields(p => ({ ...p, name_uk: e.target.value }))} />
                          </label>
                          <label>
                            Name (EN)
                            <input type="text" value={editFields.name_en}
                              onChange={e => setEditFields(p => ({ ...p, name_en: e.target.value }))} />
                          </label>
                        </div>
                        <div className="admin-form__row">
                          <label>
                            Опис (УКР)
                            <input type="text" value={editFields.description_uk}
                              onChange={e => setEditFields(p => ({ ...p, description_uk: e.target.value }))} />
                          </label>
                          <label>
                            Description (EN)
                            <input type="text" value={editFields.description_en}
                              onChange={e => setEditFields(p => ({ ...p, description_en: e.target.value }))} />
                          </label>
                        </div>
                        <label style={{ gap: '6px' }}>
                          <input type="checkbox" checked={editFields.is_active}
                            onChange={e => setEditFields(p => ({ ...p, is_active: e.target.checked }))} />
                          {t('admin_col_active')}
                        </label>
                        <button className="admin-btn admin-btn--primary" onClick={() => saveEdit(lv.id)}>{t('admin_save')}</button>
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
  );
};

export default AdminLevelsTab;
