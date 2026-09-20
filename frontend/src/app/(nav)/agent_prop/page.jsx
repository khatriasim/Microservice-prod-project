"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  Home,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PenSquare,
  Trash2,
  Building2,
  Eye,
} from "lucide-react";

const GRAPHQL_URL = "http://localhost/graphql";

const AGENT_PROPERTIES_QUERY = `
query AgentProperties {
  properties {
    id
    title
    price
    city
    status
    agentId
    agentName
    description
    bedrooms
    bathrooms
    area
    address
    propertyType
  }
}
`;

const UPDATE_PROPERTY_MUTATION = `
mutation UpdateProperty($id: Int!, $input: UpdatePropertyInput!) {
  updateProperty(id: $id, input: $input) {
    id
    title
    price
    city
    status
    agentId
    agentName
    description
    bedrooms
    bathrooms
    area
    address
    propertyType
  }
}
`;

const PROPERTY_BOOKINGS_QUERY = `
query PropertyBookings($propertyId: Int!) {
  propertyBookings(propertyId: $propertyId) {
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

const DELETE_PROPERTY_MUTATION = `
mutation DeleteProperty($id: Int!) {
  deleteProperty(id: $id)
}
`;

export default function AgentPropPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showBookingsId, setShowBookingsId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function fetchProperties() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: AGENT_PROPERTIES_QUERY }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message || "Failed to load properties");
      // Filter to agent-owned only (backend authorization is by agent_user_id)
      const agentId = user?.id || user?.user_id;
      const list = (json.data?.properties || []).filter(
        (p) => String(p.agentId) === String(agentId)
      );
      setProperties(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchProperties();
    }
  // Only run when auth/user changes; fetchProperties is intentionally called inside
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      title: p.title || "",
      price: p.price != null ? String(p.price) : "",
      city: p.city || "",
      status: p.status || "available",
      description: p.description || "",
      address: p.address || "",
      propertyType: p.propertyType || "",
      bedrooms: p.bedrooms != null ? String(p.bedrooms) : "",
      bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
      area: p.area != null ? String(p.area) : "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitUpdate = async (id) => {
    setSubmitting(true);
    setError("");
    try {
      const input = {};
      if (editForm.title != null) input.title = editForm.title.trim() || undefined;
      if (editForm.price != null && editForm.price.trim() !== "") input.price = Number(editForm.price);
      if (editForm.city != null) input.city = editForm.city.trim() || undefined;
      if (editForm.status != null) input.status = editForm.status || undefined;
      if (editForm.description != null) input.description = editForm.description.trim() || undefined;
      if (editForm.address != null) input.address = editForm.address.trim() || undefined;
      if (editForm.propertyType != null) input.propertyType = editForm.propertyType || undefined;
      if (editForm.bedrooms != null && editForm.bedrooms.trim() !== "") input.bedrooms = Number(editForm.bedrooms);
      if (editForm.bathrooms != null && editForm.bathrooms.trim() !== "") input.bathrooms = Number(editForm.bathrooms);
      if (editForm.area != null && editForm.area.trim() !== "") input.area = Number(editForm.area);

      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: UPDATE_PROPERTY_MUTATION,
          variables: { id, input },
        }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message || "Failed to update property");
      setEditingId(null);
      fetchProperties();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchBookings = async (propertyId) => {
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: PROPERTY_BOOKINGS_QUERY,
          variables: { propertyId },
        }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message || "Failed to load bookings");
      setBookings(json.data?.propertyBookings || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: DELETE_PROPERTY_MUTATION,
          variables: { id },
        }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message || "Failed to delete property");
      setDeleteConfirmId(null);
      fetchProperties();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="font-serif-display text-3xl text-dark-green mb-2">
            Agent Access Required
          </h1>
          <p className="text-slate-500 mb-8">Sign in to manage your listings.</p>
          <Link href="/auth" className="inline-flex items-center gap-2 rounded-xl bg-dark-green px-8 py-3 text-lg font-semibold text-white shadow-md shadow-dark-green/20 transition hover:bg-dark-green-hover">
            <ArrowLeft size={18} /> Sign In / Register
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-dark-green focus:ring-4 focus:ring-dark-green/10";

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
          <Link href="/create_property" className="inline-flex items-center gap-2 rounded-xl bg-dark-green px-4 py-2 text-sm font-medium text-white hover:bg-dark-green-hover transition shadow-md shadow-dark-green/10">
            <PenSquare size={16} /> Create New
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
          <div className="mb-8">
            <h1 className="font-serif-display text-4xl text-dark-green leading-tight">Your Properties</h1>
            <p className="mt-2 text-sm text-slate-500">Update or delete your listings below.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading your listings...
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="font-serif-display text-xl text-dark-green mb-2">No listings yet</h3>
              <p className="text-sm text-slate-500 mb-6">Create your first property to see it here.</p>
              <Link href="/create_property" className="inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange/20 hover:bg-orange-hover transition">
                <PenSquare size={16} /> Create Listing
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {properties.map((p) => (
                <div key={p.id} className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-serif-display text-xl text-dark-green">{p.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{p.city} · {p.propertyType || "—"}</p>
                    </div>
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${p.status === "available" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm text-slate-600 mb-4">
                    <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-400">Price</span><span className="font-medium">rs {Number(p.price || 0).toLocaleString()}</span></div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-400">Beds</span><span className="font-medium">{p.bedrooms || "—"}</span></div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-xs text-slate-400">Baths</span><span className="font-medium">{p.bathrooms || "—"}</span></div>
                  </div>

                  {editingId === p.id ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input name="title" value={editForm.title} onChange={handleEditChange} placeholder="Title" className={inputClass} disabled={submitting} />
                        <input name="price" value={editForm.price} onChange={handleEditChange} placeholder="Price" className={inputClass} disabled={submitting} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input name="city" value={editForm.city} onChange={handleEditChange} placeholder="City" className={inputClass} disabled={submitting} />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, status: "available" }))}
                          className={`rounded-lg px-4 py-2 text-sm font-medium border transition ${editForm.status === "available" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        >
                          Available
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, status: "sold" }))}
                          className={`rounded-lg px-4 py-2 text-sm font-medium border transition ${editForm.status === "sold" ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        >
                          Sold
                        </button>
                      </div>
                      </div>
                      <textarea name="description" value={editForm.description || ""} onChange={handleEditChange} rows={3} placeholder="Description" className={`${inputClass} resize-none`} disabled={submitting} />
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => submitUpdate(p.id)} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-dark-green px-4 py-2 text-sm font-medium text-white hover:bg-dark-green-hover transition disabled:opacity-60">Save</button>
                        <button onClick={() => setEditingId(null)} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button onClick={() => startEdit(p)} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition">
                        <PenSquare size={14} /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirmId(p.id)} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition">
                        <Trash2 size={14} /> Delete
                      </button>
                      <button
                        onClick={() => {
                          setShowBookingsId(showBookingsId === p.id ? null : p.id);
                          if (showBookingsId !== p.id) fetchBookings(p.id);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        <Eye size={14} /> View Bookings
                      </button>
                    </div>
                  )}

                  {showBookingsId === p.id && (
                    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                      <h4 className="text-sm font-semibold text-indigo-900 mb-3">Bookings for this property</h4>
                      {bookings.length === 0 ? (
                        <p className="text-sm text-slate-500">No bookings yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {bookings.map((b) => (
                            <li key={b.id} className="text-sm text-slate-700 bg-white rounded-lg px-3 py-2 border border-indigo-100 shadow-sm">
                              <span className="font-medium">Buyer ID:</span> {b.buyerId} · <span className="font-medium">Status:</span> {b.status} · <span className="font-medium">Date:</span> {b.bookingDate || "—"}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {deleteConfirmId === p.id && (
                    <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-between gap-3">
                      <p className="text-sm text-red-700">Are you sure you want to delete this property?</p>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleDelete(p.id)} disabled={submitting} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-60">Confirm</button>
                        <button onClick={() => setDeleteConfirmId(null)} disabled={submitting} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 transition">Cancel</button>
                      </div>
                    </div>
                  )}
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
