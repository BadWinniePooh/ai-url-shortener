const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const RESERVED_SLUGS = new Set([
  'api', 'auth', 'links', 'assets', 'static', 'health', 'admin',
  'login', 'register', 'logout', 'settings', 'dashboard', 'favicon.ico',
]);

function randomSlug(len = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  const buf = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) s += chars[buf[i] % chars.length];
  return s;
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.slug, u.target_url, u.created_at, u.health, u.last_check,
              COUNT(c.id)::int AS clicks
       FROM urls u
       LEFT JOIN clicks c ON c.url_id = u.id
       WHERE u.user_id = $1
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
      [req.user.id]
    );
    res.json({ urls: result.rows });
  } catch (err) {
    console.error('List URLs error:', err);
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  let { target_url, slug } = req.body;
  if (!target_url) return res.status(400).json({ error: 'target_url is required' });

  try { new URL(target_url); } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (!slug) {
    // Generate unique random slug
    for (let i = 0; i < 10; i++) {
      const candidate = randomSlug();
      const exists = await pool.query('SELECT id FROM urls WHERE slug = $1', [candidate]);
      if (!exists.rows.length) { slug = candidate; break; }
    }
    if (!slug) return res.status(500).json({ error: 'Could not generate unique slug' });
  } else {
    slug = slug.replace(/[^a-z0-9_-]/gi, '').toLowerCase().slice(0, 60);
    if (!slug) return res.status(400).json({ error: 'Invalid slug' });
    if (RESERVED_SLUGS.has(slug)) return res.status(400).json({ error: 'That slug is reserved' });

    const existing = await pool.query('SELECT id FROM urls WHERE slug = $1', [slug]);
    if (existing.rows.length) return res.status(409).json({ error: 'Slug already taken' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO urls (user_id, slug, target_url, health)
       VALUES ($1, $2, $3, 'alive')
       RETURNING id, slug, target_url, created_at, health, last_check`,
      [req.user.id, slug, target_url]
    );
    res.status(201).json({ url: { ...result.rows[0], clicks: 0 } });
  } catch (err) {
    console.error('Create URL error:', err);
    res.status(500).json({ error: 'Failed to create URL' });
  }
});

router.delete('/:slug', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM urls WHERE slug = $1 AND user_id = $2 RETURNING id',
      [req.params.slug, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'URL not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete URL error:', err);
    res.status(500).json({ error: 'Failed to delete URL' });
  }
});

module.exports = router;
