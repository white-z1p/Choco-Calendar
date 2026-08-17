import { useState } from 'react';
import { normalizeTimeFormat, todayStr } from '../../utils/time';
import { SCHED_TYPES } from '../../firebase/scheduleApi';

export default function ScheduleEntryForm({ initial, submitLabel, fixedType, withDate, onSubmit, onCancel }) {
  const [type, setType] = useState(initial?.type || fixedType || 'vet');
  const [date, setDate] = useState(initial?.dateKey || todayStr());
  const [title, setTitle] = useState(initial?.title || '');
  const [time, setTime] = useState(initial?.time || '');
  const [memo, setMemo] = useState(initial?.memo || '');

  const handleSubmit = () => {
    const t = title.trim();
    if (!t) { alert('제목을 입력해주세요!'); return; }
    if (withDate && !date) { alert('날짜를 선택해주세요!'); return; }
    const payload = { type, title: t, time: normalizeTimeFormat(time.trim()), memo: memo.trim() };
    if (withDate) payload.dateKey = date;
    onSubmit(payload);
  };

  return (
    <div className="add-form">
      {withDate && (
        <>
          <label>날짜</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </>
      )}
      {!fixedType && (
        <>
          <label>종류</label>
          <div className="type-chip-row">
            {SCHED_TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`type-chip${type === t.id ? ' sel' : ''}`}
                onClick={() => setType(t.id)}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </>
      )}
      <label>제목</label>
      <input type="text" placeholder="예) 정기검진, 목욕+미용, 심장사상충 약" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <label>시간 <span style={{ fontSize: '0.72rem', color: 'var(--text-hint)' }}>(선택)</span></label>
      <input type="text" inputMode="text" placeholder="예) 14:00 / 오후 2시" value={time} onChange={(e) => setTime(e.target.value)} />
      <label>메모 <span style={{ fontSize: '0.72rem', color: 'var(--text-hint)' }}>(선택)</span></label>
      <input type="text" placeholder="병원 이름, 준비물 등" value={memo} onChange={(e) => setMemo(e.target.value)} />
      <div className="add-row-btns">
        <button className="btn-save" onClick={handleSubmit}>{submitLabel}</button>
        <button className="btn-cancel" onClick={onCancel}>취소</button>
      </div>
    </div>
  );
}
