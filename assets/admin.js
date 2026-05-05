(function(){
  const form = document.querySelector('[data-admin-form]');
  const keyInput = document.querySelector('[data-admin-key]');
  const statusBox = document.querySelector('[data-admin-status]');
  const tableBody = document.querySelector('[data-order-rows]');
  const emptyState = document.querySelector('[data-empty-state]');
  if(!form || !keyInput || !statusBox || !tableBody) return;

  const FULFILLABLE = new Set(['netflix', 'disney', 'hbomax', 'chatgpt']);
  let currentOrders = [];

  function setStatus(text, warn){
    statusBox.textContent = text;
    statusBox.classList.toggle('warn', !!warn);
    statusBox.hidden = !text;
  }
  function safe(v){ return String(v == null ? '' : v); }
  function money(v){ return '￥' + safe(v || 0); }
  function paid(o){
    if(o.paymentMethod === 'usdt') return safe(o.paidAmount || o.finalUsdt || o.finalAmount) + ' USDT';
    return money(o.paidAmount || o.finalAmount);
  }
  function statusText(o){
    if(o.statusLabel) return o.statusLabel;
    if(o.status === 'completed') return '已完成充值';
    if(o.status === 'cancelled') return '已取消';
    return '待处理';
  }
  function statusClass(o){
    if(o.status === 'completed') return ' completed';
    if(o.status === 'cancelled') return ' cancelled';
    return '';
  }
  function orderTime(o){
    if(o.createdAtBeijing) return o.createdAtBeijing;
    if(!o.createdAt) return '';
    return new Date(o.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) + ' 北京时间';
  }
  function orderItems(o){
    if(Array.isArray(o.items) && o.items.length > 0) return o.items;
    return [{
      service: o.service || '',
      label: o.serviceLabel || o.service || '订单',
      cycle: o.cycle || '',
      amount: o.finalAmount || 0,
      account: o.account || '',
      password: o.password || ''
    }];
  }
  function itemsLabel(o){
    return orderItems(o).map((it)=>it.label || it.service).join(' + ');
  }
  function itemsCreds(o){
    return orderItems(o).map((it)=>{
      const lbl = it.label || it.service;
      if(it.subscriptionLinks) return lbl + ': 订阅名 ' + (it.account || o.orderId);
      if(it.account && it.password) return lbl + ': ' + it.account + ' / ' + it.password;
      if(it.account) return lbl + ': ' + it.account;
      return lbl + ': --';
    }).join('\n');
  }
  function setCellText(tr, label, text){
    const td = document.createElement('td');
    td.dataset.label = label;
    td.style.whiteSpace = 'pre-wrap';
    td.textContent = safe(text);
    tr.appendChild(td);
    return td;
  }
  function removeEditors(){
    tableBody.querySelectorAll('.adminEditRow').forEach((row)=>row.remove());
  }

  function render(orders){
    currentOrders = orders || [];
    tableBody.innerHTML = '';
    emptyState.hidden = currentOrders.length > 0;
    currentOrders.forEach((o)=>{
      const tr = document.createElement('tr');

      const statusTd = document.createElement('td');
      statusTd.dataset.label = '状态';
      const pill = document.createElement('span');
      pill.className = 'adminStatusPill' + statusClass(o);
      pill.textContent = statusText(o);
      statusTd.appendChild(pill);
      tr.appendChild(statusTd);

      const actionTd = document.createElement('td');
      actionTd.dataset.label = '操作';
      const actionBtn = document.createElement('button');
      actionBtn.type = 'button';
      actionBtn.className = 'adminAction';
      actionBtn.textContent = '处理';
      actionBtn.addEventListener('click', ()=>toggleEditor(o, tr));
      actionTd.appendChild(actionBtn);
      tr.appendChild(actionTd);

      [
        ['时间', orderTime(o)],
        ['订单号', o.orderId],
        ['服务', itemsLabel(o) + (o.discountLabel ? '\n(' + o.discountLabel + ')' : '')],
        ['支付', o.paymentMethod === 'usdt' ? 'USDT' : '支付宝'],
        ['应付', paid(o)],
        ['交付信息', itemsCreds(o)],
        ['邮箱', o.email || ''],
        ['联系方式', o.contact || '--'],
        ['备注', [o.remark ? ('用户备注: ' + o.remark) : '', o.adminNote ? ('内部备注: ' + o.adminNote) : ''].filter(Boolean).join('\n')]
      ].forEach(([label, value])=>setCellText(tr, label, value));

      tableBody.appendChild(tr);
    });
  }

  function field(label, input){
    const wrap = document.createElement('label');
    const span = document.createElement('span');
    span.textContent = label;
    wrap.appendChild(span);
    wrap.appendChild(input);
    return wrap;
  }
  function textInput(value, name, type){
    const input = document.createElement('input');
    input.name = name;
    input.type = type || 'text';
    input.value = safe(value);
    input.autocomplete = 'off';
    return input;
  }
  function textArea(value, name, rows){
    const input = document.createElement('textarea');
    input.name = name;
    input.rows = rows || 2;
    input.value = safe(value);
    return input;
  }

  function toggleEditor(order, afterRow){
    const next = afterRow.nextElementSibling;
    if(next && next.classList.contains('adminEditRow')){
      next.remove();
      return;
    }
    removeEditors();

    const editorRow = document.createElement('tr');
    editorRow.className = 'adminEditRow';
    const td = document.createElement('td');
    td.colSpan = 11;
    editorRow.appendChild(td);

    const box = document.createElement('form');
    box.className = 'adminEditBox';
    box.dataset.orderId = order.orderId || '';

    const top = document.createElement('div');
    top.className = 'adminEditTop';

    const statusSelect = document.createElement('select');
    statusSelect.name = 'status';
    [
      ['pending', '待处理'],
      ['completed', '已完成充值'],
      ['cancelled', '已取消']
    ].forEach(([value, label])=>{
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      option.selected = (order.status || 'pending') === value;
      statusSelect.appendChild(option);
    });
    top.appendChild(field('订单状态', statusSelect));
    top.appendChild(field('发给用户的开通备注', textArea(order.fulfillmentNote || '', 'fulfillmentNote', 2)));
    top.appendChild(field('内部备注', textArea(order.adminNote || '', 'adminNote', 2)));
    box.appendChild(top);

    const grid = document.createElement('div');
    grid.className = 'adminFulfillGrid';
    orderItems(order).forEach((it, index)=>{
      const card = document.createElement('div');
      card.className = 'adminFulfillCard';
      const title = document.createElement('strong');
      title.textContent = it.label || it.service || '服务';
      card.appendChild(title);

      if(FULFILLABLE.has(it.service)){
        const account = textInput(it.account || '', 'account', 'text');
        account.dataset.index = index;
        account.dataset.service = it.service;
        const password = textInput(it.password || '', 'password', 'text');
        password.dataset.index = index;
        password.dataset.service = it.service;
        card.appendChild(field('交付账号', account));
        card.appendChild(field('交付密码', password));
      }else{
        const readonly = document.createElement('div');
        readonly.className = 'adminReadonly';
        if(it.service === 'network'){
          readonly.textContent = '网络节点无需用户设置用户名，订阅名固定使用订单号：' + (order.orderId || '');
        }else if(it.service === 'spotify'){
          readonly.textContent = 'Spotify 使用用户提交的账号密码处理，联系方式仅此服务需要。';
        }else{
          readonly.textContent = '此服务无需后台填写账号密码。';
        }
        card.appendChild(readonly);
      }
      grid.appendChild(card);
    });
    box.appendChild(grid);

    const actions = document.createElement('div');
    actions.className = 'adminEditActions';
    const resend = document.createElement('label');
    resend.className = 'adminCheck';
    const resendInput = document.createElement('input');
    resendInput.type = 'checkbox';
    resendInput.name = 'resendEmail';
    const resendText = document.createElement('span');
    resendText.textContent = '若订单已完成，重新发送完成邮件';
    resend.appendChild(resendInput);
    resend.appendChild(resendText);

    const save = document.createElement('button');
    save.type = 'submit';
    save.className = 'adminSave';
    save.textContent = '保存订单';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'adminGhost';
    cancel.textContent = '收起';
    cancel.addEventListener('click', ()=>editorRow.remove());
    actions.appendChild(save);
    actions.appendChild(cancel);
    actions.appendChild(resend);
    box.appendChild(actions);

    box.addEventListener('submit', (event)=>saveOrder(event, order.orderId, box, save));

    td.appendChild(box);
    afterRow.after(editorRow);
  }

  function collectItems(box){
    const byKey = {};
    box.querySelectorAll('[data-service][data-index]').forEach((input)=>{
      const key = input.dataset.index + '|' + input.dataset.service;
      if(!byKey[key]) byKey[key] = { index: Number(input.dataset.index), service: input.dataset.service };
      byKey[key][input.name] = input.value.trim();
    });
    return Object.keys(byKey).map((key)=>byKey[key]);
  }

  async function saveOrder(event, orderId, box, saveButton){
    event.preventDefault();
    const key = keyInput.value.trim();
    if(!key){ setStatus('请输入管理密钥。', true); return; }

    const payload = {
      orderId,
      status: box.querySelector('[name=status]').value,
      fulfillmentNote: box.querySelector('[name=fulfillmentNote]').value.trim(),
      adminNote: box.querySelector('[name=adminNote]').value.trim(),
      resendEmail: box.querySelector('[name=resendEmail]').checked,
      items: collectItems(box)
    };

    saveButton.disabled = true;
    const original = saveButton.textContent;
    saveButton.textContent = '保存中...';
    try{
      const response = await fetch('/api/order-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if(!response.ok || !data.ok){
        const error = new Error(data.error || '保存失败');
        error.missing = data.missing || [];
        throw error;
      }
      const emailNote = data.email
        ? (data.email.ok ? '完成邮件已发送。' : '订单已保存，但完成邮件发送失败：' + (data.email.reason || data.email.error || '未知错误') + '。')
        : '订单已保存。';
      await loadOrders(key);
      setStatus(emailNote, !!(data.email && !data.email.ok));
    }catch(error){
      if(error.message === 'missing_fulfillment'){
        setStatus('标记已完成前，请先填写这些服务的交付账号和密码：' + (error.missing || []).join('、'), true);
      }else{
        setStatus(errorMessage(error), true);
      }
    }finally{
      saveButton.disabled = false;
      saveButton.textContent = original;
    }
  }

  async function loadOrders(key){
    setStatus('正在读取订单...', false);
    const response = await fetch('/api/orders', { headers: { 'x-admin-key': key } });
    const data = await response.json();
    if(!response.ok || !data.ok) throw new Error(data.error || '读取失败');
    if(!data.configured){
      render([]);
      setStatus('订单存储尚未连接。', true);
      return;
    }
    render(data.orders || []);
    setStatus('已读取 ' + (data.orders || []).length + ' 条订单。', false);
  }

  function keyFromLocation(){
    const queryKey = new URLSearchParams(window.location.search).get('key');
    if(queryKey) return queryKey.trim();
    const hash = String(window.location.hash || '').replace(/^#/, '');
    return new URLSearchParams(hash).get('key') || '';
  }

  function errorMessage(error){
    const code = error && error.message;
    if(code === 'unauthorized') return '管理密钥不正确，请检查 ADMIN_KEY / MAOYANG_ADMIN_KEY。';
    if(code === 'admin_key_not_configured') return '后台管理密钥未配置，请在部署环境设置 ADMIN_KEY 或 MAOYANG_ADMIN_KEY。';
    if(code === 'storage_not_configured') return '订单存储尚未连接，请配置 KV_REST_API_URL 与 KV_REST_API_TOKEN。';
    if(code === 'storage_read_failed') return '订单存储读取失败，请检查 Upstash / Vercel KV 配置。';
    if(code === 'storage_write_failed') return '订单保存失败，请检查 Upstash / Vercel KV 写入权限。';
    if(code === 'storage_unavailable') return '订单存储暂时不可用，请稍后重试。';
    return '操作失败，请检查管理密钥、存储配置和邮箱配置。';
  }

  const savedKey = keyFromLocation() || sessionStorage.getItem('maoyangAdminKey');
  if(savedKey){
    keyInput.value = savedKey;
    sessionStorage.setItem('maoyangAdminKey', savedKey);
    loadOrders(savedKey).catch((error)=>{ render([]); setStatus(errorMessage(error), true); });
  }

  form.addEventListener('submit', async (event)=>{
    event.preventDefault();
    const key = keyInput.value.trim();
    if(!key){ setStatus('请输入管理密钥。', true); return; }
    sessionStorage.setItem('maoyangAdminKey', key);
    try{ await loadOrders(key); }
    catch(error){ render([]); setStatus(errorMessage(error), true); }
  });
})();
