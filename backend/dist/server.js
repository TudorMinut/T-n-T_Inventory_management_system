"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const router_1 = require("./routes/router");
const notificationService_1 = require("./services/notificationService");
const database_1 = __importDefault(require("./config/database"));
const initializeDatabase = async () => {
    try {
        await database_1.default.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL
            );
        `);
        await database_1.default.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user'
            );
        `);
        await database_1.default.query(`
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
        await database_1.default.query(`
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
        await database_1.default.query(`
            INSERT INTO categories (name) VALUES ('Necategorizate')
            ON CONFLICT (name) DO NOTHING;
        `);
        console.log('Database initialized successfully');
    }
    catch (error) {
        console.error('Error initializing database:', error);
    }
};
initializeDatabase();
setInterval(() => {
    console.log("Verificare stocuri pentru notificări...");
    (0, notificationService_1.checkStockAndNotify)();
}, 30000);
const server = http.createServer((req, res) => {
    (0, router_1.router)(req, res);
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server pornit pe http://localhost:${PORT}`);
});
