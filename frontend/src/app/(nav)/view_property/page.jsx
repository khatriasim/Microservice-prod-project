"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Heart,
  Bed,
  Bath,
  Ruler,
  MapPin,
  User,
  CalendarDays,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  AlertCircle,
  CalendarX2,
  Building2,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import {
  getPhotoUrl,
  formatPrice,
  formatArea,
  getStatus,
} from "@/lib/property";

const API_URL = "http://localhost/graphql";

const VIEW_PROPERTY_QUERY = `
query ViewProperty($id: Int!) {
  viewProperty(id: $id) {
    id
    title
    price
    city
    status
    agentId
    agentName
    agentEmail
    description
    bedrooms
    bathrooms
    area
    address
    propertyType
  }
}`;

const MY_BOOKINGS_QUERY = `
query {
  myBookings {
    id
    propertyId
    buyerId
    bookingDate
    status
    propertyTitle
  }
}`;

const BOOK_VIEWING_MUTATION = `
mutation BookViewing($propertyId: Int!, $bookingDate: String!) {
  bookViewing(input: { propertyId: $propertyId, bookingDate: $bookingDate }) {
    id
    propertyId
    buyerId
    bookingDate
    status
    propertyTitle
  }
}`;

const CANCEL_BOOKING_MUTATION = `
mutation CancelBooking($id: Int!) {
  cancelBooking(id: $id)
}`;

const MY_FAVORITES_QUERY = `
query {
  myFavorites {
    id
    propertyId
  }
}`;

const TOGGLE_FAVOURITE_MUTATION = `
mutation ToggleFav($propertyId: Int!) {
  toggleFavourites(propertyId: $propertyId)
}`;

