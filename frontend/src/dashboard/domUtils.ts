export const $ = (id: string) => document.getElementById(id);
export const setHTML = (el: HTMLElement | null, html: string) => { if (el) el.innerHTML = html; };
