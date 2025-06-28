import * as http from "http";
import { router } from "./routes/router";
import { checkStockAndNotify } from "./services/notificationService";
import pool from "./config/database";

// Initialize database tables (run once)
const initializeDatabase = async () => {
    try {
        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create categories table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                description TEXT
            );
        `);

        // Create items table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category_id INTEGER REFERENCES categories(id),
                quantity INTEGER NOT NULL DEFAULT 0,
                notification_threshold INTEGER NOT NULL DEFAULT 5,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                custom_notification_enabled BOOLEAN DEFAULT FALSE,
                notification_type VARCHAR(50),
                notification_after_minutes INTEGER,
                notification_interval_minutes INTEGER,
                notification_fixed_date TIMESTAMP WITH TIME ZONE,
                notification_message TEXT
            );
        `);

        // Create notifications table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                notification_type VARCHAR(50) DEFAULT 'stock_low',
                scheduled_time TIMESTAMP WITH TIME ZONE,
                periodic_interval INTEGER,
                next_notification TIMESTAMP WITH TIME ZONE,
                is_active BOOLEAN DEFAULT TRUE
            );
        `);

        // Create admin user if no users exist
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCount.rows[0].count) === 0) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(`
                INSERT INTO users (username, email, password, role) 
                VALUES ('admin', 'admin@example.com', $1, 'admin')
            `, [hashedPassword]);
            console.log('Admin user created: username=admin, password=admin123');
        }

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