const { redisConfig, readCodes } = require('../maoyang-store.js');
const { clean, roundMoney } = require('../maoyang-auth.js');

const PRODUCTS = {
  spotify: { service:'spotify', label:'Spotify Premium', amount:128, cycle:'1年' },
  netflix: { service:'netflix', label:'Netflix Premium', amount:168, cycle:'1年' },
  disney:  { service:'disney',  label:'Disney+', amount:108, cycle:'1年' },
  hbomax:  { service:'hbomax',  label:'HBO Max', amount:148, cycle:'1年' },
  chatgpt: { service:'chatgpt', label:'ChatGPT Plus', amount:75, cycle:'1月' },
  network: { service:'network', label:'网络节点服务', amount:99, cycle:'1年' }
};

function parseBody(req){
  if(req.method === 'GET') return req.query || {};
  const body = req.body || {};
  if(typeof body === 'string'){ try{return JSON.parse(body);}catch(e){return{};} }
  return body;
}
function normalizeCode(value){ return clean(value, 80).replace(/\s+/g, '').toUpperCase(); }
function unavailable(code){
  if(!code || code.status === 'disabled') return 'code_disabled';
  if(code.expiresAt && new Date(code.expiresAt).getTime() < Date.now()) return 'code_expired';
  const usedBy = Array.isArray(code.usedBy) ? code.usedBy : [];
  if(usedBy.length >= Math.max(1, Number(code.maxUses || 1))) return 'code_used_up';
  return '';
}
function publicCode(code){
  const type = code.type === 'product' ? 'product' : 'balance';
  const product = type === 'product' ? PRODUCTS[clean(code.service, 40)] : null;
  return {
    code: code.code || '',
    type,
    amount: type === 'balance' ? roundMoney(code.amount || 0) : 0,
    product,
    requireLogin: type === 'balance'
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if(!['GET','POST'].includes(req.method)){
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok:false, error:'method_not_allowed' });
  }
  const redis = redisConfig(); if(!redis) return res.status(503).json({ ok:false, error:'storage_not_configured' });
  const rawCode = normalizeCode(parseBody(req).code);
  if(!rawCode) return res.status(400).json({ ok:false, error:'missing_code' });
  try{
    const codes = await readCodes(redis);
    const code = codes.find((item)=>normalizeCode(item.code) === rawCode);
    const reason = unavailable(code);
    if(reason) return res.status(400).json({ ok:false, error:reason });
    if(code.type === 'product' && !PRODUCTS[clean(code.service, 40)]) {
      return res.status(400).json({ ok:false, error:'invalid_product_code' });
    }
    return res.status(200).json({ ok:true, redeem:publicCode(code) });
  }catch(error){ return res.status(502).json({ ok:false, error:error.message || 'storage_unavailable' }); }
};
