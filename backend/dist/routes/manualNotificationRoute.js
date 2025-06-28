"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleManualNotificationRoute = void 0;
const manualNotificationController_1 = require("../controllers/manualNotificationController");
const handleManualNotificationRoute = async (req, res) => {
    if (req.url === '/api/manual-notification' && req.method === 'POST') {
        return (0, manualNotificationController_1.createManualNotification)(req, res);
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Ruta negasita pentru notificare manuala' }));
};
exports.handleManualNotificationRoute = handleManualNotificationRoute;
