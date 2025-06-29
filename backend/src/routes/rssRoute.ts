import { IncomingMessage, ServerResponse } from "http";
import pool from "../config/database";

export async function handleRssRoute(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== "GET") {
        res.writeHead(405, { "Content-Type": "text/plain" });
        res.end("Method Not Allowed");
        return;
    }
    try {
        const result = await pool.query(`
            SELECT i.id, i.name, i.created_at, i.notification_message, c.name as category_name
            FROM items i
            LEFT JOIN categories c ON i.category_id = c.id
            ORDER BY i.created_at DESC
            LIMIT 20
        `);
        const items = result.rows;
        const siteTitle = "T-n-T - Gestionare Stocuri";
        const siteUrl = "http://localhost:3000";
        const siteDescription = "Flux RSS cu ultimele articole adaugate in gestiune.";
        const lastBuildDate = new Date().toUTCString();
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<rss version="2.0">\n`;
        xml += `  <channel>\n`;
        xml += `    <title>${siteTitle}</title>\n`;
        xml += `    <link>${siteUrl}</link>\n`;
        xml += `    <description>${siteDescription}</description>\n`;
        xml += `    <language>ro</language>\n`;
        xml += `    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n`;
        for (const item of items) {
            xml += `    <item>\n`;
            xml += `      <title>${escapeXml(item.name)}</title>\n`;
            xml += `      <link>${siteUrl}/dashboard.html#item-${item.id}</link>\n`;
            xml += `      <description>${escapeXml(item.notification_message || "Articol din categoria " + (item.category_name || "Necategorizat"))}</description>\n`;
            xml += `      <pubDate>${new Date(item.created_at).toUTCString()}</pubDate>\n`;
            xml += `      <guid>${siteUrl}/dashboard.html#item-${item.id}</guid>\n`;
            xml += `    </item>\n`;
        }
        xml += `  </channel>\n`;
        xml += `</rss>`;
        res.writeHead(200, { "Content-Type": "application/rss+xml; charset=utf-8" });
        res.end(xml);
    } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Eroare la generarea fluxului RSS");
    }
}

function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
        }
        return c;
    });
}
