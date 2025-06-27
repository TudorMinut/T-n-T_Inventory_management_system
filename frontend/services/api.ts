export async function api<T>(url: string, opts?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...opts,
        headers: {
            'Content-Type': 'application/json',
            ...opts?.headers,
        },
    });
    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }
    return response.json();
}
