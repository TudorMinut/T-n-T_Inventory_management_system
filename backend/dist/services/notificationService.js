"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStockAndNotify = void 0;
const database_1 = __importDefault(require("../config/database"));
const emailService_1 = require("./emailService");
const checkStockAndNotify = async () => {
    try {
        await checkLowStockNotifications();
        await checkScheduledNotifications();
    }
    catch (error) {
        console.error("Eroare la verificarea notificărilor:", error);
    }
};
exports.checkStockAndNotify = checkStockAndNotify;
const checkLowStockNotifications = async () => {
    try {
        const { rows: lowStockItems } = await database_1.default.query('SELECT * FROM items WHERE quantity <= notification_threshold');
        const { rows: users } = await database_1.default.query('SELECT email FROM users');
        const userEmails = users.map(user => user.email).filter(email => email);
        for (const item of lowStockItems) {
            const message = `Stoc redus pentru articolul: ${item.name}. Cantitate rămasă: ${item.quantity}.`;
            const { rows: existingNotifications } = await database_1.default.query('SELECT * FROM notifications WHERE item_id = $1 AND message = $2 AND notification_type = $3 AND created_at > NOW() - INTERVAL \'1 day\'', [item.id, message, 'stock_low']);
            if (existingNotifications.length === 0) {
                await database_1.default.query('INSERT INTO notifications (item_id, message, notification_type, is_read) VALUES ($1, $2, $3, $4)', [item.id, message, 'stock_low', false]);
                for (const email of userEmails) {
                    try {
                        await (0, emailService_1.sendEmail)(email, 'Notificare Stoc Redus', message);
                    }
                    catch (emailError) {
                        console.error(`Eroare la trimiterea emailului către ${email}:`, emailError);
                    }
                }
            }
        }
    }
    catch (error) {
        console.error("Eroare la verificarea stocurilor reduse:", error);
    }
};
const checkScheduledNotifications = async () => {
    try {
        const now = new Date();
        const { rows: dueNotifications } = await database_1.default.query(`SELECT n.*, i.name as item_name 
             FROM notifications n 
             JOIN items i ON n.item_id = i.id 
             WHERE n.next_notification <= $1 
             AND n.notification_type IN ('scheduled', 'periodic', 'after_time', 'fixed_date')`, [now]);
        const { rows: users } = await database_1.default.query('SELECT email FROM users');
        const userEmails = users.map(user => user.email).filter(email => email);
        for (const notification of dueNotifications) {
            for (const email of userEmails) {
                try {
                    await (0, emailService_1.sendEmail)(email, `Notificare Programată: ${notification.item_name}`, notification.message);
                }
                catch (emailError) {
                    console.error(`Eroare la trimiterea emailului către ${email}:`, emailError);
                }
            }
            if (notification.notification_type === 'periodic' && notification.periodic_interval) {
                const nextTime = new Date(now.getTime() + notification.periodic_interval * 60000);
                await database_1.default.query('UPDATE notifications SET next_notification = $1 WHERE id = $2', [nextTime, notification.id]);
            }
            else {
                await database_1.default.query('DELETE FROM notifications WHERE id = $1', [notification.id]);
            }
        }
    }
    catch (error) {
        console.error("Eroare la verificarea notificărilor programate:", error);
    }
};
