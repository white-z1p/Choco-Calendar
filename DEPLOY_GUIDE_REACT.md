# 초코 다이어리 (React 버전) — 배포 가이드

기존 `DEPLOY_GUIDE.md`의 Firebase 콘솔 설정(2·3·4·5번)은 그대로 동일합니다.
아래는 **React 프로젝트로 바뀌면서 달라진 1·2번 항목**만 정리한 내용이에요.

## 1. 프로젝트 빌드하기

```bash
cd choco-diary-react
npm install
npm run build
```

`dist/` 폴더가 생성됩니다. 이 폴더 안의 내용 전체가 기존에 올리던 `index.html` 자리를 대체해요.
(Firebase Hosting을 쓰신다면 `firebase deploy --only hosting` 전에 `public` 디렉토리를 `dist`로 지정해두시면 됩니다.)

## 2. 아이콘 파일 넣기

기존에 쓰시던 `icon-192.png`, `icon-180.png`를 `choco-diary-react/public/` 폴더에 넣고 다시 빌드해주세요.
(`manifest.json`은 이미 이 파일들을 참조하도록 만들어 두었어요.)

## 3. VAPID 키 교체 (1곳으로 줄었어요)

기존에는 `choco_app.html`과 `firebase-messaging-sw.js` 두 곳에서 교체했지만,
React 버전에서는 **`src/firebase/config.js`** 한 곳의 `REPLACE_WITH_YOUR_VAPID_KEY`만 교체하면 됩니다.
(`public/firebase-messaging-sw.js`는 그대로 두시면 돼요 — 백그라운드 알림 표시용이라 VAPID 키가 필요 없습니다.)

## 4~5. Blaze 요금제 / Cloud Functions / 가족 알림 받기

기존 `DEPLOY_GUIDE.md`의 3, 4, 5번 항목과 100% 동일합니다. 그대로 따라 하시면 돼요.
