import { IncomingMessage, ServerResponse } from "http";
import pool from '../config/database';
import papaparse from 'papaparse';

// Helper pentru a trimite fișiere
function sendFile(res: ServerResponse, content: string | Buffer, contentType: string, filename: string) {
    res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
    });
    res.end(content);
}

// Pentru import, trebuie să citești body-ul ca text (nu multipart)
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
        for (const item of parsed.data as any[]) {
            if (item.name && item.quantity) {
                let categoryId = null;
                if (item.category) {
                    let categoryResult = await pool.query('SELECT id FROM categories WHERE name = $1', [item.category]);
                    if (categoryResult.rows.length > 0) {
                        categoryId = categoryResult.rows[0].id;
                    } else {
                        const newCategory = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [item.category]);
                        categoryId = newCategory.rows[0].id;
                    }
                }
                await pool.query('INSERT INTO items (name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4)',
                    [item.name, categoryId, parseInt(item.quantity), item.notification_threshold || 5]
                );
            }
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Import CSV finalizat cu succes.');
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la importul CSV.');
    }
};
