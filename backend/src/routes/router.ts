import { IncomingMessage, ServerResponse } from "http";
import { handleCategoriesRoutes } from "./categoriesRoute";
import { handleItemsRoutes } from "./itemsRoute";
import { handleNotificationRoutes } from "./notificationRoutes";
import { handleUserRoutes } from "./userRoutes";
import { handleStatisticsRoutes } from "./statisticsRouteHttp";
import { handleDataRoutes } from "./dataRouteHttp";
import { handleManualNotificationRoute } from "./manualNotificationRoute";
import * as fs from "fs";
import * as path from "path";

function serveStaticFile(filePath: string, contentType: string, res: ServerResponse) {
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

export const router = (req: IncomingMessage, res: ServerResponse) => {
    // CORS and security headers
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin || '')) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else if (process.env.NODE_ENV !== 'production') {
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

    // Fix the frontend path resolution for Render deployment
    const frontendPath = process.env.NODE_ENV === 'production'
        ? path.join(__dirname, "..", "frontend")  // Correct path: Go up from 'routes' to 'dist', then find 'frontend'
        : path.join(__dirname, "..", "..", "..", "frontend");

    // Serve login.html
    if ((url === "/" || url === "/login.html") && method === "GET") {
        const filePath = path.join(frontendPath, "login.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }

    // Serve dashboard.html
    if ((url === "/dashboard" || url === "/dashboard.html") && method === "GET") {
        const filePath = path.join(frontendPath, "dashboard.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }

    // Serve admin.html
    if (url === "/admin" && method === "GET") {
        const filePath = path.join(frontendPath, "admin.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }

    // Serve statistics.html
    if ((url === "/statistics" || url === "/statistics.html") && method === "GET") {
        const filePath = path.join(frontendPath, "statistics.html");
        serveStaticFile(filePath, "text/html", res);
        return;
    }

    // API Routes
    if (url?.startsWith("/api/categories")) {
        return handleCategoriesRoutes(req, res);
    }
    if (url?.startsWith("/api/items")) {
        return handleItemsRoutes(req, res);
    }
    if (url?.startsWith("/api/notifications")) {
        return handleNotificationRoutes(req, res);
    }
    if (url?.startsWith("/api/users") || url?.startsWith("/users")) {
        return handleUserRoutes(req, res);
    }
    if (url?.startsWith("/api/statistics")) {
        return handleStatisticsRoutes(req, res);
    }
    if (url?.startsWith("/api/data")) {
        return handleDataRoutes(req, res);
    }
    if (url?.startsWith("/api/manual-notification")) {
        return handleManualNotificationRoute(req, res);
    }

    // Serve static files (CSS, JS, etc.)
    if (url?.startsWith("/public/")) {
        // Remove the leading slash from the URL to make it a relative path
        const relativeUrl = url.substring(1);
        const filePath = path.join(frontendPath, relativeUrl);
        const ext = path.extname(filePath);
        const contentTypes: { [key: string]: string } = {
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

    // Serve README.md
    if (url === "/README.md" && method === "GET") {
        const filePath = path.join(__dirname, "..", "..", "..", "README.md");
        serveStaticFile(filePath, "text/plain", res);
        return;
    }

    // 404 - Not found (this handles all unmatched routes)
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta inexistentă" }));
    return; // Add this explicit return
};