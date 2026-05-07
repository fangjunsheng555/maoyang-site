const crypto = require('crypto');
const { envFirst } = require('./maoyang-store.js');

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const NEW_USER_BONUS = Number(process.env.NEW_USER_BONUS || process.env.MAOYANG_NEW_USER_BONUS || 8.88);

function clean(value, limit = 500) { return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit); }
function normalizeEmail(value) { return clean(value, 200).toLowerCase(); }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim()); }
function validPassword(value) { return String(value || '').length >= 6; }
function roundMoney(value) { return Math.round(Number(value || 0) * 100) / 100; }
function pad2(v) { return String(v).padStart(2, '0'); }
function formatBeijingTime(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  const ts = Number.isNaN(d.getTime()) ? Date.now() : d.getTime();
  const b = new Date(ts + 8 * 60 * 60 * 1000);
  return [b.getUTCFullYear(), pad2(b.getUTCMonth() + 1), pad2(b.getUTCDate())].join('-') + ' ' + [pad2(b.getUTCHours()), pad2(b.getUTCMinutes()), pad2(b.getUTCSeconds())].join(':') + ' 北京时间 (UTC+8)';
}
function base64url(input) { return Buffer.from(input).toString('base64url'); }
function tokenSecret() { return envFirst('AUTH_SECRET', 'MAOYANG_AUTH_SECRET', 'SESSION_SECRET', 'ADMIN_KEY', 'MAOYANG_ADMIN_KEY') || 'maoyang-site-local-session-secret'; }
function sign(value) { return crypto.createHmac('sha256', tokenSecret()).update(value).digest('base64url'); }
function createToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: user.id, email: normalizeEmail(user.email), iat: now, exp: now + SESSION_TTL_SECONDS };
  const body = base64url(JSON.stringify(payload));
  return body + '.' + sign(body);
}
function verifyToken(token) {
  const parts = clean(token, 4096).split('.');
  if (parts.length !== 2 || sign(parts[0]) !== parts[1]) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!payload || !payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (error) { return null; }
}
function tokenFromRequest(req) {
  const auth = String(req.headers.authorization || '');
  if (/^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, '').trim();
  const cookie = String(req.headers.cookie || '');
  const match = cookie.match(/(?:^|;\s*)maoyang_user=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
function setSessionCookie(res, token) { res.setHeader('Set-Cookie', 'maoyang_user=' + encodeURIComponent(token) + '; Path=/; Max-Age=' + SESSION_TTL_SECONDS + '; HttpOnly; Secure; SameSite=Lax'); }
function clearSessionCookie(res) { res.setHeader('Set-Cookie', 'maoyang_user=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'); }
function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  return s + ':' + crypto.pbkdf2Sync(String(password || ''), s, 120000, 32, 'sha256').toString('hex');
}
function verifyPassword(password, stored) {
  const parts = String(stored || '').split(':');
  if (parts.length !== 2) return false;
  const next = hashPassword(password, parts[0]).split(':')[1];
  try { return crypto.timingSafeEqual(Buffer.from(next, 'hex'), Buffer.from(parts[1], 'hex')); } catch (error) { return false; }
}
function codeHash(code) { return crypto.createHash('sha256').update(String(code || '') + ':' + tokenSecret()).digest('hex'); }
function randomId(prefix) { return prefix + Date.now().toString(36).toUpperCase() + crypto.randomBytes(3).toString('hex').toUpperCase(); }
function newLedger(type, amount, balanceAfter, note) {
  const now = new Date();
  return { id: randomId('L'), type, amount: roundMoney(amount), balanceAfter: roundMoney(balanceAfter), note: clean(note, 240), createdAt: now.toISOString(), createdAtBeijing: formatBeijingTime(now) };
}
function newCoupon(type, amount, note) {
  const now = new Date();
  return {
    id: randomId('CP'),
    type: clean(type || 'new_user', 40),
    amount: roundMoney(amount),
    status: 'active',
    note: clean(note || '', 240),
    createdAt: now.toISOString(),
    createdAtBeijing: formatBeijingTime(now)
  };
}
function couponsOf(user) {
  user.coupons = Array.isArray(user.coupons) ? user.coupons : [];
  return user.coupons;
}
function activeCoupons(user) {
  return couponsOf(user).filter((coupon) => coupon && (coupon.status || 'active') === 'active' && roundMoney(coupon.amount) > 0);
}
function grantNewUserBonus(user) {
  const bonus = roundMoney(NEW_USER_BONUS);
  if (bonus <= 0 || user.bonusGranted) return user;
  user.bonusGranted = true;
  couponsOf(user).unshift(newCoupon('new_user', bonus, '新用户注册优惠券'));
  user.coupons = user.coupons.slice(0, 20);
  return user;
}
function publicUser(user) {
  if (!user) return null;
  const coupons = Array.isArray(user.coupons) ? user.coupons : [];
  return {
    id: user.id || '', email: user.email || '', name: user.name || '', avatar: user.avatar || '',
    balance: roundMoney(user.balance || 0), status: user.status || 'active', provider: user.provider || (user.googleSub ? 'google' : 'password'),
    googleLinked: !!user.googleSub, bonusGranted: !!user.bonusGranted, createdAt: user.createdAt || '', createdAtBeijing: user.createdAtBeijing || '',
    lastLoginAt: user.lastLoginAt || '',
    coupons: coupons.filter((coupon) => coupon && (coupon.status || 'active') === 'active').slice(0, 10),
    ledger: Array.isArray(user.ledger) ? user.ledger.slice(0, 20) : []
  };
}
function adminPublicUser(user) {
  const out = publicUser(user);
  if (!out) return null;
  out.hasPassword = !!user.passwordHash;
  out.withdrawAccount = user.withdrawAccount || '';
  out.adminNote = user.adminNote || '';
  out.coupons = Array.isArray(user.coupons) ? user.coupons.slice(0, 50) : [];
  out.ledger = Array.isArray(user.ledger) ? user.ledger.slice(0, 80) : [];
  return out;
}
function findUserByEmail(users, email) { const target = normalizeEmail(email); return users.find((user) => normalizeEmail(user.email) === target) || null; }
function findUserById(users, id) { const target = clean(id, 80); return users.find((user) => clean(user.id, 80) === target) || null; }
function currentUser(req, users) {
  const payload = verifyToken(tokenFromRequest(req));
  if (!payload) return null;
  const user = findUserById(users, payload.sub);
  if (!user || (user.status && user.status !== 'active')) return null;
  return user;
}
function attachSession(res, user) {
  const token = createToken(user);
  setSessionCookie(res, token);
  return { token, user: publicUser(user) };
}

module.exports = {
  NEW_USER_BONUS, SESSION_TTL_SECONDS, clean, normalizeEmail, validEmail, validPassword, roundMoney, formatBeijingTime,
  createToken, verifyToken, tokenFromRequest, setSessionCookie, clearSessionCookie,
  hashPassword, verifyPassword, codeHash, randomId, newLedger, newCoupon, couponsOf, activeCoupons, grantNewUserBonus, publicUser, adminPublicUser,
  findUserByEmail, findUserById, currentUser, attachSession
};
