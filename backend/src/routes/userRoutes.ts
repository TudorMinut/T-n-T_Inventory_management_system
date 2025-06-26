import { IncomingMessage, ServerResponse } from "http";
import { registerUser, loginUser } from "../controllers/userController";

export const handleUserRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Cerere invalidă" }));
        return;
    }
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/register" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const data = JSON.parse(body);
            return registerUser(data, res);
        });
    } else if (url.pathname === "/login" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            const data = JSON.parse(body);
            return loginUser(data, res);
        });
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Ruta nu a fost găsită" }));
    }
};
