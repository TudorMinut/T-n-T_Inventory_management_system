import { IncomingMessage, ServerResponse } from "http";
import { getNotifications, markNotificationAsRead, deleteNotification } from "../controllers/notificationController";

// Gestioneaza rutele pentru notificari
export const handleNotificationRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;

    const readMatch = url?.match(/^\/api\/notifications\/(\d+)\/read$/);
    const deleteMatch = url?.match(/^\/api\/notifications\/(\d+)$/);

    // Verifica daca metoda este GET pentru a prelua notificarile
    if (method === "GET" && url === "/api/notifications") {
        return getNotifications(res);
    }

    // Verifica daca metoda este PUT pentru a marca o notificare ca citita
    if (method === "PUT" && readMatch) {
        const id = parseInt(readMatch[1]);
        return markNotificationAsRead(id, res);
    }

    // Verifica daca metoda este DELETE pentru a sterge o notificare
    if (method === "DELETE" && deleteMatch) {
        const id = parseInt(deleteMatch[1]);
        return deleteNotification(id, res);
    }

    // Daca nicio ruta nu se potriveste
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Ruta negasita" }));
};
