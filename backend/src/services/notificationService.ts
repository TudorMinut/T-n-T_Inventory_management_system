import pool from '../config/database';
import { sendEmail } from './emailService'; // Presupunem că acest serviciu există și este configurat

// Serviciu pentru verificarea stocurilor și generarea de notificări
export const checkStockAndNotify = async () => {
    try {
        // Preluare articole cu stoc redus
        const { rows: lowStockItems } = await pool.query(
            'SELECT * FROM items WHERE quantity <= notification_threshold'
        );

        // Preluare email-uri utilizatori
        const { rows: users } = await pool.query('SELECT email FROM users');
        const userEmails = users.map(user => user.email).filter(email => email); // Filtrează email-urile nule

        for (const item of lowStockItems) {
            const message = `Stoc redus pentru articolul: ${item.name}. Cantitate rămasă: ${item.quantity}.`;

            // Verifică dacă o notificare pentru acest articol și acest prag a fost deja trimisă recent
            const { rows: existingNotifications } = await pool.query(
                'SELECT * FROM notifications WHERE item_id = $1 AND message = $2 AND created_at > NOW() - INTERVAL \'1 day\'',
                [item.id, message]
            );

            if (existingNotifications.length === 0) {
                // Inserează o nouă notificare în baza de date
                await pool.query(
                    'INSERT INTO notifications (item_id, message, is_read) VALUES ($1, $2, $3)',
                    [item.id, message, false]
                );

                // Trimite email către toți utilizatorii
                for (const email of userEmails) {
                    try {
                        await sendEmail(
                            email,
                            'Notificare Stoc Redus',
                            message
                        );
                    } catch (emailError) {
                        console.error(`Eroare la trimiterea emailului către ${email}:`, emailError);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Eroare la verificarea stocurilor și generarea notificărilor:", error);
    }
};
