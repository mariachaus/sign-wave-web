import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/pages/PracticeHubPage.scss';

const I = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />
);

const IconFlashcards = () => <I><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 2H8a2 2 0 0 0-2 2v2h12V4a2 2 0 0 0-2-2z"/></I>;
const IconCalendar   = () => <I><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></I>;
const IconQuiz       = () => <I><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></I>;
const IconSearch     = () => <I><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></I>;
const IconRepeat     = () => <I><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></I>;
const IconCamera     = () => <I><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></I>;

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const HubRow = ({ icon, title, description, onClick }) => (
  <button className="hub-row" onClick={onClick}>
    <span className="hub-row__icon">{icon}</span>
    <div className="hub-row__body">
      <span className="hub-row__title">{title}</span>
      <span className="hub-row__desc">{description}</span>
    </div>
    <ChevronRight />
  </button>
);

const PracticeHubPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [dailyGesture, setDailyGesture] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const lang = i18n.language || 'uk';
    axios
      .get(`${API_BASE_URL}/api/gestures/daily?lang=${lang}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(r => setDailyGesture(r.data))
      .catch(() => {});
  }, [i18n.language]);

  return (
    <div className="practice-hub">
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate('/')} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 className="page-header__title">{t('practice')}</h2>
      </div>

      <section className="practice-hub__section">
        <h2 className="practice-hub__label">{t('quick_practice')}</h2>
        <div className="practice-hub__group">
          <HubRow
            icon={<IconFlashcards />}
            title={t('flashcards')}
            description={t('flashcards_desc')}
            onClick={() => navigate('/flashcards')}
          />
          <HubRow
            icon={<IconCalendar />}
            title={t('gesture_of_day')}
            description={dailyGesture ? dailyGesture.name : '—'}
            onClick={() => dailyGesture && navigate(`/gestures/${dailyGesture.id}`)}
          />
        </div>
      </section>

      <section className="practice-hub__section">
        <h2 className="practice-hub__label">{t('exercises')}</h2>
        <div className="practice-hub__group">
          <HubRow
            icon={<IconQuiz />}
            title={t('sign_quiz')}
            description={t('sign_quiz_desc')}
            onClick={() => navigate('/practice/sign-quiz')}
          />
          <HubRow
            icon={<IconSearch />}
            title={t('identify_signs')}
            description={t('identify_signs_desc')}
            onClick={() => navigate('/practice/identify')}
          />
          <HubRow
            icon={<IconRepeat />}
            title={t('repeat_sign')}
            description={t('repeat_sign_desc')}
            onClick={() => navigate('/practice/repeat')}
          />
          <HubRow
            icon={<IconCamera />}
            title={t('watch_reproduce')}
            description={t('watch_reproduce_desc')}
            onClick={() => navigate('/practice/watch-reproduce')}
          />
        </div>
      </section>
    </div>
  );
};

export default PracticeHubPage;
