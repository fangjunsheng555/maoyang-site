(function(){
  function $(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function one(s, r){ return (r || document).querySelector(s); }

  function copyText(text){
    if(navigator.clipboard && window.isSecureContext){
      return navigator.clipboard.writeText(text);
    }
    const t = document.createElement('textarea');
    t.value = text;
    t.style.position = 'fixed';
    t.style.left = '-9999px';
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    t.remove();
    return Promise.resolve();
  }

  // Drawer
  const burger = one('[data-burger]');
  const drawer = one('[data-drawer]');
  const drawerClose = one('[data-drawer-close]');
  if(burger && drawer){ burger.addEventListener('click', ()=>{ drawer.style.display = 'flex'; }); }
  if(drawerClose && drawer){ drawerClose.addEventListener('click', ()=>{ drawer.style.display = 'none'; }); }
  if(drawer){ drawer.addEventListener('click', (e)=>{ if(e.target === drawer) drawer.style.display = 'none'; }); }

  // Back-to-top
  const top = one('[data-top]');
  if(top){
    function syncTop(){ top.style.display = window.scrollY > 320 ? 'flex' : 'none'; }
    window.addEventListener('scroll', syncTop, { passive: true });
    syncTop();
    top.addEventListener('click', ()=>{ window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // Header compact on scroll
  const header = one('.header');
  if(header){
    if(!one('[data-header-style]')){
      const s = document.createElement('style');
      s.dataset.headerStyle = '1';
      s.textContent = '.header{transition:padding .2s ease,box-shadow .2s ease,background .2s ease}.header.isScrolled{padding-top:9px!important;padding-bottom:9px!important;background:rgba(255,255,255,.98)!important;box-shadow:0 12px 34px rgba(15,23,42,.12)!important}';
      document.head.appendChild(s);
    }
    function syncHeader(){ header.classList.toggle('isScrolled', window.scrollY > 18); }
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();
  }

  // Tap ripple
  if(!one('[data-tap-style]')){
    const s = document.createElement('style');
    s.dataset.tapStyle = '1';
    s.textContent = '.cta,.ghostCta,.primaryBtn,.ghostBtn,.addToCartBtn,.cartBarGo,.cartBarInfo,.lookupForm button,.checkoutMobileCtaBtn,.paySubmitBtn,.lookupRow,.checkoutItem,.copyContactBtn,.paymentMethodOption{position:relative;overflow:hidden}.tapRipple{position:absolute;border-radius:999px;transform:translate(-50%,-50%) scale(0);background:rgba(15,118,110,.18);pointer-events:none;animation:tapRipple .58s ease-out forwards}@keyframes tapRipple{to{transform:translate(-50%,-50%) scale(1);opacity:0}}';
    document.head.appendChild(s);
  }
  document.addEventListener('click', (e)=>{
    const target = e.target.closest('.cta,.ghostCta,.primaryBtn,.ghostBtn,.addToCartBtn,.cartBarGo,.cartBarInfo,.lookupForm button,.checkoutMobileCtaBtn,.paySubmitBtn,.lookupRow,.copyContactBtn,.paymentMethodOption');
    if(!target) return;
    const r = target.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 1.8;
    const span = document.createElement('span');
    span.className = 'tapRipple';
    span.style.width = d + 'px';
    span.style.height = d + 'px';
    span.style.left = (e.clientX - r.left) + 'px';
    span.style.top = (e.clientY - r.top) + 'px';
    target.appendChild(span);
    setTimeout(()=>span.remove(), 650);
  }, true);

  // Contact copy buttons
  const contacts = [['QQ','2802632995'], ['WhatsApp','+1 4315093334'], ['Telegram','+44 7707489977']];
  function buildContactGrid(){
    const g = document.createElement('div');
    g.className = 'copyContactGrid';
    if(!one('[data-contact-style]')){
      const s = document.createElement('style');
      s.dataset.contactStyle = '1';
      s.textContent = '.copyContactGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.copyContactBtn{display:grid;gap:2px;text-align:left;border:1px solid var(--line);border-radius:10px;background:#f8fbfa;color:var(--ink);padding:9px 11px;cursor:pointer;font:inherit;min-height:54px}.copyContactBtn b{font-size:11.5px;color:#0f766e;font-weight:900}.copyContactBtn span{font-size:13px;font-weight:900;overflow-wrap:anywhere}@media(max-width:720px){.copyContactGrid{grid-template-columns:1fr;gap:6px}.copyContactBtn{min-height:48px;padding:8px 11px}}';
      document.head.appendChild(s);
    }
    contacts.forEach((c)=>{
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'copyContactBtn';
      b.innerHTML = '<b>' + c[0] + '</b><span>' + c[1] + '</span>';
      b.addEventListener('click', ()=>{
        copyText(c[1]).then(()=>{
          const x = one('b', b), old = c[0];
          x.textContent = '已复制';
          setTimeout(()=>{ x.textContent = old; }, 1500);
        });
      });
      g.appendChild(b);
    });
    return g;
  }
  $('.contactRows').forEach((r)=>{
    if(one('.copyContactGrid', r)) return;
    const p = one('p', r);
    const g = buildContactGrid();
    if(p) p.replaceWith(g);
    else r.prepend(g);
  });
  $('.supportList').forEach((l)=>{
    if(one('.copyContactGrid', l)) return;
    $('span', l).forEach((s)=>{ if(/QQ|WhatsApp|tg|Telegram/i.test(s.textContent)) s.remove(); });
    l.appendChild(buildContactGrid());
  });

  // Reveal-on-scroll motion
  const motionOk = !window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(motionOk && !one('[data-motion-style]')){
    const s = document.createElement('style');
    s.dataset.motionStyle = '1';
    s.textContent = '.motionItem{opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .5s ease}.motionItem.inView{opacity:1;transform:translateY(0)}';
    document.head.appendChild(s);
    if('IntersectionObserver' in window){
      const items = $('.sectionHead,.tile,.card,.pbox,.productCard,.lookupPanel,.contactPanel,.trustStrip,.bundleNote');
      items.forEach((el, i)=>{ el.classList.add('motionItem'); el.style.transitionDelay = Math.min((i % 6) * 40, 200) + 'ms'; });
      const io = new IntersectionObserver((entries)=>{
        entries.forEach((entry)=>{
          if(entry.isIntersecting){ entry.target.classList.add('inView'); io.unobserve(entry.target); }
        });
      }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
      items.forEach((el)=>io.observe(el));
    }
  }
})();
