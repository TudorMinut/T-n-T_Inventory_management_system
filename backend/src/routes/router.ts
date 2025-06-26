import { IncomingMessage, ServerResponse } from "http";
import { handleItemsRoutes } from "./itemsRoute";
import { handleUserRoutes } from "./userRoutes";
import { handleCategoriesRoutes } from "./categoriesRoute";
import { handleNotificationRoutes } from "./notificationRoutes";
import { handleStatisticsRoutes } from "./statisticsRoute";
import * as fs from "fs";
import * as path from "path";

export const router = (req: IncomingMessage, res: ServerResponse) => {
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
    if (url?.startsWith("/api/stats")) {
        return handleStatisticsRoutes(req, res);
    }

    // Servește fișiere statice (ex: CSS)
    if (url?.startsWith("/public/")) {
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