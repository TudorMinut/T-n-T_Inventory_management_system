"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleCustomNotification = void 0;
exports.validateItemFields = validateItemFields;
const database_1 = __importDefault(require("../../config/database"));
const securityUtils_1 = require("../../utils/securityUtils");
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
exports.scheduleCustomNotification = scheduleCustomNotification;
function validateItemFields(fields, res) {
    if (fields.name !== undefined) {
        const sanitizedName = (0, securityUtils_1.sanitizeAndValidateName)(fields.name);
        if (!sanitizedName) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Numele articolului trebuie sa aiba intre 2-100 caractere" }));
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
        res.end(JSON.stringify({ message: "Cantitatea trebuie sa fie un numar pozitiv" }));
        return false;
    }
    if (fields.notification_threshold !== undefined && !(0, securityUtils_1.validateNonNegativeInteger)(fields.notification_threshold)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Pragul de notificare trebuie sa fie un numar pozitiv" }));
        return false;
    }
    return true;
}
