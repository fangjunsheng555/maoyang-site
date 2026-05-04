(function(){
  if(!window.MAOYANG_CART) return;
  const Cart = window.MAOYANG_CART;
  const DEFAULT_USDT_ADDRESS = 'TDoUMF4nF244o5GZvBBwX5t9axvnSoP1Cm';
  const cfg = window.MAOYANG_PAYMENT || {};

  let payload = readPayload();

  const block = document.querySelector('[data-pay-block]');
  const empty = document.querySelector('[data-empty]');
  const success = document.querySelector('[data-success]');
  const stepperPay = document.querySelector('[data-step-pay]');
  const stepperSubmit = document.querySelector('[data-step-submit]');

  const methodTag = document.querySelector('[data-method-tag]');
  const amountDisplay = document.querySelector('[data-amount-display]');
  const amountNote = document.querySelector('[data-amount-note]');
  const payTip = document.querySelector('[data-pay-tip]');
  const payQr = document.querySelector('[data-pay-qr]');
  const qrEmpty = document.querySelector('[data-qr-empty]');
  const qrLabel = document.querySelector('[data-qr-label]');
  const usdtBox = document.querySelector('[data-usdt-box]');
  const usdtAddress = document.querySelector('[data-usdt-address]');
  const copyWalletBtn = document.querySelector('[data-copy-wallet]');
  const summaryCount = document.querySelector('[data-summary-count]');
  const summaryList = document.querySelector('[data-summary-list]');
  const summaryTotals = document.querySelector('[data-summary-totals]');
  const finishBtn = document.querySelector('[data-finish-payment]');
  const statusBox = document.querySelector('[data-status]');
  const secureLabel = document.querySelector('[data-secure-label]');

  const successEmailEl = document.querySelector('[data-success-email]');
  const successOrderEl = document.querySelector('[data-success-order]');
  const successItemsEl = document.querySelector('[data-success-items]');
  const successPaidEl = document.querySelector('[data-success-paid]');

  function readPayload(){
    try{ return JSON.parse(sessionStorage.getItem('maoyangPendingOrder') || 'null'); }
    catch(e){ return null; }
  }

  function money(v){ return '¥' + Number(v||0).toFixed(0); }
  function el(tag, cls, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
  function setStatus(message, warn){
    if(!message){ statusBox.hidden = true; statusBox.textContent = ''; return; }
    statusBox.hidden = false;
    statusBox.textContent = message;
    statusBox.classList.toggle('warn', !!warn);
  }

  if(!payload || !Array.isArray(payload.items) || payload.items.length === 0){
    block.hidden = true;
    empty.hidden = false;
    return;
  }

  function isUsdt(){ return payload.paymentMethod === 'usdt'; }

  function renderHeader(){
    if(isUsdt()){
      methodTag.textContent = 'USDT · TRC20';
      if(secureLabel) secureLabel.textContent = 'USDT-TRC20 安全结算';
    }else{
      methodTag.textContent = '支付宝';
      if(secureLabel) secureLabel.textContent = '支付宝担保结算';
    }
  }

  function renderAmount(){
    if(isUsdt()){
      amountDisplay.innerHTML = (payload.finalUsdt || payload.paidAmount) + ' <em>USDT</em>';
      amountNote.textContent = '¥' + payload.finalAmount + ' × 0.9 ÷ ' + (Number(cfg.usdtRateCnyPerUsdt || 6.85)).toFixed(2);
    }else{
      amountDisplay.textContent = money(payload.finalAmount);
      amountNote.textContent = '担保支付 · 即时到账';
    }
  }

  function renderTip(){
    if(isUsdt()){
      payTip.textContent = '请使用 TRON (TRC20) 网络转账精确金额 ' + (payload.finalUsdt) + ' USDT 到下方地址，付款完成后请记得返回本页面点击「付款完成」按钮提交订单。';
    }else{
      payTip.textContent = '请按上方金额完成支付宝付款。付款完成后请记得返回本页面点击「付款完成」按钮，充值人员 30 分钟内处理。';
    }
  }

  function syncQr(src){
    if(src){ payQr.src = src; payQr.hidden = false; qrEmpty.hidden = true; }
    else { payQr.hidden = true; qrEmpty.hidden = false; }
  }

  function renderQr(){
    if(isUsdt()){
      qrLabel.textContent = 'TRC20 钱包扫一扫或复制下方地址';
      syncQr(cfg.usdtQr);
      usdtBox.hidden = false;
      usdtAddress.textContent = cfg.usdtAddress || DEFAULT_USDT_ADDRESS;
    }else{
      qrLabel.textContent = '支付宝扫一扫';
      syncQr(cfg.alipayQr);
      usdtBox.hidden = true;
    }
  }

  function renderSummary(){
    summaryCount.textContent = payload.items.length;
    summaryList.innerHTML = '';
    payload.items.forEach((it)=>{
      const product = Cart.PRODUCTS[it.service] || {};
      const row = el('div','paySummaryRow');
      row.innerHTML = '<span>' + (product.label || it.service) + '</span><b>' + money(product.amount || 0) + '</b>';
      summaryList.appendChild(row);
    });
    let html = '';
    if(payload.discountRate > 0){
      html += '<div class="paySummaryRow discount"><span>组合优惠 · ' + payload.discountLabel + '</span><b>−' + money(payload.subtotal - payload.finalAmount) + '</b></div>';
    }
    html += '<div class="paySummaryRow total"><span>' + (isUsdt() ? '实付 USDT' : '实付总额') + '</span><b>' + (isUsdt() ? (payload.finalUsdt + ' USDT') : money(payload.finalAmount)) + '</b></div>';
    summaryTotals.innerHTML = html;
  }

  function copyText(text){
    if(navigator.clipboard && window.isSecureContext){ return navigator.clipboard.writeText(text); }
    const t = document.createElement('textarea'); t.value = text; t.style.position='fixed'; t.style.left='-9999px';
    document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    return Promise.resolve();
  }

  if(copyWalletBtn){
    copyWalletBtn.addEventListener('click', ()=>{
      const addr = cfg.usdtAddress || DEFAULT_USDT_ADDRESS;
      copyText(addr).then(()=>{
        copyWalletBtn.textContent = '已复制';
        setTimeout(()=>{ copyWalletBtn.textContent = '复制地址'; }, 1600);
      });
    });
  }

  function showSuccess(result){
    block.hidden = true;
    success.hidden = false;
    if(stepperPay) stepperPay.classList.add('done');
    if(stepperSubmit) stepperSubmit.classList.add('done', 'active');

    successEmailEl.textContent = payload.email;
    successOrderEl.textContent = result.orderId || '';
    successItemsEl.innerHTML = '';
    (result.items || payload.items).forEach((it)=>{
      const product = Cart.PRODUCTS[it.service] || {};
      const row = el('div','paySuccessItem');
      let html = '<div class="paySuccessItemHead"><strong>' + (product.label || it.service) + '</strong><span>' + money(product.amount || 0) + '</span></div>';
      if(it.subscriptionLinks){
        html += '<div class="paySuccessSubs">' +
          '<button type="button" data-copy-link="' + it.subscriptionLinks.shadowrocket + '"><span><strong>Shadowrocket 订阅</strong><small>' + it.subscriptionLinks.shadowrocket + '</small></span><em>复制</em></button>' +
          '<button type="button" data-copy-link="' + it.subscriptionLinks.clash + '"><span><strong>Clash 订阅</strong><small>' + it.subscriptionLinks.clash + '</small></span><em>复制</em></button>' +
          '</div>';
      }
      row.innerHTML = html;
      successItemsEl.appendChild(row);
    });
    successPaidEl.textContent = isUsdt() ? (payload.finalUsdt + ' USDT') : money(payload.finalAmount);

    successItemsEl.querySelectorAll('[data-copy-link]').forEach((btn)=>{
      btn.addEventListener('click', ()=>{
        const url = btn.getAttribute('data-copy-link');
        copyText(url).then(()=>{
          const em = btn.querySelector('em');
          if(em){ em.textContent = '已复制'; setTimeout(()=>{ em.textContent = '复制'; }, 1600); }
        });
      });
    });
  }

  finishBtn.addEventListener('click', async ()=>{
    if(finishBtn.disabled) return;
    finishBtn.disabled = true;
    const originalLabel = finishBtn.innerHTML;
    finishBtn.innerHTML = '<svg class="spinIcon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/></svg>正在提交订单';
    setStatus('');
    try{
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if(!response.ok || !result.ok) throw new Error(result.error || 'submit_failed');
      sessionStorage.removeItem('maoyangPendingOrder');
      Cart.clear();
      showSuccess(result);
    }catch(error){
      finishBtn.disabled = false;
      finishBtn.innerHTML = originalLabel;
      setStatus('订单提交失败，请联系在线客服处理。', true);
    }
  });

  renderHeader();
  renderAmount();
  renderTip();
  renderQr();
  renderSummary();
})();
