import { setupAuth } from './auth.js';
import { fetchCategories, setupCategoryForm } from './categories.js';
import { fetchItems, setupItemForm } from './items.js';
import { fetchNotifications, setupNotificationListeners } from './notifications.js';
import { setupSorting } from './sorting.js';
// Initializare
setupAuth();
setupCategoryForm();
setupItemForm();
setupNotificationListeners();
setupSorting();
fetchCategories();
fetchItems();
fetchNotifications();
setInterval(fetchNotifications, 15000);
