// Open-Meteo (API 키 불필요). 서울 좌표 기본. 실패해도 null 반환 → 위젯만 degrade.
export type Weather = {
  temp: number;
  code: number;
  desc: string;
  tmax: number;
  tmin: number;
  pop: number; // 강수 확률(%)
};

// WMO weather code → 한글 설명
function describe(code: number): string {
  if (code === 0) return "맑음";
  if (code <= 2) return "대체로 맑음";
  if (code === 3) return "흐림";
  if (code <= 48) return "안개";
  if (code <= 57) return "이슬비";
  if (code <= 67) return "비";
  if (code <= 77) return "눈";
  if (code <= 82) return "소나기";
  if (code <= 86) return "눈 소나기";
  return "뇌우";
}

export async function getWeather(): Promise<Weather | null> {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=37.5665&longitude=126.9780" +
      "&current=temperature_2m,weather_code" +
      "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
      "&timezone=Asia%2FSeoul&forecast_days=1";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    const code = d?.current?.weather_code ?? 0;
    return {
      temp: Math.round(d.current.temperature_2m),
      code,
      desc: describe(code),
      tmax: Math.round(d.daily.temperature_2m_max[0]),
      tmin: Math.round(d.daily.temperature_2m_min[0]),
      pop: d.daily.precipitation_probability_max[0] ?? 0,
    };
  } catch {
    return null;
  }
}
