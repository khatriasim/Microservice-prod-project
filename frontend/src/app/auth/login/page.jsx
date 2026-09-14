"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Home,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

// Backend — Django notification service. Override with NEXT_PUBLIC_API_URL if needed.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
const LOGIN_URL = `${API_BASE}/api/login/`;

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit =
    username.trim().length > 0 && password.length > 0 && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // persist httponly access/refresh cookies set by the backend
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(data.message || "Login successful");
        // Give the success feedback a beat, then go home
        setTimeout(() => router.push("/"), 600);
        return;
      }

      // 400 -> { error }, 401 -> { message } (backend contract)
      const message =
        res.status === 400
          ? data.error || "Something went wrong. Please try again."
          : data.message || data.error || "Invalid username or password.";
      setError(message);
    } catch {
      setError(
        "Unable to reach the server. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="h-full w-full overflow-y-auto bg-background">
      <div className="flex min-h-full">
        {/* === Left / brand panel (decorative, hidden on mobile) === */}
        <aside className="relative hidden w-[46%] max-w-[560px] overflow-hidden lg:block">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
            alt="Modern luxury home at dusk"
            fill
            priority
            sizes="(min-width: 1024px) 46vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-dark-green/85 via-dark-green/60 to-dark-green/25" />

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
                Welcome back to
                <br />
                the home you&apos;ll love.
              </h1>
              <p className="max-w-sm text-base leading-relaxed text-white/80">
                Sign in to manage your saved properties, watch virtual tours,
                and connect with top real estate agents.
              </p>
              <ul className="space-y-3 text-sm text-white/85">
                <li className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-orange" />
                  Secure, encrypted sign-in
                </li>
                <li className="flex items-center gap-3">
                  <KeyRound size={18} className="text-orange" />
                  Verified listings only
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
              <h2 className="font-serif-display text-3xl text-dark-green">
                Sign in
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Enter your credentials to access your account.
              </p>
            </header>

            {/* Status banners */}
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-up"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
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

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-sm font-semibold text-dark-green"
                >
                  Username
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-dark-green focus:ring-4 focus:ring-dark-green/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-dark-green"
                  >
                    Password
                  </label>
                  <a
                    href="/auth/register"
                    className="text-xs font-medium text-dark-green transition hover:text-dark-green-hover hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-dark-green focus:ring-4 focus:ring-dark-green/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-dark-green"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-dark-green text-[15px] font-semibold text-white shadow-lg shadow-dark-green/20 transition duration-200 hover:bg-dark-green-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-dark-green/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <a
                href="/auth/register"
                className="font-semibold text-dark-green transition hover:text-dark-green-hover hover:underline"
              >
                Create one
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}