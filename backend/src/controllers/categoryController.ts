import { IncomingMessage, ServerResponse } from 'http';
import pool from "../config/database";
import { getRequestBody } from '../utils/requestUtils';
import { sanitizeAndValidateName } from '../utils/securityUtils';

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
        const { name } = body;

        // Validări de securitate
        const sanitizedName = sanitizeAndValidateName(name);
        if (!sanitizedName) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Numele categoriei trebuie să aibă între 2-100 caractere" }));
            return;
        }

        // Găsește cel mai mic id liber
        const idResult = await pool.query('SELECT id FROM categories ORDER BY id ASC');
        let newId = 1;
        for (const row of idResult.rows) {
            if (row.id === newId) {
                newId++;
            } else {
                break;
            }
        }

        const result = await pool.query(
            'INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING *',
            [newId, sanitizedName]
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
        const { name } = body;
        const result = await pool.query(
            'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
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
        // Verifică dacă categoria există
        const categoryCheck = await pool.query('SELECT id, name FROM categories WHERE id = $1', [id]);
        if (categoryCheck.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Category not found" }));
            return;
        }

        const categoryName = categoryCheck.rows[0].name;

        // Nu permite ștergerea categoriei "Necategorizate"
        if (categoryName.toLowerCase() === 'necategorizate') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Nu se poate șterge categoria 'Necategorizate'" }));
            return;
        }

        // Găsește categoria "Necategorizate"
        const uncategorizedResult = await pool.query('SELECT id FROM categories WHERE LOWER(name) = $1', ['necategorizate']);
        let uncategorizedId;

        if (uncategorizedResult.rows.length === 0) {
            // Creează categoria "Necategorizate" dacă nu există
            const newCategory = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', ['Necategorizate']);
            uncategorizedId = newCategory.rows[0].id;
        } else {
            uncategorizedId = uncategorizedResult.rows[0].id;
        }

        // Mută toate articolele din categoria care urmează să fie ștearsă în categoria "Necategorizate"
        await pool.query('UPDATE items SET category_id = $1 WHERE category_id = $2', [uncategorizedId, id]);

        // Șterge categoria
        const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);

        if (result.rowCount && result.rowCount > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: "Categoria a fost ștearsă cu succes. Articolele au fost mutate în categoria 'Necategorizate'."
            }));
        } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Eroare la ștergerea categoriei" }));
        }
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Error deleting category" }));
    }
};
