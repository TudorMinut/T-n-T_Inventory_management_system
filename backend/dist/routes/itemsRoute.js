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
exports.handleItemsRoute = void 0;
const itemController_1 = require("../controllers/itemController");
const handleItemsRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.method === "GET") {
        return (0, itemController_1.getAllItems)(res);
    }
    if (req.method === "POST") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const data = JSON.parse(body);
            return (0, itemController_1.createItem)(data, res);
        });
    }
});
exports.handleItemsRoute = handleItemsRoute;
