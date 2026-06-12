import { IncomingMessage, ServerResponse } from "http";
import { handleItemsRoutes } from "./itemsRoute";
import { handleUserRoutes } from "./userRoutes";
import { handleCategoriesRoutes } from "./categoriesRoute";
import { handleNotificationRoutes } from "./notificationRoutes";
import { handleStatisticsRoutes } from "./statisticsRoute";
import { handleDataRoutes } from "./dataRoutesHttp";
import * as fs from "fs";
import * as path from "path";
import { sendError } from "../utils/responseUtils";

const frontendRoot = path.join(__dirname, "..", "..", "..", "frontend");

const getContentType = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case ".html":
            return "text/html; charset=utf-8";
        case ".css":
            return "text/css; charset=utf-8";
        case ".js":
            return "application/javascript; charset=utf-8";
        case ".json":
            return "application/json; charset=utf-8";
        default:
            return "application/octet-stream";
    }
};

const serveFile = (res: ServerResponse, filePath: string) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error("Eroare citire fisier:", err);
            return sendError(res, 500, "Eroare interna a serverului");
        }

        res.writeHead(200, { "Content-Type": getContentType(filePath) });
        res.end(data);
    });
};

export const router = (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    const { url, method } = req;

    if ((url === "/" || url === "/login.html") && method === "GET") {
        serveFile(res, path.join(frontendRoot, "login.html"));
        return;
    }

    if ((url === "/dashboard" || url === "/dashboard.html") && method === "GET") {
        serveFile(res, path.join(frontendRoot, "dashboard.html"));
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
    if (url?.startsWith("/api/data")) {
        return handleDataRoutes(req, res);
    }

    if (url?.startsWith("/public/")) {
        const requestedPath = path.normalize(url.replace(/^\/+/, ""));
        const filePath = path.join(frontendRoot, requestedPath);
        if (!filePath.startsWith(frontendRoot)) {
            return sendError(res, 403, "Acces interzis");
        }
        serveFile(res, filePath);
        return;
    }

    sendError(res, 404, "Ruta inexistenta");
};
