# SPEC — [Auth+DB+API+AI] 카페 사장님 대시보드 (보스)

> 완료의 정의. verifier는 아래 AC를 실제 실행으로 검증한다.
> 출처 가이드: `docs/guide/cafe-dashboard.md` ("위젯 2~3개만 동작해도 인정", 완벽 추구 금지)

## 범위 결정 (사용자 확정)
- **데이터 소스 2개**: ① Supabase DB(카페 매출/메뉴) ② 날씨 API(**Open-Meteo, 키 불필요**).
- **AI 브리핑**: API 키 없이 **규칙기반**(서버가 매출·인기메뉴·날씨를 조합해 자연어 브리핑 생성).
- Notion MCP·Claude API·결제·멀티카페는 범위 밖.

## 스택
- Next.js 16 (App Router) + React 19 + TS + Tailwind v4
- Supabase Auth(사장님 로그인) + Postgres, 세션 `@supabase/ssr` + `src/proxy.ts`
- 날씨: Open-Meteo REST(서버 fetch, 키 없음), 서울 좌표 기본
- DB: gyebu-app 프로젝트 공유. env `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 데이터 모델 (`cafe_sales` — 일자별 메뉴 판매 기록)
| 컬럼 | 타입 |
| --- | --- |
| id | uuid PK default gen_random_uuid() |
| date | date not null (판매일) |
| menu_name | text not null |
| category | text (커피/디저트/음료 등) |
| quantity | int not null (>0) |
| amount | numeric not null (>=0) — 해당 판매 총액 |
| created_at | timestamptz default now() |

- RLS: SELECT는 **로그인 사용자만**(authenticated). 쓰기 없음(seed는 관리 API).

## 인수기준 (AC)
- [ ] **AC1 (빌드)** `npm install && npm run build` exit 0, dev 기동.
- [ ] **AC2 (접근 제어=사장님만)** 비로그인은 대시보드(`/`)를 못 보고 `/login`으로 보내진다. 로그인하면 대시보드 표시.
      - 검증: 비로그인 GET `/` → /login 리다이렉트. 가입/로그인 후 대시보드 렌더.
- [ ] **AC3 (데이터 소스 2개 연결)** 대시보드에 **DB 매출 데이터**와 **날씨 API 데이터**가 둘 다 실제로 표시된다.
      - 검증: 날씨 위젯에 Open-Meteo 실측치(기온 등), 매출 위젯에 DB 집계가 보임.
- [ ] **AC4 (매출 요약 위젯)** 기간(예: 어제/최근) 매출 합계·주문수가 정확히 계산·표시.
      - 검증: 샘플 데이터로 합계 = SQL 집계와 일치.
- [ ] **AC5 (인기 메뉴 위젯)** 판매량 기준 인기 메뉴 Top N 표시.
      - 검증: group by menu_name sum(quantity) 상위와 화면 일치.
- [ ] **AC6 (날씨 위젯)** Open-Meteo로 현재/오늘 날씨(기온, 강수확률 등)를 실데이터로 표시.
      - 검증: 위젯 값이 Open-Meteo 응답과 일치(서버 fetch 성공).
- [ ] **AC7 (AI 브리핑)** 위 데이터를 **종합**한 "오늘의 카페 브리핑"이 자연어로 생성·표시된다(매출+인기메뉴+날씨가 문장에 반영).
      - 검증: 브리핑 텍스트에 실제 매출 숫자/메뉴명/날씨가 들어감(하드코딩 아님).
- [ ] **AC8 (대시보드 한 화면)** 위젯들이 한 화면에 배치된 대시보드 UI.
- [ ] **AC9 (RLS/영속성)** cafe_sales RLS on, 서버 재기동 후 데이터 유지.
- [ ] **AC10 (제출물)** README(실행법·env·**연결 소스 목록**) + `docs/screenshots/`(≥1장: 대시보드).

## verifier 검증 방법(요약)
1. build exit 0 (AC1)
2. 비로그인 `/` → 302 /login (AC2)
3. Auth 가입→토큰, 대시보드 데이터 조회 (AC2)
4. Open-Meteo fetch 성공 + 위젯 값 (AC3, AC6)
5. SQL 집계 vs 화면(매출/인기메뉴) (AC4, AC5)
6. 브리핑 텍스트에 실데이터 반영 확인 (AC7)
7. RLS·정책, 재기동 유지 (AC9)
8. README(연결소스 목록)·스크린샷 (AC10)

## 범위 밖
- 결제, 멀티 카페/멀티 사장님, Notion/Claude 연동, 실시간 주문 입력 UI, 재고 발주 자동화.
