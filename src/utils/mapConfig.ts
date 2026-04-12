// Map configuration constants
export const MAPTILER_KEY = "bgOkxglp93JvbRZlJGpS";
export const STYLE_URL = `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`;
export const DEFAULT_CENTER: [number, number] = [44.8271, 41.7151]; // [lng, lat] — Tbilisi
export const DESTINATION: [number, number] = [44.8151, 41.7251]; // [lng, lat] — Rustaveli Avenue

// Helper to ensure coordinates are in [lng, lat] format
export const TO_LNGLAT = (coords: [number, number]): [number, number] => {
  return coords; // Already in [lng, lat] format
};
