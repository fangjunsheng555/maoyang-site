const crypto = require('crypto');
const { redisConfig, readUsers, writeUsers } = require('./lib/maoyang-store.js');
const { normalizeEmail, validEmail, findUserByEmail, codeHash, formatBeijingTime } = require('./lib/maoyang-auth.js');
const { sendVerifyCodeEmail } = require('./lib/maoyang-mail.js');
function parseBody(req){ const body=req.body||{}; if(typeof body==='string'){ try{return JSON.parse(body);}catch(e){return{};} } return body; }
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok:false, error:'method_not_allowed' }); }
  const redis = redisConfig(); if(!redis) return res.status(503).json({ ok:false, error:'storage_not_configured' });
  const email = normalizeEmail(parseBody(req).email);
  if(!validEmail(email)) return res.status(400).json({ ok:false, error:'invalid_email' });
  try{
    const users = await readUsers(redis);
    const user = findUserByEmail(users, email);
    if(!user) return res.status(404).json({ ok:false, error:'user_not_found' });
    const code = String(crypto.randomInt(100000, 1000000));
    const now = new Date();
    user.resetCodeHash = codeHash(code);
    user.resetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    user.resetCodeSentAt = now.toISOString();
    user.resetCodeSentAtBeijing = formatBeijingTime(now);
    await writeUsers(redis, users);
    const mail = await sendVerifyCodeEmail({ to:email, code, purpose:'reset' });
    if(!mail.ok) return res.status(502).json({ ok:false, error:mail.reason || 'mail_failed', mail });
    return res.status(200).json({ ok:true });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
