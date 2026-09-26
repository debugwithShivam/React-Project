import bcrypt from 'bcrypt';
import pool from '../config/DBconfig/database.js';

const createAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME;
    const phone = process.env.ADMIN_PHONE;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !phone || !email || !password) {
      throw new Error(
        'Missing ADMIN_NAME, ADMIN_PHONE, ADMIN_EMAIL or ADMIN_PASSWORD in environment variables.'
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

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
      await pool.query(
        `
        UPDATE users
        SET
          name = ?,
          phone = ?,
          email = ?,
          password_hash = ?,
          role = 'ADMIN',
          is_active = 1
        WHERE id = ?
        `,
        [name, phone, email, passwordHash, existing[0].id]
      );

      console.log('Admin account updated successfully.');
      console.log('Email:', email);
      process.exit(0);
    }

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

    process.exit(0);

  } catch (error) {
    console.error('CREATE ADMIN ERROR:', error);
    process.exit(1);
  }
};

createAdmin();