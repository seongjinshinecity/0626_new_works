export const CATEGORIES = [
  "식비",
  "교통",
  "주거",
  "구독료",
  "경조사",
  "문화",
  "의료",
  "기타",
] as const;

export type TxType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  memo: string | null;
  date: string;
  created_at: string;
};

export function summarize(transactions: Transaction[]) {
  const categoryTotals: Record<string, number> = {};
  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions) {
    const amt = Number(t.amount);
    if (t.type === "expense") {
      totalExpense += amt;
      categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + amt;
    } else {
      totalIncome += amt;
    }
  }
  return {
    categoryTotals,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
