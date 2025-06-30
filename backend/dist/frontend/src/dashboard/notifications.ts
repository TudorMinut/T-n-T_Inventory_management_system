import { api } from './api.js';
import { $, setHTML } from './domUtils.js';

export async function fetchNotifications() {
    const notifications = await api<any[]>('/api/notifications');
    setHTML($('notificationsList'), notifications.map(notif =>
        `<li>[${new Date(notif.created_at).toLocaleString()}] ${notif.message}${notif.notification_type && notif.notification_type !== 'stock_low' ? ` (${notif.notification_type})` : ''}</li>`
    ).join(''));
}

export function setupNotificationListeners() {
    $('customNotificationEnabled')?.addEventListener('change', function (this: HTMLInputElement) {
        const notificationDetails = $('notificationDetails');
        if (notificationDetails) {
            notificationDetails.classList.toggle('display-block', this.checked);
            notificationDetails.classList.toggle('display-none', !this.checked);
        }
    });

    $('notificationType')?.addEventListener('change', function (this: HTMLSelectElement) {
        ['afterTimeOptions', 'periodicOptions', 'fixedDateOptions'].forEach(id => {
            const el = $(id);
            if (el) {
                el.classList.remove('display-block');
                el.classList.add('display-none');
            }
        });
        const showMap: any = { 'after_time': 'afterTimeOptions', 'periodic': 'periodicOptions', 'fixed_date': 'fixedDateOptions' };
        const elToShow = $(showMap[this.value]);
        if (elToShow) {
            elToShow.classList.remove('display-none');
            elToShow.classList.add('display-block');
        }
    });
}
