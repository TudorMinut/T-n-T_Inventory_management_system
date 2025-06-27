import pool from '../config/database';
import { sendEmail } from './emailService'; // Presupunem că acest serviciu există și este configurat

// Serviciu pentru verificarea stocurilor și generarea de notificări
export const checkStockAndNotify = async () => {
    try {
        // Verifică notificările de stoc redus
        await checkLowStockNotifications();

        // Verifică notificările personalizate programate
        await checkScheduledNotifications();
    } catch (error) {
        console.error("Eroare la verificarea notificărilor:", error);
    }
};

// Funcție pentru verificarea stocurilor reduse
const checkLowStockNotifications = async () => {
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
                'SELECT * FROM notifications WHERE item_id = $1 AND message = $2 AND notification_type = $3 AND created_at > NOW() - INTERVAL \'1 day\'',
                [item.id, message, 'stock_low']
            );

            if (existingNotifications.length === 0) {
                // Inserează o nouă notificare în baza de date
                await pool.query(
                    'INSERT INTO notifications (item_id, message, notification_type, is_read) VALUES ($1, $2, $3, $4)',
                    [item.id, message, 'stock_low', false]
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
        console.error("Eroare la verificarea stocurilor reduse:", error);
    }
};

// Funcție pentru verificarea notificărilor personalizate programate
const checkScheduledNotifications = async () => {
    try {
        const now = new Date();

        // Găsește notificările care trebuie să fie trimise acum
        const { rows: dueNotifications } = await pool.query(
            `SELECT n.*, i.name as item_name 
             FROM notifications n 
             JOIN items i ON n.item_id = i.id 
             WHERE n.next_notification <= $1 
             AND n.notification_type IN ('scheduled', 'periodic', 'after_time', 'fixed_date')`,
            [now]
        );

        // Preluare email-uri utilizatori
        const { rows: users } = await pool.query('SELECT email FROM users');
        const userEmails = users.map(user => user.email).filter(email => email);

        for (const notification of dueNotifications) {
            // Trimite notificarea
            for (const email of userEmails) {
                try {
                    await sendEmail(
                        email,
                        `Notificare Programată: ${notification.item_name}`,
                        notification.message
                    );
                } catch (emailError) {
                    console.error(`Eroare la trimiterea emailului către ${email}:`, emailError);
                }
            }

            // Actualizează notificarea
            if (notification.notification_type === 'periodic' && notification.periodic_interval) {
                // Pentru notificările periodice, programează următoarea notificare
                const nextTime = new Date(now.getTime() + notification.periodic_interval * 60000);
                await pool.query(
                    'UPDATE notifications SET next_notification = $1 WHERE id = $2',
                    [nextTime, notification.id]
                );
            } else {
                // Pentru notificările one-time, șterge notificarea
                await pool.query(
                    'DELETE FROM notifications WHERE id = $1',
                    [notification.id]
                );
            }
        }
    } catch (error) {
        console.error("Eroare la verificarea notificărilor programate:", error);
    }
};
