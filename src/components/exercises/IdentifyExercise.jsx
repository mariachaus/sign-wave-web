import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const IdentifyExercise = ({ targetGesture, allGestures, onSuccess, onError = () => {} }) => {
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
      onError({ gesture_id: targetGesture.id, exercise_type_id: 6, error_type: 'wrong_identify_answer' });
      setTimeout(() => { setSelectedId(null); setIsCorrect(null); }, 1000);
    }
  };

  return (
    <div className="identify-exercise identify-exercise--lesson">
      <p className="exercise-instruction">{t('identify_from_desc')}</p>
      <div className="identify-exercise__desc">{targetGesture.description}</div>
      <div className="identify-exercise__options">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            disabled={selectedId !== null}
            className={[
              'identify-exercise__option',
              selectedId === opt.id && isCorrect        ? 'identify-exercise__option--correct' : '',
              selectedId === opt.id && !isCorrect       ? 'identify-exercise__option--wrong'   : '',
              selectedId !== null && selectedId !== opt.id && opt.id === targetGesture.id
                ? 'identify-exercise__option--reveal' : '',
            ].filter(Boolean).join(' ')}
          >
            {opt.name}
          </button>
        ))}
      </div>
      <div className="exercise-feedback">
        {isCorrect === true  && <span className="exercise-feedback--correct">{t('correct_well_done')}!</span>}
        {isCorrect === false && <span className="exercise-feedback--wrong">{t('try_again')}</span>}
      </div>
    </div>
  );
};

export default IdentifyExercise;
