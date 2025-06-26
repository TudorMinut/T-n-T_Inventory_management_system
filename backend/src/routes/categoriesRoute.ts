import { IncomingMessage, ServerResponse } from "http";
import { getAllCategories, createCategory } from "../controllers/categoryController";

export const handleCategoriesRoute = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "GET") {
        return getAllCategories(res);
    }

    if (req.method === "POST") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const data = JSON.parse(body);
            return createCategory(data, res);
        });
    }
};
