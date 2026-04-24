// Returns the base URL for short links (e.g. "https://shw.link" or "http://localhost:3001")
// Reads from VITE_BASE_URL env var; falls back to the current window origin.
export function getBaseUrl() {
  return (import.meta.env.VITE_BASE_URL || window.location.origin).replace(/\/$/, '');
}

// Returns just the host portion for compact display (e.g. "shw.link" or "localhost:3001")
export function getBaseHost() {
  try {
    return new URL(getBaseUrl()).host;
  } catch {
    return getBaseUrl();
  }
}

// Returns the full short URL for a slug
export function shortUrl(slug) {
  return `${getBaseUrl()}/${slug}`;
}
