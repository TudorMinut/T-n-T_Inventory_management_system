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
var _a, _b, _c, _d, _e, _f;
// Verificare autentificare și inițializare
if (!localStorage.getItem('userId'))
    window.location.href = '/';
if (localStorage.getItem('isAdmin'))
    (_a = document.getElementById('adminBtn')) === null || _a === void 0 ? void 0 : _a.setAttribute('style', 'display:inline-block');
(_b = document.getElementById('logoutBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
});
// Utilitare DOM
const $ = (id) => document.getElementById(id);
const setHTML = (el, html) => { if (el)
    el.innerHTML = html; };
// Notificare personalizată
(_c = $('customNotificationEnabled')) === null || _c === void 0 ? void 0 : _c.addEventListener('change', function () {
    if ($('notificationDetails'))
        $('notificationDetails').style.display = this.checked ? 'block' : 'none';
});
(_d = $('notificationType')) === null || _d === void 0 ? void 0 : _d.addEventListener('change', function () {
    ['afterTimeOptions', 'periodicOptions', 'fixedDateOptions'].forEach(id => {
        if ($(id))
            $(id).style.display = 'none';
    });
    const showMap = { 'after_time': 'afterTimeOptions', 'periodic': 'periodicOptions', 'fixed_date': 'fixedDateOptions' };
    if (showMap[this.value] && $(showMap[this.value]))
        $(showMap[this.value]).style.display = 'block';
});
// API helpers
function api(url, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(url, opts);
        if (!res.ok)
            throw yield res.json();
        return res.json();
    });
}
// Variabile pentru sortare
let currentSort = { field: '', direction: 'asc' };
let cachedItems = [];
// Funcții de sortare
function sortItems(field) {
    // Schimbă direcția dacă se sortează după același câmp
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    // Actualizează indicatorii vizuali
    updateSortIndicators();
    // Sortează și afișează articolele
    displaySortedItems();
}
function resetSort() {
    currentSort = { field: '', direction: 'asc' };
    updateSortIndicators();
    displaySortedItems();
}
function updateSortIndicators() {
    var _a;
    ['sortName', 'sortQuantity', 'sortCategory', 'sortDate'].forEach(id => {
        const btn = $(id);
        if (btn) {
            btn.style.background = '';
            btn.style.color = '';
        }
    });
    if (currentSort.field) {
        const btnMap = {
            'name': 'sortName',
            'quantity': 'sortQuantity',
            'category': 'sortCategory',
            'created_at': 'sortDate'
        };
        const activeBtn = $(btnMap[currentSort.field]);
        if (activeBtn) {
            activeBtn.style.background = '#007cba';
            activeBtn.style.color = 'white';
            const arrow = currentSort.direction === 'asc' ? '↑' : '↓';
            activeBtn.textContent = ((_a = activeBtn.textContent) === null || _a === void 0 ? void 0 : _a.replace(/[↑↓↕]/g, '')) + ' ' + arrow;
        }
    }
}
function displaySortedItems() {
    let sortedItems = [...cachedItems];
    if (currentSort.field) {
        sortedItems.sort((a, b) => {
            var _a, _b;
            let aVal, bVal;
            switch (currentSort.field) {
                case 'name':
                    aVal = ((_a = a.name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                    bVal = ((_b = b.name) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
                    break;
                case 'quantity':
                    aVal = parseInt(a.quantity) || 0;
                    bVal = parseInt(b.quantity) || 0;
                    break;
                case 'category':
                    aVal = (a.category_name || 'Necategorizat').toLowerCase();
                    bVal = (b.category_name || 'Necategorizat').toLowerCase();
                    break;
                case 'created_at':
                    aVal = new Date(a.created_at || 0).getTime();
                    bVal = new Date(b.created_at || 0).getTime();
                    break;
                default:
                    return 0;
            }
            if (aVal < bVal)
                return currentSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal)
                return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    setHTML($('itemsList'), sortedItems.map(item => `<li>
            <strong>${item.name}</strong> 
            (Categorie: ${item.category_name || 'Necategorizat'}) 
            <br>
            Cantitate: <input type='number' value='${item.quantity || 0}' min='0' style='width:70px; margin: 2px;' onchange='updateItemQuantity(${item.id}, this.value)'>
            | Prag notificare: ${item.notification_threshold || 0}
            ${item.created_at ? `| Adăugat: ${new Date(item.created_at).toLocaleDateString('ro-RO')}` : ''}
            ${item.custom_notification_enabled ? ` <span style="color: blue;">[Notificare: ${item.notification_type}]</span>` : ''}
            <button onclick="deleteItem(${item.id})" style="margin-left: 10px; background: #ff4444; color: white; border: none; padding: 2px 8px; border-radius: 3px;">Șterge</button>
        </li>`).join(''));
}
// Categorii
function fetchCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        const categories = yield api('/api/categories');
        setHTML($('categoriesList'), categories.map(cat => `<li style="margin-bottom: 0.7em;">
            <span>${cat.id}: ${cat.name}</span>
            <div style="display: flex; flex-direction: row; gap: 0.5em; margin-top: 0.2em;">
                ${cat.name.toLowerCase() !== 'necategorizate' ? `<button style="width: 110px;" onclick="deleteCategory(${cat.id})">Șterge</button>` : ''}
                <button style="width: 110px;" onclick="editCategory(${cat.id}, '${cat.name.replace(/'/g, "\\'")}')">Editează</button>
            </div>
        </li>`).join(''));
        setHTML($('itemCategory'), categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join(''));
    });
}
// Articole
function fetchItems() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const items = yield api('/api/items');
            console.log('Items received:', items); // Debug log
            cachedItems = items; // Salvează articolele în cache
            displaySortedItems(); // Afișează articolele sortate
        }
        catch (error) {
            console.error('Error fetching items:', error);
            setHTML($('itemsList'), '<li>Eroare la încărcarea articolelor</li>');
        }
    });
}
// Notificări
function fetchNotifications() {
    return __awaiter(this, void 0, void 0, function* () {
        const notifications = yield api('/api/notifications');
        setHTML($('notificationsList'), notifications.map(notif => `<li>[${new Date(notif.created_at).toLocaleString()}] ${notif.message}${notif.notification_type && notif.notification_type !== 'stock_low' ? ` (${notif.notification_type})` : ''}</li>`).join(''));
    });
}
// Operații CRUD expuse global
window.deleteItem = (id) => __awaiter(void 0, void 0, void 0, function* () { yield fetch(`/api/items/${id}`, { method: 'DELETE' }); fetchItems(); });
window.deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (confirm('Ești sigur că vrei să ștergi această categorie? Articolele din această categorie vor fi mutate în categoria "Necategorizate".')) {
        try {
            yield fetch(`/api/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
            fetchItems();
        }
        catch (_a) {
            alert('Eroare la ștergerea categoriei');
        }
    }
});
window.editCategory = (id, currentName) => __awaiter(void 0, void 0, void 0, function* () {
    const newName = prompt('Introdu noul nume pentru categorie:', currentName);
    if (newName && newName.trim() && newName !== currentName) {
        try {
            yield fetch(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName }) });
            fetchCategories();
        }
        catch (_a) {
            alert('Eroare la actualizarea categoriei');
        }
    }
});
window.updateItemQuantity = (id, newQuantity) => __awaiter(void 0, void 0, void 0, function* () {
    if (!/^[0-9]+$/.test(newQuantity))
        return alert('Cantitatea trebuie să fie un număr pozitiv!');
    try {
        yield fetch(`/api/items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: parseInt(newQuantity) }) });
        fetchItems();
    }
    catch (_a) {
        alert('Eroare la actualizarea cantității');
    }
});
// Funcții de sortare expuse global
window.sortItems = sortItems;
window.resetSort = resetSort;
// Form handlers
(_e = $('categoryForm')) === null || _e === void 0 ? void 0 : _e.addEventListener('submit', function (e) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        e.preventDefault();
        const name = (_a = $('categoryName')) === null || _a === void 0 ? void 0 : _a.value;
        if (name) {
            yield fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
            this.reset();
            fetchCategories();
        }
    });
});
(_f = $('itemForm')) === null || _f === void 0 ? void 0 : _f.addEventListener('submit', function (e) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        e.preventDefault();
        const itemName = $('itemName'), itemCategory = $('itemCategory'), itemQuantity = $('itemQuantity'), itemThreshold = $('itemThreshold'), customNotification = $('customNotificationEnabled');
        if (!itemName || !itemCategory || !itemQuantity || !itemThreshold)
            return;
        const data = { name: itemName.value, category_id: itemCategory.value, quantity: itemQuantity.value, notification_threshold: itemThreshold.value };
        if (customNotification && customNotification.checked) {
            const notifType = $('notificationType'), customMessage = $('customMessage');
            if (notifType) {
                data.custom_notification_enabled = true;
                data.notification_type = notifType.value;
                if (customMessage)
                    data.notification_message = customMessage.value;
                if (notifType.value === 'after_time')
                    data.notification_after_minutes = parseInt((_a = $('afterMinutes')) === null || _a === void 0 ? void 0 : _a.value) || 60;
                if (notifType.value === 'periodic')
                    data.notification_interval_minutes = parseInt((_b = $('intervalMinutes')) === null || _b === void 0 ? void 0 : _b.value) || 60;
                if (notifType.value === 'fixed_date')
                    data.notification_fixed_date = new Date((_c = $('fixedDateTime')) === null || _c === void 0 ? void 0 : _c.value).toISOString();
            }
        }
        try {
            yield fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            this.reset();
            if ($('notificationDetails'))
                $('notificationDetails').style.display = 'none';
            fetchItems();
        }
        catch (err) {
            alert('Eroare: ' + ((err === null || err === void 0 ? void 0 : err.message) || 'la adăugarea articolului'));
        }
    });
});
// Inițializare
fetchCategories();
fetchItems();
fetchNotifications();
setInterval(fetchNotifications, 15000);
