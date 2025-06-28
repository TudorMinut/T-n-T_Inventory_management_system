"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleItemsRoutes = void 0;
const read_1 = require("../controllers/item/read");
const create_1 = require("../controllers/item/create");
const update_1 = require("../controllers/item/update");
const delete_1 = require("../controllers/item/delete");
const handleItemsRoutes = async (req, res) => {
    const { url, method } = req;
    const regexResult = url?.match(/^\/api\/items\/(\d+)$/);
    if (url === "/api/items" && method === "GET") {
        return (0, read_1.getAllItems)(res);
    }
    else if (url === "/api/items" && method === "POST") {
        return (0, create_1.createItem)(req, res);
    }
    else if (regexResult && method === "PUT") {
        const id = parseInt(regexResult[1]);
        return (0, update_1.updateItem)(req, res, id);
    }
    else if (regexResult && method === "DELETE") {
        const id = parseInt(regexResult[1]);
        return (0, delete_1.deleteItem)(res, id);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta negasita pentru articole" }));
};
exports.handleItemsRoutes = handleItemsRoutes;
