import * as http from "http";
import { router } from "./routes/router";
import { checkStockAndNotify } from "./services/notificationService";
import pool from "./config/database";

// Initialize database tables (run once)
const initializeDatabase = async () => {
    try {
        // Create tables if they don't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user'
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category_id INTEGER REFERENCES categories(id),
                quantity INTEGER DEFAULT 0,
                notification_threshold INTEGER DEFAULT 5,
                custom_notification_enabled BOOLEAN DEFAULT FALSE,
                notification_type VARCHAR(20),
                notification_after_minutes INTEGER,
                notification_interval_minutes INTEGER,
                notification_fixed_date TIMESTAMP,
                notification_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                item_id INTEGER REFERENCES items(id),
                message TEXT NOT NULL,
                notification_type VARCHAR(20) DEFAULT 'stock_low',
                scheduled_time TIMESTAMP,
                periodic_interval INTEGER,
                next_notification TIMESTAMP,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert default "Necategorizate" category if it doesn't exist
        await pool.query(`
            INSERT INTO categories (name) VALUES ('Necategorizate')
            ON CONFLICT (name) DO NOTHING;
        `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

// Initialize database on startup
initializeDatabase();

// Rulează serviciul de notificare la fiecare 30 de secunde
setInterval(() => {
    console.log("Verificare stocuri pentru notificări...");
    checkStockAndNotify();
}, 30000); // 30000 ms = 30 secunde

const server = http.createServer((req, res) => {
    router(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server pornit pe http://localhost:${PORT}`);
});