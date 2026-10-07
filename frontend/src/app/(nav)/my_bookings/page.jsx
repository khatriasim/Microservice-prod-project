"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Home, ArrowLeft, Loader2, AlertCircle, Calendar, Building2, Trash2, PenSquare } from "lucide-react";

const GRAPHQL_URL = "http://localhost:8000/graphql";

const CANCEL_BOOKING_MUTATION = `
mutation CancelBooking($id: Int!) {
  cancelBooking(id: $id)
}
`;

const UPDATE_BOOKING_MUTATION = `
mutation UpdateBooking($id: Int!, $bookingDate: String!) {
  updateBooking(id: $id, bookingDate: $bookingDate) {
    id
    bookingDate
    status
  }
}
`;

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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelingId, setCancelingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState("");

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

  function formatBookingDate(dateStr) {
    if (!dateStr) return "—";
    const match = String(dateStr).match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/
    );
    if (!match) return dateStr;

    const [, year, month, day, hour, minutes] = match;
    let hours = Number(hour);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const hourStr = String(hours).padStart(2, '0');
    return `${month}/${day}/${year}, ${hourStr}:${minutes} ${ampm}`;
  }

  async function handleCancel(id) {
    setCancelingId(id);
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: CANCEL_BOOKING_MUTATION, variables: { id } }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message || "Failed to cancel");
      fetchBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelingId(null);
    }
  }

  async function handleUpdateDate(id) {
    if (!editDate) return;
    // datetime-local gives "YYYY-MM-DDTHH:MM"
    const iso = editDate.length === 16 ? editDate + ":00" : editDate;
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: UPDATE_BOOKING_MUTATION, variables: { id, bookingDate: iso } }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message || "Failed to update date");
      setEditingId(null);
      setEditDate("");
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  }

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
              <Link href={"/view_estate"} className="inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange/20 hover:bg-orange-hover transition mt-6">
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id ?? b.propertyId} className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif-display text-xl text-dark-green">{b.propertyTitle || "Property"}</h3>
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${b.status === "pending" ? "bg-amber-600 text-amber-50" : b.status === "confirmed" ? "bg-emerald-600 text-emerald-50" : b.status === "cancelled" ? "bg-red-600 text-red-50" : "bg-slate-100 text-slate-700"}`}>{b.status}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
                    <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-400">Booked for</span><span className="font-medium">{b.buyerName || "—"}</span></div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-400">Date</span><span className="font-medium">{formatBookingDate(b.bookingDate)}</span></div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-400">Property ID</span><span className="font-medium">{b.propertyId || "—"}</span></div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => handleCancel(b.id)} disabled={cancelingId === b.id} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-60">
                      <Trash2 size={12} /> {cancelingId === b.id ? "Canceling…" : "Cancel"}
                    </button>
                    {editingId === b.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={editDate ? editDate.slice(0, 16) : ""}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700"
                        />
                        <button onClick={() => handleUpdateDate(b.id)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition"><PenSquare size={12} /> Save</button>
                        <button onClick={() => { setEditingId(null); setEditDate(""); }} className="text-xs text-slate-500 hover:text-slate-700">Close</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(b.id); setEditDate(b.bookingDate ? b.bookingDate.slice(0, 16).replace(' ','T') : ""); }} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition">
                        <PenSquare size={12} /> Edit Date
                      </button>
                    )}
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
