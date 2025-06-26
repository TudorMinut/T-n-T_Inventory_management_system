import { IncomingMessage, ServerResponse } from "http";
import { getStatsHtml, getStatsPdf } from "../controllers/statisticsController";

export const handleStatisticsRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;
    if (url === "/api/stats/html" && method === "GET") {
        return getStatsHtml(req, res);
    }
    if (url === "/api/stats/pdf" && method === "GET") {
        return getStatsPdf(req, res);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta de statistici negăsită" }));
};
