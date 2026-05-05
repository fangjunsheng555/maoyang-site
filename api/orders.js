const ORDERS_KEY = 'maoyang:orders';

function envFirst(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return '';
}

function redisConfig() {
  const url = envFirst('KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL');
  const token = envFirst('KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

function adminKey(req) {
  return String(req.headers['x-admin-key'] || req.query.key || '').trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const expectedKey = envFirst('ADMIN_KEY', 'MAOYANG_ADMIN_KEY', 'ORDER_ADMIN_KEY');
  if (!expectedKey) {
    return res.status(503).json({ ok: false, error: 'admin_key_not_configured' });
  }
  if (adminKey(req) !== expectedKey) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const redis = redisConfig();
  if (!redis) {
    return res.status(200).json({ ok: true, configured: false, orders: [] });
  }

  try {
    const response = await fetch(redis.url + '/lrange/' + encodeURIComponent(ORDERS_KEY) + '/0/199', {
      headers: { Authorization: 'Bearer ' + redis.token }
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      return res.status(502).json({ ok: false, error: 'storage_read_failed' });
    }

    const orders = Array.isArray(data.result)
      ? data.result.map((item) => {
          try { return JSON.parse(item); } catch (error) { return null; }
        }).filter(Boolean)
      : [];

    return res.status(200).json({ ok: true, configured: true, orders });
  } catch (error) {
    return res.status(502).json({ ok: false, error: 'storage_unavailable' });
  }
};
