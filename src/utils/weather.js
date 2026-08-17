const OWM_API_KEY = "0b67989641327075dd3d2ed04352bf9e";

export function mockWx(y, m, d) {
  const s = y * 10000 + (m + 1) * 100 + d;
  const r = (n) => ((s * 1103515245 + n * 12345) & 0x7fffffff) % 100;
  const mo = m + 1;
  let t, h, w;
  if (mo <= 2 || mo === 12) { t = -5 + r(1) % 15; h = 30 + r(2) % 40; w = 1 + r(3) % 6; }
  else if (mo <= 4) { t = 5 + r(1) % 20; h = 40 + r(2) % 35; w = 1 + r(3) % 5; }
  else if (mo <= 6) { t = 18 + r(1) % 15; h = 55 + r(2) % 40; w = 1 + r(3) % 4; }
  else if (mo <= 8) { t = 26 + r(1) % 10; h = 70 + r(2) % 25; w = 1 + r(3) % 3; }
  else if (mo <= 10) { t = 10 + r(1) % 18; h = 45 + r(2) % 35; w = 1 + r(3) % 5; }
  else { t = r(1) % 12; h = 35 + r(2) % 35; w = 1 + r(3) % 6; }
  const cs = [['맑음', '☀️', false], ['구름 조금', '⛅', false], ['흐림', '☁️', false], ['비', '🌧️', true], ['맑음', '☀️', false], ['맑음', '☀️', false]];
  const c = cs[r(4) % cs.length];
  return { temp: t, tempMin: t - 3 - r(6) % 4, tempMax: t + 3 + r(7) % 4, feels: t - 2 + r(5) % 5, humid: h, wind: (1 + r(3) % 6).toFixed(1), cond: c[0], icon: c[1], rain: c[2] };
}

export function mapWeatherIcon(iconCode) {
  if (!iconCode) return '☀️';
  if (iconCode.startsWith('01')) return '☀️';
  if (iconCode.startsWith('02')) return '⛅';
  if (iconCode.startsWith('03') || iconCode.startsWith('04')) return '☁️';
  if (iconCode.startsWith('09') || iconCode.startsWith('10')) return '🌧️';
  if (iconCode.startsWith('11')) return '⚡';
  if (iconCode.startsWith('13')) return '❄️';
  if (iconCode.startsWith('50')) return '🌫️';
  return '🌤️';
}

export function translateCond(desc, main) {
  if (main === 'Clear') return '맑음';
  if (main === 'Clouds') { if (desc.includes('broken') || desc.includes('overcast')) return '흐림'; return '구름 조금'; }
  if (main === 'Rain' || main === 'Drizzle') return '비';
  if (main === 'Thunderstorm') return '뇌우';
  if (main === 'Snow') return '눈';
  return desc;
}

export function suit(w) {
  if (w.rain || w.cond.includes('비')) return { lbl: '비 ☂️', cls: 'suit-rainy', desc: '우산 없이는 산책이 힘들어요. 짧게 다녀오거나 실내에서 놀아줘요!' };
  if (w.temp >= 30) return { lbl: '너무 더워요 🥵', cls: 'suit-hot', desc: '지면이 뜨거워 발바닥이 데일 수 있어요. 이른 아침이나 저녁에 짧게 다녀오세요!' };
  if (w.temp >= 24) return { lbl: '조금 더운 날 🌤️', cls: 'suit-hot', desc: '그늘 위주로 산책하고 물을 꼭 챙겨가세요.' };
  if (w.temp <= -5) return { lbl: '많이 추워요 🥶', cls: 'suit-cold', desc: '강아지 옷을 입히고 짧게 다녀오세요. 발바닥 동상에 주의하세요!' };
  if (w.temp <= 5) return { lbl: '쌀쌀한 날 🧥', cls: 'suit-cold', desc: '옷 챙겨 입히고 따뜻할 때 짧게 산책하는 게 좋아요.' };
  return { lbl: '산책 딱 좋아요 🐾', cls: 'suit-perfect', desc: '초코가 신나게 뛰어다닐 수 있는 완벽한 날씨예요!' };
}

export function getWeather(onSuccess, onFail, onDenied) {
  if (!navigator.geolocation) { onFail(); return; }
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const url = "https://api.openweathermap.org/data/2.5/weather" + "?lat=" + lat + "&lon=" + lon + "&appid=" + OWM_API_KEY + "&units=metric&lang=kr";
      fetch(url).then((res) => res.json()).then((data) => {
        if (!data || !data.main) { onFail(); return; }
        onSuccess({
          temp: Math.round(data.main.temp),
          tempMin: Math.round(data.main.temp_min),
          tempMax: Math.round(data.main.temp_max),
          feels: Math.round(data.main.feels_like),
          humid: data.main.humidity,
          wind: data.wind ? data.wind.speed.toFixed(1) : "0.0",
          cond: translateCond(data.weather[0].description, data.weather[0].main),
          icon: mapWeatherIcon(data.weather[0].icon),
          rain: data.weather[0].main === 'Rain' || data.weather[0].main === 'Drizzle',
        });
      }).catch(() => onFail());
    },
    function (err) {
      if (err.code === 1 && onDenied) onDenied();
      else if (err.code !== 1) console.warn("위치 정보 오류 (code=" + err.code + ")");
      onFail();
    },
    { timeout: 8000 }
  );
}
