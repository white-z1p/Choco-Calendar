import { parseTimeToMinutes, todayStr } from '../../utils/time';
import { schedTypeInfo } from '../../firebase/scheduleApi';

export default function UpcomingBox({ schedules, onJump }) {
  const todayK = todayStr();
  const items = [];
  for (const dateKey in schedules) {
    for (const id in schedules[dateKey]) {
      const ev = schedules[dateKey][id];
      if (ev.done) continue;
      items.push({ dateKey, id, ...ev });
    }
  }
  items.sort((a, b) => (a.dateKey === b.dateKey ? parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time) : a.dateKey < b.dateKey ? -1 : 1));
  const upcoming = items.filter((it) => it.dateKey >= todayK).slice(0, 4);
  const overdue = items.filter((it) => it.dateKey < todayK);

  if (!upcoming.length && !overdue.length) {
    return (
      <div className="upcoming-box">
        <div className="upcoming-title">📌 다가오는 일정</div>
        <div className="upcoming-empty">등록된 일정이 없어요. 아래 달력에서 추가해보세요!</div>
      </div>
    );
  }

  return (
    <div className="upcoming-box">
      <div className="upcoming-title">📌 다가오는 일정</div>
      {overdue.map((it) => {
        const info = schedTypeInfo(it.type);
        return (
          <div className="sched-ev" style={{ cursor: 'pointer' }} key={`${it.dateKey}-${it.id}`} onClick={() => onJump(it.dateKey)}>
            <div className="sched-icon">{info.emoji}</div>
            <div className="sched-content">
              <div className="sched-title" style={{ color: '#C0392B' }}>{it.title || info.label} · 지남</div>
              <div className="sched-time">{it.dateKey}{it.time ? ' · ' + it.time : ''}</div>
            </div>
          </div>
        );
      })}
      {upcoming.map((it) => {
        const info = schedTypeInfo(it.type);
        return (
          <div className="sched-ev" style={{ cursor: 'pointer' }} key={`${it.dateKey}-${it.id}`} onClick={() => onJump(it.dateKey)}>
            <div className="sched-icon">{info.emoji}</div>
            <div className="sched-content">
              <div className="sched-title">{it.title || info.label}</div>
              <div className="sched-time">{it.dateKey}{it.time ? ' · ' + it.time : ''}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
