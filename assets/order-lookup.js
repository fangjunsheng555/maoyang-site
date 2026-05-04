(function(){
  const form = document.querySelector('[data-order-lookup-form]');
  if(!form) return;
  const input = document.querySelector('[data-order-lookup-input]');
  const statusBox = document.querySelector('[data-order-lookup-status]');
  const resultsBox = document.querySelector('[data-order-lookup-results]');
  let modalEl = null;

  function setStatus(message, warn){
    if(!message){ statusBox.hidden = true; return; }
    statusBox.hidden = false;
    statusBox.textContent = message;
    statusBox.classList.toggle('warn', !!warn);
  }
  function el(tag, cls, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
  function money(v, currency){
    const n = Number(v||0);
    const text = Number.isInteger(n) ? String(n) : n.toFixed(2);
    return currency === 'USDT' ? (text + ' USDT') : ('¥' + text);
  }
  function safe(v){ return String(v || '').trim() || '--'; }
  function paymentName(o){ return o.paymentMethod === 'usdt' ? 'USDT' : '支付宝'; }
  function copyText(text){
    if(navigator.clipboard && window.isSecureContext){ return navigator.clipboard.writeText(text); }
    const t = document.createElement('textarea'); t.value = text; t.style.position='fixed'; t.style.left='-9999px';
    document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    return Promise.resolve();
  }

  function paidDisplay(o){
    if(o.paymentMethod === 'usdt' || o.currency === 'USDT'){
      return (o.paidAmount || o.finalUsdt || o.finalAmount || 0) + ' USDT';
    }
    return '¥' + (o.paidAmount || o.finalAmount || 0);
  }

  function renderSummaryRow(order){
    const items = Array.isArray(order.items) && order.items.length > 0
      ? order.items
      : [{ service:order.service, label:order.serviceLabel || '订单', amount:order.finalAmount || 0 }];
    const labelText = items.length > 1 ? ('组合订单 · ' + items.length + ' 件') : (items[0].label || order.serviceLabel || '订单');
    const row = el('button','lookupRow');
    row.type = 'button';
    row.innerHTML = '<div class="lookupRowMain">' +
      '<strong>' + labelText + '</strong>' +
      '<small>' + (order.orderId || '') + '</small>' +
      '</div>' +
      '<div class="lookupRowMeta">' +
      '<b>' + paidDisplay(order) + '</b>' +
      '<span>' + paymentName(order) + ' · ' + (order.createdAtBeijing || '').slice(5,16) + '</span>' +
      '</div>' +
      '<svg class="lookupRowArrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    row.addEventListener('click', ()=>openModal(order));
    return row;
  }

  function buildModal(){
    const m = el('div','lookupModalMask');
    m.dataset.lookupModal = '1';
    m.innerHTML = '<div class="lookupModal" role="dialog" aria-modal="true">' +
      '<button class="lookupModalClose" type="button" aria-label="关闭"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
      '<div class="lookupModalBody"></div></div>';
    m.addEventListener('click', (e)=>{ if(e.target === m) closeModal(); });
    m.querySelector('.lookupModalClose').addEventListener('click', closeModal);
    document.body.appendChild(m);
    return m;
  }

  function openModal(order){
    if(!modalEl) modalEl = buildModal();
    const body = modalEl.querySelector('.lookupModalBody');
    const items = Array.isArray(order.items) && order.items.length > 0
      ? order.items
      : [{ service:order.service, label:order.serviceLabel || '订单', cycle:order.cycle, amount:order.finalAmount || 0, account:order.account, password:order.password, subscriptionLinks:order.subscriptionLinks }];
    const isUsdt = order.paymentMethod === 'usdt' || order.currency === 'USDT';

    let html = '<div class="lookupModalHead">' +
      '<div class="kicker">Order Detail</div>' +
      '<div class="lookupModalTitle">' + (items.length > 1 ? ('组合订单 · ' + items.length + ' 件') : (items[0].label || '订单')) + '</div>' +
      '<code class="lookupModalId">' + (order.orderId || '') + '</code>' +
      '</div>';

    html += '<div class="lookupModalAmount"><span>实付金额</span><b>' + paidDisplay(order) + '</b><em>' + paymentName(order) + '</em></div>';

    html += '<div class="lookupModalItems"><div class="lookupModalItemsLabel">商品明细 · ' + items.length + ' 件</div>';
    items.forEach((it, idx)=>{
      html += '<div class="lookupModalItem">' +
        '<div class="lookupModalItemHead"><strong>' + (it.label || it.service) + '</strong><span>' + (it.cycle || '') + ' · ¥' + (it.amount || 0) + '</span></div>';
      if(it.account || it.password){
        html += '<div class="lookupModalCreds">';
        if(it.account) html += '<div><span>' + (it.service === 'network' ? '用户名' : '账号') + '</span><code>' + it.account + '</code></div>';
        if(it.password) html += '<div><span>密码</span><code>' + it.password + '</code></div>';
        html += '</div>';
      }
      if(it.subscriptionLinks){
        html += '<div class="lookupModalSubs">' +
          '<button type="button" data-copy-sub="' + it.subscriptionLinks.shadowrocket + '" data-idx="sr-' + idx + '"><span><strong>Shadowrocket 订阅</strong><small>' + it.subscriptionLinks.shadowrocket + '</small></span><em>复制</em></button>' +
          '<button type="button" data-copy-sub="' + it.subscriptionLinks.clash + '" data-idx="cl-' + idx + '"><span><strong>Clash 订阅</strong><small>' + it.subscriptionLinks.clash + '</small></span><em>复制</em></button>' +
          '</div>';
      }
      html += '</div>';
    });
    html += '</div>';

    html += '<div class="lookupModalRows">' +
      '<div><span>订单时间</span><b>' + safe(order.createdAtBeijing || order.createdAt) + '</b></div>' +
      (order.email ? '<div><span>邮箱</span><b>' + order.email + '</b></div>' : '') +
      '<div><span>联系方式</span><b>' + safe(order.contact) + '</b></div>' +
      (order.subtotal && order.subtotal !== order.finalAmount ? '<div><span>商品总价</span><b>¥' + order.subtotal + '</b></div>' : '') +
      (order.discountLabel ? '<div><span>组合优惠</span><b>' + order.discountLabel + '</b></div>' : '') +
      (order.remark ? '<div class="lookupModalRowWide"><span>备注</span><b>' + order.remark + '</b></div>' : '') +
      '</div>';

    body.innerHTML = html;

    body.querySelectorAll('[data-copy-sub]').forEach((btn)=>{
      btn.addEventListener('click', ()=>{
        const url = btn.getAttribute('data-copy-sub');
        copyText(url).then(()=>{
          const em = btn.querySelector('em');
          if(em){ em.textContent = '已复制'; setTimeout(()=>{ em.textContent = '复制'; }, 1600); }
        });
      });
    });

    modalEl.classList.add('show');
    document.body.classList.add('hasLookupModalOpen');
  }

  function closeModal(){
    if(!modalEl) return;
    modalEl.classList.remove('show');
    document.body.classList.remove('hasLookupModalOpen');
  }

  function renderResults(orders){
    resultsBox.innerHTML = '';
    if(!orders.length){
      setStatus('未查询到订单，请核对订单编号或下单邮箱是否完整正确。', true);
      return;
    }
    setStatus('');
    if(orders.length === 1 && orders[0].matchType === 'orderId'){
      // Direct modal for orderId match
      openModal(orders[0]);
      const hint = el('div','lookupHint','已自动打开订单详情，点击下方条目可重新查看。');
      resultsBox.appendChild(hint);
      resultsBox.appendChild(renderSummaryRow(orders[0]));
      return;
    }
    // Email match - summary list
    const head = el('div','lookupHint','找到 ' + orders.length + ' 条订单，点击查看完整详情。');
    resultsBox.appendChild(head);
    orders.forEach((o)=>resultsBox.appendChild(renderSummaryRow(o)));
  }

  async function queryOrders(query){
    const response = await fetch('/api/order-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await response.json();
    if(!response.ok || !data.ok) throw new Error(data.error || 'lookup_failed');
    return data;
  }

  form.addEventListener('submit', async (event)=>{
    event.preventDefault();
    const query = (input.value || '').trim();
    resultsBox.innerHTML = '';
    if(!query){ setStatus('请输入完整订单编号或下单时填写的邮箱。', true); return; }
    const button = form.querySelector('[data-lookup-submit]');
    button.disabled = true;
    setStatus('正在查询订单...');
    try{
      const data = await queryOrders(query);
      if(!data.configured){ setStatus('订单存储尚未连接，请联系在线客服查询。', true); return; }
      renderResults(data.orders || []);
    }catch(error){
      setStatus('订单查询失败，请稍后重试或联系在线客服。', true);
    }finally{
      button.disabled = false;
    }
  });

  // Auto-query if ?order=XXX
  (function autoQuery(){
    try{
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get('order');
      if(orderId && orderId.length > 4){
        if(input) input.value = orderId;
        form.dispatchEvent(new Event('submit'));
        const target = document.querySelector('#orderLookup');
        if(target) target.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    }catch(e){}
  })();
})();
