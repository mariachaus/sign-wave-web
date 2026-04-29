import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GestureCard from './GestureCard';
import API_BASE_URL from "../config/api";
import { useTranslation } from 'react-i18next';

const GestureDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Додаємо відсутні стани
  const [data, setData] = useState(null);
  const [error, setError] = useState(false); // Тепер помилка визначена

  useEffect(() => {
    // Змінив шлях на /api/gestures/ згідно з твоїм FastAPI роутером
    fetch(`${API_BASE_URL}/api/data/gestures/${id}?lang=${i18n.language}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(json => {
        setData(json);
        setError(false);
      })
      .catch(err => {
        console.error(err);
        setError(true);
      });
  }, [id, i18n.language]);

  // Перевірки станів
  if (error) return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white', textAlign: 'center', paddingTop: '50px' }}>
      <h2>{t('user_not_found')}</h2>
      <button onClick={() => navigate(-1)} style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer' }}>
        {t('back_to_dashboard')}
      </button>
    </div>
  );

  if (!data) return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white', textAlign: 'center', paddingTop: '50px' }}>
      {t('profile_loading')}
    </div>
  );

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Кнопка назад */}
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '30px', cursor: 'pointer', marginBottom: '20px' }}>
        ←
      </button>

      {/* Верхня секція */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 5px 0', display: 'inline' }}>{data.name}</h1>
          
          {data.synonyms && data.synonyms.length > 0 && (
            <span style={{ color: '#888', fontSize: '18px', marginLeft: '10px' }}>
              /{data.synonyms.join('/')}
            </span>
          )}

          <p style={{ marginTop: '20px', fontSize: '18px', lineHeight: '1.5', maxWidth: '80%' }}>
            {data.description || t('no_description')} 
          </p>
        </div>
        
        {/* Ілюстрація */}
        <div style={{ width: '150px', height: '150px', backgroundColor: '#333', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
          {data.illustration_url ? (
            <img src={data.illustration_url} alt="schematic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>👤</div>
          )}
        </div>
      </div>

      {/* Відео плеєр */}
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto 20px auto', backgroundColor: '#000', borderRadius: '15px', overflow: 'hidden', aspectRatio: '16/9' }}>
        <video src={data.video_url} controls style={{ width: '100%', height: '100%' }} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <button style={{ backgroundColor: '#555', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '20px', cursor: 'pointer', fontSize: '16px' }}>
          {t('practice_now')}
        </button>
      </div>

      {/* Секція "Схожі жести" */}
      <div style={{ borderTop: '1px solid #333', paddingTop: '30px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '30px' }}>{data.category_name}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {data.similar_gestures && data.similar_gestures.map(sg => (
              <div key={sg.id}>
                  <GestureCard 
                      gesture={sg} 
                      isActive={Number(sg.id) === Number(id)} 
                  />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GestureDetailsPage;