# 핸드오프 문서 (작업 인계 / 컨텍스트 초기화 대비)

> 최종 업데이트: **2026-06-27 (4번 MCP 소스 보강 완료 + 폴더 Week5-1 개명 + Week5 폴더 동거)**.
> 이 문서는 세션이 새로 시작돼도 작업을 이어갈 수 있도록 현재 상태를 정리한다.
> **✅ 0~9번 전부 완료(0=my_cafe.md 선행 + 1~9 퀘스트). 4번에 MCP 3번째 소스까지 추가해 가이드 제목 [Auth+MCP+DB+App] 완전 충족. 최신 커밋 `d86c1ec`.**
> 남은 사용자 작업: ① 9번 인스타 **본인 로그인** 후 실후보 입력(가상 데모를 실데이터로 교체) ② Vercel Deployment Protection 해제+재배포(1~4번, 4번은 재배포해도 MCP는 로컬만·배포본 degrade) ③ 8번 엑셀/PPT를 Excel·PowerPoint로 열어 차트·표 최종 확인 ④ (선택) 5·6·9번 본인 세션 스크린샷. (0번 my_cafe.md 슬로건·분위기 보강은 ✅완료 — 가이드 형식 9항목 충족)

> **📂 폴더·저장소 구조 (중요 — 경로 바뀜)**
> - 작업 루트가 `loop-dev-setup` → **`Week5-1/`** 로 개명됨(`/Users/hwangseongjin/Desktop/Folder Docu/Week5-1/`).
> - `Week5-1/Week5/` — **별개 작업물**(budget-app·spending-analyst·memo-app·todos·kimchi-*·Goblin5·Homework5)을 같은 repo에 별도 폴더로 동거시킴(부트캠프 build/와 무관, 합치지 않음). 원래 `Folder Docu/Week5`였던 것을 repo 안으로 이동. `.env` 실제 키는 `**/.env`로 제외됨.

> **📌 이 문서 갱신 규칙 (다음 세션도 반드시 지킬 것)**
> 사용자 지침으로 **개발 중 마일스톤마다 이 문서를 계속 갱신**한다.
> 갱신 시점: ① 앱 하나 완성·검증 직후 ② 환경/제약 변화(새 프로젝트·키·배포 등) ③ 커밋·푸시할 때.
> 갱신 항목: 상단 날짜, `1. 진행 상황` 표, `6. 빠른 재개`(마지막 지점·즉시 명령), 주의사항. 갱신 후 커밋·푸시까지 한다.

## 0. 한눈에 보기
- **목표**: AI 공장장 부트캠프 3기 퀘스트(가계부~카페 대시보드 등)를 순서대로 개발. 계획은 `개발계획.md` 참조.
- **방식**: 폴더 안 `specs/<project>.spec.md`(완료기준 AC) + `docs/guide/<project>.md`(원문)를 기준으로, Claude가 builder(개발)+verifier(실제 실행 검증) 역할을 직접 수행. `harness/run-loop.sh`(자동 루프)는 아직 안 씀(직접 구현).
- **GitHub**: https://github.com/seongjinshinecity/0626_new_works (branch `main`). 중간중간 커밋·푸시.
- **언어**: 사용자와의 모든 설명은 **한국어**.

