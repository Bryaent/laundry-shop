const ordersTable          = document.querySelector("#ordersBody");
const completedOrdersTable = document.querySelector("#completedOrdersBody");

let orders = [];

// ══════════════════════════════════════════════════════
// COMPLETE LOCK — order must pass through "Ready" first
// ══════════════════════════════════════════════════════
function canComplete(order) {
  return order.wasReady === true;
}

// ══════════════════════════════════════════════════════
// STATUS FILTER STATE
// ══════════════════════════════════════════════════════
let activeStatusFilter = 'All';

// ══════════════════════════════════════════════════════
// COMPLETED ORDERS PAGINATION STATE
// ══════════════════════════════════════════════════════
let completedPage        = 1;
const COMPLETED_PER_PAGE = 10;

// ══════════════════════════════════════════════════════
// LOAD ORDERS + LIVE POLLING
// ══════════════════════════════════════════════════════
function loadOrders() {
  fetch('http://localhost:3000/laundry-shop/FINALWEBSITE/PHP/orders.php')
    .then(res => res.json())
    .then(data => {
      orders = data.map(serverOrder => {
        const local = orders.find(o => o.id === serverOrder.id || o.ticket === serverOrder.ticket);
        return {
          ...serverOrder,
          status:        serverOrder.status   || 'Pending',
          wasReady:      local ? local.wasReady      : (serverOrder.wasReady === true),
          completedDate: local ? local.completedDate : serverOrder.completedDate,
          month:         local ? local.month         : serverOrder.month,
          year:          local ? local.year          : serverOrder.year,
          day:           local ? local.day           : serverOrder.day,
        };
      });
      renderOrders();
      renderRevenueChart();
      refreshPaymentsIfActive();
    })
    .catch(() => {
      const saved = JSON.parse(localStorage.getItem('orders') || '[]');
      // Merge: preserve in-memory status fields for existing orders
      saved.forEach(savedOrder => {
        const exists = orders.find(o => o.ticket === savedOrder.ticket);
        if (!exists) {
          orders.push({ ...savedOrder, status: savedOrder.status || 'Pending', wasReady: savedOrder.wasReady === true });
        }
      });
      renderOrders();
      renderRevenueChart();
      refreshPaymentsIfActive();
    });
}

loadOrders();
setInterval(loadOrders, 5000);

// ── Also re-render when BookNow deducts stocks ──
window.addEventListener('stocksUpdated', () => {
  if (document.getElementById('settings')?.classList.contains('active-tab')) {
    loadSavedPricing();
  }
});

function refreshPaymentsIfActive() {
  const payTab = document.getElementById('payments');
  if (payTab && payTab.classList.contains('active-tab')) {
    renderPaymentsTab();
  }
}

// ══════════════════════════════════════════════════════
// STATUS FILTER BAR
// ══════════════════════════════════════════════════════
function renderStatusFilterBar() {
  const existing = document.getElementById('statusFilterBar');
  if (existing) return;

  const liveSection = document.querySelector('#orders .table-section');
  if (!liveSection) return;

  const statuses = ['All', 'Pending', 'Received', 'In Progress', 'Ready'];
  const bar = document.createElement('div');
  bar.id = 'statusFilterBar';
  bar.style.cssText = `
    display:flex;align-items:center;gap:10px;flex-wrap:wrap;
    margin-bottom:18px;padding:14px 18px;
    background:#fff;border-radius:14px;
    border:1.5px solid rgba(0,100,200,0.12);
    box-shadow:0 2px 10px rgba(0,50,120,0.06);
  `;

  const label = document.createElement('span');
  label.textContent = 'Filter by Status:';
  label.style.cssText = 'font-size:12px;font-weight:800;color:#5a7194;text-transform:uppercase;letter-spacing:0.1em;margin-right:4px;';
  bar.appendChild(label);

  statuses.forEach(status => {
    const btn = document.createElement('button');
    btn.textContent = status;
    btn.dataset.status = status;
    btn.className = 'status-filter-btn' + (status === activeStatusFilter ? ' sf-active' : '');
    btn.style.cssText = getFilterBtnStyle(status, status === activeStatusFilter);
    btn.onclick = () => {
      activeStatusFilter = status;
      document.querySelectorAll('.status-filter-btn').forEach(b => {
        const s = b.dataset.status;
        b.className = 'status-filter-btn' + (s === status ? ' sf-active' : '');
        b.style.cssText = getFilterBtnStyle(s, s === status);
      });
      renderOrders();
    };
    bar.appendChild(btn);
  });

  liveSection.insertBefore(bar, liveSection.querySelector('.section-header').nextSibling);
}

function getFilterBtnStyle(status, active) {
  const colorMap = {
    'All':         { bg: '#0077cc', shadow: 'rgba(0,119,204,0.3)' },
    'Pending':     { bg: '#f59e0b', shadow: 'rgba(245,158,11,0.3)' },
    'Received':    { bg: '#6366f1', shadow: 'rgba(99,102,241,0.3)' },
    'In Progress': { bg: '#3b82f6', shadow: 'rgba(59,130,246,0.3)' },
    'Ready':       { bg: '#10b981', shadow: 'rgba(16,185,129,0.3)' }
  };
  const c = colorMap[status] || colorMap['All'];
  if (active) {
    return `padding:7px 18px;border-radius:30px;border:none;cursor:pointer;
            font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;
            background:${c.bg};color:#fff;box-shadow:0 0 14px ${c.shadow};transition:0.2s;font-family:inherit;`;
  }
  return `padding:7px 18px;border-radius:30px;border:1.5px solid rgba(0,100,200,0.2);cursor:pointer;
          font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;
          background:#f0f6ff;color:#5a7194;transition:0.2s;font-family:inherit;`;
}

