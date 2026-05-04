(function(){
  const STORAGE_KEY = 'maoyangCartV2';
  const EVENT_NAME = 'maoyang:cart-update';

  const PRODUCTS = {
    spotify:  { key:'spotify',  label:'Spotify Premium', subtitle:'欧美日高价区家庭计划', amount:128, cycle:'1年', monthly:'≈¥10.7/月', original:298, badge:'热销 No.1', highlights:['无损音质·完整曲库','播客 / AIDJ / 离线下载','支持家庭组邀请'], desc:'欧美日高价区家庭计划，无损音质、播客、离线下载与完整曲库。', soldThisMonth:1328, needsAccountPassword:true, image:'assets/img/product-spotify.jpg', accent:'#1db954' },
    netflix:  { key:'netflix',  label:'Netflix Premium', subtitle:'4K 杜比 · 一人独立车位', amount:168, cycle:'1年', monthly:'≈¥14/月',   original:398, badge:'影视首选', highlights:['4K 杜比顶规套餐','独立车位绝不被踢','支持离线下载'], desc:'4K 杜比套餐，一人一个独立车位，4K 画质、杜比音效、离线下载与位置上锁。', soldThisMonth:956, image:'assets/img/product-netflix.jpg', accent:'#e50914' },
    disney:   { key:'disney',   label:'Disney+',         subtitle:'4 人车 · 全球可用 4K',  amount:108, cycle:'1年', monthly:'≈¥9/月',    original:268, badge:'性价比之选', highlights:['4K 杜比顶规','位置上锁不超售','全球可用不限地区'], desc:'4 人车绝不超售，全球可用 4K 杜比套餐，独立车位互不干扰。', soldThisMonth:612, image:'assets/img/product-disney.jpg', accent:'#0072d2' },
    hbomax:   { key:'hbomax',   label:'HBO Max',         subtitle:'4 人车 · 全球可用 4K',  amount:148, cycle:'1年', monthly:'≈¥12.3/月', original:348, badge:'影迷最爱', highlights:['4K 杜比顶规','全球可用','实时售后保障'], desc:'4 人车全球可用 4K 杜比套餐，一人独享一位置互不干扰。', soldThisMonth:487, image:'assets/img/product-hbomax.jpg', accent:'#7e22ce' },
    chatgpt:  { key:'chatgpt',  label:'ChatGPT Plus',    subtitle:'独享账户 · 含低风险线路', amount:75,  cycle:'1月', monthly:'¥75/月',     original:158, badge:'AI 必备', highlights:['账户单独使用','GPT 5.5+ / codeX','赠送企业专线 IP'], desc:'账户独立使用，避免 IP 拥挤导致模型降智，赠送低风险企业专线。', soldThisMonth:842, needsAccountPassword:true, image:'assets/img/product-chatgpt.jpg', accent:'#10a37f' },
    network:  { key:'network',  label:'网络节点服务',     subtitle:'不限设备 · 不限流量 · 5Gbps', amount:99, cycle:'1年', monthly:'≈¥8.3/月', original:218, badge:'必备工具', highlights:['多大厂线路港日台美英德','解锁全球流媒体/AI/社交','全加密无日志 24×7'], desc:'大厂机房多线路，最高 5Gbps，不限设备不限流量，解锁全球平台。', soldThisMonth:1580, needsUsername:true, image:'assets/img/product-network.jpg', accent:'#0f766e' }
  };

  const PRODUCT_KEYS = ['spotify','netflix','disney','hbomax','chatgpt','network'];

  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return [];
      const parsed = JSON.parse(raw);
      if(!Array.isArray(parsed)) return [];
      return parsed.filter((k)=>typeof k==='string' && PRODUCTS[k]);
    }catch(e){ return []; }
  }
  function save(list){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent(EVENT_NAME,{detail:{cart:list.slice()}}));
    }catch(e){}
  }
  function get(){ return load(); }
  function items(){ return load().map((k)=>PRODUCTS[k]).filter(Boolean); }
  function has(key){ return load().indexOf(key) >= 0; }
  function add(key){
    if(!PRODUCTS[key]) return;
    const list = load();
    if(list.indexOf(key) >= 0) return;
    list.push(key); save(list);
  }
  function remove(key){
    const list = load().filter((k)=>k!==key);
    save(list);
  }
  function toggle(key){
    has(key) ? remove(key) : add(key);
  }
  function clear(){ save([]); }
  function bundleRate(count){
    if(count >= 3) return 0.10;
    if(count === 2) return 0.05;
    return 0;
  }
  function bundleLabel(count){
    if(count >= 3) return '3 件起 · 9 折';
    if(count === 2) return '2 件 · 9.5 折';
    return '';
  }
  function subtotal(list){
    return (list || items()).reduce((s,p)=>s+(p?p.amount:0),0);
  }
  function finalCny(list){
    const arr = list || items();
    return Math.round(subtotal(arr) * (1 - bundleRate(arr.length)));
  }
  function usdtRate(){
    const cfg = window.MAOYANG_PAYMENT || {};
    return Number(cfg.usdtRateCnyPerUsdt || 6.85);
  }
  function usdtDiscount(){
    const cfg = window.MAOYANG_PAYMENT || {};
    return Number(cfg.usdtDiscount || 0.9);
  }
  function finalUsdt(list){
    const cny = finalCny(list);
    return Math.round((cny * usdtDiscount() / usdtRate()) * 100) / 100;
  }

  function on(handler){
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', (e)=>{ if(e.key===STORAGE_KEY) handler(); });
  }

  window.MAOYANG_CART = {
    PRODUCTS, PRODUCT_KEYS,
    get, items, has, add, remove, toggle, clear,
    bundleRate, bundleLabel, subtotal, finalCny, finalUsdt,
    usdtRate, usdtDiscount, on
  };
})();
