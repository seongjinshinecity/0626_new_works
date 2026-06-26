# SPEC — [Auth + DB] 쇼핑몰 (결제 제외)

> 완료의 정의(Definition of Done). verifier는 아래 AC를 **전부** 실제 실행으로 검증한다.
> 출처 가이드: `docs/guide/shopping-mall.md`

## 스택
- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4
- Supabase Auth(이메일+비밀번호) + Postgres, 세션은 `@supabase/ssr` + `src/proxy.ts`
- 환경변수 `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- DB는 gyebu-app 프로젝트 공유(무료 한도). 앱은 service_role 미사용 — cart 권한은 RLS가 강제.

## 데이터 모델
`products` (공개 읽기)
| 컬럼 | 타입 |
| --- | --- |
| id | uuid PK default gen_random_uuid() |
| name | text not null |
| price | numeric not null (>=0) |
| image_url | text |
| description | text |
| created_at | timestamptz default now() |

`cart` (로그인 본인만)
| 컬럼 | 타입 |
| --- | --- |
| id | uuid PK |
| user_id | uuid not null default auth.uid() → auth.users |
| product_id | uuid not null → products |
| quantity | int not null default 1 (>0) |
| created_at | timestamptz default now() |
| **unique(user_id, product_id)** | 같은 상품은 한 행, 중복 담기는 수량 증가 |

## RLS
- `products`: SELECT 누구나(공개). INSERT/UPDATE/DELETE 없음(seed는 관리 API).
- `cart`: SELECT/INSERT/UPDATE/DELETE 모두 `user_id = auth.uid()`(본인만).

## 인수기준 (AC)
- [ ] **AC1 (빌드)** `npm install && npm run build` exit 0, dev 서버 기동.
- [ ] **AC2 (상품 목록=공개)** 비로그인 포함 누구나 상품 목록(이름·가격·이미지·설명)을 본다. 샘플 상품 ≥ 8개 존재.
      - 검증: anon 키로 `products` SELECT → 행 ≥ 8, `/`(목록)에 표시.
- [ ] **AC3 (회원가입/로그인)** 이메일+비밀번호로 가입·로그인 동작(autoconfirm).
      - 검증: Auth REST로 가입→토큰 발급.
- [ ] **AC4 (담기=로그인 필수)** 로그인 사용자만 상품을 장바구니에 담을 수 있다. 같은 상품 재담기는 수량 +1.
      - 검증: 사용자 토큰으로 cart INSERT/upsert → 행 존재(user_id=본인). **anon 담기 → RLS 거부.**
- [ ] **AC5 (장바구니 관리=본인만)** 본인 장바구니 조회·수량 변경(+/-)·삭제. 타인 장바구니는 못 본다/못 바꾼다.
      - 검증: 사용자A로 담기 → B 토큰으로 A의 cart SELECT/UPDATE/DELETE → 0행(차단). A는 본인 것 수정 성공.
- [ ] **AC6 (합계)** 장바구니 총 금액 = Σ(price × quantity) 가 정확히 계산·표시된다.
      - 검증: 알려진 샘플로 합계 산술 검증(앱 표시값 = SQL 계산값).
- [ ] **AC7 (RLS/영속성)** products·cart에 RLS on, 정책 적용. 서버 재기동 후 데이터 유지.
- [ ] **AC8 (제출물)** `README.md`(실행법·env·Supabase 설정) + `docs/screenshots/`(≥1장: 상품목록 또는 장바구니). "주문하기"는 결제 제외 — "준비 중" 표시.

## verifier 검증 방법(요약)
1. build exit 0 (AC1)
2. anon으로 products SELECT ≥ 8 (AC2)
3. Auth REST 가입→토큰 (AC3)
4. 토큰으로 cart upsert(같은 상품 2회 → quantity=2) / anon 거부 (AC4)
5. A·B 토큰으로 cart 격리 검증 (AC5)
6. 합계 산술: Σ(price×qty) 앱값=SQL값 (AC6)
7. RLS·정책 존재, 재기동 후 유지 (AC7)
8. README·스크린샷 (AC8)

## 범위 밖
- 결제/주문 처리("주문하기"=준비 중), 상품 검색/필터/카테고리, 리뷰, 재고관리, 관리자 상품 CRUD UI.
