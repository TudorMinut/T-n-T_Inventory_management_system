import { IncomingMessage, ServerResponse } from 'http';
import pool from '../config/database';
import { sanitizeHtml } from '../utils/securityUtils';

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
            html += `<li>${sanitizeHtml(row.name)}: ${sanitizeHtml(row.count.toString())}</li>`;
        });
        html += '</ul>';

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la generarea statisticilor HTML.');
    }
};
