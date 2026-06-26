import Link from "next/link";
import { signIn, signUp } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-5 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">로그인 / 회원가입</h1>
        <Link href="/" className="text-sm text-black/50 hover:underline dark:text-white/50">
          ← 목록
        </Link>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/40">
          {error}
        </p>
      )}

      <form className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          이메일
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded-lg border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          비밀번호 (6자 이상)
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete="current-password"
            className="rounded-lg border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
          />
        </label>

        <div className="mt-1 flex gap-2">
          <button
            formAction={signIn}
            className="flex-1 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background"
          >
            로그인
          </button>
          <button
            formAction={signUp}
            className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold dark:border-white/20"
          >
            회원가입
          </button>
        </div>
      </form>
    </main>
  );
}
