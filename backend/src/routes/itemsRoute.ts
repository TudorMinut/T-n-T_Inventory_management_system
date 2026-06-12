import { IncomingMessage, ServerResponse } from "http";
import { getAllItems, createItem, updateItem, deleteItem } from "../controllers/itemController";
import { sendError } from "../utils/responseUtils";

export const handleItemsRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;
    const regexResult = url?.match(/^\/api\/items\/(\d+)$/);

    if (url === "/api/items" && method === "GET") {
        return getAllItems(res);
    }
    if (url === "/api/items" && method === "POST") {
        return createItem(req, res);
    }
    if (regexResult && method === "PUT") {
        const id = parseInt(regexResult[1], 10);
        return updateItem(req, res, id);
    }
    if (regexResult && method === "DELETE") {
        const id = parseInt(regexResult[1], 10);
        return deleteItem(res, id);
    }

    sendError(res, 404, "Ruta pentru articole nu a fost gasita");
};
