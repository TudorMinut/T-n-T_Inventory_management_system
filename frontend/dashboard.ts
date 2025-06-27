import { fetchCategories, addCategory } from './services/categories';
import { fetchItems, addItem } from './services/items';
import { fetchNotifications, setupCustomNotificationToggle, setupNotificationTypeToggle } from './services/notifications';
import { $ } from './services/dom';

// Verificare autentificare și inițializare
if (!localStorage.getItem('userId')) window.location.href = '/';
if (localStorage.getItem('isAdmin')) $('adminBtn')?.setAttribute('style', 'display:inline-block');
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
});

// Form handlers
$('categoryForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const categoryName = ($('categoryName') as HTMLInputElement).value;
    await addCategory(categoryName);
    (this as HTMLFormElement).reset();
});

$('itemForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const itemName = ($('itemName') as HTMLInputElement).value;
    const itemCategory = ($('itemCategory') as HTMLSelectElement).value;
    const itemQuantity = ($('itemQuantity') as HTMLInputElement).value;
    const itemThreshold = ($('itemThreshold') as HTMLInputElement).value;
    await addItem(itemName, parseInt(itemCategory), parseInt(itemQuantity), parseInt(itemThreshold));
    (this as HTMLFormElement).reset();
});

// Inițializare
fetchCategories();
fetchItems();
fetchNotifications();
setupCustomNotificationToggle();
setupNotificationTypeToggle();
