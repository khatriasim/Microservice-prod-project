"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Home, ArrowLeft, Loader2, AlertCircle, Calendar, Building2 } from "lucide-react";

const GRAPHQL_URL = "http://localhost/graphql";

const MY_BOOKINGS_QUERY = `
query MyBookings {
  myBookings {
    id
    propertyId
    buyerId
    bookingDate
    status
    propertyTitle
    buyerName
  }
}
`;

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchBookings() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: MY_BOOKINGS_QUERY }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message || "Failed to load bookings");
      setBookings(json.data?.myBookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user) fetchBookings();
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-dark-green" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-orange/10 mx-auto mb-6">
            <Home size={32} className="text-orange" />
          </div>
          <h1 className="font-serif-display text-3xl text-dark-green mb-2">Sign In Required</h1>
          <p className="text-slate-500 mb-8">Sign in to view your bookings.</p>
          <Link href="/auth" className="inline-flex items-center gap-2 rounded-xl bg-dark-green px-8 py-3 text-lg font-semibold text-white shadow-md shadow-dark-green/20 transition hover:bg-dark-green-hover">
            <ArrowLeft size={18} /> Sign In / Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex flex-col min-h-[100dvh] overflow-y-auto">
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-dark-green/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange text-white shadow-lg shadow-orange/30">
              <Home size={20} strokeWidth={2.2} />
            </span>
            <span className="font-serif-display text-xl tracking-wide text-dark-green">EstateHub</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
          <div className="mb-8">
            <h1 className="font-serif-display text-4xl text-dark-green leading-tight">My Bookings</h1>
            <p className="mt-2 text-sm text-slate-500">Your property viewing requests.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="font-serif-display text-xl text-dark-green mb-2">No bookings yet</h3>
              <p className="text-sm text-slate-500">Browse listings to make your first booking.</p>
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange/20 hover:bg-orange-hover transition mt-6">
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif-display text-xl text-dark-green">{b.propertyTitle || "Property"}</h3>
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${b.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{b.status}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
                    <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-400">Booked for</span><span className="font-medium">{b.buyerName || "—"}</span></div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-400">Date</span><span className="font-medium">{b.bookingDate ? b.bookingDate.replace('T',' ').split('.')[0].slice(0,16) : "—"}</span></div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-400">Property ID</span><span className="font-medium">{b.propertyId || "—"}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-dark-green/10 bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange text-white"><Home size={16} strokeWidth={2.2} /></span>
            <span className="font-serif-display text-sm text-dark-green">EstateHub</span>
          </Link>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} EstateHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
