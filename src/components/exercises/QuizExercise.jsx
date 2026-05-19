import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const QuizExercise = ({ targetGesture, allGestures, onSuccess, onError = () => {}, mode = 'word_to_image' }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const distractors = allGestures
      .filter(g => g.id !== targetGesture.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    setOptions([...distractors, targetGesture].sort(() => Math.random() - 0.5));
    setSelectedId(null);
    setIsCorrect(null);
  }, [targetGesture, allGestures]);

  const handleSelect = (id) => {
    if (isCorrect !== null) return;
    setSelectedId(id);
    if (id === targetGesture.id) {
      setIsCorrect(true);
      setTimeout(() => onSuccess(), 1200);
    } else {
      setIsCorrect(false);
      onError({ gesture_id: targetGesture.id, exercise_type_id: 5, error_type: 'wrong_quiz_answer' });
      setTimeout(() => { setSelectedId(null); setIsCorrect(null); }, 1000);
    }
  };

  return (
    <div className="quiz-exercise">
      <h3 className="exercise-instruction">
        {mode === 'word_to_image' ? t('choose_image_for') : t('choose_word_for')}
      </h3>

      <div className="quiz-exercise__question">
        {mode === 'word_to_image' ? (
          <h1 className="quiz-exercise__word">{targetGesture.name.toUpperCase()}</h1>
        ) : (
          <img src={targetGesture.illustration_url} alt="target" className="quiz-exercise__target-img" />
        )}
      </div>

      <div className="quiz-exercise__grid">
        {options.map(option => (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={[
              'quiz-exercise__option',
              selectedId === option.id && isCorrect === true  ? 'quiz-exercise__option--correct' : '',
              selectedId === option.id && isCorrect === false ? 'quiz-exercise__option--wrong'   : '',
            ].filter(Boolean).join(' ')}
          >
            {mode === 'word_to_image' ? (
              <img src={option.illustration_url} alt="option" />
            ) : (
              option.name
            )}
          </div>
        ))}
      </div>

      <div className="exercise-feedback">
        {isCorrect === true  && <span className="exercise-feedback--correct">{t('correct_well_done')}!</span>}
        {isCorrect === false && <span className="exercise-feedback--wrong">{t('try_again')}</span>}
      </div>
    </div>
  );
};

export default QuizExercise;
