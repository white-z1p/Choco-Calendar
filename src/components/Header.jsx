import { SettingsIcon } from './Icons';

export default function Header({ profile, onOpenSettings }) {
  const name = profile.name || '초코';
  return (
    <div className="header">
      <div className="dog-circle">
        {profile.photoURL ? <img src={profile.photoURL} alt="프로필 사진" /> : (profile.avatarEmoji || '🐶')}
      </div>
      <div>
        <h1>{name} 다이어리</h1>
        <p>{name}의 하루를 기록해요 🐾</p>
      </div>
      <button className="settings-btn" onClick={onOpenSettings} aria-label="알림 설정">
        <SettingsIcon />
      </button>
    </div>
  );
}
