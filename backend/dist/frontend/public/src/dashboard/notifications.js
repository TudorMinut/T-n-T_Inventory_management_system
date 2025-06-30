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
import { $, setHTML } from './domUtils.js';
export function fetchNotifications() {
    return __awaiter(this, void 0, void 0, function* () {
        const notifications = yield api('/api/notifications');
        setHTML($('notificationsList'), notifications.map(notif => `<li>[${new Date(notif.created_at).toLocaleString()}] ${notif.message}${notif.notification_type && notif.notification_type !== 'stock_low' ? ` (${notif.notification_type})` : ''}</li>`).join(''));
    });
}
export function setupNotificationListeners() {
    var _a, _b;
    (_a = $('customNotificationEnabled')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', function () {
        const notificationDetails = $('notificationDetails');
        if (notificationDetails) {
            notificationDetails.classList.toggle('display-block', this.checked);
            notificationDetails.classList.toggle('display-none', !this.checked);
        }
    });
    (_b = $('notificationType')) === null || _b === void 0 ? void 0 : _b.addEventListener('change', function () {
        ['afterTimeOptions', 'periodicOptions', 'fixedDateOptions'].forEach(id => {
            const el = $(id);
            if (el) {
                el.classList.remove('display-block');
                el.classList.add('display-none');
            }
        });
        const showMap = { 'after_time': 'afterTimeOptions', 'periodic': 'periodicOptions', 'fixed_date': 'fixedDateOptions' };
        const elToShow = $(showMap[this.value]);
        if (elToShow) {
            elToShow.classList.remove('display-none');
            elToShow.classList.add('display-block');
        }
    });
}
