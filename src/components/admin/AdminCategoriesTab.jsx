import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API, headers } from './adminUtils';
import { IconPlus } from '../Icons';

const AdminCategoriesTab = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newCat, setNewCat] = useState({ name_uk: '', name_en: '', description_uk: '', description_en: '', is_active: true });
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({ name_uk: '', name_en: '', description_uk: '', description_en: '', is_active: true });

  const fail = (err) => setErrorMsg(err.response?.data?.detail || t('admin_error_generic'));

  const load = useCallback(() => {
    axios.get(`${API}/api/admin/categories`, { headers: headers() })
      .then(res => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = () => {
    if (!newCat.name_uk.trim()) return;
    axios.post(`${API}/api/admin/categories`, newCat, { headers: headers() })
      .then(() => {
        load();
        setShowForm(false);
        setNewCat({ name_uk: '', name_en: '', description_uk: '', description_en: '', is_active: true });
      }).catch(fail);
  };

  const patch = (id, data) =>
    axios.patch(`${API}/api/admin/categories/${id}`, data, { headers: headers() })
      .then(() => load()).catch(fail);

  const saveEdit = (id) =>
    axios.patch(`${API}/api/admin/categories/${id}`, editFields, { headers: headers() })
      .then(() => { load(); setEditingId(null); }).catch(fail);

  const remove = (id, name) => {
    if (!window.confirm(t('admin_confirm_delete_category', { name }))) return;
    axios.delete(`${API}/api/admin/categories/${id}`, { headers: headers() })
      .then(() => load()).catch(fail);
  };

  return (
    <div className="admin-section">
      {errorMsg && <div className="admin-error" onClick={() => setErrorMsg('')}>{errorMsg} &times;</div>}
      <div className="admin-toolbar">
        <button className="admin-btn" onClick={() => setShowForm(v => !v)}>
          {showForm ? t('admin_cancel') : <><IconPlus /> {t('admin_new_category')}</>}
        </button>
        <span className="admin-total">{categories.length} total</span>
      </div>

      {showForm && (
        <div className="admin-form">
          <div className="admin-form__row">
            <label>
              Назва (УКР) *
              <input type="text" value={newCat.name_uk} placeholder="Привітання"
                onChange={e => setNewCat(p => ({ ...p, name_uk: e.target.value }))} />
            </label>
            <label>
              Name (EN)
              <input type="text" value={newCat.name_en} placeholder="Greetings"
                onChange={e => setNewCat(p => ({ ...p, name_en: e.target.value }))} />
            </label>
          </div>
          <div className="admin-form__row">
            <label>
              Опис (УКР)
              <input type="text" value={newCat.description_uk} placeholder="Необов'язково"
                onChange={e => setNewCat(p => ({ ...p, description_uk: e.target.value }))} />
            </label>
            <label>
              Description (EN)
              <input type="text" value={newCat.description_en} placeholder="Optional"
                onChange={e => setNewCat(p => ({ ...p, description_en: e.target.value }))} />
            </label>
          </div>
          <label style={{ gap: '6px' }}>
            <input type="checkbox" checked={newCat.is_active}
              onChange={e => setNewCat(p => ({ ...p, is_active: e.target.checked }))} />
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
              <th>{t('admin_col_added')}</th>
              <th>{t('admin_col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <React.Fragment key={cat.id}>
                <tr className={!cat.is_active ? 'admin-table__row--muted' : ''}>
                  <td className="admin-table__id">{cat.id}</td>
                  <td>
                    {cat.name_uk && <div><strong>{cat.name_uk}</strong></div>}
                    {cat.name_en && <div className="admin-table__secondary">{cat.name_en}</div>}
                    {!cat.name_uk && !cat.name_en && <span className="admin-table__secondary">—</span>}
                    {cat.description_uk && <div className="admin-table__secondary" style={{ fontSize: '0.75rem' }}>{cat.description_uk}</div>}
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${cat.is_active ? 'on' : 'off'}`}>
                      {cat.is_active ? t('admin_badge_active') : t('admin_badge_inactive')}
                    </span>
                  </td>
                  <td className="admin-table__secondary">{cat.created_at}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn admin-btn--sm"
                        onClick={() => patch(cat.id, { is_active: !cat.is_active })}>
                        {cat.is_active ? t('admin_deactivate') : t('admin_activate')}
                      </button>
                      <button className={`admin-btn admin-btn--sm${editingId === cat.id ? ' admin-btn--active' : ''}`}
                        onClick={() => {
                          if (editingId === cat.id) { setEditingId(null); return; }
                          setEditingId(cat.id);
                          setEditFields({
                            name_uk: cat.name_uk || '', name_en: cat.name_en || '',
                            description_uk: cat.description_uk || '', description_en: cat.description_en || '',
                            is_active: cat.is_active,
                          });
                        }}>
                        {editingId === cat.id ? t('admin_cancel') : t('edit')}
                      </button>
                      <button className="admin-btn admin-btn--sm admin-btn--danger"
                        onClick={() => remove(cat.id, cat.name_uk || cat.name_en || String(cat.id))}>
                        {t('admin_delete')}
                      </button>
                    </div>
                  </td>
                </tr>

                {editingId === cat.id && (
                  <tr className="admin-table__url-row">
                    <td colSpan={5}>
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
                        <button className="admin-btn admin-btn--primary" onClick={() => saveEdit(cat.id)}>{t('admin_save')}</button>
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

export default AdminCategoriesTab;
