import { useEffect, useState } from 'react';

const TYPE_INFO = {
  meal_morning: {
    emoji: '🍚',
    label: '아침',
  },
  meal_evening: {
    emoji: '🍚',
    label: '저녁',
  },
  meal_snack: {
    emoji: '🦴',
    label: '간식',
  },
  gum: {
    emoji: '🦷',
    label: '껌',
  },
};

export default function TimeInputModal({
  open,
  type,
  onClose,
  onSave,
}) {
  const [time, setTime] = useState('');
  const [content, setContent] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (open) {
      setTime('');
      setContent('');
      setMemo('');
    }
  }, [open, type]);

  if (!open) return null;

  const info =
    TYPE_INFO[type] || {
      emoji: '🐾',
      label: '기록',
    };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!time) {
      alert('시간을 입력해주세요.');
      return;
    }

    onSave({
      start: time,
      content: content.trim(),
      memo: memo.trim(),
    });
  };

  return (
    <div className="meal-record-overlay">
      <div className="meal-record-modal">

        {/* 모달 헤더 */}
        <div className="meal-record-header">
          <h3>
            <span>{info.emoji}</span>
            {info.label} 기록
          </h3>


        </div>

        <form onSubmit={handleSubmit}>

          {/* 시간 */}
          <div className="meal-record-row">
            <label>시간</label>

            <input
              className="meal-record-input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              autoFocus
            />
          </div>

          {/* 내용 */}
          <div className="meal-record-row">
            <label>내용</label>

            <input
              className="meal-record-input"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'gum'
                  ? '예: 덴탈껌 1개'
                  : type === 'meal_snack'
                  ? '예: 고구마 3조각'
                  : '예: 사료 50g'
              }
            />
          </div>

          {/* 메모 */}
          <div className="meal-record-row">
            <label>메모</label>

            <textarea
              className="meal-record-textarea"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="먹은 양이나 특이사항을 적어주세요."
              rows={3}
            />
          </div>

          {/* 버튼 */}
          <div className="meal-record-buttons">
            <button
              type="button"
              className="meal-record-cancel"
              onClick={onClose}
            >
              취소
            </button>

            <button
              type="submit"
              className="meal-record-save"
            >
              저장
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}