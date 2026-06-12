import pool from "../config/database";
import { sendEmail } from "./emailService";

export const checkStockAndNotify = async () => {
    try {
        const { rows: lowStockItems } = await pool.query(
            "SELECT * FROM items WHERE quantity <= notification_threshold"
        );

        const { rows: users } = await pool.query("SELECT email FROM users");
        const userEmails = users
            .map((user: { email: string | null }) => user.email)
            .filter((email): email is string => Boolean(email));

        for (const item of lowStockItems) {
            const message = `Stoc redus pentru articolul: ${item.name}. Cantitate ramasa: ${item.quantity}.`;

            const { rows: existingNotifications } = await pool.query(
                "SELECT * FROM notifications WHERE item_id = $1 AND message = $2 AND created_at > NOW() - INTERVAL '1 day'",
                [item.id, message]
            );

            if (existingNotifications.length === 0) {
                await pool.query(
                    "INSERT INTO notifications (item_id, message, is_read) VALUES ($1, $2, $3)",
                    [item.id, message, false]
                );

                for (const email of userEmails) {
                    try {
                        await sendEmail(email, "Notificare Stoc Redus", message);
                    } catch (emailError) {
                        console.error(`Eroare la trimiterea emailului catre ${email}:`, emailError);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Eroare la verificarea stocurilor si generarea notificarilor:", error);
    }
};
