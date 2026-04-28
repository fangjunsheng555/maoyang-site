(function(){
  const form = document.querySelector('[data-admin-form]');
  const keyInput = document.querySelector('[data-admin-key]');
  const statusBox = document.querySelector('[data-admin-status]');
  const tableBody = document.querySelector('[data-order-rows]');
  const emptyState = document.querySelector('[data-empty-state]');
  if(!form || !keyInput || !statusBox || !tableBody) return;

  function setStatus(text, warn){
    statusBox.textContent = text;
    statusBox.classList.toggle('warn', !!warn);
    statusBox.hidden = !text;
  }

  function safe(value){
    return String(value || '');
  }

  function amount(order){
    if(order.paymentMethod === 'usdt') return safe(order.finalAmount) + ' USDT';
    return '￥' + safe(order.finalAmount);
  }

  function render(orders){
    tableBody.innerHTML = '';
    emptyState.hidden = orders.length > 0;
    orders.forEach((order) => {
      const tr = document.createElement('tr');
      const values = [
        order.createdAt ? new Date(order.createdAt).toLocaleString('zh-CN') : '',
        order.orderId,
        order.serviceLabel,
        order.paymentMethod === 'usdt' ? 'USDT' : '支付宝',
        amount(order),
        order.account,
        order.password,
        order.contact,
        order.remark || '无'
      ];
      values.forEach((value) => {
        const td = document.createElement('td');
        td.textContent = safe(value);
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }

  async function loadOrders(key){
    setStatus('正在读取订单...', false);
    const response = await fetch('/api/orders', { headers: { 'x-admin-key': key } });
    const data = await response.json();
    if(!response.ok || !data.ok){
      throw new Error(data.error || '读取失败');
    }
    if(!data.configured){
      render([]);
      setStatus('订单存储尚未连接。', true);
      return;
    }
    render(data.orders || []);
    setStatus('已读取 ' + (data.orders || []).length + ' 条订单。', false);
  }

  const savedKey = sessionStorage.getItem('maoyangAdminKey');
  if(savedKey) keyInput.value = savedKey;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const key = keyInput.value.trim();
    if(!key){
      setStatus('请输入管理密钥。', true);
      return;
    }
    sessionStorage.setItem('maoyangAdminKey', key);
    try{
      await loadOrders(key);
    }catch(error){
      render([]);
      setStatus('读取失败，请检查管理密钥和存储配置。', true);
    }
  });
})();
