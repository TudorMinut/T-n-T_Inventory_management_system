import { IncomingMessage, ServerResponse } from "http";
import { getStatsHtml } from "../controllers/statisticsHtmlController";
import { getStatsPdf } from "../controllers/statisticsPdfController";

export const handleStatisticsRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;

    if (url === "/api/statistics/html" && method === "GET") {
        return getStatsHtml(req, res);
    }

    if (url === "/api/statistics/pdf" && method === "GET") {
        return getStatsPdf(req, res);
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită pentru statistici" }));
};
