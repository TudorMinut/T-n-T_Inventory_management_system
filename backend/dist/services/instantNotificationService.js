"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSendStockNotification = void 0;
const database_1 = __importDefault(require("../config/database"));
const emailService_1 = require("../services/emailService");
const createAndSendStockNotification = async (item) => {
    const message = `Stoc redus pentru articolul: ${item.name}. Cantitate rămasă: ${item.quantity}.`;
    const { rows: existingNotifications } = await database_1.default.query('SELECT * FROM notifications WHERE item_id = $1 AND message = $2 AND notification_type = $3 AND created_at > NOW() - INTERVAL \'1 day\'', [item.id, message, 'stock_low']);
    if (existingNotifications.length === 0) {
        await database_1.default.query('INSERT INTO notifications (item_id, message, notification_type, is_read) VALUES ($1, $2, $3, $4)', [item.id, message, 'stock_low', false]);
        const { rows: users } = await database_1.default.query('SELECT email FROM users');
        const userEmails = users.map(u => u.email).filter(Boolean);
        for (const email of userEmails) {
            try {
                await (0, emailService_1.sendEmail)(email, 'Notificare Stoc Redus', message);
            }
            catch (e) {
                console.error('Eroare email:', e);
            }
        }
    }
};
exports.createAndSendStockNotification = createAndSendStockNotification;
