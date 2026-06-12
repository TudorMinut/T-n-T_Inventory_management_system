const parseInteger = (value: string | undefined, fallback: number): number => {
    if (!value) {
        return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
    port: parseInteger(process.env.PORT, 3000),
    stockCheckIntervalMs: parseInteger(process.env.STOCK_CHECK_INTERVAL_MS, 30_000),
    database: {
        user: process.env.DB_USER ?? "postgres",
        host: process.env.DB_HOST ?? "localhost",
        name: process.env.DB_NAME ?? "tnt_db",
        password: process.env.DB_PASSWORD ?? "",
        port: parseInteger(process.env.DB_PORT, 5432),
    },
    email: {
        host: process.env.SMTP_HOST ?? "",
        port: parseInteger(process.env.SMTP_PORT, 587),
        user: process.env.SMTP_USER ?? "",
        password: process.env.SMTP_PASSWORD ?? "",
        from: process.env.SMTP_FROM ?? "no-reply@example.com",
    },
};
