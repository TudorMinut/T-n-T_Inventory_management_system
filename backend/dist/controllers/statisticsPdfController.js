"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatsPdf = void 0;
const database_1 = __importDefault(require("../config/database"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const getStatsPdf = async (_req, res) => {
    try {
        const totalItems = await database_1.default.query('SELECT COUNT(*) as count FROM items');
        const totalCategories = await database_1.default.query('SELECT COUNT(*) as count FROM categories');
        const itemsPerCategory = await database_1.default.query('SELECT c.name, COUNT(i.id) as count FROM categories c LEFT JOIN items i ON c.id = i.category_id GROUP BY c.name');
        const doc = new pdfkit_1.default();
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=statistics.pdf'
        });
        doc.pipe(res);
        doc.fontSize(20).text('Statistici Stoc', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Numar total de articole: ${totalItems.rows[0].count}`);
        doc.text(`Numar total de categorii: ${totalCategories.rows[0].count}`);
        doc.moveDown();
        doc.fontSize(16).text('Articole pe categorie:');
        itemsPerCategory.rows.forEach(row => {
            doc.fontSize(12).text(`- ${row.name}: ${row.count}`);
        });
        doc.end();
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la generarea PDF-ului.');
    }
};
exports.getStatsPdf = getStatsPdf;
