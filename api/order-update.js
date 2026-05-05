const { buildFulfillmentEmailHtml, buildFulfillmentEmailText } = require('./email-template.js');

const ORDERS_KEY = 'maoyang:orders';
const FULFILLMENT_REQUIRED = new Set(['netflix', 'disney', 'hbomax']);
const BRAND_NAME = process.env.BRAND_NAME || '冒央会社';
const SITE_DOMAIN = process.env.SITE_DOMAIN || 'joinvip.vip';
const SITE_URL = process.env.SITE_URL || ('https://' + SITE_DOMAIN);
const SUPPORT_CONTACT = process.env.SUPPORT_CONTACT || '请通过 QQ 2802632995 / WhatsApp +1 4315093334 / Telegram @MaoyangSupport 联系在线客服';

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

function normalizeStatus(value) {
  const status = clean(value, 30).toLowerCase();
  if (['completed', 'fulfilled', 'done', 'finish', 'finished'].includes(status)) return 'completed';
  if (['cancelled', 'canceled', 'refunded'].includes(status)) return 'cancelled';
  return 'pending';
}

function statusLabel(status) {
  if (status === 'completed') return '已完成充值';
  if (status === 'cancelled') return '已取消';
  return '待处理';
}

function subscriptionLinks(username) {
  const encoded = encodeURIComponent(clean(username, 80));
  return {
    shadowrocket: 'https://hk.joinvip.vip:2056/sub/' + encoded,
    clash: 'https://hk.joinvip.vip:2056/sub/' + encoded + '?format=clash'
  };
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

function normalizeItems(order) {
  if (Array.isArray(order.items) && order.items.length > 0) return order.items;
  return [{
    service: order.service || '',
    label: order.serviceLabel || order.service || '订单',
    cycle: order.cycle || '',
    amount: Number(order.finalAmount || order.amount || 0),
    account: order.account || '',
    password: order.password || ''
  }];
}

function inputForItem(inputs, item, index) {
  return inputs.find((input) => Number(input.index) === index)
    || inputs.find((input) => clean(input.service, 40) === item.service)
    || null;
}

function applyUpdate(order, body) {
  const status = normalizeStatus(body.status || order.status || 'pending');
  const previousStatus = normalizeStatus(order.status || 'pending');
  const inputs = Array.isArray(body.items)
    ? body.items
    : (Array.isArray(body.fulfillmentItems) ? body.fulfillmentItems : []);

  order.items = normalizeItems(order).map((item, index) => {
    const next = { ...item, service: clean(item.service, 40) };
    const input = inputForItem(inputs, next, index);
    if (input) {
      next.account = clean(input.account, 180);
      next.password = clean(input.password, 180);
      next.fulfillmentNote = clean(input.note || input.remark, 500);
    }
    if (next.service === 'network') {
      next.account = order.orderId;
      next.subscriptionLinks = subscriptionLinks(order.orderId);
    }
    return next;
  });

  const missing = status === 'completed'
    ? order.items
        .filter((item) => FULFILLMENT_REQUIRED.has(item.service) && (!item.account || !item.password))
        .map((item) => item.label || item.service)
    : [];
  if (missing.length > 0) {
    return { error: 'missing_fulfillment', missing };
  }

  const now = new Date();
  order.status = status;
  order.statusLabel = statusLabel(status);
  order.updatedAt = now.toISOString();
  order.updatedAtBeijing = formatBeijingTime(now);
  if (Object.prototype.hasOwnProperty.call(body, 'adminNote')) order.adminNote = clean(body.adminNote, 1500);
  if (Object.prototype.hasOwnProperty.call(body, 'fulfillmentNote')) order.fulfillmentNote = clean(body.fulfillmentNote, 1500);

  if (status === 'completed') {
    order.completedAt = order.completedAt || now.toISOString();
    order.completedAtBeijing = order.completedAtBeijing || formatBeijingTime(now);
  }

  order.itemCount = order.items.length;
  order.service = order.items[0] ? order.items[0].service : '';
  order.serviceLabel = order.items.length === 1 ? (order.items[0].label || order.service) : order.items.map((item) => item.label || item.service).join(' + ');
  order.cycle = order.items[0] ? order.items[0].cycle : '';
  order.account = order.items[0] ? order.items[0].account : '';
  order.password = order.items[0] ? order.items[0].password : '';

  return {
    order,
    shouldSendCompletionEmail: status === 'completed' && (previousStatus !== 'completed' || body.resendEmail === true)
  };
}

async function sendFulfillmentEmail(order) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  if (!host || !user || !pass || !from) return { ok: false, reason: 'smtp_env_missing' };
  if (!order.email) return { ok: false, reason: 'order_email_missing' };

  let nodemailer;
  try { nodemailer = require('nodemailer'); }
  catch (error) { return { ok: false, reason: 'nodemailer_missing', error: error.message }; }

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465;
  const transporter = nodemailer.createTransport({
    host, port, secure, auth: { user, pass },
    requireTLS: !secure,
    tls: { minVersion: 'TLSv1.2' },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });

  try {
    const html = buildFulfillmentEmailHtml({ order, brandName: BRAND_NAME, siteDomain: SITE_DOMAIN, siteUrl: SITE_URL, supportContact: SUPPORT_CONTACT });
    const text = buildFulfillmentEmailText({ order, brandName: BRAND_NAME, siteDomain: SITE_DOMAIN, siteUrl: SITE_URL, supportContact: SUPPORT_CONTACT });
    const info = await transporter.sendMail({
      from: '"' + BRAND_NAME + '" <' + from + '>',
      to: order.email,
      subject: '服务已开通 ' + order.orderId + ' · ' + BRAND_NAME,
      text,
      html
    });
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    return { ok: false, reason: 'send_failed', error: error.message, code: error.code };
  }
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
  const orderId = clean(body.orderId, 80).toUpperCase();
  if (!orderId) return res.status(400).json({ ok: false, error: 'missing_order_id' });

  try {
    const orders = await readOrders(redis);
    const index = orders.findIndex((order) => clean(order.orderId, 80).toUpperCase() === orderId);
    if (index < 0) return res.status(404).json({ ok: false, error: 'order_not_found' });

    const updated = applyUpdate(orders[index], body);
    if (updated.error) return res.status(400).json({ ok: false, error: updated.error, missing: updated.missing || [] });

    orders[index] = updated.order;
    const stored = await writeOrders(redis, orders);
    if (!stored) return res.status(502).json({ ok: false, error: 'storage_write_failed' });

    let email = null;
    if (updated.shouldSendCompletionEmail) {
      email = await sendFulfillmentEmail(updated.order);
      updated.order.completionEmailDelivery = email;
      if (email.ok) {
        const now = new Date();
        updated.order.fulfillmentEmailSentAt = now.toISOString();
        updated.order.fulfillmentEmailSentAtBeijing = formatBeijingTime(now);
      }
      orders[index] = updated.order;
      await writeOrders(redis, orders);
    }

    return res.status(200).json({ ok: true, order: updated.order, email });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error.message || 'storage_unavailable' });
  }
};
