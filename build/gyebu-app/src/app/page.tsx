import { supabaseAdmin } from "@/lib/supabase";
import { summarize, type Transaction } from "@/lib/categories";
import { TransactionForm } from "./transaction-form";

export const dynamic = "force-dynamic";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export default async function Home() {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  const transactions = (data ?? []) as Transaction[];
  const { categoryTotals, totalIncome, totalExpense, balance } =
    summarize(transactions);
  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-10">
      <header>
        <h1 className="text-2xl font-bold">💰 가계부</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          수입·지출을 기록하고 카테고리별 합계를 확인하세요.
        </p>
      </header>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/40">
          데이터를 불러오지 못했습니다: {error.message}
        </p>
      )}

      {/* 요약 카드 */}
      <section className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <div className="text-xs text-black/50 dark:text-white/50">총 수입</div>
          <div className="mt-1 text-lg font-bold text-emerald-600">
            {won(totalIncome)}
          </div>
        </div>
        <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <div className="text-xs text-black/50 dark:text-white/50">총 지출</div>
          <div className="mt-1 text-lg font-bold text-rose-600">
            {won(totalExpense)}
          </div>
        </div>
        <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <div className="text-xs text-black/50 dark:text-white/50">잔액</div>
          <div className="mt-1 text-lg font-bold">{won(balance)}</div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        {/* 등록 폼 */}
        <TransactionForm />

        <div className="flex flex-col gap-6">
          {/* 카테고리별 지출 합계 (AC4) */}
          <section className="rounded-xl border border-black/10 p-5 dark:border-white/10">
            <h2 className="mb-3 text-lg font-semibold">카테고리별 지출 합계</h2>
            {sortedCategories.length === 0 ? (
              <p className="text-sm text-black/50 dark:text-white/50">
                아직 지출 내역이 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {sortedCategories.map(([cat, total]) => (
                  <li
                    key={cat}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{cat}</span>
                    <span className="font-semibold">{won(total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 내역 목록 (AC3) */}
          <section className="rounded-xl border border-black/10 p-5 dark:border-white/10">
            <h2 className="mb-3 text-lg font-semibold">
              전체 내역 ({transactions.length}건)
            </h2>
            {transactions.length === 0 ? (
              <p className="text-sm text-black/50 dark:text-white/50">
                첫 내역을 등록해 보세요.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
                {transactions.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                            t.type === "income"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950/50"
                          }`}
                        >
                          {t.type === "income" ? "수입" : "지출"}
                        </span>
                        <span className="text-sm font-medium">{t.category}</span>
                      </div>
                      <div className="truncate text-xs text-black/50 dark:text-white/50">
                        {t.date}
                        {t.memo ? ` · ${t.memo}` : ""}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-semibold ${
                        t.type === "income"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {won(Number(t.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
