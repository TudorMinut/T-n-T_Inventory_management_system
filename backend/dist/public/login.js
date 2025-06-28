"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
(_a = document.getElementById('registerForm')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const res = yield fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const result = yield res.json();
        alert(result.message || `Utilizator ${result.username} inregistrat!`);
        document.getElementById('registerForm').reset();
    });
});
(_b = document.getElementById('loginForm')) === null || _b === void 0 ? void 0 : _b.addEventListener('submit', function (e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const res = yield fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = yield res.json();
        if (res.ok) {
            localStorage.setItem('userId', result.userId);
            if (result.isAdmin) {
                localStorage.setItem('isAdmin', 'true');
            }
            window.location.href = '/dashboard.html';
        }
        else {
            alert(result.message);
        }
        document.getElementById('loginForm').reset();
    });
});
