"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCategoriesRoutes = void 0;
const categoryController_1 = require("../controllers/categoryController");
const handleCategoriesRoutes = async (req, res) => {
    const { url, method } = req;
    const regexResult = url?.match(/^\/api\/categories\/(\d+)$/);
    if (url === "/api/categories" && method === "GET") {
        return (0, categoryController_1.getAllCategories)(res);
    }
    else if (url === "/api/categories" && method === "POST") {
        return (0, categoryController_1.createCategory)(req, res);
    }
    else if (regexResult && method === "PUT") {
        const id = parseInt(regexResult[1]);
        return (0, categoryController_1.updateCategory)(req, res, id);
    }
    else if (regexResult && method === "DELETE") {
        const id = parseInt(regexResult[1]);
        return (0, categoryController_1.deleteCategory)(res, id);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită pentru categorii" }));
};
exports.handleCategoriesRoutes = handleCategoriesRoutes;
