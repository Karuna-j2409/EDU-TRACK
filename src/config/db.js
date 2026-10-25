// One shared MySQL connection pool for the whole application
const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool({
  ...config.db,
  connectionLimit: 10,
  decimalNumbers: true, // return DECIMAL columns (cgpa) as numbers, not strings
});

module.exports = pool;
