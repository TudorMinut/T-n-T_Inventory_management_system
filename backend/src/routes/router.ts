import { IncomingMessage, ServerResponse } from "http";
import { handleItemsRoute } from "./itemsRoute";
import { handleUserRoutes } from "./userRoutes"; // Importă rutele pentru utilizatori
import * as fs from "fs";
import * as path from "path";

export const router = (req: IncomingMessage, res: ServerResponse) => {
    // Permite cereri de la orice origine (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (!req.url) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "URL invalid" }));
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/") {
        const filePath = path.join(__dirname, "..", "..", "index.html");
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

    if (url.pathname.startsWith("/items")) {
        return handleItemsRoute(req, res);
    }

    if (url.pathname.startsWith("/users")) { // Adaugă condiția pentru rutele de utilizatori
        return handleUserRoutes(req, res);
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta nu a fost găsită" }));
};