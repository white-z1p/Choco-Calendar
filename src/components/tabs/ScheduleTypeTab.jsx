import { useState } from 'react';
import MonthCalendar from '../MonthCalendar';
import ScheduleDetailPanel from './ScheduleDetailPanel';
import UpcomingBox from './UpcomingBox';
import { dk } from '../../utils/time';
import { filterSchedulesByType } from '../../firebase/scheduleApi';

const now = new Date();

export default function ScheduleTypeTab({ type, emptyHint, schedules }) {
  const [svY, setSvY] = useState(now.getFullYear());
  const [svM, setSvM] = useState(now.getMonth());
  const [sSel, setSSel] = useState(null);

  const typeSchedules = filterSchedulesByType(schedules, type);

  const getDots = (key) => {
    const dayData = typeSchedules[key];
    if (!dayData) return [];
    return Object.values(dayData).slice(0, 3).map((ev) => `dot-${ev.type}${ev.done ? ' done' : ''}`);
  };

  const changeMonth = (delta) => {
    let m = svM + delta, y = svY;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setSvM(m); setSvY(y); setSSel(null);
  };

  const jumpTo = (dateKey) => {
    const [y, m, d] = dateKey.split('-').map(Number);
    setSvY(y); setSvM(m - 1); setSSel({ y, m: m - 1, d });
  };

  return (
    <div>
      <UpcomingBox schedules={typeSchedules} onJump={jumpTo} />
      <MonthCalendar
        year={svY}
        month={svM}
        selected={sSel}
        today={now}
        onPrevMonth={() => changeMonth(-1)}
        onNextMonth={() => changeMonth(1)}
        onSelectDay={(d) => setSSel({ y: svY, m: svM, d })}
        getDots={getDots}
      />
      <div className="divider">📅 📅 📅</div>
      {sSel ? (
        <ScheduleDetailPanel
          key={dk(sSel.y, sSel.m, sSel.d)}
          y={sSel.y}
          m={sSel.m}
          d={sSel.d}
          schedules={typeSchedules}
          fixedType={type || undefined}
          onClose={() => setSSel(null)}
        />
      ) : (
        <div className="no-sel"><div className="paw">📅</div><p>{emptyHint}</p></div>
      )}
    </div>
  );
}
