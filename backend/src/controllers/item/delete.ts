import { ServerResponse } from 'http';
import pool from '../../config/database';

export const deleteItem = async (res: ServerResponse, id: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Șterge mai întâi notificările asociate
        await client.query("DELETE FROM notifications WHERE item_id = $1", [id]);
        // Apoi șterge articolul
        const result = await client.query("DELETE FROM items WHERE id = $1", [id]);
        await client.query('COMMIT');

        if (result.rowCount && result.rowCount > 0) {
            res.writeHead(204, { 'Content-Type': 'application/json' });
            res.end();
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost găsit" }));
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in deleteItem:', error); // Adăugăm logare pentru eroare
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la ștergerea articolului" }));
    } finally {
        client.release();
    }
};