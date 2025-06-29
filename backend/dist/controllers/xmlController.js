"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importXml = exports.exportXml = void 0;
const database_1 = __importDefault(require("../config/database"));
const xml_js_1 = __importDefault(require("xml-js"));
function sendFile(res, content, contentType, filename) {
    res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
    });
    res.end(content);
}
function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}
const exportXml = async (_req, res) => {
    try {
        const { rows } = await database_1.default.query('SELECT i.name, c.name as category, i.quantity, i.created_at FROM items i LEFT JOIN categories c ON i.category_id = c.id');
        const xml = xml_js_1.default.js2xml({ items: { item: rows } }, { compact: true, spaces: 4 });
        sendFile(res, xml, 'application/xml', 'items.xml');
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la exportul XML.');
    }
};
exports.exportXml = exportXml;
const importXml = async (req, res) => {
    try {
        const body = await getRequestBody(req);
        const parsed = xml_js_1.default.xml2js(body, { compact: true });
        const items = parsed.items?.item || [];
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            const maxCategoryResult = await client.query('SELECT COALESCE(MAX(id), 0) as max_id FROM categories');
            let nextCategoryId = maxCategoryResult.rows[0].max_id + 1;
            const maxItemResult = await client.query('SELECT COALESCE(MAX(id), 0) as max_id FROM items');
            let nextItemId = maxItemResult.rows[0].max_id + 1;
            for (const item of Array.isArray(items) ? items : [items]) {
                const name = item.name?._text;
                const quantity = item.quantity?._text;
                const category = item.category?._text;
                if (name && quantity) {
                    const existingItem = await client.query('SELECT id FROM items WHERE name = $1', [name]);
                    if (existingItem.rows.length > 0) {
                        continue;
                    }
                    let categoryId = null;
                    if (category) {
                        let categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', [category]);
                        if (categoryResult.rows.length > 0) {
                            categoryId = categoryResult.rows[0].id;
                        }
                        else {
                            const newCategory = await client.query('INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING id', [nextCategoryId, category]);
                            categoryId = newCategory.rows[0].id;
                            nextCategoryId++;
                        }
                    }
                    await client.query('INSERT INTO items (id, name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4, $5)', [nextItemId, name, categoryId, parseInt(quantity), 5]);
                    nextItemId++;
                }
            }
            await client.query('COMMIT');
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Import XML finalizat cu succes.');
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la importul XML.');
    }
};
exports.importXml = importXml;
