import { IncomingMessage, ServerResponse } from 'http';
import pool from '../config/database';
import PDFDocument from 'pdfkit';

export const getStatsHtml = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
        const totalItems = await pool.query('SELECT COUNT(*) as count FROM items');
        const totalCategories = await pool.query('SELECT COUNT(*) as count FROM categories');
        const itemsPerCategory = await pool.query('SELECT c.name, COUNT(i.id) as count FROM categories c LEFT JOIN items i ON c.id = i.category_id GROUP BY c.name');

        let html = `<h1>Statistici Stoc</h1>`;
        html += `<p>Numar total de articole: ${totalItems.rows[0].count}</p>`;
        html += `<p>Numar total de categorii: ${totalCategories.rows[0].count}</p>`;
        html += `<h2>Articole pe categorie:</h2>`;
        html += '<ul>';
        itemsPerCategory.rows.forEach(row => {
            html += `<li>${row.name}: ${row.count}</li>`;
        });
        html += '</ul>';

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la generarea statisticilor HTML.');
    }
};

export const getStatsPdf = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
        const totalItems = await pool.query('SELECT COUNT(*) as count FROM items');
        const totalCategories = await pool.query('SELECT COUNT(*) as count FROM categories');
        const itemsPerCategory = await pool.query('SELECT c.name, COUNT(i.id) as count FROM categories c LEFT JOIN items i ON c.id = i.category_id GROUP BY c.name');

        const doc = new PDFDocument();
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
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la generarea PDF-ului.');
    }
};
