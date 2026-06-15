import { IncomingMessage, ServerResponse } from "http";
import pool from "../config/database";
import { getRequestBody } from "../utils/requestUtils";
import { sendError, sendJson, sendNoContent } from "../utils/responseUtils";

type ItemPayload = {
    name?: string;
    category_id?: number | null;
    quantity?: number;
    notification_threshold?: number;
};

const validateItemPayload = (body: ItemPayload) => {
    if (!body.name?.trim()) {
        return "Numele articolului este obligatoriu.";
    }
    if (typeof body.quantity !== "number" || body.quantity < 0) {
        return "Cantitatea trebuie sa fie un numar mai mare sau egal cu 0.";
    }
    if (typeof body.notification_threshold !== "number" || body.notification_threshold < 0) {
        return "Pragul de notificare trebuie sa fie un numar mai mare sau egal cu 0.";
    }
    return null;
};

export const getAllItems = async (res: ServerResponse) => {
    try {
        const result = await pool.query("SELECT * FROM items ORDER BY created_at DESC, id DESC");
        sendJson(res, 200, result.rows);
    } catch (error) {
        sendError(res, 500, "Eroare la preluarea articolelor");
    }
};

export const createItem = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getRequestBody<ItemPayload>(req);
        const normalizedName = body.name?.trim();
        if (!normalizedName) {
            return sendError(res, 400, "Numele articolului este obligatoriu.");
        }
        const validationError = validateItemPayload(body);
        if (validationError) {
            return sendError(res, 400, validationError);
        }

        const { category_id, quantity, notification_threshold } = body;
        const result = await pool.query(
            "INSERT INTO items (name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4) RETURNING *",
            [normalizedName, category_id ?? null, quantity, notification_threshold]
        );
        sendJson(res, 201, result.rows[0]);
    } catch (error) {
        sendError(res, 500, "Eroare la crearea articolului");
    }
};

export const updateItem = async (req: IncomingMessage, res: ServerResponse, id: number) => {
    try {
        const body = await getRequestBody<ItemPayload>(req);
        const normalizedName = body.name?.trim();
        if (!normalizedName) {
            return sendError(res, 400, "Numele articolului este obligatoriu.");
        }
        const validationError = validateItemPayload(body);
        if (validationError) {
            return sendError(res, 400, validationError);
        }

        const { category_id, quantity, notification_threshold } = body;
        const result = await pool.query(
            "UPDATE items SET name = $1, category_id = $2, quantity = $3, notification_threshold = $4 WHERE id = $5 RETURNING *",
            [normalizedName, category_id ?? null, quantity, notification_threshold, id]
        );
        if (result.rows.length > 0) {
            sendJson(res, 200, result.rows[0]);
        } else {
            sendError(res, 404, "Articolul nu a fost gasit");
        }
    } catch (error) {
        sendError(res, 500, "Eroare la actualizarea articolului");
    }
};

export const deleteItem = async (res: ServerResponse, id: number) => {
    try {
        const result = await pool.query("DELETE FROM items WHERE id = $1", [id]);
        if (result.rowCount && result.rowCount > 0) {
            sendNoContent(res);
        } else {
            sendError(res, 404, "Articolul nu a fost gasit");
        }
    } catch (error) {
        sendError(res, 500, "Eroare la stergerea articolului");
    }
};
