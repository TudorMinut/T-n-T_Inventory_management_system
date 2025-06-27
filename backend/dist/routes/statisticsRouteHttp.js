"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStatisticsRoutes = void 0;
const statisticsHtmlController_1 = require("../controllers/statisticsHtmlController");
const statisticsPdfController_1 = require("../controllers/statisticsPdfController");
const handleStatisticsRoutes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, method } = req;
    if (url === "/api/statistics/html" && method === "GET") {
        return (0, statisticsHtmlController_1.getStatsHtml)(req, res);
    }
    if (url === "/api/statistics/pdf" && method === "GET") {
        return (0, statisticsPdfController_1.getStatsPdf)(req, res);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită pentru statistici" }));
});
exports.handleStatisticsRoutes = handleStatisticsRoutes;
