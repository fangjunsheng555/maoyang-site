const { redisConfig, readUsers, writeUsers, readCodes, writeCodes, readWithdrawals, writeUsersWithdrawals, envFirst } = require('../maoyang-store.js');
const { clean, roundMoney, randomId, formatBeijingTime, findUserById, findUserByEmail, newLedger } = require('../maoyang-auth.js');
const SERVICES = new Set(['spotify', 'netflix', 'disney', 'hbomax', 'chatgpt', 'network']);
const SERVICE_LABELS = {
  spotify:'Spotify Premium',
  netflix:'Netflix Premium',
  disney:'Disney+',
  hbomax:'HBO Max',
  chatgpt:'ChatGPT Plus',
  network:'网络节点服务'
};
function adminKey(req){ return String(req.headers['x-admin-key'] || (req.query && req.query.key) || '').trim(); }
function parseBody(req){ const body=req.body||{}; if(typeof body==='string'){ try{return JSON.parse(body);}catch(e){return{};} } return body; }
function normalizeCode(value){ return clean(value, 80).replace(/\s+/g, '').toUpperCase(); }
function makeCode(){ return 'MY' + Math.random().toString(36).slice(2, 6).toUpperCase() + Date.now().toString(36).slice(-4).toUpperCase(); }
function findUser(users, body){ return findUserById(users, body.userId) || findUserByEmail(users, body.email); }
function uniqueRequestedCodes(body, count) {
  const raw = Array.isArray(body.codes) ? body.codes.join('\n') : (body.codes || body.code || '');
  const items = String(raw || '').split(/[\s,，]+/).map(normalizeCode).filter(Boolean);
  const out = [];
  items.forEach((code)=>{ if(out.indexOf(code) < 0) out.push(code); });
  while(out.length < count) {
    let code = makeCode();
    while(out.indexOf(code) >= 0) code = makeCode();
    out.push(code);
  }
  return out.slice(0, count);
}
function requestedCodeCount(body) {
  const raw = Array.isArray(body.codes) ? body.codes.join('\n') : (body.codes || body.code || '');
  return String(raw || '').split(/[\s,，]+/).map(normalizeCode).filter(Boolean).length;
}
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
    if(action === 'delete_user'){
      const users = await readUsers(redis);
      const target = findUser(users, body);
      if(!target) return res.status(404).json({ ok:false, error:'user_not_found' });
      const next = users.filter((item)=>item !== target);
      await writeUsers(redis, next);
      return res.status(200).json({ ok:true, deleted:target.id || target.email });
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
    if(action === 'code_create' || action === 'code_create_batch'){
      const codes = await readCodes(redis);
      const type = body.type === 'product' ? 'product' : 'balance';
      const amount = type === 'balance' ? roundMoney(body.amount) : 0;
      const service = clean(body.service, 40);
      if(type === 'balance' && amount <= 0) return res.status(400).json({ ok:false, error:'invalid_amount' });
      if(type === 'product' && !SERVICES.has(service)) return res.status(400).json({ ok:false, error:'invalid_service' });
      const now = new Date();
      const count = Math.max(1, Math.min(500, Number(body.count || requestedCodeCount(body) || 1)));
      const requested = uniqueRequestedCodes(body, count);
      const existing = new Set(codes.map((item)=>normalizeCode(item.code)));
      if(requested.some((code)=>existing.has(code))) return res.status(409).json({ ok:false, error:'code_exists' });
      const batchId = randomId('B');
      const batchName = clean(body.batchName || (type === 'product' ? (SERVICE_LABELS[service] + ' 商品兑换码') : ('余额兑换码 ' + amount)), 120);
      const maxUses = Math.max(1, Math.min(1000, Number(body.maxUses || 1)));
      const records = requested.map((code)=>({
        id:randomId('C'), batchId, batchName, code, type, amount,
        service:type === 'product' ? service : '',
        productLabel:type === 'product' ? SERVICE_LABELS[service] : '',
        maxUses, usedCount:0, usedBy:[], status:'active',
        note:clean(body.note, 500), expiresAt:clean(body.expiresAt, 60),
        createdAt:now.toISOString(), createdAtBeijing:formatBeijingTime(now)
      }));
      codes.unshift(...records);
      await writeCodes(redis, codes.slice(0, 1000));
      return res.status(200).json({ ok:true, batch:{ id:batchId, batchName, type, amount, service, count:records.length }, codes:records });
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
    if(action === 'code_delete' || action === 'code_bulk_delete' || action === 'code_batch_delete'){
      const codes = await readCodes(redis);
      const ids = Array.isArray(body.ids) ? body.ids.map((id)=>clean(id, 80)) : [];
      const batchId = clean(body.batchId, 80);
      const target = normalizeCode(body.code);
      const next = codes.filter((item)=>{
        if(batchId && clean(item.batchId || '', 80) === batchId) return false;
        if(ids.length && ids.indexOf(clean(item.id, 80)) >= 0) return false;
        if(target && normalizeCode(item.code) === target) return false;
        return true;
      });
      if(next.length === codes.length) return res.status(404).json({ ok:false, error:'code_not_found' });
      await writeCodes(redis, next);
      return res.status(200).json({ ok:true, deleted:codes.length - next.length });
    }
    if(action === 'code_bulk_status' || action === 'code_batch_status'){
      const codes = await readCodes(redis);
      const ids = Array.isArray(body.ids) ? body.ids.map((id)=>clean(id, 80)) : [];
      const batchId = clean(body.batchId, 80);
      const status = body.status === 'active' ? 'active' : 'disabled';
      let changed = 0;
      codes.forEach((item)=>{
        const match = (batchId && clean(item.batchId || '', 80) === batchId) || (ids.length && ids.indexOf(clean(item.id, 80)) >= 0);
        if(match){ item.status = status; changed++; }
      });
      if(!changed) return res.status(404).json({ ok:false, error:'code_not_found' });
      await writeCodes(redis, codes);
      return res.status(200).json({ ok:true, changed });
    }
    return res.status(400).json({ ok:false, error:'invalid_action' });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
