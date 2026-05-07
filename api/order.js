const { buildOrderEmailHtml, buildOrderEmailText } = require('./email-template.js');
const store = require('../lib/maoyang-store.js');
const auth = require('../lib/maoyang-auth.js');

const ORDERS_KEY = 'maoyang:orders';

const PRODUCTS = {
  spotify: { label:'Spotify Premium', amount:128, cycle:'1年', needsAccountPassword:true },
  netflix: { label:'Netflix Premium', amount:168, cycle:'1年' },
  disney:  { label:'Disney+',         amount:108, cycle:'1年' },
  hbomax:  { label:'HBO Max',         amount:148, cycle:'1年' },
  chatgpt: { label:'ChatGPT Plus',    amount:75,  cycle:'1月' },
  network: { label:'网络节点服务',     amount:99,  cycle:'1年' }
};

const BRAND_NAME = process.env.BRAND_NAME || '冒央会社';
const SITE_DOMAIN = process.env.SITE_DOMAIN || 'joinvip.vip';
const SITE_URL = process.env.SITE_URL || ('https://' + SITE_DOMAIN);
const SUPPORT_CONTACT = process.env.SUPPORT_CONTACT || 'QQ：2802632995\nWhatsApp：+1 4315093334\nTelegram：@MaoyangSupport';
const USDT_DISCOUNT = 0.9;
const USDT_RATE = 6.85;

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
function validUsername(v){ return /^[A-Za-z0-9]{4,10}$/.test(String(v || '').trim()); }
function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim()); }

function bundleDiscountRate(n){ if (n >= 3) return 0.10; if (n === 2) return 0.05; return 0; }
function bundleDiscountLabel(n){ if (n >= 3) return '3 件起 9 折'; if (n === 2) return '2 件 9.5 折'; return ''; }
function normalizeCode(value){ return clean(value, 80).replace(/\s+/g, '').toUpperCase(); }
function codeUnavailable(code, email) {
  if (!code || code.status === 'disabled') return 'code_disabled';
  if (code.expiresAt && new Date(code.expiresAt).getTime() < Date.now()) return 'code_expired';
  const usedBy = Array.isArray(code.usedBy) ? code.usedBy : [];
  if (usedBy.length >= Math.max(1, Number(code.maxUses || 1))) return 'code_used_up';
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (normalizedEmail && usedBy.some((item) => String((item && item.email) || '').trim().toLowerCase() === normalizedEmail)) return 'code_already_used';
  return '';
}

function subscriptionLinks(username) {
  const encoded = encodeURIComponent(String(username || '').trim());
  return {
    shadowrocket: 'https://hk.joinvip.vip:2056/sub/' + encoded,
    clash: 'https://hk.joinvip.vip:2056/sub/' + encoded + '?format=clash'
  };
}

function redisConfig() {
  const url = envFirst('KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL');
  const token = envFirst('KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

async function saveOrder(order) {
  const redis = redisConfig();
  if (!redis) return null;
  try {
    const response = await fetch(redis.url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + redis.token, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['LPUSH', ORDERS_KEY, JSON.stringify(order)],
        ['LTRIM', ORDERS_KEY, '0', '199']
      ])
    });
    if (!response.ok) return false;
    const result = await response.json();
    return Array.isArray(result) && result.every((item) => !item.error);
  } catch (error) { return false; }
}

