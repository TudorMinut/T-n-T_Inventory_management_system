"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.createItem = exports.getAllItems = void 0;
const database_1 = __importDefault(require("../config/database"));
const requestUtils_1 = require("../utils/requestUtils");
const securityUtils_1 = require("../utils/securityUtils");
const instantNotificationService_1 = require("../services/instantNotificationService");
const scheduleCustomNotification = async (item) => {
    try {
        let scheduledTime = null;
        let nextNotification = null;
        let message = item.notification_message || `Notificare pentru articolul: ${item.name}`;
        const now = new Date();
        if (item.notification_type === 'after_time') {
            scheduledTime = new Date(now.getTime() + item.notification_after_minutes * 60000);
            nextNotification = scheduledTime;
        }
        else if (item.notification_type === 'periodic') {
            nextNotification = new Date(now.getTime() + item.notification_interval_minutes * 60000);
        }
        else if (item.notification_type === 'fixed_date') {
            scheduledTime = new Date(item.notification_fixed_date);
            nextNotification = scheduledTime;
        }
        await database_1.default.query(`INSERT INTO notifications (
                item_id, message, notification_type, 
                scheduled_time, periodic_interval, next_notification, is_read
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
            item.id,
            message,
            item.notification_type,
            scheduledTime,
            item.notification_interval_minutes,
            nextNotification,
            false
        ]);
    }
    catch (error) {
        console.error('Error scheduling custom notification:', error);
    }
};
const getAllItems = async (res) => {
    try {
        const result = await database_1.default.query(`
            SELECT 
                i.id, i.name, i.quantity, i.category_id, c.name as category_name, 
                i.notification_threshold, i.custom_notification_enabled, i.notification_type, 
                i.notification_after_minutes, i.notification_interval_minutes, 
                i.notification_fixed_date, i.notification_message, i.created_at
            FROM items i
            LEFT JOIN categories c ON i.category_id = c.id
            ORDER BY i.id ASC
        `);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la preluarea articolelor" }));
    }
};
exports.getAllItems = getAllItems;
const createItem = async (req, res) => {
    try {
        const body = await (0, requestUtils_1.getRequestBody)(req);
        const { name, category_id, quantity, notification_threshold, custom_notification_enabled, notification_type, notification_after_minutes, notification_interval_minutes, notification_fixed_date, notification_message } = body;
        const sanitizedName = (0, securityUtils_1.sanitizeAndValidateName)(name);
        if (!sanitizedName) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Numele articolului trebuie să aibă între 2-100 caractere" }));
            return;
        }
        if (!(0, securityUtils_1.validatePositiveInteger)(category_id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "ID categorie invalid" }));
            return;
        }
        if (!(0, securityUtils_1.validateNonNegativeInteger)(quantity)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Cantitatea trebuie să fie un număr pozitiv" }));
            return;
        }
        if (!(0, securityUtils_1.validateNonNegativeInteger)(notification_threshold)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Pragul de notificare trebuie să fie un număr pozitiv" }));
            return;
        }
        let validatedNotificationType = null;
        let validatedAfterMinutes = null;
        let validatedIntervalMinutes = null;
        let validatedFixedDate = null;
        if (custom_notification_enabled) {
            if (notification_type === 'after_time' && (0, securityUtils_1.validatePositiveInteger)(notification_after_minutes)) {
                validatedNotificationType = 'after_time';
                validatedAfterMinutes = notification_after_minutes;
            }
            else if (notification_type === 'periodic' && (0, securityUtils_1.validatePositiveInteger)(notification_interval_minutes)) {
                validatedNotificationType = 'periodic';
                validatedIntervalMinutes = notification_interval_minutes;
            }
            else if (notification_type === 'fixed_date' && notification_fixed_date) {
                validatedNotificationType = 'fixed_date';
                validatedFixedDate = notification_fixed_date;
            }
            else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Setări de notificare personalizată invalide" }));
                return;
            }
        }
        const result = await database_1.default.query(`INSERT INTO items (
                name, category_id, quantity, notification_threshold, 
                custom_notification_enabled, notification_type, 
                notification_after_minutes, notification_interval_minutes, 
                notification_fixed_date, notification_message
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`, [
            sanitizedName,
            category_id,
            quantity,
            notification_threshold,
            custom_notification_enabled,
            validatedNotificationType,
            validatedAfterMinutes,
            validatedIntervalMinutes,
            validatedFixedDate,
            notification_message
        ]);
        const newItemId = result.rows[0].id;
        const newItem = {
            id: newItemId,
            name: sanitizedName,
            category_id,
            quantity,
            notification_threshold,
            custom_notification_enabled,
            notification_type: validatedNotificationType,
            notification_after_minutes: validatedAfterMinutes,
            notification_interval_minutes: validatedIntervalMinutes,
            notification_fixed_date: validatedFixedDate,
            notification_message
        };
        if (custom_notification_enabled) {
            await scheduleCustomNotification(newItem);
        }
        if (quantity <= notification_threshold) {
            await (0, instantNotificationService_1.createAndSendStockNotification)(newItem);
        }
        const finalItemResult = await database_1.default.query(`SELECT 
                i.id, i.name, i.quantity, i.category_id, c.name as category_name,
                i.notification_threshold, i.custom_notification_enabled, i.notification_type,
                i.notification_after_minutes, i.notification_interval_minutes,
                i.notification_fixed_date, i.notification_message, i.created_at
             FROM items i
             LEFT JOIN categories c ON i.category_id = c.id
             WHERE i.id = $1`, [newItemId]);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(finalItemResult.rows[0]));
    }
    catch (error) {
        console.error('Error in createItem:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la crearea articolului" }));
    }
};
exports.createItem = createItem;
const updateItem = async (req, res, id) => {
    try {
        const body = await (0, requestUtils_1.getRequestBody)(req);
        const existingResult = await database_1.default.query('SELECT * FROM items WHERE id = $1', [id]);
        if (existingResult.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost găsit" }));
            return;
        }
        const existingItem = existingResult.rows[0];
        const { name = existingItem.name, category_id = existingItem.category_id, quantity = existingItem.quantity, notification_threshold = existingItem.notification_threshold, custom_notification_enabled = existingItem.custom_notification_enabled, notification_type = existingItem.notification_type, notification_after_minutes = existingItem.notification_after_minutes, notification_interval_minutes = existingItem.notification_interval_minutes, notification_fixed_date = existingItem.notification_fixed_date, notification_message = existingItem.notification_message } = body;
        if (body.name !== undefined) {
            const sanitizedName = (0, securityUtils_1.sanitizeAndValidateName)(name);
            if (!sanitizedName) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Numele articolului trebuie să aibă între 2-100 caractere" }));
                return;
            }
        }
        if (body.category_id !== undefined && !(0, securityUtils_1.validatePositiveInteger)(category_id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "ID categorie invalid" }));
            return;
        }
        if (body.quantity !== undefined && !(0, securityUtils_1.validateNonNegativeInteger)(quantity)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Cantitatea trebuie să fie un număr pozitiv" }));
            return;
        }
        if (body.notification_threshold !== undefined && !(0, securityUtils_1.validateNonNegativeInteger)(notification_threshold)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Pragul de notificare trebuie să fie un număr pozitiv" }));
            return;
        }
        let validatedNotificationType = notification_type;
        let validatedAfterMinutes = notification_after_minutes;
        let validatedIntervalMinutes = notification_interval_minutes;
        let validatedFixedDate = notification_fixed_date;
        if (body.custom_notification_enabled && custom_notification_enabled) {
            if (body.notification_type === 'after_time' && body.notification_after_minutes !== undefined) {
                if (!(0, securityUtils_1.validatePositiveInteger)(notification_after_minutes)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Minutele pentru notificare trebuie să fie un număr pozitiv" }));
                    return;
                }
                validatedNotificationType = 'after_time';
                validatedAfterMinutes = notification_after_minutes;
            }
            else if (body.notification_type === 'periodic' && body.notification_interval_minutes !== undefined) {
                if (!(0, securityUtils_1.validatePositiveInteger)(notification_interval_minutes)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Intervalul pentru notificare trebuie să fie un număr pozitiv" }));
                    return;
                }
                validatedNotificationType = 'periodic';
                validatedIntervalMinutes = notification_interval_minutes;
            }
            else if (body.notification_type === 'fixed_date' && body.notification_fixed_date !== undefined) {
                validatedNotificationType = 'fixed_date';
                validatedFixedDate = notification_fixed_date;
            }
        }
        const result = await database_1.default.query(`UPDATE items SET 
                name = $1, category_id = $2, quantity = $3, 
                notification_threshold = $4, custom_notification_enabled = $5, 
                notification_type = $6, notification_after_minutes = $7, 
                notification_interval_minutes = $8, notification_fixed_date = $9, 
                notification_message = $10
            WHERE id = $11 RETURNING *`, [
            body.name !== undefined ? (0, securityUtils_1.sanitizeAndValidateName)(name) : name,
            category_id,
            quantity,
            notification_threshold,
            custom_notification_enabled,
            validatedNotificationType,
            validatedAfterMinutes,
            validatedIntervalMinutes,
            validatedFixedDate,
            notification_message,
            id
        ]);
        if (result.rows.length > 0) {
            const finalItemResult = await database_1.default.query(`SELECT 
                    i.id, i.name, i.quantity, i.category_id, c.name as category_name,
                    i.notification_threshold, i.custom_notification_enabled, i.notification_type,
                    i.notification_after_minutes, i.notification_interval_minutes,
                    i.notification_fixed_date, i.notification_message
                 FROM items i
                 LEFT JOIN categories c ON i.category_id = c.id
                 WHERE i.id = $1`, [id]);
            const updatedItem = finalItemResult.rows[0];
            if (body.quantity !== undefined && updatedItem.quantity <= updatedItem.notification_threshold) {
                await (0, instantNotificationService_1.createAndSendStockNotification)(updatedItem);
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedItem));
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost găsit" }));
        }
    }
    catch (error) {
        console.error('Error in updateItem:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la actualizarea articolului" }));
    }
};
exports.updateItem = updateItem;
const deleteItem = async (res, id) => {
    try {
        const result = await database_1.default.query("DELETE FROM items WHERE id = $1", [id]);
        if (result.rowCount && result.rowCount > 0) {
            res.writeHead(204, { 'Content-Type': 'application/json' });
            res.end();
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost găsit" }));
        }
    }
    catch (error) {
        console.error('Error in deleteItem:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la ștergerea articolului" }));
    }
};
exports.deleteItem = deleteItem;
function validateItemFields(fields, res) {
    if (fields.name !== undefined) {
        const sanitizedName = (0, securityUtils_1.sanitizeAndValidateName)(fields.name);
        if (!sanitizedName) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Numele articolului trebuie să aibă între 2-100 caractere" }));
            return false;
        }
    }
    if (fields.category_id !== undefined && !(0, securityUtils_1.validatePositiveInteger)(fields.category_id)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "ID categorie invalid" }));
        return false;
    }
    if (fields.quantity !== undefined && !(0, securityUtils_1.validateNonNegativeInteger)(fields.quantity)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Cantitatea trebuie să fie un număr pozitiv" }));
        return false;
    }
    if (fields.notification_threshold !== undefined && !(0, securityUtils_1.validateNonNegativeInteger)(fields.notification_threshold)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Pragul de notificare trebuie să fie un număr pozitiv" }));
        return false;
    }
    return true;
}
