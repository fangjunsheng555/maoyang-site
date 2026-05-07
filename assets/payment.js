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
  function emailWarning(result){
    const deliveries = Array.isArray(result && result.deliveries) ? result.deliveries : [];
    const email = deliveries.find((item)=>item && item.channel === 'email');
    return email && !email.ok;
  }

  if(!payload || !Array.isArray(payload.items) || payload.items.length === 0){
    block.hidden = true;
    empty.hidden = false;
    return;
  }

  function isUsdt(){ return payload.paymentMethod === 'usdt'; }

  function renderHeader(){
    if(payload.paymentMethod === 'redeem_code'){
      methodTag.textContent = '商品兑换码';
      if(secureLabel) secureLabel.textContent = '兑换码安全核销';
      if(finishBtn) finishBtn.textContent = '提交兑换订单';
    }else if(payload.paymentMethod === 'balance' || Number(payload.finalAmount || 0) <= 0){
      methodTag.textContent = '余额支付';
      if(secureLabel) secureLabel.textContent = '账户余额安全结算';
    }else if(isUsdt()){
      methodTag.textContent = 'USDT · TRC20';
      if(secureLabel) secureLabel.textContent = 'USDT-TRC20 安全结算';
    }else{
      methodTag.textContent = '支付宝';
      if(secureLabel) secureLabel.textContent = '支付宝担保结算';
    }
  }

  function renderAmount(){
    if(payload.paymentMethod === 'redeem_code'){
      amountDisplay.textContent = '¥0';
      amountNote.textContent = '商品兑换码已抵扣';
    }else if(payload.paymentMethod === 'balance' || Number(payload.finalAmount || 0) <= 0){
      amountDisplay.textContent = '¥0';
      amountNote.textContent = '账户优惠已全额抵扣';
    }else if(isUsdt()){
      amountDisplay.innerHTML = (payload.finalUsdt || payload.paidAmount) + ' <em>USDT</em>';
      amountNote.textContent = '¥' + payload.finalAmount + ' × 0.9 ÷ ' + (Number(cfg.usdtRateCnyPerUsdt || 6.85)).toFixed(2);
    }else{
      amountDisplay.textContent = money(payload.finalAmount);
      amountNote.textContent = '担保支付 · 即时到账';
    }
  }

  function renderTip(){
    if(payload.paymentMethod === 'redeem_code'){
      payTip.textContent = '商品兑换码已识别，无需扫码付款。请确认订单信息后点击下方按钮提交，后台会按兑换码对应商品处理。';
    }else if(payload.paymentMethod === 'balance' || Number(payload.finalAmount || 0) <= 0){
      payTip.textContent = '本单已由账户优惠全额抵扣，无需扫码付款，直接点击下方按钮提交订单即可。';
    }else if(isUsdt()){
      payTip.textContent = '请使用 TRON (TRC20) 网络转账精确金额 ' + (payload.finalUsdt) + ' USDT 到下方地址，付款完成后请记得返回本页面点击「付款完成」按钮提交订单。';
    }else{
      payTip.textContent = '请按上方金额完成支付宝付款。付款完成后请记得返回本页面点击「付款完成」按钮，充值人员 10 分钟内处理。';
    }
  }

  function syncQr(src){
    if(src){ payQr.src = src; payQr.hidden = false; qrEmpty.hidden = true; }
    else { payQr.hidden = true; qrEmpty.hidden = false; }
  }

  function renderQr(){
    if(payload.paymentMethod === 'redeem_code'){
      qrLabel.textContent = '兑换码已抵扣，无需扫码';
      qrEmpty.textContent = '可直接提交订单';
      syncQr('');
      usdtBox.hidden = true;
    }else if(payload.paymentMethod === 'balance' || Number(payload.finalAmount || 0) <= 0){
      qrLabel.textContent = '账户优惠已抵扣，无需扫码';
      qrEmpty.textContent = '可直接提交订单';
      syncQr('');
      usdtBox.hidden = true;
    }else if(isUsdt()){
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
      html += '<div class="paySummaryRow discount"><span>组合优惠 · ' + payload.discountLabel + '</span><b>−' + money(payload.subtotal - (payload.baseFinalAmount || payload.finalAmount)) + '</b></div>';
    }
    if(payload.walletDeduction > 0){
      html += '<div class="paySummaryRow wallet"><span>账户立减</span><b>−' + money(payload.walletDeduction) + '</b></div>';
    }
    if(payload.couponDeduction > 0){
      html += '<div class="paySummaryRow wallet"><span>优惠券抵扣</span><b>−' + money(payload.couponDeduction) + '</b></div>';
    }
    if(payload.paymentMethod === 'redeem_code'){
      html += '<div class="paySummaryRow wallet"><span>商品兑换码</span><b>−' + money(payload.baseFinalAmount || payload.subtotal || 0) + '</b></div>';
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
    if(stepperPay){
      stepperPay.classList.remove('active');
      stepperPay.classList.add('done');
    }
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
      const authToken = (window.MAOYANG_AUTH && window.MAOYANG_AUTH.getToken && window.MAOYANG_AUTH.getToken()) || payload.userToken || '';
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, authToken ? { Authorization: 'Bearer ' + authToken } : {}),
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if(!response.ok || !result.ok || !result.delivered) throw new Error(result.error || 'submit_failed');
      sessionStorage.removeItem('maoyangPendingOrder');
      sessionStorage.removeItem('maoyangRedeemCheckout');
      Cart.clear();
      showSuccess(result);
      if(emailWarning(result)){
        const warn = document.createElement('div');
        warn.className = 'checkoutAlert warn';
        warn.textContent = '订单已提交，但邮件发送失败。请保存订单号并联系在线客服确认。';
        success.insertBefore(warn, success.firstChild);
      }
    }catch(error){
      finishBtn.disabled = false;
      finishBtn.innerHTML = originalLabel;
      if(error && error.message === 'storage_failed'){
        setStatus('订单提交失败：后台订单存储没有成功，请联系在线客服处理。', true);
      }else if(error && error.message === 'delivery_failed'){
        setStatus('订单提交失败：订单已进入存储前检查，但通知/邮件通道没有成功，请联系在线客服处理。', true);
      }else{
        setStatus('订单提交失败，请联系在线客服处理。', true);
      }
    }
  });

  renderHeader();
  renderAmount();
  renderTip();
  renderQr();
  renderSummary();
})();
