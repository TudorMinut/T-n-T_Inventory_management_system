"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = void 0;
const database_1 = __importDefault(require("../../config/database"));
const deleteItem = async (res, id) => {
    const client = await database_1.default.connect();
    try {
        await client.query('BEGIN');
        await client.query("DELETE FROM notifications WHERE item_id = $1", [id]);
        const result = await client.query("DELETE FROM items WHERE id = $1", [id]);
        await client.query('COMMIT');
        if (result.rowCount && result.rowCount > 0) {
            res.writeHead(204, { 'Content-Type': 'application/json' });
            res.end();
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost gasit" }));
        }
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in deleteItem:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la ștergerea articolului" }));
    }
    finally {
        client.release();
    }
};
exports.deleteItem = deleteItem;
