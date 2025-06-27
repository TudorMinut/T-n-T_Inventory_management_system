import * as http from "http";
import { router } from "./routes/router";
import { checkStockAndNotify } from "./services/notificationService";

// Rulează serviciul de notificare la fiecare 30 de secunde
setInterval(() => {
    console.log("Verificare stocuri pentru notificări...");
    checkStockAndNotify();
}, 30000); // 30000 ms = 30 secunde

const server = http.createServer((req, res) => {
    router(req, res);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server pornit pe http://localhost:${PORT}`);
});