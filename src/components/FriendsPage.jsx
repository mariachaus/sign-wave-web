import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import UserAvatar from './UserAvatar';
import { IconFlame, IconStar, IconSearch } from './Icons';
import API_BASE_URL from '../config/api';
import '../styles/pages/FriendsPage.scss';

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

const errorText = (err, fallback) => err.response?.data?.error || fallback;

const notifyChanged = () => window.dispatchEvent(new Event('friends:changed'));

const UserRow = ({ user, children }) => (
  <li className="friend-row">
    <Link to={`/users/${user.id}`} className="friend-row__who">
      <UserAvatar user={user} size={44} />
      <div className="friend-row__info">
        <span className="friend-row__name">{user.username}</span>
        <span className="friend-row__meta">
          <span className="friend-row__stat friend-row__stat--xp">
            <IconStar size={13} /> {(user.total_xp || 0).toLocaleString()} XP
          </span>
          {typeof user.current_streak === 'number' && (
            <span className="friend-row__stat friend-row__stat--streak">
              <IconFlame size={13} /> {user.current_streak}
            </span>
          )}
        </span>
      </div>
    </Link>
    <div className="friend-row__actions">{children}</div>
  </li>
);

const FriendsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const base = `${API_BASE_URL}/api/friends`;
  const trimmed = query.trim();
  const isSearching = trimmed.length > 0;

  const loadAll = useCallback(async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        axios.get(base, authConfig()),
        axios.get(`${base}/requests`, authConfig()),
      ]);
      setFriends(friendsRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      setError(errorText(err, t('friends_error_generic')));
    } finally {
      setLoading(false);
    }
  }, [base, t]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      axios
        .get(`${base}/search`, { ...authConfig(), params: { q: trimmed } })
        .then((res) => { if (!cancelled) setResults(res.data); })
        .catch((err) => { if (!cancelled) setError(errorText(err, t('friends_error_generic'))); })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, base, t]);

  const updateResult = (userId, patch) =>
    setResults((prev) => prev.map((u) => (u.id === userId ? { ...u, ...patch } : u)));

  const runAction = async (key, request, onDone) => {
    setBusyKey(key);
    setError('');
    try {
      const res = await request();
      if (onDone) onDone(res.data);
      await loadAll();
      notifyChanged();
    } catch (err) {
      setError(errorText(err, t('friends_error_generic')));
    } finally {
      setBusyKey(null);
    }
  };

  const sendRequest = (user) =>
    runAction(
      `u${user.id}`,
      () => axios.post(`${base}/request/${user.id}`, null, authConfig()),
      (data) =>
        updateResult(user.id, {
          friendship_status: data.status === 'accepted' ? 'friends' : 'pending_outgoing',
          friendship_id: data.friendship_id,
        }),
    );

  const acceptRequest = (friendshipId, userId) =>
    runAction(
      `f${friendshipId}`,
      () => axios.post(`${base}/${friendshipId}/accept`, null, authConfig()),
      () => userId && updateResult(userId, { friendship_status: 'friends' }),
    );

  const removeFriendship = (friendshipId, userId) =>
    runAction(
      `f${friendshipId}`,
      () => axios.delete(`${base}/${friendshipId}`, authConfig()),
      () => userId && updateResult(userId, { friendship_status: 'none', friendship_id: null }),
    );

  const removeFriend = (item) => {
    if (!window.confirm(t('friends_remove_confirm', { name: item.user.username }))) return;
    removeFriendship(item.friendship_id, item.user.id);
  };

  const isBusy = (key) => busyKey === key;

  const renderSearchAction = (u) => {
    const busy = isBusy(`u${u.id}`) || isBusy(`f${u.friendship_id}`);
    switch (u.friendship_status) {
      case 'friends':
        return <span className="friend-tag">{t('friends_status_friends')}</span>;
      case 'pending_outgoing':
        return <span className="friend-tag friend-tag--muted">{t('friends_request_sent')}</span>;
      case 'pending_incoming':
        return (
          <button
            className="friend-btn friend-btn--primary"
            disabled={busy}
            onClick={() => acceptRequest(u.friendship_id, u.id)}
          >
            {t('friends_accept')}
          </button>
        );
      default:
        return (
          <button
            className="friend-btn friend-btn--primary"
            disabled={busy}
            onClick={() => sendRequest(u)}
          >
            {t('friends_add')}
          </button>
        );
    }
  };

  const renderSearch = () => {
    if (trimmed.length < 2) return <p className="friends-page__hint">{t('friends_search_hint')}</p>;
    if (searching && results.length === 0) return <p className="friends-page__hint">{t('friends_loading')}</p>;
    if (results.length === 0) return <p className="friends-page__hint">{t('friends_search_empty')}</p>;
    return (
      <ul className="friends-list">
        {results.map((u) => (
          <UserRow key={u.id} user={u}>
            {renderSearchAction(u)}
          </UserRow>
        ))}
      </ul>
    );
  };

  const renderFriendsTab = () => {
    if (friends.length === 0) {
      return (
        <div className="friends-empty">
          <div className="friends-empty__title">{t('friends_empty')}</div>
          <p className="friends-empty__text">{t('friends_empty_hint')}</p>
        </div>
      );
    }
    return (
      <ul className="friends-list">
        {friends.map((item) => (
          <UserRow key={item.friendship_id} user={item.user}>
            <button
              className="friend-btn friend-btn--ghost"
              disabled={isBusy(`f${item.friendship_id}`)}
              onClick={() => removeFriend(item)}
            >
              {t('friends_remove')}
            </button>
          </UserRow>
        ))}
      </ul>
    );
  };

  const renderRequestsTab = () => {
    const { incoming, outgoing } = requests;
    if (incoming.length === 0 && outgoing.length === 0) {
      return (
        <div className="friends-empty">
          <div className="friends-empty__title">{t('friends_requests_empty')}</div>
        </div>
      );
    }
    return (
      <>
        {incoming.length > 0 && (
          <section className="friends-section">
            <h2 className="friends-section__title">{t('friends_incoming')}</h2>
            <ul className="friends-list">
              {incoming.map((item) => {
                const busy = isBusy(`f${item.friendship_id}`);
                return (
                  <UserRow key={item.friendship_id} user={item.user}>
                    <button
                      className="friend-btn friend-btn--primary"
                      disabled={busy}
                      onClick={() => acceptRequest(item.friendship_id, null)}
                    >
                      {t('friends_accept')}
                    </button>
                    <button
                      className="friend-btn friend-btn--ghost"
                      disabled={busy}
                      onClick={() => removeFriendship(item.friendship_id, null)}
                    >
                      {t('friends_decline')}
                    </button>
                  </UserRow>
                );
              })}
            </ul>
          </section>
        )}
        {outgoing.length > 0 && (
          <section className="friends-section">
            <h2 className="friends-section__title">{t('friends_outgoing')}</h2>
            <ul className="friends-list">
              {outgoing.map((item) => (
                <UserRow key={item.friendship_id} user={item.user}>
                  <button
                    className="friend-btn friend-btn--ghost"
                    disabled={isBusy(`f${item.friendship_id}`)}
                    onClick={() => removeFriendship(item.friendship_id, null)}
                  >
                    {t('friends_cancel_request')}
                  </button>
                </UserRow>
              ))}
            </ul>
          </section>
        )}
      </>
    );
  };

  return (
    <div className="friends-page">
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate('/')} aria-label={t('friends_back')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 className="page-header__title">{t('friends')}</h2>
      </div>


      <div className="search-wrap">
        <IconSearch />
        <input
          className="friends-search"
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('friends_search_placeholder')}
        />
      </div>

      {error && (
        <div className="friends-page__error" role="alert">
          {error}
        </div>
      )}

      {isSearching ? (
        renderSearch()
      ) : loading ? (
        <p className="friends-page__hint">{t('friends_loading')}</p>
      ) : (
        <>
          <div className="friends-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'friends'}
              className={`friends-tabs__tab${tab === 'friends' ? ' friends-tabs__tab--active' : ''}`}
              onClick={() => setTab('friends')}
            >
              {t('friends_tab_friends')} ({friends.length})
            </button>
            <button
              role="tab"
              aria-selected={tab === 'requests'}
              className={`friends-tabs__tab${tab === 'requests' ? ' friends-tabs__tab--active' : ''}`}
              onClick={() => setTab('requests')}
            >
              {t('friends_tab_requests')}
              {requests.incoming.length > 0 && (
                <span className="friends-tabs__badge">{requests.incoming.length}</span>
              )}
            </button>
          </div>

          {tab === 'friends' ? renderFriendsTab() : renderRequestsTab()}
        </>
      )}
    </div>
  );
};

export default FriendsPage;