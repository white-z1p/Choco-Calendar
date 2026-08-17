import { useEffect, useRef, useState } from 'react';
import { loadNaverMaps } from '../naverMapConfig';

// Fallback center (Seoul) used only if geolocation is slow/denied, so the map still renders.
const FALLBACK_CENTER = { lat: 37.5665, lng: 126.978 };

function avatarHtml(avatar) {
  if (avatar && avatar.photoURL) return `<img src="${avatar.photoURL}" alt="" />`;
  return `<span>${(avatar && avatar.emoji) || '🐶'}</span>`;
}

export default function WalkMapPreview({ avatar, onStart }) {
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const naver = await loadNaverMaps();
        if (cancelled) return;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            initMap(naver, { lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {
            if (cancelled) return;
            initMap(naver, FALLBACK_CENTER);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err.message || '지도를 불러오지 못했어요.');
        setStatus('error');
      }
    })();

    function initMap(naver, center) {
      if (!mapDivRef.current) return;
      mapRef.current = new naver.maps.Map(mapDivRef.current, {
        center: new naver.maps.LatLng(center.lat, center.lng),
        zoom: 16,
        scaleControl: false,
        mapDataControl: false,
        logoControl: false,
        draggable: false,
        pinchZoom: false,
        scrollWheel: false,
        keyboardShortcuts: false,
        disableDoubleClickZoom: true,
      });
      new naver.maps.Marker({
        map: mapRef.current,
        position: new naver.maps.LatLng(center.lat, center.lng),
        icon: {
          content: `<div class="walk-marker">${avatarHtml(avatar)}</div>`,
          anchor: new naver.maps.Point(20, 20),
        },
      });
      setStatus('ready');
    }

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="walk-map-preview">
      <div className="walk-map-preview-mapdiv" ref={mapDivRef} />
      {status === 'loading' && <div className="walk-map-preview-loading">📍 지도를 불러오는 중...</div>}
      {status === 'error' && (
        <div className="walk-map-preview-loading">
          ⚠️ {errorMsg}
          <div style={{ marginTop: 8, fontSize: '0.78rem', opacity: 0.8 }}>
            네이버 지도 Client ID 설정이 필요할 수 있어요.
          </div>
        </div>
      )}
      <button className="walk-map-preview-start-btn" onClick={onStart}>▶ 산책 시작하기</button>
    </div>
  );
}
