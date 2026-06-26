# 📊 가계부 분석 에이전트 (Agent + DB)

가계부 앱(1번)이 적재한 Supabase `transactions`에 연결해 **"말로 물어보는 소비 분석가"**를 만든다.
조회·패턴 분석·절약 조언을 모두 **실제 DB 쿼리에 근거**해 답한다.

- 연결: **Supabase MCP** (read-only) → 가계부와 **같은 프로젝트/테이블** 사용
- 에이전트: `.claude/agents/gyebu-analyst.md` (페르소나/규칙)
- 모델 API 키 불필요 — Claude Code 세션이 곧 에이전트, Supabase MCP로 DB 접속

## 핵심 설계 (정확성)
LLM의 가장 큰 위험은 *유창하지만 틀린 답*(여러 행 암산 환각)이다. 그래서 페르소나의 **1번 규칙은 "추정 금지, 항상 `execute_sql`로 쿼리"**다. 모든 숫자는 SQL 결과에서 나온다. 검증도 "답의 수치 == 독립 SQL 결과"로 한다(`DEMO.md` 참고).

## 설치 / 사용

### 1) Supabase MCP 연결 (read-only)
```bash
claude mcp add supabase --scope user \
  --env SUPABASE_ACCESS_TOKEN=<당신의 PAT: sbp_...> \
  -- npx -y @supabase/mcp-server-supabase@latest \
     --read-only --project-ref=<가계부 프로젝트 ref>
claude mcp list   # supabase ... ✔ Connected 확인
```
- **read-only** + **project-ref 한정**: 에이전트는 절대 쓰기/다른 프로젝트 접근 불가.
- PAT는 `~/.claude.json`(user scope, git 밖)에만 저장 — **저장소에 커밋 금지**.
- PAT 발급: supabase.com/dashboard/account/tokens

### 2) 에이전트에게 질문
이 폴더에서 `claude` 실행 후:
```
gyebu-analyst 에이전트로 "이번 달 얼마 썼어?" / "주중 vs 주말 지출은?" / "뭘 줄이면 좋을까?" 물어봐줘.
```
에이전트가 `transactions`를 쿼리해 데이터 근거로 답한다.

## 데이터 전제
- 가계부 앱으로 지출이 충분히 쌓여 있어야 분석이 의미 있다(권장 수십 건+, 여러 달).
- 데모 데이터: `transactions` 204건(2026-03~06, 월 지출 약 47~52건 + 매월 급여).

## 산출물 / 검증
- **`DEMO.md`** — 조회/분석/조언 9개 질문 × (질문 → 실행 SQL → 근거 답변). 수치는 SQL과 1:1 일치(재현 가능).
- 에이전트 대화 스크린샷: 실제 `claude` 세션 캡처가 필요(자동 생성 불가) → 사용자가 위 질문을 던진 화면을 캡처. 현재는 `DEMO.md` transcript가 그 역할을 대신한다.

## 범위
- `transactions` 테이블만 분석(같은 프로젝트의 다른 앱 테이블은 무시).
- 쓰기/수정 없음(read-only). 예측은 단순 추세(월평균 기반)까지.
