import { IncomingMessage, ServerResponse } from "http";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController";
import { sendError } from "../utils/responseUtils";

export const handleCategoriesRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;
    const regexResult = url?.match(/^\/api\/categories\/(\d+)$/);

    if (url === "/api/categories" && method === "GET") {
        return getAllCategories(res);
    }
    if (url === "/api/categories" && method === "POST") {
        return createCategory(req, res);
    }
    if (regexResult && method === "PUT") {
        const id = parseInt(regexResult[1], 10);
        return updateCategory(req, res, id);
    }
    if (regexResult && method === "DELETE") {
        const id = parseInt(regexResult[1], 10);
        return deleteCategory(res, id);
    }

    sendError(res, 404, "Ruta pentru categorii nu a fost gasita");
};
