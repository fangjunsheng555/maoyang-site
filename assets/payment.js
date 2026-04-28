(function(){
  const DEFAULT_USDT_ADDRESS = 'TDoUMF4nF244o5GZvBBwX5t9axvnSoP1Cm';
  const config = window.MAOYANG_PAYMENT || {};
  const payload = readPendingOrder();

  const originalPrice = document.querySelector('[data-original-price]');
  const finalPrice = document.querySelector('[data-final-price]');
  const paymentMethod = document.querySelector('[data-payment-method]');
  const rateNote = document.querySelector('[data-rate-note]');
  const serviceLabel = document.querySelector('[data-service-label]');
  const cycle = document.querySelector('[data-cycle]');
  const contact = document.querySelector('[data-contact]');
  const detailList = document.querySelector('.detailList');
  const paymentTitle = document.querySelector('[data-payment-title]');
  const paymentTag = document.querySelector('[data-payment-tag]');
  const alipayPayment = document.querySelector('[data-alipay-payment]');
  const usdtPayment = document.querySelector('[data-usdt-payment]');
  const alipayQr = document.querySelector('[data-alipay-qr]');
  const alipayEmpty = document.querySelector('[data-alipay-empty]');
  const usdtQr = document.querySelector('[data-usdt-qr]');
  const usdtEmpty = document.querySelector('[data-usdt-empty]');
  const usdtNetwork = document.querySelector('[data-usdt-network]');
  const usdtAddress = document.querySelector('[data-usdt-address]');
  const copyWallet = document.querySelector('[data-copy-wallet]');
  const finishBtn = document.querySelector('[data-finish-payment]');
  const statusBox = document.querySelector('[data-status]');

  function readPendingOrder(){
    try{
      return JSON.parse(sessionStorage.getItem('maoyangPendingOrder') || 'null');
    }catch(error){
      return null;
    }
  }

  function credentialMode(order){
    if(!order) return 'accountPassword';
    if(order.service === 'netflix') return 'none';
    if(order.service === 'network') return 'username';
    return 'accountPassword';
  }

  function validUsername(value){
    return /^[A-Za-z0-9]{3,10}$/.test(String(value || '').trim());
  }

  function hasRequiredOrderInfo(order){
    const mode = credentialMode(order);
    if(!order || !order.contact) return false;
    if(mode === 'username' && !validUsername(order.account)) return false;
    if(mode === 'accountPassword' && (!order.account || !order.password)) return false;
    return true;
  }

  function money(value){
    const n = Number(value || 0);
    return '￥' + (Number.isInteger(n) ? n : n.toFixed(2));
  }

  function usdtMoney(value){
    return Number(value || 0).toFixed(2) + ' USDT';
  }

  function setStatus(text, warn){
    statusBox.textContent = text;
    statusBox.classList.toggle('warn', !!warn);
    statusBox.classList.add('show');
  }

  function setNetworkSuccess(orderId){
    const username = String(payload.account || '').trim();
    const encoded = encodeURIComponent(username);
    const shadowrocket = 'https://hk.joinvip.vip:2056/sub/' + encoded;
    const clash = 'https://hk.joinvip.vip:2056/sub/' + encoded + '?format=clash';

    statusBox.classList.remove('warn');
    statusBox.classList.add('show');
    statusBox.textContent = '';

    const message = document.createElement('div');
    message.textContent = '订单已提交成功，订阅链接将在30分钟内可用，请耐心等待，如有疑问请联系我们的在线客服';
    const idLine = document.createElement('div');
    idLine.textContent = '订单号：' + orderId;
    const shadowLine = document.createElement('div');
    shadowLine.textContent = 'shadowrocket:';
    const shadowLink = document.createElement('a');
    shadowLink.href = shadowrocket;
    shadowLink.textContent = shadowrocket;
    shadowLink.target = '_blank';
    shadowLink.rel = 'noopener';
    const clashLine = document.createElement('div');
    clashLine.textContent = 'clash订阅:';
    const clashLink = document.createElement('a');
    clashLink.href = clash;
    clashLink.textContent = clash;
    clashLink.target = '_blank';
    clashLink.rel = 'noopener';

    [message, idLine, shadowLine, shadowLink, clashLine, clashLink].forEach((item) => statusBox.appendChild(item));
  }

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

  function syncQr(img, empty, src){
    if(src){
      img.src = src;
      img.hidden = false;
      empty.hidden = true;
    }else{
      img.hidden = true;
      empty.hidden = false;
    }
  }

  function renderMissingOrder(){
    if(finishBtn) finishBtn.disabled = true;
    if(alipayPayment) alipayPayment.hidden = true;
    if(usdtPayment) usdtPayment.hidden = true;
    setStatus('订单信息已失效，请返回重新下单。', true);
  }

  function renderUsernameDetail(){
    if(!detailList || !payload || payload.service !== 'network') return;
    if(detailList.querySelector('[data-username-detail]')) return;

    const item = document.createElement('div');
    item.className = 'detailItem';
    item.dataset.usernameDetail = 'true';
    const label = document.createElement('span');
    label.textContent = '用户名';
    const value = document.createElement('b');
    value.textContent = payload.account || '--';
    item.append(label, value);
    const contactItem = contact ? contact.closest('.detailItem') : null;
    detailList.insertBefore(item, contactItem || null);
  }

  function renderOrder(){
    if(!hasRequiredOrderInfo(payload)){
      renderMissingOrder();
      return;
    }

    const isUsdt = payload.paymentMethod === 'usdt';
    originalPrice.textContent = payload.originalAmount ? money(payload.originalAmount) : '客服报价';
    finalPrice.textContent = isUsdt ? usdtMoney(payload.finalAmount) : money(payload.finalAmount);
    paymentMethod.textContent = isUsdt ? 'USDT' : '支付宝';
    serviceLabel.textContent = payload.serviceLabel || '--';
    cycle.textContent = payload.cycle || '--';
    contact.textContent = payload.contact || '--';
    renderUsernameDetail();

    if(isUsdt){
      paymentTitle.textContent = 'USDT 扫码付款';
      paymentTag.textContent = 'TRC20';
      alipayPayment.hidden = true;
      usdtPayment.hidden = false;
      usdtNetwork.textContent = config.usdtNetwork || 'TRC20';
      usdtAddress.textContent = config.usdtAddress || DEFAULT_USDT_ADDRESS;
      syncQr(usdtQr, usdtEmpty, config.usdtQr);
      rateNote.hidden = false;
      rateNote.textContent = '折后人民币 ' + money(payload.discountedCnyAmount) + '，按 ' + Number(payload.exchangeRate || 6.85).toFixed(2) + ' 汇率折算。';
    }else{
      paymentTitle.textContent = '支付宝扫码付款';
      paymentTag.textContent = 'RMB';
      alipayPayment.hidden = false;
      usdtPayment.hidden = true;
      syncQr(alipayQr, alipayEmpty, config.alipayQr);
      rateNote.hidden = true;
      rateNote.textContent = '';
    }
  }

  if(copyWallet){
    copyWallet.addEventListener('click', async () => {
      const address = config.usdtAddress || DEFAULT_USDT_ADDRESS;
      await copyText(address);
      copyWallet.textContent = '已复制';
      setTimeout(() => { copyWallet.textContent = '复制地址'; }, 1600);
    });
  }

  if(finishBtn){
    finishBtn.addEventListener('click', async () => {
      if(!payload || finishBtn.disabled) return;
      finishBtn.disabled = true;
      finishBtn.textContent = '正在提交订单';
      try{
        const response = await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if(!response.ok || !result.ok) throw new Error(result.error || 'submit_failed');
        sessionStorage.removeItem('maoyangPendingOrder');
        if(payload.service === 'network'){
          setNetworkSuccess(result.orderId);
        }else{
          setStatus('订单已提交成功，预计在30分钟内完成会员订阅，请耐心等待，如有疑问请联系我们的在线客服\n订单号：' + result.orderId, false);
        }
        finishBtn.textContent = '已提交订单';
      }catch(error){
        finishBtn.disabled = false;
        finishBtn.textContent = '已完成付款';
        setStatus('订单提交失败，请联系在线客服。', true);
      }
    });
  }

  renderOrder();
})();
