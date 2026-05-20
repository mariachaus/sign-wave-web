import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API, headers, useDebounce } from './adminUtils';
import { IconSearch, IconPlus } from '../Icons';

const PAGE_SIZE = 50;

const AdminGesturesTab = () => {
  const { t } = useTranslation();
  const [gestures, setGestures] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [dynamicFilter, setDynamicFilter] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const debouncedSearch = useDebounce(search);

  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({
    video_url: '', illustration_url: '', thumbnail_url: '',
    name_uk: '', name_en: '', description_uk: '', description_en: '',
    is_dynamic: false,
  });
  const [synonyms, setSynonyms] = useState([]);
  const [newSynonym, setNewSynonym] = useState({ name: '', language_code: 'uk' });
  const [showForm, setShowForm] = useState(false);
  const [newGesture, setNewGesture] = useState({
    name_uk: '', name_en: '', description_uk: '', description_en: '',
    model_label: '', video_url: '', is_dynamic: false,
  });

  const fail = (err) => setErrorMsg(err.response?.data?.detail || t('admin_error_generic'));

  const load = useCallback((p = page) => {
    const params = { search: debouncedSearch, skip: p * PAGE_SIZE, limit: PAGE_SIZE };
    if (statusFilter !== '') params.is_active = statusFilter === 'true';
    if (dynamicFilter !== '') params.is_dynamic = dynamicFilter === 'true';
    axios.get(`${API}/api/admin/gestures`, { headers: headers(), params })
      .then(res => { setGestures(res.data.gestures); setTotal(res.data.total); })
      .catch(() => {});
  }, [debouncedSearch, page, statusFilter, dynamicFilter]);

  useEffect(() => { load(); }, [load]);

  const patch = (id, data) =>
    axios.patch(`${API}/api/admin/gestures/${id}`, data, { headers: headers() })
      .then(() => load(page)).catch(fail);

  const remove = (id, name) => {
    if (!window.confirm(t('admin_confirm_delete_gesture', { name }))) return;
    axios.delete(`${API}/api/admin/gestures/${id}`, { headers: headers() })
      .then(() => load(page)).catch(fail);
  };

  const create = () => {
    axios.post(`${API}/api/admin/gestures`, newGesture, { headers: headers() })
      .then(() => {
        setPage(0); load(0);
        setShowForm(false);
        setNewGesture({ name_uk: '', name_en: '', description_uk: '', description_en: '', model_label: '', video_url: '', is_dynamic: false });
      }).catch(fail);
  };

  const loadSynonyms = (id) =>
    axios.get(`${API}/api/admin/gestures/${id}/synonyms`, { headers: headers() })
      .then(res => setSynonyms(res.data)).catch(() => {});

  const addSynonym = (gestureId) => {
    if (!newSynonym.name.trim()) return;
    axios.post(`${API}/api/admin/gestures/${gestureId}/synonyms`, newSynonym, { headers: headers() })
      .then(() => { loadSynonyms(gestureId); setNewSynonym({ name: '', language_code: 'uk' }); })
      .catch(fail);
  };

  const removeSynonym = (gestureId, synId) =>
    axios.delete(`${API}/api/admin/gestures/${gestureId}/synonyms/${synId}`, { headers: headers() })
      .then(() => loadSynonyms(gestureId)).catch(fail);

  const startEdit = (g) => {
    setEditingId(g.id);
    setEditFields({
      video_url: g.video_url || '', illustration_url: g.illustration_url || '',
      thumbnail_url: g.thumbnail_url || '', name_uk: g.name_uk || '',
      name_en: g.name_en || '', description_uk: g.description_uk || '',
      description_en: g.description_en || '', is_dynamic: g.is_dynamic,
    });
    loadSynonyms(g.id);
  };

  const saveEdit = (id) =>
    axios.patch(`${API}/api/admin/gestures/${id}`, editFields, { headers: headers() })
      .then(() => { load(page); setEditingId(null); }).catch(fail);

  return (
    <div className="admin-section">
      {errorMsg && <div className="admin-error" onClick={() => setErrorMsg('')}>{errorMsg} &times;</div>}
      <div className="admin-toolbar">
        <div className="search-wrap">
          <IconSearch />
          <input
            className="admin-search"
            placeholder={t('admin_search_gestures')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select className="admin-filter" value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="">{t('admin_filter_all_statuses')}</option>
          <option value="true">{t('admin_badge_active')}</option>
          <option value="false">{t('admin_badge_inactive')}</option>
        </select>
        <select className="admin-filter" value={dynamicFilter}
          onChange={e => { setDynamicFilter(e.target.value); setPage(0); }}>
          <option value="">{t('admin_filter_all_types')}</option>
          <option value="false">{t('admin_badge_static')}</option>
          <option value="true">{t('admin_badge_dynamic')}</option>
        </select>
        <button className="admin-btn" onClick={() => setShowForm(v => !v)}>
          {showForm ? t('admin_cancel') : <><IconPlus /> {t('admin_new_gesture')}</>}
        </button>
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

      {showForm && (
        <div className="admin-form">
          <div className="admin-form__row">
            <label>
              Назва (УКР) *
              <input type="text" value={newGesture.name_uk} placeholder="Привіт"
                onChange={e => setNewGesture(p => ({ ...p, name_uk: e.target.value }))} />
            </label>
            <label>
              Name (EN)
              <input type="text" value={newGesture.name_en} placeholder="Hello"
                onChange={e => setNewGesture(p => ({ ...p, name_en: e.target.value }))} />
            </label>
          </div>
          <div className="admin-form__row">
            <label>
              Опис (УКР)
              <input type="text" value={newGesture.description_uk} placeholder="Необов'язково"
                onChange={e => setNewGesture(p => ({ ...p, description_uk: e.target.value }))} />
            </label>
            <label>
              Description (EN)
              <input type="text" value={newGesture.description_en} placeholder="Optional"
                onChange={e => setNewGesture(p => ({ ...p, description_en: e.target.value }))} />
            </label>
          </div>
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
          <button className="admin-btn admin-btn--primary" onClick={create}>{t('admin_create')}</button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin_col_id')}</th><th>УКР / EN</th><th>{t('admin_col_model_label')}</th>
              <th>{t('admin_col_dynamic')}</th><th>{t('admin_col_active')}</th>
              <th>{t('admin_col_added')}</th><th>{t('admin_col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {gestures.map(g => (
              <React.Fragment key={g.id}>
                <tr className={!g.is_active ? 'admin-table__row--muted' : ''}>
                  <td className="admin-table__id">{g.id}</td>
                  <td>
                    {g.name_uk && <div><strong>{g.name_uk}</strong></div>}
                    {g.name_en && <div className="admin-table__secondary">{g.name_en}</div>}
                    {!g.name_uk && !g.name_en && <span className="admin-table__secondary">—</span>}
                  </td>
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
                        onClick={() => patch(g.id, { is_active: !g.is_active })}>
                        {g.is_active ? t('admin_deactivate') : t('admin_activate')}
                      </button>
                      <button className={`admin-btn admin-btn--sm${editingId === g.id ? ' admin-btn--active' : ''}`}
                        onClick={() => editingId === g.id ? setEditingId(null) : startEdit(g)}>
                        {editingId === g.id ? t('admin_cancel') : t('edit')}
                      </button>
                      <button className="admin-btn admin-btn--sm admin-btn--danger"
                        onClick={() => remove(g.id, g.name)}>
                        {t('admin_delete')}
                      </button>
                    </div>
                  </td>
                </tr>

                {editingId === g.id && (
                  <tr className="admin-table__url-row">
                    <td colSpan={7}>
                      <div className="admin-url-form">
                        <div className="admin-form__row">
                          <label>
                            Назва (УКР)
                            <input type="text" value={editFields.name_uk} placeholder="Привіт"
                              onChange={e => setEditFields(p => ({ ...p, name_uk: e.target.value }))} />
                          </label>
                          <label>
                            Name (EN)
                            <input type="text" value={editFields.name_en} placeholder="Hello"
                              onChange={e => setEditFields(p => ({ ...p, name_en: e.target.value }))} />
                          </label>
                        </div>
                        <div className="admin-form__row">
                          <label>
                            Опис (УКР)
                            <input type="text" value={editFields.description_uk} placeholder="Необов'язково"
                              onChange={e => setEditFields(p => ({ ...p, description_uk: e.target.value }))} />
                          </label>
                          <label>
                            Description (EN)
                            <input type="text" value={editFields.description_en} placeholder="Optional"
                              onChange={e => setEditFields(p => ({ ...p, description_en: e.target.value }))} />
                          </label>
                        </div>
                        <label>
                          {t('admin_label_video_url')}
                          <input type="text" value={editFields.video_url} placeholder="https://…"
                            onChange={e => setEditFields(p => ({ ...p, video_url: e.target.value }))} />
                        </label>
                        <label>
                          {t('admin_label_illustration_url')}
                          <input type="text" value={editFields.illustration_url} placeholder="https://…"
                            onChange={e => setEditFields(p => ({ ...p, illustration_url: e.target.value }))} />
                        </label>
                        <label>
                          {t('admin_label_thumbnail_url')}
                          <input type="text" value={editFields.thumbnail_url} placeholder="https://…"
                            onChange={e => setEditFields(p => ({ ...p, thumbnail_url: e.target.value }))} />
                        </label>
                        <label style={{ gap: '6px' }}>
                          <input type="checkbox" checked={editFields.is_dynamic}
                            onChange={e => setEditFields(p => ({ ...p, is_dynamic: e.target.checked }))} />
                          {t('admin_col_dynamic')}
                        </label>
                        <button className="admin-btn admin-btn--primary" onClick={() => saveEdit(g.id)}>{t('admin_save')}</button>

                        <div className="admin-synonyms">
                          <div className="admin-synonyms__title">Синоніми</div>
                          <div className="admin-synonyms__list">
                            {synonyms.length === 0 && (
                              <span className="admin-table__secondary">—</span>
                            )}
                            {synonyms.map(s => (
                              <span key={s.id} className="admin-synonym-tag">
                                <span className="admin-synonym-tag__lang">{s.language_code}</span>
                                {s.name}
                                <button
                                  className="admin-synonym-tag__remove"
                                  onClick={() => removeSynonym(g.id, s.id)}
                                  aria-label="Remove"
                                >&times;</button>
                              </span>
                            ))}
                          </div>
                          <div className="admin-synonyms__add">
                            <select
                              className="admin-filter"
                              value={newSynonym.language_code}
                              onChange={e => setNewSynonym(p => ({ ...p, language_code: e.target.value }))}
                            >
                              <option value="uk">uk</option>
                              <option value="en">en</option>
                            </select>
                            <input
                              className="admin-search"
                              placeholder="Новий синонім…"
                              value={newSynonym.name}
                              onChange={e => setNewSynonym(p => ({ ...p, name: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && addSynonym(g.id)}
                            />
                            <button className="admin-btn admin-btn--sm" onClick={() => addSynonym(g.id)}>
                              <IconPlus size={24} color="var(--color-primary)" />
                            </button>
                          </div>
                        </div>
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

export default AdminGesturesTab;
