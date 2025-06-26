import { IncomingMessage, ServerResponse } from 'http';
import pool from "../config/database";
import { getRequestBody } from '../utils/requestUtils';

export const getAllItems = async (res: ServerResponse) => {
    try {
        const result = await pool.query("SELECT * FROM items");
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la preluarea articolelor" }));
    }
};

export const createItem = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getRequestBody(req);
        const { name, category_id, quantity, notification_threshold } = body;
        const result = await pool.query(
            "INSERT INTO items (name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, category_id, quantity, notification_threshold]
        );
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows[0]));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la crearea articolului" }));
    }
};

export const updateItem = async (req: IncomingMessage, res: ServerResponse, id: number) => {
    try {
        const body = await getRequestBody(req);
        const { name, category_id, quantity, notification_threshold } = body;
        const result = await pool.query(
            "UPDATE items SET name = $1, category_id = $2, quantity = $3, notification_threshold = $4 WHERE id = $5 RETURNING *",
            [name, category_id, quantity, notification_threshold, id]
        );
        if (result.rows.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows[0]));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost găsit" }));
        }
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la actualizarea articolului" }));
    }
};

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