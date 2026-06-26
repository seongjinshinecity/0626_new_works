"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ── 인증 ──────────────────────────────────────────────

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("이메일과 비밀번호를 입력하세요."));
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }
  // autoconfirm 이 켜져 있어 가입 즉시 로그인 가능
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    redirect("/login?error=" + encodeURIComponent(signInError.message));
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ── 게시글 CRUD ───────────────────────────────────────

export async function createPost(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("로그인이 필요합니다."));
  }
  if (!title || !content) {
    redirect("/posts/new?error=" + encodeURIComponent("제목과 내용을 모두 입력하세요."));
  }

  // RLS(insert: author_id = auth.uid())가 권한을 강제한다.
  const { error } = await supabase.from("posts").insert({
    title,
    content,
    author_id: user.id,
    author_email: user.email,
  });
  if (error) {
    redirect("/posts/new?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/");
  redirect("/");
}

export async function updatePost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("로그인이 필요합니다."));
  }
  if (!title || !content) {
    redirect(`/posts/${id}/edit?error=` + encodeURIComponent("제목과 내용을 모두 입력하세요."));
  }

  // RLS(update: 본인 글만)가 타인 글 수정을 막는다.
  const { error } = await supabase
    .from("posts")
    .update({ title, content })
    .eq("id", id);
  if (error) {
    redirect(`/posts/${id}/edit?error=` + encodeURIComponent(error.message));
  }
  revalidatePath(`/posts/${id}`);
  revalidatePath("/");
  redirect(`/posts/${id}`);
}

export async function deletePost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("로그인이 필요합니다."));
  }
  // RLS(delete: 본인 글만)가 타인 글 삭제를 막는다.
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/");
  redirect("/");
}
