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
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
  if (e2) redirect("/login?error=" + encodeURIComponent(e2.message));
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ── 장바구니 ───────────────────────────────────────────
export async function addToCart(formData: FormData) {
  const productId = String(formData.get("product_id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // 담기는 로그인 필수 (AC4)
    redirect("/login?error=" + encodeURIComponent("장바구니 담기는 로그인이 필요합니다."));
  }

  // 이미 담긴 상품이면 수량 +1, 아니면 새로 추가. RLS(user_id=auth.uid())가 강제.
  const { data: existing } = await supabase
    .from("cart")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("cart")
      .insert({ user_id: user.id, product_id: productId, quantity: 1 });
  }
  revalidatePath("/cart");
  revalidatePath("/");
  redirect("/cart");
}

export async function updateQuantity(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const delta = Number(formData.get("delta") ?? 0);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("cart")
    .select("id, quantity")
    .eq("id", id)
    .maybeSingle();
  if (!row) redirect("/cart");

  const next = row.quantity + delta;
  if (next <= 0) {
    // 0 이하가 되면 삭제
    await supabase.from("cart").delete().eq("id", id);
  } else {
    await supabase.from("cart").update({ quantity: next }).eq("id", id);
  }
  revalidatePath("/cart");
}

export async function removeFromCart(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("cart").delete().eq("id", id);
  revalidatePath("/cart");
}
