import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { summarize, type Transaction } from "@/lib/categories";

export const dynamic = "force-dynamic";

// GET /api/transactions — 최신순 목록 + 카테고리별 합계
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const transactions = (data ?? []) as Transaction[];
  return NextResponse.json({ transactions, ...summarize(transactions) });
}

// POST /api/transactions — 수입/지출 1건 등록 (입력 검증 포함)
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "요청 본문이 올바른 JSON이 아닙니다." },
      { status: 400 },
    );
  }

  const { type, amount, category, memo, date } = body ?? {};

  // ── 입력 검증 (AC6) ──
  if (type !== "income" && type !== "expense") {
    return NextResponse.json(
      { error: "유형(type)은 'income' 또는 'expense'여야 합니다." },
      { status: 400 },
    );
  }
  if (amount === undefined || amount === null || amount === "") {
    return NextResponse.json({ error: "금액을 입력하세요." }, { status: 400 });
  }
  const amt = Number(amount);
  if (Number.isNaN(amt)) {
    return NextResponse.json(
      { error: "금액은 숫자여야 합니다." },
      { status: 400 },
    );
  }
  if (amt < 0) {
    return NextResponse.json(
      { error: "금액은 0 이상이어야 합니다." },
      { status: 400 },
    );
  }
  if (
    category === undefined ||
    category === null ||
    String(category).trim() === ""
  ) {
    return NextResponse.json(
      { error: "카테고리를 선택하세요." },
      { status: 400 },
    );
  }
  if (date === undefined || date === null || String(date).trim() === "") {
    return NextResponse.json({ error: "날짜를 입력하세요." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("transactions")
    .insert({
      type,
      amount: amt,
      category: String(category).trim(),
      memo: memo ? String(memo) : null,
      date: String(date),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ transaction: data }, { status: 201 });
}
