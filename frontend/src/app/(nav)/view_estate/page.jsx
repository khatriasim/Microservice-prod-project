"use client";

import { useState, useEffect, useMemo } from "react";
import { AuthSection } from "@/components/AuthSection";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Heart,
  Sparkles,
  Home,
  Bed,
  Bath,
  Ruler,
  MapPin,
  User,
  ArrowUpRight,
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

/* ---------- constants ---------- */
const API_URL = "http://localhost/graphql";
const RECOMMENDED_QUERY = `
query {
  recommendedProperties(limit: 6) {
    id
    title
    price
    city
    status
    bedrooms
    bathrooms
    area
    address
    propertyType
    agentName
    agentEmail
  }
}`;

const GRAPHQL_QUERY = `
query {
  properties {
    id
    title
    price
    city
    status
    bedrooms
    bathrooms
    area
    address
    propertyType
    agentName
    agentEmail
  }
}`;

const MY_FAVORITES_QUERY = `
query {
  myFavorites {
    id
    propertyId
    userId
    propertyTitle
  }
}`;

const TOGGLE_FAVOURITE_MUTATION = `
mutation ToggleFav($propertyId: Int!) {
  toggleFavourites(propertyId: $propertyId)
}`;

const LISTING_PHOTOS = [
  "photo-1512917774080-9991f1c4c750",
  "photo-1600596542815-ffad4c1539a9",
  "photo-1600585154340-be6161a56a0c",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1600566753086-00f18fb6b3ea",
  "photo-1502005229762-cf1b2da7c5d6",
  "photo-1600210492486-724fe5c67fb0",
  "photo-1605276374104-dee2a0ed3cd6",
  "photo-1600047509807-ba8f99d2cdde",
  "photo-1613490493576-7fde63acd811",
  "photo-1616486338812-3dadae4b4ace",
  "photo-1560448204-e02f11c3d0e2",
];
const UNSPLASH_BASE = "https://images.unsplash.com";

function getPhotoUrl(id) {
  const photoId = LISTING_PHOTOS[(id - 1 + LISTING_PHOTOS.length) % LISTING_PHOTOS.length];
  return `${UNSPLASH_BASE}/${photoId}?auto=format&fit=crop&w=640&q=80`;
}

/* ---------- helpers ---------- */
function formatPrice(price) {
  if (price == null) return "Price on request";

  // NPR uses lakh (1,00,000) and crore (1,00,00,000) as the natural units
  if (price >= 1e7) return `Rs ${(price / 1e7).toFixed(2)} Crore`;
  if (price >= 1e5) return `Rs ${(price / 1e5).toFixed(2)} Lakh`;
  return `Rs ${price.toLocaleString("en-IN")}`;
}

function formatArea(area) {
  if (area == null) return null;
  if (area >= 1e6) return `${(area / 1e6).toFixed(1)}M ft²`;
  if (area >= 1e3) return `${(area / 1e3).toFixed(1)}K ft²`;
  return `${Math.round(area).toLocaleString()} ft²`;
}

