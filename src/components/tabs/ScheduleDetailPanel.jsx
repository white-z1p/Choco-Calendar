import { useState } from 'react';
import { DAYS, MONTHS, parseTimeToMinutes } from '../../utils/time';
import { CloseIcon, PlusIcon } from '../Icons';
import ScheduleEntryForm from './ScheduleEntryForm';
import { schedTypeInfo, addSchedule, updateSchedule, deleteSchedule, toggleScheduleDone } from '../../firebase/scheduleApi';

function getSchedEvs(schedules, key) {
  const dayData = schedules[key];
  if (!dayData) return [];
  const list = [];
  for (const id in dayData) list.push({ _id: id, ...dayData[id] });
  return list.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
}

export default function ScheduleDetailPanel({ y, m, d, schedules, fixedType, onClose }) {
  const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const evs = getSchedEvs(schedules, key);
  const dow = new Date(y, m, d).getDay();
  const dlbl = `📅 ${MONTHS[m]} ${d}일 (${DAYS[dow]})`;
  const editingEv = editId ? evs.find((e) => e._id === editId) : null;

  const handleAdd = (data) => {
    addSchedule(key, data).then(() => setAddOpen(false)).catch((err) => alert('저장 실패: ' + err.message));
  };
  const handleEdit = (data) => {
    updateSchedule(key, editId, { ...data, done: editingEv?.done }).then(() => setEditId(null)).catch((err) => alert('수정 실패: ' + err.message));
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-date">{dlbl}</div>
        <button className="close-btn" aria-label="닫기" onClick={onClose}><CloseIcon /></button>
      </div>

      <div>
        {evs.length === 0 ? (
          <div className="empty-day">아직 등록된 일정이 없어요.</div>
        ) : (
          evs.map((ev) => {
            const info = schedTypeInfo(ev.type);
            return (
              <div className={`sched-ev${ev.done ? ' done' : ''}`} key={ev._id}>
                <div className="sched-icon">{info.emoji}</div>
                <div className="sched-content">
                  <div className={`sched-title${ev.done ? ' done-text' : ''}`}>{ev.title || info.label}</div>
                  {ev.time && <div className="sched-time">{ev.time}</div>}
                  {ev.memo && <div className="sched-memo">{ev.memo}</div>}
                </div>
                <div className="sched-btns">
                  <button
                    className={`sched-done-btn${ev.done ? ' is-done' : ''}`}
                    onClick={() => toggleScheduleDone(key, ev._id, !!ev.done)}
                  >
                    {ev.done ? '✓ 완료' : '완료 처리'}
                  </button>
                  <div className="sched-mini-btns">
                    <button className="tl-edit" onClick={() => { setEditId(ev._id); setAddOpen(false); }}>수정</button>
                    <button className="tl-del" onClick={() => deleteSchedule(key, ev._id).catch((err) => alert('삭제 실패: ' + err.message))}>삭제</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="add-area">
        {addOpen ? (
          <ScheduleEntryForm fixedType={fixedType} submitLabel="추가" onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
        ) : editId ? (
          <ScheduleEntryForm fixedType={fixedType} initial={editingEv} submitLabel="저장" onSubmit={handleEdit} onCancel={() => setEditId(null)} />
        ) : (
          <button className="add-open-btn" onClick={() => { setAddOpen(true); setEditId(null); }}><PlusIcon /> 일정 추가하기</button>
        )}
      </div>
    </div>
  );
}
