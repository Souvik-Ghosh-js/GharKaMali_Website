'use client';
import { useState } from 'react';

interface CalendarProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
}

export default function Calendar({ value, onChange, minDate }: CalendarProps) {
  const [viewDate, setViewDate] = useState(() => (value ? new Date(value) : new Date()));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const min = minDate ? new Date(minDate) : today;
  min.setHours(0, 0, 0, 0);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonthPadding = firstDayOfMonth;

  const days: { day: number, type: 'prev' | 'current' | 'next' }[] = [];

  for (let i = 0; i < prevMonthPadding; i++) {
    days.push({ day: daysInPrevMonth - prevMonthPadding + i + 1, type: 'prev' });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, type: 'current' });
  }
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({ day: i, type: 'next' });
  }

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    return d === day && m === currentMonth + 1 && y === currentYear;
  };

  const isToday = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    d.setHours(0,0,0,0);
    return d.getTime() === today.getTime();
  };

  const isDisabled = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    d.setHours(0,0,0,0);
    return d < min;
  };

  const handleSelect = (day: number) => {
    if (isDisabled(day)) return;
    const y = currentYear;
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid var(--border)', overflow: 'hidden', padding: '12px 10px', boxShadow: 'var(--sh-sm)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(0.88rem,2.5vw,1rem)', margin: 0, color: 'var(--forest)' }}>
          {months[currentMonth]} {currentYear}
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={prevMonth} style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--forest)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={nextMonth} style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--forest)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center', marginBottom: 4 }}>
        {weekDays.map(d => (
          <div key={d} style={{ fontSize: 'clamp(0.58rem,1.5vw,0.68rem)', fontWeight: 700, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {days.map(({ day, type }, i) => {
          if (type !== 'current') {
            return (
              <div key={`pad-${i}`} style={{
                borderRadius: 8, height: 'clamp(32px, 10vw, 42px)', width: '100%',
                /* Clearly grey so user can see they exist but aren't selectable */
                background: 'rgba(0,0,0,0.055)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'clamp(0.65rem,1.8vw,0.78rem)', fontWeight: 400, pointerEvents: 'none',
                color: 'rgba(0,0,0,0.28)', border: '1px solid rgba(0,0,0,0.04)',
              }}>
                {day}
              </div>
            );
          }
          const selected = isSelected(day);
          const disabled = isDisabled(day);
          const todayFlag = isToday(day);
          return (
            <button
              key={day}
              onClick={() => handleSelect(day)}
              disabled={disabled}
              style={{
                height: 'clamp(32px, 10vw, 42px)', width: '100%',
                borderRadius: 8,
                background: selected
                  ? 'var(--forest)'
                  : disabled
                  ? 'rgba(0,0,0,0.04)'
                  : todayFlag
                  ? 'rgba(3,65,26,0.12)'
                  : 'rgba(0,0,0,0.04)',
                color: selected ? '#fff' : disabled ? 'rgba(0,0,0,0.28)' : 'var(--forest)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontWeight: selected ? 800 : todayFlag ? 800 : 600,
                fontSize: 'clamp(0.68rem,1.8vw,0.84rem)',
                transition: 'all 0.15s cubic-bezier(0.22, 1, 0.36, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: disabled ? 0.45 : 1,
                border: selected
                  ? '1.5px solid var(--forest)'
                  : todayFlag
                  ? '1.5px solid rgba(3,65,26,0.35)'
                  : '1px solid rgba(0,0,0,0.06)',
                position: 'relative',
                outline: 'none',
              }}
              onMouseEnter={e => { if (!disabled && !selected) { e.currentTarget.style.background = 'rgba(3,65,26,0.14)'; e.currentTarget.style.transform = 'scale(1.08)'; } }}
              onMouseLeave={e => { if (!disabled && !selected) { e.currentTarget.style.background = todayFlag ? 'rgba(3,65,26,0.12)' : 'rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'scale(1)'; } }}
            >
              {day}
              {todayFlag && !selected && (
                <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: 'var(--gold)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
