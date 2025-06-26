import { IncomingMessage, ServerResponse } from "http";
import { exportCsv, exportJson, exportXml, importCsv, importJson, importXml } from "../controllers/dataController";
import { getStatsHtml, getStatsPdf } from "../controllers/statisticsController";

export const handleDataRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;

    // Export
    if (url === "/api/data/export/csv" && method === "GET") {
        return exportCsv(req, res);
    }
    if (url === "/api/data/export/json" && method === "GET") {
        return exportJson(req, res);
    }
    if (url === "/api/data/export/xml" && method === "GET") {
        return exportXml(req, res);
    }

    // Import (doar pentru fișiere trimise ca body, nu multipart)
    if (url === "/api/data/import/csv" && method === "POST") {
        return importCsv(req, res);
    }
    if (url === "/api/data/import/json" && method === "POST") {
        return importJson(req, res);
    }
    if (url === "/api/data/import/xml" && method === "POST") {
        return importXml(req, res);
    }

    // Statistici
    if (url === "/api/statistics/html" && method === "GET") {
        return getStatsHtml(req, res);
    }
    if (url === "/api/statistics/pdf" && method === "GET") {
        return getStatsPdf(req, res);
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta de import/export/statistici inexistentă" }));
};
