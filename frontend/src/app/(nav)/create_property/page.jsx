"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Ruler,
  FileText,
  Building2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  List,
  Building,
} from "lucide-react";

const GRAPHQL_URL = "http://localhost/graphql";

const CREATE_PROPERTY_MUTATION = `
mutation CreateProperty($input: CreatePropertyInput!) {
  createProperty(input: $input) {
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

function parsePrice(input) {
  if (!input) return null;
  const num = Number(input.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? null : num;
}

export default function CreatePropertyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    city: "",
    propertyType: "",
    description: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    address: "",
    status: "available",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const propertyTypes = [
    "Apartment",
    "House",
    "Villa",
    "Townhouse",
    "Land",
    "Commercial",
    "Office",
    "Retail",
    "Other",
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.price.trim()) newErrors.price = "Price is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.propertyType.trim()) newErrors.propertyType = "Property type is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.bedrooms.trim()) newErrors.bedrooms = "Bedrooms is required";
    if (!formData.bathrooms.trim()) newErrors.bathrooms = "Bathrooms is required";
    if (!formData.area.trim()) newErrors.area = "Area is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!validateForm()) return;

    setSubmitting(true);

    const variables = {
      input: {
        title: formData.title.trim(),
        price: parsePrice(formData.price),
        city: formData.city.trim(),
        status: formData.status || "available",
        propertyType: formData.propertyType,
        description: formData.description.trim(),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        address: formData.address.trim(),
      },
    };

    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: CREATE_PROPERTY_MUTATION, variables }),
      });
      const json = await res.json();

      if (json.errors) {
        throw new Error(json.errors[0]?.message || "Failed to create property");
      }

      setSubmitSuccess(true);
      // Redirect to the property view after a brief moment
      setTimeout(() => {
        router.push(`/view_property?id=${json.data.createProperty.id}`);
      }, 1500);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-dark-green" />
          <p className="text-slate-500">Checking authentication…</p>
        </div>
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
          <p className="text-slate-500 mb-8">
            You need to be logged in as an agent to create property listings.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-dark-green px-8 py-3 text-lg font-semibold text-white shadow-md shadow-dark-green/20 transition hover:bg-dark-green-hover"
          >
            <ArrowLeft size={18} />
            Sign In / Register
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-dark-green focus:ring-4 focus:ring-dark-green/10";
  const labelClass = "block mb-2 text-sm font-medium text-slate-700";
  const errorClass = "mt-1 text-sm text-red-600 flex items-center gap-1";

  return (
    <div className="bg-background flex flex-col min-h-[100dvh] overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-dark-green/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange text-white shadow-lg shadow-orange/30">
              <Home size={20} strokeWidth={2.2} />
            </span>
            <span className="font-serif-display text-xl tracking-wide text-dark-green">EstateHub</span>
          </Link>
          <Link
            href="/view_estate"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={16} />
            Back to Listings
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Sidebar / left nav */}
        <aside className="hidden md:block float-left w-56 shrink-0 sticky top-[4.5rem] self-start px-4 pt-8">
          <nav className="space-y-2">
            <Link
              href="/agent_prop"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-dark-green transition"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange/10 text-orange">
                <Building size={16} strokeWidth={2.2} />
              </span>
              <span>Your Properties</span>
            </Link>
          </nav>
        </aside>

        <div className="w-full border-b border-slate-100 bg-white/50">
          <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8 lg:py-10">
            <h1 className="font-serif-display text-4xl text-dark-green leading-tight">
              Create New Listing
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Fill in the details below to list your property on EstateHub
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-5 py-8 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-3xl w-full">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className={labelClass}>
                  <span className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    Property Title
                  </span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Modern Family Villa in Kathmandu"
                  className={`${inputClass} ${errors.title ? "border-red-300 focus:border-red-500" : ""}`}
                  disabled={submitting}
                />
                {errors.title && <p className={errorClass}><AlertCircle size={14} />{errors.title}</p>}
              </div>

              {/* Price */}
                <div>
  <label htmlFor="price" className={labelClass}>
    <span className="flex items-center gap-2">
      <span className="text-xs font-bold text-slate-400">Rs.</span>
      Price
    </span>
  </label>
  <div className="relative">
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
      Rs.
    </span>
    <input
      type="text"
      id="price"
      name="price"
      value={formData.price}
      onChange={handleChange}
      placeholder="e.g. 5000000 or 5 Crore"
      className={`${inputClass} pl-10 ${errors.price ? "border-red-300 focus:border-red-500" : ""}`}
      disabled={submitting}
    />
  </div>
  {errors.price && <p className={errorClass}><AlertCircle size={14} />{errors.price}</p>}
</div>

              {/* Status */}
              <div>
                <label className={labelClass}>Status</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: "available" }))}
                    className={`rounded-xl px-5 py-2.5 text-sm font-semibold border transition ${formData.status === "available" ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: "sold" }))}
                    className={`rounded-xl px-5 py-2.5 text-sm font-semibold border transition ${formData.status === "sold" ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}
                  >
                    Sold
                  </button>
                </div>
              </div>

              {/* City & Property Type - side by side */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className={labelClass}>
                    <span className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      City
                    </span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Kathmandu"
                    className={`${inputClass} ${errors.city ? "border-red-300 focus:border-red-500" : ""}`}
                    disabled={submitting}
                  />
                  {errors.city && <p className={errorClass}><AlertCircle size={14} />{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="propertyType" className={labelClass}>
                    <span className="flex items-center gap-2">
                      <Building2 size={16} className="text-slate-400" />
                      Property Type
                    </span>
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none cursor-pointer ${errors.propertyType ? "border-red-300 focus:border-red-500" : ""}`}
                    disabled={submitting}
                  >
                    <option value="">Select type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.propertyType && <p className={errorClass}><AlertCircle size={14} />{errors.propertyType}</p>}
                </div>
              </div>

              {/* Bedrooms, Bathrooms, Area - three columns */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="bedrooms" className={labelClass}>
                    <span className="flex items-center gap-2">
                      <Bed size={16} className="text-slate-400" />
                      Bedrooms
                    </span>
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    min="0"
                    max="20"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    className={`${inputClass} ${errors.bedrooms ? "border-red-300 focus:border-red-500" : ""}`}
                    disabled={submitting}
                  />
                  {errors.bedrooms && <p className={errorClass}><AlertCircle size={14} />{errors.bedrooms}</p>}
                </div>

                <div>
                  <label htmlFor="bathrooms" className={labelClass}>
                    <span className="flex items-center gap-2">
                      <Bath size={16} className="text-slate-400" />
                      Bathrooms
                    </span>
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    min="0"
                    max="20"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                    className={`${inputClass} ${errors.bathrooms ? "border-red-300 focus:border-red-500" : ""}`}
                    disabled={submitting}
                  />
                  {errors.bathrooms && <p className={errorClass}><AlertCircle size={14} />{errors.bathrooms}</p>}
                </div>

                <div>
                  <label htmlFor="area" className={labelClass}>
                    <span className="flex items-center gap-2">
                      <Ruler size={16} className="text-slate-400" />
                      Area (sq ft)
                    </span>
                  </label>
                  <input
                    type="number"
                    id="area"
                    name="area"
                    min="0"
                    max="100000"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. 2500"
                    className={`${inputClass} ${errors.area ? "border-red-300 focus:border-red-500" : ""}`}
                    disabled={submitting}
                  />
                  {errors.area && <p className={errorClass}><AlertCircle size={14} />{errors.area}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className={labelClass}>
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    Full Address
                  </span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 123 Main Street, Ward 5, Kathmandu"
                  className={`${inputClass} resize-none ${errors.address ? "border-red-300 focus:border-red-500" : ""}`}
                  disabled={submitting}
                />
                {errors.address && <p className={errorClass}><AlertCircle size={14} />{errors.address}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className={labelClass}>
                  <span className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    Description
                  </span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the property... highlight key features, amenities, nearby landmarks, etc."
                  className={`${inputClass} resize-none ${errors.description ? "border-red-300 focus:border-red-500" : ""}`}
                  disabled={submitting}
                />
                {errors.description && <p className={errorClass}><AlertCircle size={14} />{errors.description}</p>}
              </div>

              {/* Submit Error/Success */}
              {submitError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {submitSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-600 mt-0.5" />
                  <p className="text-sm text-emerald-700">
                    Property created successfully! Redirecting to your listing…
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange px-8 text-base font-semibold text-white shadow-md shadow-orange/20 transition duration-200 hover:bg-orange-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-orange/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Create Property Listing
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
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