const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function api(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error("Can't reach the server. Check that the backend is running."), { status: 0 });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.msg || "Something went wrong"), { status: res.status });
  }
  return data;
}
