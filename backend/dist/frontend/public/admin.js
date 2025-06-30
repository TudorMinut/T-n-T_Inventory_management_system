var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
if (!localStorage.getItem('userId') || localStorage.getItem('isAdmin') !== 'true') {
    window.location.href = '/';
}
function fetchUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const res = yield fetch('/api/users');
            const users = yield res.json();
            const tbody = (_a = document.getElementById('usersTable')) === null || _a === void 0 ? void 0 : _a.querySelector('tbody');
            if (!tbody)
                return;
            tbody.innerHTML = '';
            if (users.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="5">Nu există utilizatori în sistem.</td>';
                tbody.appendChild(tr);
                return;
            }
            users.forEach((user) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${user.id}</td><td>${user.username}</td><td>${user.email}</td><td>${user.role}</td>`;
                const actions = document.createElement('td');
                if (user.role !== 'admin') {
                    const promoteBtn = document.createElement('button');
                    promoteBtn.textContent = 'Promoveaza admin';
                    promoteBtn.onclick = () => __awaiter(this, void 0, void 0, function* () {
                        yield fetch(`/api/users/${user.id}/promote`, { method: 'PUT' });
                        fetchUsers();
                    });
                    actions.appendChild(promoteBtn);
                }
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Sterge';
                deleteBtn.onclick = () => __awaiter(this, void 0, void 0, function* () {
                    if (confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
                        yield fetch(`/api/users/${user.id}`, { method: 'DELETE' });
                        fetchUsers();
                    }
                });
                actions.appendChild(deleteBtn);
                tr.appendChild(actions);
                tbody.appendChild(tr);
            });
        }
        catch (error) {
            console.error('Eroare la încărcarea utilizatorilor:', error);
        }
    });
}
// Fetch and display categories for admin
function fetchAdminCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch('/api/categories');
            const categories = yield res.json();
            const ul = document.getElementById('adminCategoriesList');
            if (!ul)
                return;
            ul.innerHTML = categories.map((cat) => `<li>${cat.id}: ${cat.name}</li>`).join('');
        }
        catch (error) {
            console.error('Eroare la încărcarea categoriilor:', error);
        }
    });
}
// Fetch and display items for admin
function fetchAdminItems() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch('/api/items');
            const items = yield res.json();
            const ul = document.getElementById('adminItemsList');
            if (!ul)
                return;
            ul.innerHTML = items.map((item) => `<li>${item.id}: ${item.name} (Categorie: ${item.category_name || 'Necategorizat'}, Cantitate: ${item.quantity})</li>`).join('');
        }
        catch (error) {
            console.error('Eroare la încărcarea articolelor:', error);
        }
    });
}
// Configurez butonul de logout
(_a = document.getElementById('logoutBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
});
// Inițializare
fetchUsers();
fetchAdminCategories();
fetchAdminItems();
export {};
