module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (error) { body = {}; }
  }

  const clean = (value, limit = 500) => String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
  const orderId = 'MY' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const order = {
    orderId,
    createdAt: new Date().toISOString(),
    service: clean(body.service, 40),
    serviceLabel: clean(body.serviceLabel, 80),
    cycle: clean(body.cycle, 40),
    originalAmount: Number(body.originalAmount || 0),
    finalAmount: Number(body.finalAmount || 0),
    paymentMethod: clean(body.paymentMethod, 20),
    account: clean(body.account, 200),
    password: clean(body.password, 200),
    contact: clean(body.contact, 200),
    paymentRef: clean(body.paymentRef, 200),
    remark: clean(body.remark, 800)
  };

  if (!order.account || !order.password || !order.contact) {
    return res.status(400).json({ ok: false, error: 'missing_required_fields' });
  }

  const lines = [
    '新订单 ' + order.orderId,
    '时间: ' + order.createdAt,
    '服务: ' + order.serviceLabel,
    '周期: ' + order.cycle,
    '支付: ' + order.paymentMethod,
    '原价: ' + order.originalAmount,
    '应付: ' + order.finalAmount,
    '账号: ' + order.account,
    '密码: ' + order.password,
    '联系方式: ' + order.contact,
    '付款备注/交易号: ' + (order.paymentRef || '无'),
    '备注: ' + (order.remark || '无')
  ];
  const text = lines.join('\n');

  const deliveries = [];
  const webhookUrl = process.env.ORDER_WEBHOOK_URL;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

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

  const delivered = deliveries.some((item) => item.ok);
  return res.status(200).json({ ok: true, orderId, delivered });
};
