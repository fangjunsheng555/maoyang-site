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
      (rate > 0 ? '<span class="cartBarTag">' + label + '</span>' : '') +
      '<svg class="cartBarChev' + (expanded ? ' open' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
      '</div>' +
      '<div class="cartBarBottom">' +
      (rate > 0 ? '<s>' + money(subtotal) + '</s>' : '') +
      '<b>' + money(finalCny) + '</b>' +
      '</div>';

    panel.hidden = !expanded;
    if(expanded){
      const list = panel.querySelector('[data-cart-panel-list]');
      list.innerHTML = '';
      items.forEach((p)=>{
        const row = el('div','cartPanelItem');
        row.innerHTML = '<img src="' + p.image + '" alt="' + p.label + '" loading="lazy">' +
          '<div class="cartPanelInfo"><strong>' + p.label + '</strong><span>' + money(p.amount) + ' / ' + p.cycle + '</span></div>' +
          '<button class="cartPanelRemove" type="button" aria-label="移除 ' + p.label + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg></button>';
        row.querySelector('.cartPanelRemove').addEventListener('click', ()=>{
          Cart.remove(p.key);
        });
        list.appendChild(row);
      });
      const hint = panel.querySelector('[data-cart-panel-hint]');
      if(count === 1) hint.textContent = '再加 1 件享 9.5 折，加到 3 件享 9 折';
      else if(count === 2) hint.textContent = '再加 1 件升级到 9 折';
      else hint.textContent = '已享 9 折优惠';
      const summary = panel.querySelector('[data-cart-panel-summary]');
      summary.innerHTML = '<div><span>商品总价</span><b>' + money(subtotal) + '</b></div>' +
        (rate > 0 ? '<div class="cartPanelDiscount"><span>组合优惠 · ' + label + '</span><b>−' + money(savings) + '</b></div>' : '') +
        '<div class="cartPanelTotal"><span>折后总额</span><b>' + money(finalCny) + '</b></div>';
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

    bar.querySelector('[data-cart-info]').addEventListener('click', toggle);
    panel.querySelector('.cartPanelClose').addEventListener('click', ()=>{ expanded = false; render(); });

    document.addEventListener('click', (e)=>{
      if(!expanded) return;
      if(panel.contains(e.target) || bar.contains(e.target)) return;
      expanded = false; render();
    });
  }
  function toggle(){ expanded = !expanded; bar.querySelector('[data-cart-info]').setAttribute('aria-expanded', String(expanded)); render(); }

  function showToast(label){
    if(toast) toast.remove();
    toast = el('div','cartToast', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg><span>已加入购物车 · ' + label + '</span>');
    document.body.appendChild(toast);
    setTimeout(()=>{ toast.classList.add('hide'); setTimeout(()=>toast && toast.remove(), 320); }, 1700);
  }

  window.MAOYANG_CART_TOAST = showToast;

  build();
  render();
  Cart.on(render);
})();
