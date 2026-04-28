(function(){
  if(!document.querySelector('[data-hidden-rule]')){
    const style = document.createElement('style');
    style.dataset.hiddenRule = 'true';
    style.textContent = '[hidden]{display:none!important}';
    document.head.appendChild(style);
  }

  function installNetworkStyles(){
    if(document.querySelector('[data-network-service-style]')) return;
    const style = document.createElement('style');
    style.dataset.networkServiceStyle = 'true';
    style.textContent = '.productNetwork{border-top:4px solid #0f766e}.productNetwork:before{content:"NETWORK";display:flex;align-items:center;justify-content:center;color:#0b4f4a;font-size:15px;font-weight:950;background-image:linear-gradient(135deg,#ecfdf5,#dbeafe);letter-spacing:0}.productNetwork .price{background:#ecfdf3;border-color:#bbf7d0;color:#065f46}@media (max-width:1080px){.grid3>.productCard:nth-child(3){grid-column:auto}}';
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

  function installNetworkTile(){
    const firstTile = document.querySelector('.tile');
    const grid = firstTile ? firstTile.parentElement : null;
    if(!grid || grid.querySelector('[data-network-tile]')) return;

    const tile = document.createElement('a');
    tile.className = 'tile';
    tile.href = 'services.html#products';
    tile.dataset.networkTile = 'true';
    tile.innerHTML = "<img src='assets/img/service-visual.svg' alt='网络节点服务' loading='lazy'><div class='tileBody'><span class='serviceTag'>Network</span><h3>网络节点服务</h3><p>不限设备·不限流量·最高5Gbps·解锁全球平台，大厂机房多线路，高峰不卡顿。</p></div>";
    grid.appendChild(tile);
  }

  function installNetworkProductCard(){
    const grid = document.querySelector('#products .grid3');
    if(!grid || grid.querySelector('.productNetwork')) return;

    installNetworkStyles();
    const card = document.createElement('article');
    card.className = 'card productCard productNetwork';
    card.innerHTML = "<img src='assets/img/service-visual.svg' alt='网络节点服务' loading='lazy'><div class='pad'><div class='productTop'><span class='brandPill'>Network</span><span class='miniPill'>年付</span></div><h2>网络节点服务</h2><p class='price'>年付99</p><p>不限设备·不限流量·最高5Gbps·解锁全球平台</p><ul><li>不限设备/流量</li><li>高速稳定多节点</li><li>全加密无日志</li></ul><p>大厂机房多线路，最高5Gbps带宽，解锁所有流媒体/AI/社交软件，高峰不卡顿</p></div>";
    grid.appendChild(card);
  }

  removeServicesContactPanel();
  installNetworkTile();
  installNetworkProductCard();

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
