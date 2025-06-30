import { $, setHTML } from './domUtils.js';
let currentSort = { field: '', direction: 'asc' };
export let cachedItems = [];
function updateSortIndicators() {
    ['sortName', 'sortQuantity', 'sortCategory', 'sortDate'].forEach(id => {
        var _a;
        const btn = $(id);
        if (btn) {
            btn.classList.remove('sort-btn-active');
            btn.classList.add('sort-btn-inactive');
            btn.textContent = ((_a = btn.textContent) === null || _a === void 0 ? void 0 : _a.replace(/[↑↓↕]/g, '').trim()) || '';
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
            activeBtn.classList.remove('sort-btn-inactive');
            activeBtn.classList.add('sort-btn-active');
            const arrow = currentSort.direction === 'asc' ? '↑' : '↓';
            activeBtn.textContent = (activeBtn.textContent || '').replace(/[↑↓↕]/g, '') + ' ' + arrow;
        }
    }
}
export function displaySortedItems() {
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
            Cantitate: <input type='number' value='${item.quantity || 0}' min='0' class='quantity-input' onchange='updateItemQuantity(${item.id}, this.value)'>
            | Prag notificare: ${item.notification_threshold || 0}
            ${item.created_at ? `| Adăugat: ${new Date(item.created_at).toLocaleDateString('ro-RO')}` : ''}
            ${item.custom_notification_enabled ? ` <span class="notification-custom">[Notificare: ${item.notification_type}]</span>` : ''}
            <button class="delete-btn" onclick="deleteItem(${item.id})">Șterge</button>
        </li>`).join(''));
}
function sortItems(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    updateSortIndicators();
    displaySortedItems();
}
function resetSort() {
    currentSort = { field: '', direction: 'asc' };
    updateSortIndicators();
    displaySortedItems();
}
export function setupSorting() {
    var _a, _b, _c, _d, _e;
    window.sortItems = sortItems;
    window.resetSort = resetSort;
    // Attach event listeners to sort buttons
    (_a = $('sortName')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => sortItems('name'));
    (_b = $('sortQuantity')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => sortItems('quantity'));
    (_c = $('sortCategory')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => sortItems('category'));
    (_d = $('sortDate')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => sortItems('created_at'));
    (_e = $('resetSort')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', resetSort);
}
