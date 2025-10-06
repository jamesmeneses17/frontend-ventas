// Utility for server-side API calls
// Use only from Server Components or API routes to avoid referencing `window`/`localStorage`.

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/g, '');

export async function serverFetch(path: string, options?: RequestInit) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`serverFetch ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}
