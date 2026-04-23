const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// SVG map coordinates per country code (for the world map visualization)
const GEO_COORDS = {
  US: { x: 200, y: 170 }, CA: { x: 210, y: 120 }, MX: { x: 220, y: 220 },
  BR: { x: 310, y: 310 }, AR: { x: 290, y: 360 }, CO: { x: 265, y: 270 },
  GB: { x: 465, y: 135 }, DE: { x: 495, y: 150 }, FR: { x: 478, y: 160 },
  IT: { x: 500, y: 170 }, ES: { x: 460, y: 168 }, NL: { x: 483, y: 143 },
  SE: { x: 502, y: 118 }, NO: { x: 492, y: 110 }, PL: { x: 515, y: 145 },
  RU: { x: 620, y: 130 }, UA: { x: 540, y: 148 }, TR: { x: 555, y: 168 },
  IN: { x: 700, y: 210 }, CN: { x: 760, y: 175 }, JP: { x: 820, y: 175 },
  KR: { x: 800, y: 178 }, AU: { x: 850, y: 340 }, NZ: { x: 895, y: 370 },
  ZA: { x: 525, y: 330 }, NG: { x: 490, y: 260 }, EG: { x: 543, y: 195 },
  KE: { x: 548, y: 280 }, SG: { x: 775, y: 265 }, ID: { x: 790, y: 280 },
  PH: { x: 810, y: 250 }, TH: { x: 765, y: 240 }, VN: { x: 780, y: 245 },
  PK: { x: 685, y: 195 }, BD: { x: 720, y: 215 }, SA: { x: 580, y: 205 },
  AE: { x: 605, y: 205 }, IL: { x: 553, y: 185 }, IR: { x: 615, y: 188 },
  CL: { x: 275, y: 355 }, PE: { x: 270, y: 310 }, VE: { x: 290, y: 265 },
};

router.get('/:slug', requireAuth, async (req, res) => {
  const { slug } = req.params;

  try {
    // Verify ownership
    const urlResult = await pool.query(
      'SELECT id, slug, target_url, created_at, health, last_check FROM urls WHERE slug = $1 AND user_id = $2',
      [slug, req.user.id]
    );
    if (!urlResult.rows.length) return res.status(404).json({ error: 'URL not found' });
    const url = urlResult.rows[0];

    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Total clicks
    const [totalResult, geoResult, browserResult, deviceResult, referrerResult, seriesResult, uptimeResult] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total, COUNT(DISTINCT ip_hash)::int AS unique_visitors FROM clicks WHERE url_id = $1', [url.id]),
      pool.query(
        `SELECT country_code AS code, MAX(country_name) AS name, COUNT(*)::int AS count
         FROM clicks WHERE url_id = $1 AND country_code IS NOT NULL
         GROUP BY country_code ORDER BY count DESC LIMIT 20`,
        [url.id]
      ),
      pool.query(
        `SELECT browser AS name, COUNT(*)::int AS value
         FROM clicks WHERE url_id = $1 AND browser IS NOT NULL
         GROUP BY browser ORDER BY value DESC`,
        [url.id]
      ),
      pool.query(
        `SELECT device AS name, COUNT(*)::int AS value
         FROM clicks WHERE url_id = $1 AND device IS NOT NULL
         GROUP BY device ORDER BY value DESC`,
        [url.id]
      ),
      pool.query(
        `SELECT COALESCE(referrer, 'direct') AS name, COUNT(*)::int AS value
         FROM clicks WHERE url_id = $1
         GROUP BY referrer ORDER BY value DESC LIMIT 10`,
        [url.id]
      ),
      // Daily clicks for last 30 days
      pool.query(
        `SELECT DATE(clicked_at) AS day, COUNT(*)::int AS count
         FROM clicks WHERE url_id = $1 AND clicked_at >= $2
         GROUP BY day ORDER BY day`,
        [url.id, thirtyDaysAgo]
      ),
      // Uptime checks last 30 days
      pool.query(
        `SELECT DATE(checked_at) AS day, status
         FROM uptime_checks WHERE url_id = $1 AND checked_at >= $2
         ORDER BY day`,
        [url.id, thirtyDaysAgo]
      ),
    ]);

    // Build 30-day series (fill gaps with 0)
    const clicksByDay = {};
    for (const row of seriesResult.rows) clicksByDay[row.day.toISOString().slice(0, 10)] = row.count;
    const series = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      series.push(clicksByDay[d] || 0);
    }

    // Build 30-day uptime (1 = up, 0 = down, 0.5 = partial)
    const uptimeByDay = {};
    for (const row of uptimeResult.rows) {
      const d = row.day.toISOString().slice(0, 10);
      uptimeByDay[d] = row.status === 'up' ? 1 : row.status === 'partial' ? 0.5 : 0;
    }
    const uptime = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      uptime.push(uptimeByDay[d] !== undefined ? uptimeByDay[d] : 1);
    }

    // Add geo coordinates
    const geo = geoResult.rows.map(g => ({
      ...g,
      ...(GEO_COORDS[g.code] || { x: 500, y: 220 }),
    }));

    // Calculate percentages for browsers/devices/referrers
    const totalClicks = totalResult.rows[0].total;
    const toPercent = (rows) => {
      const total = rows.reduce((sum, r) => sum + r.value, 0) || 1;
      return rows.map(r => ({ ...r, value: Math.round((r.value / total) * 100) }));
    };

    res.json({
      slug: url.slug,
      target: url.target_url,
      clicks: totalClicks,
      uniqueVisitors: totalResult.rows[0].unique_visitors,
      createdAt: url.created_at,
      health: url.health,
      lastCheck: url.last_check,
      series,
      geo,
      browsers: toPercent(browserResult.rows),
      devices: toPercent(deviceResult.rows),
      referrers: toPercent(referrerResult.rows),
      uptime,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
