(function(){
  const form = document.querySelector('[data-order-lookup-form]');
  if(!form) return;

  const input = document.querySelector('[data-order-lookup-input]');
  const statusBox = document.querySelector('[data-order-lookup-status]');
  const resultsBox = document.querySelector('[data-order-lookup-results]');
  let activeStatusKey = '';
  let activeStatusWarn = false;
  let lastOrders = [];

  const TEXT = {
    zh: {
      kicker: '订单查询',
      title: '查询历史订单',
      desc: '输入订单编号 / 下单时候所填写的联系方式可查询订单。',
      label: '订单编号或联系方式',
      placeholder: '请输入订单编号或下单时填写的联系方式',
      submit: '查询订单',
      loading: '正在查询订单...',
      queryRequired: '请输入订单编号或下单时填写的联系方式。',
      notConfigured: '订单记录查询暂未连接，请联系客服协助查询。',
      notFound: '没有查询到匹配订单，请确认订单编号或联系方式是否完整正确。',
      failed: '订单查询失败，请稍后重试或联系客服。',
      orderId: '订单编号',
      time: '下单时间',
      service: '会员服务',
      cycle: '周期',
      payment: '支付方式',
      amount: '付款数额',
      originalAmount: '原价',
      discountedCny: '折后人民币',
      exchangeRate: '汇率',
      account: '账号',
      password: '密码',
      passwordHidden: 'Spotify 密码已隐藏',
      username: '设置你的用户名',
      contact: '联系方式',
      remark: '备注（非必填）',
      none: '无',
      alipay: '支付宝',
      usdt: 'USDT',
      vpnService: '网络节点服务',
      linksTitle: '订阅链接',
      shadowrocket: 'shadowrocket小火箭订阅',
      clash: 'Clash订阅',
      copy: '复制',
      copied: '已复制',
      viewDetails: '查看完整订单',
      hideDetails: '收起详情'
    },
    en: {
      kicker: 'Order Lookup',
      title: 'Check Your Order History',
      desc: 'Enter your order ID or the contact information used at checkout to view your order.',
      label: 'Order ID or contact information',
      placeholder: 'Enter order ID or checkout contact information',
      submit: 'Search Orders',
      loading: 'Searching orders...',
      queryRequired: 'Please enter your order ID or checkout contact information.',
      notConfigured: 'Order lookup is not connected yet. Please contact support for assistance.',
      notFound: 'No matching order was found. Please make sure the order ID or contact information is complete and correct.',
      failed: 'Order lookup failed. Please try again later or contact support.',
      orderId: 'Order ID',
      time: 'Order Time',
      service: 'Service',
      cycle: 'Cycle',
      payment: 'Payment Method',
      amount: 'Amount Paid',
      originalAmount: 'Original Amount',
      discountedCny: 'Discounted CNY',
      exchangeRate: 'Exchange Rate',
      account: 'Account',
      password: 'Password',
      passwordHidden: 'Spotify password is hidden',
      username: 'Set Username',
      contact: 'Contact Information',
      remark: 'Order Notes (Optional)',
      none: 'None',
      alipay: 'Alipay',
      usdt: 'USDT',
      vpnService: 'VPN Service',
      linksTitle: 'Subscription Links',
      shadowrocket: 'Shadowrocket subscription',
      clash: 'Clash subscription',
      copy: 'Copy',
      copied: 'Copied',
      viewDetails: 'View full order',
      hideDetails: 'Hide details'
    }
  };

  function lang(){
    if(window.MAOYANG_GET_LANG) return window.MAOYANG_GET_LANG() === 'en' ? 'en' : 'zh';
    try{
      const saved = localStorage.getItem('maoyangLang');
      if(saved === 'en') return 'en';
    }catch(error){}
    return /^en/i.test(navigator.language || '') ? 'en' : 'zh';
  }

  function t(key){
    return TEXT[lang()][key] || TEXT.zh[key] || key;
  }

  function installStyle(){
    if(document.querySelector('[data-order-lookup-style]')) return;
    const style = document.createElement('style');
    style.dataset.orderLookupStyle = 'true';
    style.textContent = '.lookupPanel{border:1px solid var(--line);border-radius:8px;background:linear-gradient(180deg,#fff,#fbfdfc);box-shadow:var(--shadow-sm);padding:28px;display:grid;gap:20px}.lookupIntro{display:grid;gap:8px}.lookupIntro h2{margin:0;color:var(--ink-soft);font-size:clamp(26px,3vw,36px);line-height:1.18;font-weight:950}.lookupIntro p{max-width:760px;margin:0;color:var(--muted);line-height:1.75}.lookupForm{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:end}.lookupLabel{display:block;color:#344054;font-size:13px;font-weight:900;grid-column:1/-1}.lookupForm input{width:100%;border:1px solid var(--line);border-radius:8px;background:#fff;padding:13px 14px;color:var(--ink);font:inherit;outline:none}.lookupForm input:focus{border-color:rgba(15,118,110,.5);box-shadow:0 0 0 4px rgba(15,118,110,.1)}.lookupForm button,.lookupCopyBtn,.lookupDetailBtn{border:0;border-radius:999px;background:var(--teal);color:#fff;font-weight:950;min-height:48px;padding:12px 22px;cursor:pointer;box-shadow:0 12px 24px rgba(15,118,110,.16)}.lookupForm button:disabled{opacity:.62;cursor:not-allowed}.lookupStatus{border-radius:8px;background:#ecfdf3;color:#065f46;padding:13px 15px;font-weight:850;line-height:1.6}.lookupStatus.warn{background:#fff7ed;color:#9a3412}.lookupResults{display:grid;gap:14px}.lookupCard{border:1px solid var(--line);border-radius:8px;background:#fff;padding:18px;box-shadow:0 10px 24px rgba(15,23,42,.05)}.lookupCardHead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:14px}.lookupCardHead h3{margin:0;color:var(--ink-soft);font-size:20px;line-height:1.25}.lookupBadge{display:inline-flex;align-items:center;justify-content:center;min-height:30px;border-radius:999px;background:var(--teal-soft);color:var(--teal-dark);padding:5px 10px;font-size:12px;font-weight:950;white-space:nowrap}.lookupRows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 18px}.lookupSummary{grid-template-columns:repeat(4,minmax(0,1fr));align-items:start}.lookupRow{display:grid;gap:3px;border-bottom:1px solid rgba(217,227,224,.72);padding-bottom:9px}.lookupRow span{color:#667085;font-size:12px;font-weight:850}.lookupRow b{color:#172033;font-size:14px;line-height:1.55;overflow-wrap:anywhere}.lookupDetails{display:grid;gap:16px;margin-top:16px}.lookupDetails[hidden]{display:none!important}.lookupDetailBtn{margin-top:16px;min-height:40px;background:#111827;padding:9px 16px;box-shadow:none}.lookupLinks{display:grid;gap:10px;margin-top:16px}.lookupLinkRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid var(--line);border-radius:8px;background:#f8fbfa;padding:12px}.lookupLinksTitle{font-weight:950;color:var(--ink-soft)}.lookupLinkText{display:grid;gap:4px;min-width:0}.lookupLinkText span{font-size:12px;color:#0f766e;font-weight:950}.lookupLinkText a{color:#172033;font-weight:850;overflow-wrap:anywhere}.lookupCopyBtn{min-height:38px;background:#111827;padding:8px 14px;box-shadow:none}@media(max-width:920px){.lookupSummary{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:720px){.lookupPanel{padding:22px}.lookupForm{grid-template-columns:1fr}.lookupRows,.lookupSummary{grid-template-columns:1fr}.lookupCardHead{display:grid}.lookupLinkRow{grid-template-columns:1fr}.lookupCopyBtn,.lookupDetailBtn{width:100%}}';
    document.head.appendChild(style);
  }

  function setStatus(message, warn, key){
    activeStatusKey = key || '';
    activeStatusWarn = !!warn;
    statusBox.textContent = message || '';
    statusBox.hidden = !message;
    statusBox.classList.toggle('warn', !!warn);
  }

  function money(value, currency){
    const n = Number(value || 0);
    if(currency === 'USDT') return (Number.isInteger(n) ? String(n) : n.toFixed(2)) + ' USDT';
    return '￥' + (Number.isInteger(n) ? String(n) : n.toFixed(2));
  }

  function serviceName(order){
    if(order.service === 'network') return t('vpnService');
    return order.serviceLabel || '--';
  }

  function paymentName(order){
    return order.paymentMethod === 'usdt' ? t('usdt') : t('alipay');
  }

  function safe(value){
    return String(value || '').trim() || t('none');
  }

  function row(label, value){
    const div = document.createElement('div');
    div.className = 'lookupRow';
    const span = document.createElement('span');
    span.textContent = label;
    const b = document.createElement('b');
    b.textContent = value;
    div.append(span, b);
    return div;
  }

  async function copyText(text){
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
      return;
    }
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.left = '-999px';
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
  }

  function renderLink(parent, label, url){
    const item = document.createElement('div');
    item.className = 'lookupLinkRow';
    const textWrap = document.createElement('div');
    textWrap.className = 'lookupLinkText';
    const name = document.createElement('span');
    name.textContent = label;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = url;
    textWrap.append(name, link);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lookupCopyBtn';
    button.textContent = t('copy');
    button.addEventListener('click', async () => {
      await copyText(url);
      button.textContent = t('copied');
      setTimeout(() => { button.textContent = t('copy'); }, 1600);
    });

    item.append(textWrap, button);
    parent.appendChild(item);
  }

  function amountText(order){
    return money(order.finalAmount, order.currency === 'USDT' || order.paymentMethod === 'usdt' ? 'USDT' : 'CNY');
  }

  function renderSummary(order){
    const summary = document.createElement('div');
    summary.className = 'lookupRows lookupSummary';
    summary.append(row(t('service'), serviceName(order)));
    summary.append(row(t('orderId'), safe(order.orderId)));
    summary.append(row(t('time'), safe(order.createdAtBeijing || order.createdAt)));
    summary.append(row(t('amount'), amountText(order)));
    return summary;
  }

  function renderDetailRows(order){
    const rows = document.createElement('div');
    rows.className = 'lookupRows';
    rows.append(row(t('orderId'), safe(order.orderId)));
    rows.append(row(t('time'), safe(order.createdAtBeijing || order.createdAt)));
    rows.append(row(t('service'), serviceName(order)));
    rows.append(row(t('cycle'), safe(order.cycle)));
    rows.append(row(t('payment'), paymentName(order)));
    rows.append(row(t('amount'), amountText(order)));
    rows.append(row(t('originalAmount'), money(order.originalAmount, 'CNY')));
    if(order.paymentMethod === 'usdt'){
      rows.append(row(t('discountedCny'), money(order.discountedCnyAmount, 'CNY')));
      rows.append(row(t('exchangeRate'), order.exchangeRate ? ('1 USDT = ' + order.exchangeRate + ' CNY') : t('none')));
    }

    if(order.service === 'network'){
      rows.append(row(t('username'), safe(order.account)));
    }else{
      rows.append(row(t('account'), safe(order.account)));
      if(order.passwordHidden){
        rows.append(row(t('password'), t('passwordHidden')));
      }else if(order.password){
        rows.append(row(t('password'), order.password));
      }
    }
    rows.append(row(t('contact'), safe(order.contact)));
    rows.append(row(t('remark'), safe(order.remark)));
    return rows;
  }

  function renderLinks(order){
    if(!order.subscriptionLinks || (!order.subscriptionLinks.shadowrocket && !order.subscriptionLinks.clash)) return null;
    const links = document.createElement('div');
    links.className = 'lookupLinks';
    const linksTitle = document.createElement('div');
    linksTitle.className = 'lookupLinksTitle';
    linksTitle.textContent = t('linksTitle');
    links.appendChild(linksTitle);
    if(order.subscriptionLinks.shadowrocket) renderLink(links, t('shadowrocket'), order.subscriptionLinks.shadowrocket);
    if(order.subscriptionLinks.clash) renderLink(links, t('clash'), order.subscriptionLinks.clash);
    return links;
  }

  function renderDetails(order){
    const details = document.createElement('div');
    details.className = 'lookupDetails';
    details.appendChild(renderDetailRows(order));
    const links = renderLinks(order);
    if(links) details.appendChild(links);
    return details;
  }

  function renderOrders(orders){
    lastOrders = orders || [];
    resultsBox.innerHTML = '';
    if(!lastOrders.length){
      setStatus(t('notFound'), true, 'notFound');
      return;
    }
    setStatus('', false);

    lastOrders.forEach((order) => {
      const card = document.createElement('article');
      card.className = 'lookupCard';

      const head = document.createElement('div');
      head.className = 'lookupCardHead';
      const title = document.createElement('h3');
      title.textContent = serviceName(order);
      const badge = document.createElement('span');
      badge.className = 'lookupBadge';
      badge.textContent = order.orderId || '--';
      head.append(title, badge);
      card.appendChild(head);

      if(order.matchType === 'contact'){
        card.appendChild(renderSummary(order));
        const details = renderDetails(order);
        details.hidden = true;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'lookupDetailBtn';
        button.textContent = t('viewDetails');
        button.addEventListener('click', () => {
          details.hidden = !details.hidden;
          button.textContent = details.hidden ? t('viewDetails') : t('hideDetails');
        });
        card.append(button, details);
      }else{
        card.appendChild(renderDetails(order));
      }

      resultsBox.appendChild(card);
    });
  }

  function applyText(){
    const map = [
      ['[data-lookup-kicker]', 'kicker'],
      ['[data-lookup-title]', 'title'],
      ['[data-lookup-desc]', 'desc'],
      ['[data-lookup-label]', 'label'],
      ['[data-lookup-submit]', 'submit']
    ];
    map.forEach(([selector, key]) => {
      const node = document.querySelector(selector);
      if(node) node.textContent = t(key);
    });
    if(input) input.placeholder = t('placeholder');
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

  installStyle();
  applyText();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = input.value.trim();
    resultsBox.innerHTML = '';
    if(!query){
      setStatus(t('queryRequired'), true, 'queryRequired');
      return;
    }

    const button = form.querySelector('[data-lookup-submit]');
    button.disabled = true;
    setStatus(t('loading'), false, 'loading');
    try{
      const data = await queryOrders(query);
      if(!data.configured){
        setStatus(t('notConfigured'), true, 'notConfigured');
        return;
      }
      renderOrders(data.orders || []);
    }catch(error){
      setStatus(t('failed'), true, 'failed');
    }finally{
      button.disabled = false;
    }
  });

  window.addEventListener('maoyang:languagechange', () => {
    applyText();
    if(activeStatusKey) setStatus(t(activeStatusKey), activeStatusWarn, activeStatusKey);
    if(lastOrders.length) renderOrders(lastOrders);
  });
})();
