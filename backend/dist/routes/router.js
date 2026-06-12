"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const itemsRoute_1 = require("./itemsRoute");
const userRoutes_1 = require("./userRoutes");
const categoriesRoute_1 = require("./categoriesRoute");
const notificationRoutes_1 = require("./notificationRoutes");
const statisticsRoute_1 = require("./statisticsRoute");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const router = (req, res) => {
    // Permite cereri de la orice origine (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    const { url, method } = req;
    // Servește login.html la ruta rădăcină și la /login.html
    if ((url === "/" || url === "/login.html") && method === "GET") {
        const filePath = path.join(__dirname, "..", "..", "..", "frontend", "login.html");
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error("Eroare citire fișier:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Eroare internă a serverului" }));
                return;
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });
        return;
    }
    // Servește dashboard.html
    if ((url === "/dashboard" || url === "/dashboard.html") && method === "GET") {
        const filePath = path.join(__dirname, "..", "..", "..", "frontend", "dashboard.html");
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error("Eroare citire fișier:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Eroare internă a serverului" }));
                return;
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });
        return;
    }
    if (url === null || url === void 0 ? void 0 : url.startsWith("/api/items")) {
        return (0, itemsRoute_1.handleItemsRoutes)(req, res);
    }
    if ((url === null || url === void 0 ? void 0 : url.startsWith("/api/users")) || (url === null || url === void 0 ? void 0 : url.startsWith("/users"))) {
        return (0, userRoutes_1.handleUserRoutes)(req, res);
    }
    if (url === null || url === void 0 ? void 0 : url.startsWith("/api/categories")) {
        return (0, categoriesRoute_1.handleCategoriesRoutes)(req, res);
    }
    if (url === null || url === void 0 ? void 0 : url.startsWith("/api/notifications")) {
        return (0, notificationRoutes_1.handleNotificationRoutes)(req, res);
    }
    if (url === null || url === void 0 ? void 0 : url.startsWith("/api/stats")) {
        return (0, statisticsRoute_1.handleStatisticsRoutes)(req, res);
    }
    // Servește fișiere statice (ex: CSS)
    if (url === null || url === void 0 ? void 0 : url.startsWith("/public/")) {
        const filePath = path.join(__dirname, "..", "..", "..", "frontend", url);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error("Eroare citire fișier static:", err);
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not found");
                return;
            }
            // Setează tipul de conținut pentru CSS
            const ext = path.extname(filePath);
            const contentType = ext === ".css" ? "text/css" : "application/octet-stream";
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        });
        return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta inexistentă" }));
};
exports.router = router;
