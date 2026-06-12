import pool from "../config/database";
import papaparse from "papaparse";
import * as xmlJs from "xml-js";
import { IncomingMessage, ServerResponse } from "http";
import { getTextRequestBody } from "../utils/requestUtils";
import { sendError } from "../utils/responseUtils";

function sendFile(res: ServerResponse, content: string | Buffer, contentType: string, filename: string) {
    res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
    });
    res.end(content);
}

const resolveCategoryId = async (categoryName?: string) => {
    if (!categoryName?.trim()) {
        return null;
    }

    const categoryResult = await pool.query("SELECT id FROM categories WHERE name = $1", [categoryName.trim()]);
    if (categoryResult.rows.length > 0) {
        return categoryResult.rows[0].id;
    }

    const newCategory = await pool.query("INSERT INTO categories (name) VALUES ($1) RETURNING id", [categoryName.trim()]);
    return newCategory.rows[0].id;
};

export const exportCsv = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
        const { rows } = await pool.query("SELECT i.name, c.name as category, i.quantity, i.notification_threshold, i.created_at FROM items i LEFT JOIN categories c ON i.category_id = c.id");
        const csv = papaparse.unparse(rows);
        sendFile(res, csv, "text/csv; charset=utf-8", "items.csv");
    } catch (error) {
        sendError(res, 500, "Eroare la exportul CSV.");
    }
};

export const exportJson = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
        const { rows } = await pool.query("SELECT i.name, c.name as category, i.quantity, i.notification_threshold, i.created_at FROM items i LEFT JOIN categories c ON i.category_id = c.id");
        sendFile(res, JSON.stringify(rows, null, 2), "application/json; charset=utf-8", "items.json");
    } catch (error) {
        sendError(res, 500, "Eroare la exportul JSON.");
    }
};

export const exportXml = async (_req: IncomingMessage, res: ServerResponse) => {
    try {
        const { rows } = await pool.query("SELECT i.name, c.name as category, i.quantity, i.notification_threshold, i.created_at FROM items i LEFT JOIN categories c ON i.category_id = c.id");
        const xml = xmlJs.js2xml({ items: { item: rows } }, { compact: true, spaces: 4 });
        sendFile(res, xml, "application/xml; charset=utf-8", "items.xml");
    } catch (error) {
        sendError(res, 500, "Eroare la exportul XML.");
    }
};

export const importJson = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getTextRequestBody(req);
        const jsonData = JSON.parse(body);
        for (const item of jsonData) {
            if (item.name && item.quantity) {
                const categoryId = await resolveCategoryId(item.category);
                await pool.query(
                    "INSERT INTO items (name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4)",
                    [item.name, categoryId, parseInt(item.quantity, 10), item.notification_threshold || 5]
                );
            }
        }
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Import JSON finalizat cu succes.");
    } catch (error) {
        sendError(res, 500, "Eroare la importul JSON.");
    }
};

export const importCsv = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getTextRequestBody(req);
        const parsed = papaparse.parse(body, { header: true });
        for (const item of parsed.data as Array<Record<string, string>>) {
            if (item.name && item.quantity) {
                const categoryId = await resolveCategoryId(item.category);
                await pool.query(
                    "INSERT INTO items (name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4)",
                    [item.name, categoryId, parseInt(item.quantity, 10), item.notification_threshold || 5]
                );
            }
        }
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Import CSV finalizat cu succes.");
    } catch (error) {
        sendError(res, 500, "Eroare la importul CSV.");
    }
};

export const importXml = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getTextRequestBody(req);
        const parsed = xmlJs.xml2js(body, { compact: true }) as {
            items?: {
                item?: Array<{
                    name?: { _text?: string };
                    quantity?: { _text?: string };
                    category?: { _text?: string };
                    notification_threshold?: { _text?: string };
                }> | {
                    name?: { _text?: string };
                    quantity?: { _text?: string };
                    category?: { _text?: string };
                    notification_threshold?: { _text?: string };
                };
            };
        };

        const items = parsed.items?.item || [];
        for (const item of Array.isArray(items) ? items : [items]) {
            const name = item.name?._text;
            const quantity = item.quantity?._text;
            const category = item.category?._text;
            const threshold = item.notification_threshold?._text;
            if (name && quantity) {
                const categoryId = await resolveCategoryId(category);
                await pool.query(
                    "INSERT INTO items (name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4)",
                    [name, categoryId, parseInt(quantity, 10), threshold ? parseInt(threshold, 10) : 5]
                );
            }
        }
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Import XML finalizat cu succes.");
    } catch (error) {
        sendError(res, 500, "Eroare la importul XML.");
    }
};
