// firebase-messaging-sw.js
// 이 파일은 반드시 웹사이트의 "루트"(예: https://your-domain.com/firebase-messaging-sw.js)에
// 있어야 브라우저가 인식할 수 있어요. index.html과 같은 폴더에 넣어주세요.

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDDNWr3yfuYx0VxXBHQC2wAEMNyy6V6-hc",
  authDomain: "choco-diary-e11cc.firebaseapp.com",
  databaseURL: "https://choco-diary-e11cc-default-rtdb.firebaseio.com",
  projectId: "choco-diary-e11cc",
  storageBucket: "choco-diary-e11cc.firebasestorage.app",
  messagingSenderId: "246292508096",
  appId: "1:246292508096:web:b0aab0d45d96f771062c25"
});

const messaging = firebase.messaging();

// 앱이 닫혀있거나 백그라운드에 있을 때 도착하는 알림을 처리해요.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || '🐾 초코 다이어리';
  const body = (payload.notification && payload.notification.body) || '';
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  });
});

// 알림을 탭하면 앱 창을 열어줘요.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
