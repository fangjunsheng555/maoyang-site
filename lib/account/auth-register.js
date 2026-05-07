const { redisConfig, readUsers, writeUsers } = require('../maoyang-store.js');
const { clean, normalizeEmail, validEmail, validPassword, hashPassword, randomId, formatBeijingTime, grantNewUserBonus, findUserByEmail, attachSession } = require('../maoyang-auth.js');
function parseBody(req){ const body=req.body||{}; if(typeof body==='string'){ try{return JSON.parse(body);}catch(e){return{};} } return body; }
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok:false, error:'method_not_allowed' }); }
  const redis = redisConfig(); if(!redis) return res.status(503).json({ ok:false, error:'storage_not_configured' });
  const body = parseBody(req);
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  const name = clean(body.name || email.split('@')[0], 60);
  if(!validEmail(email)) return res.status(400).json({ ok:false, error:'invalid_email' });
  if(!validPassword(password)) return res.status(400).json({ ok:false, error:'weak_password' });
  try{
    const users = await readUsers(redis);
    if(findUserByEmail(users, email)) return res.status(409).json({ ok:false, error:'email_exists' });
    const now = new Date();
    const user = grantNewUserBonus({ id:randomId('U'), email, name, provider:'password', passwordHash:hashPassword(password), balance:0, status:'active', ledger:[], createdAt:now.toISOString(), createdAtBeijing:formatBeijingTime(now), lastLoginAt:now.toISOString(), lastLoginAtBeijing:formatBeijingTime(now) });
    users.unshift(user);
    await writeUsers(redis, users.slice(0, 1000));
    return res.status(200).json({ ok:true, ...attachSession(res, user), isNewUser:true });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
