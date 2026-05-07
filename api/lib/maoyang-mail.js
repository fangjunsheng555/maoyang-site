const BRAND_NAME = process.env.BRAND_NAME || '冒央会社';
const SITE_DOMAIN = process.env.SITE_DOMAIN || 'joinvip.vip';

async function sendMail({ to, subject, text, html }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  if (!host || !user || !pass || !from) return { ok: false, reason: 'smtp_env_missing' };
  if (!to) return { ok: false, reason: 'mail_to_missing' };
  let nodemailer;
  try { nodemailer = require('nodemailer'); } catch (error) { return { ok: false, reason: 'nodemailer_missing', error: error.message }; }
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465;
  const transporter = nodemailer.createTransport({
    host, port, secure, auth: { user, pass }, requireTLS: !secure,
    tls: { minVersion: 'TLSv1.2' }, connectionTimeout: 15000, greetingTimeout: 10000, socketTimeout: 20000
  });
  try {
    const info = await transporter.sendMail({ from: '"' + BRAND_NAME + '" <' + from + '>', to, subject, text, html });
    return { ok: true, messageId: info.messageId };
  } catch (error) { return { ok: false, reason: 'send_failed', error: error.message, code: error.code }; }
}

async function sendVerifyCodeEmail({ to, code, purpose }) {
  const label = purpose === 'reset' ? '找回密码' : '账户验证';
  const subject = label + '验证码 · ' + BRAND_NAME;
  const text = [BRAND_NAME + ' ' + label + '验证码', '验证码: ' + code, '有效期: 10 分钟', '', '如果不是你本人操作，请忽略这封邮件。', SITE_DOMAIN].join('\n');
  const html = '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"></head><body style="margin:0;background:#f4f7f5;font-family:-apple-system,BlinkMacSystemFont,\'PingFang SC\',\'Microsoft YaHei\',sans-serif;color:#0f172a;"><div style="max-width:520px;margin:0 auto;padding:28px 14px;"><div style="background:#fff;border:1px solid #d9e3e0;border-radius:16px;overflow:hidden;box-shadow:0 10px 32px rgba(15,23,42,.08);"><div style="padding:22px 24px;background:linear-gradient(135deg,#0f172a,#0f766e);color:#fff;font-size:18px;font-weight:900;">' + BRAND_NAME + '</div><div style="padding:26px 24px;"><div style="color:#0f766e;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;">' + label + '</div><h1 style="margin:8px 0 12px;font-size:22px;line-height:1.25;">请输入验证码完成操作</h1><div style="display:inline-block;margin:6px 0 14px;padding:10px 16px;border-radius:12px;background:#f0fdfa;border:1px solid #a7f3d0;color:#134e4a;font-size:28px;font-weight:950;letter-spacing:.2em;">' + code + '</div><p style="margin:0;color:#64748b;font-size:13px;line-height:1.7;">验证码 10 分钟内有效。如果不是你本人操作，请忽略这封邮件。</p></div></div></div></body></html>';
  return sendMail({ to, subject, text, html });
}

module.exports = { sendMail, sendVerifyCodeEmail };
