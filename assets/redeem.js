(function(){
  const form = document.querySelector('[data-home-redeem-form]');
  const statusEl = document.querySelector('[data-home-redeem-status]');
  if(!form || !window.MAOYANG_CART) return;

  function setStatus(text, warn){
    statusEl.hidden = !text;
    statusEl.textContent = text || '';
    statusEl.classList.toggle('warn', !!warn);
  }
  function normalize(value){ return String(value || '').replace(/\s+/g, '').toUpperCase(); }
  async function api(url, options){
    const opts = options || {};
    const auth = window.MAOYANG_AUTH;
    const token = auth && auth.getToken ? auth.getToken() : '';
    opts.headers = Object.assign(opts.body ? { 'Content-Type':'application/json' } : {}, token ? { Authorization:'Bearer ' + token } : {}, opts.headers || {});
    const response = await fetch(url, opts);
    const data = await response.json().catch(()=>({ ok:false, error:'bad_response' }));
    if(!response.ok || !data.ok) throw new Error(data.error || 'request_failed');
    return data;
  }
  function errorText(error){
    const map = {
      missing_code:'请输入兑换码',
      code_disabled:'兑换码不可用',
      code_expired:'兑换码已过期',
      code_used_up:'兑换码已被使用完',
      code_already_used:'这个兑换码已经使用过',
      invalid_product_code:'商品兑换码无效',
      invalid_balance_code:'余额兑换码金额无效',
      unauthorized:'余额兑换码需要先登录或注册账户',
      storage_not_configured:'兑换系统暂不可用，请联系在线客服'
    };
    return map[error && error.message] || '兑换失败，请稍后重试';
  }
  async function redeemBalance(code){
    const auth = window.MAOYANG_AUTH;
    const state = auth && auth.getState ? auth.getState() : { user:null };
    if(!state.user){
      sessionStorage.setItem('maoyangPendingBalanceCode', code);
      setStatus('余额兑换码需要先登录或注册账户，登录后会自动领取。');
      if(auth && auth.open) auth.open('login');
      return;
    }
    const result = await api('/api/user-redeem', { method:'POST', body:JSON.stringify({ code }) });
    setStatus(result.message || '余额兑换成功');
    form.reset();
    if(auth && auth.refresh) await auth.refresh();
  }
  function startProductCheckout(code, product){
    sessionStorage.setItem('maoyangRedeemCheckout', JSON.stringify({ code, service:product.service, label:product.label }));
    window.MAOYANG_CART.clear();
    window.MAOYANG_CART.add(product.service);
    window.location.href = 'order.html?redeem=' + encodeURIComponent(code);
  }
  form.addEventListener('submit', async (event)=>{
    event.preventDefault();
    const code = normalize(new FormData(form).get('code'));
    if(!code){ setStatus('请输入兑换码', true); return; }
    const btn = form.querySelector('button');
    btn.disabled = true;
    setStatus('正在识别兑换码...');
    try{
      const result = await api('/api/redeem-preview', { method:'POST', body:JSON.stringify({ code }) });
      const redeem = result.redeem || {};
      if(redeem.type === 'product' && redeem.product){
        setStatus('已识别为商品兑换码，正在进入订单填写...');
        startProductCheckout(code, redeem.product);
        return;
      }
      await redeemBalance(code);
    }catch(error){ setStatus(errorText(error), true); }
    finally{ btn.disabled = false; }
  });
  window.addEventListener('maoyang:auth-update', async ()=>{
    const code = sessionStorage.getItem('maoyangPendingBalanceCode');
    const auth = window.MAOYANG_AUTH;
    const state = auth && auth.getState ? auth.getState() : { user:null };
    if(!code || !state.user) return;
    sessionStorage.removeItem('maoyangPendingBalanceCode');
    try{ await redeemBalance(code); }catch(error){ setStatus(errorText(error), true); }
  });
})();
