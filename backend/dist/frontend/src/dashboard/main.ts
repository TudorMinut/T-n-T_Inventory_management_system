import { setupAuth } from './auth';
import { fetchCategories, setupCategoryForm } from './categories';
import { fetchItems, setupItemForm } from './items';
import { fetchNotifications, setupNotificationListeners } from './notifications';
import { setupSorting } from './sorting';

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
