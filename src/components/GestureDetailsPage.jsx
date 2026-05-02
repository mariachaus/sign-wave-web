import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GestureCard from './GestureCard';
import API_BASE_URL from "../config/api";
import { useTranslation } from 'react-i18next';
import '../styles/pages/GestureDetailsPage.scss';

const GestureDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/gestures/${id}?lang=${i18n.language}`)
      .then(res => { if (!res.ok) throw new Error("Not found"); return res.json(); })
      .then(json => { setData(json); setError(false); })
      .catch(err => { console.error(err); setError(true); });
  }, [id, i18n.language]);

  if (error) return (
    <div className="gesture-details-page gesture-details-page--error">
      <h2>{t('user_not_found')}</h2>
      <button className="gesture-details-error-btn" onClick={() => navigate(-1)}>
        {t('back_to_dashboard')}
      </button>
    </div>
  );

  if (!data) return (
    <div className="gesture-details-page gesture-details-page--loading">
      {t('profile_loading')}
    </div>
  );

  return (
    <div className="gesture-details-page">
      <button className="gesture-details-back" onClick={() => navigate(-1)} aria-label="Go back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="gesture-details-top">
        <div className="gesture-details-info">
          <h1 className="gesture-details-title">{data.name}</h1>
          {data.synonyms?.length > 0 && (
            <span className="gesture-details-synonyms">/{data.synonyms.join('/')}</span>
          )}
          <p className="gesture-details-description">
            {data.description || t('no_description')}
          </p>
        </div>

        <div className="gesture-details-illustration">
          {data.illustration_url
            ? <img src={data.illustration_url} alt="schematic" />
            : '👤'
          }
        </div>
      </div>

      <div className="gesture-details-video-wrap">
        <video src={data.video_url} controls />
      </div>

      {data.is_active && (
        <div className="gesture-details-practice">
          <button className="practice-btn">{t('practice_now')}</button>
        </div>
      )}

      <div className="gesture-details-similar">
        <h2>{t('similar_gestures')}{data.category_name ? ` — ${data.category_name}` : ''}</h2>
        <div className="gesture-details-similar__grid">
          {data.similar_gestures?.map(sg => (
            <GestureCard key={sg.id} gesture={sg} isActive={Number(sg.id) === Number(id)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GestureDetailsPage;
