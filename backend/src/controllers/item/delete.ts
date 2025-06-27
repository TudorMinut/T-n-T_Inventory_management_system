import { ServerResponse } from 'http';
import pool from "../../config/database";

export const deleteItem = async (res: ServerResponse, id: number) => {
    try {
        const result = await pool.query("DELETE FROM items WHERE id = $1", [id]);
        if (result.rowCount && result.rowCount > 0) {
            res.writeHead(204, { 'Content-Type': 'application/json' });
            res.end();
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost găsit" }));
        }
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la ștergerea articolului" }));
    }
};
