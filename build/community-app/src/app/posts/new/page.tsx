import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "../../actions";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // 로그인 필수 (AC3)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("글쓰기는 로그인이 필요합니다."));
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">글쓰기</h1>
        <Link href="/" className="text-sm text-black/50 hover:underline dark:text-white/50">
          ← 목록
        </Link>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/40">
          {error}
        </p>
      )}

      <form action={createPost} className="flex flex-col gap-3">
        <input
          type="text"
          name="title"
          placeholder="제목"
          required
          className="rounded-lg border border-black/15 bg-transparent px-3 py-2 text-lg font-semibold dark:border-white/20"
        />
        <textarea
          name="content"
          placeholder="내용을 입력하세요"
          required
          rows={10}
          className="rounded-lg border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
        />
        <button className="self-end rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background">
          등록
        </button>
      </form>
    </main>
  );
}
