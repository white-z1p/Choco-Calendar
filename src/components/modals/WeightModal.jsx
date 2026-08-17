import { useEffect, useRef, useState } from 'react';
import { ModalBackdrop } from '../Modal';
import { todayStr } from '../../utils/time';

export default function WeightModal({ open, onClose, onSave }) {
  const [date, setDate] = useState('');
  const [value, setValue] = useState('');
  const valueRef = useRef(null);

  useEffect(() => {
    if (open) {
      setDate(todayStr());
      setValue('');
      setTimeout(() => valueRef.current?.focus(), 80);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!date) { alert('날짜를 선택해주세요!'); return; }
    if (!value || isNaN(parseFloat(value))) { alert('체중을 숫자로 입력해주세요!'); return; }
    onSave({ date, value: parseFloat(value) });
  };

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="time-input-modal" onClick={(e) => e.stopPropagation()}>
        <div className="time-input-modal-title">⚖️ 체중 기록</div>
        <div className="time-input-row">
          <span className="time-input-label">날짜</span>
          <input className="time-input-field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="time-input-row">
          <span className="time-input-label">체중</span>
          <input ref={valueRef} className="time-input-field" type="number" step="0.1" inputMode="decimal" placeholder="예) 4.5" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div className="time-input-hint">단위는 kg이에요</div>
        <div className="time-input-btns">
          <button className="time-input-save" onClick={handleSave}>저장</button>
          <button className="time-input-cancel" onClick={onClose}>취소</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
