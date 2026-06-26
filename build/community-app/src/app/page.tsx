import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, type Post } from "@/lib/types";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  const posts = (data ?? []) as Post[];

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📋 커뮤니티</h1>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-black/60 dark:text-white/60">
                {user.email}
              </span>
              <Link
                href="/posts/new"
                className="rounded-lg bg-foreground px-3 py-1.5 font-semibold text-background"
              >
                글쓰기
              </Link>
              <form action={signOut}>
                <button className="rounded-lg border border-black/15 px-3 py-1.5 dark:border-white/20">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-foreground px-3 py-1.5 font-semibold text-background"
            >
              로그인
            </Link>
          )}
        </div>
      </header>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/40">
          글을 불러오지 못했습니다: {error.message}
        </p>
      )}

      <section className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
        {posts.length === 0 ? (
          <p className="py-8 text-center text-sm text-black/50 dark:text-white/50">
            아직 글이 없습니다. {user ? "첫 글을 써보세요!" : "로그인 후 글을 써보세요."}
          </p>
        ) : (
          posts.map((p) => (
            <Link
              key={p.id}
              href={`/posts/${p.id}`}
              className="flex flex-col gap-1 py-4 transition hover:opacity-70"
            >
              <h2 className="font-semibold">{p.title}</h2>
              <div className="flex gap-2 text-xs text-black/50 dark:text-white/50">
                <span>{p.author_email ?? "익명"}</span>
                <span>·</span>
                <span>{formatDate(p.created_at)}</span>
              </div>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
