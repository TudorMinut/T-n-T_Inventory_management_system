import { ServerResponse } from 'http';
import pool from "../../config/database";

export const getAllItems = async (res: ServerResponse) => {
    try {
        const result = await pool.query(`
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
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la preluarea articolelor" }));
    }
};
