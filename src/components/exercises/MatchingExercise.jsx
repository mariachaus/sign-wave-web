import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const MatchingExercise = ({ gestures, onSuccess }) => {
  const { t } = useTranslation();
  
  // Стани для перемішаних списків
  const [images, setImages] = useState([]);
  const [words, setWords] = useState([]);
  
  // Стани для вибору
  const [selectedWord, setSelectedWord] = useState(null); // Зберігаємо об'єкт {id, name}
  const [selectedImage, setSelectedImage] = useState(null); // Зберігаємо об'єкт {id, url}
  const [matchedIds, setMatchedIds] = useState([]); // ID вже знайдених пар

  // Ініціалізація та перемішування при старті
  useEffect(() => {
    const shuffledImages = [...gestures]
      .map(g => ({ id: g.id, url: g.illustration_url }))
      .sort(() => Math.random() - 0.5);
      
    const shuffledWords = [...gestures]
      .map(g => ({ id: g.id, name: g.name }))
      .sort(() => Math.random() - 0.5);

    setImages(shuffledImages);
    setWords(shuffledWords);
  }, [gestures]);

  // Слідкуємо за вибором
  useEffect(() => {
    if (selectedWord && selectedImage) {
      if (selectedWord.id === selectedImage.id) {
        // Успіх: пара знайдена
        setMatchedIds(prev => [...prev, selectedWord.id]);
        setSelectedWord(null);
        setSelectedImage(null);
      } else {
        // Помилка: скидаємо вибір через коротку паузу
        const timer = setTimeout(() => {
          setSelectedWord(null);
          setSelectedImage(null);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedWord, selectedImage]);

  // Перевірка завершення
  useEffect(() => {
    if (matchedIds.length === gestures.length && gestures.length > 0) {
      setTimeout(() => onSuccess(), 1000);
    }
  }, [matchedIds, gestures, onSuccess]);

  return (
    <div style={containerStyle}>
      <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>{t('match_pairs')}</h3>
      
      <div style={gridStyle}>
        {/* Стовпчик слів */}
        <div style={columnStyle}>
          {words.map(word => {
            const isMatched = matchedIds.includes(word.id);
            const isSelected = selectedWord?.id === word.id;
            
            return (
              <div 
                key={`word-${word.id}`}
                onClick={() => !isMatched && setSelectedWord(word)}
                style={{
                  ...itemStyle,
                  backgroundColor: isMatched ? '#1e4620' : isSelected ? '#007bff' : '#333',
                  opacity: isMatched ? 0.6 : 1,
                  cursor: isMatched ? 'default' : 'pointer',
                  border: isSelected ? '2px solid white' : '2px solid transparent'
                }}
              >
                {word.name}
              </div>
            );
          })}
        </div>

        {/* Стовпчик картинок */}
        <div style={columnStyle}>
          {images.map(img => {
            const isMatched = matchedIds.includes(img.id);
            const isSelected = selectedImage?.id === img.id;

            return (
              <div 
                key={`img-${img.id}`}
                onClick={() => !isMatched && setSelectedImage(img)}
                style={{
                  ...itemStyle,
                  padding: '5px',
                  backgroundColor: isMatched ? '#1e4620' : isSelected ? '#007bff' : '#333',
                  opacity: isMatched ? 0.6 : 1,
                  cursor: isMatched ? 'default' : 'pointer',
                  border: isSelected ? '2px solid white' : '2px solid transparent'
                }}
              >
                <img src={img.url} alt="gesture" style={imgStyle} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Стилі
const containerStyle = { padding: '20px', color: 'white', maxWidth: '800px', margin: '0 auto' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' };
const columnStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const itemStyle = {
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '15px',
  fontSize: '20px',
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  textAlign: 'center'
};
const imgStyle = { height: '100%', objectFit: 'contain', borderRadius: '10px' };

export default MatchingExercise;