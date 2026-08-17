import { useEffect, useRef, useState } from 'react';
import { loadNaverMaps } from '../naverMapConfig';
import { haversineMeters, formatDistance, formatDuration } from '../utils/geo';
import { CloseIcon } from './Icons';

// Fallback start point (Seoul) used only if geolocation is slow/denied, so the map still renders.
const FALLBACK_CENTER = { lat: 37.5665, lng: 126.978 };

export default function WalkTracker({ open, avatar, onClose, onSave }) {
  const [status, setStatus] = useState('loading'); // loading | tracking | paused | error
  const [errorMsg, setErrorMsg] = useState('');
  const [distanceM, setDistanceM] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [saving, setSaving] = useState(false);

  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const markerRef = useRef(null);
  const pathRef = useRef([]); // [{lat,lng,t}]
  const distanceRef = useRef(0);
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const startedAtRef = useRef(null);
  const pausedMsRef = useRef(0);
  const pauseStartRef = useRef(null);

  const reset = () => {
    setStatus('loading');
    setErrorMsg('');
    setDistanceM(0);
    setElapsedSec(0);
    setSaving(false);
    pathRef.current = [];
    distanceRef.current = 0;
    pausedMsRef.current = 0;
    pauseStartRef.current = null;
    startedAtRef.current = null;
    mapRef.current = null;
    polylineRef.current = null;
    markerRef.current = null;
  };

  const stopWatch = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const addPoint = (lat, lng) => {
    const naver = window.naver;
    const point = { lat, lng, t: Date.now() };
    const prev = pathRef.current[pathRef.current.length - 1];
    if (prev) distanceRef.current += haversineMeters(prev, point);
    pathRef.current.push(point);
    setDistanceM(distanceRef.current);

    if (mapRef.current && naver) {
      const latlng = new naver.maps.LatLng(lat, lng);
      const path = pathRef.current.map((p) => new naver.maps.LatLng(p.lat, p.lng));
      if (!polylineRef.current) {
        polylineRef.current = new naver.maps.Polyline({
          map: mapRef.current,
          path,
          strokeColor: '#C97B3C',
          strokeWeight: 5,
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
        });
      } else {
        polylineRef.current.setPath(path);
      }
      if (markerRef.current) markerRef.current.setPosition(latlng);
      mapRef.current.panTo(latlng);
    }
  };

  const startWatch = () => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => addPoint(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
    );
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      if (!startedAtRef.current) return;
      const elapsed = Date.now() - startedAtRef.current - pausedMsRef.current;
      setElapsedSec(elapsed / 1000);
    }, 1000);
  };

  useEffect(() => {
    if (!open) return;
    reset();
    let cancelled = false;

    (async () => {
      try {
        const naver = await loadNaverMaps();
        if (cancelled) return;

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            initMap(naver, center);
          },
          () => {
            if (cancelled) return;
            initMap(naver, FALLBACK_CENTER);
          },
          { enableHighAccuracy: true, timeout: 10000 }
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
        zoom: 17,
        scaleControl: false,
        mapDataControl: false,
        logoControl: false,
      });
      markerRef.current = new naver.maps.Marker({
        map: mapRef.current,
        position: new naver.maps.LatLng(center.lat, center.lng),
        icon: {
          content: `<div class="walk-marker">${avatarHtml(avatar)}</div>`,
          anchor: new naver.maps.Point(20, 20),
        },
      });

      startedAtRef.current = Date.now();
      startTimer();
      startWatch();
      setStatus('tracking');
    }

    return () => {
      cancelled = true;
      stopWatch();
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const togglePause = () => {
    if (status === 'tracking') {
      stopWatch();
      pauseStartRef.current = Date.now();
      setStatus('paused');
    } else if (status === 'paused') {
      if (pauseStartRef.current) pausedMsRef.current += Date.now() - pauseStartRef.current;
      startWatch();
      setStatus('tracking');
    }
  };

  const handleFinish = () => {
    if (pathRef.current.length < 2) {
      if (!window.confirm('아직 이동 거리가 거의 없어요. 그래도 저장할까요?')) return;
    }
    stopWatch();
    stopTimer();
    setSaving(true);
    const startedAt = startedAtRef.current;
    const endedAt = Date.now();
    onSave({
      distanceM: Math.round(distanceRef.current),
      durationSec: Math.round((endedAt - startedAt - pausedMsRef.current) / 1000),
      path: pathRef.current,
      startedAt,
      endedAt,
    });
  };

  const handleCancel = () => {
    if (pathRef.current.length > 1 && !window.confirm('산책 기록을 저장하지 않고 종료할까요?')) return;
    stopWatch();
    stopTimer();
    onClose();
  };

  return (
    <div className="walk-tracker-overlay">
      <button className="walk-tracker-close" aria-label="닫기" onClick={handleCancel}><CloseIcon /></button>

      <div className="walk-tracker-map" ref={mapDivRef}>
        {status === 'loading' && <div className="walk-tracker-loading">📍 위치를 찾는 중...</div>}
        {status === 'error' && (
          <div className="walk-tracker-loading">
            ⚠️ {errorMsg}
            <div style={{ marginTop: 8, fontSize: '0.78rem', opacity: 0.8 }}>
              네이버 지도 Client ID 설정이 필요할 수 있어요.
            </div>
          </div>
        )}
      </div>

      <div className="walk-tracker-card">
        <div className="walk-tracker-status">
          {status === 'paused' ? '⏸ 일시정지됨' : '🐾 산책중이에요'}
        </div>
        <div className="walk-tracker-stats">
          <div className="walk-tracker-stat">
            <div className="walk-tracker-stat-val">{formatDistance(distanceM)}</div>
            <div className="walk-tracker-stat-label">거리</div>
          </div>
          <div className="walk-tracker-stat">
            <div className="walk-tracker-stat-val">{formatDuration(elapsedSec)}</div>
            <div className="walk-tracker-stat-label">시간</div>
          </div>
        </div>
        <div className="walk-tracker-btn-row">
          <button
            className="walk-tracker-pause-btn"
            onClick={togglePause}
            disabled={status !== 'tracking' && status !== 'paused'}
          >
            {status === 'paused' ? '▶' : '⏸'}
          </button>
          <button className="walk-tracker-finish-btn" onClick={handleFinish} disabled={saving || status === 'loading'}>
            {saving ? '저장 중...' : '종료하고 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

function avatarHtml(avatar) {
  if (avatar && avatar.photoURL) return `<img src="${avatar.photoURL}" alt="" />`;
  return `<span>${(avatar && avatar.emoji) || '🐶'}</span>`;
}
