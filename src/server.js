// Entry point: checks the database, starts the HTTP server, shuts down cleanly
const app = require('./app');
const config = require('./config/env');
const pool = require('./config/db');

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log(`Connected to MySQL database "${config.db.database}"`);
  } catch (err) {
    console.error('Could not connect to MySQL:', err.message || err.code);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`EduTrack API running at http://localhost:${config.port} (${config.nodeEnv})`);
  });

  // Graceful shutdown: finish in-flight requests, then close DB connections
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
