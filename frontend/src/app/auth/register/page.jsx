"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
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
  UserPlus,
} from "lucide-react";

// Backend — Django notification service. Override with NEXT_PUBLIC_API_URL if needed.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost";
const REGISTER_URL = `${API_BASE}/api/register/`;

/* ---------- inline validation rules ---------- */
function validateField(name, value, all) {
  switch (name) {
    case "username":
      if (!value.trim()) return "Username is required.";
      if (value.trim().length < 3) return "Must be at least 3 characters.";
      if (!/^[a-zA-Z0-9_]+$/.test(value.trim()))
        return "Only letters, numbers, and underscores.";
      return "";
    case "email":
      if (!value.trim()) return "Email address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
        return "Please enter a valid email address.";
      return "";
    case "password":
      if (!value) return "Password is required.";
      if (value.length < 8) return "Must be at least 8 characters.";
      if (!/[A-Z]/.test(value)) return "Must include an uppercase letter.";
      if (!/[0-9]/.test(value)) return "Must include a number.";
      return "";
    case "confirmPassword":
      if (!value) return "Please confirm your password.";
      if (value !== all.password) return "Passwords do not match.";
      return "";
    default:
      return "";
  }
}

/* ---------- password strength bar ---------- */
function PasswordStrength({ password }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { label: "Very Weak", color: "bg-red-400", width: "w-[15%]" },
    { label: "Weak", color: "bg-orange-400", width: "w-[30%]" },
    { label: "Fair", color: "bg-yellow-500", width: "w-[50%]" },
    { label: "Strong", color: "bg-lime-500", width: "w-[70%]" },
    { label: "Very Strong", color: "bg-green-600", width: "w-full" },
  ];

  const idx = Math.min(score, levels.length) - 1;
  const level = idx >= 0 ? levels[idx] : levels[0];

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${level.color} ${level.width} transition-all duration-300`}
        />
      </div>
      <p
        className={`text-xs font-medium ${idx >= 3 ? "text-green-600" : idx >= 1 ? "text-amber-600" : "text-red-500"}`}
      >
        {level.label}
      </p>
    </div>
  );
}

/* =================== PAGE =================== */
export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------- handlers ---------- */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((t) => ({ ...t, [name]: true }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, form),
      }));
    },
    [form],
  );

  /* ---------- can submit ---------- */
  const canSubmit =
    form.username.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length > 0 &&
    form.confirmPassword.length > 0 &&
    !loading;

  /* ---------- submit ---------- */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    // validate all
    const allErrors = {};
    for (const key of ["username", "email", "password", "confirmPassword"]) {
      allErrors[key] = validateField(key, form[key], form);
    }
    setErrors(allErrors);
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.values(allErrors).some(Boolean)) return;

    setLoading(true);
    setServerError("");
    setSuccess("");

    try {
      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          password_confirm: form.confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(
          data.message || "Account created! Check your email for the code.",
        );
        const email = encodeURIComponent(form.email.trim());
        setTimeout(
          () => router.push(`/auth/verify-email?email=${email}`),
          1400,
        );
        return;
      }

      const message =
        data.error ||
        data.message ||
        Object.values(data).flat().join(" ") ||
        "Registration failed. Please try again.";
      setServerError(message);
    } catch {
      setServerError(
        "Unable to reach the server. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ---------- input class helper ---------- */
  const inputClass = (name) =>
    `h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition
     ${touched[name] && errors[name] ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-slate-200 focus:border-dark-green focus:ring-4 focus:ring-dark-green/10"}`;

  /* =================== JSX =================== */
  return (
    <main className="h-full w-full overflow-y-auto bg-background">
      <div className="flex min-h-full">
        {/* === Left / brand panel (decorative, hidden on mobile) === */}
        <aside className="relative hidden w-[46%] max-w-140 overflow-hidden lg:block">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
            alt="Luxury home entrance with warm lighting"
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
                Start your journey
                <br />
                home today.
              </h1>
              <p className="max-w-sm text-base leading-relaxed text-white/80">
                Create your free account and unlock saved properties, virtual
                tours, and direct access to top real estate agents.
              </p>
              <ul className="space-y-3 text-sm text-white/85">
                <li className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-orange" />
                  Encrypted data &amp; secure sign-up
                </li>
                <li className="flex items-center gap-3">
                  <KeyRound size={18} className="text-orange" />
                  100% verified property listings
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
                Create account
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Fill in the details below to get started.
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
                    value={form.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Choose a username"
                    className={inputClass("username")}
                  />
                </div>
                {touched.username && errors.username && (
                  <p
                    role="alert"
                    className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
                  >
                    {errors.username}
                  </p>
                )}
              </div>

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
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className={inputClass("email")}
                  />
                </div>
                {touched.email && errors.email && (
                  <p
                    role="alert"
                    className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-semibold text-dark-green"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create a password"
                    className={inputClass("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-dark-green"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p
                    role="alert"
                    className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
                  >
                    {errors.password}
                  </p>
                )}
                <PasswordStrength password={form.password} />
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-semibold text-dark-green"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Re-enter your password"
                    className={inputClass("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={
                      showConfirm
                        ? "Hide confirmation"
                        : "Show confirmation"
                    }
                    aria-pressed={showConfirm}
                    className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-dark-green"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p
                    role="alert"
                    className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
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
                    Creating account…
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create account
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              Already have an account?{" "}
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
    </main>
  );
}
