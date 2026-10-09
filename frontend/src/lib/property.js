/* Shared property display helpers — used by /view_estate, /favourite and /view_property */

const LISTING_PHOTOS = [
  "/ChatGPT Image Sep 13, 2026, 05_05_49 PM.png",
];

const PROPERTY_API_URL = process.env.NEXT_PUBLIC_PROPERTY_API_URL || "http://localhost";

/** Converts a property-service image path into a browser-accessible URL. */
export function getPropertyImageUrl(imageUrl, fallbackId) {
  if (!imageUrl) return getPhotoUrl(fallbackId);
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${PROPERTY_API_URL}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}
export function getPhotoUrl(id) {
  const photoId =
    LISTING_PHOTOS[(id - 1 + LISTING_PHOTOS.length) % LISTING_PHOTOS.length];
  return photoId;
}
export function buildWhatsAppLink(phone, propertyId, propertyTitle) {
  if (!phone) return null;

  // Strip anything that isn't a digit (spaces, +, dashes, parentheses)
  const cleanPhone = phone.replace(/\D/g, "");

  const message = `Hi, I'm interested in your property "${propertyTitle}" (ID: ${propertyId}). Is it still available?`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
export function resolveImageUrl(property) {
  if (!property) return getPhotoUrl(1);
  return property.imageUrl
    ? `http://localhost${property.imageUrl}`
    : getPhotoUrl(property.id);
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
  if (area >= 1e6) return `${(area / 1e6).toFixed(1)}M`;
  if (area >= 1e3) return `${(area / 1e3).toFixed(1)}K `;
  return `${Math.round(area).toLocaleString()} `;
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
