(function(){
  const DEFAULT_USDT_ADDRESS = 'TDoUMF4nF244o5GZvBBwX5t9axvnSoP1Cm';
  const config = window.MAOYANG_PAYMENT || {};
  const payload = readPendingOrder();

  const originalPrice = document.querySelector('[data-original-price]');
  const finalPrice = document.querySelector('[data-final-price]');
  const paymentMethod = document.querySelector('[data-payment-method]');
  const rateNote = document.querySelector('[data-rate-note]');
  const serviceLabel = document.querySelector('[data-service-label]');
  const cycle = document.querySelector('[data-cycle]');
  const contact = document.querySelector('[data-contact]');
  const detailList = document.querySelector('.detailList');
  const paymentTitle = document.querySelector('[data-payment-title]');
  const paymentTag = document.querySelector('[data-payment-tag]');
  const alipayPayment = document.querySelector('[data-alipay-payment]');
  const usdtPayment = document.querySelector('[data-usdt-payment]');
  const alipayQr = document.querySelector('[data-alipay-qr]');
  const alipayEmpty = document.querySelector('[data-alipay-empty]');
  const usdtQr = document.querySelector('[data-usdt-qr]');
  const usdtEmpty = document.querySelector('[data-usdt-empty]');
  const usdtNetwork = document.querySelector('[data-usdt-network]');
  const usdtAddress = document.querySelector('[data-usdt-address]');
  const copyWallet = document.querySelector('[data-copy-wallet]');
  const finishBtn = document.querySelector('[data-finish-payment]');
  const statusBox = document.querySelector('[data-status]');

  function currentLang(){
    if(window.MAOYANG_GET_LANG) return window.MAOYANG_GET_LANG();
    try{
      const saved = localStorage.getItem('maoyangLang');
      if(saved === 'zh' || saved === 'en') return saved;
    }catch(error){}
    return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
  }

  const TEXT = {
    zh: {
      copy: '复制',
      copied: '已复制',
      copyAddress: '复制地址',
      orderInvalid: '订单信息已失效，请返回重新下单。',
      networkSuccess: '订单已提交成功，订阅链接将在30分钟内可用，请耐心等待，如有疑问请联系我们的在线客服',
      orderNumber: '订单号：',
      alipay: '支付宝',
      alipayTitle: '支付宝扫码付款',
      usdtTitle: 'USDT 扫码付款',
      discountNote: '折后人民币 {cny}，按 {rate} 汇率折算。',
      submitting: '正在提交订单',
      submitted: '已提交订单',
      finishPayment: '已完成付款',
      success: '订单已提交成功，预计在30分钟内完成会员订阅，请耐心等待，如有疑问请联系我们的在线客服\n订单号：{id}',
      failed: '订单提交失败，请联系在线客服。',
      usernameLabel: '设置你的用户名',
      orderSummary: '订单摘要',
      paymentQrCode: '收款码',
      originalPrice: '原价',
      paymentMethod: '支付方式',
      amountDue: '应付',
      service: '会员服务',
      cycle: '周期',
      contact: '联系方式',
      network: '网络：',
      address: '地址：',
      backToEdit: '返回修改',
      contactSupport: '联系客服',
      customQuote: '客服报价',
      shadowrocket: 'shadowrocket小火箭订阅',
      clash: 'clash订阅'
    },
    en: {
      copy: 'Copy',
      copied: 'Copied',
      copyAddress: 'Copy address',
      orderInvalid: 'Order information has expired. Please go back and place the order again.',
      networkSuccess: 'Your order has been submitted. The subscription links will become available within 30 minutes. Please wait patiently. If you have any questions, contact online support.',
      orderNumber: 'Order ID: ',
      alipay: 'Alipay',
      alipayTitle: 'Alipay QR Payment',
      usdtTitle: 'USDT QR Payment',
      discountNote: 'Discounted CNY amount: {cny}. Converted at an exchange rate of {rate}.',
      submitting: 'Submitting order',
      submitted: 'Order submitted',
      finishPayment: 'I have completed payment',
      success: 'Your order has been submitted. Membership activation is expected within 30 minutes. Please wait patiently. If you have any questions, contact online support.\nOrder ID: {id}',
      failed: 'Order submission failed. Please contact online support.',
      usernameLabel: 'Set your username',
      orderSummary: 'Order Summary',
      paymentQrCode: 'Payment QR Code',
      originalPrice: 'Original Price',
      paymentMethod: 'Payment Method',
      amountDue: 'Amount Due',
      service: 'Membership Service',
      cycle: 'Cycle',
      contact: 'Contact Information',
      network: 'Network: ',
      address: 'Address: ',
      backToEdit: 'Back to Edit',
      contactSupport: 'Contact Support',
      customQuote: 'Custom Quote',
      shadowrocket: 'Shadowrocket subscription',
      clash: 'Clash subscription'
    }
  };

  function tr(key, values){
    let text = (TEXT[currentLang()] || TEXT.zh)[key] || TEXT.zh[key] || key;
    Object.keys(values || {}).forEach((name) => {
      text = text.replace('{' + name + '}', values[name]);
    });
    return text;
  }

  const PRODUCT_LABELS = {
    zh: {
      spotify: 'Spotify Premium',
      netflix: 'Netflix Premium',
      disney: 'Disney+',
      hbomax: 'HBO Max',
      chatgpt: 'ChatGPT Plus',
      network: '网络节点服务',
      other: '其他服务 / 客服报价'
    },
    en: {
      spotify: 'Spotify Premium',
      netflix: 'Netflix Premium',
      disney: 'Disney+',
      hbomax: 'HBO Max',
      chatgpt: 'ChatGPT Plus',
      network: 'VPN Service',
      other: 'Other Service / Custom Quote'
    }
  };

  const CYCLE_LABELS = {
    zh: {
      '1y': '1年',
      '2y': '2年（9折）',
      '3y': '3年（8折）',
      month: '月付',
      quarter: '三个月',
      year: '年付',
      custom: '客服报价'
    },
    en: {
      '1y': '1 Year',
      '2y': '2 Years (10% off)',
      '3y': '3 Years (20% off)',
      month: 'Monthly',
      quarter: '3 Months',
      year: 'Annual',
      custom: 'Custom Quote'
    }
  };

  function serviceCopy(){
    const language = currentLang();
    return (PRODUCT_LABELS[language] && PRODUCT_LABELS[language][payload.service]) || payload.serviceLabel || '--';
  }

  function cycleKey(value){
    const raw = String(value || '').toLowerCase();
    if(/1\s*year|1年/.test(raw)) return '1y';
    if(/2\s*years|2年/.test(raw)) return '2y';
    if(/3\s*years|3年/.test(raw)) return '3y';
    if(/3\s*months|三个月/.test(raw)) return 'quarter';
    if(/monthly|month|月付/.test(raw)) return 'month';
    if(/annual|yearly|年付/.test(raw)) return 'year';
    if(/custom|客服/.test(raw)) return 'custom';
    return '';
  }

  function cycleCopy(){
    const key = cycleKey(payload.cycle);
    const language = currentLang();
    return key ? CYCLE_LABELS[language][key] : (payload.cycle || '--');
  }

  function applyStaticText(){
    const headings = Array.from(document.querySelectorAll('.paymentBox h2'));
    if(headings[0]) headings[0].textContent = tr('orderSummary');
    if(headings[1]) headings[1].textContent = tr('paymentQrCode');

    const amountRows = Array.from(document.querySelectorAll('.amountPanel .amountRow span'));
    if(amountRows[0]) amountRows[0].textContent = tr('originalPrice');
    if(amountRows[1]) amountRows[1].textContent = tr('paymentMethod');
    if(amountRows[2]) amountRows[2].textContent = tr('amountDue');

    const detailRows = Array.from(document.querySelectorAll('.detailItem span'));
    if(detailRows[0]) detailRows[0].textContent = tr('service');
    if(detailRows[1]) detailRows[1].textContent = tr('cycle');
    const usernameDetail = document.querySelector('[data-username-detail] span');
    if(usernameDetail) usernameDetail.textContent = tr('usernameLabel');
    if(detailRows[detailRows.length - 1]) detailRows[detailRows.length - 1].textContent = tr('contact');

    const walletLines = Array.from(document.querySelectorAll('.walletLine'));
    setLinePrefix(walletLines[0], tr('network'));
    setLinePrefix(walletLines[1], tr('address'));
  }

  function setLinePrefix(line, value){
    if(!line) return;
    if(line.firstChild && line.firstChild.nodeType === Node.TEXT_NODE){
      line.firstChild.nodeValue = value;
      return;
    }
    line.insertBefore(document.createTextNode(value), line.firstChild);
  }

  function readPendingOrder(){
    try{
      return JSON.parse(sessionStorage.getItem('maoyangPendingOrder') || 'null');
    }catch(error){
      return null;
    }
  }

  function credentialMode(order){
    if(!order) return 'accountPassword';
    if(['netflix', 'disney', 'hbomax'].includes(order.service)) return 'none';
    if(order.service === 'network') return 'username';
    return 'accountPassword';
  }

  function validUsername(value){
    return /^[A-Za-z0-9]{3,10}$/.test(String(value || '').trim());
  }

  function hasRequiredOrderInfo(order){
    const mode = credentialMode(order);
    if(!order || !order.contact) return false;
    if(mode === 'username' && !validUsername(order.account)) return false;
    if(mode === 'accountPassword' && (!order.account || !order.password)) return false;
    return true;
  }

  function money(value){
    const n = Number(value || 0);
    return '￥' + (Number.isInteger(n) ? n : n.toFixed(2));
  }

  function usdtMoney(value){
    return Number(value || 0).toFixed(2) + ' USDT';
  }

  function setStatus(text, warn){
    statusBox.textContent = text;
    statusBox.classList.toggle('warn', !!warn);
    statusBox.classList.add('show');
  }

  function installSubscriptionStyle(){
    if(document.querySelector('[data-subscription-style]')) return;
    const style = document.createElement('style');
    style.dataset.subscriptionStyle = 'true';
    style.textContent = '.subscriptionLinks{display:grid;gap:12px;margin-top:12px}.subscriptionRow{display:grid;gap:8px;border:1px solid rgba(6,95,70,.18);border-radius:8px;background:rgba(255,255,255,.55);padding:12px}.subscriptionRowLabel{font-weight:950;color:#064e3b}.subscriptionCopyLine{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}.subscriptionCopyLine a{color:#065f46;font-weight:850;overflow-wrap:anywhere}.subscriptionCopyBtn{border:0;border-radius:999px;background:#111827;color:#fff;font-weight:950;padding:9px 14px;cursor:pointer;white-space:nowrap}@media (max-width:560px){.subscriptionCopyLine{grid-template-columns:1fr}.subscriptionCopyBtn{width:100%}}';
    document.head.appendChild(style);
  }

  function appendSubscriptionRow(parent, label, url){
    const row = document.createElement('div');
    row.className = 'subscriptionRow';

    const title = document.createElement('div');
    title.className = 'subscriptionRowLabel';
    title.textContent = label;

    const line = document.createElement('div');
    line.className = 'subscriptionCopyLine';

    const link = document.createElement('a');
    link.href = url;
    link.textContent = url;
    link.target = '_blank';
    link.rel = 'noopener';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'subscriptionCopyBtn';
    button.textContent = tr('copy');
    button.addEventListener('click', async () => {
      await copyText(url);
      button.textContent = tr('copied');
      setTimeout(() => { button.textContent = tr('copy'); }, 1600);
    });

    line.append(link, button);
    row.append(title, line);
    parent.appendChild(row);
  }

  function setNetworkSuccess(orderId){
    const username = String(payload.account || '').trim();
    const encoded = encodeURIComponent(username);
    const shadowrocket = 'https://hk.joinvip.vip:2056/sub/' + encoded;
    const clash = 'https://hk.joinvip.vip:2056/sub/' + encoded + '?format=clash';

    installSubscriptionStyle();
    statusBox.classList.remove('warn');
    statusBox.classList.add('show');
    statusBox.textContent = '';

    const message = document.createElement('div');
    message.textContent = tr('networkSuccess');
    const idLine = document.createElement('div');
    idLine.textContent = tr('orderNumber') + orderId;
    const links = document.createElement('div');
    links.className = 'subscriptionLinks';

    appendSubscriptionRow(links, tr('shadowrocket'), shadowrocket);
    appendSubscriptionRow(links, tr('clash'), clash);
    statusBox.append(message, idLine, links);
  }

  async function copyText(text){
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
      return true;
    }
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.left = '-999px';
    document.body.appendChild(temp);
    temp.select();
    const ok = document.execCommand('copy');
    temp.remove();
    return ok;
  }

  function syncQr(img, empty, src){
    if(src){
      img.src = src;
      img.hidden = false;
      empty.hidden = true;
    }else{
      img.hidden = true;
      empty.hidden = false;
    }
  }

  function renderMissingOrder(){
    applyStaticText();
    if(finishBtn) finishBtn.disabled = true;
    if(alipayPayment) alipayPayment.hidden = true;
    if(usdtPayment) usdtPayment.hidden = true;
    setStatus(tr('orderInvalid'), true);
  }

  function renderUsernameDetail(){
    if(!detailList || !payload || payload.service !== 'network') return;
    if(detailList.querySelector('[data-username-detail]')) return;

    const item = document.createElement('div');
    item.className = 'detailItem';
    item.dataset.usernameDetail = 'true';
    const label = document.createElement('span');
    label.textContent = tr('usernameLabel');
    const value = document.createElement('b');
    value.textContent = payload.account || '--';
    item.append(label, value);
    const contactItem = contact ? contact.closest('.detailItem') : null;
    detailList.insertBefore(item, contactItem || null);
  }

  function renderOrder(){
    if(!hasRequiredOrderInfo(payload)){
      renderMissingOrder();
      return;
    }

    applyStaticText();
    const isUsdt = payload.paymentMethod === 'usdt';
    originalPrice.textContent = payload.originalAmount ? money(payload.originalAmount) : tr('customQuote');
    finalPrice.textContent = isUsdt ? usdtMoney(payload.finalAmount) : money(payload.finalAmount);
    paymentMethod.textContent = isUsdt ? 'USDT' : tr('alipay');
    serviceLabel.textContent = serviceCopy();
    cycle.textContent = cycleCopy();
    contact.textContent = payload.contact || '--';
    renderUsernameDetail();

    if(isUsdt){
      paymentTitle.textContent = tr('usdtTitle');
      paymentTag.textContent = usdtMoney(payload.finalAmount);
      alipayPayment.hidden = true;
      usdtPayment.hidden = false;
      usdtNetwork.textContent = config.usdtNetwork || 'TRC20';
      usdtAddress.textContent = config.usdtAddress || DEFAULT_USDT_ADDRESS;
      syncQr(usdtQr, usdtEmpty, config.usdtQr);
      rateNote.hidden = false;
      rateNote.textContent = tr('discountNote', { cny: money(payload.discountedCnyAmount), rate: Number(payload.exchangeRate || 6.85).toFixed(2) });
    }else{
      paymentTitle.textContent = tr('alipayTitle');
      paymentTag.textContent = money(payload.finalAmount);
      alipayPayment.hidden = false;
      usdtPayment.hidden = true;
      syncQr(alipayQr, alipayEmpty, config.alipayQr);
      rateNote.hidden = true;
      rateNote.textContent = '';
    }
  }

  if(copyWallet){
    copyWallet.addEventListener('click', async () => {
      const address = config.usdtAddress || DEFAULT_USDT_ADDRESS;
      await copyText(address);
      copyWallet.textContent = tr('copied');
      setTimeout(() => { copyWallet.textContent = tr('copyAddress'); }, 1600);
    });
  }

  if(finishBtn){
    finishBtn.addEventListener('click', async () => {
      if(!payload || finishBtn.disabled) return;
      finishBtn.disabled = true;
      finishBtn.textContent = tr('submitting');
      try{
        const response = await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if(!response.ok || !result.ok) throw new Error(result.error || 'submit_failed');
        sessionStorage.removeItem('maoyangPendingOrder');
        if(payload.service === 'network'){
          setNetworkSuccess(result.orderId);
        }else{
          setStatus(tr('success', { id: result.orderId }), false);
        }
        finishBtn.textContent = tr('submitted');
      }catch(error){
        finishBtn.disabled = false;
        finishBtn.textContent = tr('finishPayment');
        setStatus(tr('failed'), true);
      }
    });
  }

  window.addEventListener('maoyang:languagechange', () => {
    renderOrder();
    if(copyWallet) copyWallet.textContent = tr('copyAddress');
    if(finishBtn && !finishBtn.disabled) finishBtn.textContent = tr('finishPayment');
  });

  renderOrder();
  if(copyWallet) copyWallet.textContent = tr('copyAddress');
  if(finishBtn && !finishBtn.disabled) finishBtn.textContent = tr('finishPayment');
})();
