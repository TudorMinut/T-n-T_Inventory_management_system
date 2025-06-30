import { $, setHTML } from './domUtils.js';
import { fetchItems } from './items.js';

let currentSort = { field: '', direction: 'asc' };
export let cachedItems: any[] = [];

function updateSortIndicators() {
    ['sortName', 'sortQuantity', 'sortCategory', 'sortDate'].forEach(id => {
        const btn = $(id);
        if (btn) {
            btn.classList.remove('sort-btn-active');
            btn.classList.add('sort-btn-inactive');
            btn.textContent = btn.textContent?.replace(/[↑↓↕]/g, '').trim() || '';
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
            Cantitate: <input type='number' value='${item.quantity || 0}' min='0' class='quantity-input' onchange='updateItemQuantity(${item.id}, this.value)'>
            | Prag notificare: ${item.notification_threshold || 0}
            ${item.created_at ? `| Adăugat: ${new Date(item.created_at).toLocaleDateString('ro-RO')}` : ''}
            ${item.custom_notification_enabled ? ` <span class="notification-custom">[Notificare: ${item.notification_type}]</span>` : ''}
            <button class="delete-btn" onclick="deleteItem(${item.id})">Șterge</button>
        </li>`
    ).join(''));
}

function sortItems(field: string) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
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
    (window as any).sortItems = sortItems;
    (window as any).resetSort = resetSort;

    // Attach event listeners to sort buttons
    $('sortName')?.addEventListener('click', () => sortItems('name'));
    $('sortQuantity')?.addEventListener('click', () => sortItems('quantity'));
    $('sortCategory')?.addEventListener('click', () => sortItems('category'));
    $('sortDate')?.addEventListener('click', () => sortItems('created_at'));
    $('resetSort')?.addEventListener('click', resetSort);
}
