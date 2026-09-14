"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  MailCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  Home,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

// Backend — Django notification service. Override with NEXT_PUBLIC_API_URL if needed.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
const VERIFY_URL = `${API_BASE}/api/verify-otp/`;
const RESEND_URL = `${API_BASE}/api/resend-otp/`;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

/* ---------- OTP input ---------- */
function OtpInput({ value, onChange, disabled, invalid }) {
  const refs = useRef([]);

  const boxClass = (isFilled) =>
    `h-14 w-11 sm:w-12 rounded-xl border bg-white text-center text-xl font-bold text-slate-900 shadow-sm outline-none transition
     ${
       invalid
         ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
         : "border-slate-200 focus:border-dark-green focus:ring-4 focus:ring-dark-green/10"
     } ${isFilled ? "border-dark-green/60" : ""} ${
       disabled ? "opacity-60" : ""
     }`;

  function handleChange(index, e) {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const next = value.split("");
    next[index] = digit;
    onChange(next.join(""));
    if (digit && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        const next = value.split("");
        next[index - 1] = "";
        onChange(next.join(""));
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!digits) return;
    onChange(digits);
    refs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  }

  return (
    <div
      role="group"
      aria-label="One-time verification code"
      className="flex justify-center gap-2 sm:gap-2.5"
    >
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
          autoFocus={i === 0}
          className={boxClass(Boolean(value[i]))}
        />
      ))}
    </div>
  );
}

