import { api } from './services/api';

document.getElementById('registerForm')!.onsubmit = async function (e) {
    e.preventDefault();
    const username = (document.getElementById('regUsername') as HTMLInputElement).value;
    const email = (document.getElementById('regEmail') as HTMLInputElement).value;
    const password = (document.getElementById('regPassword') as HTMLInputElement).value;
    const result = await api<any>('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
    alert(result.message || `Utilizator ${result.username} inregistrat!`);
    (document.getElementById('registerForm') as HTMLFormElement).reset();
};

document.getElementById('loginForm')!.onsubmit = async function (e) {
    e.preventDefault();
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    const result = await api<any>('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    if (result.token) {
        localStorage.setItem('userId', result.userId);
        localStorage.setItem('isAdmin', result.isAdmin);
        window.location.href = '/dashboard.html';
    } else {
        alert(result.message);
    }
};
