const ORDER_PRODUCTS = {
  spotify: { label: 'Spotify Premium', price: 128, cycle: '年付' },
  netflix: { label: 'Netflix Premium', price: 168, cycle: '年付' },
  chatgpt: { label: 'ChatGPT Plus', price: 75, cycle: '月付' },
  other: { label: '其他服务 / 客服报价', price: 0, cycle: '报价' }
};

(function(){
  const form = document.querySelector('[data-order-form]');
  if(!form) return;

  const config = window.MAOYANG_PAYMENT || {};
  const serviceEl = form.querySelector('[data-service]');
  const customWrap = document.querySelector('[data-custom-amount-wrap]');
  const customAmount = document.querySelector('[data-custom-amount]');
  const payMethods = Array.from(document.querySelectorAll('[data-pay-method]'));
  const originalPrice = document.querySelector('[data-original-price]');
  const finalPrice = document.querySelector('[data-final-price]');
  const discount = document.querySelector('[data-discount]');
  const rateNote = document.querySelector('[data-rate-note]');
  const paymentTitle = document.querySelector('[data-payment-title]');
  const paymentTag = document.querySelector('[data-payment-tag]');
  const alipayPanel = document.querySelector('[data-alipay-panel]');
  const usdtPanel = document.querySelector('[data-usdt-panel]');
  const alipayQr = document.querySelector('[data-alipay-qr]');
  const alipayEmpty = document.querySelector('[data-alipay-empty]');
  const usdtQr = document.querySelector('[data-usdt-qr]');
  const usdtEmpty = document.querySelector('[data-usdt-empty]');
  const usdtNetwork = document.querySelector('[data-usdt-network]');
  const usdtAddress = document.querySelector('[data-usdt-address]');
  const usdtAddressRow = document.querySelector('[data-usdt-address-row]');
  const copyWallet = document.querySelector('[data-copy-wallet]');
  const statusBox = document.querySelector('[data-status]');

  function round2(value){
    return Math.round(Number(value || 0) * 100) / 100;
  }

  function money(value){
    const n = Number(value || 0);
    return '￥' + (Number.isInteger(n) ? n : n.toFixed(2));
  }

  function usdtMoney(value){
    return Number(value || 0).toFixed(2) + ' USDT';
  }

  function usdtRate(){
    const value = Number(config.usdtRateCnyPerUsdt || 6.85);
    return value > 0 ? value : 6.85;
  }

  function usdtDiscount(){
    const value = Number(config.usdtDiscount || 0.9);
    return value > 0 && value <= 1 ? value : 0.9;
  }

  function selectedMethod(){
    const item = payMethods.find((input) => input.checked);
    return item ? item.value : 'alipay';
  }

  function basePrice(){
    const item = ORDER_PRODUCTS[serviceEl.value] || ORDER_PRODUCTS.spotify;
    if(serviceEl.value === 'other') return Number(customAmount.value || 0);
    return item.price;
  }

  function discountedCny(price){
    return round2(price * usdtDiscount());
  }

  function payableUsdt(price){
    return round2(discountedCny(price) / usdtRate());
  }

  function syncQr(img, empty, src){
    if(!img || !empty) return;
    if(src){
      img.src = src;
      img.hidden = false;
      empty.hidden = true;
    }else{
      img.hidden = true;
      empty.hidden = false;
    }
  }

  function updatePaymentInfo(){
    const method = selectedMethod();
    const price = basePrice();
    const isUsdt = method === 'usdt';
    const usdtDue = payableUsdt(price);
    const cnyDue = discountedCny(price);

    customWrap.classList.toggle('show', serviceEl.value === 'other');
    originalPrice.textContent = price ? money(price) : '客服报价';
    finalPrice.textContent = price ? (isUsdt ? usdtMoney(usdtDue) : money(price)) : '客服确认';
    discount.textContent = isUsdt ? 'USDT 9折 · 汇率 ' + usdtRate().toFixed(2) : '无';
    if(rateNote){
      rateNote.hidden = !isUsdt || !price;
      rateNote.textContent = price ? '折后人民币 ' + money(cnyDue) + '，按 6.85 汇率折算为 ' + usdtMoney(usdtDue) : '';
    }

    if(isUsdt){
      paymentTitle.textContent = 'USDT 扫码付款';
      paymentTag.textContent = 'USDT';
      alipayPanel.hidden = true;
      usdtPanel.hidden = false;
      usdtNetwork.textContent = config.usdtNetwork || 'TRC20';
      syncQr(usdtQr, usdtEmpty, config.usdtQr);
      if(config.usdtAddress){
        usdtAddress.textContent = config.usdtAddress;
        usdtAddressRow.hidden = false;
        copyWallet.hidden = false;
        copyWallet.disabled = false;
      }else{
        usdtAddress.textContent = '';
        usdtAddressRow.hidden = true;
        copyWallet.hidden = true;
        copyWallet.disabled = true;
      }
    }else{
      paymentTitle.textContent = '支付宝扫码付款';
      paymentTag.textContent = 'RMB';
      alipayPanel.hidden = false;
      usdtPanel.hidden = true;
      syncQr(alipayQr, alipayEmpty, config.alipayQr);
    }
  }

  function orderPayload(){
    const item = ORDER_PRODUCTS[serviceEl.value] || ORDER_PRODUCTS.spotify;
    const method = selectedMethod();
    const price = round2(basePrice());
    const isUsdt = method === 'usdt';
    const data = new FormData(form);
    return {
      service: serviceEl.value,
      serviceLabel: item.label,
      cycle: item.cycle,
      originalAmount: price,
      discountedCnyAmount: isUsdt ? discountedCny(price) : 0,
      finalAmount: isUsdt ? payableUsdt(price) : price,
      currency: isUsdt ? 'USDT' : 'CNY',
      exchangeRate: isUsdt ? usdtRate() : 0,
      discountRate: isUsdt ? usdtDiscount() : 1,
      paymentMethod: method,
      account: String(data.get('account') || '').trim(),
      password: String(data.get('password') || '').trim(),
      contact: String(data.get('contact') || '').trim(),
      paymentRef: String(data.get('paymentRef') || '').trim(),
      remark: String(data.get('remark') || '').trim()
    };
  }

  function summary(payload, orderId){
    const rows = [
      '订单号：' + orderId,
      '服务：' + payload.serviceLabel,
      '周期：' + payload.cycle,
      '支付方式：' + (payload.paymentMethod === 'usdt' ? 'USDT 9折' : '支付宝'),
      '原价：' + (payload.originalAmount ? money(payload.originalAmount) : '客服报价')
    ];
    if(payload.paymentMethod === 'usdt'){
      rows.push('折后人民币：' + (payload.discountedCnyAmount ? money(payload.discountedCnyAmount) : '客服确认'));
      rows.push('汇率：1 USDT = ' + payload.exchangeRate.toFixed(2) + ' CNY');
      rows.push('应付：' + (payload.finalAmount ? usdtMoney(payload.finalAmount) : '客服确认'));
    }else{
      rows.push('应付：' + (payload.finalAmount ? money(payload.finalAmount) : '客服确认'));
    }
    rows.push('账号：' + payload.account);
    rows.push('密码：' + payload.password);
    rows.push('联系方式：' + payload.contact);
    rows.push('付款备注/交易号：' + (payload.paymentRef || '无'));
    rows.push('备注：' + (payload.remark || '无'));
    return rows.join('\n');
  }

  function setStatus(text, warn){
    statusBox.textContent = text;
    statusBox.classList.toggle('warn', !!warn);
    statusBox.classList.add('show');
  }

  async function copyText(text){
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const requested = params.get('service');
  if(requested && ORDER_PRODUCTS[requested]) serviceEl.value = requested;

  serviceEl.addEventListener('change', updatePaymentInfo);
  customAmount.addEventListener('input', updatePaymentInfo);
  payMethods.forEach((item) => item.addEventListener('change', updatePaymentInfo));
  copyWallet.addEventListener('click', async () => {
    if(!config.usdtAddress) return;
    await copyText(config.usdtAddress);
    copyWallet.textContent = '已复制';
    setTimeout(() => { copyWallet.textContent = '复制地址'; }, 1600);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = orderPayload();
    if(!payload.account || !payload.password || !payload.contact){
      setStatus('请填写账号、密码和联系方式。', true);
      return;
    }

    let result;
    try{
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      result = await response.json();
      if(!response.ok || !result.ok) throw new Error(result.error || 'submit_failed');
    }catch(error){
      const fallbackId = 'MY' + Date.now().toString().slice(-10);
      const text = summary(payload, fallbackId);
      await copyText(text);
      setStatus('订单已生成。\n订单信息已尝试复制，请发送给在线客服。\n\n' + text, true);
      return;
    }

    const text = summary(payload, result.orderId);
    if(result.delivered || result.stored){
      setStatus('订单提交成功。\n订单号：' + result.orderId);
      form.reset();
      serviceEl.value = payload.service;
      updatePaymentInfo();
    }else{
      await copyText(text);
      setStatus('订单已生成。\n订单信息已尝试复制，请发送给在线客服。\n\n' + text, true);
    }
  });

  updatePaymentInfo();
})();
