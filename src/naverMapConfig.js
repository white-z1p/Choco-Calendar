// ⚠️ 배포 전 REPLACE_WITH_YOUR_NAVER_MAP_CLIENT_ID 를 네이버 클라우드 플랫폼(NCP) 콘솔에서
//    발급받은 Client ID로 꼭 교체해주세요.
//    발급: https://console.ncloud.com > AI·NAVER API > Application 등록 (Maps 선택)
//    등록 시 "Web 서비스 URL"에 실제 배포 도메인(예: https://your-app.web.app)을 추가해야 지도가 뜹니다.
export const NAVER_MAP_CLIENT_ID = "9ml204ff13";

let loadPromise = null;

/**
 * Loads the Naver Maps JS SDK (v3) once and resolves with `window.naver`.
 */
export function loadNaverMaps() {
  if (window.naver && window.naver.maps) return Promise.resolve(window.naver);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // Note: NCP's newer unified Maps console issues keys that must be passed as `ncpKeyId`
    // (the older `ncpClientId` param only works with legacy/AI·NAVER API console keys).
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}`;
    script.async = true;
    script.onload = () => {
      if (window.naver && window.naver.maps) resolve(window.naver);
      else reject(new Error('네이버 지도를 불러오지 못했어요.'));
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('네이버 지도 스크립트를 불러오지 못했어요. Client ID를 확인해주세요.'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
