import { ref, push, set, remove } from 'firebase/database';
import { database } from './config';

export function addDiaryEntry(dateKey, { time, name, memo }) {
  const dayRef = ref(database, `diaries/${dateKey}`);
  const newRef = push(dayRef);
  return set(newRef, { time, name, memo });
}

export function updateDiaryEntry(dateKey, id, { time, name, memo }) {
  return set(ref(database, `diaries/${dateKey}/${id}`), { time, name, memo });
}

export function deleteDiaryEntry(dateKey, id) {
  return remove(ref(database, `diaries/${dateKey}/${id}`));
}

const LOG_FIELD = { walk: 'walkLog', poop: 'poopLog', gum: 'gumLog' };

export function addTrackerEntry(dateKey, type, data) {
  const logRef = ref(database, `diaries/${dateKey}/__care__/${LOG_FIELD[type]}`);
  const newRef = push(logRef);
  return set(newRef, data);
}

export function updateTrackerEntry(dateKey, type, id, data) {
  return set(ref(database, `diaries/${dateKey}/__care__/${LOG_FIELD[type]}/${id}`), data);
}

export function deleteTrackerEntry(dateKey, type, id) {
  return remove(ref(database, `diaries/${dateKey}/__care__/${LOG_FIELD[type]}/${id}`));
}

// Real-time GPS walk session (distance/duration/path), replacing the old manual start~end time log.
export function addWalkSession(dateKey, { distanceM, durationSec, path, startedAt, endedAt }) {
  const logRef = ref(database, `diaries/${dateKey}/__care__/walkLog`);
  const newRef = push(logRef);
  return set(newRef, { distanceM, durationSec, path, startedAt, endedAt });
}

export function updateWalkSession(dateKey, id, { distanceM, durationSec, path, startedAt, endedAt }) {
  const entryRef = ref(database, `diaries/${dateKey}/__care__/walkLog/${id}`);
  return set(entryRef, { distanceM, durationSec, path, startedAt, endedAt });
}

export function toggleCare(dateKey, field, current) {
  return set(ref(database, `diaries/${dateKey}/__care__/${field}`), !current);
}

export function saveCareNotes(dateKey, value) {
  const r = ref(database, `diaries/${dateKey}/__care__/notes`);
  return value ? set(r, value) : remove(r);
}
