// Creates the database (if missing) and loads database/schema.sql + database/seed.sql.
// Usage:  npm run db:setup          (uses .env)
//         NODE_ENV=test npm run db:setup   (uses .env.test)
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../src/config/env');

async function setupDatabase() {
  const { host, port, user, password, database } = config.db;
  const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.query(`USE \`${database}\``);

    for (const file of ['schema.sql', 'seed.sql']) {
      const sql = fs.readFileSync(path.join(__dirname, '..', 'database', file), 'utf8');
      await connection.query(sql);
    }
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  setupDatabase()
    .then(() => console.log(`Database "${config.db.database}" is ready (schema + seed loaded)`))
    .catch((err) => {
      console.error('Database setup failed:', err.message || err.code);
      process.exit(1);
    });
}

module.exports = setupDatabase;
