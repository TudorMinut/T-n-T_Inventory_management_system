import pool from '../config/database';
import { IncomingMessage, ServerResponse } from 'http';
import PDFDocument from 'pdfkit';

export const getStatsHtml = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
        const items = await pool.query('SELECT i.name, i.quantity, c.name as category FROM items i LEFT JOIN categories c ON i.category_id = c.id');
        let html = '<h1>Statistici</h1>';
        html += '<table border="1" cellpadding="5"><tr><th>Articol</th><th>Cantitate</th><th>Categorie</th></tr>';
        for (const item of items.rows) {
            html += `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.category || ''}</td></tr>`;
        }
        html += '</table>';
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la generarea statisticilor HTML.');
    }
};

export const getStatsPdf = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
        const items = await pool.query('SELECT i.name, i.quantity, c.name as category FROM items i LEFT JOIN categories c ON i.category_id = c.id');
        const doc = new PDFDocument();
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="statistici.pdf"'
        });
        doc.pipe(res);
        doc.fontSize(18).text('Statistici Articole', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12);
        items.rows.forEach(item => {
            doc.text(`Articol: ${item.name} | Cantitate: ${item.quantity} | Categorie: ${item.category || ''}`);
        });
        doc.end();
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la generarea statisticilor PDF.');
    }
};