const STATUS_STYLES = {
  available: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", label: "Available" },
  sold:      { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-200",    label: "Sold" },
  rented:    { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200",    label: "Rented" },
  pending:   { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   label: "Pending" },
};
const DEFAULT_STATUS = { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", label: "N/A" };

function getStatus(status) {
  return STATUS_STYLES[status?.toLowerCase()] ?? { ...DEFAULT_STATUS, label: status ?? "N/A" };
}

/* ---------- property card ---------- */
function PropertyCard({ property, isFavorite, onToggleFavorite, isLoggedIn }) {
  const status = getStatus(property.status);
  const areaStr = formatArea(property.area);
  const priceStr = formatPrice(property.price);
  const location = [property.address, property.city].filter(Boolean).join(", ");

  return (
    <article className="group relative flex flex-col rounded-2xl bg-white shadow-md transition duration-300 hover:shadow-xl overflow-hidden">
      {/* Image */}
      <div className="relative aspect-16/10 w-full overflow-hidden">
        <Image
          src={getPhotoUrl(property.id)}
          alt={property.title || "Property listing"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {/* Favorite toggle */}
        <button
          type="button"
          onClick={() => isLoggedIn && onToggleFavorite?.(property.id)}
          aria-label={isFavorite ? "Remove from saved" : "Save property"}
          className={`absolute top-3 cursor-pointer right-5 z-10 grid h-9 w-9 place-items-center rounded-full shadow-md transition-all duration-200
            ${isFavorite
              ? "bg-orange text-white shadow-orange/30 hover:bg-orange-hover"
              : "bg-white/90 backdrop-blur-sm text-slate-500 hover:bg-white hover:text-orange border border-white/20"
            }`}
        >
          <Heart size={16} className={isFavorite ? "fill-current" : ""} strokeWidth={2} />
        </button>
        {/* Status badge */}
        <span
          className={`absolute top-3 left-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide border ${status.bg} ${status.text} ${status.border}`}
        >
          {status.label}
        </span>
        {/* Property type badge (if present) */}
        {property.propertyType && (
          <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold text-dark-green border border-white/20 shadow-sm">
            {property.propertyType}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4 pb-5">
        {/* Price */}
        <p className="text-xl font-bold text-dark-green font-serif-display leading-none">
          {priceStr}
        </p>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-slate-900 leading-snug line-clamp-1">
          {property.title}
        </h3>

        {/* Location */}
        {location && (
          <p className="flex items-start gap-1.5 text-sm text-slate-500 leading-snug">
            <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{location}</span>
          </p>
        )}

        {/* Stats row */}
        <div className="mt-1 flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Bed size={14} className="text-slate-400" />
            {property.bedrooms != null ? property.bedrooms : "—"} Bed
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath size={14} className="text-slate-400" />
            {property.bathrooms != null ? property.bathrooms : "—"} Bath
          </span>
          {areaStr && (
            <span className="inline-flex items-center gap-1">
              <Ruler size={14} className="text-slate-400" />
              {areaStr}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="mt-auto pt-2.5 border-t border-slate-100" />

        {/* Agent (if present) */}
        {property.agentName && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <User size={13} className="text-slate-400" />
            <span className="truncate">
              <span className="font-medium text-slate-700">{property.agentName}</span>
              {property.agentEmail && (
                <span className="text-slate-400"> · {property.agentEmail}</span>
              )}
            </span>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/view_estate/${property.id}`}
          className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-dark-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-dark-green-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-dark-green/20"
        >
          View Details
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}

/* ---------- skeleton card ---------- */
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white shadow-md overflow-hidden animate-pulse">
      <div className="aspect-16/10 w-full bg-slate-200" />
      <div className="space-y-3 p-4 pb-5">
        <div className="h-5 w-24 rounded bg-slate-200" />
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3.5 w-2/3 rounded bg-slate-200" />
        <div className="flex gap-4 pt-1">
          <div className="h-3.5 w-14 rounded bg-slate-200" />
          <div className="h-3.5 w-14 rounded bg-slate-200" />
          <div className="h-3.5 w-16 rounded bg-slate-200" />
        </div>
        <div className="border-t border-slate-100 pt-3" />
        <div className="h-10 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

/* ---------- page header ---------- */
function Header({ user, loading, logout, favCount }) {
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
          <Link href="/" className="text-gray-600 hover:text-dark-green transition-colors">
            Home
          </Link>
          <Link href="/view_estate" className="text-dark-green font-semibold">
            Listings
          </Link>
          <a href="#" className="text-gray-600 hover:text-dark-green transition-colors">
            Agents
          </a>
          <a href="#" className="text-gray-600 hover:text-dark-green transition-colors">
            Blog
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/saved"
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

/* ---------- custom select ---------- */
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="relative">
      <label htmlFor={`filter-${label}`} className="sr-only">
        {label}
      </label>
      <SlidersHorizontal
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <select
        id={`filter-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-dark-green focus:ring-4 focus:ring-dark-green/10 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

/* =================== PAGE =================== */
export default function ViewEstatePage() {
  const { user, loading: authLoading, logout } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [recommended, setRecommended] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState(false);

  const [favorites, setFavorites] = useState(new Set());

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  /* fetch on mount */
  useEffect(() => {
    let cancelled = false;

    async function fetchProperties() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: GRAPHQL_QUERY }),
        });
        const json = await res.json();
        if (cancelled) return;
        setProperties(json?.data?.properties ?? []);
      } catch (err) {
        if (!cancelled) setError("Failed to load properties. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProperties();
    return () => {
      cancelled = true;
    };
  }, []);

  /* fetch personalized recommendations — only when the user is logged in */
  useEffect(() => {
    if (authLoading) return; // wait for the auth check to settle
    if (!user) return; // not logged in — nothing to recommend yet

    let cancelled = false;

    async function fetchRecommended() {
      setRecommendedLoading(true);
      setRecommendedError(false);
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // send auth cookie so the backend personalizes
          body: JSON.stringify({ query: RECOMMENDED_QUERY }),
        });
        const json = await res.json();
        if (cancelled) return;
        setRecommended(json?.data?.recommendedProperties ?? []);
      } catch (err) {
        if (!cancelled) setRecommendedError(true);
      } finally {
        if (!cancelled) setRecommendedLoading(false);
      }
    }

    fetchRecommended();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  /* fetch favorites for logged-in user */
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
    return () => { cancelled = true; };
  }, [user, authLoading]);

  /* toggle favorite */
  async function toggleFavorite(propertyId) {
    if (!user) return; // require login
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
        body: JSON.stringify({ query: TOGGLE_FAVOURITE_MUTATION, variables: { propertyId } }),
      });
      const json = await res.json();
      if (json.errors) {
        // revert on error
        setFavorites((prev) => {
          const next = new Set(prev);
          if (wasFav) next.add(propertyId);
          else next.delete(propertyId);
          return next;
        });
      }
    } catch {
      // revert on network error
      setFavorites((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
    }
  }

  const favCount = favorites.size;
  const cities = useMemo(() => {
    const set = new Set(
      properties.map((p) => (p.city ?? "").trim()).filter(Boolean),
    );
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [properties]);

  const statuses = useMemo(() => {
    const set = new Set(
      properties.map((p) => (p.status ?? "").trim()).filter(Boolean),
    );
    return [...set].sort();
  }, [properties]);

  /* filtered + sorted list */
  const filtered = useMemo(() => {
    let result = [...properties];

    // text search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          (p.title ?? "").toLowerCase().includes(q) ||
          (p.city ?? "").toLowerCase().includes(q) ||
          (p.address ?? "").toLowerCase().includes(q),
      );
    }

    // city
    if (cityFilter !== "all") {
      result = result.filter(
        (p) => (p.city ?? "").trim().toLowerCase() === cityFilter.toLowerCase(),
      );
    }

    // status
    if (statusFilter !== "all") {
      result = result.filter(
        (p) => (p.status ?? "").trim().toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    // sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "area-desc":
        result.sort((a, b) => (b.area ?? 0) - (a.area ?? 0));
        break;
      case "beds-desc":
        result.sort((a, b) => (b.bedrooms ?? 0) - (a.bedrooms ?? 0));
        break;
      default:
        // keep original order
        break;
    }

    return result;
  }, [properties, search, cityFilter, statusFilter, sortBy]);

  const resultCount = filtered.length;
  const totalCount = properties.length;

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto bg-background">
      <Header user={user} loading={authLoading} logout={logout} favCount={favCount} />

      <main className="flex-1">
        {/* ---- page title ---- */}
        <section className="w-full border-b border-dark-green/10 bg-white/50">
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-serif-display text-4xl text-dark-green leading-tight">
                  Explore Properties
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Browse our curated collection of homes, apartments, and land
                </p>
              </div>
              {!loading && (
                <span className="inline-flex h-8 items-center rounded-full bg-dark-green/10 px-3.5 text-sm font-semibold text-dark-green">
                  {resultCount === totalCount
                    ? `${totalCount} properties`
                    : `${resultCount} of ${totalCount}`}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ---- search / filter bar ---- */}
        <section className="sticky top-16 z-30 w-full border-b border-slate-100 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:px-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, city, or address…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-dark-green focus:ring-4 focus:ring-dark-green/10"
              />
            </div>

            {/* City filter */}
            <FilterSelect
              label="City"
              value={cityFilter}
              onChange={setCityFilter}
              options={[
                { value: "all", label: "All Cities" },
                ...cities.map((c) => ({ value: c, label: c })),
              ]}
            />

            {/* Status filter */}
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All Statuses" },
                ...statuses.map((s) => ({
                  value: s,
                  label: getStatus(s).label,
                })),
              ]}
            />

            {/* Sort */}
            <FilterSelect
              label="Sort"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "default", label: "Default" },
                { value: "price-asc", label: "Price: Low → High" },
                { value: "price-desc", label: "Price: High → Low" },
                { value: "area-desc", label: "Largest Area" },
                { value: "beds-desc", label: "Most Bedrooms" },
              ]}
            />
          </div>
        </section>

        {/* ---- recommended (logged-in users only) ---- */}
        {!authLoading && user && (
          <section className="w-full border-b border-slate-100 bg-white/40">
            <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
              <header className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange/10 text-orange">
                    <Sparkles size={20} />
                  </span>
                  <div>
                    <h2 className="font-serif-display text-2xl text-dark-green">
                      Recommended
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Handpicked for you based on your preferences
                    </p>
                  </div>
                </div>
              </header>

              {recommendedLoading && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {!recommendedLoading && !recommendedError && recommended.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recommended.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      isFavorite={favorites.has(prop.id)}
                      onToggleFavorite={toggleFavorite}
                      isLoggedIn={!!user}
                    />
                  ))}
                </div>
              )}

              {!recommendedLoading && recommended.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-6 text-center text-sm text-slate-500">
                  {recommendedError
                    ? "We couldn&apos;t load your recommendations right now."
                    : "No recommendations yet — keep browsing and we&apos;ll tailor these for you."}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ---- results ---- */}
        <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
          {/* Loading */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-100 text-red-600">
                <AlertCircle size={28} />
              </div>
              <p className="max-w-sm text-sm text-slate-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-dark-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-dark-green-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-dark-green/20"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && resultCount === 0 && totalCount > 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <Search size={28} />
              </div>
              <p className="max-w-sm text-sm text-slate-600">
                No properties match your filters. Try broadening your search.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCityFilter("all");
                  setStatusFilter("all");
                  setSortBy("default");
                }}
                className="text-sm font-semibold text-dark-green transition hover:text-dark-green-hover hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* No data at all */}
          {!loading && !error && totalCount === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <Home size={28} />
              </div>
              <p className="max-w-sm text-sm text-slate-600">
                No properties available right now. Check back soon!
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && resultCount > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isFavorite={favorites.has(prop.id)}
                  onToggleFavorite={toggleFavorite}
                  isLoggedIn={!!user}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ---- footer ---- */}
      <footer className="border-t border-dark-green/10 bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange text-white">
              <Home size={16} strokeWidth={2.2} />
            </span>
            <span className="font-serif-display text-sm text-dark-green">EstateHub</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} EstateHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}