// ══════════════════════════════════════════════════════
// RENDER ORDERS
// ══════════════════════════════════════════════════════
function renderOrders() {
  if (!ordersTable || !completedOrdersTable) return;

  renderStatusFilterBar();

  ordersTable.innerHTML          = '';
  completedOrdersTable.innerHTML = '';

  const totalOrders    = orders.length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const pendingCount   = orders.filter(o => o.status === 'Pending').length;
  const inProgressCount = orders.filter(o => o.status === 'In Progress').length;
  const readyCount     = orders.filter(o => o.status === 'Ready').length;
  const receivedCount  = orders.filter(o => o.status === 'Received').length;
  const totalRevenue   = orders
    .filter(o => o.status === 'Completed')
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  // ── Update overview dashboard cards ──
  const el = id => document.getElementById(id);
  if (el('card-total-orders'))  el('card-total-orders').innerText  = totalOrders;
  if (el('card-completed'))     el('card-completed').innerText     = completedCount;
  if (el('card-pending'))       el('card-pending').innerText       = pendingCount;
  if (el('card-total-revenue')) el('card-total-revenue').innerText = `₱${totalRevenue.toLocaleString()}`;

  // ── Update extra info sub-labels if they exist ──
  if (el('card-orders-sub'))   el('card-orders-sub').innerText   = `${completedCount} completed · ${pendingCount} pending`;
  if (el('card-revenue-sub'))  el('card-revenue-sub').innerText  = `From ${completedCount} completed order${completedCount !== 1 ? 's' : ''}`;
  if (el('card-pending-sub'))  el('card-pending-sub').innerText  = `${inProgressCount} in progress · ${readyCount} ready`;
  if (el('card-completed-sub')) el('card-completed-sub').innerText = `${receivedCount} received · ${completedCount} done`;

  updateRevenueSummaryCards();

  let hasLive = false;

  orders.forEach((o, i) => {
    if (o.status === 'Completed') return;

    const currentStatus = o.status || 'Pending';
    if (activeStatusFilter !== 'All' && currentStatus !== activeStatusFilter) return;

    hasLive = true;
    const tr          = document.createElement('tr');
    const pickup      = o.pickupType || o.delivery || 'Store Pickup';
    const statusClass = currentStatus.toLowerCase().replace(/\s+/g, '');

    // ─────────────────────────────────────────────────────────
    // FIX: Order status buttons — each button calls updateStatus
    // directly with onclick. All four buttons are always rendered
    // but only the logically valid next-step button is highlighted.
    // Complete is locked until wasReady === true.
    // ─────────────────────────────────────────────────────────
    const completeLocked = canComplete(o) ? '' : 'disabled title="Mark Ready first before completing"';

    tr.innerHTML = `
      <td><input type="checkbox" class="select-checkbox order-checkbox" data-index="${i}"></td>
      <td>${o.ticket  || ''}</td>
      <td>${o.name    || ''}</td>
      <td>${o.contact || 'N/A'}</td>
      <td>${o.service || ''}</td>
      <td>₱${Number(o.amount || 0).toLocaleString()}</td>
      <td><span class="status ${statusClass}">${currentStatus}</span></td>
      <td>${pickup}</td>
      <td>
        <button class="action-btn received-btn"  onclick="updateStatus(${i},'Received')">Received</button>
        <button class="action-btn progress-btn"  onclick="updateStatus(${i},'In Progress')">In Progress</button>
        <button class="action-btn ready-btn"     onclick="updateStatus(${i},'Ready')">Ready</button>
        <button class="action-btn complete-btn"  onclick="updateStatus(${i},'Completed')" ${completeLocked}>Complete</button>
        <button class="action-btn delete-btn"    onclick="deleteOrder(${i})">Delete</button>
      </td>
    `;
    ordersTable.appendChild(tr);
  });

  if (!hasLive) {
    const msg = activeStatusFilter !== 'All'
      ? `No orders with status "${activeStatusFilter}"`
      : 'No live orders';
    ordersTable.innerHTML = `
      <tr><td colspan="9" style="text-align:center;padding:30px;color:#64748b;">${msg}</td></tr>`;
  }

  renderCompletedOrders();
  localStorage.setItem('orders', JSON.stringify(orders));
  setupSelectAll();
  refreshPaymentsIfActive();
}

