import pool from '../../config/database';
import { ServerResponse } from 'http';
import { sanitizeAndValidateName, validatePositiveInteger } from '../../utils/securityUtils';

// Functie pentru programarea notificarilor personalizate
export const scheduleCustomNotification = async (item: any) => {
    try {
        let scheduledTime: Date | null = null;
        let nextNotification: Date | null = null;
        let message = item.notification_message || `Notificare pentru articolul: ${item.name}`;

        const now = new Date();

        if (item.notification_type === 'after_time') {
            scheduledTime = new Date(now.getTime() + item.notification_after_minutes * 60000);
            nextNotification = scheduledTime;
        } else if (item.notification_type === 'periodic') {
            nextNotification = new Date(now.getTime() + item.notification_interval_minutes * 60000);
        } else if (item.notification_type === 'fixed_date') {
            scheduledTime = new Date(item.notification_fixed_date);
            nextNotification = scheduledTime;
        }

        await pool.query(
            `INSERT INTO notifications (
                item_id, message, notification_type, 
                scheduled_time, periodic_interval, next_notification, is_read
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                item.id,
                message,
                item.notification_type,
                scheduledTime,
                item.notification_interval_minutes,
                nextNotification,
                false
            ]
        );
    } catch (error) {
        console.error('Error scheduling custom notification:', error);
    }
};

// Utilitar pentru validare rapida
export function validateItemFields(fields: any, res: ServerResponse): boolean {
    if (fields.name !== undefined) {
        const sanitizedName = sanitizeAndValidateName(fields.name);
        if (!sanitizedName) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Numele articolului trebuie sa aiba intre 2-100 caractere" }));
            return false;
        }
    }
    if (fields.category_id !== undefined && !validatePositiveInteger(fields.category_id)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "ID categorie invalid" }));
        return false;
    }
    if (fields.quantity !== undefined && !validatePositiveInteger(fields.quantity)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Cantitatea trebuie sa fie un numar pozitiv" }));
        return false;
    }
    if (fields.notification_threshold !== undefined && !validatePositiveInteger(fields.notification_threshold)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Pragul de notificare trebuie sa fie un numar pozitiv" }));
        return false;
    }
    return true;
}
