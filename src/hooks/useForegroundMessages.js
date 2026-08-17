import { useEffect, useState } from 'react';
import { onMessage } from 'firebase/messaging';
import { getMessagingInstance } from '../firebase/config';

export function useForegroundMessages() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    let unsub = () => {};
    getMessagingInstance().then((messaging) => {
      if (!messaging) return;
      unsub = onMessage(messaging, (payload) => {
        const n = payload.notification || {};
        const id = 'fgp-' + Date.now();
        setBanners((b) => [...b, { id, icon: '🔔', title: n.title || '🐾 알림', body: n.body || '' }]);
      });
    });
    return () => unsub();
  }, []);

  const dismiss = (id) => setBanners((b) => b.filter((x) => x.id !== id));

  return { banners, dismiss };
}
