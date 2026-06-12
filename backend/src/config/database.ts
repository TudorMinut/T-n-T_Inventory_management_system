import { Pool } from "pg";
import { env } from "./env";

const pool = new Pool({
    user: env.database.user,
    host: env.database.host,
    database: env.database.name,
    password: env.database.password,
    port: env.database.port,
});

export default pool;
