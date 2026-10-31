import { secrets } from "base44:runtime";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.internationalPhoneNumber",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.location",
  "places.googleMapsUri",
  "places.priceLevel",
  "places.primaryTypeDisplayName",
].join(",");

const shape = (p) => ({
  id: p.id,
  name: p.displayName?.text || "",
  address: p.formattedAddress || "",
  rating: typeof p.rating === "number" ? p.rating : null,
  reviews: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
  phone: p.internationalPhoneNumber || p.nationalPhoneNumber || "",
  website: p.websiteUri || "",
  lat: p.location?.latitude ?? null,
  lng: p.location?.longitude ?? null,
  maps_url: p.googleMapsUri || "",
  price_level: p.priceLevel || null,
  kind: p.primaryTypeDisplayName?.text || "",
});

/**
 * Google Places API (New) — Text Search. Returns real places only; when no key is
 * configured it reports that instead of inventing venues.
 */
export async function searchPlacesApi({ query, lat, lng, radius = 8000, limit = 12 }) {
  const key = secrets.get("GOOGLE_MAPS_API_KEY");
  if (!key) return { configured: false, places: [] };
  if (!query || !query.trim()) return { configured: true, places: [] };

  const body = { textQuery: query.trim().slice(0, 220), maxResultCount: Math.min(limit, 20) };
  if (typeof lat === "number" && typeof lng === "number") {
    body.locationBias = {
      circle: { center: { latitude: lat, longitude: lng }, radius: Math.min(Math.max(radius, 500), 50000) },
    };
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    const keyProblem =
      res.status === 400 ||
      res.status === 403 ||
      /API key not valid|API_KEY_INVALID|PERMISSION_DENIED|not authorized/i.test(text);
    return {
      configured: true,
      places: [],
      error: keyProblem
        ? "The saved Google Maps key was rejected by Google. Check that it is a valid Places API (New) key with billing enabled and no HTTP-referrer restriction, then save it again on the Secrets page."
        : `Places API error (${res.status}): ${text.slice(0, 180)}`,
    };
  }

  const json = await res.json();
  const places = (json.places || []).map(shape).filter((p) => p.name && typeof p.lat === "number");
  return { configured: true, places };
}