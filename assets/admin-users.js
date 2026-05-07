(function(){
  const panel = document.querySelector('.adminPanel');
  const keyInput = document.querySelector('[data-admin-key]');
  if(!panel || !keyInput) return;

  let data = { users: [], codes: [], withdrawals: [] };
  let activeTab = 'orders';

  function one(s, r){ return (r || document).querySelector(s); }
  function all(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function safe(v){ return String(v == null ? '' : v); }
  function esc(v){ return safe(v).replace(/[&<>"']/g, (m)=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m])); }
  function money(v){ return '¥' + Number(v || 0).toFixed(2).replace(/\.00$/, ''); }
  function setStatus(el, text, warn){ if(!el) return; el.hidden = !text; el.textContent = text || ''; el.classList.toggle('warn', !!warn); }
  function errText(error){
    const map = {
      unauthorized:'管理密钥不正确',
      storage_not_configured:'订单存储尚未连接',
      user_not_found:'用户不存在',
      invalid_amount:'金额无效',
      withdrawal_not_found:'提现申请不存在',
      withdrawal_already_handled:'提现申请已处理',
      invalid_service:'商品类型无效',
      code_exists:'兑换码已存在',
      code_not_found:'兑换码不存在'
    };
    return map[error && error.message] || '操作失败，请检查配置后重试';
  }
  async function api(url, options){
    const opts = options || {};
    opts.headers = Object.assign({ 'x-admin-key': keyInput.value.trim() }, opts.body ? { 'Content-Type':'application/json' } : {}, opts.headers || {});
    const response = await fetch(url, opts);
    const json = await response.json().catch(()=>({ ok:false, error:'bad_response' }));
    if(!response.ok || !json.ok) throw new Error(json.error || 'request_failed');
    return json;
  }
  function setup(){
    if(one('[data-admin-tabs]', panel)) return;
    const h1 = panel.querySelector('h1');
    const tabs = document.createElement('div');
    tabs.className = 'adminTabs';
    tabs.dataset.adminTabs = '1';
    tabs.innerHTML = '<button type="button" class="active" data-admin-tab="orders">订单</button><button type="button" data-admin-tab="users">用户余额</button><button type="button" data-admin-tab="codes">兑换码</button><button type="button" data-admin-tab="withdrawals">提现</button>';
    h1.after(tabs);
    const sharedForm = panel.querySelector('[data-admin-form]');
    if(sharedForm) tabs.after(sharedForm);

    const orderPanel = document.createElement('div');
    orderPanel.dataset.adminPanel = 'orders';
    let node = sharedForm ? sharedForm.nextSibling : tabs.nextSibling;
    while(node){
      const next = node.nextSibling;
      orderPanel.appendChild(node);
      node = next;
    }
    panel.appendChild(orderPanel);

    const usersPanel = document.createElement('section');
    usersPanel.className = 'adminSubPanel';
    usersPanel.dataset.adminPanel = 'users';
    usersPanel.hidden = true;
    usersPanel.innerHTML = '<div class="adminSubHead"><div><strong>用户余额</strong><span>查询用户、余额、订单与手动调整</span></div><button type="button" class="adminGhost" data-admin-users-refresh>刷新</button></div><div class="adminStatus" data-admin-users-status hidden></div><div class="adminAccountGrid" data-admin-users-list></div>';
    panel.appendChild(usersPanel);

    const codesPanel = document.createElement('section');
    codesPanel.className = 'adminSubPanel';
    codesPanel.dataset.adminPanel = 'codes';
    codesPanel.hidden = true;
    codesPanel.innerHTML = '<div class="adminSubHead"><div><strong>兑换码</strong><span>创建余额兑换码或商品兑换码</span></div><button type="button" class="adminGhost" data-admin-codes-refresh>刷新</button></div><div class="adminStatus" data-admin-codes-status hidden></div><form class="adminCodeForm" data-admin-code-form><input name="code" placeholder="自定义兑换码，可留空"><select name="type"><option value="balance">余额码</option><option value="product">商品码</option></select><input name="amount" inputmode="decimal" placeholder="余额金额"><select name="service"><option value="spotify">Spotify</option><option value="netflix">Netflix</option><option value="disney">Disney+</option><option value="hbomax">HBO Max</option><option value="chatgpt">ChatGPT Plus</option><option value="network">网络节点</option></select><input name="maxUses" inputmode="numeric" placeholder="可用次数，默认 1"><input name="expiresAt" placeholder="过期时间，可留空"><input name="note" placeholder="备注"><button type="submit" class="adminSave">创建兑换码</button></form><div class="adminAccountGrid" data-admin-codes-list></div>';
    panel.appendChild(codesPanel);

    const withdrawalsPanel = document.createElement('section');
    withdrawalsPanel.className = 'adminSubPanel';
    withdrawalsPanel.dataset.adminPanel = 'withdrawals';
    withdrawalsPanel.hidden = true;
    withdrawalsPanel.innerHTML = '<div class="adminSubHead"><div><strong>提现审核</strong><span>批准或驳回用户余额提现</span></div><button type="button" class="adminGhost" data-admin-withdraw-refresh>刷新</button></div><div class="adminStatus" data-admin-withdraw-status hidden></div><div class="adminAccountGrid" data-admin-withdraw-list></div>';
    panel.appendChild(withdrawalsPanel);

    all('[data-admin-tab]', tabs).forEach((btn)=>btn.addEventListener('click', ()=>switchTab(btn.dataset.adminTab)));
    one('[data-admin-users-refresh]').addEventListener('click', loadAll);
    one('[data-admin-codes-refresh]').addEventListener('click', loadAll);
    one('[data-admin-withdraw-refresh]').addEventListener('click', loadAll);
    one('[data-admin-code-form]').addEventListener('submit', createCode);
  }
  function switchTab(name){
    activeTab = name;
    all('[data-admin-tab]').forEach((btn)=>btn.classList.toggle('active', btn.dataset.adminTab === name));
    all('[data-admin-panel]', panel).forEach((p)=>p.hidden = p.dataset.adminPanel !== name);
    if(name !== 'orders' && keyInput.value.trim()) loadAll();
  }
  async function loadAll(){
    const key = keyInput.value.trim();
    if(!key) return;
    const statusEl = one('[data-admin-' + (activeTab === 'withdrawals' ? 'withdraw' : activeTab) + '-status]');
    setStatus(statusEl, '正在读取...');
    try{
      const result = await api('/api/admin-users', { method:'GET' });
      data = result;
      renderUsers();
      renderCodes();
      renderWithdrawals();
      setStatus(statusEl, '已更新后台数据');
    }catch(error){ setStatus(statusEl, errText(error), true); }
  }
  function renderUsers(){
    const box = one('[data-admin-users-list]');
    if(!box) return;
    if(!data.users || !data.users.length){ box.innerHTML = '<div class="emptyState">暂无用户</div>'; return; }
    box.innerHTML = data.users.map((user)=>'<article class="adminAccountCard">' +
      '<div class="adminAccountTop"><div><strong>' + esc(user.email) + '</strong><span>' + esc(user.name || '未填写称呼') + ' · ' + esc(user.status || 'active') + '</span></div><b>' + money(user.balance) + '</b></div>' +
      '<div class="adminAccountMeta"><span>订单 ' + (user.orderCount || 0) + '</span><span>累计 ' + money(user.totalPaid || 0) + '</span><span>' + esc(user.lastOrderAtBeijing || '暂无订单') + '</span></div>' +
      '<form class="adminInlineForm" data-adjust-user="' + esc(user.id) + '"><input name="amount" inputmode="decimal" placeholder="+10 或 -5"><input name="note" placeholder="调整备注"><button type="submit" class="adminSave">调余额</button></form>' +
      '<button type="button" class="adminGhost" data-toggle-user="' + esc(user.id) + '" data-next-status="' + (user.status === 'disabled' ? 'active' : 'disabled') + '">' + (user.status === 'disabled' ? '启用用户' : '停用用户') + '</button>' +
    '</article>').join('');
    all('[data-adjust-user]', box).forEach((form)=>form.addEventListener('submit', adjustBalance));
    all('[data-toggle-user]', box).forEach((btn)=>btn.addEventListener('click', toggleUser));
  }
  function renderCodes(){
    const box = one('[data-admin-codes-list]');
    if(!box) return;
    if(!data.codes || !data.codes.length){ box.innerHTML = '<div class="emptyState">暂无兑换码</div>'; return; }
    box.innerHTML = data.codes.map((code)=>'<article class="adminAccountCard">' +
      '<div class="adminAccountTop"><div><strong>' + esc(code.code) + '</strong><span>' + (code.type === 'product' ? ('商品码 · ' + esc(code.service)) : ('余额码 · ' + money(code.amount))) + '</span></div><b>' + esc(code.status || 'active') + '</b></div>' +
      '<div class="adminAccountMeta"><span>已用 ' + (code.usedCount || 0) + ' / ' + (code.maxUses || 1) + '</span><span>' + esc(code.expiresAt || '不限期') + '</span><span>' + esc(code.note || '') + '</span></div>' +
      '<button type="button" class="adminGhost" data-code-status="' + esc(code.code) + '" data-next-status="' + (code.status === 'disabled' ? 'active' : 'disabled') + '">' + (code.status === 'disabled' ? '启用' : '停用') + '</button>' +
    '</article>').join('');
    all('[data-code-status]', box).forEach((btn)=>btn.addEventListener('click', toggleCode));
  }
  function renderWithdrawals(){
    const box = one('[data-admin-withdraw-list]');
    if(!box) return;
    const list = data.withdrawals || [];
    if(!list.length){ box.innerHTML = '<div class="emptyState">暂无提现申请</div>'; return; }
    box.innerHTML = list.map((item)=>'<article class="adminAccountCard">' +
      '<div class="adminAccountTop"><div><strong>' + esc(item.email) + '</strong><span>' + esc(item.createdAtBeijing || '') + ' · ' + esc(item.status || 'pending') + '</span></div><b>' + money(item.amount) + '</b></div>' +
      '<div class="adminAccountMeta"><span>' + esc(item.method || '') + '</span><span>' + esc(item.name || '') + '</span><span>' + esc(item.account || '') + '</span></div>' +
      (item.note ? '<div class="adminAccountNote">' + esc(item.note) + '</div>' : '') +
      (item.status === 'pending' ? '<div class="adminCardActions"><button type="button" class="adminSave" data-withdraw-action="' + esc(item.id) + '" data-status="approved">批准</button><button type="button" class="adminDanger" data-withdraw-action="' + esc(item.id) + '" data-status="rejected">驳回</button></div>' : '<div class="adminAccountNote">' + esc(item.adminNote || '已处理') + '</div>') +
    '</article>').join('');
    all('[data-withdraw-action]', box).forEach((btn)=>btn.addEventListener('click', updateWithdrawal));
  }
  async function adjustBalance(event){
    event.preventDefault();
    const form = event.currentTarget;
    const statusEl = one('[data-admin-users-status]');
    try{
      const body = Object.fromEntries(new FormData(form).entries());
      body.action = 'adjust_balance';
      body.userId = form.dataset.adjustUser;
      await api('/api/admin-user-update', { method:'POST', body:JSON.stringify(body) });
      setStatus(statusEl, '余额已调整');
      await loadAll();
    }catch(error){ setStatus(statusEl, errText(error), true); }
  }
  async function toggleUser(event){
    const btn = event.currentTarget;
    const statusEl = one('[data-admin-users-status]');
    try{
      await api('/api/admin-user-update', { method:'POST', body:JSON.stringify({ action:'set_user_status', userId:btn.dataset.toggleUser, status:btn.dataset.nextStatus }) });
      setStatus(statusEl, '用户状态已更新');
      await loadAll();
    }catch(error){ setStatus(statusEl, errText(error), true); }
  }
  async function createCode(event){
    event.preventDefault();
    const statusEl = one('[data-admin-codes-status]');
    try{
      const body = Object.fromEntries(new FormData(event.currentTarget).entries());
      body.action = 'code_create';
      await api('/api/admin-user-update', { method:'POST', body:JSON.stringify(body) });
      event.currentTarget.reset();
      setStatus(statusEl, '兑换码已创建');
      await loadAll();
    }catch(error){ setStatus(statusEl, errText(error), true); }
  }
  async function toggleCode(event){
    const btn = event.currentTarget;
    const statusEl = one('[data-admin-codes-status]');
    try{
      await api('/api/admin-user-update', { method:'POST', body:JSON.stringify({ action:'code_status', code:btn.dataset.codeStatus, status:btn.dataset.nextStatus }) });
      setStatus(statusEl, '兑换码状态已更新');
      await loadAll();
    }catch(error){ setStatus(statusEl, errText(error), true); }
  }
  async function updateWithdrawal(event){
    const btn = event.currentTarget;
    const statusEl = one('[data-admin-withdraw-status]');
    try{
      await api('/api/admin-user-update', { method:'POST', body:JSON.stringify({ action:'withdrawal_update', withdrawalId:btn.dataset.withdrawAction, status:btn.dataset.status }) });
      setStatus(statusEl, '提现状态已更新');
      await loadAll();
    }catch(error){ setStatus(statusEl, errText(error), true); }
  }

  setup();
  const form = document.querySelector('[data-admin-form]');
  if(form) form.addEventListener('submit', ()=>setTimeout(loadAll, 250));
  const saved = sessionStorage.getItem('maoyangAdminKey');
  if(saved) setTimeout(loadAll, 350);
})();