// ══════════════════════════════════════════════════════
// RENDER COMPLETED ORDERS (paginated + alphabetical)
// ══════════════════════════════════════════════════════
function renderCompletedOrders() {
  if (!completedOrdersTable) return;
  completedOrdersTable.innerHTML = '';

  const completedOrders = orders
    .map((o, i) => ({ ...o, _realIdx: i }))
    .filter(o => o.status === 'Completed')
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const totalPages = Math.max(1, Math.ceil(completedOrders.length / COMPLETED_PER_PAGE));
  if (completedPage > totalPages) completedPage = totalPages;
  if (completedPage < 1) completedPage = 1;

  const start     = (completedPage - 1) * COMPLETED_PER_PAGE;
  const pageItems = completedOrders.slice(start, start + COMPLETED_PER_PAGE);

  if (!completedOrders.length) {
    completedOrdersTable.innerHTML = `
      <tr><td colspan="8" style="text-align:center;padding:30px;color:#64748b;">No completed orders</td></tr>`;
    removePagination();
    return;
  }

  pageItems.forEach(o => {
    const tr     = document.createElement('tr');
    const pickup = o.pickupType || o.delivery || 'Store Pickup';
    tr.innerHTML = `
      <td>${o.ticket  || ''}</td>
      <td>${o.name    || ''}</td>
      <td>${o.contact || 'N/A'}</td>
      <td>${o.service || ''}</td>
      <td>₱${Number(o.amount || 0).toLocaleString()}</td>
      <td><span class="status completed">Completed</span></td>
      <td>${pickup}</td>
      <td>
        <button class="action-btn delete-btn icon-only-btn" title="Delete order" onclick="deleteCompletedOrder(${o._realIdx})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    completedOrdersTable.appendChild(tr);
  });

  renderPagination(completedPage, totalPages, completedOrders.length);
}

// ══════════════════════════════════════════════════════
// PAGINATION CONTROLS
// ══════════════════════════════════════════════════════
function renderPagination(current, total, totalItems) {
  removePagination();

  const sections = document.querySelectorAll('#orders .table-section');
  const completedSection = sections[sections.length - 1];
  if (!completedSection) return;

  const wrap = document.createElement('div');
  wrap.id = 'completedPagination';
  wrap.className = 'pagination-wrap';

  const info = document.createElement('span');
  info.className = 'pagination-info';
  const start = (current - 1) * COMPLETED_PER_PAGE + 1;
  const end   = Math.min(current * COMPLETED_PER_PAGE, totalItems);
  info.innerHTML = `<i class="fa-solid fa-list-check"></i> Showing ${start}–${end} of ${totalItems} completed orders`;

  const controls = document.createElement('div');
  controls.className = 'pagination-controls';

  const prev = document.createElement('button');
  prev.className = current === 1 ? 'page-btn page-btn-disabled' : 'page-btn';
  prev.disabled  = current === 1;
  prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  prev.onclick   = () => { if (current > 1) { completedPage--; renderCompletedOrders(); } };

  const pages = document.createElement('div');
  pages.className = 'page-numbers';

  let startPage = Math.max(1, current - 2);
  let endPage   = Math.min(total, startPage + 4);
  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

  for (let p = startPage; p <= endPage; p++) {
    const btn = document.createElement('button');
    btn.className   = p === current ? 'page-btn page-btn-active' : 'page-btn';
    btn.textContent = p;
    btn.onclick = ((_p) => () => { completedPage = _p; renderCompletedOrders(); })(p);
    pages.appendChild(btn);
  }

  const next = document.createElement('button');
  next.className = current === total ? 'page-btn page-btn-disabled' : 'page-btn';
  next.disabled  = current === total;
  next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  next.onclick   = () => { if (current < total) { completedPage++; renderCompletedOrders(); } };

  controls.appendChild(prev);
  controls.appendChild(pages);
  controls.appendChild(next);

  wrap.appendChild(info);
  wrap.appendChild(controls);
  completedSection.appendChild(wrap);
}

function removePagination() {
  const old = document.getElementById('completedPagination');
  if (old) old.remove();
}

// ══════════════════════════════════════════════════════
// UPDATE STATUS — FIX: saves to localStorage immediately
// so status persists between polling cycles
// ══════════════════════════════════════════════════════
function updateStatus(i, status) {
  const order = orders[i];
  if (!order) return;

  // Must go through Ready before Complete
  if (status === 'Ready')     order.wasReady = true;
  if (status === 'Completed' && !canComplete(order)) {
    alert('Please mark the order as Ready before completing it.');
    return;
  }

  order.status = status;

  if (status === 'Completed') {
    const now           = new Date();
    order.completedDate = now.toISOString();
    order.month         = now.getMonth();
    order.year          = now.getFullYear();
    order.day           = now.toDateString();
    completedPage       = 1;
  }

  // ── FIX: save immediately so polling doesn't overwrite ──
  localStorage.setItem('orders', JSON.stringify(orders));
  renderOrders();
  renderRevenueChart();
}

// ══════════════════════════════════════════════════════
// DELETE — LIVE ORDER
// ══════════════════════════════════════════════════════
function deleteOrder(i) {
  if (!confirm('Delete this order?')) return;
  orders.splice(i, 1);
  localStorage.setItem('orders', JSON.stringify(orders));
  renderOrders();
  renderRevenueChart();
}

// ══════════════════════════════════════════════════════
// DELETE — COMPLETED ORDER
// ══════════════════════════════════════════════════════
function deleteCompletedOrder(i) {
  const order = orders[i];
  if (!order) return;
  const amount = Number(order.amount || 0);
  const name   = order.name || 'this customer';
  if (!confirm(
    `Delete completed order ni ${name}?\n\n` +
    `Mababawas ang ₱${amount.toLocaleString()} sa total revenue.`
  )) return;

  orders.splice(i, 1);
  localStorage.setItem('orders', JSON.stringify(orders));

  const remaining  = orders.filter(o => o.status === 'Completed').length;
  const totalPages = Math.max(1, Math.ceil(remaining / COMPLETED_PER_PAGE));
  if (completedPage > totalPages) completedPage = totalPages;

  renderOrders();
  renderRevenueChart();
}

// ══════════════════════════════════════════════════════
// SELECT ALL + BULK DELETE
// ══════════════════════════════════════════════════════
function setupSelectAll() {
  const old = document.getElementById('selectAll');
  if (!old) return;
  const fresh = old.cloneNode(true);
  old.parentNode.replaceChild(fresh, old);
  fresh.checked = false;
  fresh.addEventListener('change', () => {
    document.querySelectorAll('.order-checkbox')
      .forEach(box => { box.checked = fresh.checked; });
  });
}

function deleteSelectedOrders() {
  const checked = document.querySelectorAll('.order-checkbox:checked');
  if (!checked.length) { alert('Walang napiling order.'); return; }
  if (!confirm(`I-delete ang ${checked.length} napiling order?`)) return;
  const idxs = Array.from(checked).map(b => Number(b.dataset.index));
  idxs.sort((a, b) => b - a).forEach(i => orders.splice(i, 1));
  localStorage.setItem('orders', JSON.stringify(orders));
  renderOrders();
  renderRevenueChart();
}

// ══════════════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════════════
const menuButtons = document.querySelectorAll('.menu-btn');
const tabs        = document.querySelectorAll('.tab-content');

function switchTab(tabId) {
  menuButtons.forEach(btn => btn.classList.remove('active'));
  tabs.forEach(tab => tab.classList.remove('active-tab'));
  const btn = document.querySelector(`[data-tab="${tabId}"]`);
  const tab = document.getElementById(tabId);
  if (btn) btn.classList.add('active');
  if (tab) tab.classList.add('active-tab');
  if (tabId === 'settings') loadSavedPricing();
  if (tabId === 'revenue')  setTimeout(() => renderRevenueChart(), 80);
  if (tabId === 'payments') {
    const saved = JSON.parse(localStorage.getItem('orders') || '[]');
    saved.forEach(savedOrder => {
      const exists = orders.find(o => o.ticket === savedOrder.ticket);
      if (!exists) orders.push(savedOrder);
    });
    renderPaymentsTab();
  }
}

menuButtons.forEach(btn =>
  btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')))
);

// ── Clickable overview cards ──
document.querySelectorAll('.clickable-card').forEach(card =>
  card.addEventListener('click', () => switchTab(card.getAttribute('data-tab-target')))
);

// ══════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const val = searchInput.value.toLowerCase().trim();
    ['#ordersBody tr', '#completedOrdersBody tr'].forEach(sel => {
      document.querySelectorAll(sel).forEach(row => {
        if (row.cells.length <= 1) { row.style.display = ''; return; }
        const text = Array.from(row.cells).map(c => c.innerText).join(' ').toLowerCase();
        row.style.display = text.includes(val) ? '' : 'none';
      });
    });
  });
}

// ══════════════════════════════════════════════════════
// REVENUE PERIOD TOGGLE
// ══════════════════════════════════════════════════════
let currentRevenuePeriod = 'daily';

function switchRevenuePeriod(period) {
  currentRevenuePeriod = period;
  document.querySelectorAll('.rev-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.period === period);
  });
  renderRevenueChart();
}

// ══════════════════════════════════════════════════════
// REVENUE SUMMARY CARDS
// ══════════════════════════════════════════════════════
function updateRevenueSummaryCards() {
  const done      = orders.filter(o => o.status === 'Completed');
  const now       = new Date();
  const todayStr  = now.toDateString();
  const thisMonth = now.getMonth();
  const thisYear  = now.getFullYear();

  const getD = o => o.completedDate ? new Date(o.completedDate) : null;

  const todayRev = done
    .filter(o => { const d = getD(o); return (d ? d.toDateString() : o.day || '') === todayStr; })
    .reduce((s, o) => s + Number(o.amount || 0), 0);

  const monthRev = done
    .filter(o => {
      const d = getD(o);
      const m = d ? d.getMonth()    : (o.month ?? thisMonth);
      const y = d ? d.getFullYear() : (o.year  ?? thisYear);
      return m === thisMonth && y === thisYear;
    })
    .reduce((s, o) => s + Number(o.amount || 0), 0);

  const yearRev = done
    .filter(o => {
      const d = getD(o);
      const y = d ? d.getFullYear() : (o.year ?? thisYear);
      return y === thisYear;
    })
    .reduce((s, o) => s + Number(o.amount || 0), 0);

  const el = id => document.getElementById(id);
  if (el('rev-today')) el('rev-today').innerText = `₱${todayRev.toLocaleString()}`;
  if (el('rev-month')) el('rev-month').innerText = `₱${monthRev.toLocaleString()}`;
  if (el('rev-year'))  el('rev-year').innerText  = `₱${yearRev.toLocaleString()}`;
}

// ══════════════════════════════════════════════════════
// REVENUE CHART
// ══════════════════════════════════════════════════════
function renderRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx || typeof Chart === 'undefined') return;

  const done = orders.filter(o => o.status === 'Completed');
  const now  = new Date();
  let labels = [], data = [], label = '', borderColor, bgColor;

  if (currentRevenuePeriod === 'daily') {
    label = 'Daily Revenue (Last 30 Days)';
    borderColor = '#2563eb'; bgColor = 'rgba(37,99,235,0.1)';
    for (let d = 29; d >= 0; d--) {
      const day    = new Date(now);
      day.setDate(now.getDate() - d);
      const dayStr = day.toDateString();
      labels.push(`${day.getMonth() + 1}/${day.getDate()}`);
      data.push(done
        .filter(o => (o.completedDate ? new Date(o.completedDate).toDateString() : o.day || '') === dayStr)
        .reduce((s, o) => s + Number(o.amount || 0), 0));
    }
  } else if (currentRevenuePeriod === 'monthly') {
    label = `Monthly Revenue (${now.getFullYear()})`;
    borderColor = '#7c3aed'; bgColor = 'rgba(124,58,237,0.1)';
    labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    data   = new Array(12).fill(0);
    done.forEach(o => {
      const d = o.completedDate ? new Date(o.completedDate) : null;
      const m = d ? d.getMonth()    : (o.month ?? now.getMonth());
      const y = d ? d.getFullYear() : (o.year  ?? now.getFullYear());
      if (y === now.getFullYear()) data[m] += Number(o.amount || 0);
    });
  } else if (currentRevenuePeriod === 'yearly') {
    label = 'Yearly Revenue';
    borderColor = '#10b981'; bgColor = 'rgba(16,185,129,0.1)';
    const yearMap = {};
    done.forEach(o => {
      const d = o.completedDate ? new Date(o.completedDate) : null;
      const y = d ? d.getFullYear() : (o.year ?? now.getFullYear());
      yearMap[y] = (yearMap[y] || 0) + Number(o.amount || 0);
    });
    for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 2; y++) {
      labels.push(String(y));
      data.push(yearMap[y] || 0);
    }
  }

  if (window.revenueChartInstance) {
    window.revenueChartInstance.destroy();
    window.revenueChartInstance = null;
  }

  window.revenueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label, data,
        tension: 0.4, fill: true,
        borderColor, backgroundColor: bgColor,
        borderWidth: 4,
        pointBackgroundColor: borderColor,
        pointRadius: 5, pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { font: { size: 14, weight: '700' } } } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => `₱${v.toLocaleString()}`, font: { size: 13 } } },
        x: { ticks: { font: { size: 12 } } }
      }
    }
  });

  updateRevenueSummaryCards();
}

// ══════════════════════════════════════════════════════
// INQUIRIES
// ══════════════════════════════════════════════════════
const inquiriesBody = document.querySelector('#inquiriesBody');
let inquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');

function renderInquiries() {
  if (!inquiriesBody) return;
  inquiriesBody.innerHTML = '';
  if (!inquiries.length) {
    inquiriesBody.innerHTML = `
      <tr><td colspan="6" style="text-align:center;padding:30px;color:#64748b;">No franchise inquiries</td></tr>`;
    return;
  }
  inquiries.forEach((inq, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${inq.fullName || ''}</td>
      <td>${inq.email    || ''}</td>
      <td>${inq.contact  || ''}</td>
      <td>${inq.message  || ''}</td>
      <td>${inq.date     || ''}</td>
      <td><button class="action-btn delete-btn" onclick="deleteInquiry(${i})">Delete</button></td>
    `;
    inquiriesBody.appendChild(tr);
  });
}

