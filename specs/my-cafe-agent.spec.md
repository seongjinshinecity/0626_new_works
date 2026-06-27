# SPEC — [Context+Agent+DB] 내 카페를 아는 AI 에이전트 (배치 2)

> 앱이 아니라 에이전트. 5번 패턴 + **컨텍스트(my_cafe.md) 결합** + **Before/After 비교**가 핵심.
> 출처 가이드: `docs/guide/my-cafe-agent.md`

## 구성
- 컨텍스트: `my_cafe.md`(컨셉·시그니처·가격대·제약: 좌석/인력/주방/예산)
- DB: Supabase `cafe_sales`(Supabase MCP, read-only) — 4번과 공유
- 에이전트: `.claude/agents/cafe-partner.md` (**tools에 Read + execute_sql 둘 다**)

## 인수기준 (AC)
- [ ] **AC1 (두 소스 결합)** 에이전트가 `my_cafe.md`(Read)와 `cafe_sales`(execute_sql)를 **둘 다** 읽어 답한다.
- [ ] **AC2 (컨텍스트 로드 증명)** 답이 **DB에 없는 컨텍스트 사실**(좌석/인력/주방/예산 제약)을 최소 1개 인용한다 → 컨텍스트가 실제 반영됨(DB-only가 아님).
- [ ] **AC3 (데이터 근거)** 답이 인용하는 DB 수치가 **독립 SQL과 일치**한다(추정/환각 아님).
- [ ] **AC4 (제약 준수=맞춤성)** 조언이 카페 제약(좌석 24석·2인·예산)을 어기지 않고, 그 제약을 고려한 실행안이다.
- [ ] **AC5 (Before/After)** 같은 질문에 **context 없는 Before(진짜 baseline) vs context 있는 After**를 **최소 2쌍** 비교. Before는 strawman이 아니라 같은 모델의 실제 답(도구 차단).
- [ ] **AC6 (산출물)** `my_cafe.md` + 페르소나 + `DEMO.md`(Before/After 2쌍 + SQL검증) + README.

## verifier 검증 방법
1. 페르소나 frontmatter `tools:`에 `Read` 포함 확인(없으면 컨텍스트 못 읽음) — AC1
2. After 답에 컨텍스트-only 사실(제약) 인용 여부 — AC2
3. After 인용 수치를 독립 SQL로 재현·대조 — AC3
4. 조언이 제약 위반 없는지 — AC4
5. Before가 도구 차단된 실제 생성인지(인위적 약화 아님), After와 대비 명확 — AC5
6. 산출물 4종 존재 — AC6

## 범위 밖
- 독립 챗 앱(모델 키 필요), 시간대(hour) 분석(DB는 일별 집계), 리뷰/재고 등 미보유 데이터.
