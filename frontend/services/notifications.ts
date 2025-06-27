// Funcții pentru gestionarea notificărilor
import { api } from './api';
import { $ } from './dom';

export async function fetchNotifications() {
    const notifications = await api<any[]>('/api/notifications');
    const notificationsList = $('notificationsList');
    if (notificationsList) {
        notificationsList.innerHTML = notifications.map(n => `<li>${n.message}</li>`).join('');
    }
}

export function setupCustomNotificationToggle() {
    const customNotificationEnabled = $('customNotificationEnabled');
    const notificationOptions = $('notificationOptions');
    if (customNotificationEnabled && notificationOptions) {
        customNotificationEnabled.addEventListener('change', function () {
            notificationOptions.style.display = (this as HTMLInputElement).checked ? 'block' : 'none';
        });
    }
}

export function setupNotificationTypeToggle() {
    const notificationType = $('notificationType');
    const emailOptions = $('emailOptions');
    if (notificationType && emailOptions) {
        notificationType.addEventListener('change', function () {
            emailOptions.style.display = (this as HTMLSelectElement).value === 'email' ? 'block' : 'none';
        });
    }
}