function orderText(order) {
  const isUsdt = order.paymentMethod === 'usdt';
  const lines = [
    '🛒 新订单 ' + order.orderId,
    '━━━━━━━━━━━━━━━━',
    '时间: ' + order.createdAtBeijing,
    '件数: ' + order.items.length + ' 件',
    '支付: ' + (order.paymentMethod === 'redeem_code' ? '商品兑换码' : (isUsdt ? 'USDT-TRC20' : '支付宝')),
    '邮箱: ' + order.email,
    '联系: ' + order.contact,
    '━━ 商品明细 ━━'
  ];
  order.items.forEach((it, i) => {
    lines.push((i + 1) + '. ' + it.label + '（' + it.cycle + '）¥' + it.amount);
    if (it.account) lines.push('   ' + (it.service === 'network' ? '订阅名' : '账号') + ': ' + it.account);
    if (it.password) lines.push('   密码: ' + it.password);
    if (it.subscriptionLinks) {
      lines.push('   Shadowrocket: ' + it.subscriptionLinks.shadowrocket);
      lines.push('   Clash: ' + it.subscriptionLinks.clash);
    }
  });
  lines.push('━━ 价格 ━━');
  lines.push('商品总价: ¥' + order.subtotal);
  if (order.discountRate > 0) {
    lines.push('组合优惠 ' + order.discountLabel + ': −¥' + (order.subtotal - (order.baseFinalAmount || order.finalAmount)));
  }
  if (order.couponDeduction > 0) {
    lines.push('优惠券抵扣: −¥' + order.couponDeduction);
  }
  if (order.walletDeduction > 0) {
    lines.push('账户立减: −¥' + order.walletDeduction);
  }
  if (isUsdt) {
    lines.push('折后人民币: ¥' + order.finalAmount);
    lines.push('💰 实付: ' + order.paidAmount + ' USDT');
  } else if (order.paymentMethod === 'redeem_code') {
    lines.push('💰 实付: ¥0（商品兑换码）');
  } else if (order.paymentMethod === 'balance') {
    lines.push('💰 实付: ¥0（账户优惠全额抵扣）');
  } else {
    lines.push('💰 实付: ¥' + order.finalAmount);
  }
  if (order.remark) lines.push('备注: ' + order.remark);
  return lines.join('\n');
}

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;
  try {
    const response = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
    });
    return response.ok;
  } catch (e) { return false; }
}

async function sendWebhook(order) {
  const webhookUrl = process.env.ORDER_WEBHOOK_URL;
  if (!webhookUrl) return null;
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return response.ok;
  } catch (e) { return false; }
}

