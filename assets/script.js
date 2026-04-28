(function(){
  if(!document.querySelector('[data-hidden-rule]')){
    const style = document.createElement('style');
    style.dataset.hiddenRule = 'true';
    style.textContent = '[hidden]{display:none!important}';
    document.head.appendChild(style);
  }

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

  function installProductStyles(){
    if(document.querySelector('[data-extra-products-style]')) return;
    const style = document.createElement('style');
    style.dataset.extraProductsStyle = 'true';
    style.textContent = '.productDisney{border-top:4px solid #113ccf}.productDisney:before,.productHbomax:before,.productNetwork:before{display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:950;letter-spacing:0;background-image:linear-gradient(135deg,#f8fbff,#e8efff);color:#113ccf}.productDisney:before{content:"DISNEY+"}.productHbomax{border-top:4px solid #5b2cff}.productHbomax:before{content:"HBO MAX";background-image:linear-gradient(135deg,#f7f3ff,#e9ddff);color:#4c1d95}.productNetwork{border-top:4px solid #0f766e}.productNetwork:before{content:"NETWORK";background-image:linear-gradient(135deg,#ecfdf5,#dbeafe);color:#0b4f4a}.productDisney .price{background:#eef4ff;border-color:#bfd7ff;color:#1646a8}.productHbomax .price{background:#f4f0ff;border-color:#d7c7ff;color:#4c1d95}.productNetwork .price{background:#ecfdf3;border-color:#bbf7d0;color:#065f46}@media (max-width:1080px){.grid3>.productCard:nth-child(3){grid-column:auto}}';
    document.head.appendChild(style);
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
