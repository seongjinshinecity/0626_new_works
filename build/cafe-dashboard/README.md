# ☕ 카페 사장님 대시보드 (보스 퀘스트)

> 🔗 **배포**: https://cafe-dashboard-45lp497pb-seongjinshinecitys-projects.vercel.app (Vercel, Production)
> ⚠️ Vercel **Deployment Protection(SSO)**이 켜져 있어 소유자만 접근됩니다. 외부 공개하려면 Settings → Deployment Protection → Vercel Authentication 을 **Disabled**로 변경하세요.

로그인한 사장님에게 **카페 운영 데이터를 한 화면**으로 보여주고, 데이터를 종합한 **AI 브리핑**을 생성하는 대시보드입니다.

- 스택: **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4**
- 인증/DB: **Supabase Auth + Postgres**, 세션 `@supabase/ssr` + `src/proxy.ts`
- 출처 스펙: `../../specs/cafe-dashboard.spec.md`

## 연결된 데이터 소스 (2개)

| # | 소스 | 내용 | 키 |
| --- | --- | --- | --- |
| 1 | **Supabase DB** (`cafe_sales`) | 일자별 메뉴 판매(매출·수량) | anon 키 + 로그인 세션 |
| 2 | **Open-Meteo 날씨 API** | 서울 현재/오늘 기온·강수확률 | **불필요** |

## 기능 (위젯)

- 🤖 **AI 브리핑** — 매출·인기메뉴·날씨를 종합한 자연어 브리핑(규칙기반, API 키 0). 실제 DB 숫자와 날씨 값을 문장에 반영.
- 💰 **매출 요약** — 최신 영업일 매출/판매수, 최근 7일 누적, 일평균
- 🔥 **인기 메뉴 TOP 5** — 판매량 기준
- 🌤️ **날씨** — Open-Meteo 실데이터(실패 시 위젯만 degrade, 페이지는 유지)
- 📊 **일별 매출** — 최근 7일 막대

> 매출 요약·브리핑은 하드코딩된 "어제"가 아니라 **데이터에 실제 존재하는 최신 날짜**를 기준으로 집계합니다(실행 시점과 무관하게 동작).

## 접근 제어
`/`(대시보드)는 **로그인(사장님)만** 접근 가능 — 비로그인은 `/login`으로 리다이렉트. `cafe_sales`는 RLS로 인증 사용자만 조회.
(단일 카페 데모라 사용자별 분리는 하지 않음 — 로그인한 사장님이 전체 매출을 봄.)

## 실행 방법
```bash
npm install
# .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev          # http://localhost:3000
npm run build && npm start
```
Supabase: autoconfirm 켜기 + `cafe_sales` 테이블/RLS 생성 + 샘플 매출 seed.

## DB 스키마 (`cafe_sales`)
```sql
create table public.cafe_sales (
  id uuid primary key default gen_random_uuid(),
  date date not null, menu_name text not null, category text,
  quantity int not null check (quantity>0), amount numeric not null check (amount>=0),
  created_at timestamptz default now());
alter table public.cafe_sales enable row level security;
create policy cafe_sales_select_auth on public.cafe_sales for select to authenticated using (true);
```

## 폴더 구조
```
src/
├─ proxy.ts                  # 세션 갱신
├─ app/
│  ├─ page.tsx               # 대시보드(로그인 보호) — 위젯 + 브리핑
│  ├─ login/page.tsx
│  └─ actions.ts             # 인증 서버 액션
└─ lib/
   ├─ supabase/*             # SSR 클라이언트
   ├─ weather.ts             # Open-Meteo fetch (no-store, 실패 안전)
   └─ cafe.ts                # 집계(summarize) + 규칙기반 브리핑(buildBriefing)
```

## 스크린샷
`docs/screenshots/dashboard.png` (로그인 후 대시보드).
