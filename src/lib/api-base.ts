const CLIENT_API_BASE = (process.env.NEXT_PUBLIC_API_URL || "/backend").replace(/\/+$/, "");

function serverApiBase() {
  const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "").replace(/\/api$/, "");
  if (!backendUrl) {
    throw new Error("BACKEND_URL must be set for server-side API requests.");
  }
  return backendUrl;
}

// Browser requests stay same-origin and are rewritten by Next.js. Server-rendered
// requests skip that proxy and communicate directly with the backend.
export const API_BASE = typeof window === "undefined" ? serverApiBase() : CLIENT_API_BASE;

export { serverApiBase };
