import { useState } from 'react';
import { normalizeTimeFormat, todayStr } from '../../utils/time';

export default function WalkEntryForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [date, setDate] = useState(initial?.date || todayStr());
  const [time, setTime] = useState(initial?.time || '');
  const [km, setKm] = useState(initial?.km ?? '');
  const [minutes, setMinutes] = useState(initial?.minutes ?? '');
  const [memo, setMemo] = useState(initial?.memo || '');

  const handleSubmit = () => {
    if (!date) { alert('날짜를 선택해주세요!'); return; }
    const kmNum = parseFloat(km);
    const minNum = parseFloat(minutes);
    if (isNaN(kmNum) || kmNum < 0) { alert('거리를 숫자로 입력해주세요! (예: 1.2)'); return; }
    if (isNaN(minNum) || minNum < 0) { alert('소요 시간(분)을 숫자로 입력해주세요! (예: 30)'); return; }
    onSubmit({
      date,
      time: normalizeTimeFormat(time.trim()),
      distanceM: Math.round(kmNum * 1000),
      durationSec: Math.round(minNum * 60),
      memo: memo.trim(),
    });
  };

  return (
    <div className="add-form">
      <label>날짜</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <label>시간 <span style={{ fontSize: '0.72rem', color: 'var(--text-hint)' }}>(선택)</span></label>
      <input
        type="text"
        inputMode="text"
        placeholder="예) 08:30 / 오후 6시"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <label>거리 (km)</label>
      <input
        type="number"
        step="0.01"
        inputMode="decimal"
        placeholder="예) 1.5"
        value={km}
        onChange={(e) => setKm(e.target.value)}
      />
      <label>소요 시간 (분)</label>
      <input
        type="number"
        step="1"
        inputMode="numeric"
        placeholder="예) 30"
        value={minutes}
        onChange={(e) => setMinutes(e.target.value)}
      />
      <label>메모 <span style={{ fontSize: '0.72rem', color: 'var(--text-hint)' }}>(선택)</span></label>
      <input
        type="text"
        placeholder="코스, 컨디션 등"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      <div className="add-row-btns">
        <button className="btn-save" onClick={handleSubmit}>{submitLabel}</button>
        <button className="btn-cancel" onClick={onCancel}>취소</button>
      </div>
    </div>
  );
}
