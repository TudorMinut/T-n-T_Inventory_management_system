import { IncomingMessage, ServerResponse } from "http";
import { registerUser, loginUser, listUsers, promoteUser, deleteUser } from "../controllers/userController";
import { getRequestBody } from "../utils/requestUtils";

export const handleUserRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;

    if ((url === "/api/users/register" || url === "/users/register") && method === "POST") {
        const data = await getRequestBody(req);
        return registerUser(data, res);
    }
    if ((url === "/api/users/login" || url === "/users/login") && method === "POST") {
        const data = await getRequestBody(req);
        return loginUser(data, res);
    }

    // List users (admin only)
    if ((url === "/api/users" || url === "/users") && method === "GET") {
        return listUsers(res);
    }
    // Promote user to admin (admin only)
    if ((url === "/api/users/promote" || url === "/users/promote") && method === "PUT") {
        const data = await getRequestBody(req);
        return promoteUser(data, res);
    }
    // Delete user (admin only)
    const deleteUserMatch = url?.match(/^\/api\/users\/(\d+)$/);
    if (deleteUserMatch && method === "DELETE") {
        const userId = parseInt(deleteUserMatch[1], 10);
        return deleteUser(userId, res);
    }

    // Dacă nicio rută nu se potrivește
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită pentru utilizatori" }));
};
