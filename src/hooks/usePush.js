import { useCallback, useEffect, useState } from "react";
import { ref, set, remove } from "firebase/database";
import { getToken } from "firebase/messaging";
import { database, getMessagingInstance, VAPID_KEY } from "../firebase/config";

const PUSH_TOKEN_STORAGE_KEY = "choco_fcm_token";

export function usePush() {
  const [savedToken, setSavedToken] = useState(() =>
    localStorage.getItem(PUSH_TOKEN_STORAGE_KEY),
  );
  const [busy, setBusy] = useState(false);
  const [fcmReady, setFcmReady] = useState(false);

  useEffect(() => {
    getMessagingInstance().then((m) => setFcmReady(!!m));
  }, []);

  // Pre-register the service worker on load to reduce latency later.
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}firebase-messaging-sw.js`)
        .catch(() => {});
    }
  }, []);

  const permission =
    typeof Notification !== "undefined" ? Notification.permission : "default";

  const status = permission === "denied" ? "denied" : savedToken ? "on" : "off";

  const togglePush = useCallback(async () => {
    if (savedToken) {
      try {
        await remove(ref(database, `fcmTokens/${savedToken}`));
      } catch {
        /* ignore */
      }
      localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
      setSavedToken(null);
      return;
    }

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("이 브라우저에서는 푸시 알림을 지원하지 않아요.");
      return;
    }
    const messaging = await getMessagingInstance();
    if (!messaging) {
      alert("알림 기능을 준비 중이에요. 잠시 후 다시 시도해주세요.");
      return;
    }
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setBusy(false);
        return;
      }

      const reg = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: reg,
      });
      if (!token) {
        alert("알림 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
        setBusy(false);
        return;
      }
      await set(ref(database, `fcmTokens/${token}`), true);
      localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
      setSavedToken(token);
    } catch (err) {
      alert("알림 등록 중 문제가 발생했어요: " + err.message);
    } finally {
      setBusy(false);
    }
  }, [savedToken]);

  return { status, busy, togglePush, fcmReady };
}
