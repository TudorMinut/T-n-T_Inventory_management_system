import { IncomingMessage, ServerResponse } from "http";
import pool from "../config/database";
import { getRequestBody } from "../utils/requestUtils";
import { sendError, sendJson, sendNoContent } from "../utils/responseUtils";

type CategoryPayload = {
    name?: string;
    description?: string | null;
};

export const getAllCategories = async (res: ServerResponse) => {
    try {
        const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
        sendJson(res, 200, result.rows);
    } catch (error) {
        console.error(error);
        sendError(res, 500, "Error fetching categories");
    }
};

export const createCategory = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await getRequestBody<CategoryPayload>(req);
        const { name, description } = body;

        if (!name?.trim()) {
            return sendError(res, 400, "Category name is required");
        }

        const result = await pool.query(
            "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *",
            [name.trim(), description ?? null]
        );
        sendJson(res, 201, result.rows[0]);
    } catch (error) {
        console.error(error);
        sendError(res, 500, "Error creating category");
    }
};

export const updateCategory = async (req: IncomingMessage, res: ServerResponse, id: number) => {
    try {
        const body = await getRequestBody<CategoryPayload>(req);
        const { name, description } = body;

        if (!name?.trim()) {
            return sendError(res, 400, "Category name is required");
        }

        const result = await pool.query(
            "UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *",
            [name.trim(), description ?? null, id]
        );
        if (result.rows.length === 0) {
            sendError(res, 404, "Category not found");
        } else {
            sendJson(res, 200, result.rows[0]);
        }
    } catch (error) {
        console.error(error);
        sendError(res, 500, "Error updating category");
    }
};

export const deleteCategory = async (res: ServerResponse, id: number) => {
    try {
        const result = await pool.query("DELETE FROM categories WHERE id = $1", [id]);
        if (result.rowCount && result.rowCount > 0) {
            sendNoContent(res);
        } else {
            sendError(res, 404, "Category not found");
        }
    } catch (error) {
        console.error(error);
        sendError(res, 500, "Error deleting category");
    }
};
