"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markNotificationAsRead = exports.getNotifications = void 0;
const database_1 = __importDefault(require("../config/database"));
const getNotifications = async (res) => {
    try {
        const result = await database_1.default.query(`SELECT n.id, n.message, n.created_at, n.is_read, i.name as item_name
             FROM notifications n
             JOIN items i ON n.item_id = i.id
             ORDER BY n.created_at DESC`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.rows));
    }
    catch (error) {
        console.error(error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare internă la preluarea notificărilor." }));
    }
};
exports.getNotifications = getNotifications;
const markNotificationAsRead = async (id, res) => {
    try {
        const result = await database_1.default.query('UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result.rows[0]));
        }
        else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Notificarea nu a fost găsită" }));
        }
    }
    catch (error) {
        console.error(error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la actualizarea notificării." }));
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
const deleteNotification = async (id, res) => {
    try {
        const result = await database_1.default.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount && result.rowCount > 0) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Notificare ștearsă cu succes" }));
        }
        else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Notificarea nu a fost găsită" }));
        }
    }
    catch (error) {
        console.error(error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la ștergerea notificării." }));
    }
};
exports.deleteNotification = deleteNotification;
