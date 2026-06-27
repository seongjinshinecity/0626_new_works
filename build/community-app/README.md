# 📋 커뮤니티 앱 (Auth)

> 🔗 **배포**: https://community-1r8n3d5qf-seongjinshinecitys-projects.vercel.app (Vercel, Production)
> ⚠️ Vercel **Deployment Protection(SSO)**이 켜져 있어 소유자만 접근됩니다. "타인이 실제 가입·글쓰기"(가이드 제출물)를 하려면 Settings → Deployment Protection → Vercel Authentication 을 **Disabled**로 변경하세요.

로그인한 사용자만 글을 쓰고, **자기 글만 수정/삭제**하는 공개 게시판입니다.
권한은 앱 코드가 아니라 **Supabase RLS(Row Level Security)** 가 DB 레벨에서 강제합니다.

- 스택: **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4**
- 인증/DB: **Supabase Auth(이메일+비밀번호) + Postgres**
- 세션: `@supabase/ssr` (쿠키 기반) + `src/proxy.ts`(Next 16 미들웨어 후속) 세션 갱신
- 출처 스펙: `../../specs/community-app.spec.md`

## 기능

| 기능 | 권한 |
| --- | --- |
| 회원가입 / 로그인 / 로그아웃 | 누구나 |
| 글 목록 조회 (최신순, 작성자·시간) | **공개** (비로그인 포함) |
| 글 상세 보기 | 공개 |
| 글 작성 | **로그인 사용자만** |
| 글 수정 / 삭제 | **작성자 본인만** |

## 보안 설계 (중요)

이 앱은 `service_role` 키를 **사용하지 않습니다.** 모든 `posts` 접근은 anon 키 + 로그인 세션(JWT)을 통하며,
아래 RLS 정책이 권한을 강제합니다. 따라서 클라이언트가 보낸 `author_id`를 신뢰하지 않아도 안전합니다.

| 정책 | 동작 |
| --- | --- |
| `posts_select_all` (SELECT) | 누구나 조회 |
| `posts_insert_auth` (INSERT) | 인증 사용자 + `author_id = auth.uid()` |
| `posts_update_own` (UPDATE) | 작성자 본인만 |
| `posts_delete_own` (DELETE) | 작성자 본인만 |

## 실행 방법

```bash
npm install
# .env.local 에 아래 키 설정 (Supabase 대시보드 > Project Settings > API)
npm run dev          # http://localhost:3000
npm run build && npm start   # 프로덕션
```

### 필요한 환경변수 (`.env.local`)

| 키 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public 키 (이 앱은 이 키만 사용) |

### Supabase 설정

1. **이메일 자동확인(autoconfirm) 켜기** — Auth > Providers > Email > "Confirm email" 끄기.
   (SMTP 미설정 시 이게 꺼져 있으면 가입 후 로그인이 막힙니다.)
2. `posts` 테이블 + RLS 정책 4종 생성 (아래 스키마 참조).

## DB 스키마 (`posts`)

```sql
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_email text,
  created_at timestamptz not null default now()
);
alter table public.posts enable row level security;
create policy posts_select_all on public.posts for select using (true);
create policy posts_insert_auth on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy posts_update_own on public.posts for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy posts_delete_own on public.posts for delete to authenticated using (author_id = auth.uid());
```

## 폴더 구조

```
src/
├─ proxy.ts                      # Next 16 세션 갱신 (구 middleware)
├─ app/
│  ├─ page.tsx                   # 글 목록 (공개)
│  ├─ login/page.tsx             # 로그인/회원가입
│  ├─ posts/new/page.tsx         # 글쓰기 (로그인 필수)
│  ├─ posts/[id]/page.tsx        # 상세 + 본인이면 수정/삭제
│  ├─ posts/[id]/edit/page.tsx   # 수정 (본인만)
│  └─ actions.ts                 # 서버 액션: 인증 + 글 CRUD
└─ lib/
   ├─ supabase/{client,server,middleware}.ts  # SSR 클라이언트
   └─ types.ts
```

## 스크린샷

`docs/screenshots/` 폴더 참고.
