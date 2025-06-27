import { handleLogout } from "./auth";

if (!localStorage.getItem('userId') || !localStorage.getItem('isAdmin')) {
    window.location.href = '/';
}

handleLogout();

async function fetchUsers() {
    const res = await fetch('/api/users');
    const users = await res.json();
    const tbody = document.getElementById('usersTable')?.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
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
            await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
            fetchUsers();
        };
        actions.appendChild(deleteBtn);
        tr.appendChild(actions);
        tbody.appendChild(tr);
    });
}

fetchUsers();
