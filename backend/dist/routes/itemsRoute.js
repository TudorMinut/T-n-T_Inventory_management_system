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
exports.handleItemsRoutes = void 0;
const itemController_1 = require("../controllers/itemController");
const handleItemsRoutes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, method } = req;
    const regexResult = url === null || url === void 0 ? void 0 : url.match(/^\/api\/items\/(\d+)$/);
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
});
exports.handleItemsRoutes = handleItemsRoutes;
