# 초코 다이어리 (React 버전)

기존 단일 HTML 파일(`choco_app.html`)을 Vite + React 프로젝트로 완전히 리팩토링한 버전입니다.
기능과 화면은 기존과 동일하고, 코드만 컴포넌트 단위로 재구성했어요.

## 폴더 구조

```
src/
  firebase/
    config.js       # Firebase 초기화 (여기서 VAPID_KEY 교체)
    diaryApi.js      # 다이어리(밥/간식/케어) 관련 DB 함수
    scheduleApi.js   # 일정(병원/미용/심장사상충) 관련 DB 함수
    profileApi.js    # 프로필(이름/체중/아바타) 관련 DB·Storage 함수
  hooks/
    useFirebaseValue.js     # Realtime DB 경로 구독 훅
    usePush.js               # 푸시 알림 등록/해제 훅
    useScheduleAlerts.js     # 상단 알림 배너 계산
    useForegroundMessages.js # 앱이 열려있을 때 도착하는 푸시 처리
  utils/
    time.js      # 날짜/시간 파싱 유틸
    weather.js   # 날씨 조회 및 목업 유틸
  components/
    Header.jsx, BottomNav.jsx, AlertBanners.jsx, SettingsModal.jsx, MonthCalendar.jsx, Icons.jsx
    modals/      # 시간 입력, 트래커 수정, 체중, 이름, 아바타 모달
    tabs/        # 일정 탭 · 다이어리 탭 · 프로필 탭 (각 탭의 하위 컴포넌트 포함)
  App.jsx        # 전체 조립
  main.jsx       # 진입점
  index.css      # 기존 스타일 그대로 이전 (클래스명 동일)
```

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포 전 꼭 해야 할 일

1. **VAPID 키 교체**: `src/firebase/config.js` 안의 `REPLACE_WITH_YOUR_VAPID_KEY`를
   Firebase 콘솔 → 프로젝트 설정 → 클라우드 메시징 → 웹 푸시 인증서에서 발급받은 키로 교체
   (기존에는 2곳이었지만 React 버전에서는 이 파일 한 곳만 고치면 됩니다)
2. **아이콘 파일 추가**: 기존에 쓰던 `icon-192.png`, `icon-180.png`를 `public/` 폴더에 넣어주세요
   (이번 작업에는 포함되어 있지 않아요)
3. **빌드**:
   ```bash
   npm run build
   ```
   `dist/` 폴더가 생성됩니다. 이 폴더 전체를 기존에 배포하던 곳(Firebase Hosting 등)에 올리면 됩니다.
4. `public/firebase-messaging-sw.js`는 그대로 두면 빌드 시 `dist/` 루트로 자동 복사돼요.
   (서비스워커는 반드시 사이트 루트에 있어야 해서, `public/`에 두는 게 정답입니다)

## Cloud Functions (푸시 발송 서버)

`functions/index.js`, `functions/package.json`은 이번 리팩토링과 무관하며 기존 그대로 사용하시면 됩니다.
배포 방법은 기존 `DEPLOY_GUIDE.md`의 4번 항목을 참고해주세요.

## 기존 버전과의 차이

- 화면 구성, 스타일, 기능(달력, 날씨, 케어 트래커, 일정 알림, 푸시, 프로필)은 100% 동일합니다.
- 내부적으로 `window.xxx` 전역 함수/변수 대신 React state와 props로 관리하도록 바뀌었습니다.
- Firebase 접근 코드가 `src/firebase/*Api.js`로 분리되어 있어, DB 스키마가 바뀌면 해당 파일만 고치면 됩니다.
