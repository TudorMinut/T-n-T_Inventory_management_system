import { api } from './api.js';
import { $ } from './domUtils.js';

export async function fetchCategories() {
    const categories = await api<any[]>('/api/categories');
    const categoriesList = $('categoriesList');
    if (categoriesList) {
        categoriesList.innerHTML = categories.map(cat =>
            `<li style="margin-bottom: 0.7em;">
                <span>${cat.id}: ${cat.name}</span>
                <div style="display: flex; flex-direction: row; gap: 0.5em; margin-top: 0.2em;">
                    ${cat.name.toLowerCase() !== 'necategorizate' ? `<button style="width: 110px;" onclick="deleteCategory(${cat.id})">Șterge</button>` : ''}
                    <button style="width: 110px;" onclick="editCategory(${cat.id}, '${cat.name.replace(/'/g, "\\'")}')">Editează</button>
                </div>
            </li>`
        ).join('');
    }
    const itemCategory = $('itemCategory') as HTMLSelectElement;
    if (itemCategory) {
        itemCategory.innerHTML = categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    }
}

export function setupCategoryForm() {
    $('categoryForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = ($('categoryName') as HTMLInputElement)?.value;
        if (name) {
            await api('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
            (this as HTMLFormElement).reset();
            fetchCategories();
        }
    });
}
