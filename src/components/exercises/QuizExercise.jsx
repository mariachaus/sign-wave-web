import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const QuizExercise = ({ targetGesture, allGestures, onSuccess, mode = 'word_to_image' }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    // Формуємо список варіантів: правильний + 3 випадкових
    const distractors = allGestures
      .filter(g => g.id !== targetGesture.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const combinedOptions = [...distractors, targetGesture].sort(() => Math.random() - 0.5);
    setOptions(combinedOptions);
    setSelectedId(null);
    setIsCorrect(null);
  }, [targetGesture, allGestures]);

  const handleSelect = (id) => {
    if (isCorrect !== null) return; // Блокуємо повторні кліки

    setSelectedId(id);
    if (id === targetGesture.id) {
      setIsCorrect(true);
      setTimeout(() => onSuccess(), 1200); // Перехід далі через паузу
    } else {
      setIsCorrect(false);
      // Скидаємо помилку через секунду, щоб юзер спробував ще раз
      setTimeout(() => {
        setSelectedId(null);
        setIsCorrect(null);
      }, 1000);
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={instructionStyle}>
        {mode === 'word_to_image' ? t('choose_image_for') : t('choose_word_for')}
      </h3>

      {/* Секція Питання */}
      <div style={questionBoxStyle}>
        {mode === 'word_to_image' ? (
          <h1 style={wordStyle}>{targetGesture.name.toUpperCase()}</h1>
        ) : (
          <img src={targetGesture.illustration_url} alt="target" style={targetImgStyle} />
        )}
      </div>

      {/* Секція Варіантів */}
      <div style={optionsGridStyle}>
        {options.map(option => (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id)}
            style={{
              ...optionCardStyle,
              backgroundColor: selectedId === option.id 
                ? (isCorrect ? '#28a745' : '#dc3545') 
                : '#333',
              border: selectedId === option.id ? '2px solid white' : '2px solid transparent'
            }}
          >
            {mode === 'word_to_image' ? (
              <img src={option.illustration_url} alt="option" style={optionImgStyle} />
            ) : (
              <span style={optionTextStyle}>{option.name}</span>
            )}
          </div>
        ))}
      </div>

      {/* Фідбек */}
      <div style={{ height: '30px', marginTop: '20px' }}>
        {isCorrect === true && <span style={{ color: '#28a745', fontWeight: 'bold' }}>{t('correct_well_done')}!</span>}
        {isCorrect === false && <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{t('try_again')}</span>}
      </div>
    </div>
  );
};

// Стилі
const containerStyle = { 
  display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', color: 'white' 
};
const instructionStyle = { color: '#888', marginBottom: '20px' };
const questionBoxStyle = { 
  backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '25px', marginBottom: '40px',
  minWidth: '300px', textAlign: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
};
const wordStyle = { fontSize: '42px', margin: 0, letterSpacing: '3px' };
const targetImgStyle = { height: '150px', objectFit: 'contain' };

const optionsGridStyle = { 
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', maxWidth: '600px' 
};
const optionCardStyle = {
  height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s ease', overflow: 'hidden'
};
const optionImgStyle = { height: '80%', objectFit: 'contain' };
const optionTextStyle = { fontSize: '22px', fontWeight: 'bold' };

export default QuizExercise;