import { IncomingMessage, ServerResponse } from "http";
import { registerUser, loginUser } from "../controllers/userController";
import { getRequestBody } from "../utils/requestUtils";
import { sendError } from "../utils/responseUtils";

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

    sendError(res, 404, "Ruta pentru utilizatori nu a fost gasita");
};
