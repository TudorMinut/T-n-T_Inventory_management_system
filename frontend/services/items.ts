// Funcții pentru gestionarea articolelor
import { api } from './api';
import { $ } from './dom';
import { fetchCategories } from './categories';

let cachedItems: any[] = [];
let currentSort = { field: '', direction: 'asc' };

export async function fetchItems() {
    cachedItems = await api<any[]>('/api/items');
    displaySortedItems();
    updateSortIndicators();
}

function sortItems(field: string) {
    const direction = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
    currentSort = { field, direction };
    displaySortedItems();
    updateSortIndicators();
}

function resetSort() {
    currentSort = { field: '', direction: 'asc' };
    displaySortedItems();
    updateSortIndicators();
}

function updateSortIndicators() {
    document.querySelectorAll('.sort-indicator').forEach(el => el.remove());
    if (currentSort.field) {
        const header = document.querySelector(`[onclick="sortItems('${currentSort.field}')"]`);
        if (header) {
            const indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            indicator.textContent = currentSort.direction === 'asc' ? ' ▲' : ' ▼';
            header.appendChild(indicator);
        }
    }
}

function displaySortedItems() {
    const itemsList = $('itemsList');
    if (!itemsList) return;

    let itemsToDisplay = [...cachedItems];
    if (currentSort.field) {
        itemsToDisplay.sort((a, b) => {
            const field = currentSort.field as keyof typeof a;
            if (a[field] < b[field]) return currentSort.direction === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    itemsList.innerHTML = itemsToDisplay.map(item => `
        <li>
            ${item.name} - Cantitate: <input type="number" value="${item.quantity}" onchange="updateItemQuantity(${item.id}, this.value)" />
            (Prag: ${item.notification_threshold})
            <button onclick="deleteItem(${item.id})">Sterge</button>
        </li>
    `).join('');
}

export async function addItem(name: string, categoryId: number, quantity: number, threshold: number) {
    await api('/api/items', { method: 'POST', body: JSON.stringify({ name, category_id: categoryId, quantity, notification_threshold: threshold }) });
    fetchItems();
}

(window as any).deleteItem = async (id: number) => {
    await api(`/api/items/${id}`, { method: 'DELETE' });
    fetchItems();
};

(window as any).updateItemQuantity = async (id: number, newQuantity: string) => {
    await api(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify({ quantity: parseInt(newQuantity, 10) }) });
    // Nu re-fetchuim tot, doar actualizam vizual dacă e necesar sau lăsăm așa
};

(window as any).sortItems = sortItems;
(window as any).resetSort = resetSort;
