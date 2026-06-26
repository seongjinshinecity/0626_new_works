# SPEC — [Server+DB] 가계부 앱

> 완료의 정의(Definition of Done). verifier는 아래 AC를 **전부** 실제 실행으로 검증한다.
> 출처 가이드: `docs/guide/gyebu-app.md` (커리큘럼 원문의 미션/핵심구조/제출물)

## 스택
- 프런트/서버: Next.js (App Router) + React
- DB/Auth: Supabase (Postgres)
- 환경변수: `.env.local` (키 목록은 `.env.sample` 참조)
- 빌드/기동: `npm install` → `npm run build` → `npm run dev`

## 데이터 모델 (Supabase `transactions` 테이블)
| 컬럼 | 타입 | 비고 |
| --- | --- | --- |
| id | uuid (PK, default) | |
| type | text | 'income' \| 'expense' |
| amount | numeric | 0 이상 |
| category | text | 식비/교통/주거/구독료/경조사 등 |
| memo | text | nullable |
| date | date | 거래일 |
| created_at | timestamptz default now() | |

## 인수기준 (Acceptance Criteria)

- [ ] **AC1 (빌드)** `npm install && npm run build` 가 exit 0. 개발서버가 에러 없이 기동.
- [ ] **AC2 (등록)** UI 또는 API로 수입/지출 1건 등록 시 `type, amount, category, memo, date` 가 모두 저장된다.
      - 검증: 등록 요청 → Supabase `transactions` 에 해당 행이 실제로 존재(쿼리로 확인).
- [ ] **AC3 (조회)** 등록된 내역이 목록으로 표시된다(최신순). 최소 날짜·금액·카테고리·타입 노출.
- [ ] **AC4 (카테고리별 합계)** 카테고리별 지출 합계가 계산되어 표시된다.
      - 검증: 알려진 샘플 데이터로 합계가 산술적으로 정확.
- [ ] **AC5 (DB 영속성)** 서버 재기동 후에도 데이터가 유지된다(메모리 저장 금지, Supabase 사용).
- [ ] **AC6 (입력 검증)** 음수 금액·빈 카테고리 등 잘못된 입력은 거부되고 사용자에게 메시지 표시.
- [ ] **AC7 (제출물)** `README.md` 에 실행 방법과 필요한 env 키가 적혀 있다. 동작 스크린샷 경로 `docs/screenshots/` 존재(최소 1장) — 자동화 불가 시 verifier는 "수동 확인 필요"로 표시하되 나머지는 자동 검증.

## verifier 검증 방법(요약)
1. `npm run build` 실행 → exit 코드 확인 (AC1)
2. 개발서버 기동 후 등록 엔드포인트/폼 플로우로 1건 POST → Supabase REST 또는 MCP로 `select * from transactions order by created_at desc limit 1` (AC2, AC5)
3. 목록 엔드포인트 GET → 방금 등록 건 포함 확인 (AC3)
4. 합계 엔드포인트/화면 데이터로 카테고리 합계 산술 검증 (AC4)
5. 잘못된 입력 POST → 4xx + 에러 메시지 (AC6)
6. `README.md`·스크린샷 디렉터리 존재 확인 (AC7)

## 범위 밖 (하지 말 것)
- 결제, 다중 사용자 인증(가계부 단계에선 불필요), 모바일 앱, 차트는 선택(여유 시).
