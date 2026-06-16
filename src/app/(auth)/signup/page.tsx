"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

const TITLES = ["Mr.", "Mrs.", "Ms.", "Mx."];
const COUNTRY_CODES = [
  { code: "+91", country: "IN" },
  { code: "+1",  country: "US" },
  { code: "+44", country: "GB" },
  { code: "+971",country: "AE" },
  { code: "+65", country: "SG" },
  { code: "+81", country: "JP" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
];

// ── Email verification state ──────────────────────────────────────────────────
type VerifyState =
  | "idle"           // not started
  | "sending"        // POST in flight
  | "sent"           // email sent, awaiting click
  | "verified";      // magic link confirmed

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification state
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [verifyToken, setVerifyToken] = useState<string>("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    emailConfirm: "",
    password: "",
    title: "",
    firstName: "",
    lastName: "",
    countryCode: "+91",
    phone: "",
    dob: "",
    newsletter: false,
    privacy: false,
  });

  const set = (key: string, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  // ── Read URL params after magic link redirect ──────────────────────────────
  useEffect(() => {
    const verified = searchParams.get("verified");
    const token    = searchParams.get("token");
    const errType  = searchParams.get("verifyError");
    const errEmail = searchParams.get("email");

    if (verified && token) {
      setForm((f) => ({ ...f, email: verified, emailConfirm: verified }));
      setVerifyToken(token);
      setVerifyState("verified");
    }

    if (errType === "expired") {
      setVerifyError("Your verification link expired. Click Verify again to get a new one.");
      if (errEmail) setForm((f) => ({ ...f, email: decodeURIComponent(errEmail), emailConfirm: decodeURIComponent(errEmail) }));
      setVerifyState("idle");
    }

    if (errType === "invalid") {
      setVerifyError("Invalid verification link. Please try again.");
      setVerifyState("idle");
    }
  }, [searchParams]);

  // ── Send verification email ───────────────────────────────────────────────
  const handleVerify = async () => {
    setVerifyError(null);

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setVerifyError("Please enter a valid email address first.");
      return;
    }

    setVerifyState("sending");

    const res = await fetch("/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });

    const data = await res.json() as { ok?: boolean; error?: string };

    if (!res.ok) {
      setVerifyError(data.error ?? "Could not send verification email.");
      setVerifyState("idle");
      return;
    }

    setVerifyState("sent");
  };

  // ── Submit the full registration ──────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (verifyState !== "verified") {
      setError("Please verify your email address before creating an account.");
      return;
    }
    if (form.email !== form.emailConfirm) {
      setError("Email addresses do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email:      form.email,
        password:   form.password,
        firstName:  form.firstName,
        lastName:   form.lastName,
        phone:      form.phone ? `${form.countryCode}${form.phone}` : undefined,
        dob:        form.dob || undefined,
        verifyToken,
      }),
    });

    const data = await res.json() as { ok?: boolean; error?: string };

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Registration failed. Please try again.");
      return;
    }

    // Auto sign-in after successful registration
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/" });
  const handleApple  = () => signIn("apple",  { callbackUrl: "/" });

  const emailLocked = verifyState === "verified";

  return (
    <main className="min-h-screen bg-white pt-20 pb-24">
      {/* Breadcrumb */}
      <div className="border-b border-black/8 px-10 py-3 flex items-center gap-2">
        <Link href="/" className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-[#787878] hover:text-black transition-colors duration-200">
          Silkroad
        </Link>
        <span className="font-[metropolis] text-[10px] text-[#bbb]">/</span>
        <span className="font-[metropolis] text-[10px] tracking-[0.15em] uppercase text-black">Create Your Account</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-12">
        <h1 className="font-[metropolis] text-[28px] md:text-[32px] tracking-[-0.01em] text-black mb-8">
          Create Your Account
        </h1>

        {/* Social SSO */}
        <div className="space-y-3 mb-8 max-w-2xl">
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-4 border border-black/15 rounded-full font-[metropolis] text-[13px] text-black tracking-wide hover:border-black/40 hover:bg-black/[0.02] transition-all duration-300">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
          <button onClick={handleApple}
            className="w-full flex items-center justify-center gap-3 py-4 border border-black/15 rounded-full font-[metropolis] text-[13px] text-black tracking-wide hover:border-black/40 hover:bg-black/[0.02] transition-all duration-300">
            <svg width="17" height="20" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-157.2-108.7C46.7 742.7 0 661.1 0 580.4c0-171.2 111.4-261.5 220.8-261.5 55.1 0 100.9 36.3 135.7 36.3 33.1 0 84.9-38.4 147.2-38.4 23.7 0 108.2 2.6 166.6 89.6zm-189.7-99.7c28-33.9 48.2-81.3 48.2-128.6 0-6.5-.6-13-1.9-19.2-45.7 1.9-100 30.5-131.9 68.7-26.7 30.5-50 77.9-50 125.3 0 7.1 1.3 14.2 1.9 16.5 2.6.3 6.5.9 10.4.9 41.6 0 91.5-27.7 123.3-63.6z" />
            </svg>
            Sign in with Apple
          </button>
        </div>

        {/* Sub-copy */}
        <p className="font-[metropolis] text-[12px] text-[#555] tracking-wider leading-relaxed mb-2">
          Create your account to have access to a more personalised experience.
        </p>
        <p className="font-[metropolis] text-[12px] text-[#787878] tracking-wider mb-8">
          Already have a Silkroad account?{" "}
          <Link href="/login" className="text-black underline underline-offset-2 hover:opacity-60 transition-opacity duration-200">
            Log in here.
          </Link>
        </p>

        {/* Error banner */}
        {error && (
          <div className="mb-6 max-w-2xl bg-red-50 border border-red-200 px-5 py-3">
            <p className="font-[metropolis] text-[11px] text-red-700 tracking-wider">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-end mb-4">
            <span className="font-[metropolis] text-[10px] text-[#787878] tracking-wider">Required fields *</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            {/* LEFT */}
            <div className="space-y-5">

              {/* ── Email + Verify ── */}
              <div>
                <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
                  Email *
                </label>

                {/* Input row */}
                <div className="flex gap-0">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => {
                      set("email", e.target.value);
                      // Reset verification if email changes
                      if (verifyState === "verified" || verifyState === "sent") {
                        setVerifyState("idle");
                        setVerifyToken("");
                      }
                    }}
                    disabled={emailLocked || loading}
                    className={`flex-1 border border-black/15 border-r-0 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white ${
                      emailLocked ? "opacity-60 cursor-not-allowed bg-[#fafafa]" : ""
                    }`}
                    placeholder="your@email.com"
                  />

                  {/* Verify / Verified button */}
                  {verifyState === "verified" ? (
                    <div className="flex items-center gap-1.5 border border-black/15 border-l-0 px-4 bg-[#f9f9f9] shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#000" />
                        <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-[metropolis] text-[10px] tracking-[0.12em] uppercase text-black">Verified</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={verifyState === "sending" || verifyState === "sent" || loading}
                      className={`border border-black/15 border-l-0 px-5 py-3.5 font-[metropolisSemiBold] text-[9px] tracking-[0.18em] uppercase transition-all duration-200 shrink-0 ${
                        verifyState === "sending" || verifyState === "sent"
                          ? "bg-black/5 text-black/40 cursor-not-allowed"
                          : "bg-black text-white hover:bg-black/80"
                      }`}
                    >
                      {verifyState === "sending" ? (
                        <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                          <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : "Verify"}
                    </button>
                  )}
                </div>

                {/* State messages */}
                {verifyState === "sent" && (
                  <div className="mt-2.5 flex items-start gap-2 bg-black/[0.03] border border-black/8 px-4 py-3">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#555" strokeWidth="1.4" />
                      <path d="M2 7l10 7 10-7" stroke="#555" strokeWidth="1.4" />
                    </svg>
                    <div>
                      <p className="font-[metropolis] text-[11px] text-black tracking-wider">Check your inbox</p>
                      <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider mt-0.5">
                        We sent a verification link to <strong>{form.email}</strong>. Click it to verify — you can leave this page.
                      </p>
                      <button
                        type="button"
                        onClick={() => setVerifyState("idle")}
                        className="font-[metropolis] text-[10px] text-black underline underline-offset-2 mt-1.5 hover:opacity-60 transition-opacity"
                      >
                        Resend or change email
                      </button>
                    </div>
                  </div>
                )}

                {verifyState === "verified" && (
                  <p className="font-[metropolis] text-[10px] text-black tracking-wider mt-1.5 flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#000" />
                      <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Email verified
                  </p>
                )}

                {verifyError && (
                  <p className="font-[metropolis] text-[10px] text-red-600 tracking-wider mt-1.5">{verifyError}</p>
                )}
              </div>

              {/* Email Confirm */}
              <div>
                <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
                  Email Confirmation *
                </label>
                <input
                  type="email"
                  required
                  value={form.emailConfirm}
                  onChange={(e) => set("emailConfirm", e.target.value)}
                  disabled={emailLocked || loading}
                  className={`w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white ${
                    emailLocked ? "opacity-60 cursor-not-allowed bg-[#fafafa]" : ""
                  }`}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    disabled={loading}
                    className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white pr-10 disabled:opacity-50"
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] hover:text-black transition-colors duration-200">
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
            </div>

            {/* RIGHT */}
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">Title *</label>
                <div className="relative">
                  <select required value={form.title} onChange={(e) => set("title", e.target.value)}
                    disabled={loading}
                    className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white appearance-none cursor-pointer disabled:opacity-50">
                    <option value="" disabled>Select your title</option>
                    {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="#999" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">First Name *</label>
                <input type="text" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} disabled={loading}
                  className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white disabled:opacity-50" />
              </div>

              {/* Last Name */}
              <div>
                <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">Last Name *</label>
                <input type="text" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} disabled={loading}
                  className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white disabled:opacity-50" />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">Phone Number</label>
                <div className="flex gap-0">
                  <div className="relative">
                    <select value={form.countryCode} onChange={(e) => set("countryCode", e.target.value)} disabled={loading}
                      className="border border-black/15 border-r-0 px-3 py-3.5 pr-7 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white appearance-none cursor-pointer disabled:opacity-50">
                      {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                    </select>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="8" height="5" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1l4 4 4-4" stroke="#999" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </span>
                  </div>
                  <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} disabled={loading}
                    className="flex-1 border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white disabled:opacity-50" />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block font-[metropolis] text-[11px] tracking-[0.12em] uppercase text-black mb-2">Date of Birth</label>
                <input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} disabled={loading}
                  className="w-full border border-black/15 px-4 py-3.5 font-[metropolis] text-[13px] text-black outline-none focus:border-black/50 transition-colors duration-200 bg-white appearance-none disabled:opacity-50" />
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-8 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input type="checkbox" checked={form.newsletter} onChange={(e) => set("newsletter", e.target.checked)} className="sr-only peer" />
                <div className="w-4 h-4 border border-black/25 peer-checked:bg-black peer-checked:border-black transition-all duration-200 flex items-center justify-center">
                  {form.newsletter && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="font-[metropolis] text-[11px] text-[#555] tracking-wider leading-relaxed">
                Subscribe to receive Silkroad emails
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input type="checkbox" required checked={form.privacy} onChange={(e) => set("privacy", e.target.checked)} className="sr-only peer" />
                <div className="w-4 h-4 border border-black/25 peer-checked:bg-black peer-checked:border-black transition-all duration-200 flex items-center justify-center">
                  {form.privacy && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="font-[metropolis] text-[11px] text-[#555] tracking-wider leading-relaxed">
                I have read, understood and agree to the{" "}
                <span className="text-black underline underline-offset-2 hover:opacity-60 transition-opacity duration-200 cursor-pointer">Privacy Policy</span>{" "}*
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center gap-4 justify-end">
            <div className="text-right">
              <p className="font-[metropolis] text-[10px] text-[#787878] tracking-wider leading-relaxed">
                {verifyState !== "verified"
                  ? <>Please verify your email address<br />before creating your account.</>
                  : <>You will receive a welcome email to confirm<br />your account creation.</>
                }
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || verifyState !== "verified"}
              title={verifyState !== "verified" ? "Please verify your email first" : undefined}
              className={`px-12 py-4 font-[metropolisSemiBold] text-[10px] tracking-[0.25em] uppercase rounded-full transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                verifyState !== "verified"
                  ? "bg-black/20 text-white cursor-not-allowed"
                  : loading
                  ? "bg-black/50 text-white cursor-wait"
                  : "bg-black text-white hover:bg-black/80 active:scale-[0.99]"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Creating account…
                </>
              ) : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
