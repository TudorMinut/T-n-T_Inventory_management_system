var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { api } from './api.js';
import { displaySortedItems, cachedItems } from './sorting.js';
export function fetchItems() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const items = yield api('/api/items');
            console.log('Items received:', items); // Debug log
            cachedItems.splice(0, cachedItems.length, ...items); // Actualizeaza cache-ul
            displaySortedItems(); // Afiseaza articolele sortate
        }
        catch (error) {
            console.error('Error fetching items:', error);
            const itemsList = document.getElementById('itemsList');
            if (itemsList) {
                itemsList.innerHTML = '<li>Eroare la incarcarea articolelor</li>';
            }
        }
    });
}
export function setupItemForm() {
    var _a;
    (_a = document.getElementById('itemForm')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', function (e) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            e.preventDefault();
            const itemName = document.getElementById('itemName'), itemCategory = document.getElementById('itemCategory'), itemQuantity = document.getElementById('itemQuantity'), itemThreshold = document.getElementById('itemThreshold'), customNotification = document.getElementById('customNotificationEnabled');
            if (!itemName || !itemCategory || !itemQuantity || !itemThreshold)
                return;
            const data = {
                name: itemName.value,
                category_id: itemCategory.value,
                quantity: itemQuantity.value,
                notification_threshold: itemThreshold.value
            };
            if (customNotification && customNotification.checked) {
                const notifType = document.getElementById('notificationType'), customMessage = document.getElementById('customMessage'), notificationForSelf = document.getElementById('notificationForSelf');
                if (notifType) {
                    data.custom_notification_enabled = true;
                    data.notification_type = notifType.value;
                    if (customMessage)
                        data.notification_message = customMessage.value;
                    if (notificationForSelf && notificationForSelf.checked) {
                        data.notification_user_id = localStorage.getItem('userId');
                    }
                    if (notifType.value === 'after_time') {
                        const afterMinutes = (_a = document.getElementById('afterMinutes')) === null || _a === void 0 ? void 0 : _a.value;
                        if (!afterMinutes) {
                            alert('Pentru notificarea "După un timp specificat", trebuie să completați numărul de minute.');
                            return;
                        }
                        data.notification_after_minutes = parseInt(afterMinutes);
                    }
                    else if (notifType.value === 'periodic') {
                        const intervalMinutes = (_b = document.getElementById('intervalMinutes')) === null || _b === void 0 ? void 0 : _b.value;
                        if (!intervalMinutes) {
                            alert('Pentru notificarea "Periodică", trebuie să completați intervalul în minute.');
                            return;
                        }
                        data.notification_interval_minutes = parseInt(intervalMinutes);
                    }
                    else if (notifType.value === 'fixed_date') {
                        const fixedDateTime = (_c = document.getElementById('fixedDateTime')) === null || _c === void 0 ? void 0 : _c.value;
                        if (!fixedDateTime) {
                            alert('Pentru notificarea "La o dată fixă", trebuie să selectați data și ora.');
                            return;
                        }
                        data.notification_fixed_date = new Date(fixedDateTime).toISOString();
                    }
                }
            }
            try {
                yield api('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                this.reset();
                const notificationDetails = document.getElementById('notificationDetails');
                if (notificationDetails)
                    notificationDetails.classList.add('display-none');
                fetchItems();
            }
            catch (err) {
                alert('Eroare: ' + ((err === null || err === void 0 ? void 0 : err.message) || 'la adaugarea articolului'));
            }
        });
    });
}
