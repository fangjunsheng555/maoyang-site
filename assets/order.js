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

const PRODUCT_LABEL_EN = {
  spotify: 'Spotify Premium',
  netflix: 'Netflix Premium',
  disney: 'Disney+',
  hbomax: 'HBO Max',
  chatgpt: 'ChatGPT Plus',
  network: 'VPN Service',
  other: 'Other Service / Custom Quote'
};

const PLAN_EN = {
  '1y': { label: '1 Year', cycle: '1 Year', discountLabel: '' },
  '2y': { label: '2 Years (10% off)', cycle: '2 Years (10% off)', discountLabel: '2-year 10% off' },
  '3y': { label: '3 Years (20% off)', cycle: '3 Years (20% off)', discountLabel: '3-year 20% off' },
  month: { label: 'Monthly ¥75', cycle: 'Monthly', discountLabel: '' },
  quarter: { label: '3 Months ¥188', cycle: '3 Months', discountLabel: '' },
  year: { label: 'Annual ¥588', cycle: 'Annual', discountLabel: '' },
  custom: { label: 'Custom Quote', cycle: 'Custom Quote', discountLabel: '' }
};

const ORDER_TEXT = {
  zh: {
    planLabel: '周期 / 套餐',
    yearlyHint: '年付服务：两年9折，三年8折',
    chatgptHint: 'ChatGPT Plus 支持月付、三个月与年付套餐',
    remarkLabel: '备注（非必填）',
    remarkPlaceholder: '订单备注（非必填）：地区、时长、特殊需求或客服报价说明',
    show: '显示',
    hide: '隐藏',
    showPassword: '显示密码',
    hidePassword: '隐藏密码',
    usernameLabel: '设置你的用户名',
    accountLabel: '账号',
    usernamePlaceholder: '3-10位数字字母组合，区分大小写',
    accountPlaceholder: '需要开通的账号',
    customAmountLabel: '报价金额',
    contactLabel: '联系方式',
    contactNote: '*请准确填写，客服订单核实凭证并可用于日后订单查询；',
    serviceLabel: '会员服务',
    paymentTitle: '支付方式',
    summaryTitle: '订单摘要',
    originalPrice: '原价',
    paymentDiscount: '支付优惠',
    amountDue: '应付',
    cycle: '周期',
    paymentMethod: '支付方式',
    alipayTitle: '支付宝扫码',
    alipayHint: '',
    usdtTitle: 'USDT 支付',
    usdtHint: '9 折优惠',
    submit: '前往支付',
    backToServices: '返回购买页',
    contactSupport: '联系客服',
    customQuote: '客服报价',
    customerConfirm: '客服确认',
    noDiscount: '无',
    usdtDiscount: 'USDT 9折 · 汇率 {rate}',
    rateNote: '折后人民币 {cny}，按 6.85 汇率折算为 {usdt}',
    alipay: '支付宝',
    contactMissing: '请填写联系方式。',
    usernameMissing: '请填写 3-10 位数字字母组合用户名，区分大小写。',
    accountMissing: '请填写账号、密码和联系方式。',
    amountMissing: '请填写客服报价金额。'
  },
  en: {
    planLabel: 'Cycle / Plan',
    yearlyHint: 'Annual services: 10% off for 2 years, 20% off for 3 years.',
    chatgptHint: 'ChatGPT Plus supports monthly, 3-month, and annual plans.',
    remarkLabel: 'Order Notes (Optional)',
    remarkPlaceholder: 'Order notes (optional): region, duration, special requests, or custom quote details',
    show: 'Show',
    hide: 'Hide',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    usernameLabel: 'Set your username',
    accountLabel: 'Account',
    usernamePlaceholder: '3-10 letters or numbers, case-sensitive',
    accountPlaceholder: 'Account to activate',
    customAmountLabel: 'Quoted Amount',
    contactLabel: 'Contact Information',
    contactNote: '*Please enter this accurately. Support uses it to verify your order, and it can be used for future order lookup.',
    serviceLabel: 'Membership Service',
    paymentTitle: 'Payment Method',
    summaryTitle: 'Order Summary',
    originalPrice: 'Original Price',
    paymentDiscount: 'Payment Discount',
    amountDue: 'Amount Due',
    cycle: 'Cycle',
    paymentMethod: 'Payment Method',
    alipayTitle: 'Alipay QR Payment',
    alipayHint: '',
    usdtTitle: 'USDT Payment',
    usdtHint: '10% off',
    submit: 'Go to Payment',
    backToServices: 'Back to Services',
    contactSupport: 'Contact Support',
    customQuote: 'Custom quote',
    customerConfirm: 'Support confirmation',
    noDiscount: 'None',
    usdtDiscount: 'USDT 10% off · Rate {rate}',
    rateNote: 'Discounted CNY amount: {cny}. Converted at 6.85 to {usdt}.',
    alipay: 'Alipay',
    contactMissing: 'Please enter your contact information.',
    usernameMissing: 'Please enter a 3-10 character username using letters and numbers. It is case-sensitive.',
    accountMissing: 'Please enter account, password, and contact information.',
    amountMissing: 'Please enter the quoted amount from support.',
    requiredField: 'Please fill out this field.',
    passwordMissing: 'Please enter the account password.',
    accountRequired: 'Please enter the account to activate.',
    usernameRequired: 'Please set a username using 3-10 letters or numbers. It is case-sensitive.'
  }
};

