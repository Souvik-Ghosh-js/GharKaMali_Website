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

  const days = [];
  // Padding for first week
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const isSelected = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    return d === day && m === currentMonth + 1 && y === currentYear;
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
    const formatted = `${y}-${m}-${d}`;
    onChange(formatted);
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1.5px solid var(--border)', overflow: 'hidden', padding: 24, boxShadow: 'var(--sh-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', margin: 0, color: 'var(--forest)' }}>
          {months[currentMonth]} {currentYear}
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={prevMonth} className="flex-center" style={{ width: 34, height: 34, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--forest)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={nextMonth} className="flex-center" style={{ width: 34, height: 34, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--forest)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginBottom: 10 }}>
        {weekDays.map(d => (
          <div key={d} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((day, i) => {
          if (day === null) return <div key={`pad-${i}`} />;
          const selected = isSelected(day);
          const disabled = isDisabled(day);
          return (
            <button
              key={day}
              onClick={() => handleSelect(day)}
              disabled={disabled}
              style={{
                aspectRatio: '1',
                borderRadius: 14,
                background: selected ? 'var(--forest)' : disabled ? 'transparent' : 'var(--bg-elevated)',
                color: selected ? '#fff' : disabled ? 'var(--text-faint)' : 'var(--forest)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontWeight: selected ? 800 : 600,
                fontSize: '0.88rem',
                transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: disabled ? 0.2 : 1,
                border: selected ? 'none' : '1px solid var(--border)'
              }}
              onMouseEnter={e => !disabled && !selected && (e.currentTarget.style.background = 'var(--border)')}
              onMouseLeave={e => !disabled && !selected && (e.currentTarget.style.background = 'var(--bg-elevated)')}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
