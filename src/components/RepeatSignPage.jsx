import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import QuizExercise from './exercises/QuizExercise';
import '../styles/pages/StandaloneExercise.scss';

const N_ROUNDS = 10;

const ResultsScreen = ({ score, total, onRestart, onBack, t }) => (
  <div className="ex-page">
    <div className="ex-page__results">
      <div className="ex-page__results-emoji">
        {score === total ? '🏆' : score >= total * 0.7 ? '⭐' : '💪'}
      </div>
      <h2 className="ex-page__results-title">{t('exercise_done')}</h2>
      <p className="ex-page__results-score">{score}/{total}</p>
      <p className="ex-page__results-sub">
        {score === total ? t('perfect_score') : score >= total * 0.7 ? t('great_job') : t('keep_practicing')}
      </p>
      <div className="ex-page__results-actions">
        <button className="ex-page__btn ex-page__btn--primary" onClick={onRestart}>{t('play_again')}</button>
        <button className="ex-page__btn" onClick={onBack}>{t('back_to_practice')}</button>
      </div>
    </div>
  </div>
);

const RepeatSignPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [allGestures, setAllGestures] = useState([]);
  const [session, setSession] = useState([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const buildSession = (data) => {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(N_ROUNDS, shuffled.length));
  };

  useEffect(() => {
    const lang = i18n.language || 'uk';
    axios
      .get(`${API_BASE_URL}/api/gestures?lang=${lang}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        const data = (res.data || []).filter(g => g.illustration_url || g.thumbnail_url).map(g => ({
          ...g,
          illustration_url: g.illustration_url || g.thumbnail_url,
        }));
        setAllGestures(data);
        setSession(buildSession(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [i18n.language]);

  const handleSuccess = () => {
    setScore(s => s + 1);
    if (round + 1 >= session.length) setDone(true);
    else setRound(r => r + 1);
  };

  const restart = () => {
    setSession(buildSession(allGestures));
    setRound(0);
    setScore(0);
    setDone(false);
  };

  if (loading) return <div className="ex-page"><div className="ex-page__loading">{t('loading')}</div></div>;
  if (!session.length) return (
    <div className="ex-page">
      <p>{t('no_gestures')}</p>
      <button className="ex-page__btn" onClick={() => navigate('/practice')}>{t('back_to_practice')}</button>
    </div>
  );
  if (done) return <ResultsScreen score={score} total={session.length} onRestart={restart} onBack={() => navigate('/practice')} t={t} />;

  return (
    <div className="ex-page">
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate('/practice')} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 className="page-header__title">{t('repeat_sign')}</h2>
      </div>
      <div className="ex-page__progress-row">
        <div className="ex-page__progress">
          <div className="ex-page__progress-bar" style={{ width: `${(round / session.length) * 100}%` }} />
        </div>
        <span className="ex-page__round">{round + 1}/{session.length}</span>
      </div>
      <div className="ex-page__body">
        <QuizExercise
          key={`${round}-${session[round].id}`}
          targetGesture={session[round]}
          allGestures={allGestures}
          onSuccess={handleSuccess}
          onError={() => {}}
          mode="image_to_word"
        />
      </div>
    </div>
  );
};

export default RepeatSignPage;
