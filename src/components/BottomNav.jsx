const TABS = [
  { id: 'schedule', icon: '🗓️', label: '일정' },
  { id: 'walk', icon: '🦮', label: '산책' },
  { id: 'diary', icon: '📅', label: '캘린더' },
  { id: 'profile', icon: '🐶', label: '내정보' },
];

export default function BottomNav({ activeTab, onSwitchTab }) {
  return (
    <div className="bottom-nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`nav-btn${activeTab === t.id ? ' active' : ''}`}
          onClick={() => onSwitchTab(t.id)}
        >
          <span className="nav-icon">{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
