import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../config/api';
import '../styles/components/StreakCalendar.scss';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const toIso = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const StreakCalendar = () => {
  const { i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_BASE_URL}/api/user/streak-calendar`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return null;

  const { streak_periods } = data;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = toIso(today);
  const isCurrentMonth =
    viewDate.year === today.getFullYear() && viewDate.month === today.getMonth();

  const getDayType = (iso) => {
    for (const p of streak_periods) {
      if (iso >= p.started_at && iso <= p.ended_at) {
        return p.is_current ? 'current' : 'history';
      }
    }
    return null;
  };

  // Build the grid: Monday-aligned weeks covering the full month
  const firstDay = new Date(viewDate.year, viewDate.month, 1);
  const lastDay  = new Date(viewDate.year, viewDate.month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon
  const endDow   = (lastDay.getDay()  + 6) % 7; // 0=Mon

  const gridStart = new Date(firstDay);
  gridStart.setDate(1 - startDow);
  const gridEnd = new Date(lastDay);
  gridEnd.setDate(lastDay.getDate() + (6 - endDow));

  const days = [];
  const cur = new Date(gridStart);
  while (cur <= gridEnd) {
    const iso      = toIso(cur);
    const inMonth  = cur.getMonth() === viewDate.month;
    const isFuture = cur > today;
    days.push({
      iso,
      dayNum: cur.getDate(),
      type: (inMonth && !isFuture) ? getDayType(iso) : null,
      isToday: iso === todayIso,
      inMonth,
      isFuture,
    });
    cur.setDate(cur.getDate() + 1);
  }

  const weeks = Array.from({ length: days.length / 7 }, (_, i) =>
    days.slice(i * 7, i * 7 + 7)
  );

  const prevMonth = () =>
    setViewDate(prev =>
      prev.month === 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: prev.month - 1 }
    );

  const nextMonth = () => {
    if (isCurrentMonth) return;
    setViewDate(prev =>
      prev.month === 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: prev.month + 1 }
    );
  };

  const monthLabel = (() => {
    const s = new Date(viewDate.year, viewDate.month, 1)
      .toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  })();

  return (
    <div className="streak-calendar">
      <div className="streak-calendar__nav">
        <button className="streak-calendar__nav-btn" onClick={prevMonth}>‹</button>
        <span className="streak-calendar__month-title">{monthLabel}</span>
        <button
          className="streak-calendar__nav-btn"
          onClick={nextMonth}
          disabled={isCurrentMonth}
        >›</button>
      </div>

      <div className="streak-calendar__header">
        {DAY_LABELS.map((l, i) => (
          <span key={i} className="streak-calendar__day-label">{l}</span>
        ))}
      </div>

      <div className="streak-calendar__grid">
        {weeks.map((week, wi) =>
          week.map((day, di) => (
            <div
              key={`${wi}-${di}`}
              className={[
                'streak-calendar__cell',
                day.type === 'current' ? 'streak-calendar__cell--current' : '',
                day.type === 'history' ? 'streak-calendar__cell--history' : '',
                day.isToday  ? 'streak-calendar__cell--today'   : '',
                !day.inMonth ? 'streak-calendar__cell--outside'  : '',
                day.isFuture ? 'streak-calendar__cell--future'   : '',
              ].filter(Boolean).join(' ')}
              title={day.iso}
            >
              <span className="streak-calendar__day-num">{day.dayNum}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StreakCalendar;
