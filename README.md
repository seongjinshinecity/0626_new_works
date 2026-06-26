# 루프 개발 시스템 — 시작 가이드

AI 공장장 부트캠프 퀘스트를 **3개 에이전트 루프**(지시→개발→QA/완료판단)로 개발하는 셋업.
하네스가 **폴더 안의 가이드/스펙을 매 단계 강제**한다.

## 구성
```
loop-dev-setup/
├─ README.md                  ← 지금 이 파일
├─ 개발계획.md                ← 배치 그룹화 · 루프 아키텍처 · 완료기준 규칙
├─ 스킬_MCP_설치안내.md       ← Supabase/Playwright/Notion MCP, 문서 스킬 설치
├─ 실행프롬프트.md            ← 복붙용 터미널 프롬프트
├─ .env.sample               ← 복사해서 .env / .env.local 로 채우기
├─ .claude/agents/
│   ├─ conductor.md          ← 오케스트레이터(지시/판정/재지시)
│   ├─ builder.md            ← 개발(스펙대로 구현, 빌드 통과)
│   └─ verifier.md           ← QA+완료판단(실제 실행 검증, VERDICT 출력, 코드수정 권한 없음)
├─ specs/
│   └─ gyebu-app.spec.md     ← 완료의 정의(인수기준) — 가계부 예시
├─ docs/guide/
│   └─ gyebu-app.md          ← 커리큘럼 원문 가이드(강제 주입 대상)
└─ harness/
    └─ run-loop.sh           ← 강제 반복 루프 드라이버
```

## 빠른 시작 (가계부 앱 예시)
```bash
# 1) 새 앱 프로젝트 생성 후, 이 셋업 파일들을 그 안으로 복사
#    (.claude/agents, specs, docs/guide, harness, .env.sample)

# 2) 환경변수
cp .env.sample .env && cp .env.sample .env.local   # Supabase 등 값 채우기

# 3) MCP 설치 (스킬_MCP_설치안내.md 참고)
claude mcp add supabase --scope project \
  --env SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN \
  -- npx -y @supabase/mcp-server-supabase@latest --project-ref=$SUPABASE_PROJECT_REF

# 4) 강제 루프 실행
bash harness/run-loop.sh gyebu-app 5
```

## 동작 원리 (요약)
- `run-loop.sh` 가 최대 N회 반복하며 매 반복:
  1) **builder** 로 스펙의 미충족 AC 구현 → 2) **verifier** 로 전 AC 실제 검증 → `VERDICT: PASS/FAIL` 파싱.
- PASS면 종료, FAIL이면 `REASONS:` 를 다음 builder에 피드백. N회 초과 시 사람에게 에스컬레이션.
- 모든 프롬프트에 `@specs/...` + `@docs/guide/...` 를 강제 주입 → 가이드 이탈 방지.
- verifier는 **코드 수정 권한이 없어** QA를 통과시키려 자가수정하는 부정이 구조적으로 불가능.

## 확장
- 배치 1 나머지(커뮤니티/쇼핑몰/대시보드): `실행프롬프트.md` D 로 스펙 생성 후 동일 루프.
- 배치 2/3: 같은 3에이전트 구조, QA만 "샘플 질문 루브릭"·"산출물 검증"으로 교체.

자세한 내용은 `개발계획.md` 참고.
