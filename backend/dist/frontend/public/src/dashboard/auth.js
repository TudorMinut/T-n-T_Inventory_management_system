export function setupAuth() {
    var _a, _b;
    if (!localStorage.getItem('userId'))
        window.location.href = '/';
    if (localStorage.getItem('isAdmin'))
        (_a = document.getElementById('adminBtn')) === null || _a === void 0 ? void 0 : _a.classList.add('admin-btn-visible');
    (_b = document.getElementById('logoutBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('isAdmin');
        window.location.href = '/';
    });
}
