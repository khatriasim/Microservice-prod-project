/* Shared property display helpers — used by /view_estate, /favourite and /view_property */

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

export function getPhotoUrl(id) {
  const photoId =
    LISTING_PHOTOS[(id - 1 + LISTING_PHOTOS.length) % LISTING_PHOTOS.length];
  return `${UNSPLASH_BASE}/${photoId}?auto=format&fit=crop&w=640&q=80`;
}

export function formatPrice(price) {
  if (price == null) return "Price on request";

  // NPR uses lakh (1,00,000) and crore (1,00,00,000) as the natural units
  if (price >= 1e7) return `Rs ${(price / 1e7).toFixed(2)} Crore`;
  if (price >= 1e5) return `Rs ${(price / 1e5).toFixed(2)} Lakh`;
  return `Rs ${price.toLocaleString("en-IN")}`;
}

export function formatArea(area) {
  if (area == null) return null;
  if (area >= 1e6) return `${(area / 1e6).toFixed(1)}M ft²`;
  if (area >= 1e3) return `${(area / 1e3).toFixed(1)}K ft²`;
  return `${Math.round(area).toLocaleString()} ft²`;
}

export const STATUS_STYLES = {
  available: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", label: "Available" },
  sold:      { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-200",    label: "Sold" },
  rented:    { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200",    label: "Rented" },
  pending:   { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   label: "Pending" },
};
const DEFAULT_STATUS = { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", label: "N/A" };

export function getStatus(status) {
  return STATUS_STYLES[status?.toLowerCase()] ?? { ...DEFAULT_STATUS, label: status ?? "N/A" };
}