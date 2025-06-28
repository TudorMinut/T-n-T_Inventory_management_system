import { ServerResponse } from "http";
import pool from "../config/database";

// Functie pentru a prelua toate notificarile
export const getNotifications = async (res: ServerResponse) => {
    try {
        const result = await pool.query(
            `SELECT n.id, n.message, n.created_at, n.is_read, i.name as item_name
             FROM notifications n
             JOIN items i ON n.item_id = i.id
             ORDER BY n.created_at DESC`
        );
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.rows));
    } catch (error) {
        console.error(error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare interna la preluarea notificarilor." }));
    }
};

export const markNotificationAsRead = async (id: number, res: ServerResponse) => {
    try {
        const result = await pool.query(
            'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length > 0) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result.rows[0]));
        } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Notificarea nu a fost găsită" }));
        }
    } catch (error) {
        console.error(error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la actualizarea notificării." }));
    }
};

export const deleteNotification = async (id: number, res: ServerResponse) => {
    try {
        const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount && result.rowCount > 0) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Notificare ștearsă cu succes" }));
        } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Notificarea nu a fost găsită" }));
        }
    } catch (error) {
        console.error(error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Eroare la ștergerea notificării." }));
    }
};
