"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleItemsRoutes = void 0;
const itemController_1 = require("../controllers/itemController");
const handleItemsRoutes = async (req, res) => {
    const { url, method } = req;
    const regexResult = url?.match(/^\/api\/items\/(\d+)$/);
    if (url === "/api/items" && method === "GET") {
        return (0, itemController_1.getAllItems)(res);
    }
    else if (url === "/api/items" && method === "POST") {
        return (0, itemController_1.createItem)(req, res);
    }
    else if (regexResult && method === "PUT") {
        const id = parseInt(regexResult[1]);
        return (0, itemController_1.updateItem)(req, res, id);
    }
    else if (regexResult && method === "DELETE") {
        const id = parseInt(regexResult[1]);
        return (0, itemController_1.deleteItem)(res, id);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită pentru articole" }));
};
exports.handleItemsRoutes = handleItemsRoutes;