renderInquiries();

function deleteInquiry(i) {
  inquiries.splice(i, 1);
  localStorage.setItem('inquiries', JSON.stringify(inquiries));
  renderInquiries();
}

// ══════════════════════════════════════════════════════
// INVENTORY + PRICING
// ══════════════════════════════════════════════════════
function updateStockBadge(badgeId, qty) {
  const badge = document.getElementById(badgeId);
  if (!badge) return;
  qty = parseInt(qty) || 0;
  badge.textContent = qty === 0 ? 'Out of Stock' : qty <= 10 ? 'Low Stock' : 'In Stock';
  badge.className   = 'stock-badge ' + (qty === 0 ? 'out-of-stock' : qty <= 10 ? 'low-stock' : 'in-stock');
}

function setupStockListeners() {
  document.querySelectorAll('.stock-input').forEach(input => {
    const badgeId = 'badge-' + input.id.replace('stock-', '');
    updateStockBadge(badgeId, input.value);
    input.addEventListener('input', () => updateStockBadge(badgeId, input.value));
  });
}

const STOCK_IDS = [
  'stock-soap-ariel','stock-soap-tide','stock-soap-breeze',
  'stock-soap-surf','stock-soap-pride','stock-soap-wings',
  'stock-fabcon-downy','stock-fabcon-del','stock-fabcon-champion',
  'stock-fabcon-surf-fabcon','stock-fabcon-lala-fabcon','stock-fabcon-personal-choice',
  'stock-wash-quick-wash','stock-wash-deep-clean','stock-wash-premium-wash',
  'stock-wash-eco-wash','stock-wash-cold-wash','stock-wash-hot-wash'
];

