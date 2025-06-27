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
exports.handleCategoriesRoutes = void 0;
const categoryController_1 = require("../controllers/categoryController");
const handleCategoriesRoutes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, method } = req;
    const regexResult = url === null || url === void 0 ? void 0 : url.match(/^\/api\/categories\/(\d+)$/);
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
    // Dacă nicio rută nu se potrivește
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită pentru categorii" }));
});
exports.handleCategoriesRoutes = handleCategoriesRoutes;
