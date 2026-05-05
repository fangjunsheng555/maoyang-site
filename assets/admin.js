(function(){
  const form = document.querySelector('[data-admin-form]');
  const keyInput = document.querySelector('[data-admin-key]');
  const statusBox = document.querySelector('[data-admin-status]');
  const tableBody = document.querySelector('[data-order-rows]');
  const emptyState = document.querySelector('[data-empty-state]');
  if(!form || !keyInput || !statusBox || !tableBody) return;

  function setStatus(text, warn){
    statusBox.textContent = text;
    statusBox.classList.toggle('warn', !!warn);
    statusBox.hidden = !text;
  }
  function safe(v){ return String(v == null ? '' : v); }
  function paid(o){
    if(o.paymentMethod === 'usdt') return safe(o.paidAmount || o.finalUsdt || o.finalAmount) + ' USDT';
    return '￥' + safe(o.paidAmount || o.finalAmount);
  }
  function orderTime(o){
    if(o.createdAtBeijing) return o.createdAtBeijing;
    if(!o.createdAt) return '';
    return new Date(o.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) + ' 北京时间';
  }
  function itemsLabel(o){
    if(Array.isArray(o.items) && o.items.length > 0) return o.items.map((it)=>it.label || it.service).join(' + ');
    return o.serviceLabel || o.service || '';
  }
  function itemsCreds(o){
    if(Array.isArray(o.items) && o.items.length > 0){
      return o.items.map((it)=>{
        const lbl = it.label || it.service;
        if(it.account && it.password) return lbl + ': ' + it.account + ' / ' + it.password;
        if(it.account) return lbl + ': ' + it.account;
        return lbl + ': --';
      }).join('\n');
    }
    return (o.account || '--') + (o.password ? ' / ' + o.password : '');
  }

  function render(orders){
    tableBody.innerHTML = '';
    emptyState.hidden = orders.length > 0;
    orders.forEach((o)=>{
      const tr = document.createElement('tr');
      const values = [
        orderTime(o),
        o.orderId,
        itemsLabel(o) + (o.discountLabel ? '\n(' + o.discountLabel + ')' : ''),
        o.paymentMethod === 'usdt' ? 'USDT' : '支付宝',
        paid(o),
        itemsCreds(o),
        o.email || '',
        o.contact,
        o.remark || ''
      ];
      values.forEach((v)=>{
        const td = document.createElement('td');
        td.style.whiteSpace = 'pre-wrap';
        td.textContent = safe(v);
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
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
    if(code === 'storage_read_failed') return '订单存储读取失败，请检查 Upstash / Vercel KV 配置。';
    if(code === 'storage_unavailable') return '订单存储暂时不可用，请稍后重试。';
    return '读取失败，请检查管理密钥和存储配置。';
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
