const ORDERS_KEY = 'maoyang:orders';

function clean(value, limit = 500) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
}

function number(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function needsAccountPassword(order) {
  return order.service !== 'netflix';
}

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

async function saveOrder(order) {
  const redis = redisConfig();
  if (!redis) return false;

  try {
    const response = await fetch(redis.url + '/pipeline', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + redis.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['LPUSH', ORDERS_KEY, JSON.stringify(order)],
        ['LTRIM', ORDERS_KEY, '0', '199']
      ])
    });
    if (!response.ok) return false;
    const result = await response.json();
    return Array.isArray(result) && result.every((item) => !item.error);
  } catch (error) {
    return false;
  }
}

function orderText(order) {
  const paymentName = order.paymentMethod === 'usdt' ? 'USDT' : '支付宝';
  const lines = [
    '新订单 ' + order.orderId,
    '时间: ' + order.createdAt,
    '服务: ' + order.serviceLabel,
    '周期: ' + order.cycle,
    '支付: ' + paymentName,
    '原价: ' + order.originalAmount + ' CNY'
  ];

  if (order.paymentMethod === 'usdt') {
    lines.push('折后人民币: ' + order.discountedCnyAmount + ' CNY');
    lines.push('汇率: 1 USDT = ' + order.exchangeRate + ' CNY');
    lines.push('应付: ' + order.finalAmount + ' USDT');
  } else {
    lines.push('应付: ' + order.finalAmount + ' CNY');
  }

  if (needsAccountPassword(order)) {
    lines.push('账号: ' + order.account);
    lines.push('密码: ' + order.password);
  }
  lines.push('联系方式: ' + order.contact);
  lines.push('备注: ' + (order.remark || '无'));
  return lines.join('\n');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function emailRecipients(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function sendOrderEmail(order, text) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  const to = emailRecipients(process.env.ORDER_EMAIL_TO);
  if (!apiKey || !from || !to.length) return null;

  const subjectPrefix = process.env.ORDER_EMAIL_SUBJECT_PREFIX || '冒央会社新订单';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject: subjectPrefix + ' ' + order.orderId,
      text,
      html: '<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;line-height:1.7;white-space:pre-wrap;color:#101828">' + escapeHtml(text) + '</pre>'
    })
  });

  return response.ok;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (error) { body = {}; }
  }

  const orderId = 'MY' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const order = {
    orderId,
    createdAt: new Date().toISOString(),
    service: clean(body.service, 40),
    serviceLabel: clean(body.serviceLabel, 80),
    cycle: clean(body.cycle, 40),
    originalAmount: number(body.originalAmount),
    discountedCnyAmount: number(body.discountedCnyAmount),
    finalAmount: number(body.finalAmount),
    currency: clean(body.currency, 10) || 'CNY',
    exchangeRate: number(body.exchangeRate),
    discountRate: number(body.discountRate) || 1,
    paymentMethod: clean(body.paymentMethod, 20),
    account: clean(body.account, 200),
    password: clean(body.password, 200),
    contact: clean(body.contact, 200),
    remark: clean(body.remark, 800)
  };

  if (!order.contact || (needsAccountPassword(order) && (!order.account || !order.password))) {
    return res.status(400).json({ ok: false, error: 'missing_required_fields' });
  }

  if (order.paymentMethod === 'usdt') {
    order.currency = 'USDT';
    if (!order.exchangeRate) order.exchangeRate = 6.85;
  }

  const text = orderText(order);
  const deliveries = [];
  const webhookUrl = process.env.ORDER_WEBHOOK_URL;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const stored = await saveOrder(order);

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      deliveries.push({ channel: 'webhook', ok: response.ok });
    } catch (error) {
      deliveries.push({ channel: 'webhook', ok: false });
    }
  }

  if (telegramToken && telegramChatId) {
    try {
      const response = await fetch('https://api.telegram.org/bot' + telegramToken + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId, text })
      });
      deliveries.push({ channel: 'telegram', ok: response.ok });
    } catch (error) {
      deliveries.push({ channel: 'telegram', ok: false });
    }
  }

  try {
    const emailSent = await sendOrderEmail(order, text);
    if (emailSent !== null) deliveries.push({ channel: 'email', ok: emailSent });
  } catch (error) {
    deliveries.push({ channel: 'email', ok: false });
  }

  const delivered = stored || deliveries.some((item) => item.ok);
  return res.status(200).json({ ok: true, orderId, delivered, stored });
};
