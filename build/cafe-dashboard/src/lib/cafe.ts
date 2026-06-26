import type { Weather } from "./weather";

export type Sale = {
  id: string;
  date: string;
  menu_name: string;
  category: string | null;
  quantity: number;
  amount: number;
};

export const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

export type MenuRank = { menu_name: string; quantity: number; amount: number };

export type CafeSummary = {
  latestDate: string | null;
  latestTotal: number;
  latestOrders: number;
  weekTotal: number;
  weekDays: number;
  avgPerDay: number;
  topMenus: MenuRank[];
};

// 하드코딩 "어제"가 아니라 데이터에 실제로 존재하는 최신 날짜를 기준으로 집계 (실행 시점 무관).
export function summarize(sales: Sale[]): CafeSummary {
  if (sales.length === 0) {
    return {
      latestDate: null,
      latestTotal: 0,
      latestOrders: 0,
      weekTotal: 0,
      weekDays: 0,
      avgPerDay: 0,
      topMenus: [],
    };
  }

  const latestDate = sales.reduce((m, s) => (s.date > m ? s.date : m), sales[0].date);

  let latestTotal = 0;
  let latestOrders = 0;
  let weekTotal = 0;
  const days = new Set<string>();
  const menuMap = new Map<string, MenuRank>();

  for (const s of sales) {
    weekTotal += Number(s.amount);
    days.add(s.date);
    if (s.date === latestDate) {
      latestTotal += Number(s.amount);
      latestOrders += s.quantity;
    }
    const cur = menuMap.get(s.menu_name) ?? {
      menu_name: s.menu_name,
      quantity: 0,
      amount: 0,
    };
    cur.quantity += s.quantity;
    cur.amount += Number(s.amount);
    menuMap.set(s.menu_name, cur);
  }

  const topMenus = [...menuMap.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  const weekDays = days.size;

  return {
    latestDate,
    latestTotal,
    latestOrders,
    weekTotal,
    weekDays,
    avgPerDay: weekDays ? Math.round(weekTotal / weekDays) : 0,
    topMenus,
  };
}

// 규칙기반 AI 브리핑 — 실제 매출 숫자/메뉴/날씨를 문장에 반영(하드코딩 아님).
export function buildBriefing(s: CafeSummary, w: Weather | null): string {
  if (!s.latestDate) return "아직 매출 데이터가 없어 브리핑을 생성할 수 없습니다.";

  const parts: string[] = [];
  const top = s.topMenus[0];
  const top2 = s.topMenus[1];

  parts.push(
    `📅 ${s.latestDate} 기준, 매출은 ${won(s.latestTotal)}(${s.latestOrders}잔 판매)입니다.`,
  );
  parts.push(
    `최근 ${s.weekDays}일 누적 ${won(s.weekTotal)}, 일평균 ${won(s.avgPerDay)} 수준입니다.`,
  );
  if (top) {
    const menuStr = top2
      ? `${top.menu_name}(${top.quantity}잔)와 ${top2.menu_name}(${top2.quantity}잔)`
      : `${top.menu_name}(${top.quantity}잔)`;
    parts.push(`가장 잘 나가는 메뉴는 ${menuStr}입니다.`);
  }

  if (w) {
    parts.push(`오늘 날씨는 ${w.desc}, 기온 ${w.tmin}~${w.tmax}°C(현재 ${w.temp}°C)입니다.`);
    if (w.pop >= 60 || w.code >= 51) {
      parts.push(
        `☔ 비 소식이 있어 손님이 줄 수 있으니 따뜻한 음료와 디저트 세트를 추천 메뉴로 노출해 보세요.`,
      );
    } else if (w.tmax >= 28) {
      parts.push(
        `🌡️ 더운 날씨입니다. 아이스 음료·에이드 재고를 넉넉히 준비하세요.`,
      );
    } else {
      parts.push(`☀️ 야외 활동하기 좋은 날씨라 방문 손님이 늘 수 있습니다.`);
    }
  } else {
    parts.push(`(날씨 정보를 불러오지 못해 날씨 기반 제안은 생략합니다.)`);
  }

  return parts.join(" ");
}
