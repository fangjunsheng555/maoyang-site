const ORDERS_KEY = 'maoyang:orders';

function clean(value, limit = 200) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
}

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

function normalizeOrderId(value) {
  return clean(value, 80).replace(/\s+/g, '').toUpperCase();
}

function normalizeContact(value) {
  return clean(value, 160).toLowerCase().replace(/[\s\-_:：+()（）]/g, '');
}

function subscriptionLinks(username) {
  const encoded = encodeURIComponent(clean(username, 80));
  return {
    shadowrocket: 'https://hk.joinvip.vip:2056/sub/' + encoded,
    clash: 'https://hk.joinvip.vip:2056/sub/' + encoded + '?format=clash'
  };
}

function parseBody(req) {
  if (req.method === 'GET') return { query: req.query && (req.query.query || req.query.q) };
  const body = req.body || {};
  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch (error) { return {}; }
  }
  return body;
}

function idMatches(order, rawOrderId) {
  const queryId = normalizeOrderId(rawOrderId);
  return !!queryId && normalizeOrderId(order.orderId) === queryId;
}

function contactExactMatches(order, rawContact) {
  const queryContact = normalizeContact(rawContact);
  return !!queryContact && normalizeContact(order.contact) === queryContact;
}

function orderMatches(order, query) {
  return idMatches(order, query) || contactExactMatches(order, query);
}

function matchType(order, query) {
  if (idMatches(order, query)) return 'orderId';
  if (contactExactMatches(order, query)) return 'contact';
  return '';
}

function publicOrder(order, type) {
  const output = {
    matchType: type || '',
    orderId: order.orderId || '',
    createdAt: order.createdAt || '',
    createdAtBeijing: order.createdAtBeijing || '',
    service: order.service || '',
    serviceLabel: order.serviceLabel || '',
    cycle: order.cycle || '',
    paymentMethod: order.paymentMethod || '',
    originalAmount: Number(order.originalAmount || 0),
    discountedCnyAmount: Number(order.discountedCnyAmount || 0),
    finalAmount: Number(order.finalAmount || 0),
    currency: order.currency || (order.paymentMethod === 'usdt' ? 'USDT' : 'CNY'),
    exchangeRate: Number(order.exchangeRate || 0),
    account: order.account || '',
    password: order.password || '',
    contact: order.contact || '',
    remark: order.remark || '',
    passwordHidden: false
  };
  if (output.service === 'network' && output.account) {
    output.subscriptionLinks = subscriptionLinks(output.account);
  }
  return output;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = parseBody(req);
  const query = clean(body.query || body.q || '', 160);
  if (!query) {
    return res.status(400).json({ ok: false, error: 'query_required' });
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

    const matched = orders
      .filter((order) => orderMatches(order, query))
      .slice(0, 10)
      .map((order) => publicOrder(order, matchType(order, query)));

    return res.status(200).json({ ok: true, configured: true, orders: matched });
  } catch (error) {
    return res.status(502).json({ ok: false, error: 'storage_unavailable' });
  }
};
