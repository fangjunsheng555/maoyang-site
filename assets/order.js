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
  const statusEl = document.querySelector('[data-status]');

  if(!form) return;

  function money(v){ return '¥' + Number(v||0).toFixed(0); }
  function el(tag, cls, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }
  function selectedMethod(){ const r = form.querySelector('input[name=paymentMethod]:checked'); return r ? r.value : 'alipay'; }
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
        '<button type="button" class="checkoutItemRemove" aria-label="移除 ' + p.label + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg></button>';
      row.querySelector('.checkoutItemRemove').addEventListener('click', ()=>{
        preserveFields();
        Cart.remove(p.key);
      });
      itemsEl.appendChild(row);
    });

    renderProductFields(items);
    renderSummary(items);
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
    const usdt = Cart.finalUsdt(items);
    const rate = Cart.bundleRate(items.length);
    const label = Cart.bundleLabel(items.length);
    const savings = subtotal - final;

    let html = '<div class="cartSummaryRow"><span>商品总价</span><b>' + money(subtotal) + '</b></div>';
    if(rate > 0){
      html += '<div class="cartSummaryRow discount"><span>组合优惠 · ' + label + '</span><b>−' + money(savings) + '</b></div>';
    }
    html += '<div class="cartSummaryRow total"><span>折后总额</span><b>' + money(final) + '</b></div>';
    if(items.length === 1) html += '<div class="bundleHint"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>再加 1 件享 9.5 折，加满 3 件享 9 折</div>';
    else if(items.length === 2) html += '<div class="bundleHint"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>再加 1 件升级到 9 折</div>';

    summaryEl.innerHTML = html;
    payCnyEl.textContent = money(final);
    payUsdtEl.textContent = usdt + ' USDT';

    syncMobileCta();
  }

  function syncMobileCta(){
    const items = Cart.items();
    const final = Cart.finalCny(items);
    const usdt = Cart.finalUsdt(items);
    const isUsdt = selectedMethod() === 'usdt';
    mobileMethodEl.textContent = isUsdt ? 'USDT-TRC20' : '支付宝';
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
    if(items.length === 0){ setStatus('购物车为空，请先选购商品。', true); return; }
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const contact = String(data.get('contact') || '').trim();
    const remark = String(data.get('remark') || '').trim();
    if(!validateEmail(email)){ setStatus('请填写有效的邮箱地址，订单确认与日后查询将发送到该邮箱。', true); return; }
    if(!contact){ setStatus('请填写联系方式，必要时工作人员将通过此联系方式联系你。', true); return; }

    const fields = fieldsState();
    const orderItems = [];
    for(const p of items){
      const f = fields[p.key] || {};
      if(p.needsUsername && !validateUsername(f.username)){
        setStatus('请为「' + p.label + '」设置 4-10 位数字字母用户名。', true); return;
      }
      if(p.needsAccountPassword && (!f.account || !f.password)){
        setStatus('请为「' + p.label + '」填写需要开通的账号和密码。', true); return;
      }
      orderItems.push({
        service: p.key,
        account: p.needsUsername ? (f.username || '').trim() : (f.account || '').trim(),
        password: p.needsAccountPassword ? (f.password || '').trim() : ''
      });
    }

    const subtotal = Cart.subtotal(items);
    const finalCny = Cart.finalCny(items);
    const finalUsdt = Cart.finalUsdt(items);
    const method = selectedMethod();
    const isUsdt = method === 'usdt';

    const payload = {
      email, contact, remark,
      paymentMethod: method,
      items: orderItems,
      subtotal,
      finalAmount: finalCny,
      finalUsdt: finalUsdt,
      paidAmount: isUsdt ? finalUsdt : finalCny,
      paidCurrency: isUsdt ? 'USDT' : 'CNY',
      discountRate: Cart.bundleRate(items.length),
      discountLabel: Cart.bundleLabel(items.length)
    };

    sessionStorage.setItem('maoyangPendingOrder', JSON.stringify(payload));
    window.location.href = 'payment.html';
  });

  Cart.on(()=>{ preserveFields(); renderItems(); });
  renderItems();
})();
