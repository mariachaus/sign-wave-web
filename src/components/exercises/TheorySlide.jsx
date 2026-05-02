import React from 'react';
import { useTranslation } from 'react-i18next';

const TheorySlide = ({ gesture, theoryText, onSuccess }) => {
  const { t } = useTranslation();

  return (
    <div style={containerStyle}>
      <div style={contentBoxStyle}>
        {/* Візуал для теорії: картинка або відео */}
        <div style={visualSectionStyle}>
          {gesture.illustration_url ? (
            <img src={gesture.illustration_url} alt="Theory" style={imgStyle} />
          ) : (
            <div style={placeholderStyle}>📖</div>
          )}
        </div>

        {/* Текстова секція */}
        <div style={textSectionStyle}>
          <h2 style={titleStyle}>{gesture.name}</h2>
          <div style={dividerStyle} />
          <p style={descriptionStyle}>
            {theoryText || gesture.description || t('no_theory_available')}
          </p>
        </div>
      </div>

      {/* Кнопка переходу */}
      <button onClick={onSuccess} style={buttonStyle}>
        {t('continue')} ➜
      </button>
    </div>
  );
};

// Стилі
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  color: 'white',
  minHeight: '60vh'
};

const contentBoxStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '40px',
  backgroundColor: '#2a2a2a',
  padding: '40px',
  borderRadius: '30px',
  maxWidth: '900px',
  width: '100%',
  boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
  flexWrap: 'wrap' // Для мобільних пристроїв
};

const visualSectionStyle = {
  flex: '1',
  minWidth: '250px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#1a1a1a',
  borderRadius: '20px',
  padding: '20px'
};

const imgStyle = {
  maxWidth: '100%',
  maxHeight: '300px',
  objectFit: 'contain'
};

const placeholderStyle = { fontSize: '100px' };

const textSectionStyle = {
  flex: '1.5',
  minWidth: '300px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const titleStyle = {
  fontSize: '32px',
  margin: '0 0 10px 0',
  color: '#007bff'
};

const dividerStyle = {
  width: '50px',
  height: '4px',
  backgroundColor: '#007bff',
  marginBottom: '20px',
  borderRadius: '2px'
};

const descriptionStyle = {
  fontSize: '18px',
  lineHeight: '1.6',
  color: '#ddd',
  margin: 0
};

const buttonStyle = {
  marginTop: '40px',
  padding: '15px 50px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '30px',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, backgroundColor 0.2s ease',
  boxShadow: '0 5px 15px rgba(0,123,255,0.3)'
};

export default TheorySlide;