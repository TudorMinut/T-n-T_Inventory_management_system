import { IncomingMessage, ServerResponse } from "http";
import pool from '../config/database';
import papaparse from 'papaparse';

// Helper pentru a trimite fisiere
function sendFile(res: ServerResponse, content: string | Buffer, contentType: string, filename: string) {
    res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
    });
    res.end(content);
}

// Pentru import, trebuie sa citesti body-ul ca text (nu multipart)
function getRequestBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}

export const exportCsv = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
        const { rows } = await pool.query('SELECT i.name, c.name as category, i.quantity, i.created_at FROM items i LEFT JOIN categories c ON i.category_id = c.id');
        const csv = papaparse.unparse(rows);
        sendFile(res, csv, 'text/csv', 'items.csv');
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la exportul CSV.');
    }
};

export const importCsv = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getRequestBody(req);
        const parsed = papaparse.parse(body, { header: true });
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Gaseste cel mai mare ID curent pentru categorii
            const maxCategoryResult = await client.query('SELECT COALESCE(MAX(id), 0) as max_id FROM categories');
            let nextCategoryId = maxCategoryResult.rows[0].max_id + 1;

            // Gaseste cel mai mare ID curent pentru articole
            const maxItemResult = await client.query('SELECT COALESCE(MAX(id), 0) as max_id FROM items');
            let nextItemId = maxItemResult.rows[0].max_id + 1;

            for (const item of parsed.data as any[]) {
                if (item.name && item.quantity) {
                    let categoryId = null;
                    if (item.category) {
                        // Verifica daca categoria exista deja
                        let categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [item.category]);
                        if (categoryResult.rows.length > 0) {
                            categoryId = categoryResult.rows[0].id;
                        } else {
                            // Creeaza categoria cu ID specificat
                            const newCategory = await client.query('INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING id', [nextCategoryId, item.category]);
                            categoryId = newCategory.rows[0].id;
                            nextCategoryId++;
                        }
                    }
                    // Insereaza articolul cu ID specificat
                    await client.query('INSERT INTO items (id, name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4, $5)',
                        [nextItemId, item.name, categoryId, parseInt(item.quantity), item.notification_threshold || 5]
                    );
                    nextItemId++;
                }
            }

            await client.query('COMMIT');
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Import CSV finalizat cu succes.');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la importul CSV.');
    }
};
