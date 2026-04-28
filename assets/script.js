(function(){
  if(!document.querySelector('[data-hidden-rule]')){
    const style = document.createElement('style');
    style.dataset.hiddenRule = 'true';
    style.textContent = '[hidden]{display:none!important}';
    document.head.appendChild(style);
  }

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
    ['.productChatgpt', 'chatgpt']
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
