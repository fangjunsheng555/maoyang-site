(function(){
  if(!window.MAOYANG_CART) return;
  const Cart = window.MAOYANG_CART;
  const PAGE = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const HIDE_ON = ['order.html','payment.html'];
  if(HIDE_ON.indexOf(PAGE) >= 0) return;

  function money(v){ const n = Number(v||0); return '¥' + (Number.isInteger(n) ? n : n.toFixed(0)); }
  function el(tag, cls, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }

  let bar = null, panel = null, expanded = false, toast = null;

  function render(){
    const items = Cart.items();
    const count = items.length;
    const locked = Cart.isRedeemLocked && Cart.isRedeemLocked();
    if(!bar) return;
    if(count === 0){
      bar.hidden = true;
      document.body.classList.remove('hasCartBar');
      expanded = false;
      panel.hidden = true;
      return;
    }
    bar.hidden = false;
    document.body.classList.add('hasCartBar');
    const subtotal = Cart.subtotal(items);
    const finalCny = Cart.finalCny(items);
    const savings = subtotal - finalCny;
    const rate = Cart.bundleRate(count);
    const label = Cart.bundleLabel(count);

    const info = bar.querySelector('[data-cart-info]');
    info.innerHTML = '<div class="cartBarTop">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l-1.5 11h-11Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>' +
      '<span>已选 <b>' + count + '</b> 件</span>' +
      (locked ? '<span class="cartBarLock"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>兑换码锁定</span>' : (rate > 0 ? '<span class="cartBarTag">' + label + '</span>' : '')) +
      '<svg class="cartBarChev' + (expanded ? ' open' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
      '</div>' +
      '<div class="cartBarBottom">' +
      (locked ? '<b>兑换码订单 ¥0</b>' : ((rate > 0 ? '<s>' + money(subtotal) + '</s>' : '') + '<b>' + money(finalCny) + '</b>')) +
      '</div>';

    panel.hidden = !expanded;
    if(expanded){
      const list = panel.querySelector('[data-cart-panel-list]');
      list.innerHTML = '';
      if(locked){
        const note = el('div','redeemLockNote');
        note.innerHTML = '<span><b>当前已锁定为兑换码订单</b><br>必须完成此次兑换后才能继续选购其他商品</span><button type="button" data-redeem-cancel>取消兑换</button>';
        note.querySelector('[data-redeem-cancel]').addEventListener('click', ()=>{
          if(Cart.clearRedeem) Cart.clearRedeem();
          Cart.clear();
        });
        list.appendChild(note);
      }
      items.forEach((p)=>{
        const row = el('div','cartPanelItem');
        const isLocked = locked && Cart.redeemService && p.key === Cart.redeemService();
        row.innerHTML = '<img src="' + p.image + '" alt="' + p.label + '" loading="lazy">' +
          '<div class="cartPanelInfo"><strong>' + p.label + '</strong><span>' + (isLocked ? '兑换码 · 免支付' : (money(p.amount) + ' / ' + p.cycle)) + '</span></div>' +
          (isLocked ? '<span class="checkoutRedeemTag">兑换码</span>' : '<button class="cartPanelRemove" type="button" aria-label="移除 ' + p.label + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg></button>');
        const removeBtn = row.querySelector('.cartPanelRemove');
        if(removeBtn) removeBtn.addEventListener('click', ()=>{ Cart.remove(p.key); });
        list.appendChild(row);
      });
      const hint = panel.querySelector('[data-cart-panel-hint]');
      if(locked) hint.textContent = '兑换码订单仅含已锁定商品，无法添加其他商品';
      else if(count === 1) hint.textContent = '再加 1 件享 9.5 折，加到 3 件享 9 折';
      else if(count === 2) hint.textContent = '再加 1 件升级到 9 折';
      else hint.textContent = '已享 9 折优惠';
      const summary = panel.querySelector('[data-cart-panel-summary]');
      if(locked){
        summary.innerHTML = '<div><span>商品总价</span><b>' + money(subtotal) + '</b></div>' +
          '<div class="cartPanelDiscount"><span>商品兑换码</span><b>−' + money(subtotal) + '</b></div>' +
          '<div class="cartPanelTotal"><span>应付金额</span><b>¥0</b></div>';
      }else{
        summary.innerHTML = '<div><span>商品总价</span><b>' + money(subtotal) + '</b></div>' +
          (rate > 0 ? '<div class="cartPanelDiscount"><span>组合优惠 · ' + label + '</span><b>−' + money(savings) + '</b></div>' : '') +
          '<div class="cartPanelTotal"><span>折后总额</span><b>' + money(finalCny) + '</b></div>';
      }
    }
  }

  function build(){
    bar = el('div','cartBar');
    bar.dataset.cartBar = '1';
    bar.setAttribute('role','region');
    bar.setAttribute('aria-label','购物车');
    bar.hidden = true;
    bar.innerHTML = '<button class="cartBarInfo" type="button" data-cart-info aria-expanded="false"></button>' +
      '<a class="cartBarGo" href="order.html">去结算<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></a>';
    document.body.appendChild(bar);

    panel = el('div','cartPanel');
    panel.dataset.cartPanel = '1';
    panel.hidden = true;
    panel.innerHTML = '<div class="cartPanelHead"><strong>已选商品</strong>' +
      '<button class="cartPanelClose" type="button" aria-label="收起"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>' +
      '<div class="cartPanelList" data-cart-panel-list></div>' +
      '<div class="cartPanelHint" data-cart-panel-hint></div>' +
      '<div class="cartPanelSummary" data-cart-panel-summary></div>';
    document.body.appendChild(panel);

    const infoBtn = bar.querySelector('[data-cart-info]');
    infoBtn.addEventListener('click', (event)=>{
      event.preventDefault();
      event.stopPropagation();
      toggle();
    });
    bar.addEventListener('click', (event)=>{
      if(event.target.closest('.cartBarGo')) return;
      if(event.target.closest('[data-cart-info]')) return;
      toggle();
    });
    panel.querySelector('.cartPanelClose').addEventListener('click', ()=>setExpanded(false));

    document.addEventListener('click', (e)=>{
      if(!expanded) return;
      if(panel.contains(e.target) || bar.contains(e.target)) return;
      setExpanded(false);
    });
  }
  function setExpanded(next){
    expanded = !!next;
    bar.querySelector('[data-cart-info]').setAttribute('aria-expanded', String(expanded));
    render();
  }
  function toggle(){ setExpanded(!expanded); }

  function showToast(label){
    if(toast) toast.remove();
    toast = el('div','cartToast', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg><span>已加入购物车 · ' + label + '</span>');
    document.body.appendChild(toast);
    setTimeout(()=>{ toast.classList.add('hide'); setTimeout(()=>toast && toast.remove(), 320); }, 1700);
  }
  function showLockedToast(){
    if(toast) toast.remove();
    toast = el('div','cartToast cartToastWarn', '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><span>已应用兑换码，当前购物车已锁定</span>');
    document.body.appendChild(toast);
    setTimeout(()=>{ toast.classList.add('hide'); setTimeout(()=>toast && toast.remove(), 320); }, 2000);
  }

  window.MAOYANG_CART_TOAST = showToast;
  window.MAOYANG_CART_TOAST_LOCKED = showLockedToast;

  build();
  render();
  Cart.on(render);
})();
