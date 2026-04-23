const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email.toLowerCase(), name || email.split('@')[0], hash]
    );
    const user = result.rows[0];
    res.json({ token: signToken(user), user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const result = await pool.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1 AND provider = $2',
      [email.toLowerCase(), 'local']
    );
    const user = result.rows[0];
    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: signToken(user), user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// --- Google OAuth ---
router.get('/oauth/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: `${process.env.BASE_URL}/api/auth/oauth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/oauth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${process.env.FRONTEND_URL || '/'}?oauth_error=no_code`);

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BASE_URL}/api/auth/oauth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('No access token');

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();

    const user = await upsertOAuthUser({ email: profile.email, name: profile.name, provider: 'google', providerId: profile.id });
    const token = signToken(user);
    res.send(oauthCallbackHtml(token));
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.send(oauthCallbackHtml(null, 'OAuth failed'));
  }
});

// --- GitHub OAuth ---
router.get('/oauth/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID || '',
    redirect_uri: `${process.env.BASE_URL}/api/auth/oauth/github/callback`,
    scope: 'read:user user:email',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/oauth/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${process.env.FRONTEND_URL || '/'}?oauth_error=no_code`);

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.BASE_URL}/api/auth/oauth/github/callback`,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('No access token');

    const [profileRes, emailRes] = await Promise.all([
      fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${tokenData.access_token}` } }),
      fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${tokenData.access_token}` } }),
    ]);
    const profile = await profileRes.json();
    const emails = await emailRes.json();
    const primary = (Array.isArray(emails) ? emails.find(e => e.primary) : null)?.email || profile.email;

    const user = await upsertOAuthUser({ email: primary, name: profile.name || profile.login, provider: 'github', providerId: String(profile.id) });
    const token = signToken(user);
    res.send(oauthCallbackHtml(token));
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    res.send(oauthCallbackHtml(null, 'OAuth failed'));
  }
});

async function upsertOAuthUser({ email, name, provider, providerId }) {
  const existing = await pool.query(
    'SELECT id, email, name FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (existing.rows[0]) return existing.rows[0];

  const result = await pool.query(
    'INSERT INTO users (email, name, provider, provider_id) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
    [email.toLowerCase(), name, provider, providerId]
  );
  return result.rows[0];
}

function oauthCallbackHtml(token, error) {
  const payload = token ? `{ token: ${JSON.stringify(token)} }` : `{ error: ${JSON.stringify(error)} }`;
  return `<!DOCTYPE html><html><body><script>
    try { window.opener && window.opener.postMessage(${payload}, '*'); } catch(e) {}
    window.close();
  </script></body></html>`;
}

module.exports = router;
