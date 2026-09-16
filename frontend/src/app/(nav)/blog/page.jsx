"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Clock, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";

const API = "http://localhost/api/blog";

/* ─── Skeleton ──────────────────────────────────────────────── */
function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
      <div className="h-4 w-24 rounded-full bg-gray-200" />
      <div className="h-6 w-3/4 rounded bg-gray-200" />
      <div className="h-20 w-full rounded bg-gray-100" />
      <div className="flex gap-6">
        <div className="h-4 w-16 rounded bg-gray-200" />
        <div className="h-4 w-16 rounded bg-gray-200" />
      </div>
    </div>
  );
}

/* ─── Time helper ───────────────────────────────────────────── */
function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/* ─── Post Card ─────────────────────────────────────────────── */
function PostCard({ post, user }) {
  const isMine = !!user && user.username === post.author;
  const likeKey = `blog:liked:${user?.username ?? "anon"}:${post.id}`;
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0);

  // Restore liked state from localStorage once the user is known
  useEffect(() => {
    let cancelled = false;
    async function run() {
      let isLiked = false;
      try {
        isLiked = window.localStorage.getItem(likeKey) === "1";
      } catch {
        /* ignore */
      }
      if (!cancelled) setLiked(isLiked);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [likeKey]);

  const toggleLike = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (likeLoading || !user) return;
    setLikeLoading(true);
    try {
      const res = await fetch(`${API}/like-post/${post.id}/`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const next = !liked;
        setLiked(next);
        setLikesCount((c) => Math.max(0, c + (next ? 1 : -1)));
        try {
          window.localStorage.setItem(likeKey, next ? "1" : "0");
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    } finally {
      setLikeLoading(false);
    }
  }, [post.id, liked, likeLoading, likeKey, user]);

  const snippet = post.content?.length > 160
    ? post.content.slice(0, 160) + "…"
    : post.content;

  return (
    <Link
      href={`/blog/${post.id}`}
      className={`group block rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isMine
          ? "border-orange/40 hover:border-orange/60 bg-orange/[0.03]"
          : "border-gray-100 hover:border-dark-green/15"
      }`}
    >
      {/* Author + time */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-dark-green/10 text-dark-green font-semibold text-xs uppercase">
          {post.author?.[0] ?? "?"}
        </span>
        <span className="font-medium text-dark-green">{post.author}</span>
        {isMine && (
          <span className="inline-flex items-center rounded-full bg-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Your Post
          </span>
        )}
        <span>·</span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {timeAgo(post.created_at)}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-lg font-bold text-dark-green leading-snug group-hover:text-orange transition-colors mb-2">
        {post.title}
      </h2>

      {/* Categories */}
      {post.categories?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.categories.map((cat, i) => (
            <span
              key={cat.id ?? i}
              className="inline-block rounded-full bg-orange/10 px-2.5 py-0.5 text-[11px] font-medium text-orange"
            >
              {cat.name ?? `Cat ${cat.id}`}
            </span>
          ))}
        </div>
      )}

      {/* Snippet */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{snippet}</p>

      {/* Footer stats */}
      <div className="flex items-center gap-5 text-xs text-gray-400 border-t border-gray-50 pt-3">
        <button
          onClick={toggleLike}
          disabled={likeLoading || !user}
          className="flex items-center gap-1 transition-colors hover:text-orange"
          aria-label={liked ? "Unlike post" : "Like post"}
        >
          <Heart size={14} className={liked ? "fill-orange text-orange" : ""} />
          {likesCount}
        </button>
        <span className="flex items-center gap-1">
          <MessageCircle size={14} />
          {post.comments_count ?? 0}
        </span>
        <span>{post.views ?? 0} views</span>
      </div>
    </Link>
  );
}

/* ─── Create Post Modal ─────────────────────────────────────── */
function CreatePostModal({ open, onClose, onCreated, categories }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [status, setStatus] = useState("published");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const toggleCat = (id) =>
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/create/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category_ids: selectedCats,
          status,
        }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setSelectedCats([]);
        onCreated();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail ?? data.error ?? "Failed to create post.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-dark-green">New Post</h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}

          {/* Title */}
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-dark-green placeholder:text-gray-400 focus:border-dark-green focus:outline-none focus:ring-2 focus:ring-dark-green/10 transition"
          />

          {/* Content */}
          <textarea
            placeholder="Write your post..."
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-dark-green placeholder:text-gray-400 focus:border-dark-green focus:outline-none focus:ring-2 focus:ring-dark-green/10 transition resize-none"
          />

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCat(cat.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      selectedCats.includes(cat.id)
                        ? "bg-orange text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name ?? `Cat ${cat.id}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-dark-green focus:border-dark-green focus:outline-none focus:ring-2 focus:ring-dark-green/10 transition"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-dark-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-dark-green-hover disabled:opacity-50"
          >
            {submitting ? "Publishing…" : "Publish Post"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function BlogPage() {
  const { user, loading: authLoading, logout } = useAuth();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  // Fetch categories once
  useEffect(() => {
    fetch(`${API}/list-category/`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Fetch on page/category change
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!cancelled) setLoading(true);
      try {
        let url;
        if (activeCat) {
          url = `${API}/post-category/${activeCat}/?page=${page}&page_size=${pageSize}`;
        } else {
          url = `${API}/posts/?page=${page}&page_size=${pageSize}`;
        }
        const res = await fetch(url, { credentials: "include" });
        const data = res.ok ? await res.json() : null;
        if (!cancelled) {
          setPosts(data?.results ?? data ?? []);
          setCount(data?.count ?? 0);
        }
      } catch {
        if (!cancelled) {
          setPosts([]);
          setCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [page, activeCat, refreshKey]);

  const handleCatFilter = (catId) => {
    setActiveCat(catId === activeCat ? null : catId);
    setPage(1);
  };

  if (authLoading) {
    return (
      <div className="h-full w-full flex flex-col overflow-y-auto bg-background">
        <SiteHeader active="blog" user={null} loading={true} logout={() => {}} />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto bg-background">
      <SiteHeader active="blog" user={user} loading={authLoading} logout={logout} />

      <main className="mx-auto max-w-7xl px-4 pt-12 pb-16">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif-display font-bold text-dark-green">Blog</h1>
            <p className="mt-1 text-sm text-gray-500">Insights, guides, and stories from the community</p>
          </div>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-hover"
            >
              <Plus size={16} />
              New Post
            </button>
          )}
        </div>

        {/* Category filter chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => handleCatFilter(null)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeCat === null
                  ? "bg-dark-green text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCatFilter(cat.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  activeCat === cat.id
                    ? "bg-dark-green text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name ?? `Cat ${cat.id}`}
              </button>
            ))}
          </div>
        )}

        {/* Posts grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
            <MessageCircle size={40} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-dark-green mb-1">No posts yet</h3>
            <p className="text-sm text-gray-500">
              {user ? "Be the first to write something!" : "Log in to create the first post."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} user={user} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-500">
              Page <span className="font-semibold text-dark-green">{page}</span> of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>

      {/* Success toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-[slide-up_.3s_ease-out]">
          <div className="flex items-center gap-2 rounded-xl bg-dark-green px-5 py-3 text-sm font-medium text-white shadow-xl shadow-dark-green/20">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-orange"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {toast}
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        categories={categories}
        onCreated={() => {
          setShowCreate(false);
          setPage(1);
          setActiveCat(null);
          setRefreshKey((k) => k + 1);
          setToast("Your post was published!");
        }}
      />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-3 text-sm text-gray-500">
            <div>
              <h4 className="font-serif-display text-lg font-bold text-dark-green mb-3">EstateHub</h4>
              <p className="leading-relaxed">Find your perfect property with Nepal&apos;s trusted real estate platform.</p>
            </div>
            <div>
              <h5 className="font-semibold text-dark-green mb-3">Quick Links</h5>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-dark-green transition-colors">Home</Link></li>
                <li><Link href="/view_estate" className="hover:text-dark-green transition-colors">Listings</Link></li>
                <li><Link href="/agents" className="hover:text-dark-green transition-colors">Agents</Link></li>
                <li><Link href="/blog" className="hover:text-dark-green transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-dark-green mb-3">Contact</h5>
              <ul className="space-y-2">
                <li>Kathmandu, Nepal</li>
                <li>info@estatehub.com</li>
                <li>+977-1-1234567</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} EstateHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
