import { useRef, useState } from 'react';
import { normalizeTimeFormat } from '../../utils/time';

export default function DiaryEntryForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [time, setTime] = useState(initial?.time || '');
  const [name, setName] = useState(initial?.name || '');
  const [memo, setMemo] = useState(initial?.memo || '');
  const nameRef = useRef(null);
  const memoRef = useRef(null);

  const handleSubmit = () => {
    const t = normalizeTimeFormat(time.trim());
    const n = name.trim();
    const m = memo.trim();
    if (!t) { alert('시간을 입력해주세요!'); return; }
    if (!n) { alert('내용을 입력해주세요!'); return; }
    onSubmit({ time: t, name: n, memo: m });
  };

  return (
    <div className="add-form">
      <label>시간</label>
      <input
        type="text"
        inputMode="text"
        placeholder="예) 08:30 / 오전 9시 / 저녁"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') nameRef.current?.focus(); }}
        autoFocus
      />
      <label>내용</label>
      <input
        ref={nameRef}
        type="text"
        placeholder="예) 아침밥, 산책, 간식"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') memoRef.current?.focus(); }}
      />
      <label>메모 <span style={{ fontSize: '0.72rem', color: 'var(--text-hint)' }}>(선택)</span></label>
      <input
        ref={memoRef}
        type="text"
        placeholder="추가로 적고 싶은 내용"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
      />
      <div className="add-row-btns">
        <button className="btn-save" onClick={handleSubmit}>{submitLabel}</button>
        <button className="btn-cancel" onClick={onCancel}>취소</button>
      </div>
    </div>
  );
}
