"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNotificationRoutes = void 0;
const notificationController_1 = require("../controllers/notificationController");
const handleNotificationRoutes = async (req, res) => {
    const { url, method } = req;
    const readMatch = url?.match(/^\/api\/notifications\/(\d+)\/read$/);
    const deleteMatch = url?.match(/^\/api\/notifications\/(\d+)$/);
    if (method === "GET" && url === "/api/notifications") {
        return (0, notificationController_1.getNotifications)(res);
    }
    if (method === "PUT" && readMatch) {
        const id = parseInt(readMatch[1]);
        return (0, notificationController_1.markNotificationAsRead)(id, res);
    }
    if (method === "DELETE" && deleteMatch) {
        const id = parseInt(deleteMatch[1]);
        return (0, notificationController_1.deleteNotification)(id, res);
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Rută negăsită" }));
};
exports.handleNotificationRoutes = handleNotificationRoutes;
