import { IncomingMessage, ServerResponse } from 'http';
import pool from '../../config/database';
import { getRequestBody } from '../../utils/requestUtils';
import { sanitizeAndValidateName, validatePositiveInteger, validateNonNegativeInteger } from '../../utils/securityUtils';
import { createAndSendStockNotification } from '../../services/instantNotificationService';

// Functie pentru actualizarea unui articol
export const updateItem = async (req: IncomingMessage, res: ServerResponse, id: number) => {
    try {
        const body = await getRequestBody(req);

        // Obtinem articolul existent pentru a pastra datele curente
        const existingResult = await pool.query(
            'SELECT * FROM items WHERE id = $1',
            [id]
        );

        if (existingResult.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost gasit" }));
            return;
        }

        const existingItem = existingResult.rows[0];

        // Folosim valorile noi sau pastram cele existente
        const {
            name = existingItem.name,
            category_id = existingItem.category_id,
            quantity = existingItem.quantity,
            notification_threshold = existingItem.notification_threshold,
            custom_notification_enabled = existingItem.custom_notification_enabled,
            notification_type = existingItem.notification_type,
            notification_after_minutes = existingItem.notification_after_minutes,
            notification_interval_minutes = existingItem.notification_interval_minutes,
            notification_fixed_date = existingItem.notification_fixed_date,
            notification_message = existingItem.notification_message
        } = body;

        // Validari de securitate doar pentru campurile modificate
        if (body.name !== undefined) {
            const sanitizedName = sanitizeAndValidateName(name);
            if (!sanitizedName) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Numele articolului trebuie să aibă între 2-100 caractere" }));
                return;
            }
        }

        if (body.category_id !== undefined && !validatePositiveInteger(category_id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "ID categorie invalid" }));
            return;
        }

        if (body.quantity !== undefined && !validateNonNegativeInteger(quantity)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Cantitatea trebuie să fie un număr pozitiv" }));
            return;
        }

        if (body.notification_threshold !== undefined && !validateNonNegativeInteger(notification_threshold)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Pragul de notificare trebuie să fie un număr pozitiv" }));
            return;
        }

        // Validari pentru notificarile personalizate doar daca sunt modificate
        let validatedNotificationType = notification_type;
        let validatedAfterMinutes = notification_after_minutes;
        let validatedIntervalMinutes = notification_interval_minutes;
        let validatedFixedDate = notification_fixed_date;

        if (body.custom_notification_enabled && custom_notification_enabled) {
            if (body.notification_type === 'after_time' && body.notification_after_minutes !== undefined) {
                if (!validatePositiveInteger(notification_after_minutes)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Minutele pentru notificare trebuie să fie un număr pozitiv" }));
                    return;
                }
                validatedNotificationType = 'after_time';
                validatedAfterMinutes = notification_after_minutes;
            } else if (body.notification_type === 'periodic' && body.notification_interval_minutes !== undefined) {
                if (!validatePositiveInteger(notification_interval_minutes)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Intervalul pentru notificare trebuie să fie un număr pozitiv" }));
                    return;
                }
                validatedNotificationType = 'periodic';
                validatedIntervalMinutes = notification_interval_minutes;
            } else if (body.notification_type === 'fixed_date' && body.notification_fixed_date !== undefined) {
                validatedNotificationType = 'fixed_date';
                validatedFixedDate = notification_fixed_date;
            }
        }

        const result = await pool.query(
            `UPDATE items SET 
                name = $1, category_id = $2, quantity = $3, 
                notification_threshold = $4, custom_notification_enabled = $5, 
                notification_type = $6, notification_after_minutes = $7, 
                notification_interval_minutes = $8, notification_fixed_date = $9, 
                notification_message = $10
            WHERE id = $11 RETURNING *`,
            [
                body.name !== undefined ? sanitizeAndValidateName(name) : name,
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
            ]
        );

        if (result.rows.length > 0) {
            // Returneaza articolul actualizat cu numele categoriei
            const finalItemResult = await pool.query(
                `SELECT 
                    i.id, i.name, i.quantity, i.category_id, c.name as category_name,
                    i.notification_threshold, i.custom_notification_enabled, i.notification_type,
                    i.notification_after_minutes, i.notification_interval_minutes,
                    i.notification_fixed_date, i.notification_message
                 FROM items i
                 LEFT JOIN categories c ON i.category_id = c.id
                 WHERE i.id = $1`,
                [id]
            );
            const updatedItem = finalItemResult.rows[0];

            // Verifica si trimite notificare instant daca e cazul
            if (body.quantity !== undefined && updatedItem.quantity <= updatedItem.notification_threshold) {
                await createAndSendStockNotification(updatedItem);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedItem));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost gasit" }));
        }
    } catch (error) {
        console.error('Error in updateItem:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la actualizarea articolului" }));
    }
};
