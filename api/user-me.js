const { redisConfig, readUsers, readOrders, readWithdrawals } = require('../lib/maoyang-store.js');
const { currentUser, publicUser, normalizeEmail } = require('../lib/maoyang-auth.js');
function subscriptionLinks(username){ const encoded=encodeURIComponent(String(username||'').trim()); return { shadowrocket:'https://hk.joinvip.vip:2056/sub/'+encoded, clash:'https://hk.joinvip.vip:2056/sub/'+encoded+'?format=clash' }; }
function publicOrder(order){
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items.map((it)=>{
    const account = it.account || (it.service === 'network' ? order.orderId : '');
    const out = { service:it.service||'', label:it.label||'', cycle:it.cycle||'', amount:Number(it.amount||0), account, password:it.password||'' };
    if(it.subscriptionLinks) out.subscriptionLinks = it.subscriptionLinks;
    else if(it.service === 'network' && account) out.subscriptionLinks = subscriptionLinks(account);
    return out;
  }) : [{ service:order.service||'', label:order.serviceLabel||'订单', cycle:order.cycle||'', amount:Number(order.finalAmount||0), account:order.account||'', password:order.password||'' }];
  return {
    orderId:order.orderId||'', createdAt:order.createdAt||'', createdAtBeijing:order.createdAtBeijing||'', items, itemCount:items.length,
    serviceLabel:order.serviceLabel || items.map((i)=>i.label).join(' + '), paymentMethod:order.paymentMethod||'alipay',
    subtotal:Number(order.subtotal||order.originalAmount||0), discountRate:Number(order.discountRate||0), discountLabel:order.discountLabel||'',
    walletDeduction:Number(order.walletDeduction||0), finalAmount:Number(order.finalAmount||0), finalUsdt:Number(order.finalUsdt||0),
    paidAmount:Number(order.paidAmount||0), paidCurrency:order.paidCurrency || (order.paymentMethod === 'usdt' ? 'USDT' : 'CNY'),
    email:order.email||'', contact:order.contact||'', remark:order.remark||'', status:order.status||'pending',
    statusLabel:order.statusLabel || (order.status === 'completed' ? '已完成充值' : '待处理'), completedAtBeijing:order.completedAtBeijing||'', fulfillmentNote:order.fulfillmentNote||''
  };
}
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if(req.method !== 'GET'){ res.setHeader('Allow','GET'); return res.status(405).json({ ok:false, error:'method_not_allowed' }); }
  const redis = redisConfig(); if(!redis) return res.status(503).json({ ok:false, error:'storage_not_configured' });
  try{
    const users = await readUsers(redis);
    const user = currentUser(req, users);
    if(!user) return res.status(401).json({ ok:false, error:'unauthorized' });
    const email = normalizeEmail(user.email);
    const [orders, withdrawals] = await Promise.all([readOrders(redis, 500), readWithdrawals(redis, 500)]);
    return res.status(200).json({
      ok:true,
      user: publicUser(user),
      orders: orders.filter((order)=>order.userId === user.id || normalizeEmail(order.email) === email).slice(0, 80).map(publicOrder),
      withdrawals: withdrawals.filter((item)=>item.userId === user.id || normalizeEmail(item.email) === email).slice(0, 50)
    });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
