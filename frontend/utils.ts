// Utilitare DOM
export const $ = (id: string): HTMLElement | null => document.getElementById(id);

export const setHTML = (el: HTMLElement | null, html: string): void => {
    if (el) {
        el.innerHTML = html;
    }
};

// API helper
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
