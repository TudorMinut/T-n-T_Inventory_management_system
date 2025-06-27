"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDataRoutes = void 0;
const csvController_1 = require("../controllers/csvController");
const jsonController_1 = require("../controllers/jsonController");
const xmlController_1 = require("../controllers/xmlController");
const handleDataRoutes = async (req, res) => {
    const { url, method } = req;
    if (url === "/api/data/export/csv" && method === "GET") {
        return (0, csvController_1.exportCsv)(req, res);
    }
    if (url === "/api/data/export/json" && method === "GET") {
        return (0, jsonController_1.exportJson)(req, res);
    }
    if (url === "/api/data/export/xml" && method === "GET") {
        return (0, xmlController_1.exportXml)(req, res);
    }
    if (url === "/api/data/import/csv" && method === "POST") {
        return (0, csvController_1.importCsv)(req, res);
    }
    if (url === "/api/data/import/json" && method === "POST") {
        return (0, jsonController_1.importJson)(req, res);
    }
    if (url === "/api/data/import/xml" && method === "POST") {
        return (0, xmlController_1.importXml)(req, res);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită pentru import/export" }));
};
exports.handleDataRoutes = handleDataRoutes;
