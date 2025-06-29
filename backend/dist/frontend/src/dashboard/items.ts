import { api } from './api';
import { displaySortedItems, cachedItems } from './sorting';

export async function fetchItems() {
    try {
        const items = await api<any[]>('/api/items');
        console.log('Items received:', items); // Debug log
        cachedItems.splice(0, cachedItems.length, ...items); // Actualizeaza cache-ul
        displaySortedItems(); // Afiseaza articolele sortate
    } catch (error) {
        console.error('Error fetching items:', error);
        const itemsList = document.getElementById('itemsList');
        if (itemsList) {
            itemsList.innerHTML = '<li>Eroare la incarcarea articolelor</li>';
        }
    }
}

export function setupItemForm() {
    document.getElementById('itemForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const itemName = document.getElementById('itemName') as HTMLInputElement,
            itemCategory = document.getElementById('itemCategory') as HTMLSelectElement,
            itemQuantity = document.getElementById('itemQuantity') as HTMLInputElement,
            itemThreshold = document.getElementById('itemThreshold') as HTMLInputElement,
            customNotification = document.getElementById('customNotificationEnabled') as HTMLInputElement;

        if (!itemName || !itemCategory || !itemQuantity || !itemThreshold) return;

        const data: any = {
            name: itemName.value,
            category_id: itemCategory.value,
            quantity: itemQuantity.value,
            notification_threshold: itemThreshold.value
        };

        if (customNotification && customNotification.checked) {
            const notifType = document.getElementById('notificationType') as HTMLSelectElement,
                customMessage = document.getElementById('customMessage') as HTMLInputElement,
                notificationForSelf = document.getElementById('notificationForSelf') as HTMLInputElement;

            if (notifType) {
                data.custom_notification_enabled = true;
                data.notification_type = notifType.value;
                if (customMessage) data.notification_message = customMessage.value;
                if (notificationForSelf && notificationForSelf.checked) {
                    data.notification_user_id = localStorage.getItem('userId');
                }

                if (notifType.value === 'after_time') {
                    const afterMinutes = (document.getElementById('afterMinutes') as HTMLInputElement)?.value;
                    if (!afterMinutes) {
                        alert('Pentru notificarea "După un timp specificat", trebuie să completați numărul de minute.');
                        return;
                    }
                    data.notification_after_minutes = parseInt(afterMinutes);
                } else if (notifType.value === 'periodic') {
                    const intervalMinutes = (document.getElementById('intervalMinutes') as HTMLInputElement)?.value;
                    if (!intervalMinutes) {
                        alert('Pentru notificarea "Periodică", trebuie să completați intervalul în minute.');
                        return;
                    }
                    data.notification_interval_minutes = parseInt(intervalMinutes);
                } else if (notifType.value === 'fixed_date') {
                    const fixedDateTime = (document.getElementById('fixedDateTime') as HTMLInputElement)?.value;
                    if (!fixedDateTime) {
                        alert('Pentru notificarea "La o dată fixă", trebuie să selectați data și ora.');
                        return;
                    }
                    data.notification_fixed_date = new Date(fixedDateTime).toISOString();
                }
            }
        }

        try {
            await api('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            (this as HTMLFormElement).reset();
            const notificationDetails = document.getElementById('notificationDetails');
            if (notificationDetails) notificationDetails.classList.add('display-none');
            fetchItems();
        } catch (err: any) {
            alert('Eroare: ' + (err?.message || 'la adaugarea articolului'));
        }
    });
}
