"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.createItem = exports.getAllItems = void 0;
const database_1 = __importDefault(require("../config/database"));
const requestUtils_1 = require("../utils/requestUtils");
const getAllItems = (res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query("SELECT * FROM items");
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows));
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la preluarea articolelor" }));
    }
});
exports.getAllItems = getAllItems;
const createItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield (0, requestUtils_1.getRequestBody)(req);
        const { name, category_id, quantity, notification_threshold } = body;
        const result = yield database_1.default.query("INSERT INTO items (name, category_id, quantity, notification_threshold) VALUES ($1, $2, $3, $4) RETURNING *", [name, category_id, quantity, notification_threshold]);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.rows[0]));
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la crearea articolului" }));
    }
});
exports.createItem = createItem;
const updateItem = (req, res, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = yield (0, requestUtils_1.getRequestBody)(req);
        const { name, category_id, quantity, notification_threshold } = body;
        const result = yield database_1.default.query("UPDATE items SET name = $1, category_id = $2, quantity = $3, notification_threshold = $4 WHERE id = $5 RETURNING *", [name, category_id, quantity, notification_threshold, id]);
        if (result.rows.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows[0]));
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost găsit" }));
        }
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la actualizarea articolului" }));
    }
});
exports.updateItem = updateItem;
const deleteItem = (res, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.default.query("DELETE FROM items WHERE id = $1", [id]);
        if (result.rowCount && result.rowCount > 0) {
            res.writeHead(204, { 'Content-Type': 'application/json' });
            res.end();
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Articolul nu a fost găsit" }));
        }
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Eroare la ștergerea articolului" }));
    }
});
exports.deleteItem = deleteItem;
