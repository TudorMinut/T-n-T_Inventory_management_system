import { IncomingMessage, ServerResponse } from "http";
import { handleItemsRoute } from "./itemsRoute";

export const router = (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;

    if (url?.startsWith("/items")) {
        return handleItemsRoute(req, res);
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta inexistentă" }));
};