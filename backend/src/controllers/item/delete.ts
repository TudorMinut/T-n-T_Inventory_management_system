import { ServerResponse } from 'http';
import pool from '../../config/database';

// Functie pentru stergerea unui articol
export const deleteItem = async (res: ServerResponse, id: number) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Sterge mai intai notificarile asociate
        await client.query("DELETE FROM notifications WHERE item_id = $1", [id]);
        // Apoi sterge articolul
        const result = await client.query("DELETE FROM items WHERE id = $1", [id]);
        await client.query('COMMIT');

        if (result.rowCount && result.rowCount > 0) {
            res.writeHead(204, { 'Content-Type': 'application/json' });
            res.end();
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost gasit" }));
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in deleteItem:', error); // Adaugam logare pentru eroare
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la ștergerea articolului" }));
    } finally {
        client.release();
    }
};