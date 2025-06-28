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
const categoriesRoute_1 = require("./categoriesRoute");
const itemsRoute_1 = require("./itemsRoute");
const notificationRoutes_1 = require("./notificationRoutes");
const userRoutes_1 = require("./userRoutes");
const statisticsRouteHttp_1 = require("./statisticsRouteHttp");
const dataRouteHttp_1 = require("./dataRouteHttp");
const manualNotificationRoute_1 = require("./manualNotificationRoute");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function serveStaticFile(filePath, contentType, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error("Eroare citire fișier static:", err);
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not found");
            return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
}
const router = (req, res) => {
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin || '')) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    else if (process.env.NODE_ENV !== 'production') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    const { url, method } = req;
    const frontendPath = process.env.NODE_ENV === 'production'
        ? path.join(__dirname, "..", "frontend")
        : path.join(__dirname, "..", "..", "..", "frontend");
    if ((url === "/" || url === "/login.html") && method === "GET") {
        const filePath = path.join(frontendPath, "login.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }
    if ((url === "/dashboard" || url === "/dashboard.html") && method === "GET") {
        const filePath = path.join(frontendPath, "dashboard.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }
    if (url === "/admin" && method === "GET") {
        const filePath = path.join(frontendPath, "admin.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }
    if ((url === "/statistics" || url === "/statistics.html") && method === "GET") {
        const filePath = path.join(frontendPath, "statistics.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }
    if (url?.startsWith("/api/categories")) {
        return (0, categoriesRoute_1.handleCategoriesRoutes)(req, res);
    }
    if (url?.startsWith("/api/items")) {
        return (0, itemsRoute_1.handleItemsRoutes)(req, res);
    }
    if (url?.startsWith("/api/notifications")) {
        return (0, notificationRoutes_1.handleNotificationRoutes)(req, res);
    }
    if (url?.startsWith("/api/users") || url?.startsWith("/users")) {
        return (0, userRoutes_1.handleUserRoutes)(req, res);
    }
    if (url?.startsWith("/api/statistics")) {
        return (0, statisticsRouteHttp_1.handleStatisticsRoutes)(req, res);
    }
    if (url?.startsWith("/api/data")) {
        return (0, dataRouteHttp_1.handleDataRoutes)(req, res);
    }
    if (url?.startsWith("/api/manual-notification")) {
        return (0, manualNotificationRoute_1.handleManualNotificationRoute)(req, res);
    }
    if (url?.startsWith("/public/")) {
        const relativeUrl = url.substring(1);
        const filePath = path.join(frontendPath, relativeUrl);
        const ext = path.extname(filePath);
        const contentTypes = {
            ".css": "text/css",
            ".js": "application/javascript",
            ".ts": "application/javascript",
            ".html": "text/html",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".gif": "image/gif"
        };
        const contentType = contentTypes[ext] || "application/octet-stream";
        serveStaticFile(filePath, contentType, res);
        return;
    }
    if (url === "/README.md" && method === "GET") {
        const filePath = path.join(__dirname, "..", "..", "..", "README.md");
        serveStaticFile(filePath, "text/plain", res);
        return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta inexistentă" }));
    return;
};
exports.router = router;
