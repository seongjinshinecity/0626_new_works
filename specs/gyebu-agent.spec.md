# SPEC — [Agent+DB] 가계부 분석 에이전트 (배치 2)

> 배치 2는 앱이 아니라 **에이전트**다. 검증은 객관 AC가 아니라 **루브릭**(데이터 근거 + 맞춤성)이되, 아래처럼 객관적으로 환원해 확인한다.
> 출처 가이드: `docs/guide/gyebu-agent.md`

## 구성
- 연결: Supabase MCP(read-only, project-ref 한정) → 가계부와 같은 `transactions` 테이블
- 에이전트: `.claude/agents/gyebu-analyst.md` (페르소나/규칙)
- 데이터: gyebu-app 프로젝트 `transactions`(분석용 다월 데이터)

## 인수기준 (AC)
- [ ] **AC1 (연결)** Supabase MCP가 read-only로 연결된다(`claude mcp list` → ✔ Connected). PAT는 user scope(git 밖), 저장소에 키 없음.
- [ ] **AC2 (기본 조회)** "이번 달 지출", "식비 최대일", "교통 월평균" 류에 답하고, **답의 수치가 독립 SQL과 일치**한다.
- [ ] **AC3 (패턴 분석)** 주중/주말, 요일별, 카테고리 비율 등 집계 질문에 GROUP BY 근거로 답한다.
- [ ] **AC4 (절약 조언=맞춤성)** 조언이 일반론이 아니라 **이 데이터에서 관찰된 사실**(예: 식비가 최대 변동비, 주말 1.5배)을 인용한다.
- [ ] **AC5 (정확성/반순환검증)** 모든 답 수치는 verifier가 **독립적으로 실행한 SQL**과 일치해야 한다. 에이전트가 추정·암산하지 않고 쿼리로 답한다(페르소나 1번 규칙).
- [ ] **AC6 (범위)** `transactions`만 분석. 같은 프로젝트의 posts/cart/cafe_sales 등 타 앱 테이블 미접근. 쓰기 없음.
- [ ] **AC7 (산출물)** 페르소나(`.claude/agents/gyebu-analyst.md`) + SQL검증 Q&A(`DEMO.md`) + `README.md`(MCP 설치/사용). 에이전트 대화 스크린샷은 사용자 claude 세션 캡처 필요 → 자동 불가 시 DEMO transcript로 대체("수동 확인").

## verifier 검증 방법
1. `claude mcp list`에서 supabase Connected, 저장소에 PAT 없음(스캔) — AC1, AC5
2. DEMO.md의 각 질문 SQL을 **독립 실행**해 답변 수치와 대조 — AC2, AC3, AC5
3. 조언(Q8)이 인용한 패턴(식비 30.2% 최대, 주말 1.5배)이 SQL로 사실인지 — AC4
4. 페르소나가 transactions만, read-only로 한정하는지 — AC6
5. 산출물 3종 존재 — AC7

## 범위 밖
- 독립 챗 앱/UI(모델 API 키 필요), 자동 입력, 다중 사용자, 예측 모델(단순 월평균 추세까지).
