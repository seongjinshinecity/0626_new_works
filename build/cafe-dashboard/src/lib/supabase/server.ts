import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버(서버 컴포넌트/액션/라우트)용 Supabase 클라이언트.
// Next 16: cookies() 는 async. 쿠키 인터페이스는 getAll/setAll 사용.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component 에서 호출되면 set 이 막히는데,
            // 세션 갱신은 middleware 가 처리하므로 무시해도 안전하다.
          }
        },
      },
    },
  );
}
