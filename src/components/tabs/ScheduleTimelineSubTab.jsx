import { useState } from 'react';
import { parseTimeToMinutes } from '../../utils/time';
import { PlusIcon } from '../Icons';
import ScheduleEntryForm from './ScheduleEntryForm';
import {
  schedTypeInfo,
  filterSchedulesByType,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  toggleScheduleDone,
} from '../../firebase/scheduleApi';

function flattenSorted(schedules, type) {
  const filtered = filterSchedulesByType(schedules, type);
  const list = [];
  for (const dateKey in filtered) {
    for (const id in filtered[dateKey]) {
      list.push({ dateKey, _id: id, ...filtered[dateKey][id] });
    }
  }
  // Most recent date first; within a day, earliest time first.
  list.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey < b.dateKey ? 1 : -1;
    return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
  });
  return list;
}

export default function ScheduleTimelineSubTab({ type, schedules, emptyHint }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  const info = schedTypeInfo(type);
  const items = flattenSorted(schedules, type);

  const handleAdd = (data) => {
    const { dateKey, ...rest } = data;
    addSchedule(dateKey, rest)
      .then(() => setAddOpen(false))
      .catch((err) => alert('저장 실패: ' + err.message));
  };

  const handleEdit = (data) => {
    const { dateKey: newDateKey, ...rest } = data;
    const { dateKey: oldDateKey, _id } = editEntry;
    const payload = { ...rest, done: !!editEntry.done };
    const done = newDateKey === oldDateKey
      ? updateSchedule(oldDateKey, _id, payload)
      : Promise.all([deleteSchedule(oldDateKey, _id), addSchedule(newDateKey, payload)]);
    done.then(() => setEditEntry(null)).catch((err) => alert('수정 실패: ' + err.message));
  };

  return (
    <div className="section-block" style={{ marginTop: 4 }}>
      <div className="section-block-title">{info.emoji} {info.label} 기록</div>
      <div className="timeline-panel">
        {items.length ? (
          items.map((ev) => (
            <div className={`sched-ev${ev.done ? ' done' : ''}`} key={`${ev.dateKey}-${ev._id}`}>
              <div className="sched-icon">{info.emoji}</div>
              <div className="sched-content">
                <div className={`sched-title${ev.done ? ' done-text' : ''}`}>{ev.title || info.label}</div>
                <div className="sched-time">{ev.dateKey}{ev.time ? ` · ${ev.time}` : ''}</div>
                {ev.memo && <div className="sched-memo">{ev.memo}</div>}
              </div>
              <div className="sched-btns">
                <button
                  className={`sched-done-btn${ev.done ? ' is-done' : ''}`}
                  onClick={() => toggleScheduleDone(ev.dateKey, ev._id, !!ev.done)}
                >
                  {ev.done ? '✓ 완료' : '완료 처리'}
                </button>
                <div className="sched-mini-btns">
                  <button className="tl-edit" onClick={() => { setEditEntry(ev); setAddOpen(false); }}>수정</button>
                  <button
                    className="tl-del"
                    onClick={() => deleteSchedule(ev.dateKey, ev._id).catch((err) => alert('삭제 실패: ' + err.message))}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="timeline-empty">{emptyHint}</div>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        {addOpen ? (
          <ScheduleEntryForm
            fixedType={type}
            withDate
            submitLabel="추가"
            onSubmit={handleAdd}
            onCancel={() => setAddOpen(false)}
          />
        ) : editEntry ? (
          <ScheduleEntryForm
            fixedType={type}
            withDate
            initial={editEntry}
            submitLabel="저장"
            onSubmit={handleEdit}
            onCancel={() => setEditEntry(null)}
          />
        ) : (
          <button className="add-open-btn" onClick={() => { setAddOpen(true); setEditEntry(null); }}>
            <PlusIcon /> {info.label} 기록 추가하기
          </button>
        )}
      </div>
    </div>
  );
}
