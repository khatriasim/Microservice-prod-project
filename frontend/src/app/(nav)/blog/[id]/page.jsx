"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Clock,
  ArrowLeft,
  Send,
  Trash2,
  Eye,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";

const API = "http://localhost/api/blog";

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

/* ─── Comment Card ──────────────────────────────────────────── */
function CommentCard({ comment, user }) {
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const toggleLike = useCallback(async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await fetch(`${API}/like-comment/${comment.id}/`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked ?? !liked);
      }
    } catch {
      /* ignore */
    } finally {
      setLikeLoading(false);
    }
  }, [comment.id, liked, likeLoading]);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-dark-green/10 text-dark-green font-semibold text-xs uppercase">
          {comment.author?.[0] ?? "?"}
        </span>
        <span className="text-sm font-semibold text-dark-green">{comment.author}</span>
        <span className="text-xs text-gray-400">· {timeAgo(comment.created_at)}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
      <div className="mt-2 flex items-center gap-4">
        <button
          onClick={toggleLike}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange transition-colors"
        >
          <Heart size={13} className={liked ? "fill-orange text-orange" : ""} />
          Like
        </button>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function BlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const likeKey = `blog:liked:${user?.username ?? "anon"}:${id}`;

  const isAuthor = user && post && user.username === post.author;

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${API}/list-comment/${id}/`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      }
    } catch {
      /* ignore */
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!cancelled) setLoading(true);
      try {
        // Post detail
        const postRes = await fetch(`${API}/post/${id}/`, { credentials: "include" });
        const postData = postRes.ok ? await postRes.json() : null;
        if (!cancelled) {
          setPost(postData);
          if (postData) setLikesCount(postData.likes_count ?? 0);
        }
      } catch {
        if (!cancelled) setPost(null);
      }
      // Comments (best-effort, separate try so a failure never blanks the post)
      try {
        const comRes = await fetch(`${API}/list-comment/${id}/`, { credentials: "include" });
        const comData = comRes.ok ? await comRes.json() : [];
        if (!cancelled) setComments(Array.isArray(comData) ? comData : []);
      } catch {
        /* ignore */
      }
      if (!cancelled) setLoading(false);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Restore liked state once the user is known
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

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (likeLoading || !user) return;
    setLikeLoading(true);
    try {
      const res = await fetch(`${API}/like-post/${id}/`, {
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
  }, [id, liked, likeLoading, user, likeKey]);

  // Submit comment
  const submitComment = useCallback(
    async (e) => {
      e.preventDefault();
      if (!commentText.trim() || submittingComment) return;
      setSubmittingComment(true);
      try {
        const res = await fetch(`${API}/add-comment/${id}/`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: commentText.trim() }),
        });
        if (res.ok) {
          setCommentText("");
          fetchComments();
        }
      } catch {
        /* ignore */
      } finally {
        setSubmittingComment(false);
      }
    },
    [id, commentText, submittingComment, fetchComments]
  );

  // Delete post
  const deletePost = useCallback(async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/delete/${id}/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/blog");
      }
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  }, [id, router]);

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

      <main className="mx-auto max-w-3xl px-4 pt-2 pb-2">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-dark-green transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Back to Blog
        </Link>

        {loading ? (
          /* Skeleton */
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="space-y-3 mt-8">
              <div className="h-4 w-full rounded bg-gray-100" />
              <div className="h-4 w-full rounded bg-gray-100" />
              <div className="h-4 w-5/6 rounded bg-gray-100" />
            </div>
          </div>
        ) : !post ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
            <h3 className="text-lg font-semibold text-dark-green mb-1">Post not found</h3>
            <p className="text-sm text-gray-500">This post may have been deleted.</p>
            <Link
              href="/blog"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-dark-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-dark-green-hover"
            >
              <ArrowLeft size={14} />
              Back to Blog
            </Link>
          </div>
        ) : (
          <>
            {/* Post header */}
            <article className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm mb-8">
              {/* Categories */}
              {post.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.categories.map((cat, i) => (
                    <span
                      key={cat.id ?? i}
                      className="inline-block rounded-full bg-orange/10 px-3 py-0.5 text-xs font-medium text-orange"
                    >
                      {cat.name ?? `Cat ${cat.id}`}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-dark-green leading-tight mb-4">
                {post.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-dark-green/10 text-dark-green font-semibold text-xs uppercase">
                    {post.author?.[0] ?? "?"}
                  </span>
                  <span className="font-medium text-dark-green">{post.author}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {timeAgo(post.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  {post.views ?? 0} views
                </span>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>

              {/* Actions bar */}
              <div className="mt-8 flex items-center gap-4 border-t border-gray-100 pt-5">
                <button
                  onClick={toggleLike}
                  disabled={!user || likeLoading}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    liked
                      ? "bg-orange/10 text-orange border border-orange/20"
                      : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-orange/5 hover:text-orange hover:border-orange/20"
                  } disabled:opacity-50`}
                >
                  <Heart size={16} className={liked ? "fill-orange" : ""} />
                  {liked ? "Liked" : "Like"}
                  <span className={liked ? "text-orange" : "text-gray-400"}>
                    {likesCount}
                  </span>
                </button>
                <span className="flex items-center gap-1.5 text-sm text-gray-400">
                  <MessageCircle size={16} />
                  {comments.length} {comments.length === 1 ? "comment" : "comments"}
                </span>
                {isAuthor && (
                  <button
                    onClick={deletePost}
                    disabled={deleting}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 border border-red-100 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    {deleting ? "Deleting…" : "Delete Post"}
                  </button>
                )}
              </div>
            </article>

            {/* Comments section */}
            <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-bold text-dark-green mb-6">
                Comments ({comments.length})
              </h2>

              {/* Add comment form */}
              {user ? (
                <form onSubmit={submitComment} className="flex gap-3 mb-8">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-dark-green placeholder:text-gray-400 focus:border-dark-green focus:outline-none focus:ring-2 focus:ring-dark-green/10 transition"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-orange text-white shadow-sm transition hover:bg-orange-hover disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-500 mb-6">
                  <Link href="/" className="text-orange font-medium hover:underline">Log in</Link>{" "}
                  to leave a comment.
                </p>
              )}

              {/* Comments list */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  comments.map((c, i) => (
                    <CommentCard key={c.id ?? i} comment={c} user={user} />
                  ))
                )}
                </div>
            </section>
          </>
        )}
      </main>

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
                <li>+977 9745375461</li>
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
