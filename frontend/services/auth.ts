export function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    window.location.href = '/login.html';
}