function savePricing() {
  const flt = (id, def) => parseFloat(document.getElementById(id)?.value) || def;
  const pricingData = {
    step1: [flt('soap-ariel',20), flt('soap-tide',25), flt('soap-breeze',18),
            flt('soap-surf',15),  flt('soap-pride',17), flt('soap-wings',16)],
    step2: [flt('fabcon-downy',30),     flt('fabcon-del',20),          flt('fabcon-champion',22),
            flt('fabcon-surf-fabcon',18), flt('fabcon-lala-fabcon',15), flt('fabcon-personal-choice',21)],
    step3: [flt('wash-quick-wash',50), flt('wash-deep-clean',80),   flt('wash-premium-wash',120),
            flt('wash-eco-wash',60),    flt('wash-cold-wash',40),    flt('wash-hot-wash',70)],
    deliveryFee: flt('delivery-fee', 40),
    kgExtraFee:  flt('kg-extra-fee', 5)
  };

  const stockData = {};
  STOCK_IDS.forEach(id => { stockData[id] = parseInt(document.getElementById(id)?.value) || 0; });

  localStorage.setItem('laundryPricing', JSON.stringify(pricingData));
  localStorage.setItem('laundryStocks',  JSON.stringify(stockData));
  window.dispatchEvent(new CustomEvent('pricingUpdated'));

  const statusEl = document.getElementById('pricingStatus');
  statusEl.innerHTML     = '✅ <strong>Saved! Pricing and stocks updated.</strong>';
  statusEl.className     = 'pricing-status status-success';
  statusEl.style.display = 'block';
  setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
}

