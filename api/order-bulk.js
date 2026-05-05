const ORDERS_KEY = 'maoyang:orders';

function envFirst(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return '';
}

function clean(value, limit = 500) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
}
function pad2(v){ return String(v).padStart(2, '0'); }
function formatBeijingTime(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  const ts = Number.isNaN(d.getTime()) ? Date.now() : d.getTime();
  const b = new Date(ts + 8 * 60 * 60 * 1000);
  return [b.getUTCFullYear(), pad2(b.getUTCMonth() + 1), pad2(b.getUTCDate())].join('-')
    + ' ' + [pad2(b.getUTCHours()), pad2(b.getUTCMinutes()), pad2(b.getUTCSeconds())].join(':')
    + ' 北京时间 (UTC+8)';
}

function redisConfig() {
  const url = envFirst('KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL');
  const token = envFirst('KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

function adminKey(req) {
  return String(req.headers['x-admin-key'] || (req.query && req.query.key) || '').trim();
}

function parseBody(req) {
  const body = req.body || {};
  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch (error) { return {}; }
  }
  return body;
}

function normalizeOrderIds(value) {
  const list = Array.isArray(value) ? value : [];
  const ids = list.map((id) => clean(id, 80).toUpperCase()).filter(Boolean);
  return Array.from(new Set(ids)).slice(0, 100);
}

async function readOrders(redis) {
  const response = await fetch(redis.url + '/lrange/' + encodeURIComponent(ORDERS_KEY) + '/0/199', {
    headers: { Authorization: 'Bearer ' + redis.token }
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error('storage_read_failed');
  return Array.isArray(data.result)
    ? data.result.map((item) => {
        try { return JSON.parse(item); } catch (error) { return null; }
      }).filter(Boolean)
    : [];
}

async function writeOrders(redis, orders) {
  const commands = [['DEL', ORDERS_KEY]];
  if (orders.length > 0) {
    commands.push(['RPUSH', ORDERS_KEY, ...orders.map((order) => JSON.stringify(order))]);
  }
  const response = await fetch(redis.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + redis.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!response.ok) return false;
  const result = await response.json();
  return Array.isArray(result) && result.every((item) => !item.error);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const expectedKey = envFirst('ADMIN_KEY', 'MAOYANG_ADMIN_KEY', 'ORDER_ADMIN_KEY');
  if (!expectedKey) return res.status(503).json({ ok: false, error: 'admin_key_not_configured' });
  if (adminKey(req) !== expectedKey) return res.status(401).json({ ok: false, error: 'unauthorized' });

  const redis = redisConfig();
  if (!redis) return res.status(503).json({ ok: false, error: 'storage_not_configured' });

  const body = parseBody(req);
  const action = clean(body.action, 20).toLowerCase();
  const orderIds = normalizeOrderIds(body.orderIds);
  if (!['cancel', 'delete'].includes(action)) {
    return res.status(400).json({ ok: false, error: 'invalid_action' });
  }
  if (orderIds.length === 0) {
    return res.status(400).json({ ok: false, error: 'missing_order_ids' });
  }

  try {
    const idSet = new Set(orderIds);
    const orders = await readOrders(redis);
    let affected = 0;
    let nextOrders;

    if (action === 'delete') {
      nextOrders = orders.filter((order) => {
        const match = idSet.has(clean(order.orderId, 80).toUpperCase());
        if (match) affected += 1;
        return !match;
      });
    } else {
      const now = new Date();
      const cancelledAt = now.toISOString();
      const cancelledAtBeijing = formatBeijingTime(now);
      nextOrders = orders.map((order) => {
        if (!idSet.has(clean(order.orderId, 80).toUpperCase())) return order;
        affected += 1;
        return {
          ...order,
          status: 'cancelled',
          statusLabel: '已取消',
          cancelledAt,
          cancelledAtBeijing,
          updatedAt: cancelledAt,
          updatedAtBeijing: cancelledAtBeijing
        };
      });
    }

    const stored = await writeOrders(redis, nextOrders);
    if (!stored) return res.status(502).json({ ok: false, error: 'storage_write_failed' });

    return res.status(200).json({
      ok: true,
      action,
      affected,
      requested: orderIds.length
    });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error.message || 'storage_unavailable' });
  }
};
