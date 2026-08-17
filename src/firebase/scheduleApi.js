import { ref, push, set, remove, onValue } from 'firebase/database';
import { database } from './config';

export const SCHED_TYPES = [
  { id: 'vet', emoji: '🏥', label: '병원' },
  { id: 'groom', emoji: '✂️', label: '미용' },
  { id: 'heartworm', emoji: '💊', label: '심장사상충' },
];

/* 기본 일정 종류 + 사용자 추가 일정 종류 */
export function schedTypeInfo(t, customTypes = []) {
  return (
    [...SCHED_TYPES, ...customTypes].find((x) => x.id === t) ||
    SCHED_TYPES[0]
  );
}

/* 사용자 추가 일정 종류 불러오기 */
export function subscribeCustomScheduleTypes(callback) {
  const typesRef = ref(database, 'scheduleTypes');

  return onValue(typesRef, (snapshot) => {
    const data = snapshot.val() || {};

    const types = Object.entries(data).map(([id, value]) => ({
      id,
      emoji: value.emoji,
      label: value.label,
    }));

    callback(types);
  });
}

/* 사용자 일정 종류 추가 */
export function addCustomScheduleType(label, emoji) {
  const typesRef = ref(database, 'scheduleTypes');
  const newRef = push(typesRef);

  return set(newRef, {
    label,
    emoji,
  });
}

/* 사용자 일정 종류 삭제 */
export function deleteCustomScheduleType(id) {
  return remove(ref(database, `scheduleTypes/${id}`));
}

// Returns a schedules-shaped object ({ dateKey: { id: entry } })
export function filterSchedulesByType(schedules, type) {
  if (!type) return schedules || {};

  const out = {};

  for (const dateKey in schedules) {
    const day = schedules[dateKey];
    const filtered = {};

    for (const id in day) {
      if (day[id]?.type === type) {
        filtered[id] = day[id];
      }
    }

    if (Object.keys(filtered).length) {
      out[dateKey] = filtered;
    }
  }

  return out;
}

export function addSchedule(
  dateKey,
  { type, title, time, memo }
) {
  const dayRef = ref(database, `schedules/${dateKey}`);
  const newRef = push(dayRef);

  return set(newRef, {
    type,
    title,
    time,
    memo,
    done: false,
  });
}

export function updateSchedule(
  dateKey,
  id,
  { type, title, time, memo, done }
) {
  return set(
    ref(database, `schedules/${dateKey}/${id}`),
    {
      type,
      title,
      time,
      memo,
      done: !!done,
    }
  );
}

export function deleteSchedule(dateKey, id) {
  return remove(
    ref(database, `schedules/${dateKey}/${id}`)
  );
}

export function toggleScheduleDone(
  dateKey,
  id,
  current
) {
  return set(
    ref(database, `schedules/${dateKey}/${id}/done`),
    !current
  );
}