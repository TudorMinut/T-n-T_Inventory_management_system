import { IncomingMessage, ServerResponse } from "http";
import { handleItemsRoutes } from "./itemsRoute";
import { handleUserRoutes } from "./userRoutes";
import { handleCategoriesRoutes } from "./categoriesRoute";
import { handleNotificationRoutes } from "./notificationRoutes";
import { handleDataRoutes } from "./dataRouteHttp";
import { handleStatisticsRoutes } from "./statisticsRouteHttp";
import * as fs from "fs";
import * as path from "path";

const serveStaticFile = (filePath: string, contentType: string, res: ServerResponse) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error("Eroare citire fișier:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Eroare internă a serverului" }));
            return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
};

export const router = (req: IncomingMessage, res: ServerResponse) => {
    // CORS configurabil pentru siguranță
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com'] // Înlocuiește cu domeniul tău în producție
        : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin || '')) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else if (process.env.NODE_ENV !== 'production') {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Doar pentru dezvoltare
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Content-Type-Options', 'nosniff'); // Previne MIME type sniffing
    res.setHeader('X-Frame-Options', 'DENY'); // Previne clickjacking
    res.setHeader('X-XSS-Protection', '1; mode=block'); // Activează XSS protection

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const { url, method } = req;

    // Servește login.html
    if ((url === "/" || url === "/login.html") && method === "GET") {
        const filePath = path.join(__dirname, "..", "..", "..", "frontend", "login.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }

    // Servește dashboard.html
    if ((url === "/dashboard" || url === "/dashboard.html") && method === "GET") {
        const filePath = path.join(__dirname, "..", "..", "..", "frontend", "dashboard.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }

    // Servește admin.html
    if (url === "/admin" && method === "GET") {
        const filePath = path.join(__dirname, "..", "..", "..", "frontend", "admin.html");
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Eroare internă a serverului" }));
                return;
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });
        return;
    }

    if (url?.startsWith("/api/items")) {
        return handleItemsRoutes(req, res);
    }
    if (url?.startsWith("/api/users") || url?.startsWith("/users")) {
        return handleUserRoutes(req, res);
    }
    if (url?.startsWith("/api/categories")) {
        return handleCategoriesRoutes(req, res);
    }
    if (url?.startsWith("/api/notifications")) {
        return handleNotificationRoutes(req, res);
    }
    if (url?.startsWith("/api/data")) {
        return handleDataRoutes(req, res);
    }
    if (url?.startsWith("/api/statistics")) {
        return handleStatisticsRoutes(req, res);
    }
    // Servește statistics.html
    if ((url === "/statistics" || url === "/statistics.html") && method === "GET") {
        const filePath = path.join(__dirname, "..", "..", "..", "frontend", "statistics.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }

    // Servește documentation.html
    if ((url === "/documentation" || url === "/documentation.html") && method === "GET") {
        const filePath = path.join(__dirname, "..", "..", "..", "frontend", "documentation.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }

    // Servește fișiere statice (ex: CSS, JS, TS)
    if (url?.startsWith("/public/")) {
        const filePath = path.join(__dirname, "..", "..", "..", "frontend", url);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error("Eroare citire fișier static:", err);
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not found");
                return;
            }
            // Setează tipul de conținut pentru CSS, JS și TS
            const ext = path.extname(filePath);
            const contentTypes: { [key: string]: string } = {
                ".css": "text/css",
                ".js": "application/javascript",
                ".ts": "application/javascript" // TypeScript servit ca JavaScript pentru browser
            };
            const contentType = contentTypes[ext] || "application/octet-stream";
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        });
        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta inexistentă" }));
};