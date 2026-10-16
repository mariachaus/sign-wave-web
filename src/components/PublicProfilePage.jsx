import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import UserAvatar from './UserAvatar';
import {IconFlame, IconHand, IconStar, IconAchievement,} from './Icons';
import API_BASE_URL from '../config/api';
import '../styles/pages/PublicProfilePage.scss';

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const errorText = (err, fallback) =>
  err.response?.data?.error || fallback;

const notifyChanged = () =>
  window.dispatchEvent(new Event('friends:changed'));

const PublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const base = `${API_BASE_URL}/api/friends`;

  const load = useCallback(async () => {
    try {
      const res = await axios.get(
        `${base}/profile/${id}`,
        authConfig()
      );

      setProfile(res.data);
      setNotFound(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
        setProfile(null);
      } else {
        setError(
          errorText(err, t('friends_error_generic'))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [base, id, t]);

  useEffect(() => {
    setLoading(true);
    setError('');
    load();
  }, [load]);

  const act = async (request) => {
    setBusy(true);
    setError('');

    try {
      await request();
      await load();
      notifyChanged();
    } catch (err) {
      setError(
        errorText(err, t('friends_error_generic'))
      );
    } finally {
      setBusy(false);
    }
  };

  const addFriend = () =>
    act(() =>
      axios.post(
        `${base}/request/${profile.id}`,
        null,
        authConfig()
      )
    );

  const acceptRequest = () =>
    act(() =>
      axios.post(
        `${base}/${profile.friendship_id}/accept`,
        null,
        authConfig()
      )
    );

  const removeFriendship = () =>
    act(() =>
      axios.delete(
        `${base}/${profile.friendship_id}`,
        authConfig()
      )
    );

  const removeFriend = () => {
    if (
      window.confirm(
        t('friends_remove_confirm', {
          name: profile.username,
        })
      )
    ) {
      removeFriendship();
    }
  };

  const renderActions = () => {
    switch (profile.friendship_status) {
      case 'self':
        return (
          <Link
            to="/profile"
            className="public-profile__btn public-profile__btn--ghost"
          >
            {t('friends_go_to_profile')}
          </Link>
        );

      case 'friends':
        return (
          <>
            <span className="public-profile__tag">
              {t('friends_status_friends')}
            </span>

            <button
              className="public-profile__btn public-profile__btn--ghost"
              disabled={busy}
              onClick={removeFriend}
            >
              {t('friends_remove')}
            </button>
          </>
        );

      case 'pending_outgoing':
        return (
          <>
            <span className="public-profile__tag public-profile__tag--muted">
              {t('friends_request_sent')}
            </span>

            <button
              className="public-profile__btn public-profile__btn--ghost"
              disabled={busy}
              onClick={removeFriendship}
            >
              {t('friends_cancel_request')}
            </button>
          </>
        );

      case 'pending_incoming':
        return (
          <>
            <button
              className="public-profile__btn public-profile__btn--primary"
              disabled={busy}
              onClick={acceptRequest}
            >
              {t('friends_accept')}
            </button>

            <button
              className="public-profile__btn public-profile__btn--ghost"
              disabled={busy}
              onClick={removeFriendship}
            >
              {t('friends_decline')}
            </button>
          </>
        );

      default:
        return (
          <button
            className="public-profile__btn public-profile__btn--primary"
            disabled={busy}
            onClick={addFriend}
          >
            {t('friends_add')}
          </button>
        );
    }
  };

  const locale = i18n.language?.startsWith('uk')
    ? 'uk-UA'
    : 'en-US';

  const memberSince =
    profile?.member_since &&
    new Date(profile.member_since).toLocaleDateString(
      locale,
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );

  const stats = profile
    ? [
        {
          icon: <IconStar size={28} />,
          value: (profile.total_xp || 0).toLocaleString(),
          label: 'XP',
          mod: 'xp',
        },
        {
          icon: <IconFlame size={28} />,
          value: profile.current_streak ?? 0,
          label: t('current_streak'),
          mod: 'streak',
        },
        {
          icon: <IconHand size={28} />,
          value: profile.gestures_mastered ?? 0,
          label: t('public_profile_gestures'),
          mod: 'hand',
        },
        {
          icon: <IconAchievement size={28} />,
          value: profile.achievements_count ?? 0,
          label: t('public_profile_achievements'),
          mod: 'achievement',
        },
      ]
    : [];

  return (
    <div className="public-profile">
      <div className="page-header">
        <button
          className="page-header__back"
          onClick={() => navigate('/friends')}
          aria-label={t('friends_back')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="page-header__title">
          {t('friends')}
        </h2>
      </div>

      {error && (
        <div
          className="public-profile__error"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="public-profile__hint">
          {t('friends_loading')}
        </p>
      ) : notFound ? (
        <p className="public-profile__hint">
          {t('public_profile_not_found')}
        </p>
      ) : (
        profile && (
          <>
            <div className="public-profile__card">
              <UserAvatar user={profile} size={96} />

              <div className="public-profile__info">
                <h1 className="public-profile__name">
                  {profile.username}
                </h1>

                {memberSince && (
                  <div className="public-profile__since">
                    {t('joined')} {memberSince}
                  </div>
                )}

                <div className="public-profile__actions">
                  {renderActions()}
                </div>
              </div>
            </div>

            <div className="profile-stats">
              {stats.map((stat) => (
                <div
                  key={stat.mod}
                  className={`profile-stat-card profile-stat-card--${stat.mod}`}
                >
                  <div className="profile-stat-card__icon">
                    {stat.icon}
                  </div>

                  <div className="profile-stat-card__value">
                    {stat.value}
                  </div>

                  <div className="profile-stat-card__label">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      )}
    </div>
  );
};

export default PublicProfilePage;