/* tomorrow's date (local timezone) as YYYY-MM-DD — the booking panel default */
function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function todayIso() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/* =================== CONTENT (reads search params) =================== */
function ViewPropertyContent() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading, logout } = useAuth();

  const propertyId = useMemo(() => Number(searchParams.get("id")) || null, [searchParams]);

  const [property, setProperty] = useState(null);
  const [propertyLoading, setPropertyLoading] = useState(() => propertyId != null);
  const [propertyError, setPropertyError] = useState("");

  const [booking, setBooking] = useState(null); // this user's booking for this property, if any

  const [favorites, setFavorites] = useState(() => new Set()); // set of saved propertyIds
  const [bookingDate, setBookingDate] = useState(tomorrowIso());
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* fetch property details */
  useEffect(() => {
    if (propertyId == null) return;
    let cancelled = false;

    async function fetchProperty() {
      setPropertyLoading(true);
      setPropertyError("");
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: VIEW_PROPERTY_QUERY,
            variables: { id: propertyId },
          }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json?.data?.viewProperty == null && json.errors) {
          setPropertyError("Property not found.");
        } else {
          setProperty(json?.data?.viewProperty ?? null);
        }
      } catch {
        if (!cancelled) setPropertyError("Failed to load this property.");
      } finally {
        if (!cancelled) setPropertyLoading(false);
      }
    }
    fetchProperty();
    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  /* fetch the current user's bookings — used to detect an existing booking */
  useEffect(() => {
    if (authLoading || !user || propertyId == null) return;
    let cancelled = false;

    async function fetchBookings() {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query: MY_BOOKINGS_QUERY }),
        });
        const json = await res.json();
        if (cancelled) return;
        const list = json?.data?.myBookings ?? [];
        setBooking(list.find((b) => b.propertyId === propertyId) ?? null);
      } catch {
        /* silent — booking state is non-critical */
      }
    }
    fetchBookings();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, propertyId]);

  /* fetch the saved-home ids — drives the heart on the hero + header count */
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;

    async function fetchFavorites() {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query: MY_FAVORITES_QUERY }),
        });
        const json = await res.json();
        if (cancelled) return;
        const ids = (json?.data?.myFavorites ?? []).map((f) => f.propertyId);
        setFavorites(new Set(ids));
      } catch {
        /* silent — favorites are non-critical */
      }
    }
    fetchFavorites();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  async function handleBook(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBookingLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: BOOK_VIEWING_MUTATION,
          variables: { propertyId, bookingDate },
        }),
      });
      const json = await res.json();
      if (json.errors) {
        setError(json.errors[0]?.message || "Could not book the viewing.");
      } else {
        const created = json?.data?.bookViewing;
        setBooking(created);
        setMessage("Viewing booked! The agent will confirm your appointment.");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleCancel() {
    if (!booking) return;
    setError("");
    setMessage("");
    setBookingLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: CANCEL_BOOKING_MUTATION,
          variables: { id: booking.id },
        }),
      });
      const json = await res.json();
      if (json.errors) {
        setError(json.errors[0]?.message || "Could not cancel the booking.");
      } else {
        setBooking(null);
        setMessage("Booking cancelled. You can book again anytime.");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  /* toggle favorite — save/unsave the current property */
  async function toggleFavorite() {
    if (!user || propertyId == null) return; // require login + a real property
    const wasFav = favorites.has(propertyId);
    // optimistic update
    setFavorites((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: TOGGLE_FAVOURITE_MUTATION,
          variables: { propertyId },
        }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message || "Toggle failed");
    } catch {
      // revert on error
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
    }
  }

  /* ---- render states ---- */
  const isFavorite = propertyId != null && favorites.has(propertyId);
  const today = todayIso();

  /* missing id */
  if (propertyId == null) {
    return (
      <div className="h-full w-full flex flex-col overflow-y-auto bg-background">
        <SiteHeader user={user} loading={authLoading} logout={logout} favCount={favorites.size} active="listings" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Building2 size={28} />
          </span>
          <p className="max-w-sm text-sm text-slate-600">
            No property selected. Browse the listings and pick one to view its
            details.
          </p>
          <Link
            href="/view_estate"
            className="inline-flex items-center gap-1.5 rounded-xl bg-dark-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-dark-green-hover"
          >
            Browse listings
            <ArrowLeft size={15} />
          </Link>
        </main>
      </div>
    );
  }

  /* loading */
  if (propertyLoading) {
    return (
      <div className="h-full w-full flex flex-col overflow-y-auto bg-background">
        <SiteHeader user={user} loading={authLoading} logout={logout} favCount={favorites.size} active="listings" />
        <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div className="aspect-16/10 w-full rounded-2xl bg-slate-200" />
              <div className="space-y-4">
                <div className="h-6 w-2/3 rounded bg-slate-200" />
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="h-32 w-full rounded-xl bg-slate-200" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* error */
  if (!property) {
    return (
      <div className="h-full w-full flex flex-col overflow-y-auto bg-background">
        <SiteHeader user={user} loading={authLoading} logout={logout} favCount={favorites.size} active="listings" />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-100 text-red-600">
            <AlertCircle size={28} />
          </span>
          <p className="max-w-sm text-sm text-slate-600">
            {propertyError || "We couldn&apos;t find that property."}
          </p>
          <Link
            href="/view_estate"
            className="inline-flex items-center gap-1.5 rounded-xl bg-dark-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-dark-green-hover"
          >
            Back to listings
            <ArrowLeft size={15} />
          </Link>
        </main>
      </div>
    );
  }

  const status = getStatus(property.status);
  const location = [property.address, property.city].filter(Boolean).join(", ");
  const areaStr = formatArea(property.area);

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto bg-background">
      <SiteHeader user={user} loading={authLoading} logout={logout} favCount={favorites.size} active="listings" />

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 lg:px-8 lg:py-10">
        {/* ---- breadcrumb / back ---- */}
        <Link
          href="/view_estate"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-dark-green"
        >
          <ArrowLeft size={15} />
          Back to listings
        </Link>

        {/* ---- hero split ---- */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* image */}
          <div className="relative aspect-16/10 w-full overflow-hidden rounded-3xl shadow-lg">
            <Image
              src={getPhotoUrl(property.id)}
              alt={property.title || "Property"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <span
              className={`absolute top-4 left-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide border ${status.bg} ${status.text} ${status.border}`}
            >
              {status.label}
            </span>
            {property.propertyType && (
              <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-dark-green border border-white/20 shadow-sm">
                <Building2 size={13} />
                {property.propertyType}
              </span>
            )}
            {/* Favorite toggle */}
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={!user}
              aria-label={isFavorite ? "Remove from saved" : "Save property"}
              className={`absolute bottom-4 right-4 z-10 grid h-11 w-11 cursor-pointer place-items-center rounded-full shadow-md transition-all duration-200
                ${!user
                  ? "bg-white/70 text-slate-400"
                  : isFavorite
                    ? "bg-orange text-white shadow-orange/30 hover:bg-orange-hover"
                    : "bg-white/90 backdrop-blur-sm text-slate-500 hover:bg-white hover:text-orange border border-white/20"
                }`}
            >
              <Heart size={20} className={isFavorite ? "fill-current" : ""} strokeWidth={2} />
            </button>
          </div>

          {/* details */}
          <div className="flex flex-col">
            <p className="font-serif-display text-3xl text-dark-green leading-none">
              {formatPrice(property.price)}
            </p>

            <h1 className="mt-3 font-serif-display text-4xl text-dark-green leading-tight">
              {property.title}
            </h1>

            {location && (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
                <span>{location}</span>
              </p>
            )}

            {/* stats */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white border border-slate-100 p-3 text-center shadow-sm">
                <Bed size={18} className="mx-auto text-dark-green" />
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {property.bedrooms != null ? property.bedrooms : "—"}
                </p>
                <p className="text-xs text-slate-500">Bedrooms</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-3 text-center shadow-sm">
                <Bath size={18} className="mx-auto text-dark-green" />
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {property.bathrooms != null ? property.bathrooms : "—"}
                </p>
                <p className="text-xs text-slate-500">Bathrooms</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-100 p-3 text-center shadow-sm">
                <Ruler size={18} className="mx-auto text-dark-green" />
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {areaStr ?? "—"}
                </p>
                <p className="text-xs text-slate-500">Area</p>
              </div>
            </div>

            {/* description */}
            {property.description && (
              <div className="mt-5">
                <h2 className="mb-1 text-sm font-semibold text-dark-green">
                  About this property
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  {property.description}
                </p>
              </div>
            )}

            {/* agent */}
            {property.agentName && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-dark-green/10 text-dark-green">
                  <User size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {property.agentName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {property.agentEmail || "Listing agent"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- booking panel ---- */}
        <section className="mt-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-md lg:p-8">
          <header className="mb-5 flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange/10 text-orange">
              <CalendarDays size={20} />
            </span>
            <div>
              <h2 className="font-serif-display text-2xl text-dark-green">
                Book a viewing
              </h2>
              <p className="text-sm text-slate-500">
                Schedule a private tour with the listing agent.
              </p>
            </div>
          </header>

          {/* status banners */}
          {message && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* not logged in */}
          {!authLoading && !user && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-background/60 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Log in to book a viewing
              </p>
              <p className="max-w-sm text-sm text-slate-500">
                You&apos;ll need an account to schedule a private tour of this
                property.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-dark-green px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-dark-green/20 transition hover:bg-dark-green-hover"
              >
                Log in
              </Link>
            </div>
          )}

          {/* logged in — viewing already booked */}
          {!authLoading && user && booking && (
            <div className="rounded-2xl bg-dark-green/5 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-dark-green text-white">
                    <CalendarDays size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-dark-green">
                      Viewing booked for {booking.bookingDate}
                    </p>
                    <p className="text-xs text-slate-500">
                      Status:{" "}
                      <span className="capitalize">{booking.status}</span> ·{" "}
                      Reference #{booking.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={bookingLoading}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Cancelling…
                    </>
                  ) : (
                    <>
                      <CalendarX2 size={15} />
                      Cancel booking
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* logged in — book form */}
          {!authLoading && user && !booking && (
            <form onSubmit={handleBook} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="bookingDate"
                  className="mb-1.5 block text-sm font-semibold text-dark-green"
                >
                  Preferred date
                </label>
                <input
                  id="bookingDate"
                  type="date"
                  required
                  min={today}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-dark-green focus:ring-4 focus:ring-dark-green/10"
                />
              </div>
              <button
                type="submit"
                disabled={bookingLoading || !bookingDate}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-dark-green px-8 text-[15px] font-semibold text-white shadow-lg shadow-dark-green/20 transition hover:bg-dark-green-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-dark-green/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Booking…
                  </>
                ) : (
                  <>
                    Book viewing
                    <CalendarDays size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </section>
      </main>

      {/* ---- footer ---- */}
      <footer className="border-t border-dark-green/10 bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange text-white">
              <Home size={14} strokeWidth={2.2} />
            </span>
            <span className="font-serif-display text-sm text-dark-green">
              EstateHub
            </span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} EstateHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* =================== PAGE =================== */
export default function ViewPropertyPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <ViewPropertyContent />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="h-full w-full flex flex-col overflow-y-auto bg-background">
      <SiteHeader user={null} loading={true} logout={() => {}} active="listings" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-8 animate-pulse">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="aspect-16/10 w-full rounded-2xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-6 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="h-32 w-full rounded-xl bg-slate-200" />
          </div>
        </div>
      </main>
    </div>
  );
}