const { redisConfig, readUsers, readOrders, readCodes, readWithdrawals, envFirst } = require('../maoyang-store.js');
const { adminPublicUser, clean, normalizeEmail } = require('../maoyang-auth.js');
function adminKey(req){ return String(req.headers['x-admin-key'] || (req.query && req.query.key) || '').trim(); }
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if(req.method !== 'GET'){ res.setHeader('Allow','GET'); return res.status(405).json({ ok:false, error:'method_not_allowed' }); }
  const expectedKey = envFirst('ADMIN_KEY', 'MAOYANG_ADMIN_KEY', 'ORDER_ADMIN_KEY');
  if(!expectedKey) return res.status(503).json({ ok:false, error:'admin_key_not_configured' });
  if(adminKey(req) !== expectedKey) return res.status(401).json({ ok:false, error:'unauthorized' });
  const redis = redisConfig();
  if(!redis) return res.status(200).json({ ok:true, configured:false, users:[], codes:[], withdrawals:[] });
  try{
    const [rawUsers, orders, codes, withdrawals] = await Promise.all([readUsers(redis, 1000), readOrders(redis, 500), readCodes(redis, 1000), readWithdrawals(redis, 500)]);
    const users = rawUsers.map((user)=>{
      const out = adminPublicUser(user);
      const email = normalizeEmail(user.email);
      const matchedOrders = orders.filter((order)=>clean(order.userId, 80) === user.id || normalizeEmail(order.email) === email);
      out.orderCount = matchedOrders.length;
      out.totalPaid = matchedOrders.reduce((sum, order)=>sum + Number(order.paymentMethod === 'usdt' ? order.finalAmount : order.paidAmount || order.finalAmount || 0), 0);
      out.lastOrderAtBeijing = matchedOrders[0] ? (matchedOrders[0].createdAtBeijing || '') : '';
      return out;
    });
    return res.status(200).json({ ok:true, configured:true, users, codes, withdrawals });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
