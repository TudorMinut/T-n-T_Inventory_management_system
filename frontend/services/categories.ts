// Funcții pentru gestionarea categoriilor
import { api } from './api';
import { $ } from './dom';

export async function fetchCategories() {
    const categories = await api<any[]>('/api/categories');
    const categoriesList = $('categoriesList');
    const itemCategory = $('itemCategory') as HTMLSelectElement;
    if (categoriesList) {
        categoriesList.innerHTML = categories.map(cat => `
            <li>
                ${cat.name}
                <button onclick="editCategory(${cat.id}, '${cat.name}')">Editeaza</button>
                <button onclick="deleteCategory(${cat.id})">Sterge</button>
            </li>
        `).join('');
    }
    if (itemCategory) {
        itemCategory.innerHTML = categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    }
}

export async function addCategory(name: string) {
    await api('/api/categories', { method: 'POST', body: JSON.stringify({ name }) });
    fetchCategories();
}

(window as any).deleteCategory = async (id: number) => {
    await api(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
};

(window as any).editCategory = async (id: number, currentName: string) => {
    const newName = prompt('Introduceti noul nume pentru categorie:', currentName);
    if (newName) {
        await api(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name: newName }) });
        fetchCategories();
    }
};
