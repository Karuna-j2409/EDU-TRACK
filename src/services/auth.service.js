// Business logic for admin login
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

async function login(email, password) {
  const [rows] = await pool.query(
    'SELECT admin_id, name, email, password_hash FROM admins WHERE email = ?',
    [email]
  );
  const admin = rows[0];

  // Same message for "no such email" and "wrong password",
  // so attackers can't discover which emails exist.
  const passwordOk = admin && (await bcrypt.compare(password, admin.password_hash));
  if (!passwordOk) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = jwt.sign(
    { sub: admin.admin_id, email: admin.email, role: 'admin' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  return {
    token,
    expiresIn: config.jwt.expiresIn,
    admin: { admin_id: admin.admin_id, name: admin.name, email: admin.email },
  };
}

module.exports = { login };
