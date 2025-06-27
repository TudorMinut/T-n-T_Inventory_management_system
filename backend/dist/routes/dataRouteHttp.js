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
exports.handleDataRoutes = void 0;
const csvController_1 = require("../controllers/csvController");
const jsonController_1 = require("../controllers/jsonController");
const xmlController_1 = require("../controllers/xmlController");
const handleDataRoutes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, method } = req;
    // Export routes
    if (url === "/api/data/export/csv" && method === "GET") {
        return (0, csvController_1.exportCsv)(req, res);
    }
    if (url === "/api/data/export/json" && method === "GET") {
        return (0, jsonController_1.exportJson)(req, res);
    }
    if (url === "/api/data/export/xml" && method === "GET") {
        return (0, xmlController_1.exportXml)(req, res);
    }
    // Import routes
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
});
exports.handleDataRoutes = handleDataRoutes;
