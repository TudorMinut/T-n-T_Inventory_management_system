import { IncomingMessage, ServerResponse } from "http";
import { exportCsv, importCsv } from "../controllers/csvController";
import { exportJson, importJson } from "../controllers/jsonController";
import { exportXml, importXml } from "../controllers/xmlController";

export const handleDataRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;

    // Export routes
    if (url === "/api/data/export/csv" && method === "GET") {
        return exportCsv(req, res);
    }
    if (url === "/api/data/export/json" && method === "GET") {
        return exportJson(req, res);
    }
    if (url === "/api/data/export/xml" && method === "GET") {
        return exportXml(req, res);
    }

    // Import routes
    if (url === "/api/data/import/csv" && method === "POST") {
        return importCsv(req, res);
    }
    if (url === "/api/data/import/json" && method === "POST") {
        return importJson(req, res);
    }
    if (url === "/api/data/import/xml" && method === "POST") {
        return importXml(req, res);
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta negasita pentru import/export" }));
};
