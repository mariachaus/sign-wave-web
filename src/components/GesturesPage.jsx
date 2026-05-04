import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GestureCard from './GestureCard';
import API_BASE_URL from "../config/api";
import { useTranslation } from 'react-i18next';
import '../styles/pages/GesturesPage.scss';

const GesturesPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [gestures, setGestures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState({});

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/gestures?lang=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => { setGestures(data); setLoading(false); })
      .catch((err) => { console.error("Error fetching gestures:", err); setLoading(false); });
  }, [i18n.language]);

  const toggleCategory = (categoryName) => {
    setCollapsedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };

  const groupedGestures = gestures.reduce((acc, gesture) => {
    const keys = gesture.categories?.length > 0 ? gesture.categories : [t('other')];
    keys.forEach(k => { if (!acc[k]) acc[k] = []; acc[k].push(gesture); });
    return acc;
  }, {});

  if (loading) return <div className="gestures-page gestures-page--loading">{t('profile_loading')}</div>;

  return (
    <div className="gestures-page">
      <div className="page-header">
        <button className="page-header__back" onClick={() => navigate('/')} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="page-header__title">{t('library_of_gestures')}</h2>
      </div>

      {Object.keys(groupedGestures).map((category) => {
        const isCollapsed = collapsedCategories[category];
        return (
          <section key={category} className="gesture-section">
            <div
              className={`gesture-section__header ${isCollapsed ? 'collapsed' : ''}`}
              onClick={() => toggleCategory(category)}
            >
              <h2 className="gesture-section__title">
  <svg 
    className={`gesture-section__arrow ${isCollapsed ? 'is-collapsed' : ''}`} 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
  <span className="gesture-section__title-text">{category}</span>
</h2>
              <div className="gesture-section__divider" />
              <span className="gesture-section__count">
                {groupedGestures[category].length} {t('gestures_count', { count: groupedGestures[category].length })}
              </span>
            </div>

            {!isCollapsed && (
              <div className="gesture-section__grid">
                {groupedGestures[category].map((gesture) => (
                  <GestureCard key={gesture.id} gesture={gesture} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default GesturesPage;
