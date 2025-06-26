import { IncomingMessage, ServerResponse } from "http";
import { handleItemsRoute } from "./itemsRoute";
import { handleUserRoutes } from "./userRoutes";
import { handleCategoriesRoute } from "./categoriesRoute"; // Importă rutele pentru categorii
import * as fs from "fs";

export const router = (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;

    if (url?.startsWith("/items")) {
        return handleItemsRoute(req, res);
    }

    if (url?.startsWith("/users")) {
        return handleUserRoutes(req, res);
    }

    if (url?.startsWith("/categories")) { // Adaugă condiția pentru rutele de categorii
        return handleCategoriesRoute(req, res);
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta inexistentă" }));
};