"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
// Aici va fi configurată conexiunea la baza de date PostgreSQL.
const pool = new pg_1.Pool({
    user: 'postgres', // înlocuiți cu utilizatorul dumneavoastră
    host: 'localhost',
    database: 'tnt_db', // înlocuiți cu numele bazei de date
    password: 'admin', // înlocuiți cu parola dumneavoastră
    port: 5432,
});
exports.default = pool;
