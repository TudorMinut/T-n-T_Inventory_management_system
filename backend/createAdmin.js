const pool = require('./src/config/database.ts').default;
const bcrypt = require('bcrypt');

async function createAdminUser() {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);

        const result = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
            ['admin', 'admin@example.com', hashedPassword, 'admin']
        );

        console.log('Admin user created successfully:', result.rows[0]);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
