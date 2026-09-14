"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Presentational account widget. Auth state is owned by the page via useAuth()
 * and passed down so each page makes exactly ONE verify-token call.
 *
 * Props:
 *   user    - resolved user object, or null when logged out
 *   loading - true while the auth check is still resolving
 *   logout  - async fn to log the user out
 */
export function AuthSection({ user, loading, logout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <div className="ml-1 h-10 w-10 rounded-full bg-black/5 animate-pulse shrink-0" />;
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="ml-1 px-5 h-10 flex items-center justify-center rounded-full border border-[#2b2018] text-[#2b2018] text-sm font-medium hover:bg-[#2b2018] hover:text-white transition-all shrink-0"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="relative ml-1 shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-orange/30 transition-all"
      >
        {user.picture ? (
          <Image
            src={user.picture}
            alt={user.name || "Profile"}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#2b2018] text-white text-sm font-semibold">
            {(user.name || user.email || "U")[0].toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-black/5 py-1 z-50">
          <div className="px-4 py-2 border-b border-black/5">
            <p className="text-sm font-medium text-[#2b2018] truncate">{user.name || "Account"}</p>
            <p className="text-xs text-[#2b2018]/60 truncate">{user.email}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-[#2b2018] hover:bg-black/5 transition-colors"
          >
            Profile
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}