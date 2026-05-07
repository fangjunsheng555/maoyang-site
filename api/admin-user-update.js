const { redisConfig, readUsers, writeUsers, readCodes, writeCodes, readWithdrawals, writeUsersWithdrawals, envFirst } = require('./lib/maoyang-store.js');
const { clean, roundMoney, randomId, formatBeijingTime, findUserById, findUserByEmail, newLedger } = require('./lib/maoyang-auth.js');
const SERVICES = new Set(['spotify', 'netflix', 'disney', 'hbomax', 'chatgpt', 'network']);
function adminKey(req){ return String(req.headers['x-admin-key'] || (req.query && req.query.key) || '').trim(); }
function parseBody(req){ const body=req.body||{}; if(typeof body==='string'){ try{return JSON.parse(body);}catch(e){return{};} } return body; }
function normalizeCode(value){ return clean(value, 80).replace(/\s+/g, '').toUpperCase(); }
function makeCode(){ return 'MY' + Math.random().toString(36).slice(2, 6).toUpperCase() + Date.now().toString(36).slice(-4).toUpperCase(); }
function findUser(users, body){ return findUserById(users, body.userId) || findUserByEmail(users, body.email); }
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if(req.method !== 'POST'){ res.setHeader('Allow','POST'); return res.status(405).json({ ok:false, error:'method_not_allowed' }); }
  const expectedKey = envFirst('ADMIN_KEY', 'MAOYANG_ADMIN_KEY', 'ORDER_ADMIN_KEY');
  if(!expectedKey) return res.status(503).json({ ok:false, error:'admin_key_not_configured' });
  if(adminKey(req) !== expectedKey) return res.status(401).json({ ok:false, error:'unauthorized' });
  const redis = redisConfig(); if(!redis) return res.status(503).json({ ok:false, error:'storage_not_configured' });
  const body = parseBody(req), action = clean(body.action, 40);
  try{
    if(action === 'adjust_balance'){
      const users = await readUsers(redis), user = findUser(users, body);
      if(!user) return res.status(404).json({ ok:false, error:'user_not_found' });
      const amount = roundMoney(body.amount); if(!amount) return res.status(400).json({ ok:false, error:'invalid_amount' });
      user.balance = roundMoney(Number(user.balance || 0) + amount);
      user.ledger = Array.isArray(user.ledger) ? user.ledger : [];
      user.ledger.unshift(newLedger('admin_adjust', amount, user.balance, clean(body.note || '后台调整余额', 240)));
      user.ledger = user.ledger.slice(0, 80);
      await writeUsers(redis, users);
      return res.status(200).json({ ok:true, user });
    }
    if(action === 'set_user_status'){
      const users = await readUsers(redis), user = findUser(users, body);
      if(!user) return res.status(404).json({ ok:false, error:'user_not_found' });
      user.status = body.status === 'disabled' ? 'disabled' : 'active';
      user.adminNote = clean(body.note || user.adminNote || '', 500);
      await writeUsers(redis, users);
      return res.status(200).json({ ok:true, user });
    }
    if(action === 'withdrawal_update'){
      const [users, withdrawals] = await Promise.all([readUsers(redis), readWithdrawals(redis)]);
      const item = withdrawals.find((withdrawal)=>clean(withdrawal.id, 80) === clean(body.withdrawalId || body.id, 80));
      if(!item) return res.status(404).json({ ok:false, error:'withdrawal_not_found' });
      if(item.status !== 'pending') return res.status(400).json({ ok:false, error:'withdrawal_already_handled' });
      const status = body.status === 'rejected' ? 'rejected' : 'approved';
      const now = new Date();
      item.status = status; item.adminNote = clean(body.note || '', 500); item.updatedAt = now.toISOString(); item.updatedAtBeijing = formatBeijingTime(now);
      if(status === 'rejected'){
        const user = findUserById(users, item.userId) || findUserByEmail(users, item.email);
        if(user){
          user.balance = roundMoney(Number(user.balance || 0) + Number(item.amount || 0));
          user.ledger = Array.isArray(user.ledger) ? user.ledger : [];
          user.ledger.unshift(newLedger('withdraw_refund', Number(item.amount || 0), user.balance, '提现驳回退回余额'));
          user.ledger = user.ledger.slice(0, 80);
        }
      }
      await writeUsersWithdrawals(redis, users, withdrawals);
      return res.status(200).json({ ok:true, withdrawal:item });
    }
    if(action === 'code_create'){
      const codes = await readCodes(redis);
      const code = normalizeCode(body.code) || makeCode();
      if(codes.some((item)=>normalizeCode(item.code) === code)) return res.status(409).json({ ok:false, error:'code_exists' });
      const type = body.type === 'product' ? 'product' : 'balance';
      const amount = type === 'balance' ? roundMoney(body.amount) : 0;
      const service = clean(body.service, 40);
      if(type === 'balance' && amount <= 0) return res.status(400).json({ ok:false, error:'invalid_amount' });
      if(type === 'product' && !SERVICES.has(service)) return res.status(400).json({ ok:false, error:'invalid_service' });
      const now = new Date();
      const record = { id:randomId('C'), code, type, amount, service:type === 'product' ? service : '', maxUses:Math.max(1, Math.min(1000, Number(body.maxUses || 1))), usedCount:0, usedBy:[], status:'active', note:clean(body.note, 500), expiresAt:clean(body.expiresAt, 60), createdAt:now.toISOString(), createdAtBeijing:formatBeijingTime(now) };
      codes.unshift(record);
      await writeCodes(redis, codes.slice(0, 1000));
      return res.status(200).json({ ok:true, code:record });
    }
    if(action === 'code_status'){
      const codes = await readCodes(redis);
      const target = normalizeCode(body.code);
      const code = codes.find((item)=>item.id === body.id || normalizeCode(item.code) === target);
      if(!code) return res.status(404).json({ ok:false, error:'code_not_found' });
      code.status = body.status === 'active' ? 'active' : 'disabled';
      await writeCodes(redis, codes);
      return res.status(200).json({ ok:true, code });
    }
    return res.status(400).json({ ok:false, error:'invalid_action' });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
