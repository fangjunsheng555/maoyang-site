const ORDER_PRODUCTS = {
  spotify: { label: 'Spotify Premium', price: 128, billing: 'yearly' },
  netflix: { label: 'Netflix Premium', price: 168, billing: 'yearly' },
  disney: { label: 'Disney+', price: 108, billing: 'yearly' },
  hbomax: { label: 'HBO Max', price: 148, billing: 'yearly' },
  chatgpt: { label: 'ChatGPT Plus', billing: 'chatgpt' },
  network: { label: '网络节点服务', price: 99, billing: 'yearly' },
  other: { label: '其他服务 / 客服报价', price: 0, billing: 'custom' }
};

const SERVICE_ORDER = ['spotify', 'netflix', 'disney', 'hbomax', 'chatgpt', 'network', 'other'];

const YEARLY_PLANS = [
  { value: '1y', label: '1年', cycle: '1年', years: 1, rate: 1, discountLabel: '' },
  { value: '2y', label: '2年（9折）', cycle: '2年（9折）', years: 2, rate: 0.9, discountLabel: '两年9折' },
  { value: '3y', label: '3年（8折）', cycle: '3年（8折）', years: 3, rate: 0.8, discountLabel: '三年8折' }
];

const CHATGPT_PLANS = [
  { value: 'month', label: '月付 ¥75', cycle: '月付', amount: 75, discountLabel: '' },
  { value: 'quarter', label: '三个月 ¥188', cycle: '三个月', amount: 188, discountLabel: '' },
  { value: 'year', label: '年付 ¥588', cycle: '年付', amount: 588, discountLabel: '' }
];

const CUSTOM_PLAN = { value: 'custom', label: '客服报价', cycle: '客服报价', amount: 0, discountLabel: '' };

