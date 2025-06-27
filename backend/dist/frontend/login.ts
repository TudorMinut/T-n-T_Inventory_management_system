
document.getElementById('registerForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = (document.getElementById('regUsername') as HTMLInputElement).value;
    const email = (document.getElementById('regEmail') as HTMLInputElement).value;
    const password = (document.getElementById('regPassword') as HTMLInputElement).value;
    const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    const result = await res.json();
    alert(result.message || `Utilizator ${result.username} inregistrat!`);
    (document.getElementById('registerForm') as HTMLFormElement).reset();
});

document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const result = await res.json();
    if (res.ok) {
        localStorage.setItem('userId', result.userId);
        if (result.isAdmin) {
            localStorage.setItem('isAdmin', 'true');
        }
        window.location.href = '/dashboard.html';
    } else {
        alert(result.message);
    }
    (document.getElementById('loginForm') as HTMLFormElement).reset();
});
