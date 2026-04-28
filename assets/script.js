(function(){
  var contacts = [
    { label: 'QQ', value: '2802632995' },
    { label: 'WhatsApp', value: '+1 4315093334' },
    { label: 'Telegram', value: '+44 7707489977' }
  ];

  var media = {
    spotify: 'assets/img/product-spotify.jpg',
    netflix: 'assets/img/product-netflix.jpg',
    chatgpt: 'assets/img/product-chatgpt.jpg',
    disney: 'assets/img/product-disney.jpg',
    hbomax: 'assets/img/product-hbomax.jpg',
    network: 'assets/img/product-network.jpg',
    hero: 'assets/img/hero-membership.jpg',
    support: 'assets/img/service-premium.jpg',
    company: 'assets/img/company-premium.jpg'
  };

  var productMeta = {
    spotify: { selector: '.productSpotify', image: media.spotify, alt: 'Spotify Premium' },
    netflix: { selector: '.productNetflix', image: media.netflix, alt: 'Netflix Premium' },
    chatgpt: { selector: '.productChatgpt', image: media.chatgpt, alt: 'ChatGPT Plus' },
    disney: { selector: '.productDisney', image: media.disney, alt: 'Disney+' },
    hbomax: { selector: '.productHbomax', image: media.hbomax, alt: 'HBO Max' },
    network: { selector: '.productNetwork', image: media.network, alt: '\u7f51\u7edc\u8282\u70b9\u670d\u52a1' }
  };

  var extraProducts = [
    {
      service: 'cinema',
      cardClass: 'productDisney',
      tag: 'Disney+',
      title: 'Disney+',
      image: media.disney,
      alt: 'Disney+ 4K Dolby',
      cycle: '\u5e74\u4ed8',
      price: '\u5e74\u4ed8108',
      intro: '\u72ec\u7acb\u8f66\u4f4d\u5168\u7403\u53ef\u75284K\u675c\u6bd4\u5957\u9910',
      features: ['4K\u675c\u6bd4', '\u4f4d\u7f6e\u4e0a\u9501', '\u4e0d\u88ab\u6324\u4e0d\u6392\u961f'],
      detail: '4K\u753b\u8d28\uff0c\u675c\u6bd4\u97f3\u6548\uff0c\u79bb\u7ebf\u4e0b\u8f7d\uff0c\u5168\u7403\u53ef\u7528\u4e0d\u9650\u5236\u5730\u533a\uff0c\u9876\u89c44K\u675c\u6bd4\u5957\u9910\uff0c4\u4eba\u4e00\u8f66\u7edd\u4e0d\u8d85\u552e\uff0c\u9ad8\u5cf0\u4e0d\u6392\u961f\u4e0d\u88ab\u6324\uff0c\u4f4d\u7f6e\u53ef\u4e0a\u9501\uff0c\u7528\u6237\u4e92\u4e0d\u5e72\u6270\uff0c\u5982\u9700\u8d2d\u4e70\u6574\u53f7\u8bf7\u8054\u7cfb\u5728\u7ebf\u5ba2\u670d',
      tileText: '\u72ec\u7acb\u8f66\u4f4d\u5168\u7403\u53ef\u75284K\u675c\u6bd4\u5957\u9910\uff0c\u4f4d\u7f6e\u53ef\u4e0a\u9501\uff0c\u9ad8\u5cf0\u4e0d\u6392\u961f\u4e0d\u88ab\u6324\u3002'
    },
    {
      service: 'hbomax',
      cardClass: 'productHbomax',
      tag: 'HBO Max',
      title: 'HBO Max',
      image: media.hbomax,
      alt: 'HBO Max 4K Dolby',
      cycle: '\u5e74\u4ed8',
      price: '\u5e74\u4ed8148',
      intro: '\u72ec\u7acb\u8f66\u4f4d\u5168\u7403\u53ef\u75284K\u675c\u6bd4\u5957\u9910',
      features: ['4K\u675c\u6bd4', '\u5168\u7403\u53ef\u7528', '\u5b9e\u65f6\u552e\u540e\u4fdd\u969c'],
      detail: '4K\u753b\u8d28\uff0c\u675c\u6bd4\u97f3\u6548\uff0c\u79bb\u7ebf\u4e0b\u8f7d\uff0c\u5168\u7403\u53ef\u7528\u4e0d\u9650\u5236\u5730\u533a\uff0c\u9876\u89c44K\u675c\u6bd4\u5957\u9910\uff0c4\u4eba\u4e00\u8f66\u7edd\u4e0d\u8d85\u552e\uff0c\u9ad8\u5cf0\u4e0d\u6392\u961f\u4e0d\u88ab\u6324\uff0c\u4f4d\u7f6e\u53ef\u4e0a\u9501\uff0c\u7528\u6237\u4e92\u4e0d\u5e72\u6270\uff0c\u5982\u9700\u8d2d\u4e70\u6574\u53f7\u8bf7\u8054\u7cfb\u5728\u7ebf\u5ba2\u670d',
      tileText: '\u72ec\u7acb\u8f66\u4f4d\u5168\u7403\u53ef\u75284K\u675c\u6bd4\u5957\u9910\uff0c\u5b9e\u65f6\u552e\u540e\u4fdd\u969c\uff0c\u9ad8\u5cf0\u4e0d\u6392\u961f\u4e0d\u88ab\u6324\u3002'
    },
    {
      service: 'network',
      cardClass: 'productNetwork',
      tag: 'Network',
      title: '\u7f51\u7edc\u8282\u70b9\u670d\u52a1',
      image: media.network,
      alt: '\u7f51\u7edc\u8282\u70b9\u670d\u52a1',
      cycle: '\u5e74\u4ed8',
      price: '\u5e74\u4ed899',
      intro: '\u4e0d\u9650\u8bbe\u5907\u00b7\u4e0d\u9650\u6d41\u91cf\u00b7\u6700\u9ad85Gbps\u00b7\u89e3\u9501\u5168\u7403\u5e73\u53f0',
      features: ['\u4e0d\u9650\u8bbe\u5907/\u6d41\u91cf', '\u9ad8\u901f\u7a33\u5b9a\u591a\u8282\u70b9', '\u5168\u52a0\u5bc6\u65e0\u65e5\u5fd7'],
      detail: '\u5927\u5382\u673a\u623f\u591a\u7ebf\u8def\uff0c\u6700\u9ad85Gbps\u5e26\u5bbd\uff0c\u89e3\u9501\u6240\u6709\u6d41\u5a92\u4f53/AI/\u793e\u4ea4\u8f6f\u4ef6\uff0c\u9ad8\u5cf0\u4e0d\u5361\u987f',
      tileText: '\u4e0d\u9650\u8bbe\u5907\u00b7\u4e0d\u9650\u6d41\u91cf\u00b7\u6700\u9ad85Gbps\u00b7\u89e3\u9501\u5168\u7403\u5e73\u53f0\uff0c\u5927\u5382\u673a\u623f\u591a\u7ebf\u8def\uff0c\u9ad8\u5cf0\u4e0d\u5361\u987f\u3002'
    }
  ];

  if(!document.querySelector('[data-hidden-rule]')){
    var hidden = document.createElement('style');
    hidden.dataset.hiddenRule = 'true';
    hidden.textContent = '[hidden]{display:none!important}';
    document.head.appendChild(hidden);
  }

  function installStyles(){
    if(document.querySelector('[data-maoyang-visual-style]')) return;
    var style = document.createElement('style');
    style.dataset.maoyangVisualStyle = 'true';
    style.textContent =
      '.hero,.orderHero{background-image:linear-gradient(90deg,rgba(2,8,16,.72),rgba(2,8,16,.44) 48%,rgba(2,8,16,.08)),url("' + media.hero + '")!important;background-size:cover!important;background-position:center!important;position:relative;overflow:hidden!important}' +
      '.hero:after,.orderHero:after{content:"";position:absolute;inset:auto 0 0 0;height:30%;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.96));pointer-events:none}' +
      '.hero .inner{position:relative;z-index:1}.hero .eyebrow{color:#bff7ef!important}.hero .subtitle{max-width:740px!important}' +
      '.brand img{height:auto!important;max-height:58px!important;width:auto!important}' +
      '.tile,.productCard,.section .grid2>.card{border-radius:8px!important;border:1px solid rgba(210,226,222,.95)!important;box-shadow:0 20px 52px rgba(15,23,42,.09)!important;background:#fff!important;overflow:hidden!important}' +
      '.tile>img,.productCard>img,.grid2>.card>img{display:block!important;width:100%!important;aspect-ratio:16/10!important;height:auto!important;object-fit:cover!important;background:#071024!important;border-bottom:1px solid rgba(226,232,240,.92)!important}' +
      '.tileBody{min-height:190px!important}.tileBody h3{letter-spacing:0!important}' +
      '.productCard{display:flex!important;flex-direction:column!important}.productCard:before{display:none!important;content:none!important}' +
      '.productCard .pad{padding:24px 24px 28px!important;min-height:auto!important;display:block!important}.productCard .productTop{margin:0 0 13px!important;justify-content:flex-start!important}' +
      '.productCard .brandPill{background:#fff!important;border:1px solid #e2e8f0!important;color:#475467!important}.productCard .miniPill{background:#f8fafc!important;border:1px solid #e2e8f0!important;color:#475467!important}' +
      '.productCard h2{margin:0 0 8px!important;color:#050b22!important;font-size:29px!important;line-height:1.12!important;letter-spacing:0!important}' +
      '.productCard .price{justify-content:flex-start!important;min-height:46px!important;margin:16px 0 14px!important;padding:10px 16px!important;border-radius:8px!important;border:1px dashed #35d9d1!important;background:#effffb!important;color:#083f3a!important;font-size:15.5px!important;text-align:left!important}' +
      '.productCard .pad>p:not(.price){margin:12px 0 0!important;color:#475467!important;font-size:14.5px!important;line-height:1.75!important}.productCard .pad>ul{gap:9px!important;margin:18px 0 0!important}.productCard li{font-size:14.5px!important;color:#344054!important}.productCard li:before{background:#0f766e!important;box-shadow:0 0 0 4px rgba(15,118,110,.12)!important}' +
      '.productCard .cta{display:inline-flex!important;align-items:center!important;justify-content:center!important;margin:0 0 16px!important;min-height:44px!important;padding:0 22px!important;background:#071024!important;color:#fff!important;border-color:#071024!important;box-shadow:0 16px 34px rgba(2,6,23,.16)!important;visibility:visible!important;opacity:1!important}' +
      '.productDisney .price{background:#eef6ff!important;border-color:#7dd3fc!important;color:#0c4a6e!important}.productHbomax .price{background:#f5f0ff!important;border-color:#c4b5fd!important;color:#4c1d95!important}.productNetwork .price{background:#ecfdf3!important;border-color:#6ee7b7!important;color:#065f46!important}' +
      '.copyContactGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.copyContactBtn{display:grid;gap:3px;min-height:64px;text-align:left;border:1px solid var(--line);border-radius:8px;background:#f8fbfa;color:#172033;padding:10px 12px;cursor:pointer;font:inherit;box-shadow:none}.copyContactBtn b{font-size:12px;color:#0f766e;line-height:1.2}.copyContactBtn span{font-size:14px;font-weight:900;line-height:1.3;overflow-wrap:anywhere}.copyContactBtn:hover,.copyContactBtn.copied{border-color:rgba(15,118,110,.42);background:#ecfdf5}' +
      '@media (max-width:720px){.copyContactGrid{grid-template-columns:1fr}.copyContactBtn{min-height:58px}}@media (max-width:560px){.productCard h2{font-size:25px!important}.productCard .pad{padding:22px!important}.tileBody{min-height:auto!important}}';
    document.head.appendChild(style);
  }

  function setImage(img, src, alt){
    if(!img) return;
    img.src = src;
    img.alt = alt || img.alt || '';
    img.loading = img.loading || 'lazy';
    img.referrerPolicy = '';
  }

  function installProductImages(){
    Object.keys(productMeta).forEach(function(key){
      var item = productMeta[key];
      document.querySelectorAll(item.selector).forEach(function(card){
        setImage(card.querySelector('img'), item.image, item.alt);
      });
    });
    document.querySelectorAll('.tile').forEach(function(tile){
      var title = ((tile.querySelector('h3') || {}).textContent || '').trim();
      if(/Spotify/i.test(title)) setImage(tile.querySelector('img'), media.spotify, 'Spotify Premium');
      if(/Netflix/i.test(title)) setImage(tile.querySelector('img'), media.netflix, 'Netflix Premium');
      if(/ChatGPT/i.test(title)) setImage(tile.querySelector('img'), media.chatgpt, 'ChatGPT Plus');
      if(/Disney/i.test(title)) setImage(tile.querySelector('img'), media.disney, 'Disney+');
      if(/HBO/i.test(title)) setImage(tile.querySelector('img'), media.hbomax, 'HBO Max');
      if(/\u8282\u70b9|Network/i.test(title)) setImage(tile.querySelector('img'), media.network, '\u7f51\u7edc\u8282\u70b9\u670d\u52a1');
    });
    document.querySelectorAll('img[src$="service-visual.svg"]').forEach(function(img){ setImage(img, media.support, '\u552e\u540e\u670d\u52a1\u5c55\u793a\u56fe'); });
    document.querySelectorAll('img[src$="company-visual.svg"]').forEach(function(img){ setImage(img, media.company, '\u516c\u53f8\u5c55\u793a\u56fe'); });
  }

  function copyText(text){
    if(navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    var temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.left = '-999px';
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
    return Promise.resolve();
  }

  function createContactGrid(){
    var grid = document.createElement('div');
    grid.className = 'copyContactGrid';
    contacts.forEach(function(item){
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copyContactBtn';
      button.innerHTML = '<b>' + item.label + '</b><span>' + item.value + '</span>';
      button.addEventListener('click', function(){
        copyText(item.value).then(function(){
          var label = button.querySelector('b');
          var old = item.label;
          button.classList.add('copied');
          label.textContent = '\u5df2\u590d\u5236';
          setTimeout(function(){ button.classList.remove('copied'); label.textContent = old; }, 1500);
        });
      });
      grid.appendChild(button);
    });
    return grid;
  }

  function installCopyContacts(){
    document.querySelectorAll('.contactRows').forEach(function(rows){
      if(rows.querySelector('.copyContactGrid')) return;
      var first = rows.querySelector('p');
      var grid = createContactGrid();
      if(first) first.replaceWith(grid);
      else rows.prepend(grid);
    });
    document.querySelectorAll('.supportList').forEach(function(list){
      if(list.querySelector('.copyContactGrid')) return;
      Array.prototype.slice.call(list.querySelectorAll('span')).forEach(function(span){
        if(/QQ|WhatsApp|tg|Telegram/i.test(span.textContent || '')) span.remove();
      });
      list.appendChild(createContactGrid());
    });
  }

  function removeServicesContactPanel(){
    var products = document.querySelector('#products');
    var contactPanel = document.querySelector('.contactPanel');
    if(!products || !contactPanel) return;
    var section = contactPanel.closest('.section');
    if(section) section.remove();
    else contactPanel.remove();
  }

  function createTile(product){
    var tile = document.createElement('a');
    tile.className = 'tile';
    tile.href = 'services.html#products';
    tile.dataset.extraTile = product.service;
    tile.innerHTML = "<img src='" + product.image + "' alt='" + product.alt + "' loading='lazy'><div class='tileBody'><span class='serviceTag'>" + product.tag + "</span><h3>" + product.title + "</h3><p>" + product.tileText + "</p></div>";
    return tile;
  }

  function installHomeTiles(){
    var firstTile = document.querySelector('.tile');
    var grid = firstTile ? firstTile.parentElement : null;
    if(!grid) return;
    extraProducts.forEach(function(product){
      if(grid.querySelector('[data-extra-tile="' + product.service + '"]')) return;
      grid.appendChild(createTile(product));
    });
  }

  function createProductCard(product){
    var card = document.createElement('article');
    card.className = 'card productCard ' + product.cardClass;
    card.innerHTML = "<img src='" + product.image + "' alt='" + product.alt + "' loading='lazy'><div class='pad'><div class='productTop'><span class='brandPill'>" + product.tag + "</span><span class='miniPill'>" + product.cycle + "</span></div><h2>" + product.title + "</h2><p class='price'>" + product.price + "</p><p>" + product.intro + "</p><ul>" + product.features.map(function(item){ return '<li>' + item + '</li>'; }).join('') + "</ul><p>" + product.detail + "</p></div>";
    return card;
  }

  function installExtraProductCards(){
    var grid = document.querySelector('#products .grid3');
    if(!grid) return;
    extraProducts.forEach(function(product){
      if(grid.querySelector('.' + product.cardClass)) return;
      grid.appendChild(createProductCard(product));
    });
  }

  function installProductLinks(){
    [
      ['.productSpotify', 'spotify'],
      ['.productNetflix', 'netflix'],
      ['.productChatgpt', 'chatgpt'],
      ['.productDisney', 'disney'],
      ['.productHbomax', 'hbomax'],
      ['.productNetwork', 'network']
    ].forEach(function(pair){
      var card = document.querySelector(pair[0]);
      if(!card || card.querySelector('[data-order-link]')) return;
      var pad = card.querySelector('.pad');
      if(!pad) return;
      var link = document.createElement('a');
      link.href = 'order.html?service=' + pair[1];
      link.textContent = '\u7acb\u5373\u4e0b\u5355';
      link.className = 'cta';
      link.dataset.orderLink = pair[1];
      var price = pad.querySelector('.price');
      if(price) price.insertAdjacentElement('afterend', link);
      else pad.appendChild(link);
    });
  }

  installStyles();
  installCopyContacts();
  removeServicesContactPanel();
  installProductImages();
  installHomeTiles();
  installExtraProductCards();
  installProductImages();
  installProductLinks();

  var burger = document.querySelector('[data-burger]');
  var drawer = document.querySelector('[data-drawer]');
  var closeBtn = document.querySelector('[data-drawer-close]');
  function openDrawer(){ if(drawer) drawer.style.display = 'flex'; }
  function closeDrawer(){ if(drawer) drawer.style.display = 'none'; }
  if(burger) burger.addEventListener('click', openDrawer);
  if(closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if(drawer) drawer.addEventListener('click', function(event){ if(event.target === drawer) closeDrawer(); });

  var toTop = document.querySelector('[data-top]');
  function onScroll(){
    if(!toTop) return;
    toTop.style.display = window.scrollY > 350 ? 'flex' : 'none';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if(toTop) toTop.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
