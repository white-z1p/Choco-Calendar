import { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AlertBanners from './components/AlertBanners';
import SettingsModal from './components/SettingsModal';
import DiaryTab from './components/tabs/DiaryTab';
import ProfileTab from './components/tabs/ProfileTab';
import WalkTab from './components/tabs/WalkTab';
import ScheduleTab from './components/tabs/ScheduleTab';
import { useFirebaseValue } from './hooks/useFirebaseValue';
import { useScheduleAlerts } from './hooks/useScheduleAlerts';
import { useForegroundMessages } from './hooks/useForegroundMessages';
import { usePush } from './hooks/usePush';

export default function App() {
  const [activeTab, setActiveTab] = useState('diary');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const diaries = useFirebaseValue('diaries', {});
  const schedules = useFirebaseValue('schedules', {});
  const profile = useFirebaseValue('profile/main', {});

  const scheduleAlerts = useScheduleAlerts(schedules);
  const foregroundAlerts = useForegroundMessages();
  const push = usePush();

  const allBanners = [...scheduleAlerts.banners, ...foregroundAlerts.banners];
  const dismissBanner = (id) => {
    scheduleAlerts.dismiss(id);
    foregroundAlerts.dismiss(id);
  };

  return (
    <div id="app">
      <Header profile={profile} onOpenSettings={() => setSettingsOpen(true)} />
      <AlertBanners banners={allBanners} onDismiss={dismissBanner} />

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} push={push} />

      {activeTab === 'schedule' && <ScheduleTab schedules={schedules} />}
      {activeTab === 'walk' && <WalkTab diaries={diaries} profile={profile} />}
      {activeTab === 'diary' && <DiaryTab diaries={diaries} />}
      {activeTab === 'profile' && <ProfileTab profile={profile} schedules={schedules} />}

      <BottomNav activeTab={activeTab} onSwitchTab={setActiveTab} />
    </div>
  );
}
