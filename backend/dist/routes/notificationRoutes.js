"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNotificationRoutes = void 0;
const notificationController_1 = require("../controllers/notificationController");
// Gestionează rutele pentru notificări
const handleNotificationRoutes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, method } = req;
    const readMatch = url === null || url === void 0 ? void 0 : url.match(/^\/api\/notifications\/(\d+)\/read$/);
    const deleteMatch = url === null || url === void 0 ? void 0 : url.match(/^\/api\/notifications\/(\d+)$/);
    // Verifică dacă metoda este GET pentru a prelua notificările
    if (method === "GET" && url === "/api/notifications") {
        return (0, notificationController_1.getNotifications)(res);
    }
    // Verifică dacă metoda este PUT pentru a marca o notificare ca citită
    if (method === "PUT" && readMatch) {
        const id = parseInt(readMatch[1]);
        return (0, notificationController_1.markNotificationAsRead)(id, res);
    }
    // Verifică dacă metoda este DELETE pentru a șterge o notificare
    if (method === "DELETE" && deleteMatch) {
        const id = parseInt(deleteMatch[1]);
        return (0, notificationController_1.deleteNotification)(id, res);
    }
    // Dacă nicio rută nu se potrivește
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită" }));
});
exports.handleNotificationRoutes = handleNotificationRoutes;
