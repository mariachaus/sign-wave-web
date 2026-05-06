import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/pages/FlashcardsPage.scss';

const MASTERY_MAX = 3;
const SWIPE_THRESHOLD = 80;

const MasteryDots = ({ level }) => (
  <div className="flashcard__mastery">
    {Array.from({ length: MASTERY_MAX }).map((_, i) => (
      <div
        key={i}
        className={`flashcard__mastery-dot${i < level ? ' flashcard__mastery-dot--filled' : ''}`}
      />
    ))}
  </div>
);

const FlashcardsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [cards, setCards] = useState([]);
  const [totalLearned, setTotalLearned] = useState(0);
  const [loading, setLoading] = useState(true);
  const originalCards = useRef([]);

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knowCount, setKnowCount] = useState(0);
  const [unknownCards, setUnknownCards] = useState([]);
  const [done, setDone] = useState(false);

  // Drag state
  const [dragX, setDragX] = useState(0);
  const [flying, setFlying] = useState(null); // 'right' | 'left' | null
  const isDragging = useRef(false);
  const startX = useRef(0);
  const cardRef = useRef(null);

  useEffect(() => {
    const lang = i18n.language || 'uk';
    axios
      .get(`${API_BASE_URL}/api/flashcards/today?lang=${lang}`, { headers })
      .then(res => {
        const fetched = res.data.cards || [];
        originalCards.current = fetched;
        setCards(fetched);
        setTotalLearned(res.data.total_learned || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [i18n.language]);

  const currentCard = cards[idx];
  const progress = cards.length > 0 ? Math.round((idx / cards.length) * 100) : 0;

  const processReview = useCallback(async (known) => {
    if (!currentCard) return;
    try {
      await axios.post(
        `${API_BASE_URL}/api/flashcards/${currentCard.id}/review`,
        { known },
        { headers }
      );
    } catch {}

    if (known) {
      setKnowCount(k => k + 1);
    } else {
      setUnknownCards(prev => [...prev, currentCard]);
    }

    if (idx + 1 >= cards.length) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setFlipped(false);
    }
  }, [currentCard, idx, cards.length]);

  const triggerSwipe = useCallback((dir) => {
    setFlying(dir);
    setTimeout(() => {
      setFlying(null);
      setDragX(0);
      processReview(dir === 'right');
    }, 320);
  }, [processReview]);

  // Pointer handlers for drag-to-swipe
  const onPointerDown = (e) => {
    if (e.target.closest('button')) return;
    isDragging.current = true;
    startX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    cardRef.current?.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? startX.current;
    setDragX(x - startX.current);
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragX > SWIPE_THRESHOLD) {
      triggerSwipe('right');
    } else if (dragX < -SWIPE_THRESHOLD) {
      triggerSwipe('left');
    } else {
      setDragX(0);
    }
  };

  const getCardStyle = () => {
    if (flying === 'right') return { transform: 'translateX(150%) rotate(25deg)', transition: 'transform 0.32s ease' };
    if (flying === 'left')  return { transform: 'translateX(-150%) rotate(-25deg)', transition: 'transform 0.32s ease' };
    if (isDragging.current) return { transform: `translateX(${dragX}px) rotate(${dragX * 0.06}deg)`, transition: 'none' };
    return { transform: `translateX(${dragX}px) rotate(${dragX * 0.06}deg)`, transition: 'transform 0.25s ease' };
  };

  const swipeOpacityRight = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1);
  const swipeOpacityLeft  = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1);

  const handleRestart = (cardsToUse) => {
    setCards(cardsToUse);
    setIdx(0);
    setFlipped(false);
    setKnowCount(0);
    setUnknownCards([]);
    setDragX(0);
    setFlying(null);
    setDone(false);
  };

  const handleReviewAll = async () => {
    const lang = i18n.language || 'uk';
    try {
      const res = await axios.get(`${API_BASE_URL}/api/flashcards/today?lang=${lang}&all=true`, { headers });
      const all = res.data.cards || [];
      originalCards.current = all;
      setCards(all);
    } catch {}
    setIdx(0);
    setFlipped(false);
    setKnowCount(0);
    setUnknownCards([]);
    setStarted(true);
  };

  if (loading) return <div className="flashcards-page" />;

  // ── Done screen ──────────────────────────────────────────
  if (done) {
    return (
      <div className="flashcards-page">
        <div className="flashcards-done">
          <div className="flashcards-done__icon">🎉</div>
          <h2 className="flashcards-done__title">{t('flashcards_done')}</h2>
          <div className="flashcards-done__results">
            <div className="flashcards-done__result">
              <span className="flashcards-done__result-value flashcards-done__result-value--know">{knowCount}</span>
              <span className="flashcards-done__result-label">{t('know_it')}</span>
            </div>
            <div className="flashcards-done__result">
              <span className="flashcards-done__result-value flashcards-done__result-value--unknown">{unknownCards.length}</span>
              <span className="flashcards-done__result-label">{t('dont_know')}</span>
            </div>
          </div>
          {unknownCards.length > 0 && (
            <button className="flashcards-done__btn" onClick={() => handleRestart(unknownCards)}>
              {t('flashcards_continue')}
            </button>
          )}
          <button className="flashcards-done__btn" onClick={() => handleRestart(originalCards.current)}>
            {t('flashcards_restart_set')}
          </button>
          <button className="flashcards-done__btn flashcards-done__btn--secondary" onClick={() => setStarted(false)}>
            {t('back_to_dashboard')}
          </button>
        </div>
      </div>
    );
  }

  // ── Landing screen ───────────────────────────────────────
  if (!started) {
    return (
      <div className="flashcards-page">
        <button className="flashcards-header__back" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flashcards-landing">
          <h2 className="flashcards-landing__title">{t('flashcards')}</h2>
          <div className="flashcards-landing__stats">
            <div className="flashcards-landing__stat">
              <span className="flashcards-landing__stat-value">{cards.length}</span>
              <span className="flashcards-landing__stat-label">{t('flashcards_due')}</span>
            </div>
            <div className="flashcards-landing__stat">
              <span className="flashcards-landing__stat-value">{totalLearned}</span>
              <span className="flashcards-landing__stat-label">{t('flashcards_total')}</span>
            </div>
          </div>

          {cards.length > 0 ? (
            <>
              <button className="flashcards-landing__btn" onClick={() => setStarted(true)}>
                {t('flashcards_continue')}
              </button>
              {totalLearned > cards.length && (
                <button className="flashcards-landing__btn flashcards-landing__btn--secondary" onClick={handleReviewAll}>
                  {t('flashcards_restart_set')} ({totalLearned})
                </button>
              )}
            </>
          ) : (
            totalLearned > 0 && (
              <button className="flashcards-landing__btn" onClick={handleReviewAll}>
                {t('flashcards_restart_set')}
              </button>
            )
          )}

          <button className="flashcards-landing__btn flashcards-landing__btn--secondary" onClick={() => navigate('/')}>
            {t('back_to_dashboard')}
          </button>
        </div>
      </div>
    );
  }

  // ── Session screen ───────────────────────────────────────
  return (
    <div className="flashcards-page">
      <div className="flashcards-session">

        {/* Header */}
        <div className="flashcards-header">
          <button className="flashcards-header__back" onClick={() => setStarted(false)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="flashcards-progress">
            <div className="flashcards-progress__bar">
              <div className="flashcards-progress__fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="flashcards-progress__label">{idx + 1} / {cards.length}</span>
          </div>
          <button className="flashcards-header__restart" onClick={() => handleRestart(cards)} title={t('flashcards_restart')}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
          </button>
        </div>

        {/* Swipe indicators */}
        <div className="flashcard-indicators">
          <div className="flashcard-indicator flashcard-indicator--know" style={{ opacity: swipeOpacityRight }}><span class="label">✓ {t('know_it')}</span></div>
          <div className="flashcard-indicator flashcard-indicator--unknown" style={{ opacity: swipeOpacityLeft }}><span class="label">✗ {t('dont_know')}</span></div>
        </div>

        {/* Card */}
        <div
          ref={cardRef}
          className={`flashcard-wrap${flipped ? ' flashcard-wrap--flipped' : ''}`}
          style={getCardStyle()}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={() => { if (Math.abs(dragX) < 5) setFlipped(f => !f); }}
        >
          <div className="flashcard">
            {/* Front */}
            <div className="flashcard__face">
              <span className="flashcard__word">{currentCard.name}</span>
              <span className="flashcard__hint">{t('flip_card')}</span>
            </div>

            {/* Back */}
            <div className="flashcard__face flashcard__back">
              {currentCard.illustration_url && (
                <img
                  src={currentCard.illustration_url}
                  alt={currentCard.name}
                  className="flashcard__image"
                />
              )}
              {currentCard.description && (
                <p className="flashcard__description">{currentCard.description}</p>
              )}
              <MasteryDots level={currentCard.mastery_level} />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flashcards-actions">
          {!flipped && (
            <button className="flashcards-actions__btn flashcards-actions__btn--flip" onClick={() => setFlipped(true)}>
              {t('flip_card')}
            </button>
          )}
          {flipped && (
            <p className="flashcards-actions__swipe-hint">
              ← {t('dont_know')} &nbsp;·&nbsp; {t('know_it')} →
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default FlashcardsPage;
