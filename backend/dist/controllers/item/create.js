"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItem = void 0;
const database_1 = __importDefault(require("../../config/database"));
const requestUtils_1 = require("../../utils/requestUtils");
const securityUtils_1 = require("../../utils/securityUtils");
const instantNotificationService_1 = require("../../services/instantNotificationService");
const utils_1 = require("./utils");
const createItem = async (req, res) => {
    try {
        const body = await (0, requestUtils_1.getRequestBody)(req);
        const { name, category_id, quantity, notification_threshold, custom_notification_enabled, notification_type, notification_after_minutes, notification_interval_minutes, notification_fixed_date, notification_message } = body;
        const sanitizedName = (0, securityUtils_1.sanitizeAndValidateName)(name);
        if (!sanitizedName) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Numele articolului trebuie sa aiba intre 2-100 caractere" }));
            return;
        }
        if (!(0, securityUtils_1.validatePositiveInteger)(category_id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "ID categorie invalid" }));
            return;
        }
        if (!(0, securityUtils_1.validateNonNegativeInteger)(quantity)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Cantitatea trebuie sa fie un numar pozitiv" }));
            return;
        }
        if (!(0, securityUtils_1.validateNonNegativeInteger)(notification_threshold)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Pragul de notificare trebuie sa fie un numar pozitiv" }));
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
            await (0, utils_1.scheduleCustomNotification)(newItem);
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
