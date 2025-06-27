"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUserRoutes = void 0;
const userController_1 = require("../controllers/userController");
const requestUtils_1 = require("../utils/requestUtils");
const handleUserRoutes = async (req, res) => {
    const { url, method } = req;
    if ((url === "/api/users/register" || url === "/users/register") && method === "POST") {
        const data = await (0, requestUtils_1.getRequestBody)(req);
        return (0, userController_1.registerUser)(data, res);
    }
    if ((url === "/api/users/login" || url === "/users/login") && method === "POST") {
        const data = await (0, requestUtils_1.getRequestBody)(req);
        return (0, userController_1.loginUser)(data, res);
    }
    if ((url === "/api/users" || url === "/users") && method === "GET") {
        return (0, userController_1.listUsers)(res);
    }
    if ((url === "/api/users/promote" || url === "/users/promote") && method === "PUT") {
        const data = await (0, requestUtils_1.getRequestBody)(req);
        return (0, userController_1.promoteUser)(data, res);
    }
    const deleteUserMatch = url?.match(/^\/api\/users\/(\d+)$/);
    if (deleteUserMatch && method === "DELETE") {
        const userId = parseInt(deleteUserMatch[1], 10);
        return (0, userController_1.deleteUser)(userId, res);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită pentru utilizatori" }));
};
exports.handleUserRoutes = handleUserRoutes;
