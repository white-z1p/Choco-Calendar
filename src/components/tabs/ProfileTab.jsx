import { useState } from 'react';
import NameModal from '../modals/NameModal';
import WeightModal from '../modals/WeightModal';
import AvatarModal from '../modals/AvatarModal';
import ScheduleTimelineSubTab from './ScheduleTimelineSubTab';
import { setProfileName, setProfileWeight, setProfileAvatarEmoji, uploadProfilePhoto } from '../../firebase/profileApi';

const SUB_TABS = [
  { id: 'vet', emoji: '🏥', label: '병원' },
  { id: 'groom', emoji: '✂️', label: '미용' },
  { id: 'heartworm', emoji: '💊', label: '심장사상충' },
  { id: 'weight', emoji: '⚖️', label: '체중' },
];

function weightTimelineItems(profile) {
  const wl = profile.weightLog || {};
  return Object.entries(wl)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function latestWeight(profile) {
  const wl = profile.weightLog || {};
  const keys = Object.keys(wl).sort();
  if (!keys.length) return null;
  const k = keys[keys.length - 1];
  return { date: k, value: wl[k] };
}

function WeightSubTab({ profile, onAddWeight }) {
  const w = latestWeight(profile);
  const timeline = weightTimelineItems(profile);

  return (
    <div className="section-block" style={{ marginTop: 4 }}>
      <div className="profile-card" style={{ margin: '0 0 16px' }}>
        {w ? (
          <div className="profile-weight-row">
            <span className="profile-weight-val">{w.value}</span>
            <span className="profile-weight-unit">kg &nbsp;·&nbsp; {w.date} 기준</span>
          </div>
        ) : (
          <div className="profile-weight-empty">아직 체중 기록이 없어요</div>
        )}
        <button className="profile-add-weight-btn" onClick={onAddWeight}>⚖️ 체중 기록 추가</button>
      </div>

      <div className="section-block-title">🕰️ 체중 기록</div>
      <div className="timeline-panel">
        {timeline.length ? timeline.map((it) => (
          <div className="timeline-item" key={it.date}>
            <div className="timeline-dot-icon">⚖️</div>
            <div className="timeline-body">
              <div className="timeline-title">{it.value}kg</div>
              <div className="timeline-date">{it.date}</div>
            </div>
          </div>
        )) : (
          <div className="timeline-empty">아직 체중 기록이 없어요.<br />위 버튼으로 추가해보세요!</div>
        )}
      </div>
    </div>
  );
}

export default function ProfileTab({ profile, schedules }) {
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [subTab, setSubTab] = useState('vet');

  const name = profile.name || '초코';

  return (
    <div className="tab-view">
      <div className="profile-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {profile.photoURL ? <img src={profile.photoURL} alt="사진" /> : (profile.avatarEmoji || '🐶')}
          </div>
          <div className="profile-avatar-edit" onClick={() => setAvatarModalOpen(true)}>✎</div>
        </div>
        <div className="profile-name" onClick={() => setNameModalOpen(true)}>
          {name} <span className="edit-hint">✎ 수정</span>
        </div>
      </div>

      <div className="profile-sub-nav">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            className={`profile-sub-btn${subTab === t.id ? ' active' : ''}`}
            onClick={() => setSubTab(t.id)}
          >
            <span className="profile-sub-emoji">{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="section-block" style={{ margin: '4px 0 0' }}>
        {subTab === 'vet' && <ScheduleTimelineSubTab type="vet" schedules={schedules} emptyHint={<>아직 병원 기록이 없어요.<br />아래 버튼으로 추가해보세요!</>} />}
        {subTab === 'groom' && <ScheduleTimelineSubTab type="groom" schedules={schedules} emptyHint={<>아직 미용 기록이 없어요.<br />아래 버튼으로 추가해보세요!</>} />}
        {subTab === 'heartworm' && <ScheduleTimelineSubTab type="heartworm" schedules={schedules} emptyHint={<>아직 심장사상충 기록이 없어요.<br />아래 버튼으로 추가해보세요!</>} />}
        {subTab === 'weight' && <WeightSubTab profile={profile} onAddWeight={() => setWeightModalOpen(true)} />}
      </div>

      <NameModal
        open={nameModalOpen}
        currentName={profile.name}
        onClose={() => setNameModalOpen(false)}
        onSave={(val) => setProfileName(val).then(() => setNameModalOpen(false)).catch((err) => alert('저장 실패: ' + err.message))}
      />
      <WeightModal
        open={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        onSave={({ date, value }) => setProfileWeight(date, value).then(() => setWeightModalOpen(false)).catch((err) => alert('저장 실패: ' + err.message))}
      />
      <AvatarModal
        open={avatarModalOpen}
        currentEmoji={profile.avatarEmoji || '🐶'}
        uploading={uploading}
        onClose={() => setAvatarModalOpen(false)}
        onPickEmoji={(emoji) => setProfileAvatarEmoji(emoji).then(() => setAvatarModalOpen(false)).catch((err) => alert('저장 실패: ' + err.message))}
        onFileSelected={(file) => {
          setUploading(true);
          uploadProfilePhoto(file)
            .then(() => { setUploading(false); setAvatarModalOpen(false); })
            .catch((err) => { setUploading(false); alert('사진 업로드 실패: ' + err.message + '\n(Firebase 콘솔에서 Storage가 활성화되어 있는지 확인해주세요)'); });
        }}
      />
    </div>
  );
}
