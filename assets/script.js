(function(){
  var contacts=[['QQ','2802632995'],['WhatsApp','+1 4315093334'],['Telegram','+44 7707489977']];
  var media={spotify:'assets/img/product-spotify.jpg',netflix:'assets/img/product-netflix.jpg',chatgpt:'assets/img/product-chatgpt.jpg',disney:'assets/img/product-disney.jpg',hbomax:'assets/img/product-hbomax.jpg',network:'assets/img/product-network.jpg',hero:'assets/img/hero-membership.jpg',support:'assets/img/service-premium.jpg',company:'assets/img/company-premium.jpg'};
  var extra=[
    ['disney','productDisney','Disney+','Disney+','年付','年付108','独立车位全球可用4K杜比套餐',['4K杜比','位置上锁','不被挤不排队'],'4K画质，杜比音效，离线下载，全球可用不限制地区，顶规4K杜比套餐，4人一车绝不超售，高峰不排队不被挤，位置可上锁，用户互不干扰，如需购买整号请联系在线客服'],
    ['hbomax','productHbomax','HBO Max','HBO Max','年付','年付148','独立车位全球可用4K杜比套餐',['4K杜比','全球可用','实时售后保障'],'4K画质，杜比音效，离线下载，全球可用不限制地区，顶规4K杜比套餐，4人一车绝不超售，高峰不排队不被挤，位置可上锁，用户互不干扰，如需购买整号请联系在线客服'],
    ['network','productNetwork','VPN','网络节点服务','年付','年付99','不限设备·不限流量·最高5Gbps·解锁全球平台',['不限设备/流量','高速稳定多节点','全加密无日志'],'大厂机房多线路，最高5Gbps带宽，解锁所有流媒体/AI/社交软件，高峰不卡顿']
  ];
  var enProducts={
    productSpotify:['Annual','Premium family plan in high-value US/EU/JP regions, ¥128/year',['Lossless audio','Podcasts','Offline downloads','Playlist mix','DJX feature','Full music library'],'Includes available Spotify Premium features. Individual, Duo, and Family options are available on request.'],
    productNetflix:['Annual','High-value region, one profile per user, ¥168/year',['4K quality','Dolby audio','Offline downloads','Profile lock','Netflix games'],'Dedicated line option for mainland users supports fast 4K streaming and stable daily use.'],
    productChatgpt:['Monthly','Dedicated account use, ¥75/month',['codeX','5.5+ access','High-quality VPN route'],'ChatGPT Plus includes a low-risk dedicated line for smoother model performance.'],
    productDisney:['Annual','Independent profile, global 4K Dolby plan, ¥108/year',['4K Dolby','Profile lock','No crowding or queueing'],'Global 4K Dolby access with profile lock, offline downloads, and stable peak-hour use.'],
    productHbomax:['Annual','Independent profile, global 4K Dolby plan, ¥148/year',['4K Dolby','Global availability','After-sales support'],'Global 4K Dolby access with responsive support and no overselling.'],
    productNetwork:['Annual','Unlimited devices and traffic, up to 5Gbps, ¥99/year',['Unlimited devices/traffic','Stable multi-node access','Encrypted and no logs'],'Multi-line VPN routes unlock streaming, AI, and social platforms with smooth peak-hour performance.']
  };
  var enNames={productSpotify:'Spotify Premium',productNetflix:'Netflix Premium',productChatgpt:'ChatGPT Plus',productDisney:'Disney+',productHbomax:'HBO Max',productNetwork:'VPN Service'};
  var tileEn={
    spotify:['Spotify','Spotify Premium','Premium family plan in high-value US/EU/JP regions with lossless audio, podcasts, offline downloads, and a full music library.'],
    netflix:['Netflix','Netflix Premium','One dedicated profile in a high-value region with 4K quality, Dolby audio, offline downloads, and profile lock.'],
    chatgpt:['AI','ChatGPT Plus','Dedicated account use with official paid access and a low-risk dedicated VPN route for a smoother experience.'],
    disney:['Disney+','Disney+','Independent profile with global 4K Dolby access, profile lock, and stable peak-hour use.'],
    hbomax:['HBO Max','HBO Max','Independent global 4K Dolby profile with responsive support and no overselling.'],
    network:['VPN','VPN Service','Unlimited devices and traffic, up to 5Gbps, with access to global streaming, AI, and social platforms.']
  };
  var langKey='maoyangLang',lang=(localStorage.getItem(langKey)||'').match(/^(zh|en)$/)?localStorage.getItem(langKey):(/^zh/i.test(navigator.language||'')?'zh':'en');
  window.MAOYANG_GET_LANG=function(){return lang};
  window.MAOYANG_SET_LANG=function(v){setLang(v,true)};
  function $(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function one(s,r){return (r||document).querySelector(s)}
  function keep(n,k,v){if(n&&!n.dataset[k])n.dataset[k]=v}
  function text(n,v){if(!n)return;keep(n,'zhText',n.textContent);n.textContent=lang==='zh'?n.dataset.zhText:v}
  function html(n,v){if(!n)return;keep(n,'zhHtml',n.innerHTML);n.innerHTML=lang==='zh'?n.dataset.zhHtml:v}
  function ph(n,v){if(!n)return;keep(n,'zhPlaceholder',n.placeholder||'');n.placeholder=lang==='zh'?n.dataset.zhPlaceholder:v}
  function setImg(img,src,alt){if(!img)return;img.src=src;img.alt=alt||img.alt||'';img.loading=img.loading||'lazy';img.referrerPolicy=''}
  function copy(v){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(v);var t=document.createElement('textarea');t.value=v;t.style.position='fixed';t.style.left='-999px';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();return Promise.resolve()}
  function style(){
    if(one('[data-my-style]'))return;var s=document.createElement('style');s.dataset.myStyle='1';
    s.textContent='[hidden]{display:none!important}.hero,.orderHero{background-image:linear-gradient(90deg,rgba(2,8,16,.84),rgba(2,8,16,.62) 48%,rgba(2,8,16,.28)),url("'+media.hero+'")!important;background-size:cover!important;background-position:center!important;overflow:hidden!important}.hero:before,.orderHero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 24% 42%,rgba(0,0,0,.32),rgba(0,0,0,0) 38%),linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.08));pointer-events:none}.hero:after,.orderHero:after{content:"";position:absolute;inset:auto 0 0 0;height:30%;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.96));pointer-events:none}.hero .eyebrow,.orderHero .eyebrow{color:#ffe3a8!important;text-shadow:0 2px 12px rgba(0,0,0,.72),0 1px 2px rgba(0,0,0,.88)!important}.hero .title,.orderHero .title{color:#fffaf0!important;text-shadow:0 3px 18px rgba(0,0,0,.78),0 1px 2px rgba(0,0,0,.95)!important}.hero .subtitle,.orderHero .subtitle{color:#fff8ea!important;text-shadow:0 2px 14px rgba(0,0,0,.82),0 1px 2px rgba(0,0,0,.95)!important}.brand img{height:auto!important;max-height:58px!important;width:auto!important}.tile,.productCard,.section .grid2>.card{border-radius:8px!important;border:1px solid rgba(210,226,222,.95)!important;box-shadow:0 20px 52px rgba(15,23,42,.09)!important;background:#fff!important;overflow:hidden!important}.tile>img,.productCard>img,.grid2>.card>img{display:block!important;width:100%!important;aspect-ratio:16/9!important;height:auto!important;object-fit:contain!important;background:#071024!important;border-bottom:1px solid rgba(226,232,240,.92)!important}.productCard:before{display:none!important}.productCard .pad{padding:24px 24px 28px!important;min-height:auto!important;display:block!important}.productCard h2{font-size:29px!important;line-height:1.12!important;letter-spacing:0!important}.productCard .price{justify-content:flex-start!important;min-height:46px!important;margin:16px 0 14px!important;padding:10px 16px!important;border-radius:8px!important;border:1px dashed #35d9d1!important;background:#effffb!important;color:#083f3a!important;text-align:left!important}.productCard .cta{display:inline-flex!important;margin:0 0 16px!important;background:#071024!important;color:#fff!important;border-color:#071024!important;visibility:visible!important;opacity:1!important}.copyContactGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.copyContactBtn{display:grid;gap:3px;min-height:64px;text-align:left;border:1px solid var(--line);border-radius:8px;background:#f8fbfa;color:#172033;padding:10px 12px;cursor:pointer;font:inherit}.copyContactBtn b{font-size:12px;color:#0f766e}.copyContactBtn span{font-size:14px;font-weight:900;overflow-wrap:anywhere}.langToggle{border:0;border-radius:999px;background:#e7f3f1;color:#0b4f4a;font-weight:950;min-height:38px;padding:0 14px;cursor:pointer}.drawer nav .langToggle{width:100%;text-align:left;border-radius:8px;background:#f8faf9;color:#344054;padding:12px 14px}@media(max-width:720px){.copyContactGrid{grid-template-columns:1fr}}';
    s.textContent+='.brandPill,.miniPill,.serviceTag{align-items:center!important;justify-content:center!important;line-height:1!important;padding-top:0!important;padding-bottom:0!important}.brandPill,.miniPill{min-height:30px!important}.serviceTag{min-height:28px!important}.productCard,.tile{scroll-margin-top:118px}.supportList span,.contactRows p{line-height:1.6!important}.grid2 .card .pad>.brandPill:first-child{margin-top:4px!important;margin-bottom:8px!important}.grid2 .card .pad>h2:first-of-type{margin-top:4px!important}.heroMetrics span{display:flex!important;flex-direction:column!important;justify-content:center!important;min-height:62px!important}.heroMetrics b{margin-bottom:6px!important}';
    document.head.appendChild(s)
  }
  function contactsUI(){
    function grid(){var g=document.createElement('div');g.className='copyContactGrid';contacts.forEach(function(c){var b=document.createElement('button');b.type='button';b.className='copyContactBtn';b.innerHTML='<b>'+c[0]+'</b><span>'+c[1]+'</span>';b.onclick=function(){copy(c[1]).then(function(){var x=one('b',b),old=c[0];x.textContent=lang==='en'?'Copied':'已复制';setTimeout(function(){x.textContent=old},1500)})};g.appendChild(b)});return g}
    $('.contactRows').forEach(function(r){if(one('.copyContactGrid',r))return;var p=one('p',r),g=grid();p?p.replaceWith(g):r.prepend(g)});
    $('.supportList').forEach(function(l){if(one('.copyContactGrid',l))return;$('span',l).forEach(function(s){if(/QQ|WhatsApp|tg|Telegram/i.test(s.textContent))s.remove()});l.appendChild(grid())})
  }
  function images(){
    [['.productSpotify',media.spotify,'Spotify Premium'],['.productNetflix',media.netflix,'Netflix Premium'],['.productChatgpt',media.chatgpt,'ChatGPT Plus'],['.productDisney',media.disney,'Disney+'],['.productHbomax',media.hbomax,'HBO Max'],['.productNetwork',media.network,'网络节点服务']].forEach(function(x){$(x[0]).forEach(function(c){setImg(one('img',c),x[1],x[2])})});
    $('.tile').forEach(function(t){var h=(one('h3',t)||{}).textContent||'';if(/Spotify/i.test(h))setImg(one('img',t),media.spotify,'Spotify Premium');if(/Netflix/i.test(h))setImg(one('img',t),media.netflix,'Netflix Premium');if(/ChatGPT/i.test(h))setImg(one('img',t),media.chatgpt,'ChatGPT Plus');if(/Disney/i.test(h))setImg(one('img',t),media.disney,'Disney+');if(/HBO/i.test(h))setImg(one('img',t),media.hbomax,'HBO Max');if(/节点|Network/i.test(h))setImg(one('img',t),media.network,'网络节点服务')});
    $('img[src$="service-visual.svg"]').forEach(function(i){setImg(i,media.support,'售后服务展示图')});$('img[src$="company-visual.svg"]').forEach(function(i){setImg(i,media.company,'公司展示图')})
  }
  function addCards(){
    var contact=one('.contactPanel'),products=one('#products');if(contact&&products){var sec=contact.closest('.section');sec?sec.remove():contact.remove()}
    var home=one('.tile')&&one('.tile').parentElement;if(home)extra.forEach(function(p){if(one('[data-extra-tile="'+p[0]+'"]',home))return;var a=document.createElement('a');a.className='tile';a.href='services.html#service-'+p[0];a.dataset.extraTile=p[0];a.innerHTML="<img src='"+media[p[0]]+"' alt='"+p[3]+"' loading='lazy'><div class='tileBody'><span class='serviceTag'>"+p[2]+"</span><h3>"+p[3]+"</h3><p>"+p[6]+"</p></div>";home.appendChild(a)});
    var grid=one('#products .grid3');if(grid)extra.forEach(function(p){if(one('.'+p[1],grid))return;var c=document.createElement('article');c.className='card productCard '+p[1];c.innerHTML="<img src='"+media[p[0]]+"' alt='"+p[3]+"' loading='lazy'><div class='pad'><div class='productTop'><span class='brandPill'>"+p[2]+"</span><span class='miniPill'>"+p[4]+"</span></div><h2>"+p[3]+"</h2><p class='price'>"+p[5]+"</p><p>"+p[6]+"</p><ul>"+p[7].map(function(v){return'<li>'+v+'</li>'}).join('')+"</ul><p>"+p[8]+"</p></div>";grid.appendChild(c)});
    [['.productSpotify','spotify'],['.productNetflix','netflix'],['.productChatgpt','chatgpt'],['.productDisney','disney'],['.productHbomax','hbomax'],['.productNetwork','network']].forEach(function(p){var c=one(p[0]),pad=c&&one('.pad',c);if(!pad||one('[data-order-link]',pad))return;var a=document.createElement('a');a.className='cta';a.dataset.orderLink=p[1];a.href='order.html?service='+p[1];a.textContent='立即下单';var price=one('.price',pad);price?price.insertAdjacentElement('afterend',a):pad.appendChild(a)})
  }
  function productKeyFromText(v){v=String(v||'');if(/Spotify/i.test(v))return'spotify';if(/Netflix/i.test(v))return'netflix';if(/ChatGPT|Openai|AI/i.test(v))return'chatgpt';if(/Disney/i.test(v))return'disney';if(/HBO/i.test(v))return'hbomax';if(/网络|节点|Network/i.test(v))return'network';return''}
  function setupServiceAnchors(){
    [['.productSpotify','spotify'],['.productNetflix','netflix'],['.productChatgpt','chatgpt'],['.productDisney','disney'],['.productHbomax','hbomax'],['.productNetwork','network']].forEach(function(p){var c=one(p[0]);if(c)c.id='service-'+p[1]});
    $('.tile').forEach(function(t){var key=t.dataset.extraTile||productKeyFromText((one('h3',t)||{}).textContent||(one('.serviceTag',t)||{}).textContent);if(key)t.href='services.html#service-'+key})
  }
  function scrollToServiceHash(){if(page()!=='services.html'||!location.hash)return;setTimeout(function(){var target=one(location.hash);if(target)target.scrollIntoView({block:'start',behavior:'auto'})},160)}
  function page(){var n=(location.pathname.split('/').pop()||'index.html').toLowerCase();return n||'index.html'}
  function setHero(a){text(one('.hero .eyebrow'),a[0]);text(one('.hero .title'),a[1]);text(one('.hero .subtitle'),a[2]);var x=$('.heroActions a');if(a[3])text(x[0],a[3]);if(a[4])text(x[1],a[4])}
  function head(i,a){var h=$('.sectionHead')[i];if(!h)return;text(one('.kicker',h),a[0]);text(one('h1,h2',h),a[1]);if(a[2])text(one('p',h),a[2])}
  var common={zh:['首页','购买','下单','联系我们','菜单','EN','Switch to English'],en:['Home','Services','Order','Contact','Menu','中文','切换到中文']};
  var copyEn={
    index:{hero:['Maoyang Membership Service','Maoyang Membership Service','A one-stop portal for streaming subscriptions, AI memberships, and VPN services. A transaction is only the beginning; we support your complete service experience.','Browse Services','Contact Support'],heads:[['Membership Services','Popular Membership and Subscription Services','Streaming, AI membership, and VPN services.'],['About Our Service','Based in Taiwan, China, focused on membership services']],about:'Since 2020, we have provided membership services with clear descriptions, stable delivery, competitive pricing, and responsive support before and after purchase.',support:['After-sales Support','Year-round support, fast response','We provide professional and efficient support for questions encountered during service use.']},
    services:{hero:['Membership Catalog','Purchase Services','Spotify, Netflix, ChatGPT, Disney+, HBO Max, and VPN Service. Contact support if you need help choosing a plan.','View Services','Contact Support'],head:['Service Plans','Choose the membership service you need','The services below are examples of available subscription plans. Contact support for additional requirements.']},
    about:{hero:['Contact & Trust','Contact Us','For purchase questions, after-sales support, or VPN service testing, contact our online support team. Online hours are 9:00 AM to 11:00 PM Beijing Time.','Browse Services','View Contact Options'],head:['Company & Trust','Based in Taiwan, China, focused on membership services','Since 2020, we have provided membership services with competitive pricing, stable delivery, and continuous after-sales support.'],company:'Since 2020, we have specialized in membership services and helped customers access quality subscription services at competitive prices. We focus on stable delivery, clear communication, and responsive support.'},
    order:{hero:['Order & Payment','Submit Order','Choose a membership service and payment method, then fill in the required order information. Contact support if you have any questions.','Fill Order','Contact Support']},
    payment:{hero:['Payment','Payment Confirmation','Complete payment using the QR code shown on this page. After payment, return and click “I have completed payment”.']}
  };
  function productEnApply(){Object.keys(enProducts).forEach(function(k){var c=one('.'+k),d=enProducts[k];if(!c)return;text(one('h2',c),enNames[k]||'');text(one('.miniPill',c),d[0]);text(one('.price',c),d[1]);$('li',c).forEach(function(li,i){if(d[2][i])text(li,d[2][i])});var ps=$('.pad>p:not(.price)',c);if(ps[0])text(ps[ps.length>1?1:0],d[3])});$('[data-order-link]').forEach(function(a){text(a,'Order Now')})}
  function tileEnApply(){$('.tile').forEach(function(t){var key=t.dataset.extraTile||productKeyFromText((one('h3',t)||{}).textContent||(one('.serviceTag',t)||{}).textContent),d=tileEn[key];if(!d)return;text(one('.serviceTag',t),d[0]);text(one('h3',t),d[1]);text(one('p',t),d[2])})}
  function metricEnApply(){var labels=['Years of service','Customers served','Orders completed','Positive feedback'],nums=['5+','50k+','100k+','100%'];$('.heroMetrics span').forEach(function(s,i){keep(s,'zhHtml',s.innerHTML);if(lang==='zh'){s.innerHTML=s.dataset.zhHtml;return}s.innerHTML='<b>'+nums[i]+'</b>'+labels[i]})}
  function supportEnApply(){
    $('.supportList span').forEach(function(s){if(/在线时间|Beijing Time|Online/i.test(s.textContent))text(s,'Online hours: 9:00 AM-11:00 PM Beijing Time')});
    $('.contactRows p').forEach(function(p){if(/在线时间|Beijing Time|Online/i.test(p.textContent))html(p,'Online hours: 9:00 AM-11:00 PM<small>Beijing Time 9:00 AM-11:00 PM UTC+8</small>')});
  }
  function reviewEnApply(){
    text(one('.reviewsTitle'),'Customer Reviews');text(one('.rvTip'),'3 random reviews each visit');text(one('.reviewsSub'),'Selected real feedback');
    var map={'你们的会员确实稳，比别家便宜还更好。':'The membership service is genuinely stable, cheaper than others, and works better.','很不错，客服很有耐心解决问题。':'Very good. Support was patient and helped resolve the issue.','速度太牛了，爽。':'The speed is excellent. Very smooth.','用了两年多了，有时候会掉出会员，但是客服都给解决了。':'I have used it for over two years. When membership issues happened, support handled them.','奈飞搭配客服给的专线太爽了，真秒开4K。':'Netflix with the dedicated line from support is excellent. 4K opens instantly.','确实快，认准这家没错。':'It is genuinely fast. This is the right seller to use.','非常誠信的賣家，說到做到。':'A very trustworthy seller who delivers what they promise.','真是正，第一次見咁好嘅商家，祝興隆。':'Excellent service. It is rare to find such a good seller.'};
    $('.reviewText').forEach(function(p){if(map[p.dataset.zhText||p.textContent])text(p,map[p.dataset.zhText||p.textContent])})
  }
  function translate(){
    var c=common[lang];document.documentElement.lang=lang==='zh'?'zh-CN':'en';$('[data-lang-toggle]').forEach(function(b){b.textContent=c[5];b.title=c[6]});
    [['/',c[0]],['index.html',c[0]],['services.html',c[1]],['order.html',c[2]],['about.html',c[3]]].forEach(function(x){$('.nav a[href="'+x[0]+'"],.drawer nav a[href="'+x[0]+'"]').forEach(function(a){text(a,x[1])})});text(one('.drawer .panelhead strong'),c[4]);
    var p=page();tileEnApply();metricEnApply();supportEnApply();reviewEnApply();
    if(p==='index.html'){setHero(copyEn.index.hero);head(0,copyEn.index.heads[0]);head(1,copyEn.index.heads[1]);var pb=$('.pbox');if(pb[0])text(one('p',pb[0]),copyEn.index.about);var sp=$('.grid2 .card .pad')[0];if(sp){text(one('.brandPill',sp),copyEn.index.support[0]);text(one('h2',sp),copyEn.index.support[1]);text(one('p',sp),copyEn.index.support[2])}}
    if(p==='services.html'){setHero(copyEn.services.hero);head(0,copyEn.services.head);productEnApply()}
    if(p==='about.html'){setHero(copyEn.about.hero);text(one('.contactTitle'),'Contact Us');head(0,copyEn.about.head);var co=one('.grid2 .card .pad');if(co){text(one('h2',co),'Over 5 years of membership service experience');var ps=$('p',co);if(ps[0])text(ps[0],copyEn.about.company);if(ps[1])ps[1].hidden=true}}
    if(p==='order.html'){setHero(copyEn.order.hero)}
    if(p==='payment.html'){setHero(copyEn.payment.hero)}
    if(lang==='zh')hideEnglish()
  }
  function hideEnglish(){var pb=$('.pbox');if(pb[1])pb[1].hidden=true;var co=one('.grid2 .card .pad');if(page()==='about.html'&&co){var ps=$('p',co);if(ps[1])ps[1].hidden=true}}
  function toggles(){$('.nav,.drawer nav').forEach(function(n){if(one('[data-lang-toggle]',n))return;var b=document.createElement('button');b.type='button';b.className='langToggle';b.dataset.langToggle='1';b.onclick=function(){setLang(lang==='zh'?'en':'zh',true)};n.appendChild(b)})}
  function setLang(v,save){lang=v==='en'?'en':'zh';if(save)localStorage.setItem(langKey,lang);translate();interactions();window.dispatchEvent(new CustomEvent('maoyang:languagechange',{detail:{lang:lang}}))}
  function interactions(){
    var motionOk=!window.matchMedia||!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!one('[data-interaction-style]')){
      var st=document.createElement('style');st.dataset.interactionStyle='1';
      st.textContent='.header{transition:padding .2s ease,box-shadow .2s ease,background .2s ease}.header.isScrolled{padding-top:9px!important;padding-bottom:9px!important;background:rgba(255,255,255,.98)!important;box-shadow:0 12px 34px rgba(15,23,42,.12)!important}.nav a,.drawer nav a,.copyContactBtn,.cta,.ghostCta,.submitBtn,.lookupForm button,.lookupCopyBtn,.lookupDetailBtn,.payTabs label,.mobileDock a{position:relative;overflow:hidden}.tapRipple{position:absolute;border-radius:999px;transform:translate(-50%,-50%) scale(0);background:rgba(15,118,110,.18);pointer-events:none;animation:tapRipple .58s ease-out forwards}@keyframes tapRipple{to{transform:translate(-50%,-50%) scale(1);opacity:0}}.scrollProgress{position:fixed;top:0;left:0;right:0;height:3px;z-index:1200;background:transparent;pointer-events:none}.scrollProgress span{display:block;width:0;height:100%;background:linear-gradient(90deg,#0f766e,#20c7bd);box-shadow:0 0 14px rgba(15,118,110,.38);transition:width .12s ease-out}.mobileDock{display:none}.mobileDock a{display:flex;align-items:center;justify-content:center;gap:6px;min-height:52px;border-radius:999px;color:#344054;font-size:12px;font-weight:950;-webkit-tap-highlight-color:transparent}.mobileDock a svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}.mobileDock a.active{background:#0f766e;color:#fff;box-shadow:0 12px 24px rgba(15,118,110,.26)}.touchActive{transform:scale(.985)!important;box-shadow:0 16px 42px rgba(15,23,42,.12)!important}.dockPulse{animation:dockPulse .38s ease-out}@keyframes dockPulse{50%{transform:translateY(-2px) scale(1.03)}}@media(max-width:760px){body.hasMobileDock{padding-bottom:calc(86px + env(safe-area-inset-bottom))}.mobileDock{position:fixed;left:12px;right:12px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:1100;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:8px;border:1px solid rgba(217,227,224,.92);border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 18px 46px rgba(15,23,42,.18);backdrop-filter:blur(18px)}.toTop{bottom:calc(96px + env(safe-area-inset-bottom))!important}}';
      st.textContent+='.mobileServiceRail,.orderMobileBar{display:none}.mobileServiceRail a{white-space:nowrap}.orderMobileMeta{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 10px;width:100%;min-width:0}.orderMobileMeta span{font-size:11px;color:#667085;font-weight:850;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.orderMobileMeta b{font-size:16px;color:#101828;line-height:1.1;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.orderMobileMeta b.isHidden{display:none}.orderMobileMeta .orderMobileService{grid-column:1/-1;color:#0f766e;font-weight:950}.orderMobileActions{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;align-items:center}.orderMobilePrompt,.orderMobileSubmit,.orderMobileChoice{min-height:36px;border-radius:999px;font:inherit;font-weight:950;cursor:pointer}.orderMobilePrompt{border:1px solid rgba(15,118,110,.18);background:#eef8f6;color:#0b4f4a;padding:8px 12px;text-align:center}.orderMobilePrompt.isWide{grid-column:1/-1}.orderMobileSubmit{border:0;background:#0f766e;color:#fff;padding:8px 14px;box-shadow:0 12px 24px rgba(15,118,110,.22);white-space:nowrap}.orderMobileSubmit[hidden],.orderMobilePayChoices[hidden]{display:none!important}.orderMobilePayChoices{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:6px}.orderMobileChoice{border:1px solid rgba(217,227,224,.95);background:#fff;color:#344054;padding:8px 10px}.orderMobileChoice.active{background:#0f766e;color:#fff;border-color:#0f766e}.orderMobileChoice small{margin-left:5px;font-size:11px;font-weight:950;opacity:.82}@media(max-width:760px){.mobileServiceRail{position:sticky;top:68px;z-index:45;display:flex;gap:8px;overflow-x:auto;margin:0 0 18px;padding:8px;border:1px solid rgba(217,227,224,.92);border-radius:999px;background:rgba(255,255,255,.92);box-shadow:0 14px 34px rgba(15,23,42,.09);backdrop-filter:blur(18px);scrollbar-width:none}.mobileServiceRail::-webkit-scrollbar{display:none}.mobileServiceRail a{flex:0 0 auto;display:flex;align-items:center;justify-content:center;min-height:38px;padding:8px 14px;border-radius:999px;border:1px solid rgba(217,227,224,.95);background:#fff;color:#344054;font-size:13px;font-weight:950}.mobileServiceRail a.active{background:#0f766e;color:#fff;border-color:#0f766e;box-shadow:0 10px 22px rgba(15,118,110,.22)}.orderBox .payTabs,.orderBox .submitBtn{display:none!important}.orderMobileBar{position:fixed;left:12px;right:12px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:1098;display:grid;grid-template-columns:1fr;gap:6px;padding:8px 12px;border:1px solid rgba(217,227,224,.92);border-radius:16px;background:rgba(255,255,255,.96);box-shadow:0 18px 46px rgba(15,23,42,.18);backdrop-filter:blur(18px)}body.hasOrderBar{padding-bottom:calc(142px + env(safe-area-inset-bottom))}body.isTyping .mobileDock{opacity:0!important;transform:translateY(140%)!important;pointer-events:none!important}body.isTyping .orderMobileBar{bottom:calc(8px + env(safe-area-inset-bottom))}.mobileDock,.orderMobileBar{transition:opacity .18s ease,transform .18s ease,bottom .18s ease}}';
      if(motionOk)st.textContent+='.motionItem{opacity:0;transform:translateY(18px);transition:opacity .56s ease,transform .56s ease}.motionItem.inView{opacity:1;transform:translateY(0)}.tiltReady{transform-style:preserve-3d;will-change:transform}.tiltReady:hover{box-shadow:0 28px 68px rgba(15,23,42,.14)!important}.hero .inner{transition:transform .18s ease-out}.hero.isPointerActive .inner{transform:translate3d(var(--hero-x,0),var(--hero-y,0),0)}';
      document.head.appendChild(st);
    }
    function dockIcon(name){
      var icons={
        services:"<svg viewBox='0 0 24 24'><path d='M4 6h16'/><path d='M4 12h16'/><path d='M4 18h16'/></svg>",
        order:"<svg viewBox='0 0 24 24'><path d='M8 3h8l3 3v15H5V3h3Z'/><path d='M9 13h6'/><path d='M9 17h4'/></svg>",
        lookup:"<svg viewBox='0 0 24 24'><circle cx='11' cy='11' r='6'/><path d='m16 16 4 4'/></svg>",
        support:"<svg viewBox='0 0 24 24'><path d='M4 12a8 8 0 0 1 16 0v5a3 3 0 0 1-3 3h-3'/><path d='M4 13h3v5H4z'/><path d='M17 13h3v5h-3z'/></svg>"
      };
      return icons[name]||'';
    }
    function dockLabels(){return lang==='zh'?{services:'服务',order:'下单',lookup:'查订单',support:'客服'}:{services:'Services',order:'Order',lookup:'Lookup',support:'Support'}}
    function dockHref(name){
      var p=page();
      if(name==='services')return p==='services.html'?'#products':'services.html#products';
      if(name==='order')return p==='order.html'?'#orderForm':'order.html';
      if(name==='lookup')return p==='index.html'?'#orderLookup':'index.html#orderLookup';
      return p==='about.html'?'#contact':'about.html#contact';
    }
    function activeDock(name){
      var p=page(),hash=location.hash;
      if(name==='services')return p==='services.html'&&(!hash||hash==='#products'||/^#service-/.test(hash));
      if(name==='order')return p==='order.html'||p==='payment.html';
      if(name==='lookup')return p==='index.html'&&hash==='#orderLookup';
      if(name==='support')return p==='about.html';
      return false;
    }
    function scrollLookupTarget(){
      var target=one('#orderLookup');
      if(!target)return false;
      var top=target.getBoundingClientRect().top+window.scrollY-76;
      window.scrollTo({top:Math.max(0,top),behavior:'smooth'});
      return true;
    }
    function mobileDock(){
      if(page()==='order.html'){
        var current=one('[data-mobile-dock]');
        if(current)current.remove();
        document.body.classList.remove('hasMobileDock');
        return;
      }
      var dock=one('[data-mobile-dock]'),labels=dockLabels(),names=['services','order','lookup','support'];
      if(!dock){dock=document.createElement('nav');dock.className='mobileDock';dock.dataset.mobileDock='1';dock.setAttribute('aria-label',lang==='zh'?'移动快捷操作':'Mobile quick actions');document.body.appendChild(dock)}
      dock.setAttribute('aria-label',lang==='zh'?'移动快捷操作':'Mobile quick actions');
      names.forEach(function(name){
        var a=one('[data-dock="'+name+'"]',dock);
        if(!a){a=document.createElement('a');a.dataset.dock=name;dock.appendChild(a)}
        a.href=dockHref(name);a.innerHTML=dockIcon(name)+'<span>'+labels[name]+'</span>';a.classList.toggle('active',activeDock(name));
      });
      document.body.classList.add('hasMobileDock');
    }
    function serviceRail(){
      var products=one('#products'),grid=products&&one('.grid3',products);
      if(page()!=='services.html'||!products||!grid)return;
      var rail=one('[data-service-rail]');
      if(!rail){rail=document.createElement('nav');rail.className='mobileServiceRail';rail.dataset.serviceRail='1';rail.setAttribute('aria-label',lang==='zh'?'服务快速导航':'Service quick navigation');grid.parentNode.insertBefore(rail,grid)}
      rail.setAttribute('aria-label',lang==='zh'?'服务快速导航':'Service quick navigation');
      [['spotify','Spotify'],['netflix','Netflix'],['chatgpt','ChatGPT'],['disney','Disney+'],['hbomax','HBO Max'],['network',lang==='zh'?'VPN':'VPN']].forEach(function(item){
        var id='service-'+item[0],card=one('#'+id);if(!card)return;
        var a=one('[data-rail="'+item[0]+'"]',rail),h=one('h2',card);
        if(!a){a=document.createElement('a');a.dataset.rail=item[0];rail.appendChild(a)}
        a.href='#'+id;a.textContent=(h&&h.textContent.trim())||item[1];
      });
    }
    function railActive(){
      var rail=one('[data-service-rail]');if(!rail)return;
      var active='',best=Infinity;
      $('[id^="service-"]').forEach(function(card){var r=card.getBoundingClientRect(),score=Math.abs(r.top-130);if(r.bottom>120&&score<best){best=score;active=card.id.replace('service-','')}});
      $('[data-rail]',rail).forEach(function(a){var on=a.dataset.rail===active;a.classList.toggle('active',on);if(on&&a.scrollIntoView)a.scrollIntoView({inline:'center',block:'nearest'})});
    }
    function orderMobileBar(){
      if(page()!=='order.html')return;
      var finalPrice=one('[data-final-price]'),service=one('[data-summary-service]'),cycle=one('[data-summary-cycle]');
      if(!finalPrice||!service||!cycle)return;
      var bar=one('[data-order-mobile-bar]');
      if(!bar){bar=document.createElement('div');bar.className='orderMobileBar';bar.dataset.orderMobileBar='1';bar.innerHTML='<div class="orderMobileMeta"><span class="orderMobileService"></span><span class="orderMobileCycle"></span><b class="orderMobileAmount"></b></div><div class="orderMobileActions"><button class="orderMobilePrompt isWide" type="button" data-mobile-pay-toggle></button><div class="orderMobilePayChoices" hidden><button class="orderMobileChoice" type="button" data-mobile-pay="alipay"></button><button class="orderMobileChoice" type="button" data-mobile-pay="usdt"></button></div><button class="orderMobileSubmit" type="button" data-mobile-submit hidden></button></div>';document.body.appendChild(bar)}
      var labels=lang==='zh'?{select:'请选择支付方式',submit:'前往支付',alipay:'支付宝',usdt:'USDT',off:'9折'}:{select:'Select payment method',submit:'Go to Payment',alipay:'Alipay',usdt:'USDT',off:'10% off'};
      var chosen=bar.dataset.methodChosen||'',expanded=bar.dataset.expanded==='1';
      one('.orderMobileService',bar).textContent=service.textContent||'';
      one('.orderMobileCycle',bar).textContent=(cycle.textContent||'')+(chosen?' · '+(chosen==='usdt'?labels.usdt:labels.alipay):'');
      var amount=one('.orderMobileAmount',bar);amount.textContent=chosen?(finalPrice.textContent||''):'';amount.classList.toggle('isHidden',!chosen);
      var prompt=one('[data-mobile-pay-toggle]',bar),choices=one('.orderMobilePayChoices',bar),submit=one('[data-mobile-submit]',bar);
      prompt.textContent=chosen?(chosen==='usdt'?labels.usdt+' '+labels.off:labels.alipay):labels.select;
      prompt.classList.toggle('isWide',!chosen);
      choices.hidden=!expanded;
      submit.hidden=!chosen;
      submit.textContent=labels.submit;
      $('[data-mobile-pay]',bar).forEach(function(btn){var method=btn.dataset.mobilePay;btn.innerHTML=method==='usdt'?labels.usdt+' <small>'+labels.off+'</small>':labels.alipay;btn.classList.toggle('active',chosen===method)});
      document.body.classList.add('hasOrderBar');
      function choose(method){
        var input=one('[data-pay-method][value="'+method+'"]');
        if(input){input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}))}
        bar.dataset.methodChosen=method;bar.dataset.expanded='0';orderMobileBar();
      }
      if(!bar.dataset.watch){
        var obs=new MutationObserver(orderMobileBar);
        [finalPrice,service,cycle].forEach(function(n){obs.observe(n,{childList:true,characterData:true,subtree:true})});
        bar.addEventListener('click',function(e){
          var choice=e.target.closest('[data-mobile-pay]'),submitBtn=e.target.closest('[data-mobile-submit]');
          if(choice){choose(choice.dataset.mobilePay);return}
          if(submitBtn){var form=one('[data-order-form]');if(form&&form.requestSubmit)form.requestSubmit();else{var btn=one('.submitBtn',form);if(btn)btn.click()}return}
          if(e.target.closest('[data-mobile-pay-toggle]')||e.target.closest('.orderMobileMeta')||e.target===bar){bar.dataset.expanded=bar.dataset.expanded==='1'?'0':'1';orderMobileBar()}
        });
        bar.dataset.watch='1';
      }
    }
    function typingGuard(){
      if(document.documentElement.dataset.typingGuardBound)return;
      var initialHeight=window.innerHeight;
      function isField(el){return !!(el&&el.matches&&el.matches('input,textarea,select'))}
      function syncTyping(force){
        var active=isField(document.activeElement);
        var keyboardOpen=window.visualViewport ? (window.visualViewport.height < initialHeight - 120) : false;
        document.body.classList.toggle('isTyping', force===true || active || keyboardOpen);
      }
      document.addEventListener('focusin',function(e){if(isField(e.target))syncTyping(true)},true);
      document.addEventListener('focusout',function(){setTimeout(syncTyping,220)},true);
      document.addEventListener('input',function(e){if(isField(e.target))syncTyping(true)},true);
      window.addEventListener('resize',function(){setTimeout(syncTyping,80)},{passive:true});
      if(window.visualViewport){
        window.visualViewport.addEventListener('resize',function(){setTimeout(syncTyping,40)},{passive:true});
        window.visualViewport.addEventListener('scroll',function(){setTimeout(syncTyping,40)},{passive:true});
      }
      document.documentElement.dataset.typingGuardBound='1';
    }
    function progress(){
      var bar=one('[data-scroll-progress]');
      if(!bar){bar=document.createElement('div');bar.className='scrollProgress';bar.dataset.scrollProgress='1';bar.innerHTML='<span></span>';document.body.appendChild(bar)}
      var max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight),pct=Math.max(0,Math.min(1,window.scrollY/max))*100;
      one('span',bar).style.width=pct+'%';
    }
    mobileDock();serviceRail();railActive();orderMobileBar();typingGuard();progress();
    var header=one('.header');
    function compact(){if(header)header.classList.toggle('isScrolled',window.scrollY>18);progress();railActive()}
    if(!document.documentElement.dataset.scrollInteractionBound){window.addEventListener('scroll',compact,{passive:true});document.documentElement.dataset.scrollInteractionBound='1'}compact();
    if(motionOk&&!document.documentElement.dataset.motionInteractionBound){
      var items=$('.sectionHead,.tile,.card,.pbox,.contactPanel,.orderBox,.lookupPanel,.reviewItem,.amountPanel,.summaryList');
      items.forEach(function(el,i){el.classList.add('motionItem');el.style.transitionDelay=Math.min(i%6*45,180)+'ms'});
      if('IntersectionObserver'in window){
        var io=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('inView');io.unobserve(entry.target)}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
        items.forEach(function(el){io.observe(el)})
      }else items.forEach(function(el){el.classList.add('inView')});
      if(window.matchMedia&&window.matchMedia('(pointer:fine)').matches){
        $('.tile,.productCard').forEach(function(card){
          card.classList.add('tiltReady');
          card.addEventListener('mousemove',function(e){var r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform='translateY(-5px) rotateX('+(-y*3.5)+'deg) rotateY('+(x*3.5)+'deg)'});
          card.addEventListener('mouseleave',function(){card.style.transform=''})
        });
        var hero=one('.hero');
        if(hero)hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;hero.classList.add('isPointerActive');hero.style.setProperty('--hero-x',(x*8)+'px');hero.style.setProperty('--hero-y',(y*6)+'px')},{passive:true});
      }
      document.documentElement.dataset.motionInteractionBound='1';
    }
    if(!document.documentElement.dataset.tapInteractionBound){
      document.addEventListener('pointerdown',function(e){if(e.target.closest('input,textarea,select'))return;var card=e.target.closest('.tile,.productCard,.lookupCard,.copyContactBtn,.payTabs label,.mobileDock a,.cta,.ghostCta,.submitBtn');if(card)card.classList.add('touchActive')},{passive:true});
      ['pointerup','pointercancel','pointerleave'].forEach(function(type){document.addEventListener(type,function(){ $('.touchActive').forEach(function(el){el.classList.remove('touchActive')})},{passive:true})});
      document.addEventListener('click',function(e){
      var target=e.target.closest('.nav a,.drawer nav a,.copyContactBtn,.cta,.ghostCta,.submitBtn,.lookupForm button,.lookupCopyBtn,.lookupDetailBtn,.payTabs label,.mobileDock a');
      if(!target)return;
      if(target.dataset&&target.dataset.dock==='lookup'&&page()==='index.html'){
        e.preventDefault();
        if(location.hash!=='#orderLookup')history.replaceState(null,'','#orderLookup');
        scrollLookupTarget();
      }
      var r=target.getBoundingClientRect(),d=Math.max(r.width,r.height)*1.8,span=document.createElement('span');
      span.className='tapRipple';span.style.width=d+'px';span.style.height=d+'px';span.style.left=(e.clientX-r.left)+'px';span.style.top=(e.clientY-r.top)+'px';
      target.appendChild(span);setTimeout(function(){span.remove()},650);
      if(target.closest('.mobileDock')){target.classList.add('dockPulse');setTimeout(function(){target.classList.remove('dockPulse')},420)}
      },true);
      document.documentElement.dataset.tapInteractionBound='1';
    }
    if(page()==='index.html'&&location.hash==='#orderLookup')setTimeout(scrollLookupTarget,80);
    if(!document.documentElement.dataset.hashInteractionBound){window.addEventListener('hashchange',function(){interactions()});document.documentElement.dataset.hashInteractionBound='1'}
  }
  style();contactsUI();addCards();setupServiceAnchors();images();toggles();translate();interactions();scrollToServiceHash();setTimeout(function(){setupServiceAnchors();translate();scrollToServiceHash()},0);window.addEventListener('load',function(){setupServiceAnchors();translate();interactions();scrollToServiceHash()});document.addEventListener('change',function(e){if(e.target.matches('[data-service],[data-plan],[data-pay-method]'))setTimeout(translate,0)},true);
  var burger=one('[data-burger]'),drawer=one('[data-drawer]'),closeBtn=one('[data-drawer-close]');function open(){if(drawer)drawer.style.display='flex'}function close(){if(drawer)drawer.style.display='none'}if(burger)burger.onclick=open;if(closeBtn)closeBtn.onclick=close;if(drawer)drawer.onclick=function(e){if(e.target===drawer)close()};var top=one('[data-top]');function scroll(){if(top)top.style.display=window.scrollY>350?'flex':'none'}window.addEventListener('scroll',scroll,{passive:true});scroll();if(top)top.onclick=function(){window.scrollTo({top:0,behavior:'smooth'})};
})();
