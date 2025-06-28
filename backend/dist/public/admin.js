var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { handleLogout } from "./auth";
if (!localStorage.getItem('userId') || !localStorage.getItem('isAdmin')) {
    window.location.href = '/';
}
handleLogout();
function fetchUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const res = yield fetch('/api/users');
        const users = yield res.json();
        const tbody = (_a = document.getElementById('usersTable')) === null || _a === void 0 ? void 0 : _a.querySelector('tbody');
        if (!tbody)
            return;
        tbody.innerHTML = '';
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
                yield fetch(`/api/users/${user.id}`, { method: 'DELETE' });
                fetchUsers();
            });
            actions.appendChild(deleteBtn);
            tr.appendChild(actions);
            tbody.appendChild(tr);
        });
    });
}
fetchUsers();
