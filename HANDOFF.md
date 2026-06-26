# 핸드오프 문서 (작업 인계 / 컨텍스트 초기화 대비)

> 최종 업데이트: 2026-06-26. 이 문서는 세션이 새로 시작돼도 작업을 이어갈 수 있도록 현재 상태를 정리한다.

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
| 3 | 쇼핑몰(결제제외) | ⬜ 미착수 (스펙도 미작성) | — |
| 4 | 카페 대시보드 (보스) | ⬜ 미착수 | — |
| 5~9 | 배치 2·3 (분석 에이전트/문서/자동화) | ⬜ 미착수 | — |

- **배포(Vercel)**: 1·2번 모두 **미배포**. 사용자 Vercel 구글 로그인이 막힘. `deploy_to_vercel` MCP는 직접 배포 못 하고 CLI를 가리킴 → **Vercel 토큰 방식 대기 중**(vercel.com/account/tokens 발급 → `vercel deploy --token`). 배포 시 Supabase env를 Vercel 프로젝트에 등록 필요.

## 2. Supabase 환경 (중요 제약)
무료 플랜 **활성 프로젝트 2개 한도** → **새 프로젝트 생성 불가**. 추가 앱은 기존 프로젝트에 테이블 추가로 공유한다.

| 프로젝트 | ref | 용도 / 주의 |
| --- | --- | --- |
| **Todos board** | `efyjbcnioxggrcamyxov` | 사용자 기존 앱. **절대 건드리지 말 것.** `db_schema=""`(REST 비활성) 상태이며 — 의도된 설정으로 **취급하고 복구하지 말 것**(사용자에게 확인받지는 않은 추정). `users`(password_hash 포함)/`todos` 테이블 있음, RLS 꺼져 있음 → REST 켜면 노출되므로 주의. |
| **gyebu-app** | `xzsmorkpaffkqzbrlhiw` | 1번 `transactions` + 2번 `posts` **공유 중**. autoconfirm(이메일 자동확인) **켜짐**. 추가 앱도 여기에 테이블 추가. |
| **cafe board** | `fdlbxfgrhzmloxizdiwi` | 현재 INACTIVE(정지). 4번 카페 대시보드용으로 예약. |

- **키 위치**: 각 앱 `build/<app>/.env.local` (git 무시됨). 코드엔 키 하드코딩 없음.
- **관리 작업(테이블 생성/검증)**: Supabase Management API(`https://api.supabase.com/v1/...`)를 PAT로 호출. **PAT는 보안상 이 문서에 없음** → 필요 시 사용자에게 재요청(`sbp_...`, supabase.com/dashboard/account/tokens).
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

## 5. 다음 할 일 (추천 순서)
1. (선택) 1·2번 Vercel 배포 — 토큰 받으면.
2. **3번 쇼핑몰**: `docs/guide/shopping-mall.md` 읽고 `specs/shopping-mall.spec.md` 작성 → gyebu-app 프로젝트에 테이블 추가 → 구현·검증.
3. **4번 카페 대시보드(보스)**: cafe board 프로젝트 깨워 사용 고려. MCP+AI 포함, 스펙 큼.
4. 각 단계마다 커밋·푸시.