async function sendOrderEmail(order) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  if (!host || !user || !pass || !from) {
    console.error('[email] SMTP env missing:', { host: !!host, user: !!user, pass: !!pass, from: !!from });
    return { ok: false, reason: 'smtp_env_missing' };
  }
  if (!order.email) return { ok: false, reason: 'order_email_missing' };

  let nodemailer;
  try { nodemailer = require('nodemailer'); }
  catch (error) {
    console.error('[email] nodemailer require failed:', error.message);
    return { ok: false, reason: 'nodemailer_missing', error: error.message };
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465;
  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host, port, secure, auth: { user, pass },
      requireTLS: !secure,
      tls: { minVersion: 'TLSv1.2' },
      connectionTimeout: 15000, greetingTimeout: 10000, socketTimeout: 20000
    });
  } catch (error) {
    return { ok: false, reason: 'transport_create_failed', error: error.message };
  }

  try {
    const html = buildOrderEmailHtml({ order, brandName: BRAND_NAME, siteDomain: SITE_DOMAIN, siteUrl: SITE_URL, supportContact: SUPPORT_CONTACT, usdtRate: USDT_RATE });
    const text = buildOrderEmailText({ order, brandName: BRAND_NAME, siteDomain: SITE_DOMAIN, siteUrl: SITE_URL, supportContact: SUPPORT_CONTACT, usdtRate: USDT_RATE });
    const subject = order.items.length > 1
      ? '订单确认 ' + order.orderId + ' · ' + order.items.length + ' 件 · ' + BRAND_NAME
      : '订单确认 ' + order.orderId + ' · ' + order.items[0].label + ' · ' + BRAND_NAME;

    const info = await transporter.sendMail({
      from: '"' + BRAND_NAME + '" <' + from + '>',
      to: order.email,
      subject, text, html
    });
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] sendMail failed:', error.message);
    return { ok: false, reason: 'send_failed', error: error.message, code: error.code };
  }
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

  let rawItems = Array.isArray(body.items) ? body.items : null;
  if (!rawItems && body.service) {
    rawItems = [{ service: body.service, account: body.account, password: body.password }];
  }
  if (!rawItems || rawItems.length === 0) {
    return res.status(400).json({ ok: false, error: 'missing_items' });
  }

  const email = clean(body.email, 200);
  const contact = clean(body.contact, 200);
  const remark = clean(body.remark, 1500);
  const paymentMethod = body.paymentMethod === 'usdt' ? 'usdt' : (body.paymentMethod === 'redeem_code' ? 'redeem_code' : 'alipay');

  if (!validEmail(email)) {
    return res.status(400).json({ ok: false, error: 'invalid_email' });
  }
  const requiresContact = rawItems.some((raw) => clean(raw.service, 40) === 'spotify');
  if (requiresContact && !contact) {
    return res.status(400).json({ ok: false, error: 'missing_contact:spotify' });
  }

  const items = [];
  for (const raw of rawItems) {
    const service = clean(raw.service, 40);
    const product = PRODUCTS[service];
    if (!product) {
      return res.status(400).json({ ok: false, error: 'invalid_service:' + service });
    }
    const account = clean(raw.account, 80);
    const password = clean(raw.password, 120);
    if (product.needsAccountPassword && (!account || !password)) {
      return res.status(400).json({ ok: false, error: 'missing_credentials:' + product.label });
    }
    const item = {
      service,
      label: product.label,
      cycle: product.cycle,
      amount: product.amount,
      account: product.needsAccountPassword ? account : '',
      password: product.needsAccountPassword ? password : ''
    };
    items.push(item);
  }

  let authUsers = null;
  let authUser = null;
  let authRedis = null;
  try {
    authRedis = store.redisConfig();
    if (authRedis) {
      authUsers = await store.readUsers(authRedis);
      authUser = auth.currentUser(req, authUsers);
    }
  } catch (error) {
    authUsers = null;
    authUser = null;
  }

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const discountRate = bundleDiscountRate(items.length);
  const discountLabel = bundleDiscountLabel(items.length);
  const baseFinalAmount = Math.round(subtotal * (1 - discountRate));
  const redeemCode = normalizeCode(body.redeemCode || body.code || '');
  let redeemRecord = null;
  let redeemCodes = null;
  if (paymentMethod === 'redeem_code' || redeemCode) {
    if (!redeemCode) return res.status(400).json({ ok:false, error:'missing_code' });
    if (!authRedis) return res.status(503).json({ ok:false, error:'storage_not_configured' });
    redeemCodes = await store.readCodes(authRedis);
    redeemRecord = redeemCodes.find((item) => normalizeCode(item.code) === redeemCode);
    const unavailable = codeUnavailable(redeemRecord, email);
    if (unavailable) return res.status(400).json({ ok:false, error:unavailable });
    if (redeemRecord.type !== 'product') return res.status(400).json({ ok:false, error:'invalid_product_code' });
    const redeemService = clean(redeemRecord.service, 40);
    if (items.length !== 1 || items[0].service !== redeemService) return res.status(400).json({ ok:false, error:'redeem_product_mismatch' });
  }
  let couponDeduction = 0;
  let couponId = '';
  let couponNote = '';
  if (!redeemRecord && authUser && (body.useCoupon !== false)) {
    const coupons = auth.activeCoupons(authUser);
    const coupon = coupons[0];
    if (coupon) {
      couponDeduction = auth.roundMoney(Math.max(0, Math.min(Number(coupon.amount || 0), baseFinalAmount)));
      couponId = coupon.id || '';
      couponNote = coupon.note || '账户优惠券';
    }
  }
  let walletDeduction = 0;
  let walletBalanceBefore = 0;
  let walletBalanceAfter = 0;
  const afterCouponAmount = auth.roundMoney(Math.max(0, baseFinalAmount - couponDeduction));
  if (!redeemRecord && authUser && (body.useBalance === true || Number(body.walletDeduction || 0) > 0)) {
    walletBalanceBefore = auth.roundMoney(authUser.balance || 0);
    const requested = Number(body.walletDeduction || afterCouponAmount);
    walletDeduction = auth.roundMoney(Math.max(0, Math.min(walletBalanceBefore, afterCouponAmount, requested)));
    walletBalanceAfter = auth.roundMoney(walletBalanceBefore - walletDeduction);
  }
  const finalAmount = redeemRecord ? 0 : auth.roundMoney(Math.max(0, baseFinalAmount - couponDeduction - walletDeduction));
  const finalUsdt = Math.round((finalAmount * USDT_DISCOUNT / USDT_RATE) * 100) / 100;
  const actualPaymentMethod = redeemRecord ? 'redeem_code' : (finalAmount <= 0 && (walletDeduction > 0 || couponDeduction > 0) ? 'balance' : paymentMethod);
  const paidAmount = actualPaymentMethod === 'usdt' ? finalUsdt : finalAmount;
  const paidCurrency = actualPaymentMethod === 'usdt' ? 'USDT' : 'CNY';

  const now = new Date();
  const order = {
    orderId: 'MY' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),
    createdAt: now.toISOString(),
    createdAtBeijing: formatBeijingTime(now),
    items,
    itemCount: items.length,
    subtotal,
    discountRate,
    discountLabel,
    baseFinalAmount,
    couponDeduction,
    couponId,
    couponNote,
    walletDeduction,
    walletBalanceBefore,
    walletBalanceAfter,
    finalAmount,
    finalUsdt,
    paymentMethod: actualPaymentMethod,
    paidAmount,
    paidCurrency,
    userId: authUser ? authUser.id : '',
    email: authUser ? authUser.email : email,
    contact,
    remark,
    status: 'pending',
    statusLabel: '待处理',
    // Legacy flat fields for backward compat
    service: items[0].service,
    serviceLabel: items.length === 1 ? items[0].label : items.map(i => i.label).join(' + '),
    cycle: items[0].cycle,
    account: items[0].account,
    password: items[0].password,
    originalAmount: subtotal,
    currency: actualPaymentMethod === 'usdt' ? 'USDT' : 'CNY',
    redeemCode: redeemRecord ? redeemCode : ''
  };

  order.items.forEach((item) => {
    if (item.service === 'network') {
      item.account = order.orderId;
      item.subscriptionLinks = subscriptionLinks(order.orderId);
    }
  });
  order.account = order.items[0] ? order.items[0].account : '';
  order.password = order.items[0] ? order.items[0].password : '';

  if (authUser && couponDeduction > 0) {
    authUser.coupons = Array.isArray(authUser.coupons) ? authUser.coupons : [];
    const coupon = authUser.coupons.find((item) => item && item.id === couponId);
    if (coupon) {
      coupon.status = 'used';
      coupon.usedAt = now.toISOString();
      coupon.usedAtBeijing = formatBeijingTime(now);
      coupon.orderId = order.orderId;
    }
  }

  if (authUser && walletDeduction > 0) {
    authUser.balance = walletBalanceAfter;
    authUser.ledger = Array.isArray(authUser.ledger) ? authUser.ledger : [];
    authUser.ledger.unshift(auth.newLedger('order_discount', -walletDeduction, authUser.balance, '订单余额抵扣：' + order.orderId));
    authUser.ledger = authUser.ledger.slice(0, 80);
  }

  const text = orderText(order);
  const deliveries = [];
  if (redeemRecord && redeemCodes) {
    redeemRecord.usedBy = Array.isArray(redeemRecord.usedBy) ? redeemRecord.usedBy : [];
    redeemRecord.usedBy.unshift({
      userId: authUser ? authUser.id : '',
      email,
      orderId: order.orderId,
      usedAt: now.toISOString(),
      usedAtBeijing: formatBeijingTime(now)
    });
    redeemRecord.usedCount = redeemRecord.usedBy.length;
  }
  const storageDelivery = redeemRecord && authRedis && redeemCodes
    ? store.pushOrderAndWriteCodes(authRedis, order, redeemCodes).then((stored) => deliveries.push({ channel: 'storage', ok: stored }))
    : authUser && (walletDeduction > 0 || couponDeduction > 0) && authRedis && authUsers
    ? store.pushOrderAndWriteUsers(authRedis, order, authUsers).then((stored) => deliveries.push({ channel: 'storage', ok: stored }))
    : saveOrder(order).then((stored) => stored !== null && deliveries.push({ channel: 'storage', ok: stored }));
  await Promise.all([
    storageDelivery,
    sendTelegram(text).then((sent) => sent !== null && deliveries.push({ channel: 'telegram', ok: sent })).catch(() => deliveries.push({ channel: 'telegram', ok: false })),
    sendWebhook(order).then((sent) => sent !== null && deliveries.push({ channel: 'webhook', ok: sent })).catch(() => deliveries.push({ channel: 'webhook', ok: false })),
    sendOrderEmail(order).then((result) => deliveries.push({ channel: 'email', ok: result.ok, info: result })).catch((error) => deliveries.push({ channel: 'email', ok: false, error: error.message }))
  ]);

  const stored = deliveries.some((item) => item && item.channel === 'storage' && item.ok);
  const notified = deliveries.some((item) => item && item.channel !== 'storage' && item.ok);
  const emailOk = deliveries.some((item) => item && item.channel === 'email' && item.ok);
  const delivered = stored && notified;
  return res.status(delivered ? 200 : 502).json({
    ok: delivered,
    orderId: order.orderId,
    items: order.items,
    paidAmount,
    paidCurrency,
    delivered,
    stored,
    notified,
    emailOk,
    deliveries,
    error: delivered ? '' : (stored ? 'delivery_failed' : 'storage_failed')
  });
};
