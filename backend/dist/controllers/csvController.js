"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importCsv = exports.exportCsv = void 0;
const database_1 = __importDefault(require("../config/database"));
const papaparse_1 = __importDefault(require("papaparse"));
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
const exportCsv = async (_req, res) => {
    try {
        const { rows } = await database_1.default.query('SELECT i.name, c.name as category, i.quantity, i.created_at FROM items i LEFT JOIN categories c ON i.category_id = c.id');
        const csv = papaparse_1.default.unparse(rows);
        sendFile(res, csv, 'text/csv', 'items.csv');
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la exportul CSV.');
    }
};
exports.exportCsv = exportCsv;
const importCsv = async (req, res) => {
    try {
        const body = await getRequestBody(req);
        const parsed = papaparse_1.default.parse(body, { header: true });
        for (const item of parsed.data) {
            if (item.name && item.quantity) {
                let categoryId = null;
                if (item.category) {
                    let categoryResult = await database_1.default.query('SELECT id FROM categories WHERE name = $1', [item.category]);
                    if (categoryResult.rows.length > 0) {
                        categoryId = categoryResult.rows[0].id;
                    }
                    else {
                        const newCategory = await database_1.default.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [item.category]);
                        categoryId = newCategory.rows[0].id;
                    }
                }
                await database_1.default.query('INSERT INTO items (name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4)', [item.name, categoryId, parseInt(item.quantity), item.notification_threshold || 5]);
            }
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Import CSV finalizat cu succes.');
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la importul CSV.');
    }
};
exports.importCsv = importCsv;
