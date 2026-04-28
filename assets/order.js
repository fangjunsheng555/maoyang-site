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
  const accountInput = form.querySelector('#account');
  const passwordInput = form.querySelector('#password');
  const authFields = [accountInput, passwordInput].map((input) => input ? input.closest('.field') : null).filter(Boolean);
  const customWrap = document.querySelector('[data-custom-amount-wrap]');
  const customAmount = document.querySelector('[data-custom-amount]');
  const payMethods = Array.from(document.querySelectorAll('[data-pay-method]'));
  const originalPrice = document.querySelector('[data-original-price]');
  const finalPrice = document.querySelector('[data-final-price]');
  const discount = document.querySelector('[data-discount]');
  const rateNote = document.querySelector('[data-rate-note]');
  const summaryService = document.querySelector('[data-summary-service]');
  const summaryCycle = document.querySelector('[data-summary-cycle]');
  const summaryPayment = document.querySelector('[data-summary-payment]');
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

  function selectedProduct(){
    return ORDER_PRODUCTS[serviceEl.value] || ORDER_PRODUCTS.spotify;
  }

  function needsAccountPassword(){
    return serviceEl.value !== 'netflix';
  }

  function syncCredentialFields(){
    const needsAuth = needsAccountPassword();
    authFields.forEach((field) => { field.hidden = !needsAuth; });
    [accountInput, passwordInput].forEach((input) => {
      if(!input) return;
      input.required = needsAuth;
      input.disabled = !needsAuth;
    });
  }

  function basePrice(){
    if(serviceEl.value === 'other') return Number(customAmount.value || 0);
    return selectedProduct().price;
  }

  function discountedCny(price){
    return round2(price * usdtDiscount());
  }

  function payableUsdt(price){
    return round2(discountedCny(price) / usdtRate());
  }

  function updatePaymentInfo(){
    const method = selectedMethod();
    const product = selectedProduct();
    const price = basePrice();
    const isUsdt = method === 'usdt';
    const usdtDue = payableUsdt(price);
    const cnyDue = discountedCny(price);

    syncCredentialFields();
    customWrap.classList.toggle('show', serviceEl.value === 'other');
    originalPrice.textContent = price ? money(price) : '客服报价';
    finalPrice.textContent = price ? (isUsdt ? usdtMoney(usdtDue) : money(price)) : '客服确认';
    discount.textContent = isUsdt ? 'USDT 9折 · 汇率 ' + usdtRate().toFixed(2) : '无';
    if(rateNote){
      rateNote.hidden = !isUsdt || !price;
      rateNote.textContent = price ? '折后人民币 ' + money(cnyDue) + '，按 6.85 汇率折算为 ' + usdtMoney(usdtDue) : '';
    }
    if(summaryService) summaryService.textContent = product.label;
    if(summaryCycle) summaryCycle.textContent = product.cycle;
    if(summaryPayment) summaryPayment.textContent = isUsdt ? 'USDT' : '支付宝';
  }

  function orderPayload(){
    const item = selectedProduct();
    const method = selectedMethod();
    const price = round2(basePrice());
    const isUsdt = method === 'usdt';
    const needsAuth = needsAccountPassword();
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
      account: needsAuth ? String(data.get('account') || '').trim() : '',
      password: needsAuth ? String(data.get('password') || '').trim() : '',
      contact: String(data.get('contact') || '').trim(),
      remark: String(data.get('remark') || '').trim()
    };
  }

  function setStatus(text, warn){
    statusBox.textContent = text;
    statusBox.classList.toggle('warn', !!warn);
    statusBox.classList.add('show');
  }

  const params = new URLSearchParams(window.location.search);
  const requested = params.get('service');
  if(requested && ORDER_PRODUCTS[requested]) serviceEl.value = requested;

  serviceEl.addEventListener('change', updatePaymentInfo);
  customAmount.addEventListener('input', updatePaymentInfo);
  payMethods.forEach((item) => item.addEventListener('change', updatePaymentInfo));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = orderPayload();
    if(!payload.contact){
      setStatus('请填写联系方式。', true);
      return;
    }
    if(needsAccountPassword() && (!payload.account || !payload.password)){
      setStatus('请填写账号、密码和联系方式。', true);
      return;
    }
    if(!payload.originalAmount){
      setStatus('请填写客服报价金额。', true);
      return;
    }

    sessionStorage.setItem('maoyangPendingOrder', JSON.stringify(payload));
    window.location.href = 'payment.html';
  });

  updatePaymentInfo();
})();
