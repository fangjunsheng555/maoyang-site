const { redisConfig, readUsers, writeUsers } = require('./lib/maoyang-store.js');
const { normalizeEmail, validEmail, validPassword, hashPassword, codeHash, findUserByEmail, formatBeijingTime, attachSession } = require('./lib/maoyang-auth.js');
function parseBody(req){ const body=req.body||{}; if(typeof body==='string'){ try{return JSON.parse(body);}catch(e){return{};} } return body; }
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok:false, error:'method_not_allowed' }); }
  const redis = redisConfig(); if(!redis) return res.status(503).json({ ok:false, error:'storage_not_configured' });
  const body = parseBody(req), email = normalizeEmail(body.email), code = String(body.code || '').replace(/\D/g, '').slice(0, 6), password = String(body.password || '');
  if(!validEmail(email)) return res.status(400).json({ ok:false, error:'invalid_email' });
  if(!/^\d{6}$/.test(code)) return res.status(400).json({ ok:false, error:'invalid_code' });
  if(!validPassword(password)) return res.status(400).json({ ok:false, error:'weak_password' });
  try{
    const users = await readUsers(redis);
    const user = findUserByEmail(users, email);
    if(!user) return res.status(404).json({ ok:false, error:'user_not_found' });
    if(!user.resetCodeHash || user.resetCodeHash !== codeHash(code)) return res.status(400).json({ ok:false, error:'code_mismatch' });
    if(!user.resetCodeExpiresAt || new Date(user.resetCodeExpiresAt).getTime() < Date.now()) return res.status(400).json({ ok:false, error:'code_expired' });
    const now = new Date();
    user.passwordHash = hashPassword(password);
    user.provider = 'password';
    user.resetCodeHash = '';
    user.resetCodeExpiresAt = '';
    user.passwordResetAt = now.toISOString();
    user.passwordResetAtBeijing = formatBeijingTime(now);
    user.lastLoginAt = now.toISOString();
    user.lastLoginAtBeijing = formatBeijingTime(now);
    await writeUsers(redis, users);
    return res.status(200).json({ ok:true, ...attachSession(res, user) });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
