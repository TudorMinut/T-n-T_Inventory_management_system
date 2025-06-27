export function handleLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = function () {
            localStorage.removeItem('userId');
            localStorage.removeItem('isAdmin');
            window.location.href = '/';
        };
    }
}
