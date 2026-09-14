"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Home, AlertCircle, ArrowRight, MapPin, UserPlus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { getPhotoUrl } from "@/lib/property";

const API_URL = "http://localhost/graphql";
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

function FavouriteSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-md overflow-hidden animate-pulse">
      <div className="aspect-16/10 w-full bg-slate-200" />
      <div className="space-y-3 p-4 pb-5">
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-10 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function FavouritesPage() {
  const { user, loading: authLoading, logout } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* fetch saved homes — requires the auth cookie */
  useEffect(() => {
    if (authLoading) return; // wait for the auth check to settle
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchFavorites() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query: MY_FAVORITES_QUERY }),
        });
        const json = await res.json();
        if (cancelled) return;
        setFavorites(json?.data?.myFavorites ?? []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFavorites();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  /* toggle favorite — remove a saved home right from this page */
  async function toggleFavorite(propertyId) {
    const saved = favorites.find((f) => f.propertyId === propertyId);
    // optimistic update
    setFavorites((prev) => prev.filter((f) => f.propertyId !== propertyId));
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: TOGGLE_FAVOURITE_MUTATION, variables: { propertyId } }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message || "Toggle failed");
    } catch {
      // revert — restore the card on error
      if (saved) setFavorites((prev) => [...prev, saved]);
    }
  }

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto bg-background">
      <SiteHeader
        user={user}
        loading={authLoading}
        logout={logout}
        favCount={favorites.length}
        active="listings"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-8">
        {/* ---- page title ---- */}
        <header className="mb-8">
          <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange/10 text-orange">
            <Heart size={22} />
          </span>
          <h1 className="font-serif-display text-4xl text-dark-green leading-tight">
            Your saved homes
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Properties you&apos;ve hearted — tap View Property to see the full
            listing and book a viewing.
          </p>
        </header>

        {/* ---- not logged in ---- */}
        {!authLoading && !user && (
          <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <UserPlus size={26} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Log in to see your saved homes
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Sign in and tap the heart on any listing to save it here.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-dark-green px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-dark-green/20 transition hover:bg-dark-green-hover focus-visible:ring-4 focus-visible:ring-dark-green/20"
            >
              Log in
              <ArrowRight size={16} />
            </Link>
          </section>
        )}

        {/* ---- loading ---- */}
        {!authLoading && user && loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <FavouriteSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ---- error ---- */}
        {!authLoading && user && !loading && error && (
          <section className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-100 text-red-600">
              <AlertCircle size={26} />
            </span>
            <p className="max-w-sm text-sm text-slate-600">
              We couldn&apos;t load your saved homes right now.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-dark-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-dark-green-hover"
            >
              Try Again
            </button>
          </section>
        )}

        {/* ---- empty ---- */}
        {!authLoading && user && !loading && !error && favorites.length === 0 && (
          <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Heart size={26} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                No saved homes yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Heart your favourite listings and they&apos;ll show up here.
              </p>
            </div>
            <Link
              href="/view_estate"
              className="inline-flex items-center gap-1.5 rounded-xl bg-dark-green px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-dark-green/20 transition hover:bg-dark-green-hover"
            >
              Browse listings
              <ArrowRight size={16} />
            </Link>
          </section>
        )}

        {/* ---- grid ---- */}
        {!authLoading && user && !loading && !error && favorites.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => (
              <article
                key={fav.id}
                className="group flex flex-col rounded-2xl bg-white shadow-md transition duration-300 hover:shadow-xl overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-16/10 w-full overflow-hidden">
                  <Image
                    src={getPhotoUrl(fav.propertyId)}
                    alt={fav.propertyTitle || "Saved property"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {/* Favorite toggle — same as view_estate */}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(fav.propertyId)}
                    aria-label="Remove from saved"
                    className="absolute right-5 top-3 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-orange text-white shadow-md shadow-orange/30 transition-all duration-200 hover:bg-orange-hover"
                  >
                    <Heart size={16} className="fill-current" strokeWidth={2} />
                  </button>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-2.5 p-4 pb-5">
                  <h3 className="text-[15px] font-semibold text-slate-900 leading-snug line-clamp-2">
                    {fav.propertyTitle || `Property #${fav.propertyId}`}
                  </h3>
                  <p className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Home size={14} className="text-slate-400" />
                    Property ID #{fav.propertyId}
                  </p>

                  <Link
                    href={`/view_property?id=${fav.propertyId}`}
                    className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-dark-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-dark-green-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-dark-green/20"
                  >
                    View Property
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
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