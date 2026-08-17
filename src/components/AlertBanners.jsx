export default function AlertBanners({ banners, onDismiss }) {
  if (!banners.length) return null;
  return (
    <div>
      {banners.map((b) => (
        <div className="alert-banner" key={b.id}>
          <div className="alert-icon">{b.icon}</div>
          <div className="alert-text">
            <div className="alert-title">{b.title}</div>
            <div className="alert-body">{b.body}</div>
          </div>
          <button className="alert-close" onClick={() => onDismiss(b.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
