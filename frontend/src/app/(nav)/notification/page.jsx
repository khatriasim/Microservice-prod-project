"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Clock, Trash2, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";

const API = "http://localhost/api/blog";

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function NotificationPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/list-notification/`, {
        credentials: "include",
      });
      const data = res.ok ? await res.json() : [];
      setNotifications(Array.isArray(data) ? data : (data.results || []));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || authLoading) return;
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [user, authLoading, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${API}/notification/${id}/read/`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch(`${API}/mark-all/`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch {
      /* ignore */
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="h-full w-full flex flex-col overflow-y-auto bg-background">
      <SiteHeader active="notification" user={user} loading={authLoading} />

      <main className="mx-auto max-w-3xl px-4 pt-10 pb-16 w-full">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-dark-green hover:border-dark-green/20 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-dark-green px-3 py-1 text-xs font-bold text-white shadow-sm">
                <Bell size={13} strokeWidth={2.5} />
                {unreadCount} unread
              </span>
            )}
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="rounded-full bg-orange px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-hover transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Bell size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl font-serif-display font-bold text-dark-green leading-tight">
              Notifications
            </h1>
            <p className="text-sm text-gray-400">
              Updates from people you follow and interact with.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 space-y-3"
              >
                <div className="h-4 w-20 rounded-full bg-gray-200" />
                <div className="h-5 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-8 py-14 text-center">
            <Bell size={36} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-dark-green mb-1">
              No notifications yet
            </h3>
            <p className="text-sm text-gray-400">
              When someone interacts with your posts or follows you, you&apos;ll see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`relative rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
                  n.is_read ? "border-gray-100" : "border-indigo-600/20 ring-1 ring-indigo-600/10"
                }`}
              >
                {!n.is_read && (
                  <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white" />
                )}
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600/10 text-indigo-600">
                    <Bell size={18} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                        {n.notification_type ?? "update"}
                      </span>
                      <span className="text-[10px] text-gray-300">·</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(n.created_at)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-dark-green leading-relaxed mb-1">
                      <span className="font-bold text-indigo-700">{n.sender}</span>{" "}
                      {n.notification_type === "new_post"
                        ? "published a new post."
                        : n.notification_type === "like"
                        ? "liked your post."
                        : n.notification_type === "follow"
                        ? "started following you."
                        : n.notification_type === "comment"
                        ? "commented on your post."
                        : "interacted with you."}
                    </p>
                    {n.post && (
                      <Link
                        href={`/blog/${n.post}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 px-2.5 py-1 text-xs font-semibold text-dark-green hover:text-indigo-700 transition-colors mt-2"
                      >
                        View post →
                      </Link>
                    )}
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="shrink-0 rounded-full p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      aria-label="Mark as read"
                      title="Mark as read"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
