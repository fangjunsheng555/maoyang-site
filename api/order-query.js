const ORDERS_KEY = 'maoyang:orders';

function envFirst(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return '';
}

function clean(value, limit = 200) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
}
function redisConfig() {
  const url = envFirst('KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL');
  const token = envFirst('KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}
function normalizeOrderId(value) { return clean(value, 80).replace(/\s+/g, '').toUpperCase(); }
function normalizeContact(value) { return clean(value, 160).toLowerCase().replace(/[\s\-_:：+()（）]/g, ''); }
function normalizeEmail(value) { return clean(value, 200).toLowerCase().trim(); }

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

function idMatches(order, raw) {
  const q = normalizeOrderId(raw);
  return !!q && normalizeOrderId(order.orderId) === q;
}
function emailMatches(order, raw) {
  const q = normalizeEmail(raw);
  if (!q || q.indexOf('@') < 0) return false;
  return normalizeEmail(order.email) === q;
}
function contactMatches(order, raw) {
  const q = normalizeContact(raw);
  return !!q && normalizeContact(order.contact) === q;
}
function orderMatches(o, q) { return idMatches(o, q) || emailMatches(o, q) || contactMatches(o, q); }
function matchType(o, q) {
  if (idMatches(o, q)) return 'orderId';
  if (emailMatches(o, q)) return 'email';
  if (contactMatches(o, q)) return 'contact';
  return '';
}

function publicOrder(order, type) {
  let items;
  if (Array.isArray(order.items) && order.items.length > 0) {
    items = order.items.map((it) => {
      const account = it.account || (it.service === 'network' ? order.orderId : '');
      const out = {
        service: it.service || '',
        label: it.label || '',
        cycle: it.cycle || '',
        amount: Number(it.amount || 0),
        account,
        password: it.password || ''
      };
      if (it.subscriptionLinks) out.subscriptionLinks = it.subscriptionLinks;
      else if (it.service === 'network' && account) out.subscriptionLinks = subscriptionLinks(account);
      return out;
    });
  } else {
    const it = {
      service: order.service || '',
      label: order.serviceLabel || '',
      cycle: order.cycle || '',
      amount: Number(order.finalAmount || 0),
      account: order.account || '',
      password: order.password || ''
    };
    if (it.service === 'network' && it.account) it.subscriptionLinks = subscriptionLinks(it.account);
    items = [it];
  }

  return {
    matchType: type || '',
    orderId: order.orderId || '',
    createdAt: order.createdAt || '',
    createdAtBeijing: order.createdAtBeijing || '',
    items,
    itemCount: items.length,
    serviceLabel: order.serviceLabel || items.map((i) => i.label).join(' + '),
    paymentMethod: order.paymentMethod || 'alipay',
    subtotal: Number(order.subtotal || order.originalAmount || items.reduce((s, i) => s + i.amount, 0)),
    discountRate: Number(order.discountRate || 0),
    discountLabel: order.discountLabel || '',
    baseFinalAmount: Number(order.baseFinalAmount || order.finalAmount || 0),
    walletDeduction: Number(order.walletDeduction || 0),
    finalAmount: Number(order.finalAmount || 0),
    finalUsdt: Number(order.finalUsdt || 0),
    paidAmount: Number(order.paidAmount || (order.paymentMethod === 'usdt' ? order.finalUsdt : order.finalAmount) || 0),
    paidCurrency: order.paidCurrency || (order.paymentMethod === 'usdt' ? 'USDT' : 'CNY'),
    currency: order.currency || (order.paymentMethod === 'usdt' ? 'USDT' : 'CNY'),
    email: order.email || '',
    contact: order.contact || '',
    remark: order.remark || '',
    status: order.status || 'pending',
    statusLabel: order.statusLabel || (order.status === 'completed' ? '已完成充值' : '待处理'),
    completedAt: order.completedAt || '',
    completedAtBeijing: order.completedAtBeijing || '',
    fulfillmentEmailSentAt: order.fulfillmentEmailSentAt || '',
    service: items[0] ? items[0].service : '',
    cycle: items[0] ? items[0].cycle : '',
    account: items[0] ? items[0].account : '',
    password: items[0] ? items[0].password : ''
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = parseBody(req);
  const query = clean(body.query || body.q || '', 200);
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
      ? data.result.map((item) => { try { return JSON.parse(item); } catch (error) { return null; } }).filter(Boolean)
      : [];

    const matched = orders
      .filter((order) => orderMatches(order, query))
      .slice(0, 20)
      .map((order) => publicOrder(order, matchType(order, query)));

    return res.status(200).json({ ok: true, configured: true, orders: matched });
  } catch (error) {
    return res.status(502).json({ ok: false, error: 'storage_unavailable' });
  }
};
