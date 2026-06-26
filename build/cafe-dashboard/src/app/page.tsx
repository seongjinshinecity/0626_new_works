import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWeather } from "@/lib/weather";
import { summarize, buildBriefing, won, type Sale } from "@/lib/cafe";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  // AC2: 사장님(로그인)만 접근. 비로그인은 /login 으로.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("사장님 로그인이 필요합니다."));
  }

  // 데이터 소스 ① DB 매출 (RLS: 로그인 사용자만 select)
  const { data } = await supabase
    .from("cafe_sales")
    .select("*")
    .order("date", { ascending: false });
  const sales = (data ?? []) as Sale[];
  const summary = summarize(sales);

  // 데이터 소스 ② 날씨 (Open-Meteo, 실패해도 페이지 유지)
  const weather = await getWeather();

  // AI 브리핑 (규칙기반 종합)
  const briefing = buildBriefing(summary, weather);

  // 날짜별 매출 (막대용)
  const byDate = new Map<string, number>();
  for (const s of sales) byDate.set(s.date, (byDate.get(s.date) ?? 0) + Number(s.amount));
  const dateRows = [...byDate.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 7);
  const maxDay = Math.max(1, ...dateRows.map(([, v]) => v));

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">☕ 카페 사장님 대시보드</h1>
          <p className="text-sm text-black/50 dark:text-white/50">
            오늘의 운영 현황을 한눈에
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-black/60 sm:inline dark:text-white/60">{user.email}</span>
          <form action={signOut}>
            <button className="rounded-lg border border-black/15 px-3 py-1.5 dark:border-white/20">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      {/* AI 브리핑 (AC7) */}
      <section className="rounded-2xl border border-amber-300/40 bg-amber-50 p-5 dark:bg-amber-950/20">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
          🤖 오늘의 AI 브리핑
        </div>
        <p className="leading-relaxed">{briefing}</p>
      </section>

      {/* 요약 위젯 (AC4) + 날씨 (AC6) */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label={`매출 (${summary.latestDate ?? "-"})`} value={won(summary.latestTotal)} sub={`${summary.latestOrders}잔`} />
        <Card label="최근 7일 누적" value={won(summary.weekTotal)} sub={`${summary.weekDays}일`} />
        <Card label="일평균 매출" value={won(summary.avgPerDay)} sub="최근 기준" />
        <Card
          label="오늘 날씨 (서울)"
          value={weather ? `${weather.temp}°C ${weather.desc}` : "불러올 수 없음"}
          sub={weather ? `${weather.tmin}~${weather.tmax}°C · 강수 ${weather.pop}%` : "Open-Meteo"}
        />
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {/* 인기 메뉴 (AC5) */}
        <section className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <h2 className="mb-3 text-lg font-semibold">🔥 인기 메뉴 TOP 5</h2>
          {summary.topMenus.length === 0 ? (
            <p className="text-sm text-black/50">데이터 없음</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {summary.topMenus.map((m, i) => (
                <li key={m.menu_name} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="mr-2 font-bold text-amber-600">{i + 1}</span>
                    {m.menu_name}
                  </span>
                  <span className="text-black/60 dark:text-white/60">
                    {m.quantity}잔 · {won(m.amount)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* 날짜별 매출 막대 */}
        <section className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
          <h2 className="mb-3 text-lg font-semibold">📊 일별 매출 (최근 7일)</h2>
          <ul className="flex flex-col gap-2">
            {dateRows.map(([d, v]) => (
              <li key={d} className="flex items-center gap-3 text-xs">
                <span className="w-20 shrink-0 text-black/50 dark:text-white/50">{d.slice(5)}</span>
                <div className="h-3 flex-1 rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className="h-3 rounded-full bg-amber-500"
                    style={{ width: `${(v / maxDay) * 100}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right font-medium">{won(v)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="text-xs text-black/40 dark:text-white/40">
        연결된 데이터 소스: Supabase DB(cafe_sales) · Open-Meteo 날씨 API
      </footer>
    </main>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
      <div className="text-xs text-black/50 dark:text-white/50">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
      <div className="text-xs text-black/40 dark:text-white/40">{sub}</div>
    </div>
  );
}
