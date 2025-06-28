import pool from '../config/database';
import { sendEmail } from '../services/emailService';

// Creaza si trimite instant notificare de stoc scazut
export const createAndSendStockNotification = async (item: any) => {
    const message = `Stoc redus pentru articolul: ${item.name}. Cantitate ramasa: ${item.quantity}.`;
    // Verifică dacă există deja o notificare recentă
    const { rows: existingNotifications } = await pool.query(
        'SELECT * FROM notifications WHERE item_id = $1 AND message = $2 AND notification_type = $3 AND created_at > NOW() - INTERVAL \'1 day\'',
        [item.id, message, 'stock_low']
    );
    if (existingNotifications.length === 0) {
        await pool.query(
            'INSERT INTO notifications (item_id, message, notification_type, is_read) VALUES ($1, $2, $3, $4)',
            [item.id, message, 'stock_low', false]
        );
        // Trimite email instant tuturor userilor
        const { rows: users } = await pool.query('SELECT email FROM users');
        const userEmails = users.map(u => u.email).filter(Boolean);
        for (const email of userEmails) {
            try {
                await sendEmail(email, 'Notificare Stoc Redus', message);
            } catch (e) { console.error('Eroare email:', e); }
        }
    }
};
