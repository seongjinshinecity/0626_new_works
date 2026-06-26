"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, type TxType } from "@/lib/categories";

function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function TransactionForm() {
  const router = useRouter();
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount, category, memo, date }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "등록에 실패했습니다.");
        return;
      }
      // 성공 → 폼 초기화 + 목록 새로고침
      setAmount("");
      setMemo("");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900"
    >
      <h2 className="text-lg font-semibold">내역 등록</h2>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
            type === "expense"
              ? "border-rose-500 bg-rose-500 text-white"
              : "border-black/15 dark:border-white/20"
          }`}
        >
          지출
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
            type === "income"
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-black/15 dark:border-white/20"
          }`}
        >
          수입
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        금액
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="rounded-lg border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        카테고리
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="text-black">
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        날짜
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        메모 (선택)
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 점심 김밥"
          className="rounded-lg border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
        />
      </label>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background disabled:opacity-50"
      >
        {submitting ? "등록 중…" : "등록하기"}
      </button>
    </form>
  );
}
