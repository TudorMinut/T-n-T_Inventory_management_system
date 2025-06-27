"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManualNotification = void 0;
const database_1 = __importDefault(require("../config/database"));
const requestUtils_1 = require("../utils/requestUtils");
const createManualNotification = async (req, res) => {
    try {
        const body = await (0, requestUtils_1.getRequestBody)(req);
        const { item_id, notification_type, notification_fixed_date, notification_threshold, notification_message } = body;
        if (!item_id || !notification_type) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Lipsesc parametri necesari.' }));
            return;
        }
        let scheduledTime = null;
        let nextNotification = null;
        let periodicInterval = null;
        let message = notification_message || 'Notificare manuală';
        if (notification_type === 'fixed_date') {
            if (!notification_fixed_date) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Data fixă este necesară.' }));
                return;
            }
            scheduledTime = new Date(notification_fixed_date);
            nextNotification = scheduledTime;
        }
        else if (notification_type === 'stock_low') {
            if (notification_threshold === undefined) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Pragul de notificare este necesar.' }));
                return;
            }
            await database_1.default.query('UPDATE items SET notification_threshold = $1 WHERE id = $2', [notification_threshold, item_id]);
        }
        else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Tip notificare invalid.' }));
            return;
        }
        if (notification_type === 'fixed_date') {
            await database_1.default.query(`INSERT INTO notifications (item_id, message, notification_type, scheduled_time, next_notification, is_read) VALUES ($1, $2, $3, $4, $5, $6)`, [item_id, message, notification_type, scheduledTime, nextNotification, false]);
        }
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Notificare creată cu succes.' }));
    }
    catch (error) {
        console.error('Eroare la crearea notificării manuale:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Eroare la crearea notificării.' }));
    }
};
exports.createManualNotification = createManualNotification;
