import { IncomingMessage, ServerResponse } from "http";
import { getNotifications, markNotificationAsRead, deleteNotification } from "../controllers/notificationController";

// Gestionează rutele pentru notificări
export const handleNotificationRoutes = async (req: IncomingMessage, res: ServerResponse) => {
    const { url, method } = req;

    const readMatch = url?.match(/^\/api\/notifications\/(\d+)\/read$/);
    const deleteMatch = url?.match(/^\/api\/notifications\/(\d+)$/);

    // Verifică dacă metoda este GET pentru a prelua notificările
    if (method === "GET" && url === "/api/notifications") {
        return getNotifications(res);
    }

    // Verifică dacă metoda este PUT pentru a marca o notificare ca citită
    if (method === "PUT" && readMatch) {
        const id = parseInt(readMatch[1]);
        return markNotificationAsRead(id, res);
    }

    // Verifică dacă metoda este DELETE pentru a șterge o notificare
    if (method === "DELETE" && deleteMatch) {
        const id = parseInt(deleteMatch[1]);
        return deleteNotification(id, res);
    }

    // Dacă nicio rută nu se potrivește
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită" }));
};
