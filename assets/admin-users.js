(function(){
  const panel = document.querySelector('.adminPanel');
  const keyInput = document.querySelector('[data-admin-key]');
  if(!panel || !keyInput) return;

  let data = { users: [], codes: [], withdrawals: [] };
  let activeTab = 'orders';
  let modal = null;

  function one(s, r){ return (r || document).querySelector(s); }
  function all(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function safe(v){ return String(v == null ? '' : v); }
  function esc(v){ return safe(v).replace(/[&<>"']/g, (m)=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m])); }
  function money(v){ return '¥' + Number(v || 0).toFixed(2).replace(/\.00$/, ''); }
  function setStatus(el, text, warn){ if(!el) return; el.hidden = !text; el.textContent = text || ''; el.classList.toggle('warn', !!warn); }
  function codeLabel(code){ return code.type === 'product' ? ('商品 · ' + (code.productLabel || code.service || '')) : ('余额 · ' + money(code.amount)); }
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
  function injectStyles(){
    if(document.getElementById('adminAccountStyles')) return;
    const style = document.createElement('style');
    style.id = 'adminAccountStyles';
    style.textContent = '.adminAccountCard{cursor:pointer;font:inherit;text-align:left;width:100%}.adminAccountCard:focus-visible{outline:3px solid rgba(15,118,110,.18)}.adminAccountActions{display:flex;gap:8px;flex-wrap:wrap}.adminModalGrid{display:grid;gap:12px}.adminLedger{display:grid;gap:6px}.adminLedgerRow{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:start;padding:9px 0;border-bottom:1px solid var(--line-soft);font-size:12px}.adminLedgerRow b{color:var(--ink)}.adminLedgerRow span{color:#64748b;line-height:1.45}.adminLedgerRow em{font-style:normal;color:var(--teal-dark);font-weight:950;white-space:nowrap}.adminCreateGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.adminCreateBox{display:grid;gap:9px;border:1px solid var(--line);border-radius:12px;background:#fff;padding:12px}.adminCreateBox h3{margin:0;color:var(--ink);font-size:15px}.adminCreateBox label{display:grid;gap:5px;color:#344054;font-size:12px;font-weight:900}.adminCreateBox input,.adminCreateBox select,.adminCreateBox textarea,.adminModalGrid input,.adminModalGrid textarea{width:100%;border:1px solid var(--line);border-radius:9px;background:#fff;padding:10px 11px;font:inherit;font-size:15px}.adminCodeRows{display:grid;gap:6px}.adminCodeRow{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px;border:1px solid var(--line-soft);border-radius:10px}.adminCodeRow code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:var(--ink);word-break:break-all}.adminCodeRow small{display:block;color:#64748b;font-size:10.5px;font-weight:850}.adminCodeRow input{width:18px;height:18px;accent-color:var(--teal)}.adminModalActions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.adminModalActions.three{grid-template-columns:repeat(3,1fr)}@media(max-width:720px){.adminCreateGrid{grid-template-columns:1fr}.adminModalActions,.adminModalActions.three{grid-template-columns:1fr}.adminLedgerRow{grid-template-columns:1fr;gap:2px}.adminCodeRow{grid-template-columns:auto minmax(0,1fr)}}';
    document.head.appendChild(style);
  }
  function setup(){
    injectStyles();
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
    while(node){ const next = node.nextSibling; orderPanel.appendChild(node); node = next; }
    panel.appendChild(orderPanel);

    const usersPanel = document.createElement('section');
    usersPanel.className = 'adminSubPanel';
    usersPanel.dataset.adminPanel = 'users';
    usersPanel.hidden = true;
    usersPanel.innerHTML = '<div class="adminSubHead"><div><strong>用户余额</strong><span>点击用户后调整余额并查看流水</span></div><button type="button" class="adminGhost" data-admin-users-refresh>刷新</button></div><div class="adminStatus" data-admin-users-status hidden></div><div class="adminAccountGrid" data-admin-users-list></div>';
    panel.appendChild(usersPanel);

    const codesPanel = document.createElement('section');
    codesPanel.className = 'adminSubPanel';
    codesPanel.dataset.adminPanel = 'codes';
    codesPanel.hidden = true;
    codesPanel.innerHTML = '<div class="adminSubHead"><div><strong>兑换码</strong><span>按批次管理余额码与商品码</span></div><div class="adminAccountActions"><button type="button" class="adminSave" data-admin-code-create>创建兑换码</button><button type="button" class="adminGhost" data-admin-codes-refresh>刷新</button></div></div><div class="adminStatus" data-admin-codes-status hidden></div><div class="adminAccountGrid" data-admin-codes-list></div>';
    panel.appendChild(codesPanel);

    const withdrawalsPanel = document.createElement('section');
    withdrawalsPanel.className = 'adminSubPanel';
    withdrawalsPanel.dataset.adminPanel = 'withdrawals';
    withdrawalsPanel.hidden = true;
    withdrawalsPanel.innerHTML = '<div class="adminSubHead"><div><strong>提现审核</strong><span>点击申请后处理，并查看该用户流水</span></div><button type="button" class="adminGhost" data-admin-withdraw-refresh>刷新</button></div><div class="adminStatus" data-admin-withdraw-status hidden></div><div class="adminAccountGrid" data-admin-withdraw-list></div>';
    panel.appendChild(withdrawalsPanel);

    all('[data-admin-tab]', tabs).forEach((btn)=>btn.addEventListener('click', ()=>switchTab(btn.dataset.adminTab)));
    one('[data-admin-users-refresh]').addEventListener('click', loadAll);
    one('[data-admin-codes-refresh]').addEventListener('click', loadAll);
    one('[data-admin-withdraw-refresh]').addEventListener('click', loadAll);
    one('[data-admin-code-create]').addEventListener('click', openCreateCodes);
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
      data = await api('/api/admin-users', { method:'GET' });
      renderUsers();
      renderCodes();
      renderWithdrawals();
      setStatus(statusEl, '已更新后台数据');
    }catch(error){ setStatus(statusEl, errText(error), true); }
  }
  function ledgerHtml(user){
    const rows = Array.isArray(user && user.ledger) ? user.ledger : [];
    if(!rows.length) return '<div class="emptyState">暂无余额流水</div>';
    return '<div class="adminLedger">' + rows.map((item)=>'<div class="adminLedgerRow"><em>' + (Number(item.amount || 0) > 0 ? '+' : '') + money(item.amount) + '</em><span><b>' + esc(item.note || item.type || '') + '</b><br>' + esc(item.createdAtBeijing || item.createdAt || '') + '</span><b>' + money(item.balanceAfter) + '</b></div>').join('') + '</div>';
  }
  function findUserByWithdrawal(item){
    return (data.users || []).find((user)=>user.id === item.userId || String(user.email || '').toLowerCase() === String(item.email || '').toLowerCase()) || null;
  }
  function renderUsers(){
    const box = one('[data-admin-users-list]');
    if(!box) return;
    if(!data.users || !data.users.length){ box.innerHTML = '<div class="emptyState">暂无用户</div>'; return; }
    box.innerHTML = data.users.map((user, index)=>'<button type="button" class="adminAccountCard" data-user-index="' + index + '">' +
      '<div class="adminAccountTop"><div><strong>' + esc(user.email) + '</strong><span>' + esc(user.name || '未填写称呼') + ' · ' + esc(user.status || 'active') + '</span></div><b>' + money(user.balance) + '</b></div>' +
      '<div class="adminAccountMeta"><span>订单 ' + (user.orderCount || 0) + '</span><span>累计 ' + money(user.totalPaid || 0) + '</span><span>流水 ' + ((user.ledger || []).length) + '</span></div>' +
    '</button>').join('');
    all('[data-user-index]', box).forEach((btn)=>btn.addEventListener('click', ()=>openUser(data.users[Number(btn.dataset.userIndex)])));
  }
  function groupCodes(){
    const map = new Map();
    (data.codes || []).forEach((code)=>{
      const id = code.batchId || code.id;
      if(!map.has(id)) map.set(id, { id, name:code.batchName || code.note || codeLabel(code), type:code.type, amount:code.amount, service:code.service, codes:[] });
      map.get(id).codes.push(code);
    });
    return Array.from(map.values()).sort((a,b)=>String((b.codes[0]||{}).createdAt || '').localeCompare(String((a.codes[0]||{}).createdAt || '')));
  }
  function renderCodes(){
    const box = one('[data-admin-codes-list]');
    if(!box) return;
    const batches = groupCodes();
    if(!batches.length){ box.innerHTML = '<div class="emptyState">暂无兑换码批次</div>'; return; }
    box.innerHTML = batches.map((batch, index)=>{
      const used = batch.codes.reduce((sum, code)=>sum + Number(code.usedCount || 0), 0);
      const disabled = batch.codes.filter((code)=>code.status === 'disabled').length;
      const sample = batch.codes[0] || {};
      return '<button type="button" class="adminAccountCard" data-batch-index="' + index + '">' +
        '<div class="adminAccountTop"><div><strong>' + esc(batch.name) + '</strong><span>' + esc(codeLabel(sample)) + '</span></div><b>' + batch.codes.length + ' 个</b></div>' +
        '<div class="adminAccountMeta"><span>已用 ' + used + '</span><span>作废 ' + disabled + '</span><span>' + esc(sample.createdAtBeijing || '') + '</span></div>' +
      '</button>';
    }).join('');
    all('[data-batch-index]', box).forEach((btn)=>btn.addEventListener('click', ()=>openBatch(groupCodes()[Number(btn.dataset.batchIndex)])));
  }
  function renderWithdrawals(){
    const box = one('[data-admin-withdraw-list]');
    if(!box) return;
    const list = data.withdrawals || [];
    if(!list.length){ box.innerHTML = '<div class="emptyState">暂无提现申请</div>'; return; }
    box.innerHTML = list.map((item, index)=>'<button type="button" class="adminAccountCard" data-withdraw-index="' + index + '">' +
      '<div class="adminAccountTop"><div><strong>' + esc(item.email) + '</strong><span>' + esc(item.createdAtBeijing || '') + ' · ' + esc(item.status || 'pending') + '</span></div><b>' + money(item.amount) + '</b></div>' +
      '<div class="adminAccountMeta"><span>' + esc(item.method || '') + '</span><span>' + esc(item.name || '') + '</span><span>' + esc(item.account || '') + '</span></div>' +
    '</button>').join('');
    all('[data-withdraw-index]', box).forEach((btn)=>btn.addEventListener('click', ()=>openWithdrawal(list[Number(btn.dataset.withdrawIndex)])));
  }
  function openModal(title, label, body){
    closeModal();
    modal = document.createElement('div');
    modal.className = 'adminModal';
    modal.innerHTML = '<div class="adminModalBackdrop" data-close></div><section class="adminModalPanel" role="dialog" aria-modal="true"><div class="adminModalHead"><div><span>' + esc(label || '') + '</span><strong>' + esc(title || '') + '</strong></div><button type="button" class="adminModalClose" data-close aria-label="关闭弹窗">×</button></div><div class="adminModalBody">' + body + '</div></section>';
    document.body.appendChild(modal);
    document.body.classList.add('adminModalOpen');
    all('[data-close]', modal).forEach((btn)=>btn.addEventListener('click', closeModal));
  }
  function closeModal(){ if(modal){ modal.remove(); modal = null; document.body.classList.remove('adminModalOpen'); } }
  function openUser(user){
    openModal(user.email, '用户余额', '<form class="adminModalGrid" data-user-adjust><input name="amount" inputmode="decimal" placeholder="+10 或 -5"><textarea name="note" rows="2" placeholder="调整备注"></textarea><div class="adminModalActions"><button type="submit" class="adminSave">保存调整</button><button type="button" class="adminGhost" data-toggle-user="' + esc(user.id) + '" data-next-status="' + (user.status === 'disabled' ? 'active' : 'disabled') + '">' + (user.status === 'disabled' ? '启用用户' : '停用用户') + '</button></div></form><h3>余额流水</h3>' + ledgerHtml(user));
    one('[data-user-adjust]', modal).addEventListener('submit', async (event)=>{
      event.preventDefault();
      const body = Object.fromEntries(new FormData(event.currentTarget).entries());
      body.action = 'adjust_balance';
      body.userId = user.id;
      try{ await api('/api/admin-user-update', { method:'POST', body:JSON.stringify(body) }); await loadAll(); closeModal(); }
      catch(error){ alert(errText(error)); }
    });
    one('[data-toggle-user]', modal).addEventListener('click', async (event)=>{
      const btn = event.currentTarget;
      try{ await api('/api/admin-user-update', { method:'POST', body:JSON.stringify({ action:'set_user_status', userId:user.id, status:btn.dataset.nextStatus }) }); await loadAll(); closeModal(); }
      catch(error){ alert(errText(error)); }
    });
  }
  function openCreateCodes(){
    const balanceForm = '<form class="adminCreateBox" data-create-code="balance" data-code-pane="balance"><label>批次名称<input name="batchName" placeholder="例如 5 月余额码"></label><label>余额金额<input name="amount" inputmode="decimal" placeholder="例如 20" required></label><label>生成数量<input name="count" inputmode="numeric" placeholder="留空为 1"></label><label>自定义兑换码<textarea name="codes" rows="3" placeholder="可填多个，空格/换行分隔；留空随机"></textarea></label><label>每码可用次数<input name="maxUses" inputmode="numeric" placeholder="默认 1"></label><label>过期时间<input name="expiresAt" placeholder="可留空"></label><label>备注<input name="note" placeholder="后台备注"></label><button class="adminSave" type="submit">创建余额码</button></form>';
    const productForm = '<form class="adminCreateBox" data-create-code="product" data-code-pane="product" hidden><label>批次名称<input name="batchName" placeholder="例如 Spotify 商品码"></label><label>兑换商品<select name="service"><option value="spotify">Spotify</option><option value="netflix">Netflix</option><option value="disney">Disney+</option><option value="hbomax">HBO Max</option><option value="chatgpt">ChatGPT Plus</option><option value="network">网络节点</option></select></label><label>生成数量<input name="count" inputmode="numeric" placeholder="留空为 1"></label><label>自定义兑换码<textarea name="codes" rows="3" placeholder="可填多个，空格/换行分隔；留空随机"></textarea></label><label>每码可用次数<input name="maxUses" inputmode="numeric" placeholder="默认 1"></label><label>过期时间<input name="expiresAt" placeholder="可留空"></label><label>备注<input name="note" placeholder="后台备注"></label><button class="adminSave" type="submit">创建商品码</button></form>';
    openModal('创建兑换码', '兑换码', '<div class="adminCodeTabs"><button type="button" class="active" data-code-tab="balance">余额兑换码</button><button type="button" data-code-tab="product">商品兑换码</button></div>' + balanceForm + productForm);
    all('[data-code-tab]', modal).forEach((btn)=>btn.addEventListener('click', ()=>{
      const name = btn.dataset.codeTab;
      all('[data-code-tab]', modal).forEach((b)=>b.classList.toggle('active', b.dataset.codeTab === name));
      all('[data-code-pane]', modal).forEach((p)=>p.hidden = p.dataset.codePane !== name);
    }));
    all('[data-create-code]', modal).forEach((form)=>form.addEventListener('submit', async (event)=>{
      event.preventDefault();
      const body = Object.fromEntries(new FormData(event.currentTarget).entries());
      body.action = 'code_create_batch';
      body.type = event.currentTarget.dataset.createCode;
      try{ await api('/api/admin-user-update', { method:'POST', body:JSON.stringify(body) }); await loadAll(); closeModal(); }
      catch(error){ alert(errText(error)); }
    }));
  }
  function copyText(text){
    if(navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.left = '-9999px';
    document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    return Promise.resolve();
  }
  function openBatch(batch){
    const codesText = batch.codes.map((c)=>c.code).join('\n');
    openModal(batch.name, '兑换码批次',
      '<div class="adminBatchActions">' +
        '<button type="button" class="adminGhost" data-select-all-codes>全选</button>' +
        '<button type="button" class="adminGhost" data-copy-all-codes>复制全部</button>' +
        '<button type="button" class="adminGhost" data-disable-selected>作废所选</button>' +
        '<button type="button" class="adminDanger" data-delete-selected>删除所选</button>' +
        '<button type="button" class="adminGhost" data-disable-batch>作废整批</button>' +
        '<button type="button" class="adminDanger" data-delete-batch>删除整批</button>' +
      '</div>' +
      '<div class="adminCodeRows">' + batch.codes.map((code)=>
        '<label class="adminCodeRow">' +
          '<input type="checkbox" value="' + esc(code.id) + '">' +
          '<span><code>' + esc(code.code) + '</code><small>' + esc(code.status || 'active') + ' · 已用 ' + (code.usedCount || 0) + ' / ' + (code.maxUses || 1) + '</small></span>' +
          '<b>' + esc(codeLabel(code)) + '</b>' +
          '<button type="button" class="adminCodeCopy" data-copy="' + esc(code.code) + '">复制</button>' +
        '</label>'
      ).join('') + '</div>'
    );
    const selected = ()=>all('.adminCodeRow input[type=checkbox]:checked', modal).map((input)=>input.value);
    one('[data-select-all-codes]', modal).addEventListener('click', ()=>{
      const inputs = all('.adminCodeRow input[type=checkbox]', modal);
      const allChecked = inputs.every((i)=>i.checked);
      inputs.forEach((input)=>input.checked = !allChecked);
    });
    one('[data-copy-all-codes]', modal).addEventListener('click', (event)=>{
      const btn = event.currentTarget;
      copyText(codesText).then(()=>{
        const original = btn.textContent;
        btn.textContent = '已复制 ' + batch.codes.length + ' 个';
        setTimeout(()=>{ btn.textContent = original; }, 1500);
      });
    });
    all('[data-copy]', modal).forEach((btn)=>{
      btn.addEventListener('click', (event)=>{
        event.preventDefault();
        event.stopPropagation();
        copyText(btn.dataset.copy).then(()=>{
          btn.classList.add('copied');
          const original = btn.textContent;
          btn.textContent = '已复制';
          setTimeout(()=>{ btn.textContent = original; btn.classList.remove('copied'); }, 1200);
        });
      });
    });
    one('[data-disable-selected]', modal).addEventListener('click', async ()=>{ const ids = selected(); if(!ids.length) return; await api('/api/admin-user-update',{method:'POST',body:JSON.stringify({action:'code_bulk_status', ids, status:'disabled'})}); await loadAll(); closeModal(); });
    one('[data-delete-selected]', modal).addEventListener('click', async ()=>{ const ids = selected(); if(!ids.length || !confirm('确认删除所选兑换码？')) return; await api('/api/admin-user-update',{method:'POST',body:JSON.stringify({action:'code_bulk_delete', ids})}); await loadAll(); closeModal(); });
    one('[data-disable-batch]', modal).addEventListener('click', async ()=>{ await api('/api/admin-user-update',{method:'POST',body:JSON.stringify({action:'code_batch_status', batchId:batch.id, status:'disabled'})}); await loadAll(); closeModal(); });
    one('[data-delete-batch]', modal).addEventListener('click', async ()=>{ if(!confirm('确认删除整批兑换码？')) return; await api('/api/admin-user-update',{method:'POST',body:JSON.stringify({action:'code_batch_delete', batchId:batch.id})}); await loadAll(); closeModal(); });
  }
  function openWithdrawal(item){
    const user = findUserByWithdrawal(item);
    openModal(item.email, '提现审核', '<div class="adminModalGrid"><div class="adminReadonly">金额：' + money(item.amount) + '<br>方式：' + esc(item.method || '') + '<br>账户：' + esc(item.account || '') + '<br>状态：' + esc(item.status || 'pending') + '</div><textarea data-withdraw-note rows="2" placeholder="处理备注"></textarea>' + (item.status === 'pending' ? '<div class="adminModalActions"><button type="button" class="adminSave" data-withdraw-status="approved">批准提现</button><button type="button" class="adminDanger" data-withdraw-status="rejected">驳回并退回余额</button></div>' : '') + '<h3>该用户余额流水</h3>' + ledgerHtml(user) + '</div>');
    all('[data-withdraw-status]', modal).forEach((btn)=>btn.addEventListener('click', async ()=>{
      try{
        await api('/api/admin-user-update', { method:'POST', body:JSON.stringify({ action:'withdrawal_update', withdrawalId:item.id, status:btn.dataset.withdrawStatus, note:(one('[data-withdraw-note]', modal) || {}).value || '' }) });
        await loadAll(); closeModal();
      }catch(error){ alert(errText(error)); }
    }));
  }

  setup();
  const form = document.querySelector('[data-admin-form]');
  if(form) form.addEventListener('submit', ()=>setTimeout(loadAll, 250));
  const saved = sessionStorage.getItem('maoyangAdminKey');
  if(saved) setTimeout(loadAll, 350);
})();
