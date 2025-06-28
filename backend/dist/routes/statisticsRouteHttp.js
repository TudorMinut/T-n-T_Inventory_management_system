"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStatisticsRoutes = void 0;
const statisticsHtmlController_1 = require("../controllers/statisticsHtmlController");
const statisticsPdfController_1 = require("../controllers/statisticsPdfController");
const handleStatisticsRoutes = async (req, res) => {
    const { url, method } = req;
    if (url === "/api/statistics/html" && method === "GET") {
        return (0, statisticsHtmlController_1.getStatsHtml)(req, res);
    }
    if (url === "/api/statistics/pdf" && method === "GET") {
        return (0, statisticsPdfController_1.getStatsPdf)(req, res);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta negasita pentru statistici" }));
};
exports.handleStatisticsRoutes = handleStatisticsRoutes;
