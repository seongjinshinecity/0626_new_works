# 💰 가계부 앱 (Server + DB)

수입·지출 내역을 등록하고, 목록으로 조회하며, 카테고리별 지출 합계를 보여주는 가계부 앱입니다.
모든 데이터는 **Supabase(Postgres)** 에 저장됩니다.

- 스택: **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4**
- DB: **Supabase (Postgres)** — `transactions` 테이블
- 출처 스펙: `../../specs/gyebu-app.spec.md`

## 기능

| 기능 | 설명 |
| --- | --- |
| 내역 등록 | 수입/지출, 금액, 카테고리, 메모(선택), 날짜를 입력해 1건 등록 |
| 목록 조회 | 등록된 내역을 최신순으로 표시 (타입/카테고리/날짜/금액) |
| 카테고리별 합계 | 지출을 카테고리별로 합산해 표시 (식비·교통·주거·구독료·경조사 등) |
| 요약 | 총 수입 / 총 지출 / 잔액 |
| 입력 검증 | 음수 금액·빈 카테고리·잘못된 타입·빈 날짜는 거부하고 메시지 표시 |
| 영속성 | 서버를 재기동해도 데이터 유지 (Supabase 저장, 메모리 저장 아님) |

## 실행 방법

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 설정 — .env.local 에 아래 키를 채웁니다
#    (Supabase 대시보드 > Project Settings > API)

# 3) 개발 서버
npm run dev          # http://localhost:3000

# 4) 프로덕션 빌드
npm run build && npm start
```

### 필요한 환경변수 (`.env.local`)

| 키 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role 키 (서버 전용, 절대 클라이언트 노출 금지) |
| `SUPABASE_PROJECT_REF` | 프로젝트 ref (검증/관리용, 선택) |

> ⚠️ `.env.local` 은 `.gitignore` 에 포함되어 커밋되지 않습니다.

## DB 스키마 (`transactions`)

```sql
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income','expense')),
  amount numeric not null check (amount >= 0),
  category text not null,
  memo text,
  date date not null,
  created_at timestamptz not null default now()
);
alter table public.transactions enable row level security;
```

서버 측 API 라우트가 `service_role` 키로 접근하므로 RLS를 켜둔 채 안전하게 동작합니다.

## API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/api/transactions` | 전체 내역(최신순) + 카테고리별 합계 + 총수입/총지출/잔액 |
| `POST` | `/api/transactions` | 1건 등록. body: `{ type, amount, category, memo?, date }` |

POST 검증 규칙: `type` 은 `income`/`expense`, `amount` 는 0 이상 숫자, `category`·`date` 필수. 위반 시 `400` + 한국어 에러 메시지.

## 스크린샷

`docs/screenshots/` 폴더 참고 (`app.png`).

## 폴더 구조

```
src/
├─ app/
│  ├─ page.tsx                 # 메인 화면 (요약·폼·합계·목록)
│  ├─ transaction-form.tsx     # 등록 폼 (클라이언트 컴포넌트)
│  └─ api/transactions/route.ts# GET(목록+합계) / POST(등록+검증)
└─ lib/
   ├─ supabase.ts              # 서버용 service_role 클라이언트
   └─ categories.ts            # 카테고리 상수 + 합계 계산 유틸
```
