import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API, headers, useDebounce } from './adminUtils';

const PAGE_SIZE = 25;

const AdminLessonsTab = () => {
  const { t } = useTranslation();
  const [lessons, setLessons] = useState([]);
  const [lessonTotal, setLessonTotal] = useState(0);
  const [lessonSearch, setLessonSearch] = useState('');
  const [lessonPage, setLessonPage] = useState(0);
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(lessonSearch);

  const [levels, setLevels] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [newLesson, setNewLesson] = useState({ name_uk: '', name_en: '', description_uk: '', description_en: '', level_id: '', order_index: 0, is_active: true });

  const [expandedId, setExpandedId] = useState(null);
  const [editTab, setEditTab] = useState('info');
  const [editFields, setEditFields] = useState({ name_uk: '', name_en: '', description_uk: '', description_en: '', level_id: '', order_index: 0, is_active: true });

  const [poolItems, setPoolItems] = useState([]);
  const [poolSearch, setPoolSearch] = useState('');
  const [poolResults, setPoolResults] = useState([]);
  const [poolSelected, setPoolSelected] = useState(null);
  const [poolIsNew, setPoolIsNew] = useState(true);
  const debouncedPoolSearch = useDebounce(poolSearch);

  const [contentItems, setContentItems] = useState([]);
  const [newContent, setNewContent] = useState({ language_code: 'uk', title: '', body_text: '', image_url: '', order_index: 1 });
  const [editingContentId, setEditingContentId] = useState(null);
  const [contentEditFields, setContentEditFields] = useState({ title: '', body_text: '', image_url: '', order_index: 1 });

  const [errorMsg, setErrorMsg] = useState('');
  const fail = (err) => setErrorMsg(err.response?.data?.detail || t('admin_error_generic'));

  const loadLevels = useCallback(() => {
    axios.get(`${API}/api/admin/levels`, { headers: headers() })
      .then(res => setLevels(res.data)).catch(() => {});
  }, []);

  const loadLessons = useCallback((p = lessonPage) => {
    const params = { search: debouncedSearch, skip: p * PAGE_SIZE, limit: PAGE_SIZE };
    if (levelFilter) params.level_id = levelFilter;
    if (statusFilter !== '') params.is_active = statusFilter === 'true';
    axios.get(`${API}/api/admin/lessons`, { headers: headers(), params })
      .then(res => { setLessons(res.data.lessons); setLessonTotal(res.data.total); })
      .catch(() => {});
  }, [debouncedSearch, lessonPage, levelFilter, statusFilter]);

  useEffect(() => { loadLessons(); loadLevels(); }, [loadLessons, loadLevels]);

  useEffect(() => {
    if (!expandedId) return;
    if (editTab === 'pool')   loadPool(expandedId);
    if (editTab === 'theory') loadContent(expandedId);
  }, [editTab, expandedId]); // eslint-disable-line

  useEffect(() => {
    if (!debouncedPoolSearch.trim()) { setPoolResults([]); return; }
    if (poolSelected) return;
    axios.get(`${API}/api/admin/gestures`, { headers: headers(), params: { search: debouncedPoolSearch, limit: 15 } })
      .then(res => setPoolResults(res.data.gestures)).catch(() => {});
  }, [debouncedPoolSearch]); // eslint-disable-line

  // lessons CRUD
  const createLesson = () => {
    const body = { ...newLesson, level_id: newLesson.level_id || null, order_index: Number(newLesson.order_index) };
    axios.post(`${API}/api/admin/lessons`, body, { headers: headers() })
      .then(() => {
        setLessonPage(0); loadLessons(0);
        setShowForm(false);
        setNewLesson({ name_uk: '', name_en: '', description_uk: '', description_en: '', level_id: '', order_index: 0, is_active: true });
      }).catch(fail);
  };

  const patchLesson = (id, data) =>
    axios.patch(`${API}/api/admin/lessons/${id}`, data, { headers: headers() })
      .then(() => loadLessons(lessonPage)).catch(fail);

  const deleteLesson = (id, name) => {
    if (!window.confirm(t('admin_confirm_delete_lesson', { name }))) return;
    axios.delete(`${API}/api/admin/lessons/${id}`, { headers: headers() })
      .then(() => { setLessonPage(0); loadLessons(0); if (expandedId === id) setExpandedId(null); })
      .catch(fail);
  };

  const expandLesson = (ls) => {
    setExpandedId(ls.id);
    setEditTab('info');
    setEditFields({ name_uk: ls.name_uk || '', name_en: ls.name_en || '', description_uk: ls.description_uk || '', description_en: ls.description_en || '', level_id: ls.level_id || '', order_index: ls.order_index ?? 0, is_active: ls.is_active });
    setPoolItems([]); setContentItems([]);
    setPoolSearch(''); setPoolResults([]); setPoolSelected(null); setPoolIsNew(true);
    setEditingContentId(null);
  };

  const saveLessonEdit = (id) => {
    const orig = lessons.find(ls => ls.id === id) || {};
    const body = { ...editFields };
    const newOrder = Number(editFields.order_index);
    if (newOrder === orig.order_index) delete body.order_index; else body.order_index = newOrder;
    const newLevelId = editFields.level_id || null;
    if (newLevelId == orig.level_id) delete body.level_id; else body.level_id = newLevelId; // eslint-disable-line
    axios.patch(`${API}/api/admin/lessons/${id}`, body, { headers: headers() })
      .then(() => { loadLessons(lessonPage); setExpandedId(null); }).catch(fail);
  };

  // pool
  const loadPool = (lessonId) =>
    axios.get(`${API}/api/admin/lessons/${lessonId}/pool`, { headers: headers() })
      .then(res => setPoolItems(res.data)).catch(() => {});

  const addToPool = (lessonId) => {
    if (!poolSelected) return;
    axios.post(`${API}/api/admin/lessons/${lessonId}/pool`,
      { gesture_id: poolSelected.id, is_new_for_this_lesson: poolIsNew },
      { headers: headers() })
      .then(() => { loadPool(lessonId); setPoolSearch(''); setPoolResults([]); setPoolSelected(null); })
      .catch(fail);
  };

  const removeFromPool = (lessonId, poolId) =>
    axios.delete(`${API}/api/admin/lessons/${lessonId}/pool/${poolId}`, { headers: headers() })
      .then(() => loadPool(lessonId)).catch(fail);

  // content
  const loadContent = (lessonId) =>
    axios.get(`${API}/api/admin/lessons/${lessonId}/content`, { headers: headers() })
      .then(res => setContentItems(res.data)).catch(() => {});

  const createContent = (lessonId) =>
    axios.post(`${API}/api/admin/lessons/${lessonId}/content`, newContent, { headers: headers() })
      .then(() => {
        loadContent(lessonId);
        setNewContent({ language_code: 'uk', title: '', body_text: '', image_url: '', order_index: 1 });
      }).catch(fail);

  const saveContentEdit = (lessonId, contentId) =>
    axios.patch(`${API}/api/admin/lessons/${lessonId}/content/${contentId}`, contentEditFields, { headers: headers() })
      .then(() => { loadContent(lessonId); setEditingContentId(null); }).catch(fail);

  const deleteContent = (lessonId, contentId) =>
    axios.delete(`${API}/api/admin/lessons/${lessonId}/content/${contentId}`, { headers: headers() })
      .then(() => loadContent(lessonId)).catch(fail);

  return (
    <div className="admin-section">
      {errorMsg && <div className="admin-error" onClick={() => setErrorMsg('')}>{errorMsg} &times;</div>}
      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder={t('admin_search_lessons')}
          value={lessonSearch}
          onChange={e => { setLessonSearch(e.target.value); setLessonPage(0); }}
        />
        <select className="admin-filter" value={levelFilter}
          onChange={e => { setLevelFilter(e.target.value); setLessonPage(0); }}>
          <option value="">{t('admin_filter_all_levels')}</option>
          {levels.map(lv => (
            <option key={lv.id} value={lv.id}>{lv.name_uk || lv.name_en || `Level ${lv.id}`}</option>
          ))}
        </select>
        <select className="admin-filter" value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setLessonPage(0); }}>
          <option value="">{t('admin_filter_all_statuses')}</option>
          <option value="true">{t('admin_badge_active')}</option>
          <option value="false">{t('admin_badge_inactive')}</option>
        </select>
        <button className="admin-btn" onClick={() => setShowForm(v => !v)}>
          {showForm ? t('admin_cancel') : t('admin_new_lesson')}
        </button>
        <div className="admin-pagination">
          <button className="admin-btn admin-btn--sm" disabled={lessonPage === 0}
            onClick={() => { setLessonPage(p => p - 1); loadLessons(lessonPage - 1); }}>‹</button>
          <span className="admin-pagination__info">
            {lessonTotal === 0 ? '0' : `${lessonPage * PAGE_SIZE + 1}–${Math.min((lessonPage + 1) * PAGE_SIZE, lessonTotal)}`} / {lessonTotal}
          </span>
          <button className="admin-btn admin-btn--sm" disabled={(lessonPage + 1) * PAGE_SIZE >= lessonTotal}
            onClick={() => { setLessonPage(p => p + 1); loadLessons(lessonPage + 1); }}>›</button>
        </div>
      </div>

      {showForm && (
        <div className="admin-form">
          <div className="admin-form__row">
            <label>
              {t('admin_col_level')}
              <select value={newLesson.level_id}
                onChange={e => setNewLesson(p => ({ ...p, level_id: e.target.value }))}>
                <option value="">{t('admin_level_none')}</option>
                {levels.map(lv => (
                  <option key={lv.id} value={lv.id}>{lv.name_uk || lv.name_en || `Level ${lv.id}`}</option>
                ))}
              </select>
            </label>
            <label>
              {t('admin_col_order')}
              <input type="number" value={newLesson.order_index} min="0"
                onChange={e => setNewLesson(p => ({ ...p, order_index: e.target.value }))} />
            </label>
            <label style={{ gap: '6px' }}>
              <input type="checkbox" checked={newLesson.is_active}
                onChange={e => setNewLesson(p => ({ ...p, is_active: e.target.checked }))} />
              {t('admin_col_active')}
            </label>
          </div>
          <div className="admin-form__row">
            <label>
              Назва (УКР) *
              <input type="text" value={newLesson.name_uk} placeholder="Вітання"
                onChange={e => setNewLesson(p => ({ ...p, name_uk: e.target.value }))} />
            </label>
            <label>
              Name (EN)
              <input type="text" value={newLesson.name_en} placeholder="Greetings"
                onChange={e => setNewLesson(p => ({ ...p, name_en: e.target.value }))} />
            </label>
          </div>
          <div className="admin-form__row">
            <label>
              Опис (УКР)
              <input type="text" value={newLesson.description_uk} placeholder="Необов'язково"
                onChange={e => setNewLesson(p => ({ ...p, description_uk: e.target.value }))} />
            </label>
            <label>
              Description (EN)
              <input type="text" value={newLesson.description_en} placeholder="Optional"
                onChange={e => setNewLesson(p => ({ ...p, description_en: e.target.value }))} />
            </label>
          </div>
          <button className="admin-btn admin-btn--primary" onClick={createLesson}>{t('admin_create')}</button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin_col_id')}</th>
              <th>УКР / EN</th>
              <th>{t('admin_col_level')}</th>
              <th>{t('admin_col_order')}</th>
              <th>{t('admin_col_active')}</th>
              <th>{t('admin_col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map(ls => {
              const levelName = levels.find(lv => lv.id === ls.level_id);
              return (
                <React.Fragment key={ls.id}>
                  <tr className={!ls.is_active ? 'admin-table__row--muted' : ''}>
                    <td className="admin-table__id">{ls.id}</td>
                    <td>
                      {ls.name_uk && <div><strong>{ls.name_uk}</strong></div>}
                      {ls.name_en && <div className="admin-table__secondary">{ls.name_en}</div>}
                      {!ls.name_uk && !ls.name_en && <span className="admin-table__secondary">—</span>}
                    </td>
                    <td className="admin-table__secondary">
                      {levelName ? (levelName.name_uk || levelName.name_en) : (ls.level_id ? `#${ls.level_id}` : '—')}
                    </td>
                    <td>{ls.order_index}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${ls.is_active ? 'on' : 'off'}`}>
                        {ls.is_active ? t('admin_badge_active') : t('admin_badge_inactive')}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn--sm"
                          onClick={() => patchLesson(ls.id, { is_active: !ls.is_active })}>
                          {ls.is_active ? t('admin_deactivate') : t('admin_activate')}
                        </button>
                        <button className={`admin-btn admin-btn--sm${expandedId === ls.id ? ' admin-btn--active' : ''}`}
                          onClick={() => expandedId === ls.id ? setExpandedId(null) : expandLesson(ls)}>
                          {expandedId === ls.id ? t('admin_cancel') : t('edit')}
                        </button>
                        <button className="admin-btn admin-btn--sm admin-btn--danger"
                          onClick={() => deleteLesson(ls.id, ls.name_uk || ls.name_en || String(ls.id))}>
                          {t('admin_delete')}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === ls.id && (
                    <tr className="admin-table__url-row">
                      <td colSpan={6}>
                        <div className="admin-lesson-tabs">
                          {[
                            { key: 'info',   label: t('admin_lesson_tab_info') },
                            { key: 'pool',   label: t('admin_lesson_tab_pool') },
                            { key: 'theory', label: t('admin_lesson_tab_theory') },
                          ].map(tb => (
                            <button key={tb.key}
                              className={`admin-lesson-tab${editTab === tb.key ? ' admin-lesson-tab--active' : ''}`}
                              onClick={() => setEditTab(tb.key)}>
                              {tb.label}
                            </button>
                          ))}
                        </div>

                        {/* ── Info ── */}
                        {editTab === 'info' && (
                          <div className="admin-url-form">
                            <div className="admin-form__row">
                              <label>
                                {t('admin_col_level')}
                                <select value={editFields.level_id}
                                  onChange={e => setEditFields(p => ({ ...p, level_id: e.target.value }))}>
                                  <option value="">{t('admin_level_none')}</option>
                                  {levels.map(lv => (
                                    <option key={lv.id} value={lv.id}>{lv.name_uk || lv.name_en || `Level ${lv.id}`}</option>
                                  ))}
                                </select>
                              </label>
                              <label>
                                {t('admin_col_order')}
                                <input type="number" min="0" value={editFields.order_index}
                                  onChange={e => setEditFields(p => ({ ...p, order_index: e.target.value }))} />
                              </label>
                              <label style={{ gap: '6px' }}>
                                <input type="checkbox" checked={editFields.is_active}
                                  onChange={e => setEditFields(p => ({ ...p, is_active: e.target.checked }))} />
                                {t('admin_col_active')}
                              </label>
                            </div>
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
                            <button className="admin-btn admin-btn--primary" onClick={() => saveLessonEdit(ls.id)}>{t('admin_save')}</button>
                          </div>
                        )}

                        {/* ── Pool ── */}
                        {editTab === 'pool' && (
                          <div>
                            {poolItems.length === 0
                              ? <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0 0 12px' }}>{t('admin_pool_empty')}</p>
                              : (
                                <table className="admin-table" style={{ marginBottom: '16px' }}>
                                  <thead>
                                    <tr><th>Gesture</th><th>Type</th><th></th></tr>
                                  </thead>
                                  <tbody>
                                    {poolItems.map(item => (
                                      <tr key={item.id}>
                                        <td>{item.gesture_name} <span className="admin-table__secondary">#{item.gesture_id}</span></td>
                                        <td>
                                          <span className={`admin-badge admin-badge--${item.is_new_for_this_lesson ? 'on' : 'off'}`}>
                                            {item.is_new_for_this_lesson ? t('admin_pool_new_badge') : t('admin_pool_review_badge')}
                                          </span>
                                        </td>
                                        <td>
                                          <button className="admin-btn admin-btn--sm admin-btn--danger"
                                            onClick={() => removeFromPool(ls.id, item.id)}>
                                            {t('admin_delete')}
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )
                            }
                            <div className="admin-pool-add">
                              <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                                <input
                                  className="admin-search admin-search--white"
                                  style={{ width: '100%' }}
                                  placeholder={t('admin_pool_search')}
                                  value={poolSearch}
                                  onChange={e => { setPoolSearch(e.target.value); setPoolSelected(null); }}
                                />
                                {poolResults.length > 0 && !poolSelected && (
                                  <div className="admin-pool-results">
                                    {poolResults.map(g => (
                                      <button key={g.id} className="admin-pool-result-item"
                                        onClick={() => { setPoolSelected(g); setPoolSearch(g.name_uk || g.name_en || g.model_label); setPoolResults([]); }}>
                                        <strong>{g.name_uk || g.name_en || '—'}</strong>
                                        {g.name_en && g.name_uk && <span className="admin-table__secondary"> / {g.name_en}</span>}
                                        <span className="admin-table__secondary"> #{g.id}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <label className="admin-pool-is-new">
                                <input type="checkbox" checked={poolIsNew}
                                  onChange={e => setPoolIsNew(e.target.checked)} />
                                {t('admin_pool_is_new')}
                              </label>
                              <button className="admin-btn admin-btn--primary" disabled={!poolSelected}
                                onClick={() => addToPool(ls.id)}>
                                {t('admin_pool_add')}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ── Theory ── */}
                        {editTab === 'theory' && (
                          <div>
                            {contentItems.length === 0
                              ? <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: '0 0 12px' }}>{t('admin_content_empty')}</p>
                              : (
                                <div className="admin-content-list">
                                  {contentItems.map(c => (
                                    <div key={c.id} className="admin-content-item">
                                      {editingContentId === c.id ? (
                                        <div className="admin-content-edit">
                                          <div className="admin-form__row" style={{ marginBottom: '8px' }}>
                                            <label>
                                              {t('admin_content_title')}
                                              <input type="text" value={contentEditFields.title}
                                                onChange={e => setContentEditFields(p => ({ ...p, title: e.target.value }))} />
                                            </label>
                                            <label>
                                              {t('admin_content_order')}
                                              <input type="number" min="1" value={contentEditFields.order_index}
                                                onChange={e => setContentEditFields(p => ({ ...p, order_index: e.target.value }))} />
                                            </label>
                                            <label>
                                              {t('admin_content_image_url')}
                                              <input type="text" value={contentEditFields.image_url}
                                                onChange={e => setContentEditFields(p => ({ ...p, image_url: e.target.value }))}
                                                placeholder="https://…" />
                                            </label>
                                          </div>
                                          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                            {t('admin_content_body')}
                                            <textarea value={contentEditFields.body_text}
                                              onChange={e => setContentEditFields(p => ({ ...p, body_text: e.target.value }))} />
                                          </label>
                                          <div className="admin-actions">
                                            <button className="admin-btn admin-btn--sm admin-btn--primary" onClick={() => saveContentEdit(ls.id, c.id)}>{t('admin_save')}</button>
                                            <button className="admin-btn admin-btn--sm" onClick={() => setEditingContentId(null)}>{t('admin_cancel')}</button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="admin-content-view">
                                          <span className={`admin-badge admin-badge--${c.language_code === 'uk' ? 'admin' : 'user'}`}>
                                            {c.language_code.toUpperCase()}
                                          </span>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>#{c.order_index}</span>
                                          <span className="admin-content-title">{c.title || <em style={{ opacity: 0.5 }}>no title</em>}</span>
                                          <span className="admin-content-preview">{c.body_text?.slice(0, 80)}{c.body_text?.length > 80 ? '…' : ''}</span>
                                          <div className="admin-actions" style={{ marginLeft: 'auto' }}>
                                            <button className="admin-btn admin-btn--sm"
                                              onClick={() => { setEditingContentId(c.id); setContentEditFields({ title: c.title, body_text: c.body_text, image_url: c.image_url, order_index: c.order_index }); }}>
                                              {t('edit')}
                                            </button>
                                            <button className="admin-btn admin-btn--sm admin-btn--danger"
                                              onClick={() => deleteContent(ls.id, c.id)}>
                                              {t('admin_delete')}
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )
                            }
                            <div className="admin-form" style={{ marginTop: '8px' }}>
                              <div className="admin-form__row">
                                <label>
                                  {t('admin_content_lang')}
                                  <select value={newContent.language_code}
                                    onChange={e => setNewContent(p => ({ ...p, language_code: e.target.value }))}>
                                    <option value="uk">УКР</option>
                                    <option value="en">EN</option>
                                  </select>
                                </label>
                                <label>
                                  {t('admin_content_order')}
                                  <input type="number" min="1" value={newContent.order_index}
                                    onChange={e => setNewContent(p => ({ ...p, order_index: e.target.value }))} />
                                </label>
                                <label>
                                  {t('admin_content_title')}
                                  <input type="text" value={newContent.title}
                                    onChange={e => setNewContent(p => ({ ...p, title: e.target.value }))} />
                                </label>
                                <label>
                                  {t('admin_content_image_url')}
                                  <input type="text" value={newContent.image_url}
                                    onChange={e => setNewContent(p => ({ ...p, image_url: e.target.value }))}
                                    placeholder="https://…" />
                                </label>
                              </div>
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                {t('admin_content_body')}
                                <textarea value={newContent.body_text}
                                  onChange={e => setNewContent(p => ({ ...p, body_text: e.target.value }))} />
                              </label>
                              <button className="admin-btn admin-btn--primary" onClick={() => createContent(ls.id)}>{t('admin_content_add')}</button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLessonsTab;
