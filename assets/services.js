(function(){
  if(!window.MAOYANG_CART) return;
  const Cart = window.MAOYANG_CART;
  const grid = document.querySelector('[data-product-grid]');
  const ticker = document.querySelector('[data-live-ticker]');
  if(!grid) return;

  function money(v){ return '¥' + Number(v||0).toFixed(0); }
  function el(tag, cls, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }

  function brandIcon(key){
    const icons = {
      spotify:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7 9c4-1 8 0 11 2" stroke="#fff" stroke-width="1.6" fill="none"/><path d="M7.5 12.5c3-.7 6 0 8.5 1.5" stroke="#fff" stroke-width="1.4" fill="none"/><path d="M8 15.5c2.5-.5 5 0 7 1.2" stroke="#fff" stroke-width="1.2" fill="none"/></svg>',
      netflix:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h3l4 12V4h3v16h-3L10 8v12H7Z" fill="#fff"/></svg>',
      disney:'<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="16" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="Arial">D+</text></svg>',
      hbomax:'<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="16" text-anchor="middle" font-size="7" font-weight="900" fill="#fff" font-family="Arial">MAX</text></svg>',
      chatgpt:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>',
      network:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="#fff" stroke-width="1.4"/></svg>'
    };
    return icons[key] || '';
  }

  function buildCard(p){
    const inCart = Cart.has(p.key);
    const saved = (p.original || 0) - p.amount;
    const card = el('article','productCard');
    card.dataset.product = p.key;
    card.style.setProperty('--accent', p.accent);
    card.innerHTML =
      '<div class="productMedia">' +
        '<div class="productMediaIcon">' + brandIcon(p.key) + '</div>' +
        (p.badge ? '<div class="productBadge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 9 8l-6 1 4.5 4.4L6 20l6-3 6 3-1.5-6.6L21 9l-6-1Z"/></svg>' + p.badge + '</div>' : '') +
      '</div>' +
      '<div class="productBody">' +
        '<div class="productHeading"><h3>' + p.label + '</h3><p>' + p.subtitle + '</p></div>' +
        '<div class="priceBox">' +
          '<div class="priceMain"><b>' + money(p.amount) + '</b><span>/ ' + p.cycle + '</span>' +
            (p.original ? '<s>' + money(p.original) + '</s>' : '') +
          '</div>' +
          '<div class="priceMeta">' +
            (saved > 0 ? '<em class="priceSave">立省 ' + money(saved) + '</em>' : '') +
            '<em class="priceMonthly">' + (p.monthly || '') + '</em>' +
          '</div>' +
        '</div>' +
        '<ul class="productHl">' + (p.highlights||[]).map((h)=>'<li>'+h+'</li>').join('') + '</ul>' +
        (p.soldThisMonth ? '<div class="productSold"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2c0 4 4 5 4 9a5 5 0 1 1-10 0c0-2 1-3 2-4 0 3 2 3 2 5"/></svg>本月已售 <b>' + p.soldThisMonth.toLocaleString() + '</b> 份</div>' : '') +
        '<button class="addToCartBtn' + (inCart ? ' inCart' : '') + '" type="button" data-cart-toggle="' + p.key + '">' +
          (inCart ?
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>已加入 · 点击移除' :
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l-1.5 11h-11Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>加入购物车') +
        '</button>' +
      '</div>';
    card.querySelector('[data-cart-toggle]').addEventListener('click', ()=>{
      const wasIn = Cart.has(p.key);
      Cart.toggle(p.key);
      if(!wasIn && window.MAOYANG_CART_TOAST) window.MAOYANG_CART_TOAST(p.label);
    });
    return card;
  }

  function render(){
    grid.innerHTML = '';
    Cart.PRODUCT_KEYS.forEach((key)=>{
      const p = Cart.PRODUCTS[key];
      if(p) grid.appendChild(buildCard(p));
    });
  }

  render();
  Cart.on(render);

  // Live activity ticker (front-running social proof)
  if(ticker){
    const tickerData = [
      ['上海 *138', 'Netflix Premium', '刚刚'],
      ['台北 J***', 'Spotify · 网络节点', '1 分钟前'],
      ['深圳 W**', 'ChatGPT Plus', '2 分钟前'],
      ['首尔 P***', 'Disney+ · HBO Max', '4 分钟前'],
      ['北京 *088', 'HBO Max', '6 分钟前'],
      ['广州 L*', '网络节点 · Spotify', '9 分钟前'],
      ['香港 ChE**', 'Spotify · Netflix · 节点', '14 分钟前'],
      ['杭州 Y**', 'Spotify Premium', '20 分钟前'],
      ['新北 H**', 'ChatGPT · 节点', '24 分钟前']
    ];
    let idx = 0;
    function nextTick(){
      const it = tickerData[idx % tickerData.length]; idx++;
      ticker.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6" fill="none" stroke-width="1.4" opacity=".6"/><circle cx="12" cy="12" r="9" fill="none" stroke-width="1" opacity=".3"/></svg>' +
        '<span><b>' + it[0] + '</b> 下单了 ' + it[1] + ' · <em>' + it[2] + '</em></span>';
    }
    nextTick();
    setInterval(nextTick, 3800);
  }

  // Reviews list (random 3)
  const reviews = [
    { name:'Winton',     text:'你们的会员确实稳，比别家便宜还更好。' },
    { name:'团团不委屈', text:'很不错，客服很有耐心解决问题。' },
    { name:'Vin',        text:'速度太牛了，爽。' },
    { name:'Ana',        text:'用了两年多了，有时候会掉出会员，但是客服都给解决了。' },
    { name:'水水水',     text:'奈飞搭配客服给的专线太爽了，真秒开 4K。' },
    { name:'YUQI',       text:'确实快，认准这家没错。' },
    { name:'Martin',     text:'Perfect price with perfect service.' },
    { name:'刘生',       text:'非常誠信的賣家，說到做到。' },
    { name:'Yeffy Chan', text:'真是正，第一次見咁好嘅商家，祝興隆。' }
  ];
  const list = document.getElementById('rvList');
  if(list){
    const arr = reviews.slice();
    for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    arr.slice(0,3).forEach((r)=>{
      const item = el('div','reviewItem',
        '<div class="reviewTop"><div class="reviewName">' + r.name + '</div>' +
        '<div class="reviewStars" aria-label="5 星">★★★★★</div></div>' +
        '<p class="reviewText">' + r.text + '</p>'
      );
      list.appendChild(item);
    });
  }
})();
