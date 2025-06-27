import { Pool } from 'pg';

// Aici va fi configurată conexiunea la baza de date PostgreSQL.

const pool = new Pool({
    user: 'postgres', // înlocuiți cu utilizatorul dumneavoastră
    host: 'localhost',
    database: 'tnt_db', // înlocuiți cu numele bazei de date
    password: 'admin', // înlocuiți cu parola dumneavoastră
    port: 5432,
});

export default pool;
