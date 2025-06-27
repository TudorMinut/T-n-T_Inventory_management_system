import { handleLogout } from "./auth";

if (!localStorage.getItem('userId') || localStorage.getItem('isAdmin') !== 'true') {
    window.location.href = '/';
}

async function fetchUsers() {
    try {
        const res = await fetch('/api/users');
        const users = await res.json();
        const tbody = document.getElementById('usersTable')?.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (users.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="5">Nu există utilizatori în sistem.</td>';
            tbody.appendChild(tr);
            return;
        }

        users.forEach((user: { id: any; username: any; email: any; role: any; }) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${user.id}</td><td>${user.username}</td><td>${user.email}</td><td>${user.role}</td>`;

            const actions = document.createElement('td');
            if (user.role !== 'admin') {
                const promoteBtn = document.createElement('button');
                promoteBtn.textContent = 'Promoveaza admin';
                promoteBtn.onclick = async () => {
                    await fetch(`/api/users/${user.id}/promote`, { method: 'PUT' });
                    fetchUsers();
                };
                actions.appendChild(promoteBtn);
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Sterge';
            deleteBtn.onclick = async () => {
                if (confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
                    await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
                    fetchUsers();
                }
            };
            actions.appendChild(deleteBtn);
            tr.appendChild(actions);
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Eroare la încărcarea utilizatorilor:', error);
    }
}

// Fetch and display categories for admin
async function fetchAdminCategories() {
    try {
        const res = await fetch('/api/categories');
        const categories = await res.json();
        const ul = document.getElementById('adminCategoriesList');
        if (!ul) return;
        ul.innerHTML = categories.map((cat: any) => `<li>${cat.id}: ${cat.name}</li>`).join('');
    } catch (error) {
        console.error('Eroare la încărcarea categoriilor:', error);
    }
}

// Fetch and display items for admin
async function fetchAdminItems() {
    try {
        const res = await fetch('/api/items');
        const items = await res.json();
        const ul = document.getElementById('adminItemsList');
        if (!ul) return;
        ul.innerHTML = items.map((item: any) => `<li>${item.id}: ${item.name} (Categorie: ${item.category_name || 'Necategorizat'}, Cantitate: ${item.quantity})</li>`).join('');
    } catch (error) {
        console.error('Eroare la încărcarea articolelor:', error);
    }
}

// Configurez butonul de logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
});

// Inițializare
fetchUsers();
fetchAdminCategories();
fetchAdminItems();
