// Verificare autentificare și inițializare
if (!localStorage.getItem('userId')) window.location.href = '/';
if (localStorage.getItem('isAdmin')) document.getElementById('adminBtn')?.setAttribute('style', 'display:inline-block');
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
});

// Utilitare DOM
const $ = (id: string) => document.getElementById(id);
const setHTML = (el: HTMLElement | null, html: string) => { if (el) el.innerHTML = html; };

// Notificare personalizată
$('customNotificationEnabled')?.addEventListener('change', function (this: HTMLInputElement) {
    if ($('notificationDetails')) $('notificationDetails')!.style.display = this.checked ? 'block' : 'none';
});
$('notificationType')?.addEventListener('change', function (this: HTMLSelectElement) {
    ['afterTimeOptions', 'periodicOptions', 'fixedDateOptions'].forEach(id => {
        if ($(id)) $(id)!.style.display = 'none';
    });
    const showMap: any = { 'after_time': 'afterTimeOptions', 'periodic': 'periodicOptions', 'fixed_date': 'fixedDateOptions' };
    if (showMap[this.value] && $(showMap[this.value])) $(showMap[this.value])!.style.display = 'block';
});

// API helpers
async function api<T>(url: string, opts?: RequestInit): Promise<T> {
    const res = await fetch(url, opts);
    if (!res.ok) throw await res.json();
    return res.json();
}

// Variabile pentru sortare
let currentSort = { field: '', direction: 'asc' };
let cachedItems: any[] = [];

// Funcții de sortare
function sortItems(field: string) {
    // Schimbă direcția dacă se sortează după același câmp
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
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
    ['sortName', 'sortQuantity', 'sortCategory', 'sortDate'].forEach(id => {
        const btn = $(id);
        if (btn) {
            btn.style.background = '';
            btn.style.color = '';
        }
    });

    if (currentSort.field) {
        const btnMap: any = {
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
            activeBtn.textContent = activeBtn.textContent?.replace(/[↑↓↕]/g, '') + ' ' + arrow;
        }
    }
}

