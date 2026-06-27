# 🏪 내 카페를 아는 AI 에이전트 (Context + Agent + DB)

`my_cafe.md`(카페 컨텍스트)와 운영 DB(`cafe_sales`)를 **둘 다 읽어** 내 카페에 딱 맞는 운영 조언을 주는 AI 파트너.
5번(가계부 분석 에이전트)이 DB만 봤다면, 6번은 **컨텍스트 + DB 결합**이 핵심이다.

- 컨텍스트: `my_cafe.md` (상호·컨셉·시그니처·가격대·**제약: 좌석/인력/주방/예산**)
- 운영 DB: Supabase `cafe_sales` (4번 카페 대시보드와 공유, Supabase MCP read-only)
- 에이전트: `.claude/agents/cafe-partner.md` — **`Read`(my_cafe.md) + `execute_sql`(DB)** 둘 다 사용
- 모델 API 키 불필요 (Claude Code 세션이 에이전트)

## 핵심 설계
- **컨텍스트 + DB 동시 반영**: 모든 조언은 ① my_cafe.md의 컨셉/제약 + ② DB 실데이터를 둘 다 근거로 한다.
- **제약 준수**: 좌석 24석·인력 2명·주방 협소·예산 제한을 어기는 제안(대규모 신메뉴, 좌석 증설, 고비용 마케팅) 금지.
- **추정 금지**: DB 수치는 `execute_sql` 결과만 (5번과 동일한 반환각 규칙).
- ⚠️ 페르소나 `tools:`에 **`Read` 포함 필수** — 없으면 my_cafe.md를 못 읽어 DB-only 답이 되어 6번의 의미가 사라진다.

## 설치 / 사용
```bash
# Supabase MCP (5번에서 설치했으면 재사용) — read-only, 가계부와 같은 프로젝트 ref
claude mcp add supabase --scope user \
  --env SUPABASE_ACCESS_TOKEN=<PAT: sbp_...> \
  -- npx -y @supabase/mcp-server-supabase@latest --read-only --project-ref=<ref>

# 이 폴더에서 claude 실행 후:
#   cafe-partner 에이전트로 "신메뉴 추천해줘" / "평일 낮 매출 올리려면?" 물어봐줘.
```
> PAT는 `~/.claude.json`(git 밖)에만. 저장소에 키 커밋 금지.

## 산출물 / 검증
- **`my_cafe.md`** — 카페 컨텍스트(입력물).
- **`.claude/agents/cafe-partner.md`** — 페르소나(Read + MCP).
- **`DEMO.md`** — **Before/After 2쌍**(context 없이 vs 있이) + 독립 SQL 검증.
  - Before = 도구 차단된 같은 모델의 진짜 일반 답(strawman 아님).
  - After = 컨텍스트 사실(제약) + DB 사실을 둘 다 인용, 수치는 독립 SQL과 일치.
- Before/After 비교 스크린샷(가이드 제출물)은 claude 세션 캡처 필요 → DEMO transcript로 대체.

## 범위
- `cafe_sales`만 분석(다른 앱 테이블 무시), read-only. 시간대(hour) 데이터는 없음(일별 집계).
