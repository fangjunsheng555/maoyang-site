(function(){
  if(!document.querySelector('[data-hidden-rule]')){
    const style = document.createElement('style');
    style.dataset.hiddenRule = 'true';
    style.textContent = '[hidden]{display:none!important}';
    document.head.appendChild(style);
  }

  const contacts = [
    { label: 'QQ', value: '2802632995' },
    { label: 'WhatsApp', value: '+1 4315093334' },
    { label: 'Telegram', value: '+44 7707489977' }
  ];

  const extraProducts = [
    {
      service: 'disney',
      cardClass: 'productDisney',
      tag: 'Disney+',
      title: 'Disney+',
      image: 'assets/img/cinema-visual.svg',
      alt: 'Disney+ 4K Dolby',
      cycle: '年付',
      price: '年付108',
      intro: '独立车位全球可用4K杜比套餐',
      features: ['4K杜比', '位置上锁', '不被挤不排队'],
      detail: '4K画质，杜比音效，离线下载，全球可用不限制地区，顶规4K杜比套餐，4人一车绝不超售，高峰不排队不被挤，位置可上锁，用户互不干扰，如需购买整号请联系在线客服',
      tileText: '独立车位全球可用4K杜比套餐，位置可上锁，高峰不排队不被挤。'
    },
    {
      service: 'hbomax',
      cardClass: 'productHbomax',
      tag: 'HBO Max',
      title: 'HBO Max',
      image: 'assets/img/cinema-visual.svg',
      alt: 'HBO Max 4K Dolby',
      cycle: '年付',
      price: '年付148',
      intro: '独立车位全球可用4K杜比套餐',
      features: ['4K杜比', '全球可用', '实时售后保障'],
      detail: '4K画质，杜比音效，离线下载，全球可用不限制地区，顶规4K杜比套餐，4人一车绝不超售，高峰不排队不被挤，位置可上锁，用户互不干扰，如需购买整号请联系在线客服',
      tileText: '独立车位全球可用4K杜比套餐，实时售后保障，高峰不排队不被挤。'
    },
    {
      service: 'network',
      cardClass: 'productNetwork',
      tag: 'Network',
      title: '网络节点服务',
      image: 'assets/img/service-visual.svg',
      alt: '网络节点服务',
      cycle: '年付',
      price: '年付99',
      intro: '不限设备·不限流量·最高5Gbps·解锁全球平台',
      features: ['不限设备/流量', '高速稳定多节点', '全加密无日志'],
      detail: '大厂机房多线路，最高5Gbps带宽，解锁所有流媒体/AI/社交软件，高峰不卡顿',
      tileText: '不限设备·不限流量·最高5Gbps·解锁全球平台，大厂机房多线路，高峰不卡顿。'
    }
  ];

  async function copyText(text){
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
      return true;
    }
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.left = '-999px';
    document.body.appendChild(temp);
    temp.select();
    const ok = document.execCommand('copy');
    temp.remove();
    return ok;
  }

  function installProductStyles(){
    if(document.querySelector('[data-extra-products-style]')) return;
    const style = document.createElement('style');
    style.dataset.extraProductsStyle = 'true';
    style.textContent = '.productCard{position:relative;border-radius:8px!important;border:1px solid #e2e8f0!important;border-top-width:1px!important;background:linear-gradient(180deg,#fff 0%,#fbfdfc 100%)!important;box-shadow:0 18px 46px rgba(15,23,42,.08)!important;overflow:hidden!important}.productCard>img{display:none!important}.productCard:before{content:""!important;position:absolute!important;left:auto!important;right:26px!important;top:26px!important;width:76px!important;height:76px!important;border-radius:20px!important;border:1px solid rgba(226,232,240,.9)!important;background-color:#fff!important;background-position:center!important;background-repeat:no-repeat!important;background-size:100% 100%!important;box-shadow:0 18px 34px rgba(15,23,42,.16)!important;z-index:2!important}.productSpotify:before{background-image:url("assets/img/app-spotify.svg")!important}.productNetflix:before{background-image:url("assets/img/app-netflix.svg")!important}.productDisney:before{background-image:url("assets/img/app-disney.svg")!important}.productHbomax:before{background-image:url("assets/img/app-hbomax.svg")!important}.productChatgpt:before{background-image:url("assets/img/app-chatgpt.svg")!important;width:76px!important}.productNetwork:before{background-image:url("assets/img/app-network.svg")!important}.productCard .pad{padding:26px 26px 30px!important;min-height:100%;display:flex;flex-direction:column}.productCard .productTop{margin:0 96px 14px 0!important;justify-content:flex-start!important}.productCard .brandPill{background:#fff!important;border:1px solid #e2e8f0!important;color:#475467!important}.productCard .miniPill{background:#f8fafc!important;border:1px solid #e2e8f0!important;color:#475467!important}.productCard h2{margin:0 96px 8px 0!important;color:#050b22!important;font-size:30px!important;line-height:1.12!important}.productCard .price{justify-content:flex-start!important;min-height:46px!important;margin:18px 0 16px!important;padding:10px 16px!important;border-radius:8px!important;border:1px dashed #35d9d1!important;background:#effffb!important;color:#083f3a!important;font-size:15.5px!important;text-align:left!important}.productCard .pad>p:not(.price){margin:12px 0 0!important;color:#475467!important;font-size:14.5px!important;line-height:1.75!important}.productCard .pad>ul{gap:9px!important;margin:18px 0 0!important}.productCard li{font-size:14.5px!important;color:#344054!important}.productCard li:before{background:#0f766e!important;box-shadow:0 0 0 4px rgba(15,118,110,.12)!important}.productCard .cta{margin-top:auto!important;background:#071024!important;color:#fff!important;border-color:#071024!important;box-shadow:0 16px 34px rgba(2,6,23,.16)!important}.productDisney .price{background:#eef6ff!important;border-color:#7dd3fc!important;color:#0c4a6e!important}.productHbomax .price{background:#f5f0ff!important;border-color:#c4b5fd!important;color:#4c1d95!important}.productNetwork .price{background:#ecfdf3!important;border-color:#6ee7b7!important;color:#065f46!important}@media (max-width:1080px){.grid3>.productCard:nth-child(3){grid-column:auto!important}}@media (max-width:560px){.productCard:before{right:18px!important;top:20px!important;width:62px!important;height:62px!important;border-radius:17px!important}.productCard h2{font-size:25px!important;margin-right:78px!important}.productCard .productTop{margin-right:78px!important}.productCard .pad{padding:22px!important}}';
    document.head.appendChild(style);
  }

  function installCopyContactStyles(){
    if(document.querySelector('[data-copy-contact-style]')) return;
    const style = document.createElement('style');
    style.dataset.copyContactStyle = 'true';
    style.textContent = '.copyContactGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.copyContactBtn{display:grid;gap:3px;min-height:64px;text-align:left;border:1px solid var(--line);border-radius:8px;background:#f8fbfa;color:#172033;padding:10px 12px;cursor:pointer;font:inherit;box-shadow:none}.copyContactBtn b{font-size:12px;color:#0f766e;line-height:1.2}.copyContactBtn span{font-size:14px;font-weight:900;line-height:1.3;overflow-wrap:anywhere}.copyContactBtn:hover{border-color:rgba(15,118,110,.42);background:#ecfdf5}.copyContactBtn.copied{border-color:#0f766e;background:#e7f3f1}.contactRows .copyContactGrid,.supportList .copyContactGrid{width:100%}@media (max-width:720px){.copyContactGrid{grid-template-columns:1fr}.copyContactBtn{min-height:58px}}';
    document.head.appendChild(style);
  }

  function createContactGrid(){
    const grid = document.createElement('div');
    grid.className = 'copyContactGrid';
    contacts.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copyContactBtn';
      button.innerHTML = '<b>' + item.label + '</b><span>' + item.value + '</span>';
      button.addEventListener('click', async () => {
        await copyText(item.value);
        const label = button.querySelector('b');
        const original = item.label;
        button.classList.add('copied');
        label.textContent = '已复制';
        setTimeout(() => {
          button.classList.remove('copied');
          label.textContent = original;
        }, 1500);
      });
      grid.appendChild(button);
    });
    return grid;
  }

  function installCopyContacts(){
    installCopyContactStyles();

    document.querySelectorAll('.contactRows').forEach((rows) => {
      if(rows.querySelector('.copyContactGrid')) return;
      const first = rows.querySelector('p');
      const grid = createContactGrid();
      if(first) first.replaceWith(grid);
      else rows.prepend(grid);
    });

    document.querySelectorAll('.supportList').forEach((list) => {
      if(list.querySelector('.copyContactGrid')) return;
      Array.from(list.querySelectorAll('span')).forEach((span) => {
        if(/QQ|WhatsApp|tg|Telegram/i.test(span.textContent || '')) span.remove();
      });
      list.appendChild(createContactGrid());
    });
  }

  function removeServicesContactPanel(){
    const products = document.querySelector('#products');
    const contactPanel = document.querySelector('.contactPanel');
    if(!products || !contactPanel) return;
    const section = contactPanel.closest('.section');
    if(section) section.remove();
    else contactPanel.remove();
  }

  function createTile(product){
    const tile = document.createElement('a');
    tile.className = 'tile';
    tile.href = 'services.html#products';
    tile.dataset.extraTile = product.service;
    tile.innerHTML = "<img src='" + product.image + "' alt='" + product.alt + "' loading='lazy'><div class='tileBody'><span class='serviceTag'>" + product.tag + "</span><h3>" + product.title + "</h3><p>" + product.tileText + "</p></div>";
    return tile;
  }

  function installHomeTiles(){
    const firstTile = document.querySelector('.tile');
    const grid = firstTile ? firstTile.parentElement : null;
    if(!grid) return;

    extraProducts.forEach((product) => {
      if(grid.querySelector('[data-extra-tile="' + product.service + '"]')) return;
      grid.appendChild(createTile(product));
    });
  }

  function createProductCard(product){
    const card = document.createElement('article');
    card.className = 'card productCard ' + product.cardClass;
    card.innerHTML = "<img src='" + product.image + "' alt='" + product.alt + "' loading='lazy'><div class='pad'><div class='productTop'><span class='brandPill'>" + product.tag + "</span><span class='miniPill'>" + product.cycle + "</span></div><h2>" + product.title + "</h2><p class='price'>" + product.price + "</p><p>" + product.intro + "</p><ul>" + product.features.map((item) => '<li>' + item + '</li>').join('') + "</ul><p>" + product.detail + "</p></div>";
    return card;
  }

  function installExtraProductCards(){
    const grid = document.querySelector('#products .grid3');
    if(!grid) return;

    installProductStyles();
    extraProducts.forEach((product) => {
      if(grid.querySelector('.' + product.cardClass)) return;
      grid.appendChild(createProductCard(product));
    });
  }

  installCopyContacts();
  removeServicesContactPanel();
  installHomeTiles();
  installExtraProductCards();

  const burger = document.querySelector('[data-burger]');
  const drawer = document.querySelector('[data-drawer]');
  const closeBtn = document.querySelector('[data-drawer-close]');

  function openDrawer(){ if(drawer) drawer.style.display='flex'; }
  function closeDrawer(){ if(drawer) drawer.style.display='none'; }

  burger && burger.addEventListener('click', openDrawer);
  closeBtn && closeBtn.addEventListener('click', closeDrawer);
  drawer && drawer.addEventListener('click', (e)=>{
    if(e.target === drawer) closeDrawer();
  });

  const productLinks = [
    ['.productSpotify', 'spotify'],
    ['.productNetflix', 'netflix'],
    ['.productChatgpt', 'chatgpt'],
    ['.productDisney', 'disney'],
    ['.productHbomax', 'hbomax'],
    ['.productNetwork', 'network']
  ];

  productLinks.forEach(([selector, service]) => {
    const card = document.querySelector(selector);
    if(!card || card.querySelector('[data-order-link]')) return;
    const pad = card.querySelector('.pad');
    if(!pad) return;
    const link = document.createElement('a');
    link.href = 'order.html?service=' + service;
    link.textContent = '立即下单';
    link.className = 'cta';
    link.dataset.orderLink = service;
    link.style.marginTop = '22px';
    link.style.alignSelf = 'flex-start';
    pad.appendChild(link);
  });

  const toTop = document.querySelector('[data-top]');
  function onScroll(){
    if(!toTop) return;
    toTop.style.display = (window.scrollY > 350) ? 'flex' : 'none';
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  toTop && toTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
})();