function loadSavedPricing() {
  try {
    const saved = JSON.parse(localStorage.getItem('laundryPricing'));
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    if (saved) {
      const [s1, s2, s3] = [saved.step1 || [], saved.step2 || [], saved.step3 || []];
      setVal('soap-ariel',   s1[0] || 20); setVal('soap-tide',  s1[1] || 25);
      setVal('soap-breeze',  s1[2] || 18); setVal('soap-surf',  s1[3] || 15);
      setVal('soap-pride',   s1[4] || 17); setVal('soap-wings', s1[5] || 16);
      setVal('fabcon-downy',            s2[0] || 30); setVal('fabcon-del',       s2[1] || 20);
      setVal('fabcon-champion',         s2[2] || 22); setVal('fabcon-surf-fabcon', s2[3] || 18);
      setVal('fabcon-lala-fabcon',      s2[4] || 15); setVal('fabcon-personal-choice', s2[5] || 21);
      setVal('wash-quick-wash',  s3[0] || 50); setVal('wash-deep-clean',   s3[1] || 80);
      setVal('wash-premium-wash',s3[2] || 120); setVal('wash-eco-wash',    s3[3] || 60);
      setVal('wash-cold-wash',   s3[4] || 40); setVal('wash-hot-wash',     s3[5] || 70);
      setVal('delivery-fee', saved.deliveryFee || 40);
      setVal('kg-extra-fee', saved.kgExtraFee  || 5);
    }

    // ── Load stocks (includes BookNow deductions) ──
    const savedStocks = JSON.parse(localStorage.getItem('laundryStocks') || '{}');
    STOCK_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el && savedStocks[id] !== undefined) el.value = savedStocks[id];
    });
  } catch (e) {
    console.log('No saved pricing/stocks');
  }
  setupStockListeners();
}

function resetPricing() {
  if (!confirm('Reset ALL pricing and stocks to defaults?')) return;
  const defaults = {
    'soap-ariel':20,'soap-tide':25,'soap-breeze':18,'soap-surf':15,'soap-pride':17,'soap-wings':16,
    'fabcon-downy':30,'fabcon-del':20,'fabcon-champion':22,'fabcon-surf-fabcon':18,
    'fabcon-lala-fabcon':15,'fabcon-personal-choice':21,
    'wash-quick-wash':50,'wash-deep-clean':80,'wash-premium-wash':120,
    'wash-eco-wash':60,'wash-cold-wash':40,'wash-hot-wash':70,
    'delivery-fee':40,'express-fee':50,'kg-extra-fee':5,'gcash-fee':5
  };
  Object.entries(defaults).forEach(([id, val]) => {
    const el = document.getElementById(id); if (el) el.value = val;
  });
  STOCK_IDS.forEach(id => { const el = document.getElementById(id); if (el) el.value = 50; });
  savePricing();
  setupStockListeners();
}

document.addEventListener('click', e => {
  if (e.target.matches("[data-tab='settings']") || e.target.closest("[data-tab='settings']")) {
    setTimeout(loadSavedPricing, 200);
  }
});

// LOGOUT
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function () {
    if (!confirm('Are you sure you want to logout?')) return;
    localStorage.removeItem('loggedInUser');
    sessionStorage.clear();
    window.location.href = '../HTML/login.html';
  });
}

// ══════════════════════════════════════════════════════
// PAYMENTS TAB — COMBINED CASH + GCASH
// ══════════════════════════════════════════════════════
function getGcashStatuses() {
  try { return JSON.parse(localStorage.getItem('gcashPaymentStatuses')) || {}; }
  catch (e) { return {}; }
}
function saveGcashStatuses(obj) {
  localStorage.setItem('gcashPaymentStatuses', JSON.stringify(obj));
}

function getCashStatuses() {
  try { return JSON.parse(localStorage.getItem('cashPaymentStatuses')) || {}; }
  catch (e) { return {}; }
}
function saveCashStatuses(obj) {
  localStorage.setItem('cashPaymentStatuses', JSON.stringify(obj));
}

