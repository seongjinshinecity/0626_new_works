import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, type Post } from "@/lib/types";
import { deletePost } from "../../actions";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const post = data as Post | null;
  if (!post) notFound();

  const isOwner = user?.id === post.author_id;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-10">
      <Link href="/" className="text-sm text-black/50 hover:underline dark:text-white/50">
        ← 목록
      </Link>

      <article className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <div className="flex gap-2 text-xs text-black/50 dark:text-white/50">
          <span>{post.author_email ?? "익명"}</span>
          <span>·</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </article>

      {/* 본인 글만 수정/삭제 (AC5) */}
      {isOwner && (
        <div className="flex gap-2 border-t border-black/10 pt-4 dark:border-white/10">
          <Link
            href={`/posts/${post.id}/edit`}
            className="rounded-lg border border-black/15 px-3 py-1.5 text-sm dark:border-white/20"
          >
            수정
          </Link>
          <form action={deletePost}>
            <input type="hidden" name="id" value={post.id} />
            <button className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-600 dark:border-rose-900">
              삭제
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
