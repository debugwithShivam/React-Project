import bcrypt from 'bcrypt';
import pool from '../config/DBconfig/database.js';

const createAdmin = async () => {
  try {
    const name = '';
    const phone = '';
    const email = '';
    const password = '';

    const [existing] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = ? OR phone = ?
      LIMIT 1
      `,
      [email, phone]
    );

    if (existing.length > 0) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `
      INSERT INTO users
      (
        name,
        phone,
        email,
        password_hash,
        role,
        is_active
      )
      VALUES (?, ?, ?, ?, 'ADMIN', 1)
      `,
      [
        name,
        phone,
        email,
        passwordHash,
      ]
    );

    console.log('First ADMIN created successfully.');
    console.log('Email:', email);
    console.log('Password:', password);

    process.exit(0);

  } catch (error) {
    console.error('CREATE ADMIN ERROR:', error);
    process.exit(1);
  }
};

createAdmin();