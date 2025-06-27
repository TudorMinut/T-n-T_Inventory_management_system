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
exports.getStatsHtml = void 0;
const database_1 = __importDefault(require("../config/database"));
const securityUtils_1 = require("../utils/securityUtils");
const getStatsHtml = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalItems = yield database_1.default.query('SELECT COUNT(*) as count FROM items');
        const totalCategories = yield database_1.default.query('SELECT COUNT(*) as count FROM categories');
        const itemsPerCategory = yield database_1.default.query('SELECT c.name, COUNT(i.id) as count FROM categories c LEFT JOIN items i ON c.id = i.category_id GROUP BY c.name');
        let html = `<h1>Statistici Stoc</h1>`;
        html += `<p>Numar total de articole: ${totalItems.rows[0].count}</p>`;
        html += `<p>Numar total de categorii: ${totalCategories.rows[0].count}</p>`;
        html += `<h2>Articole pe categorie:</h2>`;
        html += '<ul>';
        itemsPerCategory.rows.forEach(row => {
            html += `<li>${(0, securityUtils_1.sanitizeHtml)(row.name)}: ${(0, securityUtils_1.sanitizeHtml)(row.count.toString())}</li>`;
        });
        html += '</ul>';
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    }
    catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Eroare la generarea statisticilor HTML.');
    }
});
exports.getStatsHtml = getStatsHtml;
