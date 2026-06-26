import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { won, type Product } from "@/lib/types";
import { addToCart, signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  const products = (data ?? []) as Product[];

  // 로그인 시 장바구니 담긴 개수(뱃지용)
  let cartCount = 0;
  if (user) {
    const { count } = await supabase
      .from("cart")
      .select("id", { count: "exact", head: true });
    cartCount = count ?? 0;
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🛍️ 마켓</h1>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/cart" className="rounded-lg bg-foreground px-3 py-1.5 font-semibold text-background">
                장바구니{cartCount > 0 ? ` (${cartCount})` : ""}
              </Link>
              <span className="hidden text-black/60 sm:inline dark:text-white/60">{user.email}</span>
              <form action={signOut}>
                <button className="rounded-lg border border-black/15 px-3 py-1.5 dark:border-white/20">로그아웃</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-lg bg-foreground px-3 py-1.5 font-semibold text-background">
              로그인
            </Link>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex flex-col overflow-hidden rounded-xl border border-black/10 dark:border-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image_url ?? ""}
              alt={p.name}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="flex flex-1 flex-col gap-1 p-3">
              <h2 className="font-semibold">{p.name}</h2>
              <p className="line-clamp-2 text-xs text-black/50 dark:text-white/50">
                {p.description}
              </p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="font-bold">{won(p.price)}</span>
                <form action={addToCart}>
                  <input type="hidden" name="product_id" value={p.id} />
                  <button className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
                    담기
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
