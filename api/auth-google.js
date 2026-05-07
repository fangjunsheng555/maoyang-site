const { redisConfig, readUsers, writeUsers } = require('../lib/maoyang-store.js');
const { clean, normalizeEmail, randomId, formatBeijingTime, grantNewUserBonus, findUserByEmail, attachSession } = require('../lib/maoyang-auth.js');
function parseBody(req){ const body=req.body||{}; if(typeof body==='string'){ try{return JSON.parse(body);}catch(e){return{};} } return body; }
async function verifyGoogleCredential(credential) {
  const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.MAOYANG_GOOGLE_CLIENT_ID || '';
  if(!expectedClientId) throw new Error('google_client_not_configured');
  const response = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential));
  const info = await response.json();
  if(!response.ok || info.error) throw new Error('google_verify_failed');
  if(info.aud !== expectedClientId) throw new Error('google_audience_mismatch');
  if(String(info.email_verified) !== 'true') throw new Error('google_email_not_verified');
  return info;
}
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok:false, error:'method_not_allowed' }); }
  const redis = redisConfig(); if(!redis) return res.status(503).json({ ok:false, error:'storage_not_configured' });
  const credential = clean(parseBody(req).credential, 6000);
  if(!credential) return res.status(400).json({ ok:false, error:'missing_google_credential' });
  try{
    const info = await verifyGoogleCredential(credential);
    const email = normalizeEmail(info.email);
    const users = await readUsers(redis);
    let user = users.find((item)=>item.googleSub && item.googleSub === info.sub) || findUserByEmail(users, email);
    let isNewUser = false;
    const now = new Date();
    if(!user){
      isNewUser = true;
      user = grantNewUserBonus({ id:randomId('U'), email, name:clean(info.name || email.split('@')[0], 80), avatar:clean(info.picture || '', 500), provider:'google', googleSub:info.sub, balance:0, status:'active', ledger:[], createdAt:now.toISOString(), createdAtBeijing:formatBeijingTime(now) });
      users.unshift(user);
    }else{
      user.googleSub = user.googleSub || info.sub;
      user.provider = user.passwordHash ? 'password' : 'google';
      user.name = user.name || clean(info.name || '', 80);
      user.avatar = user.avatar || clean(info.picture || '', 500);
    }
    if(user.status && user.status !== 'active') return res.status(403).json({ ok:false, error:'account_disabled' });
    user.lastLoginAt = now.toISOString(); user.lastLoginAtBeijing = formatBeijingTime(now);
    await writeUsers(redis, users.slice(0, 1000));
    return res.status(200).json({ ok:true, ...attachSession(res, user), isNewUser });
  }catch(error){ return res.status(400).json({ ok:false, error:error.message || 'google_login_failed' }); }
};
