import { IncomingMessage, ServerResponse } from 'http';
import pool from "../config/database";
import { getRequestBody } from '../utils/requestUtils';

export const getAllCategories = async (res: ServerResponse) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Error fetching categories" }));
    }
};

export const createCategory = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getRequestBody(req);
        const { name, description } = body;
        const result = await pool.query(
            'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows[0]));
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Error creating category" }));
    }
};

export const updateCategory = async (req: IncomingMessage, res: ServerResponse, id: number) => {
    try {
        const body = await getRequestBody(req);
        const { name, description } = body;
        const result = await pool.query(
            'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        if (result.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Category not found" }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows[0]));
        }
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Error updating category" }));
    }
};

export const deleteCategory = async (res: ServerResponse, id: number) => {
    try {
        const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        if (result.rowCount && result.rowCount > 0) {
            res.writeHead(204, { 'Content-Type': 'application/json' });
            res.end();
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Category not found" }));
        }
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Error deleting category" }));
    }
};
