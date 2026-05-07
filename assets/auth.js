(function(){
  const TOKEN_KEY = 'maoyangUserToken';
  const state = {
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: null,
    orders: [],
    withdrawals: [],
    config: { newUserBonus: 8.88, googleClientId: '' },
    ready: false
  };
  let modal = null;
  let detailModal = null;
  let googleLoaded = false;
  let codeTimer = 0;
  let codeTimerId = null;

  function one(s, r){ return (r || document).querySelector(s); }
  function all(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function money(v){ return '¥' + Number(v || 0).toFixed(2).replace(/\.00$/, ''); }
  function bonusText(){ return money(state.config.newUserBonus || 8.88); }
  function safe(v){ return String(v == null ? '' : v); }
  function esc(v){
    return safe(v).replace(/[&<>"']/g, (m)=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m]));
  }
  function methodName(o){
    if(o.paymentMethod === 'usdt') return 'USDT';
    if(o.paymentMethod === 'balance') return '余额';
    if(o.paymentMethod === 'redeem_code') return '兑换码';
    return '支付宝';
  }
  function paidDisplay(o){
    if(o.paymentMethod === 'usdt' || o.paidCurrency === 'USDT') return (o.paidAmount || o.finalUsdt || 0) + ' USDT';
    return money(o.paidAmount || o.finalAmount || 0);
  }
  function itemLabel(order){
    const items = Array.isArray(order.items) ? order.items : [];
    if(items.length > 1) return '组合订单 · ' + items.length + ' 件';
    return (items[0] && (items[0].label || items[0].service)) || order.serviceLabel || '订单';
  }
  function setToken(token){
    state.token = token || '';
    if(state.token) localStorage.setItem(TOKEN_KEY, state.token);
    else localStorage.removeItem(TOKEN_KEY);
  }
  function emit(){
    window.dispatchEvent(new CustomEvent('maoyang:auth-update', { detail: getState() }));
  }
  function getState(){
    return {
      token: state.token,
      user: state.user,
      orders: state.orders.slice(),
      withdrawals: state.withdrawals.slice(),
      config: state.config
    };
  }
  function headers(json){
    const h = {};
    if(json) h['Content-Type'] = 'application/json';
    if(state.token) h.Authorization = 'Bearer ' + state.token;
    return h;
  }
  async function api(url, options){
    const opts = options || {};
    opts.headers = Object.assign(headers(opts.body != null), opts.headers || {});
    const response = await fetch(url, opts);
    const data = await response.json().catch(()=>({ ok:false, error:'bad_response' }));
    if(!response.ok || !data.ok){
      const err = new Error(data.error || 'request_failed');
      err.data = data;
      throw err;
    }
    return data;
  }
  function errorText(error){
    const code = error && error.message;
    const map = {
      storage_not_configured:'账户系统存储尚未连接，请联系在线客服',
      invalid_email:'请填写有效邮箱',
      weak_password:'密码至少 6 位',
      email_exists:'这个邮箱已经注册，请直接登录',
      invalid_credentials:'邮箱或密码不正确',
      account_disabled:'账户已停用，请联系在线客服',
      user_not_found:'没有找到这个邮箱的账户',
      code_mismatch:'验证码不正确',
      code_expired:'验证码已过期，请重新发送',
      mail_failed:'验证码邮件发送失败，请稍后重试',
      smtp_env_missing:'验证码邮件通道未配置，请联系在线客服',
      unauthorized:'请先登录账户',
      missing_code:'请输入兑换码',
      code_disabled:'兑换码不可用',
      code_expired:'兑换码已过期',
      code_already_used:'这个兑换码你已经使用过',
      code_used_up:'兑换码已被使用完',
      invalid_balance_code:'余额兑换码金额无效',
      invalid_product_code:'商品兑换码无效',
      redeem_product_mismatch:'兑换码商品与当前订单不匹配',
      invalid_amount:'请输入正确金额',
      insufficient_balance:'余额不足',
      missing_withdraw_account:'请填写收款账户',
      google_client_not_configured:'谷歌登录尚未配置'
    };
    return map[code] || '操作失败，请稍后重试';
  }

  async function loadConfig(){
    try{
      const data = await api('/api/auth-config', { method:'GET' });
      state.config = Object.assign(state.config, data || {});
      if(modal && modal.classList.contains('show')) renderGoogleButtons();
    }catch(e){}
  }
  async function refresh(){
    if(!state.token){ state.user = null; state.orders = []; state.withdrawals = []; syncEntry(); emit(); return null; }
    try{
      const data = await api('/api/user-me', { method:'GET' });
      state.user = data.user;
      state.orders = data.orders || [];
      state.withdrawals = data.withdrawals || [];
      syncEntry();
      renderDashboard();
      emit();
      return data;
    }catch(error){
      if(error.message === 'unauthorized'){
        setToken('');
        state.user = null;
        state.orders = [];
        state.withdrawals = [];
      }
      syncEntry();
      emit();
      return null;
    }
  }
  function syncEntry(){
    all('[data-auth-open]').forEach((node)=>{
      if(node.dataset.authStaticLabel === '1') return;
      node.classList.toggle('isLogged', !!state.user);
      const label = one('[data-auth-label]', node);
      if(label) label.textContent = state.user ? '我的账户' : '登录/注册';
      else node.textContent = state.user ? '我的账户' : '登录/注册';
    });
    all('[data-auth-entry]').forEach((node)=>{
      node.textContent = state.user ? '我的' : '登录';
      node.classList.toggle('isLogged', !!state.user);
    });
  }
  function injectEntries(){
    all('.drawer nav').forEach((nav)=>{
      if(one('[data-auth-drawer]', nav)) return;
      const a = document.createElement('a');
      a.href = '#account';
      a.dataset.authOpen = '1';
      a.dataset.authDrawer = '1';
      a.textContent = state.user ? '我的账户' : '登录/注册';
      nav.appendChild(a);
    });
  }
  function status(el, text, warn){
    if(!el) return;
    el.hidden = !text;
    el.textContent = text || '';
    el.classList.toggle('warn', !!warn);
  }
  function tab(name){
    if(!modal) return;
    all('[data-auth-tab]').forEach((b)=>b.classList.toggle('active', b.dataset.authTab === name));
    all('[data-auth-pane]').forEach((p)=>p.hidden = p.dataset.authPane !== name);
    const title = one('#authTitle', modal);
    if(title) title.textContent = name === 'register' ? '注册账户' : (name === 'reset' ? '找回密码' : '登录账户');
  }
  function buildModal(){
    if(modal) return modal;
    modal = document.createElement('div');
    modal.className = 'authMask';
    modal.dataset.authModal = '1';
    modal.innerHTML =
      '<section class="authSheet" role="dialog" aria-modal="true" aria-labelledby="authTitle">' +
        '<div class="authHead"><div><span>Maoyang Account</span><strong id="authTitle">登录/注册</strong></div><button type="button" class="authClose" data-auth-close aria-label="关闭">×</button></div>' +
        '<div class="authBody">' +
          '<div class="authGuest" data-auth-guest>' +
            '<div class="authTabs authTabsTwo"><button type="button" class="active" data-auth-tab="login">登录</button><button type="button" data-auth-tab="register">注册</button></div>' +
            '<div class="authStatus" data-auth-status hidden></div>' +
            '<form class="authPane" data-auth-pane="login" data-login-form>' +
              '<label class="field"><span>邮箱</span><input type="email" name="email" autocomplete="email" required></label>' +
              '<label class="field"><span>密码</span><input type="password" name="password" autocomplete="current-password" required></label>' +
              '<div class="authFormLine"><button type="button" data-auth-tab="reset">忘记密码？邮箱验证码找回</button></div>' +
              '<button class="primaryBtn primaryBtnLg" type="submit">登录</button>' +
              '<div class="authDivider"><span>或</span></div><div class="googleBox" data-google-login><button type="button" class="googlePlaceholder googleBtn" disabled><span class="googleIcon"></span><b>Google登录</b></button></div>' +
            '</form>' +
            '<form class="authPane" data-auth-pane="register" data-register-form hidden>' +
              '<div class="authBonus"><b>新用户注册立减 ' + esc(bonusText()) + ' </b><span>新用户注册立减 ¥8.88</span></div>' +
              '<label class="field"><span>称呼</span><input name="name" autocomplete="name" placeholder="怎么称呼你"></label>' +
              '<label class="field"><span>邮箱</span><input type="email" name="email" autocomplete="email" required></label>' +
              '<label class="field"><span>密码</span><input type="password" name="password" autocomplete="new-password" required></label>' +
              '<button class="primaryBtn primaryBtnLg" type="submit">注册并领取优惠券</button>' +
              '<div class="authDivider"><span>或</span></div><div class="googleBox" data-google-register><button type="button" class="googlePlaceholder googleBtn" disabled><span class="googleIcon"></span><b>Google登录</b></button></div>' +
            '</form>' +
            '<form class="authPane" data-auth-pane="reset" data-reset-form hidden>' +
              '<div class="authResetIntro"><strong>邮箱验证码找回密码</strong><span>验证码 10 分钟内有效，重设后会自动登录。</span></div>' +
              '<label class="field"><span>邮箱</span><input type="email" name="email" autocomplete="email" required></label>' +
              '<div class="authCodeRow"><label class="field"><span>验证码</span><input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required></label><button type="button" class="ghostBtn" data-send-code>发送验证码</button></div>' +
              '<label class="field"><span>新密码</span><input type="password" name="password" autocomplete="new-password" required></label>' +
              '<button class="primaryBtn primaryBtnLg" type="submit">重设密码并登录</button><button type="button" class="authBackLogin" data-auth-tab="login">返回登录</button>' +
            '</form>' +
          '</div>' +
          '<div class="authDashboard" data-auth-dashboard hidden></div>' +
        '</div>' +
      '</section>';
    document.body.appendChild(modal);
    modal.addEventListener('click', (e)=>{ if(e.target === modal) close(); });
    one('[data-auth-close]', modal).addEventListener('click', close);
    all('[data-auth-tab]', modal).forEach((btn)=>btn.addEventListener('click', ()=>tab(btn.dataset.authTab)));
    bindForms();
    return modal;
  }
  function open(startTab){
    buildModal();
    if(startTab) tab(startTab);
    renderDashboard();
    modal.classList.add('show');
    document.body.classList.add('authOpen');
    renderGoogleButtons();
  }
  function close(){
    if(!modal) return;
    modal.classList.remove('show');
    document.body.classList.remove('authOpen');
  }
  function bindForms(){
    const statusEl = one('[data-auth-status]', modal);
    one('[data-login-form]', modal).addEventListener('submit', async (event)=>{
      event.preventDefault();
      const form = event.currentTarget;
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      status(statusEl, '正在登录...');
      try{
        const data = Object.fromEntries(new FormData(form).entries());
        const result = await api('/api/auth-login', { method:'POST', body:JSON.stringify(data) });
        setToken(result.token);
        await refresh();
        status(statusEl, '');
      }catch(error){ status(statusEl, errorText(error), true); }
      finally{ btn.disabled = false; }
    });
    one('[data-register-form]', modal).addEventListener('submit', async (event)=>{
      event.preventDefault();
      const form = event.currentTarget;
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      status(statusEl, '正在注册...');
      try{
        const data = Object.fromEntries(new FormData(form).entries());
        const result = await api('/api/auth-register', { method:'POST', body:JSON.stringify(data) });
        setToken(result.token);
        await refresh();
        status(statusEl, '');
      }catch(error){ status(statusEl, errorText(error), true); }
      finally{ btn.disabled = false; }
    });
    function startCodeCountdown(btn){
      clearInterval(codeTimerId);
      codeTimer = 60;
      btn.disabled = true;
      btn.textContent = codeTimer + 's';
      codeTimerId = setInterval(()=>{
        codeTimer -= 1;
        if(codeTimer <= 0){
          clearInterval(codeTimerId);
          codeTimerId = null;
          btn.disabled = false;
          btn.textContent = '发送验证码';
          return;
        }
        btn.textContent = codeTimer + 's';
      }, 1000);
    }
    one('[data-send-code]', modal).addEventListener('click', async (event)=>{
      const form = one('[data-reset-form]', modal);
      const email = (new FormData(form).get('email') || '').trim();
      const btn = event.currentTarget;
      if(codeTimer > 0) return;
      btn.disabled = true;
      status(statusEl, '正在发送验证码...');
      try{
        await api('/api/auth-code', { method:'POST', body:JSON.stringify({ email, purpose:'reset' }) });
        status(statusEl, '验证码已发送，请查看邮箱');
        startCodeCountdown(btn);
      }catch(error){ status(statusEl, errorText(error), true); }
      finally{ if(codeTimer <= 0) btn.disabled = false; }
    });
    one('[data-reset-form]', modal).addEventListener('submit', async (event)=>{
      event.preventDefault();
      const form = event.currentTarget;
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      status(statusEl, '正在重设密码...');
      try{
        const data = Object.fromEntries(new FormData(form).entries());
        const result = await api('/api/auth-reset', { method:'POST', body:JSON.stringify(data) });
        setToken(result.token);
        await refresh();
        status(statusEl, '');
      }catch(error){ status(statusEl, errorText(error), true); }
      finally{ btn.disabled = false; }
    });
  }
  function renderDashboard(){
    if(!modal) return;
    const guest = one('[data-auth-guest]', modal);
    const dash = one('[data-auth-dashboard]', modal);
    guest.hidden = !!state.user;
    dash.hidden = !state.user;
    if(!state.user) return;
    const pendingWithdraw = state.withdrawals.filter((w)=>w.status === 'pending').reduce((sum, w)=>sum + Number(w.amount || 0), 0);
    dash.innerHTML =
      '<div class="authProfile">' +
        '<div><span>当前账户</span><strong>' + esc(state.user.name || state.user.email) + '</strong><em>' + esc(state.user.email) + '</em></div>' +
        '<button type="button" class="ghostBtn" data-auth-logout>退出</button>' +
      '</div>' +
      '<div class="authBalanceCard"><span>账户余额</span><b>' + money(state.user.balance) + '</b><small>余额可用于下单抵扣，也可提交提现申请。</small></div>' +
      '<div class="authMiniGrid"><span><b>' + state.orders.length + '</b>账户订单</span><span><b>' + money(pendingWithdraw) + '</b>提现处理中</span></div>' +
      '<form class="authTool" data-redeem-form><div><strong>兑换码</strong><small>支持余额码与商品兑换码</small></div><div class="authInline"><input name="code" placeholder="输入兑换码" autocomplete="off"><button type="submit" class="primaryBtn">兑换</button></div><p data-redeem-status hidden></p></form>' +
      '<form class="authTool" data-withdraw-form><div><strong>余额提现</strong><small>提交后后台审核处理，驳回会自动退回余额</small></div><label class="field"><span>提现金额</span><input name="amount" inputmode="decimal" placeholder="例如 20"></label><label class="field"><span>收款方式</span><input name="method" placeholder="支付宝 / USDT / 其他"></label><label class="field"><span>收款账户</span><input name="account" placeholder="账号 / 地址" required></label><button type="submit" class="ghostBtn">提交提现</button><p data-withdraw-status hidden></p></form>' +
      '<div class="authOrders"><div class="authSectionTitle"><strong>订单查询</strong><button type="button" class="ghostBtn" data-auth-refresh>刷新</button></div><div data-auth-orders></div></div>';
    one('[data-auth-logout]', dash).addEventListener('click', logout);
    one('[data-auth-refresh]', dash).addEventListener('click', refresh);
    one('[data-redeem-form]', dash).addEventListener('submit', redeem);
    one('[data-withdraw-form]', dash).addEventListener('submit', withdraw);
    renderOrderList();
  }
  function renderOrderList(){
    const box = modal ? one('[data-auth-orders]', modal) : null;
    if(!box) return;
    if(!state.orders.length){
      box.innerHTML = '<div class="authEmpty">登录后下单会自动归集到这里，也会匹配同邮箱历史订单。</div>';
      return;
    }
    box.innerHTML = state.orders.map((order, index)=>
      '<button type="button" class="authOrderRow" data-order-index="' + index + '">' +
        '<span><strong>' + esc(itemLabel(order)) + '</strong><small>' + esc(order.orderId) + '</small></span>' +
        '<em>' + esc(order.statusLabel || '待处理') + '</em><b>' + esc(paidDisplay(order)) + '</b>' +
      '</button>'
    ).join('');
    all('[data-order-index]', box).forEach((btn)=>{
      btn.addEventListener('click', ()=>openOrderDetail(state.orders[Number(btn.dataset.orderIndex)]));
    });
  }
  async function redeem(event){
    event.preventDefault();
    const form = event.currentTarget;
    const p = one('[data-redeem-status]', form);
    status(p, '正在兑换...');
    try{
      const data = Object.fromEntries(new FormData(form).entries());
      const result = await api('/api/user-redeem', { method:'POST', body:JSON.stringify(data) });
      if(result.action === 'checkout' && result.product){
        sessionStorage.setItem('maoyangRedeemCheckout', JSON.stringify({ code:data.code, service:result.product.service, label:result.product.label }));
        if(window.MAOYANG_CART){
          window.MAOYANG_CART.clear();
          window.MAOYANG_CART.add(result.product.service);
        }
        window.location.href = 'order.html?redeem=' + encodeURIComponent(data.code || '');
        return;
      }
      status(p, result.message || '兑换成功');
      form.reset();
      await refresh();
    }catch(error){ status(p, errorText(error), true); }
  }
  async function withdraw(event){
    event.preventDefault();
    const form = event.currentTarget;
    const p = one('[data-withdraw-status]', form);
    status(p, '正在提交...');
    try{
      const data = Object.fromEntries(new FormData(form).entries());
      await api('/api/user-withdraw', { method:'POST', body:JSON.stringify(data) });
      status(p, '提现申请已提交');
      form.reset();
      await refresh();
    }catch(error){ status(p, errorText(error), true); }
  }
  async function logout(){
    try{ await api('/api/auth-logout', { method:'POST' }); }catch(e){}
    setToken('');
    state.user = null;
    state.orders = [];
    state.withdrawals = [];
    renderDashboard();
    syncEntry();
    emit();
  }
  function openOrderDetail(order){
    if(!order) return;
    if(!detailModal){
      detailModal = document.createElement('div');
      detailModal.className = 'authDetailMask';
      detailModal.innerHTML = '<section class="authDetail"><button type="button" class="authClose" data-detail-close aria-label="关闭">×</button><div data-detail-body></div></section>';
      document.body.appendChild(detailModal);
      detailModal.addEventListener('click', (e)=>{ if(e.target === detailModal) closeDetail(); });
      one('[data-detail-close]', detailModal).addEventListener('click', closeDetail);
    }
    const items = Array.isArray(order.items) ? order.items : [];
    const html =
      '<div class="lookupModalHead"><div class="kicker">Order Detail</div><div class="lookupModalTitle">' + esc(itemLabel(order)) + '</div><code class="lookupModalId">' + esc(order.orderId) + '</code></div>' +
      '<div class="lookupModalAmount"><span>实付金额</span><b>' + esc(paidDisplay(order)) + '</b><em>' + esc(methodName(order)) + '</em></div>' +
      '<div class="lookupModalItems"><div class="lookupModalItemsLabel">商品明细 · ' + items.length + ' 件</div>' +
        items.map((it)=>'<div class="lookupModalItem"><div class="lookupModalItemHead"><strong>' + esc(it.label || it.service) + '</strong><span>' + esc(it.cycle || '') + ' · ' + money(it.amount || 0) + '</span></div>' +
          ((it.account || it.password) ? '<div class="lookupModalCreds">' +
            (it.account ? '<div><span>' + (it.service === 'network' ? '订阅名' : '账号') + '</span><code>' + esc(it.account) + '</code></div>' : '') +
            (it.password ? '<div><span>密码</span><code>' + esc(it.password) + '</code></div>' : '') +
          '</div>' : '') +
          (it.subscriptionLinks ? '<div class="lookupModalSubs"><button type="button" data-copy-sub="' + esc(it.subscriptionLinks.shadowrocket) + '"><span><strong>Shadowrocket 订阅</strong><small>' + esc(it.subscriptionLinks.shadowrocket) + '</small></span><em>复制</em></button><button type="button" data-copy-sub="' + esc(it.subscriptionLinks.clash) + '"><span><strong>Clash 订阅</strong><small>' + esc(it.subscriptionLinks.clash) + '</small></span><em>复制</em></button></div>' : '') +
        '</div>').join('') +
      '</div>' +
      '<div class="lookupModalRows">' +
        '<div><span>订单时间</span><b>' + esc(order.createdAtBeijing || order.createdAt || '--') + '</b></div>' +
        '<div><span>订单状态</span><b>' + esc(order.statusLabel || '--') + '</b></div>' +
        (order.walletDeduction ? '<div><span>账户立减</span><b>−' + money(order.walletDeduction) + '</b></div>' : '') +
        '<div><span>邮箱</span><b>' + esc(order.email || '--') + '</b></div>' +
        (order.fulfillmentNote ? '<div class="lookupModalRowWide"><span>开通备注</span><b>' + esc(order.fulfillmentNote) + '</b></div>' : '') +
      '</div>';
    one('[data-detail-body]', detailModal).innerHTML = html;
    all('[data-copy-sub]', detailModal).forEach((btn)=>{
      btn.addEventListener('click', ()=>copyText(btn.getAttribute('data-copy-sub')).then(()=>{
        const em = btn.querySelector('em'); if(em){ em.textContent = '已复制'; setTimeout(()=>{ em.textContent = '复制'; }, 1400); }
      }));
    });
    detailModal.classList.add('show');
  }
  function closeDetail(){ if(detailModal) detailModal.classList.remove('show'); }
  function copyText(text){
    if(navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.left = '-9999px';
    document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    return Promise.resolve();
  }
  function renderGoogleButtons(){
    const clientId = state.config.googleClientId;
    if(!modal) return;
    all('.googlePlaceholder', modal).forEach((btn)=>{
      btn.disabled = !clientId;
      btn.innerHTML = '<span class="googleIcon"></span><b>Google登录</b>';
      btn.title = clientId ? 'Google登录' : '请先配置 Google Client ID';
    });
    if(!clientId) return;
    function render(){
      if(!window.google || !google.accounts || !google.accounts.id) return;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response)=>{
          const statusEl = one('[data-auth-status]', modal);
          status(statusEl, '正在使用 Google 登录...');
          try{
            const result = await api('/api/auth-google', { method:'POST', body:JSON.stringify({ credential: response.credential }) });
            setToken(result.token);
            await refresh();
            status(statusEl, '');
          }catch(error){ status(statusEl, errorText(error), true); }
        }
      });
      all('.googleBox', modal).forEach((box)=>{
        if(box.dataset.rendered) return;
        box.dataset.rendered = '1';
        box.innerHTML = '';
        google.accounts.id.renderButton(box, { theme:'outline', size:'large', shape:'pill', width: box.clientWidth || 280, text:'signin_with', locale:'zh_CN' });
      });
    }
    if(window.google && window.google.accounts){ render(); return; }
    if(googleLoaded) return;
    googleLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client?hl=zh-CN';
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
  }

  document.addEventListener('click', (event)=>{
    const trigger = event.target.closest('[data-auth-open]');
    if(!trigger) return;
    event.preventDefault();
    open(trigger.dataset.authTab || '');
  });
  document.addEventListener('keydown', (event)=>{
    if(event.key === 'Escape'){
      closeDetail();
      close();
    }
  });

  window.MAOYANG_AUTH = {
    getToken: ()=>state.token,
    getState,
    open,
    refresh,
    requireLogin: ()=>{
      if(state.user) return true;
      open('login');
      return false;
    }
  };

  (async function init(){
    injectEntries();
    syncEntry();
    await loadConfig();
    await refresh();
    state.ready = true;
  })();
})();
