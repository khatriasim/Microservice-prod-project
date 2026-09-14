"use client";
import Link from "next/link";
import { Home, Heart } from "lucide-react";
import { AuthSection } from "@/components/AuthSection";

/**
 * Shared sticky nav bar for listing pages.
 * Auth state (user/loading/logout) comes from a single useAuth() call in the page
 * and is passed down — same pattern as AuthSection, so every page makes ONE auth check.
 */
export function SiteHeader({ user, loading, logout, favCount = 0, active = "home" }) {
  const linkClass = (key) =>
    active === key
      ? "text-dark-green font-semibold"
      : "text-gray-600 hover:text-dark-green transition-colors";

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-dark-green/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange text-white shadow-lg shadow-orange/30">
            <Home size={20} strokeWidth={2.2} />
          </span>
          <span className="font-serif-display text-xl tracking-wide text-dark-green">
            EstateHub
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className={linkClass("home")}>
            Home
          </Link>
          <Link href="/view_estate" className={linkClass("listings")}>
            Listings
          </Link>
          <Link href="/agents" className={linkClass("agents")}>
            Agents
          </Link>
          <a href="#" className="text-gray-600 hover:text-dark-green transition-colors">
            Blog
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/favourite"
            aria-label="Saved homes"
            className="relative flex h-10 w-10 rounded-full bg-orange items-center justify-center text-white shadow-md hover:bg-orange-hover transition-colors shrink-0"
          >
            <Heart className="w-5 h-5" strokeWidth={2} />
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 min-h-5 min-w-5 rounded-full bg-dark-green border-2 border-background text-[10px] font-bold text-white flex items-center justify-center px-1">
                {favCount}
              </span>
            )}
          </Link>
          <AuthSection user={user} loading={loading} logout={logout} />
        </div>
      </div>
    </header>
  );
}