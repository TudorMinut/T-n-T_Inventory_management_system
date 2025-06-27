"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importXml = exports.exportXml = void 0;
const database_1 = __importDefault(require("../config/database"));
const xml_js_1 = __importDefault(require("xml-js"));
// Helper pentru a trimite fișiere
function sendFile(res, content, contentType, filename) {
    res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
    });
    res.end(content);
}
// Pentru import, trebuie să citești body-ul ca text (nu multipart)
function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
}
const exportXml = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield database_1.default.query('SELECT i.name, c.name as category, i.quantity, i.created_at FROM items i LEFT JOIN categories c ON i.category_id = c.id');
        const xml = xml_js_1.default.js2xml({ items: { item: rows } }, { compact: true, spaces: 4 });
        sendFile(res, xml, 'application/xml', 'items.xml');
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la exportul XML.');
    }
});
exports.exportXml = exportXml;
const importXml = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const body = yield getRequestBody(req);
        const parsed = xml_js_1.default.xml2js(body, { compact: true });
        const items = ((_a = parsed.items) === null || _a === void 0 ? void 0 : _a.item) || [];
        for (const item of Array.isArray(items) ? items : [items]) {
            const name = (_b = item.name) === null || _b === void 0 ? void 0 : _b._text;
            const quantity = (_c = item.quantity) === null || _c === void 0 ? void 0 : _c._text;
            const category = (_d = item.category) === null || _d === void 0 ? void 0 : _d._text;
            if (name && quantity) {
                let categoryId = null;
                if (category) {
                    let categoryResult = yield database_1.default.query('SELECT id FROM categories WHERE name = $1', [category]);
                    if (categoryResult.rows.length > 0) {
                        categoryId = categoryResult.rows[0].id;
                    }
                    else {
                        const newCategory = yield database_1.default.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [category]);
                        categoryId = newCategory.rows[0].id;
                    }
                }
                yield database_1.default.query('INSERT INTO items (name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4)', [name, categoryId, parseInt(quantity), 5]);
            }
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Import XML finalizat cu succes.');
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la importul XML.');
    }
});
exports.importXml = importXml;
