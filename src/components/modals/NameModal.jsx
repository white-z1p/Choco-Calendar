import { useEffect, useRef, useState } from 'react';
import { ModalBackdrop } from '../Modal';

export default function NameModal({ open, currentName, onClose, onSave }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(currentName || '초코');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, currentName]);

  if (!open) return null;

  const handleSave = () => {
    if (!value.trim()) { alert('이름을 입력해주세요!'); return; }
    onSave(value.trim());
  };

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="time-input-modal" onClick={(e) => e.stopPropagation()}>
        <div className="time-input-modal-title">🐶 이름 수정</div>
        <div className="time-input-row">
          <span className="time-input-label">이름</span>
          <input ref={inputRef} className="time-input-field" type="text" placeholder="예) 초코" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div className="time-input-btns">
          <button className="time-input-save" onClick={handleSave}>저장</button>
          <button className="time-input-cancel" onClick={onClose}>취소</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
