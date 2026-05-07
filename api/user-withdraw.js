const { redisConfig, readUsers, readWithdrawals, writeUsersWithdrawals } = require('./lib/maoyang-store.js');
const { clean, currentUser, roundMoney, randomId, formatBeijingTime, newLedger } = require('./lib/maoyang-auth.js');
function parseBody(req){ const body=req.body||{}; if(typeof body==='string'){ try{return JSON.parse(body);}catch(e){return{};} } return body; }
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if(req.method !== 'POST'){ res.setHeader('Allow','POST'); return res.status(405).json({ ok:false, error:'method_not_allowed' }); }
  const redis = redisConfig(); if(!redis) return res.status(503).json({ ok:false, error:'storage_not_configured' });
  try{
    const body = parseBody(req);
    const [users, withdrawals] = await Promise.all([readUsers(redis), readWithdrawals(redis)]);
    const user = currentUser(req, users);
    if(!user) return res.status(401).json({ ok:false, error:'unauthorized' });
    const amount = roundMoney(body.amount), method = clean(body.method || 'alipay', 40), account = clean(body.account, 240), name = clean(body.name, 80), note = clean(body.note, 500);
    if(amount <= 0) return res.status(400).json({ ok:false, error:'invalid_amount' });
    if(amount > roundMoney(user.balance || 0)) return res.status(400).json({ ok:false, error:'insufficient_balance' });
    if(!account) return res.status(400).json({ ok:false, error:'missing_withdraw_account' });
    user.balance = roundMoney(Number(user.balance || 0) - amount);
    user.ledger = Array.isArray(user.ledger) ? user.ledger : [];
    user.ledger.unshift(newLedger('withdraw_hold', -amount, user.balance, '余额提现申请冻结'));
    user.ledger = user.ledger.slice(0, 80);
    const now = new Date();
    const withdrawal = { id:randomId('W'), userId:user.id, email:user.email, amount, method, account, name, note, status:'pending', createdAt:now.toISOString(), createdAtBeijing:formatBeijingTime(now) };
    withdrawals.unshift(withdrawal);
    await writeUsersWithdrawals(redis, users, withdrawals.slice(0, 500));
    return res.status(200).json({ ok:true, withdrawal, balance:user.balance });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