## 1. 진행 상황
| # | 프로젝트 | 상태 | 위치 |
| --- | --- | --- | --- |
| 1 | 가계부 앱 (Server+DB) | ✅ **완성·7 AC 검증 통과** | `build/gyebu-app/` |
| 2 | 커뮤니티 앱 (Auth) | ✅ **완성·RLS 권한 검증 통과** | `build/community-app/` |
| 3 | 쇼핑몰(결제제외) | ✅ **완성·검증 통과**(상품공개/장바구니RLS/합계, 브라우저 런타임 확인) | `build/shopping-mall/` |
| 4 | 카페 대시보드 (보스) | ✅ **완성·검증**(Auth+**MCP**+DB+날씨API+규칙기반 AI브리핑. 소스 3종=DB/날씨/MCP(cafe-ops 할일·발주). MCP 라운드트립+로컬 런타임 위젯 렌더 검증, Vercel 서버리스는 stdio spawn 불가→degrade) | `build/cafe-dashboard/` |
| 5 | 가계부 분석 에이전트 (Agent+DB) | ✅ **완성·검증**(Supabase MCP read-only + 페르소나, MCP round-trip + SQL검증 Q&A) | `build/gyebu-agent/` |
| 6 | 내 카페를 아는 AI 에이전트 (Context+Agent+DB) | ✅ **완성·검증**(my_cafe.md+cafe_sales 결합, Before/After 2쌍, 컨텍스트 로드 실증) | `build/my-cafe-agent/` |
| 7 | 자동 리서치 스킬 (Skill) | ✅ **완성·검증**(SKILL.md 박제, WebSearch/WebFetch 수집→고정 포맷. headless `claude -p` 재호출 2회로 트리거+재현성 실증, 탐색 스크린샷 4장) | `build/research-skill/` |
| 8 | 리뷰·경쟁 리포트 → 엑셀·PPT | ✅ **완성·검증**(VoC 엑셀 5시트+차트3개 / 경쟁 PPT 5슬라이드+비교표, 파일 객체 재오픈+Quick Look 렌더 검증. 전체 시트/슬라이드는 사용자가 Excel/PPT로 열어 확인) | `build/review-report/` |
| 9 | 인스타 인플루언서 (반자동) | 🟡 **프레임워크 완성 + 가상 데모 시연**(타겟/방법론/빈 템플릿/DM초안/계산기·보기보조 + `influencers.example.md`에 `@demo_*` 가공 5명으로 점수화→Top3 전체 시연). **실후보·수치는 사용자 본인 인스타 로그인 후 입력, 실존 @핸들 지어내기 금지** | `build/instagram-influencer/` |

- **배포(Vercel)**: ✅ **웹앱 4개(1~4번) 모두 Production 배포 완료**(빌드 Ready). 5·6번은 에이전트라 배포 대상 아님. `vercel whoami`=seongjinshinecity 인증됨. 각 프로젝트에 Supabase env(NEXT_PUBLIC_* + 1번은 service_role) 등록함.
  | 앱 | URL |
  | --- | --- |
  | 1 gyebu-app | https://gyebu-2k3ssf75y-seongjinshinecitys-projects.vercel.app |
  | 2 community-app | https://community-1r8n3d5qf-seongjinshinecitys-projects.vercel.app |
  | 3 shopping-mall | https://shopping-mall-qudpb6fx0-seongjinshinecitys-projects.vercel.app |
  | 4 cafe-dashboard | https://cafe-dashboard-45lp497pb-seongjinshinecitys-projects.vercel.app |
  - ⚠️ **Deployment Protection(Vercel Authentication/SSO)**이 켜져 있어 현재는 소유자 로그인 시에만 열림(타인 공개 X). 공개하려면 각 프로젝트 Settings → Deployment Protection → Vercel Authentication = **Disabled**. (접근 제어 변경이라 Claude가 직접 끄지 않음 — 사용자가 대시보드에서.)
  - ⚠️ **상태 정직 표기**: `● Ready`는 **빌드 컴파일 성공**이지 prod 런타임 동작 검증이 아님. SSO 때문에 현재 Claude가 런타임 확인 불가. (단 1번 gyebu는 `supabase.ts`가 env 없으면 빌드 throw → **빌드 Ready = env 빌드 반영 증명**. 4개 모두 동일 env 패턴.)
  - **Protection 해제 후 1줄 검증**(사용자): `curl -s <gyebu-url>/ | grep 가계부` → 200+내용이면 빌드→렌더→Supabase 연결 전체 체인 정상(gyebu는 로그인 없어 단독 검증 가능). 2·3·4번은 로그인 후 화면으로 확인.

## 2. Supabase 환경 (중요 제약)
무료 플랜 **활성 프로젝트 2개 한도** → **새 프로젝트 생성 불가**. 추가 앱은 기존 프로젝트에 테이블 추가로 공유한다.

| 프로젝트 | ref | 용도 / 주의 |
| --- | --- | --- |
| **Todos board** | `efyjbcnioxggrcamyxov` | 사용자 기존 앱. **절대 건드리지 말 것.** `db_schema=""`(REST 비활성) 상태이며 — 의도된 설정으로 **취급하고 복구하지 말 것**(사용자에게 확인받지는 않은 추정). `users`(password_hash 포함)/`todos` 테이블 있음, RLS 꺼져 있음 → REST 켜면 노출되므로 주의. |
| **gyebu-app** | `xzsmorkpaffkqzbrlhiw` | 1번 `transactions` + 2번 `posts` + 3번 `products`/`cart` + 4번 `cafe_sales` **공유 중**. autoconfirm(이메일 자동확인) **켜짐**. 추가 앱도 여기에 테이블 추가(cafe board는 안 깨우고 이 프로젝트 공유로 진행함). |
| **cafe board** | `fdlbxfgrhzmloxizdiwi` | 현재 INACTIVE(정지). 4번 카페 대시보드용으로 예약. |