function getLatestOrders() {
  const saved = JSON.parse(localStorage.getItem('orders') || '[]');
  saved.forEach(savedOrder => {
    const exists = orders.find(o => o.ticket === savedOrder.ticket);
    if (!exists) orders.push(savedOrder);
  });
  return orders;
}

function getPaymentStatus(order) {
  if (order.payment === 'GCash') {
    const statuses = getGcashStatuses();
    return statuses[order.ticket] || 'Pending';
  } else {
    const statuses = getCashStatuses();
    return statuses[order.ticket] === 'received' ? 'Received' : 'Pending';
  }
}

let activePayFilter       = 'All';
let activePayStatusFilter = 'All';

function setPayFilter(filter) {
  activePayFilter = filter;
  document.querySelectorAll('.pay-filter-btn[data-pf]').forEach(btn => {
    btn.classList.toggle('pf-active', btn.dataset.pf === filter);
  });
  renderPaymentsTab();
}

function setPayStatusFilter(filter) {
  activePayStatusFilter = filter;
  document.querySelectorAll('.pay-filter-btn[data-ps]').forEach(btn => {
    const isActive = btn.dataset.ps === filter;
    btn.style.background  = isActive ? '#0077cc' : '';
    btn.style.color       = isActive ? '#fff'    : '';
    btn.style.borderColor = isActive ? '#0077cc' : '';
    btn.style.boxShadow   = isActive ? '0 0 14px rgba(0,119,204,0.3)' : '';
  });
  renderPaymentsTab();
}

function renderPaymentsTab() {
  const tbody = document.getElementById('paymentsBody');
  if (!tbody) return;

  const latestOrders  = getLatestOrders();
  const gcashStatuses = getGcashStatuses();
  const cashStatuses  = getCashStatuses();

  const allPaymentOrders = latestOrders.filter(o => o.payment === 'GCash' || o.payment === 'Cash');

  const total    = allPaymentOrders.length;
  const verified = allPaymentOrders.filter(o => {
    const s = getPaymentStatus(o);
    return s === 'Verified' || s === 'Received';
  }).length;
  const pending  = allPaymentOrders.filter(o => getPaymentStatus(o) === 'Pending').length;
  const totalAmt = allPaymentOrders.reduce((s, o) => s + Number(o.amount || 0), 0);

  const el = id => document.getElementById(id);
  if (el('pay-total'))    el('pay-total').innerText    = total;
  if (el('pay-verified')) el('pay-verified').innerText = verified;
  if (el('pay-pending'))  el('pay-pending').innerText  = pending;
  if (el('pay-amount'))   el('pay-amount').innerText   = `₱${totalAmt.toLocaleString()}`;

  let filtered = allPaymentOrders;
  if (activePayFilter !== 'All') {
    filtered = filtered.filter(o => o.payment === activePayFilter);
  }
  if (activePayStatusFilter !== 'All') {
    filtered = filtered.filter(o => getPaymentStatus(o) === activePayStatusFilter);
  }

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center;padding:36px;color:#64748b;font-size:14px;">
          No payment records found for the selected filters.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const g         = o.gcash || {};
    const isGcash   = o.payment === 'GCash';
    const isCash    = o.payment === 'Cash';
    const payStatus = getPaymentStatus(o);
    const badgeClass  = payStatus.toLowerCase();
    const orderStatus = o.status || 'Pending';
    const hasProof    = isGcash && !!g.proofImage;
    const realIdx     = latestOrders.indexOf(o);

    const gcashDetails = isGcash
      ? `<div style="font-size:12px;line-height:1.8;">
           <div><strong>${g.senderName || '—'}</strong></div>
           <div style="font-family:monospace;color:#0077cc;">${g.senderNumber || '—'}</div>
           <div style="font-family:monospace;font-size:11px;color:#64748b;">Ref: ${g.refNumber || '—'}</div>
         </div>`
      : `<span style="font-size:12px;color:#94a3b8;font-style:italic;">N/A (Cash)</span>`;

    let actionBtns = '';
    if (isGcash) {
      if (hasProof) {
        actionBtns += `<button class="pay-btn view" onclick="openPayModal(${realIdx})"><i class="fa-solid fa-eye"></i> View</button>`;
      }
      actionBtns += `
        <button class="pay-btn verify" onclick="setGcashStatus('${o.ticket}', 'Verified')"
          ${payStatus === 'Verified' ? 'disabled style="opacity:0.45;cursor:default;"' : ''}>
          <i class="fa-solid fa-check"></i> Verify
        </button>
        <button class="pay-btn reject" onclick="setGcashStatus('${o.ticket}', 'Rejected')"
          ${payStatus === 'Rejected' ? 'disabled style="opacity:0.45;cursor:default;"' : ''}>
          <i class="fa-solid fa-xmark"></i> Reject
        </button>`;
    } else if (isCash) {
      if (payStatus === 'Pending') {
        actionBtns += `<button class="pay-btn received-cash" onclick="setCashReceived('${o.ticket}', true)">
          <i class="fa-solid fa-hand-holding-dollar"></i> Mark Received
        </button>`;
      } else {
        actionBtns += `<button class="pay-btn unreceived" onclick="setCashReceived('${o.ticket}', false)">
          <i class="fa-solid fa-rotate-left"></i> Undo
        </button>`;
      }
    }
    actionBtns += `<button class="pay-btn delete" onclick="deletePaymentRecord('${o.ticket}')">
      <i class="fa-solid fa-trash"></i>
    </button>`;

    return `
      <tr>
        <td><strong style="color:#0077cc;">#${o.ticket || '—'}</strong></td>
        <td>
          <div style="font-weight:700;font-size:13.5px;">${o.name || '—'}</div>
          <div style="font-size:11px;color:#64748b;">${o.address || ''}</div>
        </td>
        <td>
          <span class="pay-type-badge ${isGcash ? 'gcash' : 'cash'}">
            <i class="fa-solid ${isGcash ? 'fa-mobile-screen-button' : 'fa-money-bill-wave'}"></i>
            ${o.payment}
          </span>
        </td>
        <td><strong style="font-size:15px;color:#0077cc;">₱${Number(o.amount || 0).toLocaleString()}</strong></td>
        <td>${gcashDetails}</td>
        <td>
          ${hasProof
            ? `<img class="pay-proof-thumb" src="${g.proofImage}" alt="Proof" title="Click to view" onclick="openPayModal(${realIdx})">`
            : `<span class="pay-no-proof">${isCash ? '—' : 'No screenshot'}</span>`}
        </td>
        <td><span class="status ${orderStatus.toLowerCase().replace(/\s+/g,'')}">${orderStatus}</span></td>
        <td><span class="pay-badge ${badgeClass}">${payStatus}</span></td>
        <td>
          <div class="pay-action-row">${actionBtns}</div>
        </td>
      </tr>`;
  }).join('');
}

