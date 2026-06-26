# 스킬 · MCP 설치 안내 (Claude Code)

루프 개발에 필요한 MCP 서버와 스킬을 배치별로 정리. 명령은 **개발할 프로젝트 폴더**에서 실행.

> 스코프: `--scope project` = 팀/프로젝트 공유(`.claude/mcp.json`), `--scope user` = 내 모든 프로젝트. 비밀키는 `--env` 또는 `.env`로 주입하고 커밋하지 마세요.

---

## 0. 공통 (모든 배치)

```bash
# Claude Code 최신화 & 로그인 확인
claude --version
claude            # 최초 1회 로그인

# 에이전트 파일 배치 (이 설정 폴더에서 개발 프로젝트로 복사)
mkdir -p <project>/.claude/agents <project>/specs <project>/docs/guide <project>/harness
cp .claude/agents/*.md   <project>/.claude/agents/
cp harness/run-loop.sh   <project>/harness/
cp specs/gyebu-app.spec.md <project>/specs/      # 예시 스펙
# 커리큘럼 가이드(앞서 추출한 md)에서 해당 프로젝트 섹션을 docs/guide/<project>.md 로 저장
```

설치 후 세션에서 `/agents` 로 에이전트 인식 확인, `/mcp` 로 MCP 상태 확인.

---

## 1. 배치 1 — 풀스택 웹앱 (가계부/커뮤니티/쇼핑몰/대시보드)

### Supabase MCP (DB/Auth 검증·작업)
```bash
claude mcp add supabase --scope project \
  --env SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN \
  -- npx -y @supabase/mcp-server-supabase@latest --project-ref=$SUPABASE_PROJECT_REF
```
- builder가 테이블 생성/마이그레이션, verifier가 행 존재 검증에 사용.
- 토큰은 Supabase > Account > Access Tokens 에서 발급해 `.env`에 넣고 위처럼 참조.

### (선택) 브라우저 검증용 Playwright MCP — UI 플로우 자동 검증
```bash
claude mcp add playwright --scope project -- npx -y @playwright/mcp@latest
```

확인:
```bash
claude mcp list
```

---

## 2. 배치 2 — 데이터 분석 에이전트

- **Supabase MCP** (위 1과 동일) 재사용.
- 컨텍스트 파일 `my_cafe.md` 를 프로젝트 루트에 두고 스펙에서 참조.
- 별도 스킬 불필요. QA는 "샘플 질문 → 답변 루브릭" 방식(스펙에 질문셋 포함).

---

## 3. 배치 3 — 자동화 · 문서 산출

### Playwright MCP (인스타 인플루언서 찾기 등)
```bash
claude mcp add playwright --scope project -- npx -y @playwright/mcp@latest
```
> ⚠️ 인스타는 **본인 계정으로 사람이 직접 로그인**, 자동 대량 스크래핑·DM 금지(계정 정지 위험).

### 문서 산출 스킬 (엑셀/PPT/워드 보고서)
플러그인 마켓플레이스로 document 계열 스킬 설치:
```bash
# 세션 안에서:
/plugin marketplace add anthropics/skills      # 공개 스킬 마켓플레이스 추가
/plugin install document-skills@skills          # 이름은 /plugin 목록에서 확인 후 정확히 지정
/reload-plugins
```
또는 수동 설치:
```bash
mkdir -p .claude/skills/xlsx-report
# .claude/skills/xlsx-report/SKILL.md 작성 (name/description/allowed-tools 프런트매터 + 절차)
```

### Notion MCP (대시보드/공유, 선택)
```bash
claude mcp add notion --scope project \
  --env NOTION_API_KEY=$NOTION_API_KEY \
  -- npx -y @notionhq/notion-mcp-server
```

---

## 4. SKILL.md 최소 형식 (수동 작성 시)
```markdown
---
name: xlsx-report
description: CSV/MD 리서치 결과를 수식·차트가 있는 .xlsx 보고서로 변환. "엑셀 보고서" 요청 시 사용.
allowed-tools: Read Bash Write
---
# 절차
1. 입력 파일을 읽는다.
2. ...
```

> 참고: 정확한 플러그인/스킬 이름은 버전에 따라 다를 수 있으니 `/plugin` 메뉴와 `claude mcp list` 로 실제 설치명을 확인하세요.