- **키 위치**: 각 앱 `build/<app>/.env.local` (git 무시됨). 코드엔 키 하드코딩 없음.
- **관리 작업(테이블 생성/검증)**: Supabase Management API(`https://api.supabase.com/v1/...`)를 PAT로 호출. **PAT는 보안상 이 문서에 없음** → 필요 시 사용자에게 재요청(`sbp_...`, supabase.com/dashboard/account/tokens).
- **Supabase MCP**: 5번에서 설치함(`claude mcp add supabase --scope user ... --read-only --project-ref=<ref>`). user scope라 `~/.claude.json`(git 밖)에 저장 — PAT 인라인되지만 **커밋 대상 아님**. read-only. `claude mcp list`로 Connected 확인.
- **테이블 생성/SQL**: `POST /v1/projects/<ref>/database/query` with `{"query":"..."}`.
- ⚠️ `.env.sample`에 Todos board **실제 키(sb_secret 포함)**가 들어 있었음. **첫 커밋 전에 staging에서 제거**되어 **GitHub에는 도달하지 않았다**(git 이력 깨끗 → git 때문에 rotate 할 필요 없음). 단 이 키가 git 외 다른 경로로 유출된 적 있으면 그때만 rotate. 로컬 `.env.sample`은 사용자가 둔 상태 그대로(.gitignore로 추적 제외).

## 3. 앱별 핵심 메모
### 1번 gyebu-app
- Next 16 + React 19 + Tailwind v4. 서버 라우트(`/api/transactions`)에서 **service_role**로 접근(RLS 우회 OK — 단일 사용자 가계부).
- 테이블 `transactions(type,amount,category,memo,date,...)`, RLS on.

### 2번 community-app
- **service_role 절대 사용 안 함.** posts CRUD는 anon 키 + 로그인 세션(`@supabase/ssr`) → **RLS가 권한 강제**.
- RLS 정책 4종: select=공개, insert=인증+author_id=auth.uid(), update/delete=본인만. (A/B 토큰으로 차단 검증 완료)
- Next 16: `cookies()`는 async, 쿠키 인터페이스 `getAll/setAll`, 미들웨어는 **`src/proxy.ts`**(구 middleware deprecated).

## 4. 공통 기술 메모 (Next 16 함정)
- `create-next-app@latest` → **Next 16.2.9 / React 19**. 각 앱에 `AGENTS.md`가 "node_modules/next/dist/docs 읽어라" 경고.
- `params`/`searchParams`는 **Promise** → `await` 필요.
- 미들웨어 파일명 `middleware.ts` → **`proxy.ts`**, export 함수명 `proxy`.
- 빌드: `npm run build`. dev: `PORT=<n> npm run dev`. 검증 시 포트 3100(gyebu)/3200(community) 사용했음.
- 스크린샷: headless Chrome `--screenshot` 로 캡처(`/Applications/Google Chrome.app/.../Google Chrome --headless=new --screenshot=out.png <url>`).

## 5. 다음 할 일 (= 남은 사용자 작업)
> 9개 퀘스트 개발·검증은 모두 끝남. 아래는 Claude가 대신 할 수 없는(권한·로그인) 사용자 몫.
1. **9번 실데이터 입력**: 본인 인스타 로그인 → `build/instagram-influencer/assist_browse.py`로 해시태그 탐색 → `influencers.template.md`를 실제 @계정·수치로 채우기(`influencers.example.md` 가상 데모와 동일하게 동작). DM은 `dm-drafts.md` 개인화해 **사람이 직접** 발송.
2. **Vercel 공개**: 1~4번 각 프로젝트 Settings → Deployment Protection → Vercel Authentication = **Disabled** (접근 제어라 Claude가 직접 안 함).
3. **8번 최종 확인**: `build/review-report/out/voc_analysis.xlsx`·`competitor_analysis.pptx`를 Excel/PowerPoint로 열어 차트·비교표 렌더 확인.

