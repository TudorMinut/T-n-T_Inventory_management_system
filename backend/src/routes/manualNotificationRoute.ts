import { IncomingMessage, ServerResponse } from 'http';
import { createManualNotification } from '../controllers/manualNotificationController';

export const handleManualNotificationRoute = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/api/manual-notification' && req.method === 'POST') {
        return createManualNotification(req, res);
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Rută negăsită pentru notificare manuală' }));
};
