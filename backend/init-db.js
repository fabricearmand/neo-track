const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
    let connection;

    try {
        // Connect to MySQL
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        // Create database
        await connection.query('CREATE DATABASE IF NOT EXISTS neotrack_db');
        await connection.query('USE neotrack_db');

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create qr_codes table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS qr_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                qr_code_id VARCHAR(255) UNIQUE NOT NULL,
                user_id INT NOT NULL,
                item_name VARCHAR(255) NOT NULL,
                item_description TEXT,
                reward_amount DECIMAL(10,2) DEFAULT 0,
                qr_type VARCHAR(50) DEFAULT 'basic',
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create owner_info table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS owner_info (
                id INT AUTO_INCREMENT PRIMARY KEY,
                qr_code_id INT NOT NULL,
                owner_name VARCHAR(255) NOT NULL,
                owner_email VARCHAR(255),
                owner_phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE
            )
        `);

        // Create emergency_contacts table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS emergency_contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                qr_code_id INT NOT NULL,
                contact_name VARCHAR(255),
                contact_email VARCHAR(255),
                contact_phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE
            )
        `);

        // Create notifications table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                qr_code_id INT,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE
            )
        `);

        // Create qr_scans table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS qr_scans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                qr_code_id INT NOT NULL,
                scanner_ip VARCHAR(45),
                scanner_location VARCHAR(255),
                scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE
            )
        `);

        // Create test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        await connection.execute(
            'INSERT IGNORE INTO users (name, email, password) VALUES (?, ?, ?)',
            ['Test User', 'test@example.com', hashedPassword]
        );

        console.log('✅ Database initialized successfully!');
        console.log('📧 Test user created: test@example.com / password123');

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeDatabase();
