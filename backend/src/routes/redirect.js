const express = require('express');
const crypto = require('crypto');
const { pool } = require('../db');

const router = express.Router();

function parseUA(ua = '') {
  const browser =
    /Edg\//.test(ua) ? 'Edge' :
    /Chrome\//.test(ua) ? 'Chrome' :
    /Firefox\//.test(ua) ? 'Firefox' :
    /Safari\//.test(ua) ? 'Safari' :
    /MSIE|Trident/.test(ua) ? 'IE' : 'Other';

  const device =
    /Mobile|Android|iPhone|iPod/.test(ua) ? 'Mobile' :
    /iPad|Tablet/.test(ua) ? 'Tablet' : 'Desktop';

  return { browser, device };
}

function getIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
}

async function lookupGeo(ip) {
  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.')) {
    return { country_code: null, country_name: null };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`, {
      signal: AbortSignal.timeout(2000),
    });
    const data = await res.json();
    if (data.status === 'success') return { country_code: data.countryCode, country_name: data.country };
  } catch {}
  return { country_code: null, country_name: null };
}

router.get('/:slug', async (req, res, next) => {
  const { slug } = req.params;

  // Skip obvious non-slug paths
  if (slug.includes('.') || slug.length > 60) return next();

  try {
    const result = await pool.query(
      'SELECT id, target_url FROM urls WHERE slug = $1',
      [slug]
    );
    if (!result.rows.length) return next();

    const { id: urlId, target_url: targetUrl } = result.rows[0];
    res.redirect(302, targetUrl);

    // Record click asynchronously
    const ip = getIp(req);
    const ipHash = ip ? crypto.createHash('sha256').update(ip + process.env.IP_HASH_SALT).digest('hex') : null;
    const { browser, device } = parseUA(req.headers['user-agent']);
    const referrerHeader = req.headers['referer'] || req.headers['referrer'] || '';
    let referrer = null;
    try { referrer = referrerHeader ? new URL(referrerHeader).hostname : null; } catch {}

    lookupGeo(ip).then(async ({ country_code, country_name }) => {
      await pool.query(
        `INSERT INTO clicks (url_id, country_code, country_name, referrer, browser, device, ip_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [urlId, country_code, country_name, referrer, browser, device, ipHash]
      ).catch(err => console.error('Click insert error:', err));
    });
  } catch (err) {
    console.error('Redirect error:', err);
    next();
  }
});

module.exports = router;
