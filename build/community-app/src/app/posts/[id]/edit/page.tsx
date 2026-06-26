import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Post } from "@/lib/types";
import { updatePost } from "../../../actions";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("로그인이 필요합니다."));
  }

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const post = data as Post | null;
  if (!post) notFound();

  // 본인 글이 아니면 상세로 돌려보낸다 (DB는 RLS로도 막힘)
  if (post.author_id !== user.id) {
    redirect(`/posts/${id}`);
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">글 수정</h1>
        <Link
          href={`/posts/${id}`}
          className="text-sm text-black/50 hover:underline dark:text-white/50"
        >
          ← 취소
        </Link>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/40">
          {error}
        </p>
      )}

      <form action={updatePost} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={post.id} />
        <input
          type="text"
          name="title"
          defaultValue={post.title}
          required
          className="rounded-lg border border-black/15 bg-transparent px-3 py-2 text-lg font-semibold dark:border-white/20"
        />
        <textarea
          name="content"
          defaultValue={post.content}
          required
          rows={10}
          className="rounded-lg border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
        />
        <button className="self-end rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background">
          저장
        </button>
      </form>
    </main>
  );
}
