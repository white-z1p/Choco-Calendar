import { DAYS, MONTHS, dk } from '../utils/time';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

/**
 * A reusable month-view calendar grid.
 *
 * Props:
 *  - year, month (0-indexed)
 *  - selected: {y,m,d} | null
 *  - today: Date
 *  - onPrevMonth(), onNextMonth()
 *  - onSelectDay(day)
 *  - getDots(dateKey): returns array of dot className strings (or empty array) for a given day
 */
export default function MonthCalendar({ year, month, selected, today, onPrevMonth, onNextMonth, onSelectDay, getDots }) {
  const first = new Date(year, month, 1).getDay();
  const last = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < first; i++) {
    cells.push(<div className="dc empty" key={`empty-${i}`} />);
  }
  for (let d = 1; d <= last; d++) {
    const key = dk(year, month, d);
    const dow = (first + d - 1) % 7;
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isSelected = selected && dk(selected.y, selected.m, selected.d) === key;
    const dots = getDots ? getDots(key, d) : [];

    cells.push(
      <div
        key={key}
        className={`dc${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
        onClick={() => onSelectDay(d)}
      >
        <div className={`dn${dow === 0 ? ' sun' : dow === 6 ? ' sat' : ''}`}>{d}</div>
        {dots && dots.length > 0 && (
          <div className="dots">
            {dots.map((cls, i) => (
              <div className={`dot${cls ? ' ' + cls : ''}`} key={i} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="month-nav">
        <button className="mnav-btn" aria-label="이전 달" onClick={onPrevMonth}>
          <ChevronLeftIcon />
        </button>
        <div className="month-title">{year}년 {MONTHS[month]}</div>
        <button className="mnav-btn" aria-label="다음 달" onClick={onNextMonth}>
          <ChevronRightIcon />
        </button>
      </div>
      <div className="cal-grid">
        {DAYS.map((d, i) => (
          <div className={`dh ${i === 0 ? 'sun-h' : i === 6 ? 'sat-h' : ''}`} key={d}>{d}</div>
        ))}
        {cells}
      </div>
    </>
  );
}
