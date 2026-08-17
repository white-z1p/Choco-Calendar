export const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
export const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export function dk(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function todayStr(now = new Date()) {
  return dk(now.getFullYear(), now.getMonth(), now.getDate());
}

export function normalizeTimeFormat(input) {
  if (!input) return '';
  let s = String(input).trim();
  s = s.replace(/\b(\d{1,2}):(\d{1,2})\b/g, (_, h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  s = s.replace(/\b(\d{1,2})시\s*(\d{1,2})분\b/g, (_, h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  return s;
}

export function parseTimeToMinutes(t) {
  if (!t) return 9999;
  const s = t.trim();
  const hm = s.match(/^(\d{1,2}):(\d{1,2})/);
  if (hm) return parseInt(hm[1]) * 60 + parseInt(hm[2]);
  const ko = s.match(/^(오전|오후|새벽|밤|저녁|아침|낮)?\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/);
  if (ko) {
    let h = parseInt(ko[2]), min = parseInt(ko[3] || '0');
    const prefix = ko[1] || '';
    if (prefix === '오후' || prefix === '저녁' || prefix === '밤') { if (h !== 12) h += 12; }
    if (prefix === '오전' || prefix === '새벽' || prefix === '아침') { if (h === 12) h = 0; }
    if (prefix === '낮') { if (h < 12) h += 12; }
    return h * 60 + min;
  }
  const numOnly = s.match(/^(\d{1,2})$/);
  if (numOnly) return parseInt(numOnly[1]) * 60;
  if (/새벽/.test(s)) return 3 * 60;
  if (/아침/.test(s)) return 7 * 60;
  if (/오전/.test(s)) return 9 * 60;
  if (/점심|낮/.test(s)) return 12 * 60;
  if (/오후/.test(s)) return 14 * 60;
  if (/저녁/.test(s)) return 18 * 60;
  if (/밤/.test(s)) return 21 * 60;
  return 9999;
}

export function diffDaysFromToday(dateKey, now = new Date()) {
  const today = new Date(todayStr(now) + 'T00:00:00');
  const target = new Date(dateKey + 'T00:00:00');
  return Math.round((target - today) / 86400000);
}
