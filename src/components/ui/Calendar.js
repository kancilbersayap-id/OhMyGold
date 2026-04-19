'use client';

import { useState } from 'react';
import Badge from './Badge';
import styles from './Calendar.module.css';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

export default function Calendar({ data = [], minDate = new Date(2025, 0, 1), maxDate = new Date(), onDayAction }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatRp = (num) => `Rp ${parseInt(num).toLocaleString('id-ID')}`;

  const minPrice = data.length > 0 ? Math.min(...data.map(d => d.buybackPrice)) : null;
  const maxPrice = data.length > 0 ? Math.max(...data.map(d => d.buybackPrice)) : null;

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getPriceForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const item = data.find(d => d.date === dateStr);
    return item;
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    if (newDate >= minDate) {
      setCurrentDate(newDate);
    }
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    if (newDate <= maxDate) {
      setCurrentDate(newDate);
    }
  };

  const handleDayAction = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const item = getPriceForDate(day);
    if (onDayAction && item) {
      onDayAction(item);
    }
  };

  const canGoPrevious = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1) >= minDate;
  const canGoNext = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) <= maxDate;

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <div className={styles.monthYear}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <div className={styles.navigationButtons}>
          <button
            className={styles.navButton}
            onClick={goToPreviousMonth}
            disabled={!canGoPrevious}
            aria-label="Previous month"
          >
            <ChevronLeft />
          </button>
          <button
            className={styles.navButton}
            onClick={goToNextMonth}
            disabled={!canGoNext}
            aria-label="Next month"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className={styles.calendarGrid}>
        {dayNames.map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}

        {days.map((day, idx) => {
          const priceItem = day !== null ? getPriceForDate(day) : null;
          return (
            <div key={idx} className={styles.dayCell}>
              {day !== null ? (
                <>
                  <div className={styles.dayCellContent}>
                    <div className={styles.dayNumber}>{day}</div>
                  </div>
                  {priceItem && (
                    <div className={styles.priceContainer}>
                      {priceItem.buybackPrice === minPrice && (
                        <Badge type="positive">Low</Badge>
                      )}
                      {priceItem.buybackPrice === maxPrice && (
                        <Badge type="negative">High</Badge>
                      )}
                      <div className={styles.price}>
                        {formatRp(priceItem.buybackPrice)}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
