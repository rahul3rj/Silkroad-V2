"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    // Check role for redirect
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;

    const adminDest = role === "ADMIN" || role === "SUPER_ADMIN";
    router.push(adminDest ? "/admin" : callbackUrl === "/login" ? "/" : callbackUrl);
    router.refresh();
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/" });
  const handleApple = () => signIn("apple", { callbackUrl: "/" });

  return (
    <main className="min-h-screen bg-white pt-20 pb-24">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <Link
          href="/"
          className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors duration-200"
        >
          Silkroad
        </Link>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">
          Sign In
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-12">
        <h1 className="font-[metropolis] text-[28px] md:text-[32px] tracking-[-0.01em] text-black mb-8">
          Sign In
        </h1>

        {/* ── Social SSO ── */}
        <div className="space-y-3 mb-8 max-w-2xl">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-4 border border-black/15 rounded-full font-[metropolis] text-[13px] text-black tracking-wide hover:border-black/40 hover:bg-black/[0.02] transition-all duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
          <button
            onClick={handleApple}
            className="w-full flex items-center justify-center gap-3 py-4 border border-black/15 rounded-full font-[metropolis] text-[13px] text-black tracking-wide hover:border-black/40 hover:bg-black/[0.02] transition-all duration-300"
          >
            <svg width="17" height="20" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-157.2-108.7C46.7 742.7 0 661.1 0 580.4c0-171.2 111.4-261.5 220.8-261.5 55.1 0 100.9 36.3 135.7 36.3 33.1 0 84.9-38.4 147.2-38.4 23.7 0 108.2 2.6 166.6 89.6zm-189.7-99.7c28-33.9 48.2-81.3 48.2-128.6 0-6.5-.6-13-1.9-19.2-45.7 1.9-100 30.5-131.9 68.7-26.7 30.5-50 77.9-50 125.3 0 7.1 1.3 14.2 1.9 16.5 2.6.3 6.5.9 10.4.9 41.6 0 91.5-27.7 123.3-63.6z" />
            </svg>
            Sign in with Apple
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 mb-8 max-w-2xl">
          <div className="flex-1 h-px bg-black/10" />
          <span className="font-[metropolis] text-[11px] text-[#999] tracking-widest">Or</span>
          <div className="flex-1 h-px bg-black/10" />
        </div>

        {/* ── Copy ── */}
        <p className="font-[metropolis] text-[12px] text-[#787878] tracking-wider mb-8">
          Don&apos;t have a Silkroad account?{" "}
          <Link
            href="/signup"
            className="text-black underline underline-offset-2 hover:opacity-60 transition-opacity duration-200"
          >
            Create one here.
          </Link>
        </p>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 max-w-2xl bg-red-50 border border-red-200 px-5 py-3">
            <p className="font-[metropolis] text-[11px] text-red-700 tracking-wider">{error}</p>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          <div className="flex justify-end">
            <span className="font-[metropolis] text-[10px] text-[#787878] tracking-wider">
              Required Fields *
            </span>
          </div>

          {/* Email */}
          <div>
            <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
              Email *
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white pr-10 disabled:opacity-50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="15" height="12" viewBox="0 0 20 16" fill="none">
                  <rect x="1" y="1" width="18" height="14" rx="2" stroke="#999" strokeWidth="1.3" />
                  <path d="M1 4l9 6 9-6" stroke="#999" strokeWidth="1.3" />
                </svg>
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white pr-10 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] hover:text-black transition-colors duration-200"
                aria-label="Toggle password"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div>
            <button
              type="button"
              className="font-[metropolis] text-[11px] text-black underline underline-offset-2 tracking-wider hover:opacity-60 transition-opacity duration-200"
            >
              Forgot your password?
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full hover:bg-black/80 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
