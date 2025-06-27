"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllItems = void 0;
const database_1 = __importDefault(require("../../config/database"));
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
