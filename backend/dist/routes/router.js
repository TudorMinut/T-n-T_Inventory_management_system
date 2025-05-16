"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const itemsRoute_1 = require("./itemsRoute");
const router = (req, res) => {
    const { url, method } = req;
    if (url === null || url === void 0 ? void 0 : url.startsWith("/items")) {
        return (0, itemsRoute_1.handleItemsRoute)(req, res);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta inexistentă" }));
};
exports.router = router;
