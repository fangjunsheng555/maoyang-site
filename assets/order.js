(function(){
  if(!window.MAOYANG_CART) return;
  const Cart = window.MAOYANG_CART;
  const form = document.querySelector('[data-checkout-form]');
  const emptyEl = document.querySelector('[data-empty-cart]');
  const itemsEl = document.querySelector('[data-cart-items]');
  const countEl = document.querySelector('[data-cart-count]');
  const summaryEl = document.querySelector('[data-cart-summary]');
  const productFieldsSection = document.querySelector('[data-product-fields-section]');
  const productFieldsEl = document.querySelector('[data-product-fields]');
  const payCnyEl = document.querySelector('[data-pay-cny]');
  const payUsdtEl = document.querySelector('[data-pay-usdt]');
  const mobileMethodEl = document.querySelector('[data-mobile-method]');
  const mobileAmountEl = document.querySelector('[data-mobile-amount]');
  const submitBtn = document.querySelector('[data-checkout-submit]');
  const paymentGroup = document.querySelector('.paymentMethodGroup');
  const statusEl = document.querySelector('[data-status]');
  const contactInput = form ? form.querySelector('input[name=contact]') : null;
  const emailInput = form ? form.querySelector('input[name=email]') : null;
  const contactReqEl = document.querySelector('[data-contact-req]');
  const contactNoteEl = document.querySelector('[data-contact-note]');
  const accountCard = document.querySelector('[data-account-checkout]');
  const accountBody = document.querySelector('[data-account-checkout-body]');
  const accountLoginBtn = document.querySelector('[data-account-login]');

  if(!form) return;
  let useWallet = true;
  let useCoupon = true;
  const redeemCheckout = readRedeemCheckout();
  if(redeemCheckout && redeemCheckout.service && Cart.PRODUCTS[redeemCheckout.service]){
    Cart.clear();
    Cart.add(redeemCheckout.service);
  }

  function money(v){ return '¥' + Number(v||0).toFixed(0); }
  function el(tag, cls, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
  function selectedMethod(){ const r = form.querySelector('input[name=paymentMethod]:checked'); return r ? r.value : 'alipay'; }
  function needsContact(items){ return items.some((p)=>p.key === 'spotify'); }
  function authState(){ return window.MAOYANG_AUTH && window.MAOYANG_AUTH.getState ? window.MAOYANG_AUTH.getState() : { user:null }; }
  function readRedeemCheckout(){
    try{ return JSON.parse(sessionStorage.getItem('maoyangRedeemCheckout') || 'null'); }
    catch(e){ return null; }
  }
  function isRedeemCheckout(){
    return !!(redeemCheckout && redeemCheckout.code && redeemCheckout.service);
  }
  function couponDeduction(items){
    const user = authState().user;
    if(!user || !useCoupon || isRedeemCheckout()) return 0;
    const coupons = Array.isArray(user.coupons) ? user.coupons : [];
    const coupon = coupons.find((item)=>item && (item.status || 'active') === 'active' && Number(item.amount || 0) > 0);
    if(!coupon) return 0;
    return Math.round(Math.max(0, Math.min(Number(coupon.amount || 0), Cart.finalCny(items))) * 100) / 100;
  }
  function walletDeduction(items){
    const user = authState().user;
    if(!user || !useWallet || isRedeemCheckout()) return 0;
    return Math.round(Math.max(0, Math.min(Number(user.balance || 0), Cart.finalCny(items) - couponDeduction(items))) * 100) / 100;
  }
  function payableCny(items){
    if(isRedeemCheckout()) return 0;
    return Math.round(Math.max(0, Cart.finalCny(items) - couponDeduction(items) - walletDeduction(items)) * 100) / 100;
  }
  function payableUsdt(items){
    return Math.round((payableCny(items) * Cart.usdtDiscount() / Cart.usdtRate()) * 100) / 100;
  }
  function setStatus(message, warn){
    if(!message){ statusEl.hidden = true; return; }
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.classList.toggle('warn', !!warn);
  }
  function fieldsState(){
    const out = {};
    Cart.items().forEach((p)=>{
      out[p.key] = {
        username: (form.querySelector('[data-field="' + p.key + '|username"]') || {}).value || '',
        account:  (form.querySelector('[data-field="' + p.key + '|account"]')  || {}).value || '',
        password: (form.querySelector('[data-field="' + p.key + '|password"]') || {}).value || ''
      };
    });
    return out;
  }
  let savedFields = {};

  function preserveFields(){
    Cart.items().forEach((p)=>{
      ['username','account','password'].forEach((f)=>{
        const node = form.querySelector('[data-field="' + p.key + '|' + f + '"]');
        if(node) savedFields[p.key + '|' + f] = node.value;
      });
    });
  }

  function renderItems(){
    const items = Cart.items();
    const count = items.length;
    countEl.textContent = count;

    if(count === 0){
      form.hidden = true;
      emptyEl.hidden = false;
      document.body.classList.remove('hasCheckoutMobileCta');
      return;
    }
    emptyEl.hidden = true;
    form.hidden = false;
    document.body.classList.add('hasCheckoutMobileCta');

    itemsEl.innerHTML = '';
    items.forEach((p)=>{
      const row = el('div','checkoutItem');
      row.innerHTML = '<div class="checkoutItemMedia" style="background:' + (p.accent || '#0f766e') + '14"><strong>' + p.label.charAt(0) + '</strong></div>' +
        '<div class="checkoutItemInfo"><strong>' + p.label + '</strong><small>' + p.subtitle + '</small></div>' +
        '<div class="checkoutItemPrice">' + money(p.amount) + '</div>' +
        (isRedeemCheckout() ? '<span class="checkoutRedeemTag">兑换码</span>' : '<button type="button" class="checkoutItemRemove" aria-label="移除 ' + p.label + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg></button>');
      const removeBtn = row.querySelector('.checkoutItemRemove');
      if(removeBtn){
        removeBtn.addEventListener('click', ()=>{
          preserveFields();
          Cart.remove(p.key);
        });
      }
      itemsEl.appendChild(row);
    });

    renderProductFields(items);
    syncContactRequirement(items);
    renderAccountPanel(items);
    renderSummary(items);
  }

  function syncContactRequirement(items){
    const required = needsContact(items);
    if(contactInput) contactInput.required = required;
    if(contactReqEl){
      contactReqEl.textContent = required ? '*' : '非必填';
      contactReqEl.className = required ? 'req' : 'opt';
    }
    if(contactNoteEl){
      contactNoteEl.textContent = required
        ? 'Spotify 订单需要留一个可联系账号，便于家庭组邀请或异常处理'
        : '仅 Spotify 订单需要填写，其他订单可留空';
    }
  }

  function renderProductFields(items){
    const needed = items.filter((p)=>p.needsUsername || p.needsAccountPassword);
    if(needed.length === 0){
      productFieldsSection.hidden = true;
      productFieldsEl.innerHTML = '';
      return;
    }
    productFieldsSection.hidden = false;
    productFieldsEl.innerHTML = '';
    needed.forEach((p)=>{
      const wrap = el('div','productFieldGroup');
      let html = '<div class="productFieldGroupHead"><strong>' + p.label + '</strong></div>';
      if(p.needsUsername){
        html += '<label class="field"><span>设置用户名 <em class="req">*</em></span>' +
          '<input data-field="' + p.key + '|username" placeholder="4-10 位数字或字母，区分大小写" autocomplete="off" required></label>';
      }
      if(p.needsAccountPassword){
        html += '<div class="fieldGrid">' +
          '<label class="field"><span>账号 <em class="req">*</em></span>' +
          '<input data-field="' + p.key + '|account" placeholder="需要开通的账号" autocomplete="username" required></label>' +
          '<label class="field"><span>密码 <em class="req">*</em></span>' +
          '<div class="passwordWrap"><input type="password" data-field="' + p.key + '|password" placeholder="账号密码" autocomplete="current-password" required>' +
          '<button type="button" class="passwordEye" aria-label="显示密码"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.4-6 9-6 9 6 9 6-3.4 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></button></div></label>' +
        '</div>';
      }
      wrap.innerHTML = html;
      productFieldsEl.appendChild(wrap);
    });

    // Restore preserved values
    Object.keys(savedFields).forEach((k)=>{
      const node = productFieldsEl.querySelector('[data-field="' + k + '"]');
      if(node) node.value = savedFields[k];
    });

    // Password eye toggles
    productFieldsEl.querySelectorAll('.passwordEye').forEach((btn)=>{
      btn.addEventListener('click', ()=>{
        const input = btn.previousElementSibling;
        if(!input) return;
        const isPwd = input.type === 'password';
        input.type = isPwd ? 'text' : 'password';
        btn.setAttribute('aria-label', isPwd ? '隐藏密码' : '显示密码');
      });
    });
  }

  function renderSummary(items){
    const subtotal = Cart.subtotal(items);
    const final = Cart.finalCny(items);
    const coupon = couponDeduction(items);
    const wallet = walletDeduction(items);
    const payable = payableCny(items);
    const usdt = payableUsdt(items);
    const rate = Cart.bundleRate(items.length);
    const label = Cart.bundleLabel(items.length);
    const savings = subtotal - final;

    let html = '<div class="cartSummaryRow"><span>商品总价</span><b>' + money(subtotal) + '</b></div>';
    if(rate > 0){
      html += '<div class="cartSummaryRow discount"><span>组合优惠 · ' + label + '</span><b>−' + money(savings) + '</b></div>';
    }
    html += '<div class="cartSummaryRow total"><span>折后总额</span><b>' + money(final) + '</b></div>';
    if(isRedeemCheckout()){
      html += '<div class="cartSummaryRow wallet"><span>商品兑换码</span><b>−' + money(final) + '</b></div>';
      html += '<div class="cartSummaryRow total"><span>应付金额</span><b>¥0</b></div>';
    }else if(coupon > 0){
      html += '<div class="cartSummaryRow wallet"><span>优惠券抵扣</span><b>−' + money(coupon) + '</b></div>';
    }
    if(wallet > 0){
      html += '<div class="cartSummaryRow wallet"><span>账户立减</span><b>−' + money(wallet) + '</b></div>';
      html += '<div class="cartSummaryRow total"><span>应付金额</span><b>' + money(payable) + '</b></div>';
    }else if(coupon > 0 && !isRedeemCheckout()){
      html += '<div class="cartSummaryRow total"><span>应付金额</span><b>' + money(payable) + '</b></div>';
    }
    if(!isRedeemCheckout() && items.length === 1) html += '<div class="bundleHint"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>再加 1 件享 9.5 折，加满 3 件享 9 折</div>';
    else if(!isRedeemCheckout() && items.length === 2) html += '<div class="bundleHint"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>再加 1 件升级到 9 折</div>';

    summaryEl.innerHTML = html;
    payCnyEl.textContent = money(payable);
    payUsdtEl.textContent = usdt + ' USDT';
    if(paymentGroup) paymentGroup.hidden = isRedeemCheckout();
    if(submitBtn) submitBtn.innerHTML = isRedeemCheckout() ? '提交兑换订单 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' : '前往支付 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

    syncMobileCta();
  }

  function renderAccountPanel(items){
    if(!accountCard || !accountBody) return;
    const user = authState().user;
    if(user){
      if(emailInput && !emailInput.value) emailInput.value = user.email || '';
      if(accountLoginBtn) accountLoginBtn.textContent = '我的账户';
      if(isRedeemCheckout()){
        accountBody.innerHTML = '<div class="authBonusLine">商品兑换码已应用，本单无需支付。</div>';
        return;
      }
      const coupons = Array.isArray(user.coupons) ? user.coupons : [];
      const activeCoupon = coupons.find((item)=>item && (item.status || 'active') === 'active' && Number(item.amount || 0) > 0);
      const balance = Number(user.balance || 0);
      const canUse = balance > 0 && Cart.finalCny(items) > 0;
      const deduct = walletDeduction(items);
      accountBody.innerHTML =
        (activeCoupon ? '<label class="walletToggle"><span>使用账户优惠券 · 可抵扣 ' + money(activeCoupon.amount) + '</span><input type="checkbox" data-use-coupon ' + (useCoupon ? 'checked' : '') + '></label>' : '') +
        '<label class="walletToggle"><span>使用账户余额抵扣 · 当前 ' + money(balance) + (deduct > 0 ? '，本单立减 ' + money(deduct) : '') + '</span><input type="checkbox" data-use-wallet ' + (useWallet && canUse ? 'checked' : '') + ' ' + (!canUse ? 'disabled' : '') + '></label>';
      const couponBox = accountBody.querySelector('[data-use-coupon]');
      if(couponBox){
        couponBox.addEventListener('change', ()=>{
          useCoupon = couponBox.checked;
          renderAccountPanel(Cart.items());
          renderSummary(Cart.items());
        });
      }
      const checkbox = accountBody.querySelector('[data-use-wallet]');
      if(checkbox){
        checkbox.addEventListener('change', ()=>{
          useWallet = checkbox.checked;
          renderAccountPanel(Cart.items());
          renderSummary(Cart.items());
        });
      }
    }else{
      if(accountLoginBtn) accountLoginBtn.textContent = '登录/注册';
      accountBody.innerHTML = isRedeemCheckout()
        ? '<div class="authBonusLine">商品兑换码已应用，本单无需支付。</div>'
        : '<div class="authBonusLine">登录后可使用账户优惠券和余额抵扣。</div>';
    }
  }

  function syncMobileCta(){
    const items = Cart.items();
    const final = payableCny(items);
    const usdt = payableUsdt(items);
    const isUsdt = selectedMethod() === 'usdt';
    mobileMethodEl.textContent = isRedeemCheckout() ? '兑换码' : (isUsdt ? 'USDT-TRC20' : '支付宝');
    mobileAmountEl.textContent = isUsdt ? (usdt + ' USDT') : money(final);
  }

  // Payment radio change
  form.querySelectorAll('input[name=paymentMethod]').forEach((input)=>{
    input.addEventListener('change', syncMobileCta);
  });
  form.querySelectorAll('.paymentMethodOption').forEach((opt)=>{
    opt.addEventListener('click', (e)=>{
      const input = opt.querySelector('input[type=radio]');
      if(input && !input.checked){ input.checked = true; input.dispatchEvent(new Event('change')); }
    });
  });

  // Initial selection styling refresh
  function refreshSelectedClass(){
    form.querySelectorAll('.paymentMethodOption').forEach((opt)=>{
      const input = opt.querySelector('input[type=radio]');
      opt.classList.toggle('selected', !!(input && input.checked));
    });
  }
  form.querySelectorAll('input[name=paymentMethod]').forEach((input)=>{
    input.addEventListener('change', refreshSelectedClass);
  });
  refreshSelectedClass();

  // Validation
  function validateEmail(value){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }
  function validateUsername(value){
    return /^[A-Za-z0-9]{4,10}$/.test(String(value || '').trim());
  }

  form.addEventListener('submit', async (event)=>{
    event.preventDefault();
    setStatus('');
    const items = Cart.items();
    if(items.length === 0){ setStatus('购物车为空，请先选购商品', true); return; }
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const contact = String(data.get('contact') || '').trim();
    const remark = String(data.get('remark') || '').trim();
    if(!validateEmail(email)){ setStatus('请填写有效的邮箱地址，订单确认与日后查询将发送到该邮箱', true); return; }
    if(needsContact(items) && !contact){ setStatus('Spotify 订单需要填写联系方式，便于家庭组邀请或异常处理', true); return; }

    const fields = fieldsState();
    const orderItems = [];
    for(const p of items){
      const f = fields[p.key] || {};
      if(p.needsUsername && !validateUsername(f.username)){
        setStatus('请为「' + p.label + '」设置 4-10 位数字字母用户名', true); return;
      }
      if(p.needsAccountPassword && (!f.account || !f.password)){
        setStatus('请为「' + p.label + '」填写需要开通的账号和密码', true); return;
      }
      orderItems.push({
        service: p.key,
        account: p.needsUsername ? (f.username || '').trim() : (p.needsAccountPassword ? (f.account || '').trim() : ''),
        password: p.needsAccountPassword ? (f.password || '').trim() : ''
      });
    }

    const subtotal = Cart.subtotal(items);
    const finalCny = payableCny(items);
    const finalUsdt = payableUsdt(items);
    const wallet = walletDeduction(items);
    const method = isRedeemCheckout() ? 'redeem_code' : selectedMethod();
    const isUsdt = method === 'usdt';
    const authToken = window.MAOYANG_AUTH && window.MAOYANG_AUTH.getToken ? window.MAOYANG_AUTH.getToken() : '';

    const payload = {
      email, contact, remark,
      paymentMethod: method,
      items: orderItems,
      subtotal,
      baseFinalAmount: Cart.finalCny(items),
      finalAmount: finalCny,
      finalUsdt: finalUsdt,
      paidAmount: isUsdt ? finalUsdt : finalCny,
      paidCurrency: isUsdt ? 'USDT' : 'CNY',
      discountRate: Cart.bundleRate(items.length),
      discountLabel: Cart.bundleLabel(items.length),
      walletDeduction: wallet,
      couponDeduction: couponDeduction(items),
      useCoupon: couponDeduction(items) > 0,
      useBalance: wallet > 0,
      userToken: (wallet > 0 || couponDeduction(items) > 0) ? authToken : '',
      redeemCode: isRedeemCheckout() ? redeemCheckout.code : ''
    };

    sessionStorage.setItem('maoyangPendingOrder', JSON.stringify(payload));
    window.location.href = 'payment.html';
  });

  Cart.on(()=>{ preserveFields(); renderItems(); });
  window.addEventListener('maoyang:auth-update', ()=>{ renderAccountPanel(Cart.items()); renderSummary(Cart.items()); });
  renderItems();
})();
