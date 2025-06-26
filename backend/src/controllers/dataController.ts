import pool from '../config/database';
import papaparse from 'papaparse';
import js2xml from 'xml-js';
import PDFDocument from 'pdfkit';
import { IncomingMessage, ServerResponse } from 'http';

// Helper pentru a trimite fișiere
function sendFile(res: ServerResponse, content: string | Buffer, contentType: string, filename: string) {
    res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
    });
    res.end(content);
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

export const exportJson = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
        const { rows } = await pool.query('SELECT i.name, c.name as category, i.quantity, i.created_at FROM items i LEFT JOIN categories c ON i.category_id = c.id');
        sendFile(res, JSON.stringify(rows, null, 2), 'application/json', 'items.json');
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la exportul JSON.');
    }
};

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

// Pentru import, trebuie să citești body-ul ca text (nu multipart)
function getRequestBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}

export const importJson = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getRequestBody(req);
        const jsonData = JSON.parse(body);
        for (const item of jsonData) {
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
        res.end('Import JSON finalizat cu succes.');
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la importul JSON.');
    }
};

export const importCsv = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getRequestBody(req);
        // Presupunem că body-ul este text CSV
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

export const importXml = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getRequestBody(req);
        // Presupunem că body-ul este text XML
        const parsed = js2xml.xml2js(body, { compact: true });
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

// Funcții de Statistici
export const getStatsHtml = async (req: Request, res: Response) => {
    try {
        const totalItems = await pool.query('SELECT COUNT(*) as count FROM items');
        const totalCategories = await pool.query('SELECT COUNT(*) as count FROM categories');
        const itemsPerCategory = await pool.query('SELECT c.name, COUNT(i.id) as count FROM categories c LEFT JOIN items i ON c.id = i.category_id GROUP BY c.name');

        let html = `<h1>Statistici Stoc</h1>`;
        html += `<p>Număr total de articole: ${totalItems.rows[0].count}</p>`;
        html += `<p>Număr total de categorii: ${totalCategories.rows[0].count}</p>`;
        html += `<h2>Articole pe categorie:</h2>`;
        html += '<ul>';
        itemsPerCategory.rows.forEach(row => {
            html += `<li>${row.name}: ${row.count}</li>`;
        });
        html += '</ul>';

        res.send(html);
    } catch (error) {
        res.status(500).send('Eroare la generarea statisticilor HTML.');
    }
};

export const getStatsPdf = async (req: Request, res: Response) => {
    try {
        const totalItems = await pool.query('SELECT COUNT(*) as count FROM items');
        const totalCategories = await pool.query('SELECT COUNT(*) as count FROM categories');
        const itemsPerCategory = await pool.query('SELECT c.name, COUNT(i.id) as count FROM categories c LEFT JOIN items i ON c.id = i.category_id GROUP BY c.name');

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=statistics.pdf');
        doc.pipe(res);

        doc.fontSize(20).text('Statistici Stoc', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Număr total de articole: ${totalItems.rows[0].count}`);
        doc.text(`Număr total de categorii: ${totalCategories.rows[0].count}`);
        doc.moveDown();
        doc.fontSize(16).text('Articole pe categorie:');
        itemsPerCategory.rows.forEach(row => {
            doc.fontSize(12).text(`- ${row.name}: ${row.count}`);
        });

        doc.end();
    } catch (error) {
        res.status(500).send('Eroare la generarea PDF-ului.');
    }
};
