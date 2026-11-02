import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/components/FriendsLockedNotice.scss';

// Shown instead of the friends pages until the user confirms their email
const FriendsLockedNotice = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="friends-locked">
      <div className="friends-locked__icon" aria-hidden="true">✉️</div>
      <h2 className="friends-locked__title">{t('friends_locked_title')}</h2>
      <p className="friends-locked__text">{t('friends_locked_text')}</p>
      <button type="button" className="friends-locked__btn" onClick={() => navigate('/')}>
        {t('friends_locked_back')}
      </button>
    </div>
  );
};

export default FriendsLockedNotice;
