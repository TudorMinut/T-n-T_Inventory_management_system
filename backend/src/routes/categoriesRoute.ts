import { IncomingMessage, ServerResponse } from "http";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController";

export const handleCategoriesRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;
    const regexResult = url?.match(/^\/api\/categories\/(\d+)$/);

    if (url === "/api/categories" && method === "GET") {
        return getAllCategories(res);
    } else if (url === "/api/categories" && method === "POST") {
        return createCategory(req, res);
    } else if (regexResult && method === "PUT") {
        const id = parseInt(regexResult[1]);
        return updateCategory(req, res, id);
    } else if (regexResult && method === "DELETE") {
        const id = parseInt(regexResult[1]);
        return deleteCategory(res, id);
    }

    // Dacă nicio rută nu se potrivește
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită pentru categorii" }));
};
