# SPEC — [Auth] 커뮤니티 앱

> 완료의 정의(Definition of Done). verifier는 아래 AC를 **전부** 실제 실행으로 검증한다.
> 출처 가이드: `docs/guide/community-app.md` (커리큘럼 원문의 미션/핵심구조/제출물)

## 스택
- 프런트/서버: Next.js (App Router) + React + TypeScript
- 인증/DB: Supabase Auth (이메일+비밀번호) + Postgres
- 세션: `@supabase/ssr` (쿠키 기반, 서버/클라이언트 공유) + middleware 세션 갱신
- 환경변수: `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- 빌드/기동: `npm install` → `npm run build` → `npm run dev`

## 데이터 모델 (Supabase `posts` 테이블)
| 컬럼 | 타입 | 비고 |
| --- | --- | --- |
| id | uuid (PK, default gen_random_uuid()) | |
| title | text not null | 제목 |
| content | text not null | 내용 |
| author_id | uuid not null default auth.uid() | `auth.users.id` 참조 (작성자) |
| author_email | text | 목록 표시용 (작성 시점 이메일) |
| created_at | timestamptz default now() | |

## RLS 정책 (핵심 — 권한을 DB에서 강제)
- **SELECT**: 누구나(anon 포함) 모든 글 조회 가능 (공개 게시판)
- **INSERT**: 인증 사용자만(`auth.role() = 'authenticated'`), 그리고 `author_id = auth.uid()` 강제
- **UPDATE / DELETE**: 작성자 본인만(`author_id = auth.uid()`)

## 인수기준 (Acceptance Criteria)

- [ ] **AC1 (빌드)** `npm install && npm run build` 가 exit 0. 개발서버가 에러 없이 기동.
- [ ] **AC2 (회원가입/로그인)** 이메일+비밀번호로 회원가입 및 로그인이 동작한다.
      - 검증: Supabase Auth API(또는 UI 플로우)로 신규 가입 → 로그인 → 액세스 토큰(JWT) 발급 확인. `auth.users`에 사용자 행 존재.
- [ ] **AC3 (글 작성=로그인 필수)** 로그인 사용자만 제목+내용으로 글을 작성할 수 있고, `author_id`가 본인으로 저장된다.
      - 검증: 사용자A 토큰으로 INSERT → 성공 + `posts`에 행 존재(author_id=A). **비로그인(anon) INSERT → RLS로 거부**(0행/권한오류).
- [ ] **AC4 (목록/상세 조회=공개)** 모든 방문자가 글 목록을 최신순(제목·작성자·작성시간)으로 보고, 항목 클릭 시 상세를 본다.
      - 검증: anon 키로 SELECT → 등록된 글이 최신순으로 조회됨. 상세 라우트(`/posts/[id]`)가 해당 글을 표시.
- [ ] **AC5 (수정/삭제=본인만)** 작성자 본인만 자기 글을 수정/삭제할 수 있다. 타인 글 수정/삭제는 거부된다.
      - 검증: 사용자B 토큰으로 A의 글 UPDATE/DELETE 시도 → **RLS로 거부(0행 영향)**. 사용자A 토큰으로 본인 글 UPDATE → 성공.
- [ ] **AC6 (DB/RLS 영속성)** posts 테이블에 RLS가 켜져 있고 위 정책이 적용된다. 서버 재기동 후에도 데이터 유지(Supabase 저장).
      - 검증: `pg_class.relrowsecurity = true`, 정책 4종 존재. 재기동 후 목록 그대로.
- [ ] **AC7 (제출물)** `README.md`에 실행 방법·필요 env 키·Auth 설정이 적혀 있다. 동작 스크린샷 경로 `docs/screenshots/` 존재(최소 1장: 목록 또는 글쓰기 화면). 배포(Vercel)는 보너스(범위 밖, 여유 시).

## verifier 검증 방법(요약)
1. `npm run build` exit 0 (AC1)
2. Supabase Auth REST(`/auth/v1/signup`, `/auth/v1/token?grant_type=password`)로 사용자 A·B 생성 + 토큰 확보 (AC2)
3. A 토큰으로 `/rest/v1/posts` INSERT → 201 + 행 확인 / anon INSERT → 4xx (AC3)
4. anon 으로 `/rest/v1/posts?order=created_at.desc` SELECT → 목록 확인 (AC4)
5. B 토큰으로 A의 글 PATCH/DELETE → 0행(거부) / A 토큰으로 본인 글 PATCH → 성공 (AC5)
6. Management API로 RLS·정책 존재 확인, 재기동 후 SELECT 유지 (AC6)
7. `README.md`·스크린샷 디렉터리 존재 확인 (AC7)

## 범위 밖 (하지 말 것)
- 댓글, 좋아요, 이미지 업로드, 소셜 로그인, 비밀번호 재설정 메일(가이드 핵심 아님).
- 디자인 과투자 금지 — Auth + CRUD + 권한 분기에 집중.
- Vercel 배포는 보너스(별도 요청 시 진행).
