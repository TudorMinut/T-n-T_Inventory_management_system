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
exports.handleUserRoutes = void 0;
const userController_1 = require("../controllers/userController");
const requestUtils_1 = require("../utils/requestUtils");
const handleUserRoutes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, method } = req;
    if ((url === "/api/users/register" || url === "/users/register") && method === "POST") {
        const data = yield (0, requestUtils_1.getRequestBody)(req);
        return (0, userController_1.registerUser)(data, res);
    }
    if ((url === "/api/users/login" || url === "/users/login") && method === "POST") {
        const data = yield (0, requestUtils_1.getRequestBody)(req);
        return (0, userController_1.loginUser)(data, res);
    }
    // List users (admin only)
    if ((url === "/api/users" || url === "/users") && method === "GET") {
        return (0, userController_1.listUsers)(res);
    }
    // Promote user to admin (admin only)
    if ((url === "/api/users/promote" || url === "/users/promote") && method === "PUT") {
        const data = yield (0, requestUtils_1.getRequestBody)(req);
        return (0, userController_1.promoteUser)(data, res);
    }
    // Delete user (admin only)
    const deleteUserMatch = url === null || url === void 0 ? void 0 : url.match(/^\/api\/users\/(\d+)$/);
    if (deleteUserMatch && method === "DELETE") {
        const userId = parseInt(deleteUserMatch[1], 10);
        return (0, userController_1.deleteUser)(userId, res);
    }
    // Dacă nicio rută nu se potrivește
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită pentru utilizatori" }));
});
exports.handleUserRoutes = handleUserRoutes;
