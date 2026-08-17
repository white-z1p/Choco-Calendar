export function ModalBackdrop({ open, onClose, className = 'time-input-modal-backdrop', children }) {
  if (!open) return null;
  return (
    <div
      className={className}
      style={{ display: 'flex' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}