> **배치2 메모**: 앱이 아니라 "에이전트". 산출물 = 페르소나(`.claude/agents/`) + MCP 연결 + **SQL검증 Q&A(`DEMO.md`)**. 검증 = 답의 모든 수치를 독립 SQL로 대조(순환검증 회피) + 조언이 실제 데이터 패턴 인용(맞춤성). 대화 스크린샷은 사용자 claude 세션 캡처 필요(자동 불가, DEMO transcript로 대체).

## 6. 빠른 재개 (지금 이어서 하려면)
**마지막 작업 지점**: **0~9번 전부 완료 + 4번 MCP 보강까지 끝(최신 `d86c1ec`).** 개발 측 할 일 없음 — 남은 건 섹션5의 사용자 작업뿐. 최근 추가 메모: **4번에 MCP 3번째 소스**(`build/cafe-dashboard/mcp-server/cafe-ops-server.mjs` stdio + `src/lib/mcp-ops.ts` 클라이언트) — 성공/ degrade 경로 둘 다 로컬 런타임 스크린샷 검증(`dashboard-mcp.png`/`dashboard-mcp-degraded.png`), Vercel 서버리스는 spawn 불가. 배치3 검증 방식: 7번=스킬 재현성(`claude -p` 재호출), 8번=파일 객체 재오픈+Quick Look, 9번=가상 데모(`influencers.example.md`, 실데이터는 사용자). 2·3번 가입/글쓰기·담기/합계 스크린샷 보강됨. (dev 서버 3100~3400 떠 있을 수 있음 — 포트별 `lsof -ti:<port> | xargs kill -9`로 정리.)
> **에이전트 패턴 재사용**: 5·6번 산출물 = 페르소나(`.claude/agents/`) + (5번)MCP/(6번)Read+MCP + DEMO(SQL검증 / Before·After). 새 에이전트도 이 틀.

**개발 환경 재기동 명령** (작업 루트: `loop-dev-setup/`):
```bash
cd build/gyebu-app     && npm install && PORT=3100 npm run dev  # 1번 가계부     http://localhost:3100
cd build/community-app && npm install && PORT=3200 npm run dev  # 2번 커뮤니티   http://localhost:3200
cd build/shopping-mall && npm install && PORT=3300 npm run dev  # 3번 쇼핑몰     http://localhost:3300
cd build/cafe-dashboard && npm install && PORT=3400 npm run dev # 4번 카페대시보드 http://localhost:3400
```
> 로그인 필수 페이지(2번 글쓰기, 3번 장바구니, 4번 대시보드 전체) 스크린샷은 headless 단순캡처 불가 → `playwright-core`(임시 devDep) 스크립트로 로그인 후 캡처했다(캡처 후 제거함).
> 각 앱 `.env.local`은 git에 없음 — 새 환경이면 Supabase 키를 다시 채워야 함(키는 `2. Supabase 환경`의 ref로 `supabase projects api-keys --project-ref <ref>` 또는 사용자에게 요청).

**검증 재현 요령**:
- 가계부: dev 기동 후 `curl -X POST localhost:3100/api/transactions -H 'Content-Type: application/json' -d '{...}'` → DB는 Management API `database/query`로 확인.
- 커뮤니티: Auth REST(`/auth/v1/signup`, `/auth/v1/token?grant_type=password`)로 사용자 A·B 토큰 발급 → `/rest/v1/posts` INSERT/PATCH/DELETE로 RLS 차단 확인. 앱 자체는 브라우저로 가입→글쓰기.

**미해결/대기**:
- Vercel 배포: ✅ 1~4번 완료(URL은 섹션2). 재배포는 각 앱 폴더에서 `vercel deploy --prod --yes`(`.vercel/`로 연결됨, env 등록 완료). 공개하려면 사용자가 Deployment Protection 해제.
- dev 서버 2개가 백그라운드로 떠 있을 수 있음(`lsof -ti:3100,:3200`).

**진행 중 데모 데이터**: gyebu `transactions` **204행으로 재seed**(2026-03~06 4개월, 분석 에이전트용 — 월 지출 47~52건+급여, 날짜 동적), community `posts` 2행, shopping `products` 10행 + `cart`, cafe `cafe_sales` 63행 — 데모용, 필요시 정리 가능. (1번 가계부 화면은 이제 204건을 보여줌 — 기존 4행 데모는 재seed로 대체됨, 커밋된 스크린샷 PNG는 그대로.)
