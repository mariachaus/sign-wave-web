import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const MatchingExercise = ({ gestures, onSuccess, onError = () => {} }) => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);

  useEffect(() => {
    setImages([...gestures].map(g => ({ id: g.id, url: g.illustration_url })).sort(() => Math.random() - 0.5));
    setWords([...gestures].map(g => ({ id: g.id, name: g.name })).sort(() => Math.random() - 0.5));
  }, [gestures]);

  useEffect(() => {
    if (selectedWord && selectedImage) {
      if (selectedWord.id === selectedImage.id) {
        setMatchedIds(prev => [...prev, selectedWord.id]);
        setSelectedWord(null);
        setSelectedImage(null);
      } else {
        onError(selectedWord.id);
        const timer = setTimeout(() => { setSelectedWord(null); setSelectedImage(null); }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedWord, selectedImage]);

  useEffect(() => {
    if (matchedIds.length === gestures.length && gestures.length > 0) {
      setTimeout(() => onSuccess(), 1000);
    }
  }, [matchedIds, gestures, onSuccess]);

  return (
    <div className="matching-exercise">
      <h3 className="exercise-instruction">{t('match_pairs')}</h3>

      <div className="matching-exercise__grid">
        <div className="matching-exercise__col">
          {words.map(word => {
            const isMatched  = matchedIds.includes(word.id);
            const isSelected = selectedWord?.id === word.id;
            return (
              <div
                key={`word-${word.id}`}
                onClick={() => !isMatched && setSelectedWord(word)}
                className={[
                  'matching-exercise__item',
                  isSelected ? 'matching-exercise__item--selected' : '',
                  isMatched  ? 'matching-exercise__item--matched'  : '',
                ].filter(Boolean).join(' ')}
              >
                {word.name}
              </div>
            );
          })}
        </div>

        <div className="matching-exercise__col">
          {images.map(img => {
            const isMatched  = matchedIds.includes(img.id);
            const isSelected = selectedImage?.id === img.id;
            return (
              <div
                key={`img-${img.id}`}
                onClick={() => !isMatched && setSelectedImage(img)}
                className={[
                  'matching-exercise__item',
                  isSelected ? 'matching-exercise__item--selected' : '',
                  isMatched  ? 'matching-exercise__item--matched'  : '',
                ].filter(Boolean).join(' ')}
              >
                <img src={img.url} alt="gesture" className="matching-exercise__img" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchingExercise;
