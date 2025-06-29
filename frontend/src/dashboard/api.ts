// API helpers
export async function api<T>(url: string, opts?: RequestInit): Promise<T> {
    const res = await fetch(url, opts);
    if (!res.ok) throw await res.json();
    return res.json();
}
