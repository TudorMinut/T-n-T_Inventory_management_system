import { IncomingMessage, ServerResponse } from "http";
import pool from '../config/database';
import js2xml from 'xml-js';

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

export const exportXml = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
        const { rows } = await pool.query('SELECT i.name, c.name as category, i.quantity, i.created_at FROM items i LEFT JOIN categories c ON i.category_id = c.id');
        const xml = js2xml.js2xml({ items: { item: rows } }, { compact: true, spaces: 4 });
        sendFile(res, xml, 'application/xml', 'items.xml');
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la exportul XML.');
    }
};

export const importXml = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getRequestBody(req);
        const parsed: any = js2xml.xml2js(body, { compact: true });
        const items = parsed.items?.item || [];
        for (const item of Array.isArray(items) ? items : [items]) {
            const name = item.name?._text;
            const quantity = item.quantity?._text;
            const category = item.category?._text;
            if (name && quantity) {
                let categoryId = null;
                if (category) {
                    let categoryResult = await pool.query('SELECT id FROM categories WHERE name = $1', [category]);
                    if (categoryResult.rows.length > 0) {
                        categoryId = categoryResult.rows[0].id;
                    } else {
                        const newCategory = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [category]);
                        categoryId = newCategory.rows[0].id;
                    }
                }
                await pool.query('INSERT INTO items (name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4)',
                    [name, categoryId, parseInt(quantity), 5]
                );
            }
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Import XML finalizat cu succes.');
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la importul XML.');
    }
};
