import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { isSupported, getMessaging } from "firebase/messaging";

// ⚠️ 배포 전 REPLACE_WITH_YOUR_VAPID_KEY 를 Firebase 콘솔 > 프로젝트 설정 > 클라우드 메시징 >
//    웹 푸시 인증서에서 발급받은 키로 꼭 교체해주세요.
export const VAPID_KEY = "BDY4W3IY6wQgdG1WZaCUTFq688YoT3TJyqlRbt83MDSRvwxy545c3mKfSgj7TFma4zrfEharlHMsLcD_PzlHIr8";

const firebaseConfig = {
  apiKey: "AIzaSyDDNWr3yfuYx0VxXBHQC2wAEMNyy6V6-hc",
  authDomain: "choco-diary-e11cc.firebaseapp.com",
  databaseURL: "https://choco-diary-e11cc-default-rtdb.firebaseio.com",
  projectId: "choco-diary-e11cc",
  storageBucket: "choco-diary-e11cc.firebasestorage.app",
  messagingSenderId: "246292508096",
  appId: "1:246292508096:web:b0aab0d45d96f771062c25",
};

export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app);

// 메시징은 지원되는 브라우저에서만 지연 초기화
let messagingPromise = null;
export function getMessagingInstance() {
  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => (supported ? getMessaging(app) : null));
  }
  return messagingPromise;
}
