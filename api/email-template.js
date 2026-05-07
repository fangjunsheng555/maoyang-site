function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const DEFAULT_SUPPORT_CONTACT = 'QQ：2802632995\nWhatsApp：+1 4315093334\nTelegram：@MaoyangSupport';

function supportContactLines(value) {
  return String(value || DEFAULT_SUPPORT_CONTACT)
    .split(/\s*(?:\/|\r?\n)\s*/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function supportContactHtml(value) {
  return supportContactLines(value).map(escapeHtml).join('<br>');
}

function supportContactText(value) {
  return supportContactLines(value).join('\n');
}

function money(value) {
  return '¥' + Number(value || 0).toFixed(0);
}

function buildOrderEmailHtml({ order, brandName, siteDomain, siteUrl, supportContact, usdtRate }) {
  const isUsdt = order.paymentMethod === 'usdt';
  const isRedeem = order.paymentMethod === 'redeem_code';
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
  const itemCount = items.length;
  const isCart = itemCount > 1;
  const orderQueryUrl = (siteUrl || ('https://' + (siteDomain || ''))) + '/?order=' + encodeURIComponent(order.orderId);

  const itemsRows = items.map((it, idx) => {
    const accountRow = it.account
      ? '<div style="margin-top:6px;font-size:12px;color:#475569;line-height:1.65;">' +
          '<span style="color:#94a3b8;">' + (it.service === 'network' ? '订阅名' : '账号') + '：</span>' +
          '<span style="font-family:ui-monospace,Menlo,Consolas,monospace;color:#0f172a;font-weight:600;">' + escapeHtml(it.account) + '</span>' +
        '</div>'
      : '';
    const passwordRow = it.password
      ? '<div style="font-size:12px;color:#475569;line-height:1.65;">' +
          '<span style="color:#94a3b8;">密码：</span>' +
          '<span style="font-family:ui-monospace,Menlo,Consolas,monospace;color:#0f172a;font-weight:600;">' + escapeHtml(it.password) + '</span>' +
        '</div>'
      : '';
    const subRows = it.subscriptionLinks
      ? '<div style="margin-top:8px;padding:10px 12px;background:#f0fdfa;border-radius:10px;border:1px solid #a7f3d0;">' +
          '<div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#0f766e;margin-bottom:6px;">订阅链接</div>' +
          '<div style="margin-bottom:6px;">' +
            '<div style="font-size:11px;color:#0f766e;font-weight:700;">Shadowrocket 订阅</div>' +
            '<a href="' + escapeHtml(it.subscriptionLinks.shadowrocket) + '" style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;color:#134e4a;word-break:break-all;text-decoration:underline;">' + escapeHtml(it.subscriptionLinks.shadowrocket) + '</a>' +
          '</div>' +
          '<div>' +
            '<div style="font-size:11px;color:#0f766e;font-weight:700;">Clash 订阅</div>' +
            '<a href="' + escapeHtml(it.subscriptionLinks.clash) + '" style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;color:#134e4a;word-break:break-all;text-decoration:underline;">' + escapeHtml(it.subscriptionLinks.clash) + '</a>' +
          '</div>' +
        '</div>'
      : '';
    return (
      '<tr><td style="padding:14px 0;border-bottom:' + (idx === items.length - 1 ? '0' : '1px solid #f1f5f9') + ';">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
          '<td style="vertical-align:top;">' +
            '<div style="color:#0f172a;font-size:14.5px;font-weight:800;letter-spacing:-0.01em;">' +
              escapeHtml(it.label) +
              '<span style="display:inline-block;margin-left:6px;padding:2px 8px;border-radius:999px;background:#f0fdfa;color:#0f766e;font-size:10.5px;font-weight:700;">' + escapeHtml(it.cycle || '1年') + '</span>' +
            '</div>' +
            accountRow + passwordRow + subRows +
          '</td>' +
          '<td style="vertical-align:top;text-align:right;color:#0f172a;font-size:14px;font-weight:700;white-space:nowrap;">' + money(it.amount) + '</td>' +
        '</tr></table>' +
      '</td></tr>'
    );
  }).join('');

  const paidValue = isRedeem
    ? '¥0'
    : isUsdt
    ? ((order.paidAmount || order.finalUsdt) + ' <span style="font-size:18px;color:#0f766e;font-weight:800;">USDT</span>')
    : money(order.paidAmount || order.finalAmount);
  const paidNote = isRedeem ? '已通过商品兑换码抵扣，无需付款' : (isUsdt ? '已通过 USDT-TRC20 网络支付（已享 9 折）' : '已通过支付宝担保支付');

  return (
    '<!DOCTYPE html><html lang="zh-CN"><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>订单确认 - ' + escapeHtml(brandName) + '</title></head>' +
    '<body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,\'PingFang SC\',\'Microsoft YaHei\',sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">' +
      '<div style="display:none;max-height:0;overflow:hidden;">' + escapeHtml(brandName) + ' 订单 ' + escapeHtml(order.orderId) + ' · 实付 ' + (isUsdt ? (order.paidAmount + ' USDT') : ('¥' + order.finalAmount)) + ' · 客服将在 30 分钟内为您开通</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6fb;padding:32px 12px;"><tr><td align="center">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:20px;box-shadow:0 8px 32px rgba(15,23,42,0.06);overflow:hidden;">' +
          // Header
          '<tr><td style="padding:26px 28px 18px;background:linear-gradient(135deg,#0f172a 0%,#0f766e 100%);">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
              '<td style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.02em;">' + escapeHtml(brandName) + '</td>' +
              '<td style="text-align:right;color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">Order Confirmation</td>' +
            '</tr></table>' +
          '</td></tr>' +
          // Success badge
          '<tr><td style="padding:32px 28px 12px;text-align:center;">' +
            '<div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;background:linear-gradient(135deg,#d1fae5,#a7f3d0);margin-bottom:14px;">' +
              '<span style="font-size:32px;color:#047857;">✓</span>' +
            '</div>' +
            '<h1 style="margin:0 0 6px;font-size:22px;font-weight:900;letter-spacing:-0.03em;color:#0f172a;">订单已收到</h1>' +
            '<p style="margin:0;color:#64748b;font-size:13.5px;line-height:1.6;">客服将在 <strong style="color:#0f172a;">10 分钟内</strong> 处理您的订单<br>请保持邮箱及联系方式畅通</p>' +
          '</td></tr>' +
          // Order ID + paid
          '<tr><td style="padding:18px 28px 0;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;"><tr>' +
              '<td style="padding:14px 16px;">' +
                '<div style="font-size:11px;color:#94a3b8;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">订单号（点击查询）</div>' +
                '<a href="' + escapeHtml(orderQueryUrl) + '" style="display:inline-block;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;font-weight:700;color:#0f766e;margin-top:2px;letter-spacing:-0.01em;text-decoration:underline;">' + escapeHtml(order.orderId) + '</a>' +
              '</td>' +
              '<td style="padding:14px 16px;text-align:right;border-left:1px solid #e2e8f0;">' +
                '<div style="font-size:11px;color:#94a3b8;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">实付金额</div>' +
                '<div style="font-size:20px;font-weight:900;color:#134e4a;margin-top:2px;letter-spacing:-0.02em;">' + paidValue + '</div>' +
              '</td>' +
            '</tr></table>' +
            '<div style="margin-top:8px;font-size:11.5px;color:#0f766e;font-weight:600;text-align:center;">' + escapeHtml(paidNote) + '</div>' +
          '</td></tr>' +
          // Items
          '<tr><td style="padding:24px 28px 0;">' +
            '<div style="font-size:11px;color:#94a3b8;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:6px;">' + (isCart ? ('订单明细 · ' + itemCount + ' 件') : '订单明细') + '</div>' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + itemsRows + '</table>' +
          '</td></tr>' +
          // Price summary
          '<tr><td style="padding:18px 28px 0;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">' +
              (isCart ? (
                '<tr><td style="padding:10px 16px 4px;color:#64748b;font-size:13px;">商品总价</td>' +
                '<td style="padding:10px 16px 4px;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">' + money(order.subtotal) + '</td></tr>'
              ) : '') +
              (isCart && order.discountRate > 0 ? (
                '<tr><td style="padding:4px 16px;color:#d97706;font-size:13px;">组合优惠 · ' + escapeHtml(order.discountLabel || '') + '</td>' +
                '<td style="padding:4px 16px;color:#d97706;font-size:13px;font-weight:600;text-align:right;">−' + money(order.subtotal - (order.baseFinalAmount || order.finalAmount)) + '</td></tr>'
              ) : '') +
              (order.couponDeduction > 0 ? (
                '<tr><td style="padding:4px 16px;color:#0f766e;font-size:13px;">优惠券抵扣</td>' +
                '<td style="padding:4px 16px;color:#0f766e;font-size:13px;font-weight:600;text-align:right;">−' + money(order.couponDeduction) + '</td></tr>'
              ) : '') +
              (order.walletDeduction > 0 ? (
                '<tr><td style="padding:4px 16px;color:#0f766e;font-size:13px;">账户立减</td>' +
                '<td style="padding:4px 16px;color:#0f766e;font-size:13px;font-weight:600;text-align:right;">−' + money(order.walletDeduction) + '</td></tr>'
              ) : '') +
              (isUsdt ? (
                '<tr><td style="padding:4px 16px;color:#64748b;font-size:13px;">折后人民币</td>' +
                '<td style="padding:4px 16px;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">' + money(order.finalAmount) + '</td></tr>' +
                '<tr><td style="padding:4px 16px;color:#64748b;font-size:13px;">USDT 9 折 ÷ ' + (usdtRate || 6.85) + '</td>' +
                '<td style="padding:4px 16px;color:#0f172a;font-size:13px;font-weight:600;text-align:right;">→ ' + order.paidAmount + ' USDT</td></tr>'
              ) : '') +
              '<tr><td style="padding:10px 16px 12px;border-top:1px dashed #cbd5e1;color:#0f172a;font-size:14px;font-weight:800;">' + (isUsdt ? '实付（USDT）' : '实付总额') + '</td>' +
              '<td style="padding:10px 16px 12px;border-top:1px dashed #cbd5e1;color:#134e4a;font-size:18px;font-weight:900;text-align:right;letter-spacing:-0.02em;">' + paidValue + '</td></tr>' +
            '</table>' +
          '</td></tr>' +
          // Contact recap
          '<tr><td style="padding:24px 28px 0;">' +
            '<div style="font-size:11px;color:#94a3b8;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:6px;">您填写的联系方式</div>' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
              '<tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:80px;">邮箱</td>' +
              '<td style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:600;">' + escapeHtml(order.email || '') + '</td></tr>' +
              '<tr><td style="padding:6px 0;color:#64748b;font-size:13px;">联系方式</td>' +
              '<td style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:600;">' + escapeHtml(order.contact || '') + '</td></tr>' +
            '</table>' +
          '</td></tr>' +
          // Next steps
          '<tr><td style="padding:24px 28px 0;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:14px;background:linear-gradient(135deg,#f0fdfa,#ecfeff);border:1px solid #a7f3d0;">' +
              '<tr><td style="padding:16px 18px;">' +
                '<div style="font-size:13px;font-weight:800;color:#0f766e;margin-bottom:8px;">接下来：</div>' +
                '<ol style="margin:0;padding-left:18px;color:#134e4a;font-size:13px;line-height:1.85;">' +
                  '<li>客服将在 10 分钟内核对您的订单</li>' +
                  '<li>核对成功后通过您填写的联系方式开通服务</li>' +
                  '<li>可点击订单号或访问 <a href="' + escapeHtml(siteUrl || ('https://' + siteDomain)) + '" style="color:#0f766e;font-weight:700;">' + escapeHtml(siteDomain || '') + '</a> 查询订单</li>' +
                '</ol>' +
              '</td></tr>' +
            '</table>' +
          '</td></tr>' +
          // Support
          '<tr><td style="padding:24px 28px 0;">' +
            '<div style="font-size:11px;color:#94a3b8;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:8px;">需要帮助？</div>' +
            '<p style="margin:0;font-size:13px;line-height:1.75;color:#475569;">' + supportContactHtml(supportContact) + '</p>' +
            '<p style="margin:8px 0 0;font-size:12.5px;color:#94a3b8;">客服在线时间：北京时间 09:00 – 23:00 · 真人值守</p>' +
          '</td></tr>' +
          // Footer
          '<tr><td style="padding:28px 28px 30px;">' +
            '<hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 18px;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
              '<td style="color:#0f172a;font-size:13px;font-weight:800;letter-spacing:-0.01em;">' + escapeHtml(brandName) + '</td>' +
              '<td style="text-align:right;color:#94a3b8;font-size:11.5px;">' + escapeHtml(siteDomain || '') + '</td>' +
            '</tr></table>' +
            '<p style="margin:10px 0 0;font-size:11px;color:#cbd5e1;line-height:1.6;">本邮件由系统自动发送，请勿直接回复<br>订单时间：' + escapeHtml(order.createdAtBeijing || '') + '</p>' +
          '</td></tr>' +
        '</table>' +
      '</td></tr></table>' +
    '</body></html>'
  );
}

function buildOrderEmailText({ order, brandName, siteDomain, siteUrl, supportContact, usdtRate }) {
  const isUsdt = order.paymentMethod === 'usdt';
  const isRedeem = order.paymentMethod === 'redeem_code';
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
  const isCart = items.length > 1;
  const queryUrl = (siteUrl || ('https://' + (siteDomain || ''))) + '/?order=' + encodeURIComponent(order.orderId);
  const lines = [
    brandName + ' - 订单确认',
    '===========================',
    '订单号: ' + order.orderId,
    '查询: ' + queryUrl,
    '时间: ' + (order.createdAtBeijing || ''),
    '',
    '订单明细 (' + items.length + ' 件):'
  ];
  items.forEach((it) => {
    lines.push('  · ' + (it.label || it.service) + ' (' + (it.cycle || '1年') + ') ¥' + (it.amount || 0));
    if (it.account) lines.push('      ' + (it.service === 'network' ? '订阅名' : '账号') + ': ' + it.account);
    if (it.password) lines.push('      密码: ' + it.password);
    if (it.subscriptionLinks) {
      lines.push('      Shadowrocket: ' + it.subscriptionLinks.shadowrocket);
      lines.push('      Clash: ' + it.subscriptionLinks.clash);
    }
  });
  if (isCart) {
    lines.push('', '商品总价: ¥' + order.subtotal);
    if (order.discountRate > 0) {
      lines.push('组合优惠 ' + order.discountLabel + ': −¥' + (order.subtotal - (order.baseFinalAmount || order.finalAmount)));
    }
  }
  if (order.couponDeduction > 0) lines.push('优惠券抵扣: −¥' + order.couponDeduction);
  if (order.walletDeduction > 0) lines.push('账户立减: −¥' + order.walletDeduction);
  if (isUsdt) {
    lines.push('折后人民币: ¥' + order.finalAmount);
    lines.push('实付: ' + order.paidAmount + ' USDT (× 0.9 ÷ ' + (usdtRate || 6.85) + ')');
  } else if (isRedeem) {
    lines.push('实付: ¥0（商品兑换码）');
  } else {
    lines.push('实付: ¥' + order.finalAmount);
  }
  lines.push('', '客服将在 30 分钟内处理您的订单', '查询订单请访问: ' + queryUrl, '', '联系方式:', supportContactText(supportContact));
  return lines.join('\n');
}

function buildFulfillmentEmailHtml({ order, brandName, siteDomain, siteUrl, supportContact }) {
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
  const orderQueryUrl = (siteUrl || ('https://' + (siteDomain || ''))) + '/?order=' + encodeURIComponent(order.orderId);

  const itemRows = items.map((it, idx) => {
    const accessRows = [];
    if (it.account) {
      accessRows.push(
        '<div style="display:flex;gap:10px;align-items:flex-start;margin-top:8px;">' +
          '<span style="min-width:54px;color:#64748b;font-size:12px;font-weight:700;">' + (it.service === 'network' ? '订阅名' : '账号') + '</span>' +
          '<code style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#0f172a;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:5px 8px;word-break:break-all;">' + escapeHtml(it.account) + '</code>' +
        '</div>'
      );
    }
    if (it.password) {
      accessRows.push(
        '<div style="display:flex;gap:10px;align-items:flex-start;margin-top:6px;">' +
          '<span style="min-width:54px;color:#64748b;font-size:12px;font-weight:700;">密码</span>' +
          '<code style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#0f172a;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:5px 8px;word-break:break-all;">' + escapeHtml(it.password) + '</code>' +
        '</div>'
      );
    }
    if (it.subscriptionLinks) {
      accessRows.push(
        '<div style="margin-top:10px;padding:11px 12px;border-radius:12px;background:#f0fdfa;border:1px solid #a7f3d0;">' +
          '<div style="font-size:11px;font-weight:900;color:#0f766e;margin-bottom:8px;">网络节点订阅链接</div>' +
          '<div style="font-size:11px;color:#0f766e;font-weight:800;">Shadowrocket</div>' +
          '<a href="' + escapeHtml(it.subscriptionLinks.shadowrocket) + '" style="display:block;margin-bottom:8px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;color:#134e4a;word-break:break-all;text-decoration:underline;">' + escapeHtml(it.subscriptionLinks.shadowrocket) + '</a>' +
          '<div style="font-size:11px;color:#0f766e;font-weight:800;">Clash</div>' +
          '<a href="' + escapeHtml(it.subscriptionLinks.clash) + '" style="display:block;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;color:#134e4a;word-break:break-all;text-decoration:underline;">' + escapeHtml(it.subscriptionLinks.clash) + '</a>' +
        '</div>'
      );
    }
    if (it.fulfillmentNote) {
      accessRows.push('<p style="margin:10px 0 0;color:#475569;font-size:12.5px;line-height:1.7;">' + escapeHtml(it.fulfillmentNote) + '</p>');
    }
    const accessHtml = accessRows.length
      ? accessRows.join('')
      : '<p style="margin:8px 0 0;color:#64748b;font-size:12.5px;line-height:1.7;">该服务已按订单信息处理完成</p>';

    return (
      '<tr><td style="padding:16px 0;border-bottom:' + (idx === items.length - 1 ? '0' : '1px solid #f1f5f9') + ';">' +
        '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">' +
          '<div style="min-width:0;">' +
            '<div style="font-size:15px;font-weight:900;color:#0f172a;letter-spacing:-0.01em;">' + escapeHtml(it.label || it.service) + '</div>' +
            '<div style="margin-top:2px;font-size:12px;color:#94a3b8;font-weight:700;">' + escapeHtml(it.cycle || '') + '</div>' +
          '</div>' +
          '<div style="white-space:nowrap;color:#0f766e;font-weight:900;font-size:14px;">已开通</div>' +
        '</div>' +
        accessHtml +
      '</td></tr>'
    );
  }).join('');

  const note = order.fulfillmentNote
    ? '<tr><td style="padding:18px 28px 0;"><div style="border-radius:14px;background:#fff7ed;border:1px solid #fed7aa;padding:13px 15px;color:#9a3412;font-size:13px;line-height:1.75;"><strong>开通备注：</strong>' + escapeHtml(order.fulfillmentNote) + '</div></td></tr>'
    : '';

  return (
    '<!DOCTYPE html><html lang="zh-CN"><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>服务已开通 - ' + escapeHtml(brandName) + '</title></head>' +
    '<body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,\'PingFang SC\',\'Microsoft YaHei\',sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">' +
      '<div style="display:none;max-height:0;overflow:hidden;">您的订单 ' + escapeHtml(order.orderId) + ' 已完成充值，请查看账号、密码或订阅链接</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6fb;padding:32px 12px;"><tr><td align="center">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:20px;box-shadow:0 8px 32px rgba(15,23,42,0.06);overflow:hidden;">' +
          '<tr><td style="padding:26px 28px 18px;background:linear-gradient(135deg,#0f172a 0%,#0f766e 100%);">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
              '<td style="color:#ffffff;font-size:18px;font-weight:900;">' + escapeHtml(brandName) + '</td>' +
              '<td style="text-align:right;color:rgba(255,255,255,0.72);font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;">Fulfilled</td>' +
            '</tr></table>' +
          '</td></tr>' +
          '<tr><td style="padding:32px 28px 12px;text-align:center;">' +
            '<div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;background:linear-gradient(135deg,#d1fae5,#a7f3d0);margin-bottom:14px;"><span style="font-size:32px;color:#047857;">✓</span></div>' +
            '<h1 style="margin:0 0 6px;font-size:22px;font-weight:950;letter-spacing:-0.03em;color:#0f172a;">服务已开通</h1>' +
            '<p style="margin:0;color:#64748b;font-size:13.5px;line-height:1.65;">订单已完成充值，下面是您的服务信息<br>请妥善保存，不要公开分享</p>' +
          '</td></tr>' +
          '<tr><td style="padding:18px 28px 0;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;"><tr>' +
              '<td style="padding:14px 16px;">' +
                '<div style="font-size:11px;color:#94a3b8;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">订单号</div>' +
                '<a href="' + escapeHtml(orderQueryUrl) + '" style="display:inline-block;margin-top:2px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;font-weight:800;color:#0f766e;text-decoration:underline;">' + escapeHtml(order.orderId) + '</a>' +
              '</td>' +
              '<td style="padding:14px 16px;text-align:right;border-left:1px solid #e2e8f0;">' +
                '<div style="font-size:11px;color:#94a3b8;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">完成时间</div>' +
                '<div style="margin-top:2px;font-size:12.5px;font-weight:800;color:#0f172a;">' + escapeHtml(order.completedAtBeijing || order.updatedAtBeijing || '') + '</div>' +
              '</td>' +
            '</tr></table>' +
          '</td></tr>' +
          '<tr><td style="padding:24px 28px 0;">' +
            '<div style="font-size:11px;color:#94a3b8;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:6px;">服务信息</div>' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' + itemRows + '</table>' +
          '</td></tr>' +
          note +
          '<tr><td style="padding:24px 28px 0;">' +
            '<div style="border-radius:14px;background:#f0fdfa;border:1px solid #a7f3d0;padding:14px 16px;color:#134e4a;font-size:13px;line-height:1.75;">如遇登录、订阅等问题，请联系在线客服<div style="margin-top:8px;font-weight:700;">' + supportContactHtml(supportContact) + '</div></div>' +
          '</td></tr>' +
          '<tr><td style="padding:28px 28px 30px;">' +
            '<hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 18px;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
              '<td style="color:#0f172a;font-size:13px;font-weight:900;">' + escapeHtml(brandName) + '</td>' +
              '<td style="text-align:right;color:#94a3b8;font-size:11.5px;">' + escapeHtml(siteDomain || '') + '</td>' +
            '</tr></table>' +
            '<p style="margin:10px 0 0;font-size:11px;color:#cbd5e1;line-height:1.6;">本邮件由系统自动发送，请勿直接回复</p>' +
          '</td></tr>' +
        '</table>' +
      '</td></tr></table>' +
    '</body></html>'
  );
}

function buildFulfillmentEmailText({ order, brandName, siteDomain, siteUrl, supportContact }) {
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
  const queryUrl = (siteUrl || ('https://' + (siteDomain || ''))) + '/?order=' + encodeURIComponent(order.orderId);
  const lines = [
    brandName + ' - 服务已开通',
    '===========================',
    '订单号: ' + order.orderId,
    '查询: ' + queryUrl,
    '完成时间: ' + (order.completedAtBeijing || order.updatedAtBeijing || ''),
    '',
    '服务信息:'
  ];
  items.forEach((it) => {
    lines.push('  · ' + (it.label || it.service) + ' (' + (it.cycle || '') + ')');
    if (it.account) lines.push('      ' + (it.service === 'network' ? '订阅名' : '账号') + ': ' + it.account);
    if (it.password) lines.push('      密码: ' + it.password);
    if (it.subscriptionLinks) {
      lines.push('      Shadowrocket: ' + it.subscriptionLinks.shadowrocket);
      lines.push('      Clash: ' + it.subscriptionLinks.clash);
    }
    if (it.fulfillmentNote) lines.push('      备注: ' + it.fulfillmentNote);
  });
  if (order.fulfillmentNote) lines.push('', '开通备注: ' + order.fulfillmentNote);
  lines.push('', '如遇问题，请带上订单号联系在线客服', supportContactText(supportContact), siteDomain || '');
  return lines.join('\n');
}

module.exports = {
  buildOrderEmailHtml,
  buildOrderEmailText,
  buildFulfillmentEmailHtml,
  buildFulfillmentEmailText
};