function setGcashStatus(ticket, status) {
  const statuses = getGcashStatuses();
  statuses[ticket] = status;
  saveGcashStatuses(statuses);
  renderPaymentsTab();
}

function setCashReceived(ticket, received) {
  const statuses = getCashStatuses();
  if (received) { statuses[ticket] = 'received'; }
  else          { delete statuses[ticket]; }
  saveCashStatuses(statuses);
  renderPaymentsTab();
}

function deletePaymentRecord(ticket) {
  if (!confirm(`Remove payment record for ticket #${ticket}?\n\nThe order itself will remain but the payment details will be cleared.`)) return;
  const idx = orders.findIndex(o => o.ticket === ticket);
  if (idx !== -1) {
    const gcashStatuses = getGcashStatuses();
    const cashStatuses  = getCashStatuses();
    delete orders[idx].gcash;
    delete gcashStatuses[ticket];
    delete cashStatuses[ticket];
    saveGcashStatuses(gcashStatuses);
    saveCashStatuses(cashStatuses);
    localStorage.setItem('orders', JSON.stringify(orders));
  }
  renderPaymentsTab();
}

function openPayModal(orderIndex) {
  const latestOrders = getLatestOrders();
  const o = latestOrders[orderIndex];
  if (!o) return;
  const g = o.gcash || {};
  const payStatus = getPaymentStatus(o);

  const modal = document.getElementById('payProofModal');
  if (!modal) return;

  document.getElementById('payModalSub').textContent =
    `Ticket #${o.ticket || '—'} — ${o.name || '—'}`;

  document.getElementById('payModalDetails').innerHTML = `
    <div class="pay-modal-field">
      <label>GCash Sender Name</label>
      <span>${g.senderName || '—'}</span>
    </div>
    <div class="pay-modal-field">
      <label>GCash Number</label>
      <span>${g.senderNumber || '—'}</span>
    </div>
    <div class="pay-modal-field full">
      <label>Reference Number</label>
      <span style="font-family:monospace;font-size:16px;font-weight:800;letter-spacing:0.08em;color:#0d1b2e;">
        ${g.refNumber || '—'}
      </span>
    </div>
    <div class="pay-modal-field">
      <label>Amount Sent</label>
      <span style="color:#0077cc;font-size:18px;font-weight:800;">₱${Number(o.amount || 0).toLocaleString()}</span>
    </div>
    <div class="pay-modal-field">
      <label>Payment Status</label>
      <span class="pay-badge ${payStatus.toLowerCase()}">${payStatus}</span>
    </div>
    <div class="pay-modal-field">
      <label>Order Status</label>
      <span>${o.status || 'Pending'}</span>
    </div>
    <div class="pay-modal-field">
      <label>Service</label>
      <span>${o.service || '—'}</span>
    </div>
    <div class="pay-modal-field">
      <label>Delivery Method</label>
      <span>${o.pickupType || 'Store Pickup'}</span>
    </div>
  `;

  const img   = document.getElementById('payModalImg');
  const fname = document.getElementById('payModalFname');
  if (g.proofImage) {
    img.src           = g.proofImage;
    img.style.display = 'block';
    fname.textContent = g.proofFileName || '';
  } else {
    img.style.display = 'none';
    fname.textContent = 'No proof of payment uploaded.';
  }

  modal.classList.add('open');
}

function closePayModal() {
  const modal = document.getElementById('payProofModal');
  if (modal) modal.classList.remove('open');
}

document.addEventListener('click', e => {
  const modal = document.getElementById('payProofModal');
  if (modal && e.target === modal) closePayModal();
});

// Auto-refresh payments tab every 5s
setInterval(() => {
  const payTab = document.getElementById('payments');
  if (payTab && payTab.classList.contains('active-tab')) renderPaymentsTab();
}, 5000);