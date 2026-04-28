const ORDERS_KEY = 'maoyang:orders';

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
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

  const expectedKey = process.env.ADMIN_KEY;
  if (!expectedKey || adminKey(req) !== expectedKey) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const redis = redisConfig();
  if (!redis) {
    return res.status(200).json({ ok: true, configured: false, orders: [] });
  }

  try {
    const response = await fetch(redis.url + '/lrange/' + encodeURIComponent(ORDERS_KEY) + '/0/99', {
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
