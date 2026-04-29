import React, { useEffect, useState } from 'react';
import GestureCard from './GestureCard';
import API_BASE_URL from "../config/api";
import { useTranslation } from 'react-i18next'; // Імпортуємо хук

const GesturesPage = () => {
  const { t, i18n } = useTranslation(); // Ініціалізуємо
  const [gestures, setGestures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Додаємо lang до запиту, щоб отримати перекладені дані з БД
    fetch(`${API_BASE_URL}/api/data/gestures?lang=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => {
        setGestures(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching gestures:", err);
        setLoading(false);
      });
  }, [i18n.language]); // Перезавантажуємо дані при зміні мови

  // Групування жестів
  const groupedGestures = gestures.reduce((acc, gesture) => {
    if (gesture.categories && gesture.categories.length > 0) {
      gesture.categories.forEach(categoryName => {
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(gesture);
      });
    } else {
      // Використовуємо ключ перекладу для категорії "Інше"
      const otherKey = t('other');
      if (!acc[otherKey]) acc[otherKey] = [];
      acc[otherKey].push(gesture);
    }
    return acc;
  }, {});

  if (loading) return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white', padding: '40px' }}>
      {t('profile_loading')}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a1a1a]" style={{ padding: '40px', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', fontSize: '36px', fontWeight: 'bold', marginBottom: '40px' }}>
        {t('library_of_gestures')}
      </h1>

      {Object.keys(groupedGestures).map((category) => (
        <section key={category} style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '600', textTransform: 'capitalize', margin: 0 }}>
              {category}
            </h2>
            <div style={{ marginLeft: '16px', flexGrow: 1, height: '1px', backgroundColor: '#374151' }}></div>
          </div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '20px', 
            justifyContent: 'flex-start' 
          }}>
            {groupedGestures[category].map((gesture) => (
              <GestureCard key={gesture.id} gesture={gesture} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default GesturesPage;