const cron = require('node-cron');
const { pool } = require('../db');

async function checkUrl(url) {
  try {
    const res = await fetch(url.target_url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    });
    return res.status < 400 ? 'up' : 'down';
  } catch {
    return 'down';
  }
}

async function runHealthChecks() {
  console.log('Running health checks...');
  try {
    const result = await pool.query('SELECT id, slug, target_url FROM urls');
    for (const url of result.rows) {
      const status = await checkUrl(url);
      const health = status === 'up' ? 'alive' : 'down';

      await pool.query(
        'UPDATE urls SET health = $1, last_check = NOW() WHERE id = $2',
        [health, url.id]
      );
      await pool.query(
        'INSERT INTO uptime_checks (url_id, status) VALUES ($1, $2)',
        [url.id, status]
      );
    }
    console.log(`Health checks done for ${result.rows.length} URLs`);
  } catch (err) {
    console.error('Health check error:', err);
  }
}

function scheduleHealthChecks() {
  // Run once at startup after a short delay
  setTimeout(runHealthChecks, 30000);
  // Then daily at 03:00 UTC
  cron.schedule('0 3 * * *', runHealthChecks);
}

module.exports = { scheduleHealthChecks };