/* =================== CONTENT (reads search params) =================== */
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  /* Prefill email from /auth/verify-email?email=... (set after register).
     Syncing form state from the URL is the documented exception to
     set-state-in-effect: the param isn't known until the client render. */
  useEffect(() => {
    const e = searchParams.get("email");
    if (e) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(e);
    }
  }, [searchParams]);

  /* Resend countdown */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canVerify = emailValid && otp.length === OTP_LENGTH && !loading;

  async function handleVerify(e) {
    e.preventDefault();
    setEmailError(emailValid ? "" : "Enter a valid email address.");
    if (!emailValid) return;
    if (otp.length !== OTP_LENGTH) {
      setOtpError("Enter the complete 6-digit code.");
      return;
    }
    setOtpError("");
    setLoading(true);
    setServerError("");
    setSuccess("");

    try {
      const res = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(data.message || "Email verified — your account is ready!");
        setTimeout(() => router.push("/auth/login"), 1400);
        return;
      }
      setServerError(
        data.error || data.message || "That code didn't work. Please try again.",
      );
    } catch {
      setServerError(
        "Unable to reach the server. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(e) {
    e.preventDefault();
    setEmailError(emailValid ? "" : "Enter a valid email address.");
    if (!emailValid) return;

    setResendLoading(true);
    setResendError("");
    setResendSuccess("");

    try {
      const res = await fetch(RESEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setResendSuccess(
          data.message || "A new code has been sent to your email.",
        );
        setCooldown(RESEND_COOLDOWN);
      } else {
        setResendError(
          data.error ||
            data.message ||
            "Could not resend the code. Please try again.",
        );
      }
    } catch {
      setResendError(
        "Unable to reach the server. Please check your connection and try again.",
      );
    } finally {
      setResendLoading(false);
    }
  }

  const fmtCooldown = `${Math.floor(cooldown / 60)}:${String(
    cooldown % 60,
  ).padStart(2, "0")}`;

  return (
    <div className="flex min-h-full">
      {/* === Left / brand panel (decorative, hidden on mobile) === */}
      <aside className="relative hidden w-[46%] max-w-140 overflow-hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
          alt="Modern luxury home at dusk"
          fill
          priority
          sizes="(min-width: 1024px) 46vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-dark-green/85 via-dark-green/60 to-dark-green/25" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14 text-white">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange text-white shadow-lg shadow-orange/30">
              <Home size={22} strokeWidth={2.2} />
            </span>
            <span className="font-serif-display text-2xl tracking-wide">
              EstateHub
            </span>
          </Link>

          <div className="space-y-6">
            <h1 className="font-serif-display text-4xl xl:text-[2.75rem] leading-tight">
              One last step
              <br />
              to your dream home.
            </h1>
            <p className="max-w-sm text-base leading-relaxed text-white/80">
              Confirm your email address to activate your account and start
              exploring verified listings, virtual tours, and top agents.
            </p>
            <ul className="space-y-3 text-sm text-white/85">
              <li className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-orange" />
                One-time encrypted verification codes
              </li>
              <li className="flex items-center gap-3">
                <KeyRound size={18} className="text-orange" />
                Your inbox, your keys — nothing shared
              </li>
            </ul>
          </div>

          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} EstateHub. All rights reserved.
          </p>
        </div>
      </aside>

      {/* === Right / form panel === */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile-only brand mark */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2.5 lg:hidden"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-orange text-white shadow-lg shadow-orange/30">
              <Home size={20} strokeWidth={2.2} />
            </span>
            <span className="font-serif-display text-xl text-dark-green">
              EstateHub
            </span>
          </Link>

          <header className="mb-8">
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-dark-green/10 text-dark-green">
              <MailCheck size={24} />
            </span>
            <h2 className="font-serif-display text-3xl text-dark-green">
              Check your inbox
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              We sent a {OTP_LENGTH}-digit code to your email. Enter it below
              to verify your account.
            </p>
          </header>

          {/* Status banners */}
          {serverError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-up"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}
          {success && (
            <div
              role="status"
              className="mb-6 flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 animate-fade-up"
            >
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}
          {resendSuccess && !success && (
            <div
              role="status"
              className="mb-6 flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 animate-fade-up"
            >
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{resendSuccess}</span>
            </div>
          )}

          <form onSubmit={handleVerify} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-dark-green"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition ${
                    emailError
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-dark-green focus:ring-4 focus:ring-dark-green/10"
                  }`}
                />
              </div>
              {emailError && (
                <p
                  role="alert"
                  className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
                >
                  {emailError}
                </p>
              )}
            </div>

            {/* OTP */}
            <div>
              <label
                htmlFor="otp-0"
                className="mb-2 block text-sm font-semibold text-dark-green"
              >
                Verification code
              </label>
              <OtpInput
                value={otp}
                onChange={(v) => {
                  setOtp(v);
                  setOtpError("");
                }}
                disabled={loading}
                invalid={Boolean(otpError)}
              />
              <div className="mt-2 min-h-[1rem] text-center">
                {otpError && (
                  <p
                    role="alert"
                    className="flex items-center justify-center gap-1 text-xs text-red-500"
                  >
                    {otpError}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canVerify}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-dark-green text-[15px] font-semibold text-white shadow-lg shadow-dark-green/20 transition duration-200 hover:bg-dark-green-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-dark-green/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  Verify email
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-4 text-center">
            {resendError && (
              <p
                role="alert"
                className="mb-2 flex items-center justify-center gap-1 text-xs text-red-500"
              >
                {resendError}
              </p>
            )}
            <p className="text-sm text-slate-600">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || cooldown > 0}
                className="inline-flex items-center gap-1 font-semibold text-dark-green transition hover:text-dark-green-hover hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
              >
                <RotateCw
                  size={14}
                  className={resendLoading ? "animate-spin" : ""}
                />
                {resendLoading
                  ? "Sending…"
                  : cooldown > 0
                    ? `Resend code in ${fmtCooldown}`
                    : "Resend code"}
              </button>
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already verified?{" "}
            <a
              href="/auth/login"
              className="font-semibold text-dark-green transition hover:text-dark-green-hover hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

/* =================== PAGE =================== */
export default function VerifyEmailPage() {
  return (
    <main className="h-full w-full overflow-y-auto bg-background">
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}