(function(){
  const form = document.querySelector('[data-order-form]');
  if(!form) return;

  const config = window.MAOYANG_PAYMENT || {};
  const serviceEl = form.querySelector('[data-service]');
  const accountInput = form.querySelector('#account');
  const passwordInput = form.querySelector('#password');
  const remarkInput = form.querySelector('#remark');
  const accountField = accountInput ? accountInput.closest('.field') : null;
  const passwordField = passwordInput ? passwordInput.closest('.field') : null;
  const accountLabel = form.querySelector("label[for='account']");
  const remarkLabel = form.querySelector("label[for='remark']");
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
  let planEl = null;
  let planHint = null;

  installServiceOptions();
  installPlanField();
  installRemarkHint();
  installPasswordToggle();

  function installServiceOptions(){
    if(!serviceEl) return;
    const requested = new URLSearchParams(window.location.search).get('service');
    const current = requested && ORDER_PRODUCTS[requested] ? requested : (ORDER_PRODUCTS[serviceEl.value] ? serviceEl.value : 'spotify');
    serviceEl.innerHTML = '';
    SERVICE_ORDER.forEach((key) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = ORDER_PRODUCTS[key].label;
      serviceEl.appendChild(option);
    });
    serviceEl.value = current;
  }

  function installPlanField(){
    if(document.querySelector('[data-order-plan-style]')) return;
    const style = document.createElement('style');
    style.dataset.orderPlanStyle = 'true';
    style.textContent = '.planHint{display:block;color:#667085;font-size:12px;font-weight:850;line-height:1.45}.planField[hidden]{display:none!important}.field select[data-plan]{font-weight:850}.summaryItem b{overflow-wrap:anywhere}';
    document.head.appendChild(style);

    const serviceField = serviceEl ? serviceEl.closest('.field') : null;
    if(!serviceField) return;
    const field = document.createElement('div');
    field.className = 'field planField';
    field.innerHTML = "<label for='plan'>周期 / 套餐</label><select id='plan' name='plan' data-plan></select><small class='planHint' data-plan-hint></small>";
    serviceField.insertAdjacentElement('afterend', field);
    planEl = field.querySelector('[data-plan]');
    planHint = field.querySelector('[data-plan-hint]');
    planEl.addEventListener('change', updatePaymentInfo);
  }

  function installRemarkHint(){
    if(remarkLabel) remarkLabel.textContent = '备注（非必填）';
    if(remarkInput) remarkInput.placeholder = '订单备注（非必填）：地区、时长、特殊需求或客服报价说明';
  }

  function installPasswordToggle(){
    if(!passwordInput || passwordInput.dataset.toggleInstalled) return;

    if(!document.querySelector('[data-password-toggle-style]')){
      const style = document.createElement('style');
      style.dataset.passwordToggleStyle = 'true';
      style.textContent = '.passwordReveal{position:relative;display:flex;align-items:center;width:100%}.passwordReveal input{padding-right:76px}.passwordRevealBtn{position:absolute;right:8px;top:50%;transform:translateY(-50%);min-height:32px;border:0;border-radius:999px;background:#e7f3f1;color:#0b4f4a;font-weight:950;padding:0 12px;cursor:pointer}.passwordRevealBtn:hover{background:#d7ebe8}.passwordRevealBtn:focus{outline:none;box-shadow:0 0 0 3px rgba(15,118,110,.16)}';
      document.head.appendChild(style);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'passwordReveal';
    passwordInput.parentNode.insertBefore(wrapper, passwordInput);
    wrapper.appendChild(passwordInput);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'passwordRevealBtn';
    toggle.textContent = '显示';
    toggle.setAttribute('aria-label', '显示密码');
    toggle.setAttribute('aria-pressed', 'false');
    toggle.addEventListener('click', () => {
      const willShow = passwordInput.type === 'password';
      passwordInput.type = willShow ? 'text' : 'password';
      toggle.textContent = willShow ? '隐藏' : '显示';
      toggle.setAttribute('aria-label', willShow ? '隐藏密码' : '显示密码');
      toggle.setAttribute('aria-pressed', String(willShow));
    });
    wrapper.appendChild(toggle);
    passwordInput.dataset.toggleInstalled = 'true';
  }

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

  function planOptions(){
    const product = selectedProduct();
    if(product.billing === 'yearly') return YEARLY_PLANS;
    if(product.billing === 'chatgpt') return CHATGPT_PLANS;
    return [CUSTOM_PLAN];
  }

  function syncPlanOptions(){
    if(!planEl) return;
    const product = selectedProduct();
    const options = planOptions();
    const current = planEl.value;
    planEl.innerHTML = '';
    options.forEach((plan) => {
      const option = document.createElement('option');
      option.value = plan.value;
      option.textContent = plan.label;
      planEl.appendChild(option);
    });
    planEl.value = options.some((plan) => plan.value === current) ? current : options[0].value;
    const field = planEl.closest('.planField');
    if(field) field.hidden = product.billing === 'custom';
    if(planHint){
      if(product.billing === 'yearly') planHint.textContent = '年付服务：两年9折，三年8折';
      else if(product.billing === 'chatgpt') planHint.textContent = 'ChatGPT Plus 支持月付、三个月与年付套餐';
      else planHint.textContent = '';
    }
  }

  function selectedPlan(){
    const options = planOptions();
    const value = planEl ? planEl.value : options[0].value;
    return options.find((plan) => plan.value === value) || options[0];
  }

  function credentialMode(){
    if(['netflix', 'disney', 'hbomax'].includes(serviceEl.value)) return 'none';
    if(serviceEl.value === 'network') return 'username';
    return 'accountPassword';
  }

  function needsAccountPassword(){
    return credentialMode() === 'accountPassword';
  }

  function needsUsername(){
    return credentialMode() === 'username';
  }

  function validUsername(value){
    return /^[A-Za-z0-9]{3,10}$/.test(String(value || '').trim());
  }

  function syncCredentialFields(){
    const mode = credentialMode();
    const showAccount = mode !== 'none';
    const showPassword = mode === 'accountPassword';

    if(accountField) accountField.hidden = !showAccount;
    if(accountInput){
      accountInput.required = showAccount;
      accountInput.disabled = !showAccount;
      if(mode === 'username'){
        accountInput.placeholder = '3-10位数字字母组合，区分大小写';
        accountInput.setAttribute('pattern', '[A-Za-z0-9]{3,10}');
        accountInput.setAttribute('minlength', '3');
        accountInput.setAttribute('maxlength', '10');
      }else{
        accountInput.placeholder = '需要开通的账号';
        accountInput.removeAttribute('pattern');
        accountInput.removeAttribute('minlength');
        accountInput.removeAttribute('maxlength');
      }
    }
    if(accountLabel) accountLabel.textContent = mode === 'username' ? '设置你的用户名' : '账号';

    if(passwordField) passwordField.hidden = !showPassword;
    if(passwordInput){
      passwordInput.required = showPassword;
      passwordInput.disabled = !showPassword;
    }
  }

  function basePrice(){
    const product = selectedProduct();
    const plan = selectedPlan();
    if(product.billing === 'custom') return Number(customAmount.value || 0);
    if(product.billing === 'chatgpt') return Number(plan.amount || 0);
    return round2(product.price * (plan.years || 1) * (plan.rate || 1));
  }

  function planDiscountText(){
    const plan = selectedPlan();
    return plan.discountLabel || '';
  }

  function cycleText(){
    return selectedPlan().cycle || selectedProduct().cycle || '--';
  }

  function discountedCny(price){
    return round2(price * usdtDiscount());
  }

  function payableUsdt(price){
    return round2(discountedCny(price) / usdtRate());
  }

  function updatePaymentInfo(){
    syncPlanOptions();
    const method = selectedMethod();
    const product = selectedProduct();
    const price = basePrice();
    const isUsdt = method === 'usdt';
    const usdtDue = payableUsdt(price);
    const cnyDue = discountedCny(price);
    const planDiscount = planDiscountText();

    syncCredentialFields();
    customWrap.classList.toggle('show', serviceEl.value === 'other');
    originalPrice.textContent = price ? money(price) : '客服报价';
    finalPrice.textContent = price ? (isUsdt ? usdtMoney(usdtDue) : money(price)) : '客服确认';
    discount.textContent = isUsdt ? ((planDiscount ? planDiscount + ' + ' : '') + 'USDT 9折 · 汇率 ' + usdtRate().toFixed(2)) : (planDiscount || '无');
    if(rateNote){
      rateNote.hidden = !isUsdt || !price;
      rateNote.textContent = price ? '折后人民币 ' + money(cnyDue) + '，按 6.85 汇率折算为 ' + usdtMoney(usdtDue) : '';
    }
    if(summaryService) summaryService.textContent = product.label;
    if(summaryCycle) summaryCycle.textContent = cycleText();
    if(summaryPayment) summaryPayment.textContent = isUsdt ? 'USDT' : '支付宝';
  }

  function orderPayload(){
    const item = selectedProduct();
    const method = selectedMethod();
    const price = round2(basePrice());
    const isUsdt = method === 'usdt';
    const mode = credentialMode();
    const data = new FormData(form);
    return {
      service: serviceEl.value,
      serviceLabel: item.label,
      cycle: cycleText(),
      originalAmount: price,
      discountedCnyAmount: isUsdt ? discountedCny(price) : 0,
      finalAmount: isUsdt ? payableUsdt(price) : price,
      currency: isUsdt ? 'USDT' : 'CNY',
      exchangeRate: isUsdt ? usdtRate() : 0,
      discountRate: isUsdt ? usdtDiscount() : 1,
      paymentMethod: method,
      account: mode !== 'none' ? String(data.get('account') || '').trim() : '',
      password: mode === 'accountPassword' ? String(data.get('password') || '').trim() : '',
      contact: String(data.get('contact') || '').trim(),
      remark: String(data.get('remark') || '').trim()
    };
  }

  function setStatus(text, warn){
    statusBox.textContent = text;
    statusBox.classList.toggle('warn', !!warn);
    statusBox.classList.add('show');
  }

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
    if(needsUsername() && !validUsername(payload.account)){
      setStatus('请填写 3-10 位数字字母组合用户名，区分大小写。', true);
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
