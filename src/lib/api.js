// src/lib/api.js
export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(opts.headers || {});
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;

  if (!isFormData) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...opts, headers, credentials: "include" });
  let data = {};
  try { data = await res.json(); } catch { }

  if (!res.ok) {
    const errMsg = data?.detail || data?.msg || `HTTP ${res.status}`;
    throw new Error(errMsg); // <-- ahora verás la causa real
  }
  return { data, res };
}
