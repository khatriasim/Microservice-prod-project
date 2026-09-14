"use client";

import { useEffect, useState } from "react";
import { Mail, Users, AlertCircle, Home } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";

const AGENTS_URL = "http://localhost/api/get-agents/";
const GRAPHQL_URL = "http://localhost/graphql";
const MY_FAVORITES_QUERY = `
query {
  myFavorites {
    id
  }
}`;

const AVATAR_TONES = [
  "bg-orange text-white",
  "bg-dark-green text-white",
  "bg-emerald-600 text-white",
  "bg-sky-600 text-white",
  "bg-violet-600 text-white",
  "bg-rose-500 text-white",
];

function toneOf(index) {
  return AVATAR_TONES[index % AVATAR_TONES.length];
}

function initialsOf(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function AgentSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md animate-pulse">
      <div className="flex items-center gap-4 p-5">
        <div className="h-14 w-14 shrink-0 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const { user, loading: authLoading, logout } = useAuth();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favCount, setFavCount] = useState(0);

  /* agents list — public endpoint, no login needed */
  useEffect(() => {
    let cancelled = false;
    async function fetchAgents() {
      setError("");
      try {
        const res = await fetch(AGENTS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setAgents(Array.isArray(json) ? json : []);
      } catch {
        if (!cancelled) setError("We couldn't load the agents right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAgents();
    return () => {
      cancelled = true;
    };
  }, []);

  /* saved-home count for the header heart — only when logged in */
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    async function fetchFavorites() {
      try {
        const res = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query: MY_FAVORITES_QUERY }),
        });
        const json = await res.json();
        if (!cancelled) setFavCount(json?.data?.myFavorites?.length ?? 0);
      } catch {
        /* silent — favorites are non-critical */
      }
    }
    fetchFavorites();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto bg-background">
      <SiteHeader
        user={user}
        loading={authLoading}
        logout={logout}
        favCount={favCount}
        active="agents"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 lg:px-8">
        {/* ---- page title ---- */}
        <header className="mb-8">
          <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange/10 text-orange">
            <Users size={22} />
          </span>
          <h1 className="font-serif-display text-4xl text-dark-green leading-tight">
            Our agents
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Meet the EstateHub team — happy to help you find the right place.
          </p>
        </header>

        {/* ---- loading ---- */}
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <AgentSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ---- error ---- */}
        {!loading && error && (
          <section className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-100 text-red-600">
              <AlertCircle size={26} />
            </span>
            <p className="max-w-sm text-sm text-slate-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-dark-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-dark-green-hover"
            >
              Try Again
            </button>
          </section>
        )}

        {/* ---- empty ---- */}
        {!loading && !error && agents.length === 0 && (
          <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Users size={26} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                No agents listed yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Check back soon — agents are being added.
              </p>
            </div>
          </section>
        )}

        {/* ---- grid ---- */}
        {!loading && !error && agents.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, i) => (
              <article
                key={`${agent.email}-${i}`}
                className="group flex flex-col rounded-2xl bg-white p-5 shadow-md transition duration-300 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-semibold shadow-sm ${toneOf(i)}`}
                  >
                    {initialsOf(agent.name)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-serif-display text-lg text-dark-green">
                      {agent.name || "EstateHub Agent"}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
                      <Mail size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{agent.email}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={`mailto:${agent.email}`}
                  className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-xl border border-dark-green/15 bg-dark-green/5 px-4 py-2.5 text-sm font-semibold text-dark-green transition duration-200 hover:bg-dark-green hover:text-white"
                >
                  Contact agent
                </a>
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