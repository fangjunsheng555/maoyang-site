const { redisConfig, readUsers, readCodes, readOrders, writeUsersCodesOrders } = require('../maoyang-store.js');
const { clean, currentUser, roundMoney, formatBeijingTime, newLedger } = require('../maoyang-auth.js');

const PRODUCTS = {
  spotify: { label:'Spotify Premium', amount:128, cycle:'1年' },
  netflix: { label:'Netflix Premium', amount:168, cycle:'1年' },
  disney:  { label:'Disney+', amount:108, cycle:'1年' },
  hbomax:  { label:'HBO Max', amount:148, cycle:'1年' },
  chatgpt: { label:'ChatGPT Plus', amount:75, cycle:'1月' },
  network: { label:'网络节点服务', amount:99, cycle:'1年' }
};
function parseBody(req){ const body=req.body||{}; if(typeof body==='string'){ try{return JSON.parse(body);}catch(e){return{};} } return body; }
function normalizeCode(value){ return clean(value, 80).replace(/\s+/g, '').toUpperCase(); }
function subscriptionLinks(username){ const encoded=encodeURIComponent(String(username||'').trim()); return { shadowrocket:'https://hk.joinvip.vip:2056/sub/'+encoded, clash:'https://hk.joinvip.vip:2056/sub/'+encoded+'?format=clash' }; }
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
    const [users, codes, orders] = await Promise.all([readUsers(redis), readCodes(redis), readOrders(redis)]);
    const user = currentUser(req, users);
    if(!user) return res.status(401).json({ ok:false, error:'unauthorized' });
    const code = codes.find((item)=>normalizeCode(item.code) === rawCode);
    const availability = codeAvailable(code, user);
    if(availability) return res.status(400).json({ ok:false, error:availability });
    const now = new Date();
    code.usedBy = Array.isArray(code.usedBy) ? code.usedBy : [];
    code.usedBy.unshift({ userId:user.id, email:user.email, usedAt:now.toISOString(), usedAtBeijing:formatBeijingTime(now) });
    code.usedCount = code.usedBy.length;
    let order = null, message = '';
    if(code.type === 'product'){
      const service = clean(code.service, 40), product = PRODUCTS[service];
      if(!product) return res.status(400).json({ ok:false, error:'invalid_product_code' });
      const orderId = 'MYC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
      const item = { service, label:product.label, cycle:product.cycle, amount:product.amount, account:service === 'network' ? orderId : '', password:'' };
      if(service === 'network') item.subscriptionLinks = subscriptionLinks(orderId);
      order = {
        orderId, userId:user.id, createdAt:now.toISOString(), createdAtBeijing:formatBeijingTime(now),
        items:[item], itemCount:1, subtotal:product.amount, discountRate:1, discountLabel:'商品兑换码', finalAmount:0, finalUsdt:0,
        paymentMethod:'redeem_code', paidAmount:0, paidCurrency:'CNY', email:user.email, contact:clean(body.contact || user.contact || '', 200),
        remark:'兑换码：' + rawCode, status:'pending', statusLabel:'待处理', service, serviceLabel:product.label, cycle:product.cycle,
        account:item.account, password:'', originalAmount:product.amount, currency:'CNY', redeemCode:rawCode
      };
      orders.unshift(order);
      message = '商品兑换成功，已生成待处理订单';
    }else{
      const amount = roundMoney(code.amount || 0);
      if(amount <= 0) return res.status(400).json({ ok:false, error:'invalid_balance_code' });
      user.balance = roundMoney(Number(user.balance || 0) + amount);
      user.ledger = Array.isArray(user.ledger) ? user.ledger : [];
      user.ledger.unshift(newLedger('redeem_code', amount, user.balance, '兑换码充值：' + rawCode));
      user.ledger = user.ledger.slice(0, 80);
      message = '余额兑换成功';
    }
    await writeUsersCodesOrders(redis, users, codes, orders.slice(0, 500));
    return res.status(200).json({ ok:true, message, balance:roundMoney(user.balance || 0), order });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
