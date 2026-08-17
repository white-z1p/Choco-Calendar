import { useMemo, useState } from 'react';
import { diffDaysFromToday } from '../utils/time';
import { schedTypeInfo } from '../firebase/scheduleApi';

export function useScheduleAlerts(schedules) {
  const [dismissed, setDismissed] = useState(() => new Set());

  const banners = useMemo(() => {
    const result = [];
    for (const dateKey in schedules) {
      const diff = diffDaysFromToday(dateKey);
      if (diff > 3) continue;
      for (const id in schedules[dateKey]) {
        const ev = schedules[dateKey][id];
        if (ev.done) continue;
        const bannerId = `${dateKey}-${id}`;
        if (dismissed.has(bannerId)) continue;
        const info = schedTypeInfo(ev.type);
        let title, body;
        if (diff < 0) { title = `${info.emoji} ${ev.title || info.label} 지남`; body = '예정일이 지났어요. 확인해주세요!'; }
        else if (diff === 0) { title = `${info.emoji} 오늘은 ${ev.title || info.label} 날이에요!`; body = ev.time ? `${ev.time}${ev.memo ? ' · ' + ev.memo : ''}` : (ev.memo || '잊지 말고 챙겨주세요 🐾'); }
        else { title = `${info.emoji} ${ev.title || info.label} D-${diff}`; body = `${dateKey}${ev.time ? ' ' + ev.time : ''}`; }
        result.push({ id: bannerId, icon: info.emoji, title, body });
      }
    }
    return result;
  }, [schedules, dismissed]);

  const dismiss = (id) => setDismissed((s) => new Set(s).add(id));

  return { banners, dismiss };
}
