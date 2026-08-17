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

/*
 * "오후 2:40" → "14:40"
 * "오전 8:30" → "08:30"
 * 이미 "14:40"이면 그대로 사용
 */
function normalizeTime(value) {
  if (!value) return '';

  const str = String(value).trim();

  // 이미 HH:mm 형식이면 그대로 사용
  if (/^\d{2}:\d{2}$/.test(str)) {
    return str;
  }

  // 오전/오후 형식
  const match = str.match(
    /^(오전|오후)\s*(\d{1,2}):(\d{2})$/
  );

  if (match) {
    const [, period, hourStr, minute] = match;

    let hour = Number(hourStr);

    if (period === '오전') {
      if (hour === 12) {
        hour = 0;
      }
    } else {
      if (hour !== 12) {
        hour += 12;
      }
    }

    return `${String(hour).padStart(2, '0')}:${minute}`;
  }

  return '';
}

export default function TrackerEditModal({
  open,
  entry,
  onClose,
  onSave,
}) {
  const [time, setTime] = useState('');
  const [content, setContent] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (open && entry) {
      // 기존 시간값을 HH:mm 형식으로 변환
      setTime(normalizeTime(entry.val1));

      setContent(entry.val2 || '');
      setMemo(entry.val3 || '');
    }
  }, [open, entry]);

  if (!open || !entry) {
    return null;
  }

  const info =
    TYPE_INFO[entry.type] || {
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
      // 항상 HH:mm 형식으로 저장
      val1: time,
      val2: content.trim(),
      val3: memo.trim(),
    });
  };

  return (
    <div className="tracker-edit-overlay">
      <div className="tracker-edit-modal">

        {/* 제목 */}
        <div className="tracker-edit-header">
          <h3>
            {info.emoji} {info.label} 수정
          </h3>

          <button
            type="button"
            className="tracker-edit-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* 시간 */}
          <div className="tracker-edit-row">
            <label htmlFor="tracker-edit-time">
              시간
            </label>

            <input
              id="tracker-edit-time"
              type="time"
              value={time}
              onChange={(e) =>
                setTime(e.target.value)
              }
            />
          </div>

          {/* 내용 */}
          <div className="tracker-edit-row">
            <label htmlFor="tracker-edit-content">
              내용
            </label>

            <input
              id="tracker-edit-content"
              type="text"
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="무엇을 먹었는지 적어주세요."
            />
          </div>

          {/* 메모 */}
          <div className="tracker-edit-row">
            <label htmlFor="tracker-edit-memo">
              메모
            </label>

            <textarea
              id="tracker-edit-memo"
              value={memo}
              onChange={(e) =>
                setMemo(e.target.value)
              }
              placeholder="먹은 양이나 특이사항을 적어주세요."
              rows={3}
            />
          </div>

          {/* 버튼 */}
          <div className="tracker-edit-buttons">

            <button
              type="button"
              className="tracker-edit-cancel"
              onClick={onClose}
            >
              취소
            </button>

            <button
              type="submit"
              className="tracker-edit-save"
            >
              저장
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}