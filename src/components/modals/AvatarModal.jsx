import { useRef } from 'react';
import { ModalBackdrop } from '../Modal';

const AVATAR_EMOJIS = ['🐶', '🐕', '🐩', '🦮', '🐕‍🦺', '🐾', '🐺', '🦴', '🐈', '🐇'];

export default function AvatarModal({ open, currentEmoji, uploading, onClose, onPickEmoji, onFileSelected }) {
  const fileInputRef = useRef(null);

  if (!open) return null;

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="time-input-modal" onClick={(e) => e.stopPropagation()}>
        <div className="time-input-modal-title">📷 사진 / 이모지 선택</div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files && e.target.files[0];
            if (file) onFileSelected(file);
          }}
        />
        <button className="add-open-btn" style={{ marginBottom: 14 }} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? '업로드 중...' : '📷 사진 업로드하기'}
        </button>
        <div className="time-input-hint" style={{ marginTop: -8 }}>또는 이모지를 골라주세요</div>
        <div className="profile-avatar-emoji-picker">
          {AVATAR_EMOJIS.map((e) => (
            <div
              key={e}
              className={`avatar-emoji-opt${e === currentEmoji ? ' sel' : ''}`}
              onClick={() => onPickEmoji(e)}
            >
              {e}
            </div>
          ))}
        </div>
        <div className="time-input-btns" style={{ marginTop: 16 }}>
          <button className="time-input-cancel" style={{ flex: 1 }} onClick={onClose}>닫기</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}
