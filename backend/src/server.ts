import * as http from "http";
import { router } from "./routes/router";
import { checkStockAndNotify } from "./services/notificationService";
import { env } from "./config/env";

let stockCheckInterval: NodeJS.Timeout | undefined;

const server = http.createServer((req, res) => {
    router(req, res);
});

server.listen(env.port, () => {
    console.log(`Server pornit pe http://localhost:${env.port}`);
    stockCheckInterval = setInterval(() => {
        console.log("Verificare stocuri pentru notificari...");
        void checkStockAndNotify();
    }, env.stockCheckIntervalMs);
});

const shutdown = () => {
    if (stockCheckInterval) {
        clearInterval(stockCheckInterval);
    }

    server.close(() => {
        process.exit(0);
    });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
