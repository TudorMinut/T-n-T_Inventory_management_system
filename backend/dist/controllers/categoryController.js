"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = void 0;
const database_1 = __importDefault(require("../config/database"));
const requestUtils_1 = require("../utils/requestUtils");
const securityUtils_1 = require("../utils/securityUtils");
const getAllCategories = async (res) => {
    try {
        const result = await database_1.default.query('SELECT * FROM categories ORDER BY name ASC');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
    }
    catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Error fetching categories" }));
    }
};
exports.getAllCategories = getAllCategories;
const createCategory = async (req, res) => {
    try {
        const body = await (0, requestUtils_1.getRequestBody)(req);
        const { name } = body;
        const sanitizedName = (0, securityUtils_1.sanitizeAndValidateName)(name);
        if (!sanitizedName) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Numele categoriei trebuie să aibă între 2-100 caractere" }));
            return;
        }
        const result = await database_1.default.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [sanitizedName]);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows[0]));
    }
    catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Error creating category" }));
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, id) => {
    try {
        const body = await (0, requestUtils_1.getRequestBody)(req);
        const { name } = body;
        const result = await database_1.default.query('UPDATE categories SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        if (result.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Category not found" }));
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows[0]));
        }
    }
    catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Error updating category" }));
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (res, id) => {
    try {
        const categoryCheck = await database_1.default.query('SELECT id, name FROM categories WHERE id = $1', [id]);
        if (categoryCheck.rows.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Category not found" }));
            return;
        }
        const categoryName = categoryCheck.rows[0].name;
        if (categoryName.toLowerCase() === 'necategorizate') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Nu se poate șterge categoria 'Necategorizate'" }));
            return;
        }
        const uncategorizedResult = await database_1.default.query('SELECT id FROM categories WHERE LOWER(name) = $1', ['necategorizate']);
        let uncategorizedId;
        if (uncategorizedResult.rows.length === 0) {
            const newCategory = await database_1.default.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', ['Necategorizate']);
            uncategorizedId = newCategory.rows[0].id;
        }
        else {
            uncategorizedId = uncategorizedResult.rows[0].id;
        }
        await database_1.default.query('UPDATE items SET category_id = $1 WHERE category_id = $2', [uncategorizedId, id]);
        const result = await database_1.default.query('DELETE FROM categories WHERE id = $1', [id]);
        if (result.rowCount && result.rowCount > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: "Categoria a fost ștearsă cu succes. Articolele au fost mutate în categoria 'Necategorizate'."
            }));
        }
        else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Eroare la ștergerea categoriei" }));
        }
    }
    catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Error deleting category" }));
    }
};
exports.deleteCategory = deleteCategory;
