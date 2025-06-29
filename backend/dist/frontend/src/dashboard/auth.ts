export function setupAuth() {
    if (!localStorage.getItem('userId')) window.location.href = '/';
    if (localStorage.getItem('isAdmin')) document.getElementById('adminBtn')?.classList.add('admin-btn-visible');
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('isAdmin');
        window.location.href = '/';
    });
}
