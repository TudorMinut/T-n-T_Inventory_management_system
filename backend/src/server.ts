import * as http from "http";
import { router } from "./routes/router";

const server = http.createServer((req, res) => {
    router(req, res);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server pornit pe http://localhost:${PORT}`);
});