function orderLang(){
  if(window.MAOYANG_GET_LANG) return window.MAOYANG_GET_LANG();
  try{
    const saved = localStorage.getItem('maoyangLang');
    if(saved === 'zh' || saved === 'en') return saved;
  }catch(error){}
  return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
}

function orderText(key, values){
  let text = (ORDER_TEXT[orderLang()] || ORDER_TEXT.zh)[key] || ORDER_TEXT.zh[key] || key;
  Object.keys(values || {}).forEach((name) => {
    text = text.replace('{' + name + '}', values[name]);
  });
  return text;
}

function productLabel(key){
  return orderLang() === 'en' ? (PRODUCT_LABEL_EN[key] || ORDER_PRODUCTS[key].label) : ORDER_PRODUCTS[key].label;
}

function planCopy(plan, field){
  if(orderLang() !== 'en') return plan[field] || '';
  return (PLAN_EN[plan.value] && PLAN_EN[plan.value][field]) || plan[field] || '';
}

(function(){
  const form = document.querySelector('[data-order-form]');
  if(!form) return;

  const config = window.MAOYANG_PAYMENT || {};
  const serviceEl = form.querySelector('[data-service]');
  const accountInput = form.querySelector('#account');
  const passwordInput = form.querySelector('#password');
  const contactInput = form.querySelector('#contact');
  const remarkInput = form.querySelector('#remark');
  const accountField = accountInput ? accountInput.closest('.field') : null;
  const passwordField = passwordInput ? passwordInput.closest('.field') : null;
  const contactField = contactInput ? contactInput.closest('.field') : null;
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
  installContactNote();
  installPasswordToggle();
  installValidityMessages();
  applyStaticText();

  function installServiceOptions(){
    if(!serviceEl) return;
    const requested = new URLSearchParams(window.location.search).get('service');
    const current = requested && ORDER_PRODUCTS[requested] ? requested : (ORDER_PRODUCTS[serviceEl.value] ? serviceEl.value : 'spotify');
    serviceEl.innerHTML = '';
    SERVICE_ORDER.forEach((key) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = productLabel(key);
      serviceEl.appendChild(option);
    });
    serviceEl.value = current;
  }

  function refreshServiceOptionLabels(){
    if(!serviceEl) return;
    Array.from(serviceEl.options).forEach((option) => {
      if(ORDER_PRODUCTS[option.value]) option.textContent = productLabel(option.value);
    });
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
    field.innerHTML = "<label for='plan' data-plan-label>" + orderText('planLabel') + "</label><select id='plan' name='plan' data-plan></select><small class='planHint' data-plan-hint></small>";
    serviceField.insertAdjacentElement('afterend', field);
    planEl = field.querySelector('[data-plan]');
    planHint = field.querySelector('[data-plan-hint]');
    planEl.addEventListener('change', updatePaymentInfo);
  }

  function installRemarkHint(){
    if(remarkLabel) remarkLabel.textContent = orderText('remarkLabel');
    if(remarkInput) remarkInput.placeholder = orderText('remarkPlaceholder');
  }

  function installContactNote(){
    if(!contactField || !contactInput) return;
    if(!document.querySelector('[data-contact-note-style]')){
      const style = document.createElement('style');
      style.dataset.contactNoteStyle = 'true';
      style.textContent = '.contactInlineNote{color:#c42121;font-size:12px;font-weight:950;line-height:1.35}.field label.contactLabelWithNote{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap}.field label.contactLabelWithNote .contactInlineNote{flex:1 1 260px}@media(max-width:560px){.field label.contactLabelWithNote{display:grid;gap:4px}}';
      document.head.appendChild(style);
    }
    const label = contactField.querySelector("label[for='contact']");
    if(!label) return;
    label.classList.add('contactLabelWithNote');
    let note = label.querySelector('[data-contact-note]');
    if(!note){
      note = document.createElement('span');
      note.className = 'contactInlineNote';
      note.dataset.contactNote = 'true';
      label.appendChild(note);
    }
    note.textContent = orderText('contactNote');
  }

  function setHtml(node, value){
    if(node) node.innerHTML = value;
  }

  function applyStaticText(){
    const headings = Array.from(document.querySelectorAll('.orderBox h2'));
    if(headings[0]) headings[0].textContent = orderLang() === 'en' ? 'Order Information' : '订单信息';
    if(headings[1]) headings[1].textContent = orderText('paymentTitle');
    if(headings[2]) headings[2].textContent = orderText('summaryTitle');

    const serviceLabelNode = form.querySelector("label[for='service']");
    const customAmountLabel = form.querySelector("label[for='customAmount']");
    const passwordLabel = form.querySelector("label[for='password']");
    const contactLabel = form.querySelector("label[for='contact']");
    if(serviceLabelNode) serviceLabelNode.textContent = orderText('serviceLabel');
    if(customAmountLabel) customAmountLabel.textContent = orderText('customAmountLabel');
    if(passwordLabel) passwordLabel.textContent = orderLang() === 'en' ? 'Password' : '密码';
    if(contactLabel) contactLabel.firstChild ? contactLabel.firstChild.textContent = orderText('contactLabel') : contactLabel.textContent = orderText('contactLabel');
    installContactNote();
    if(customAmount) customAmount.placeholder = orderLang() === 'en' ? 'Amount quoted by support' : '填写客服报价金额';
    if(passwordInput) passwordInput.placeholder = orderLang() === 'en' ? 'Account password' : '账号密码';

    const payLabels = Array.from(document.querySelectorAll('.payTabs label span'));
    setHtml(payLabels[0], orderText('alipayTitle'));
    setHtml(payLabels[1], orderText('usdtTitle') + '<small>' + orderText('usdtHint') + '</small>');

    const amountRows = Array.from(document.querySelectorAll('.amountPanel .amountRow span'));
    if(amountRows[0]) amountRows[0].textContent = orderText('originalPrice');
    if(amountRows[1]) amountRows[1].textContent = orderText('paymentDiscount');
    if(amountRows[2]) amountRows[2].textContent = orderText('amountDue');

    const summaryRows = Array.from(document.querySelectorAll('.summaryItem span'));
    if(summaryRows[0]) summaryRows[0].textContent = orderText('serviceLabel');
    if(summaryRows[1]) summaryRows[1].textContent = orderText('cycle');
    if(summaryRows[2]) summaryRows[2].textContent = orderText('paymentMethod');

    const actions = Array.from(document.querySelectorAll('.orderFooterActions a'));
    if(actions[0]) actions[0].textContent = orderText('backToServices');
    if(actions[1]) actions[1].textContent = orderText('contactSupport');
    const submit = document.querySelector('.submitBtn');
    if(submit) submit.textContent = orderText('submit');

    const toggle = document.querySelector('.passwordRevealBtn');
    if(toggle && passwordInput) renderPasswordToggle(toggle);
  }

  function eyeIcon(isVisible){
    if(isVisible){
      return "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M3 12s3.4-6 9-6 9 6 9 6-3.4 6-9 6-9-6-9-6Z'/><circle cx='12' cy='12' r='2.5'/></svg>";
    }
    return "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M3 12s3.4-6 9-6 9 6 9 6-3.4 6-9 6-9-6-9-6Z'/><circle cx='12' cy='12' r='2.5'/><path d='M4 20 20 4'/></svg>";
  }

  function renderPasswordToggle(toggle){
    const isVisible = passwordInput.type === 'text';
    toggle.innerHTML = eyeIcon(isVisible);
    toggle.setAttribute('aria-label', isVisible ? orderText('hidePassword') : orderText('showPassword'));
    toggle.setAttribute('title', isVisible ? orderText('hidePassword') : orderText('showPassword'));
    toggle.setAttribute('aria-pressed', String(isVisible));
  }

  function installPasswordToggle(){
    if(!passwordInput || passwordInput.dataset.toggleInstalled) return;

    if(!document.querySelector('[data-password-toggle-style]')){
      const style = document.createElement('style');
      style.dataset.passwordToggleStyle = 'true';
      style.textContent = '.passwordReveal{position:relative;display:flex;align-items:center;width:100%}.passwordReveal input{padding-right:48px}.passwordRevealBtn{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:0;border-radius:999px;background:transparent;color:#2563eb;padding:0;cursor:pointer}.passwordRevealBtn svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.passwordRevealBtn:hover{background:#eff6ff}.passwordRevealBtn:focus{outline:none;box-shadow:0 0 0 3px rgba(37,99,235,.16)}';
      document.head.appendChild(style);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'passwordReveal';
    passwordInput.parentNode.insertBefore(wrapper, passwordInput);
    wrapper.appendChild(passwordInput);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'passwordRevealBtn';
    renderPasswordToggle(toggle);
    toggle.addEventListener('click', () => {
      const willShow = passwordInput.type === 'password';
      passwordInput.type = willShow ? 'text' : 'password';
      renderPasswordToggle(toggle);
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
      option.textContent = planCopy(plan, 'label');
      planEl.appendChild(option);
    });
    planEl.value = options.some((plan) => plan.value === current) ? current : options[0].value;
    const field = planEl.closest('.planField');
    if(field) field.hidden = product.billing === 'custom';
    if(planHint){
      if(product.billing === 'yearly') planHint.textContent = orderText('yearlyHint');
      else if(product.billing === 'chatgpt') planHint.textContent = orderText('chatgptHint');
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

  function requiredMessage(input){
    if(!input) return orderText('requiredField');
    if(input === contactInput) return orderText('contactMissing');
    if(input === passwordInput) return orderText('passwordMissing');
    if(input === accountInput && needsUsername()) return orderText('usernameRequired');
    if(input === accountInput) return orderText('accountRequired');
    if(input === customAmount) return orderText('amountMissing');
    return orderText('requiredField');
  }

  function installValidityMessages(){
    [accountInput, passwordInput, contactInput, customAmount].forEach((input) => {
      if(!input) return;
      input.addEventListener('invalid', () => {
        input.setCustomValidity(requiredMessage(input));
      });
      input.addEventListener('input', () => {
        input.setCustomValidity('');
      });
      input.addEventListener('change', () => {
        input.setCustomValidity('');
      });
    });
  }

  function showFieldError(input, message){
    if(input){
      input.setCustomValidity(message);
      input.reportValidity();
      setTimeout(() => input.setCustomValidity(''), 0);
    }
    setStatus(message, true);
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
        accountInput.placeholder = orderText('usernamePlaceholder');
        accountInput.setAttribute('pattern', '[A-Za-z0-9]{3,10}');
        accountInput.setAttribute('minlength', '3');
        accountInput.setAttribute('maxlength', '10');
      }else{
        accountInput.placeholder = orderText('accountPlaceholder');
        accountInput.removeAttribute('pattern');
        accountInput.removeAttribute('minlength');
        accountInput.removeAttribute('maxlength');
      }
    }
    if(accountLabel) accountLabel.textContent = mode === 'username' ? orderText('usernameLabel') : orderText('accountLabel');

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
    return planCopy(plan, 'discountLabel');
  }

  function cycleText(){
    return planCopy(selectedPlan(), 'cycle') || selectedProduct().cycle || '--';
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
    originalPrice.textContent = price ? money(price) : orderText('customQuote');
    finalPrice.textContent = price ? (isUsdt ? usdtMoney(usdtDue) : money(price)) : orderText('customerConfirm');
    discount.textContent = isUsdt ? ((planDiscount ? planDiscount + ' + ' : '') + orderText('usdtDiscount', { rate: usdtRate().toFixed(2) })) : (planDiscount || orderText('noDiscount'));
    if(rateNote){
      rateNote.hidden = !isUsdt || !price;
      rateNote.textContent = price ? orderText('rateNote', { cny: money(cnyDue), usdt: usdtMoney(usdtDue) }) : '';
    }
    if(summaryService) summaryService.textContent = productLabel(serviceEl.value);
    if(summaryCycle) summaryCycle.textContent = cycleText();
    if(summaryPayment) summaryPayment.textContent = isUsdt ? 'USDT' : orderText('alipay');
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
      serviceLabel: productLabel(serviceEl.value),
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
  window.addEventListener('maoyang:languagechange', () => {
    refreshServiceOptionLabels();
    const planLabel = document.querySelector('[data-plan-label]');
    if(planLabel) planLabel.textContent = orderText('planLabel');
    installRemarkHint();
    applyStaticText();
    syncPlanOptions();
    updatePaymentInfo();
    syncCredentialFields();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = orderPayload();
    if(!payload.contact){
      showFieldError(contactInput, orderText('contactMissing'));
      return;
    }
    if(needsUsername() && !validUsername(payload.account)){
      showFieldError(accountInput, orderText('usernameMissing'));
      return;
    }
    if(needsAccountPassword() && (!payload.account || !payload.password)){
      showFieldError(!payload.account ? accountInput : passwordInput, !payload.account ? orderText('accountRequired') : orderText('passwordMissing'));
      return;
    }
    if(!payload.originalAmount){
      showFieldError(customAmount, orderText('amountMissing'));
      return;
    }

    sessionStorage.setItem('maoyangPendingOrder', JSON.stringify(payload));
    window.location.href = 'payment.html';
  });

  updatePaymentInfo();
})();
