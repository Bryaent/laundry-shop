fetch("../PHP/account.php")
  .then(response => response.json())
  .then(data => {
    console.log(data);

    if (data.status === "success") {
      document.getElementById("customerName").textContent = data.fullname;
      document.getElementById("customerEmail").textContent = data.email;
      document.getElementById("customerPassword").textContent = data.password;
    } else {
      alert("Please login first.");
      window.location.href = "../HTML/login.html";
    }
  })
  .catch(error => {
    console.error(error);
    alert("Error loading account information.");
  });
  // ================================================
// ORDER TABS
// ================================================
function switchOrderTab(tab) {
  const infoItems  = ['infoGrid', 'action-row-items'];
  const histPanel  = document.getElementById('orderHistoryPanel');
  const tabInfo    = document.getElementById('tabInfo');
  const tabOrders  = document.getElementById('tabOrders');

  // toggle grid and action row visibility
  const grid       = document.getElementById('infoGrid');
  const actionRow  = document.querySelector('.action-row');
  const pwCard     = document.getElementById('passwordCard');

  if (tab === 'orders') {
    if (grid)      grid.classList.add('hidden');
    if (actionRow) actionRow.classList.add('hidden');
    if (pwCard)    pwCard.classList.add('hidden');
    if (histPanel) histPanel.classList.remove('hidden');
    tabInfo.classList.remove('active-order-tab');
    tabOrders.classList.add('active-order-tab');
    loadOrderHistory();
  } else {
    if (grid)      grid.classList.remove('hidden');
    if (actionRow) actionRow.classList.remove('hidden');
    if (histPanel) histPanel.classList.add('hidden');
    tabInfo.classList.add('active-order-tab');
    tabOrders.classList.remove('active-order-tab');
  }
}

// ================================================
// LOAD ORDER HISTORY
// ================================================
function loadOrderHistory() {
  const list = document.getElementById('orderHistoryList');
  if (!list) return;

  const user   = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const userName = (user.fullname || user.name || '').toLowerCase().trim();

  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');

  // Match orders by name (case-insensitive)
  const myOrders = allOrders.filter(o =>
    (o.name || '').toLowerCase().trim() === userName
  );

  if (!myOrders.length) {
    list.innerHTML = `
      <div class="no-orders-msg">
        <i class="fas fa-tshirt" style="font-size:32px;color:#c8d8f0;display:block;margin-bottom:10px;"></i>
        No orders found. <a href="../HTML/booknow.html" style="color:#0077cc;font-weight:700;">Book your first laundry!</a>
      </div>`;
    return;
  }

  // Sort newest first
  const sorted = myOrders.slice().sort((a, b) =>
    new Date(b.date || 0) - new Date(a.date || 0)
  );

  const statusClass = s => {
    const m = { 'Pending':'pending','In Progress':'inprogress','Ready':'ready',
                'Completed':'completed','Received':'received' };
    return 'status-' + (m[s] || 'pending');
  };

  list.innerHTML = sorted.map(o => `
    <div class="order-card">
      <div>
        <div class="order-card-ticket"># ${o.ticket || '—'}</div>
        <div class="order-card-service">${o.service || 'Laundry Service'}</div>
        <div class="order-card-meta">
          <span><i class="fas fa-soap"></i> ${o.soap || '—'}</span>
          <span><i class="fas fa-spray-can"></i> ${o.fabcon || '—'}</span>
          <span><i class="fas fa-truck"></i> ${o.pickupType || 'Store Pickup'}</span>
          ${o.date ? `<span><i class="fas fa-calendar"></i> ${new Date(o.date).toLocaleDateString('en-PH', {month:'short',day:'numeric',year:'numeric'})}</span>` : ''}
        </div>
      </div>
      <div class="order-card-right">
        <div class="order-card-amount">₱${Number(o.amount || 0).toLocaleString()}</div>
        <div class="order-card-status ${statusClass(o.status || 'Pending')}">${o.status || 'Pending'}</div>
      </div>
      <div class="order-card-track">
        <a href="../HTML/tracklaundry.html?ticket=${o.ticket}">
          <i class="fas fa-search"></i> Track this order
        </a>
      </div>
    </div>
  `).join('');
}