function displaySortedItems() {
    let sortedItems = [...cachedItems];
    if (currentSort.field) {
        sortedItems.sort((a, b) => {
            let aVal, bVal;

            switch (currentSort.field) {
                case 'name':
                    aVal = a.name?.toLowerCase() || '';
                    bVal = b.name?.toLowerCase() || '';
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

            if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    setHTML($('itemsList'), sortedItems.map(item =>
        `<li>
            <strong>${item.name}</strong> 
            (Categorie: ${item.category_name || 'Necategorizat'}) 
            <br>
            Cantitate: <input type='number' value='${item.quantity || 0}' min='0' style='width:70px; margin: 2px;' onchange='window.updateItemQuantity(${item.id}, this.value)'>
            | Prag notificare: ${item.notification_threshold || 0}
            ${item.created_at ? `| Adăugat: ${new Date(item.created_at).toLocaleDateString('ro-RO')}` : ''}
            ${item.custom_notification_enabled ? ` <span style="color: blue;">[Notificare: ${item.notification_type}]</span>` : ''}
            <button onclick="window.deleteItem(${item.id})" class="delete-item-btn">Șterge</button>
        </li>`
    ).join(''));
}

// Categorii
async function fetchCategories() {
    const categories = await api<any[]>('/api/categories');
    setHTML($('categoriesList'), categories.map(cat =>
        `<li style="margin-bottom: 0.7em;">
            <span>${cat.id}: ${cat.name}</span>
            <div style="display: flex; flex-direction: row; gap: 0.5em; margin-top: 0.2em;">
                ${cat.name.toLowerCase() !== 'necategorizate' ? `<button style="width: 110px;" onclick="deleteCategory(${cat.id})">Șterge</button>` : ''}
                <button style="width: 110px;" onclick="editCategory(${cat.id}, '${cat.name.replace(/'/g, "\\'")}')">Editează</button>
            </div>
        </li>`
    ).join(''));
    setHTML($('itemCategory'), categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join(''));
}

// Articole
async function fetchItems() {
    try {
        const items = await api<any[]>('/api/items');
        console.log('Items received:', items); // Debug log
        cachedItems = items; // Salvează articolele în cache
        displaySortedItems(); // Afișează articolele sortate
    } catch (error) {
        console.error('Error fetching items:', error);
        setHTML($('itemsList'), '<li>Eroare la încărcarea articolelor</li>');
    }
}

// Notificări
async function fetchNotifications() {
    const notifications = await api<any[]>('/api/notifications');
    setHTML($('notificationsList'), notifications.map(notif =>
        `<li>[${new Date(notif.created_at).toLocaleString()}] ${notif.message}${notif.notification_type && notif.notification_type !== 'stock_low' ? ` (${notif.notification_type})` : ''}</li>`
    ).join(''));
}

// Operații CRUD expuse global
(window as any).deleteItem = async (id: number) => {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    fetchItems();
};
(window as any).deleteCategory = async (id: number) => {
    if (confirm('Ești sigur că vrei să ștergi această categorie? Articolele din această categorie vor fi mutate în categoria "Necategorizate".')) {
        try { await fetch(`/api/categories/${id}`, { method: 'DELETE' }); fetchCategories(); fetchItems(); } catch { alert('Eroare la ștergerea categoriei'); }
    }
};
(window as any).editCategory = async (id: number, currentName: string) => {
    const newName = prompt('Introdu noul nume pentru categorie:', currentName);
    if (newName && newName.trim() && newName !== currentName) {
        try { await fetch(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName }) }); fetchCategories(); } catch { alert('Eroare la actualizarea categoriei'); }
    }
};
(window as any).updateItemQuantity = async (id: number, newQuantity: string) => {
    if (!/^[0-9]+$/.test(newQuantity)) return alert('Cantitatea trebuie să fie un număr pozitiv!');
    try { await fetch(`/api/items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: parseInt(newQuantity) }) }); fetchItems(); } catch { alert('Eroare la actualizarea cantității'); }
};
// Funcții de sortare expuse global
(window as any).sortItems = sortItems;
(window as any).resetSort = resetSort;

// Form handlers
$('categoryForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = ($('categoryName') as HTMLInputElement)?.value;
    if (name) { await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }); (this as HTMLFormElement).reset(); fetchCategories(); }
});
$('itemForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const itemName = $('itemName') as HTMLInputElement, itemCategory = $('itemCategory') as HTMLSelectElement, itemQuantity = $('itemQuantity') as HTMLInputElement, itemThreshold = $('itemThreshold') as HTMLInputElement, customNotification = $('customNotificationEnabled') as HTMLInputElement;
    if (!itemName || !itemCategory || !itemQuantity || !itemThreshold) return;
    const data: any = { name: itemName.value, category_id: itemCategory.value, quantity: itemQuantity.value, notification_threshold: itemThreshold.value };
    if (customNotification && customNotification.checked) {
        const notifType = $('notificationType') as HTMLSelectElement, customMessage = $('customMessage') as HTMLInputElement;
        if (notifType) {
            data.custom_notification_enabled = true;
            data.notification_type = notifType.value;
            if (customMessage) data.notification_message = customMessage.value;
            if (notifType.value === 'after_time') data.notification_after_minutes = parseInt(($('afterMinutes') as HTMLInputElement)?.value) || 60;
            if (notifType.value === 'periodic') data.notification_interval_minutes = parseInt(($('intervalMinutes') as HTMLInputElement)?.value) || 60;
            if (notifType.value === 'fixed_date') data.notification_fixed_date = new Date(($('fixedDateTime') as HTMLInputElement)?.value).toISOString();
        }
    }
    try { await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); (this as HTMLFormElement).reset(); if ($('notificationDetails')) $('notificationDetails')!.style.display = 'none'; fetchItems(); } catch (err: any) { alert('Eroare: ' + (err?.message || 'la adăugarea articolului')); }
});

// Inițializare
fetchCategories();
fetchItems();
fetchNotifications();
setInterval(fetchNotifications, 15000);
