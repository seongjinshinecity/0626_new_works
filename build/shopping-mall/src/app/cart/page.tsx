import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { won, type CartRow } from "@/lib/types";
import { removeFromCart, updateQuantity } from "../actions";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?error=" + encodeURIComponent("장바구니는 로그인이 필요합니다."));
  }

  // RLS(select: 본인만)로 자동으로 내 장바구니만 조회된다.
  const { data } = await supabase
    .from("cart")
    .select("id, user_id, product_id, quantity, products(id,name,price,image_url,description)")
    .order("created_at", { ascending: true });
  const items = (data ?? []) as unknown as CartRow[];

  const total = items.reduce(
    (sum, it) => sum + (it.products?.price ?? 0) * it.quantity,
    0,
  );

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🛒 장바구니</h1>
        <Link href="/" className="text-sm text-black/50 hover:underline dark:text-white/50">
          ← 쇼핑 계속하기
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-black/50 dark:text-white/50">
          장바구니가 비어 있습니다.
        </p>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 py-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.products?.image_url ?? ""}
                  alt={it.products?.name ?? ""}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{it.products?.name}</div>
                  <div className="text-sm text-black/50 dark:text-white/50">
                    {won(it.products?.price ?? 0)}
                  </div>
                </div>

                {/* 수량 +/- */}
                <div className="flex items-center gap-2">
                  <form action={updateQuantity}>
                    <input type="hidden" name="id" value={it.id} />
                    <input type="hidden" name="delta" value={-1} />
                    <button className="h-7 w-7 rounded-md border border-black/15 dark:border-white/20">−</button>
                  </form>
                  <span className="w-6 text-center text-sm font-semibold">{it.quantity}</span>
                  <form action={updateQuantity}>
                    <input type="hidden" name="id" value={it.id} />
                    <input type="hidden" name="delta" value={1} />
                    <button className="h-7 w-7 rounded-md border border-black/15 dark:border-white/20">+</button>
                  </form>
                </div>

                <div className="w-24 text-right font-bold">
                  {won((it.products?.price ?? 0) * it.quantity)}
                </div>

                <form action={removeFromCart}>
                  <input type="hidden" name="id" value={it.id} />
                  <button className="text-sm text-rose-600 hover:underline">삭제</button>
                </form>
              </li>
            ))}
          </ul>

          {/* 합계 (AC6) */}
          <div className="flex items-center justify-between border-t-2 border-black/10 pt-4 dark:border-white/10">
            <span className="text-lg font-semibold">총 금액</span>
            <span className="text-xl font-bold">{won(total)}</span>
          </div>

          {/* 결제 제외 — 주문하기는 준비 중 */}
          <button
            disabled
            title="결제 기능은 준비 중입니다"
            className="cursor-not-allowed rounded-lg bg-foreground/40 px-4 py-3 font-semibold text-background"
          >
            주문하기 (준비 중)
          </button>
        </>
      )}
    </main>
  );
}
