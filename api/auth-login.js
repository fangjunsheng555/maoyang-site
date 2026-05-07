const { redisConfig, readUsers, writeUsers } = require('../lib/maoyang-store.js');
const { normalizeEmail, validEmail, verifyPassword, findUserByEmail, formatBeijingTime, attachSession } = require('../lib/maoyang-auth.js');
function parseBody(req){ const body=req.body||{}; if(typeof body==='string'){ try{return JSON.parse(body);}catch(e){return{};} } return body; }
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok:false, error:'method_not_allowed' }); }
  const redis = redisConfig(); if(!redis) return res.status(503).json({ ok:false, error:'storage_not_configured' });
  const body = parseBody(req), email = normalizeEmail(body.email), password = String(body.password || '');
  if(!validEmail(email)) return res.status(400).json({ ok:false, error:'invalid_email' });
  try{
    const users = await readUsers(redis);
    const user = findUserByEmail(users, email);
    if(!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) return res.status(401).json({ ok:false, error:'invalid_credentials' });
    if(user.status && user.status !== 'active') return res.status(403).json({ ok:false, error:'account_disabled' });
    const now = new Date(); user.lastLoginAt = now.toISOString(); user.lastLoginAtBeijing = formatBeijingTime(now);
    await writeUsers(redis, users);
    return res.status(200).json({ ok:true, ...attachSession(res, user) });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
