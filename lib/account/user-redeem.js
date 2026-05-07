const { redisConfig, readUsers, readCodes, writeUsersCodes } = require('../maoyang-store.js');
const { clean, currentUser, roundMoney, formatBeijingTime, newLedger } = require('../maoyang-auth.js');

const PRODUCTS = {
  spotify: { service:'spotify', label:'Spotify Premium', amount:128, cycle:'1年' },
  netflix: { service:'netflix', label:'Netflix Premium', amount:168, cycle:'1年' },
  disney:  { service:'disney', label:'Disney+', amount:108, cycle:'1年' },
  hbomax:  { service:'hbomax', label:'HBO Max', amount:148, cycle:'1年' },
  chatgpt: { service:'chatgpt', label:'ChatGPT Plus', amount:75, cycle:'1月' },
  network: { service:'network', label:'网络节点服务', amount:99, cycle:'1年' }
};
function parseBody(req){ const body=req.body||{}; if(typeof body==='string'){ try{return JSON.parse(body);}catch(e){return{};} } return body; }
function normalizeCode(value){ return clean(value, 80).replace(/\s+/g, '').toUpperCase(); }
function codeAvailable(code, user){
  if(!code || code.status === 'disabled') return 'code_disabled';
  if(code.expiresAt && new Date(code.expiresAt).getTime() < Date.now()) return 'code_expired';
  const usedBy = Array.isArray(code.usedBy) ? code.usedBy : [];
  if(usedBy.some((item)=>item && item.userId === user.id)) return 'code_already_used';
  if(usedBy.length >= Math.max(1, Number(code.maxUses || 1))) return 'code_used_up';
  return '';
}
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if(req.method !== 'POST'){ res.setHeader('Allow','POST'); return res.status(405).json({ ok:false, error:'method_not_allowed' }); }
  const redis = redisConfig(); if(!redis) return res.status(503).json({ ok:false, error:'storage_not_configured' });
  const body = parseBody(req), rawCode = normalizeCode(body.code);
  if(!rawCode) return res.status(400).json({ ok:false, error:'missing_code' });
  try{
    const [users, codes] = await Promise.all([readUsers(redis), readCodes(redis)]);
    const user = currentUser(req, users);
    if(!user) return res.status(401).json({ ok:false, error:'unauthorized' });
    const code = codes.find((item)=>normalizeCode(item.code) === rawCode);
    const availability = codeAvailable(code, user);
    if(availability) return res.status(400).json({ ok:false, error:availability });
    if(code.type === 'product'){
      const service = clean(code.service, 40), product = PRODUCTS[service];
      if(!product) return res.status(400).json({ ok:false, error:'invalid_product_code' });
      return res.status(200).json({ ok:true, action:'checkout', message:'商品兑换码可用', code:rawCode, product });
    }
    const amount = roundMoney(code.amount || 0);
    if(amount <= 0) return res.status(400).json({ ok:false, error:'invalid_balance_code' });
    const now = new Date();
    code.usedBy = Array.isArray(code.usedBy) ? code.usedBy : [];
    code.usedBy.unshift({ userId:user.id, email:user.email, usedAt:now.toISOString(), usedAtBeijing:formatBeijingTime(now) });
    code.usedCount = code.usedBy.length;
    user.balance = roundMoney(Number(user.balance || 0) + amount);
    user.ledger = Array.isArray(user.ledger) ? user.ledger : [];
    user.ledger.unshift(newLedger('redeem_code', amount, user.balance, '兑换码充值：' + rawCode));
    user.ledger = user.ledger.slice(0, 80);
    await writeUsersCodes(redis, users, codes);
    return res.status(200).json({ ok:true, action:'balance', message:'余额兑换成功', balance:roundMoney(user.balance || 0) });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
