import { IncomingMessage, ServerResponse } from "http";
import { handleCategoriesRoutes } from "./categoriesRoute";
import { handleItemsRoutes } from "./itemsRoute";
import { handleNotificationRoutes } from "./notificationRoutes";
import { handleUserRoutes } from "./userRoutes";
import { handleStatisticsRoutes } from "./statisticsRouteHttp";
import { handleDataRoutes } from "./dataRouteHttp";
import { handleManualNotificationRoute } from "./manualNotificationRoute";
import { handleRssRoute } from "./rssRoute";
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

    // Fix the frontend path resolution for both development and production
    const frontendPath = process.env.NODE_ENV === 'production'
        ? path.join(__dirname, "..", "frontend")  // In production: dist/routes -> dist/frontend
        : path.join(__dirname, "..", "..", "dist", "frontend");  // In development with ts-node: src/routes -> dist/frontend

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

    // Serve RSS feed
    if (url === "/rss.xml" && method === "GET") {
        return handleRssRoute(req, res);
    }

    // Serve static files (CSS, JS, etc.)
    if (url?.startsWith("/public/") || url?.endsWith(".js") || url?.endsWith(".css") || url?.endsWith(".ts")) {
        let filePath: string;
        let contentType: string;

        if (url?.startsWith("/public/")) {
            const relativeUrl = url.substring(1);
            filePath = path.join(frontendPath, relativeUrl);
        } else if (url?.endsWith(".js") && url?.startsWith("/src/dashboard/")) {
            // Handle requests for compiled JS files from dashboard
            filePath = path.join(frontendPath, "public", url.substring(1));
        } else if (url?.endsWith(".js") || url?.endsWith(".css") || url?.endsWith(".ts")) {
            // Handle other JS/CSS/TS requests
            const relativeUrl = url.substring(1);
            // First try in the public folder
            filePath = path.join(frontendPath, "public", relativeUrl);

            // If not found, try in the root frontend folder
            if (!fs.existsSync(filePath)) {
                filePath = path.join(frontendPath, relativeUrl);
            }
        } else {
            // Handle direct JS/CSS requests
            filePath = path.join(frontendPath, "public", url.substring(1));
        }

        // Handle extensionless module requests
        if (!path.extname(filePath)) {
            const jsFilePath = filePath + ".js";
            if (fs.existsSync(jsFilePath)) {
                filePath = jsFilePath;
                contentType = "application/javascript";
            } else {
                // Try looking in the public folder
                const publicJsFilePath = path.join(frontendPath, "public", url.substring(1) + ".js");
                if (fs.existsSync(publicJsFilePath)) {
                    filePath = publicJsFilePath;
                    contentType = "application/javascript";
                } else {
                    // Fallback or error handling if file not found
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("Not found");
                    return;
                }
            }
        } else {
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
            contentType = contentTypes[ext] || "application/octet-stream";
        }

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
    res.end(JSON.stringify({ message: "Ruta inexistenta" }));
    return; // Add this explicit return
};