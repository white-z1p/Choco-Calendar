import { ModalBackdrop } from './Modal';

const STATUS_TEXT = {
  denied: {
    label: '🔕 알림이 차단되어 있어요',
    on: false,
    note: '브라우저 설정에서 알림 권한을 허용한 뒤 다시 눌러주세요.',
  },
  on: {
    label: '🔔 푸시 알림 받는 중',
    on: true,
    note: '이 기기는 병원·미용·심장사상충 일정과 식사 기록 알림을 받고 있어요. 다시 누르면 꺼져요.',
  },
  off: {
    label: '🔕 푸시 알림 받기',
    on: false,
    note: '가족 모두 이 버튼을 눌러두면, 앱을 열지 않아도 병원·미용·심장사상충 일정과 식사 기록 알림을 받을 수 있어요.',
  },
};

export default function SettingsModal({ open, onClose, push }) {
  const info = STATUS_TEXT[push.status];
  return (
    <ModalBackdrop open={open} onClose={onClose} className="modal-backdrop">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">🔔 알림 설정</div>
        <button className={`push-toggle-btn${info.on ? ' on' : ''}`} onClick={push.togglePush} disabled={push.busy}>
          {push.busy ? '요청 중...' : info.label}
        </button>
        <div className="push-status-note">{info.note}</div>
      </div>
    </ModalBackdrop>
  );
}
