const ordersTable         = document.querySelector("#ordersBody");
const completedOrdersTable = document.querySelector("#completedOrdersBody");

let orders = [];

// ══════════════════════════════════════════════════════
// COMPLETE LOCK
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
    fetch("http://localhost:3000/laundry-shop/FINALWEBSITE/PHP/orders.php")
        .then(res => res.json())
        .then(data => {
            orders = data.map(serverOrder => {
                const local = orders.find(o => o.id === serverOrder.id || o.ticket === serverOrder.ticket);
                return {
                    ...serverOrder,
                    status:        serverOrder.status      || "Pending",
                    wasReady:      local ? local.wasReady  : (serverOrder.wasReady === true),
                    completedDate: local ? local.completedDate : serverOrder.completedDate,
                    month:         local ? local.month     : serverOrder.month,
                    year:          local ? local.year      : serverOrder.year,
                    day:           local ? local.day       : serverOrder.day,
                };
            });
            renderOrders();
            renderRevenueChart();
        })
        .catch(() => {
            const saved = JSON.parse(localStorage.getItem("orders")) || [];
            orders = saved.map(o => ({
                ...o,
                status:   o.status   || "Pending",
                wasReady: o.wasReady === true
            }));
            renderOrders();
            renderRevenueChart();
        });
}

loadOrders();
setInterval(loadOrders, 5000);

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
        'All':        { bg: '#0077cc', shadow: 'rgba(0,119,204,0.3)' },
        'Pending':    { bg: '#f59e0b', shadow: 'rgba(245,158,11,0.3)' },
        'Received':   { bg: '#6366f1', shadow: 'rgba(99,102,241,0.3)' },
        'In Progress':{ bg: '#3b82f6', shadow: 'rgba(59,130,246,0.3)' },
        'Ready':      { bg: '#10b981', shadow: 'rgba(16,185,129,0.3)' }
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

    ordersTable.innerHTML          = "";
    completedOrdersTable.innerHTML = "";

    const totalOrders    = orders.length;
    const completedCount = orders.filter(o => o.status === "Completed").length;
    const pendingCount   = totalOrders - completedCount;
    const totalRevenue   = orders
        .filter(o => o.status === "Completed")
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);

    document.getElementById("card-total-orders").innerText  = totalOrders;
    document.getElementById("card-completed").innerText     = completedCount;
    document.getElementById("card-pending").innerText       = pendingCount;
    document.getElementById("card-total-revenue").innerText = `₱${totalRevenue.toLocaleString()}`;

    updateRevenueSummaryCards();

    let hasLive = false;

    orders.forEach((o, i) => {
        if (o.status === "Completed") return;

        const currentStatus = o.status || "Pending";
        if (activeStatusFilter !== 'All' && currentStatus !== activeStatusFilter) return;

        hasLive = true;
        const tr          = document.createElement("tr");
        const pickup      = o.pickupType || o.delivery || "Store Pickup";
        const statusClass = currentStatus.toLowerCase().replace(/\s+/g, "");
        const completeLocked = canComplete(o) ? "" : "disabled";

        tr.innerHTML = `
            <td><input type="checkbox" class="select-checkbox order-checkbox" data-index="${i}"></td>
            <td>${o.ticket  || ""}</td>
            <td>${o.name    || ""}</td>
            <td>${o.contact || "N/A"}</td>
            <td>${o.service || ""}</td>
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
    localStorage.setItem("orders", JSON.stringify(orders));
    setupSelectAll();
    renderGcashPayments();
}

// ══════════════════════════════════════════════════════
// RENDER COMPLETED ORDERS (paginated + alphabetical)
// ══════════════════════════════════════════════════════
function renderCompletedOrders() {
    if (!completedOrdersTable) return;
    completedOrdersTable.innerHTML = "";

    const completedOrders = orders
        .map((o, i) => ({ ...o, _realIdx: i }))
        .filter(o => o.status === "Completed")
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

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
        const tr     = document.createElement("tr");
        const pickup = o.pickupType || o.delivery || "Store Pickup";
        tr.innerHTML = `
            <td>${o.ticket  || ""}</td>
            <td>${o.name    || ""}</td>
            <td>${o.contact || "N/A"}</td>
            <td>${o.service || ""}</td>
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

    // ── wrapper ──
    const wrap = document.createElement('div');
    wrap.id = 'completedPagination';
    wrap.className = 'pagination-wrap';

    // ── info label ──
    const info = document.createElement('span');
    info.className = 'pagination-info';
    const start = (current - 1) * COMPLETED_PER_PAGE + 1;
    const end   = Math.min(current * COMPLETED_PER_PAGE, totalItems);
    info.innerHTML = `<i class="fa-solid fa-list-check"></i> Showing ${start}–${end} of ${totalItems} completed orders`;

    // ── controls row ──
    const controls = document.createElement('div');
    controls.className = 'pagination-controls';

    // Prev button
    const prev = document.createElement('button');
    prev.className = current === 1 ? 'page-btn page-btn-disabled' : 'page-btn';
    prev.disabled  = current === 1;
    prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prev.onclick   = () => { if (current > 1) { completedPage--; renderCompletedOrders(); } };

    // Page number buttons
    const pages = document.createElement('div');
    pages.className = 'page-numbers';

    let startPage = Math.max(1, current - 2);
    let endPage   = Math.min(total, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let p = startPage; p <= endPage; p++) {
        const btn = document.createElement('button');
        btn.className = p === current ? 'page-btn page-btn-active' : 'page-btn';
        btn.textContent = p;
        btn.onclick = ((_p) => () => { completedPage = _p; renderCompletedOrders(); })(p);
        pages.appendChild(btn);
    }

    // Next button
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
// UPDATE STATUS
// ══════════════════════════════════════════════════════
function updateStatus(i, status) {
    const order = orders[i];
    if (!order) return;

    if (status === "Ready") order.wasReady = true;
    if (status === "Completed" && !canComplete(order)) return;

    order.status = status;

    if (status === "Completed") {
        const now           = new Date();
        order.completedDate = now.toISOString();
        order.month         = now.getMonth();
        order.year          = now.getFullYear();
        order.day           = now.toDateString();
        completedPage       = 1;
    }

    localStorage.setItem("orders", JSON.stringify(orders));
    renderOrders();
    renderRevenueChart();
}

// ══════════════════════════════════════════════════════
// DELETE — LIVE ORDER
// ══════════════════════════════════════════════════════
function deleteOrder(i) {
    if (!confirm("Delete this order?")) return;
    orders.splice(i, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
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
    const name   = order.name || "this customer";
    if (!confirm(
        `Delete completed order ni ${name}?\n\n` +
        `Mababawas ang ₱${amount.toLocaleString()} sa total revenue.`
    )) return;

    orders.splice(i, 1);
    localStorage.setItem("orders", JSON.stringify(orders));

    const remaining  = orders.filter(o => o.status === "Completed").length;
    const totalPages = Math.max(1, Math.ceil(remaining / COMPLETED_PER_PAGE));
    if (completedPage > totalPages) completedPage = totalPages;

    renderOrders();
    renderRevenueChart();
}

// ══════════════════════════════════════════════════════
// SELECT ALL + BULK DELETE
// ══════════════════════════════════════════════════════
function setupSelectAll() {
    const old = document.getElementById("selectAll");
    if (!old) return;
    const fresh = old.cloneNode(true);
    old.parentNode.replaceChild(fresh, old);
    fresh.checked = false;
    fresh.addEventListener("change", () => {
        document.querySelectorAll(".order-checkbox")
                .forEach(box => { box.checked = fresh.checked; });
    });
}

function deleteSelectedOrders() {
    const checked = document.querySelectorAll(".order-checkbox:checked");
    if (!checked.length) { alert("Walang napiling order."); return; }
    if (!confirm(`I-delete ang ${checked.length} napiling order?`)) return;
    const idxs = Array.from(checked).map(b => Number(b.dataset.index));
    idxs.sort((a, b) => b - a).forEach(i => orders.splice(i, 1));
    localStorage.setItem("orders", JSON.stringify(orders));
    renderOrders();
    renderRevenueChart();
}

// ══════════════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════════════
const menuButtons = document.querySelectorAll(".menu-btn");
const tabs        = document.querySelectorAll(".tab-content");

function switchTab(tabId) {
    menuButtons.forEach(btn => btn.classList.remove("active"));
    tabs.forEach(tab => tab.classList.remove("active-tab"));
    const btn = document.querySelector(`[data-tab="${tabId}"]`);
    const tab = document.getElementById(tabId);
    if (btn) btn.classList.add("active");
    if (tab) tab.classList.add("active-tab");
    if (tabId === "settings") loadSavedPricing();
    if (tabId === "revenue")  setTimeout(() => renderRevenueChart(), 80);
    if (tabId === "payments") renderPaymentsTab();
}

menuButtons.forEach(btn =>
    btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")))
);
document.querySelectorAll(".clickable-card").forEach(card =>
    card.addEventListener("click", () => switchTab(card.getAttribute("data-tab-target")))
);

// ══════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════
const searchInput = document.getElementById("searchInput");
if (searchInput) {
    searchInput.addEventListener("input", () => {
        const val = searchInput.value.toLowerCase().trim();
        ["#ordersBody tr", "#completedOrdersBody tr"].forEach(sel => {
            document.querySelectorAll(sel).forEach(row => {
                if (row.cells.length <= 1) { row.style.display = ""; return; }
                const text = Array.from(row.cells).map(c => c.innerText).join(" ").toLowerCase();
                row.style.display = text.includes(val) ? "" : "none";
            });
        });
    });
}

// ══════════════════════════════════════════════════════
// GCASH PAYMENTS SECTION
// ══════════════════════════════════════════════════════
function renderGcashPayments() {
    const payTab = document.getElementById('payments');
    if (payTab && payTab.classList.contains('active-tab')) {
        renderPaymentsTab();
    }
}

function viewProof(orderIndex) {
    const o = orders[orderIndex];
    if (!o || !o.gcash || !o.gcash.proofImage) return;

    let modal = document.getElementById('proofModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'proofModal';
        modal.style.cssText = `
            position:fixed;inset:0;z-index:9999;
            background:rgba(13,27,46,0.8);backdrop-filter:blur(6px);
            display:flex;align-items:center;justify-content:center;
        `;
        modal.onclick = e => { if (e.target === modal) modal.remove(); };
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#fff;border-radius:18px;padding:28px;max-width:520px;width:95%;
                    box-shadow:0 24px 80px rgba(0,50,120,0.3);position:relative;">
            <button onclick="document.getElementById('proofModal').remove()"
                style="position:absolute;top:14px;right:16px;width:32px;height:32px;border-radius:50%;
                       background:#f0f6ff;border:none;cursor:pointer;font-size:18px;color:#0077cc;
                       font-weight:900;display:flex;align-items:center;justify-content:center;">&#10005;</button>
            <div style="font-size:22px;font-weight:900;color:#0077cc;text-transform:uppercase;margin-bottom:4px;">Proof of Payment</div>
            <div style="font-size:13px;color:#64748b;margin-bottom:16px;">Ticket #${o.ticket} &mdash; ${o.name}</div>
            <img src="${o.gcash.proofImage}" alt="Proof of Payment"
                 style="width:100%;border-radius:12px;border:1.5px solid rgba(0,119,204,0.2);
                        max-height:380px;object-fit:contain;background:#f5f8ff;">
            ${o.gcash.proofFileName ? `<div style="font-size:11px;color:#94a3b8;text-align:center;margin-top:6px;">${o.gcash.proofFileName}</div>` : ''}
        </div>`;
}

// ══════════════════════════════════════════════════════
// REVENUE PERIOD TOGGLE
// ══════════════════════════════════════════════════════
let currentRevenuePeriod = "daily";

function switchRevenuePeriod(period) {
    currentRevenuePeriod = period;
    document.querySelectorAll(".rev-toggle-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.period === period);
    });
    renderRevenueChart();
}

// ══════════════════════════════════════════════════════
// REVENUE SUMMARY CARDS
// ══════════════════════════════════════════════════════
function updateRevenueSummaryCards() {
    const done      = orders.filter(o => o.status === "Completed");
    const now       = new Date();
    const todayStr  = now.toDateString();
    const thisMonth = now.getMonth();
    const thisYear  = now.getFullYear();

    const getD = o => o.completedDate ? new Date(o.completedDate) : null;

    const todayRev = done
        .filter(o => { const d = getD(o); return (d ? d.toDateString() : o.day || "") === todayStr; })
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
    if (el("rev-today")) el("rev-today").innerText = `₱${todayRev.toLocaleString()}`;
    if (el("rev-month")) el("rev-month").innerText = `₱${monthRev.toLocaleString()}`;
    if (el("rev-year"))  el("rev-year").innerText  = `₱${yearRev.toLocaleString()}`;
}

// ══════════════════════════════════════════════════════
// REVENUE CHART
// ══════════════════════════════════════════════════════
function renderRevenueChart() {
    const ctx = document.getElementById("revenueChart");
    if (!ctx || typeof Chart === "undefined") return;

    const done = orders.filter(o => o.status === "Completed");
    const now  = new Date();
    let labels = [], data = [], label = "", borderColor, bgColor;

    if (currentRevenuePeriod === "daily") {
        label = "Daily Revenue (Last 30 Days)";
        borderColor = "#2563eb"; bgColor = "rgba(37,99,235,0.1)";
        for (let d = 29; d >= 0; d--) {
            const day    = new Date(now);
            day.setDate(now.getDate() - d);
            const dayStr = day.toDateString();
            labels.push(`${day.getMonth() + 1}/${day.getDate()}`);
            data.push(done
                .filter(o => (o.completedDate ? new Date(o.completedDate).toDateString() : o.day || "") === dayStr)
                .reduce((s, o) => s + Number(o.amount || 0), 0));
        }
    } else if (currentRevenuePeriod === "monthly") {
        label = `Monthly Revenue (${now.getFullYear()})`;
        borderColor = "#7c3aed"; bgColor = "rgba(124,58,237,0.1)";
        labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        data   = new Array(12).fill(0);
        done.forEach(o => {
            const d = o.completedDate ? new Date(o.completedDate) : null;
            const m = d ? d.getMonth()    : (o.month ?? now.getMonth());
            const y = d ? d.getFullYear() : (o.year  ?? now.getFullYear());
            if (y === now.getFullYear()) data[m] += Number(o.amount || 0);
        });
    } else if (currentRevenuePeriod === "yearly") {
        label = "Yearly Revenue";
        borderColor = "#10b981"; bgColor = "rgba(16,185,129,0.1)";
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
        type: "line",
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
            plugins: { legend: { labels: { font: { size: 14, weight: "700" } } } },
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
const inquiriesBody = document.querySelector("#inquiriesBody");
let inquiries = JSON.parse(localStorage.getItem("inquiries")) || [];

function renderInquiries() {
    if (!inquiriesBody) return;
    inquiriesBody.innerHTML = "";
    if (!inquiries.length) {
        inquiriesBody.innerHTML = `
            <tr><td colspan="6" style="text-align:center;padding:30px;color:#64748b;">No franchise inquiries</td></tr>`;
        return;
    }
    inquiries.forEach((inq, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${inq.fullName || ""}</td>
            <td>${inq.email    || ""}</td>
            <td>${inq.contact  || ""}</td>
            <td>${inq.message  || ""}</td>
            <td>${inq.date     || ""}</td>
            <td><button class="action-btn delete-btn" onclick="deleteInquiry(${i})">Delete</button></td>
        `;
        inquiriesBody.appendChild(tr);
    });
}

renderInquiries();

function deleteInquiry(i) {
    inquiries.splice(i, 1);
    localStorage.setItem("inquiries", JSON.stringify(inquiries));
    renderInquiries();
}

// ══════════════════════════════════════════════════════
// INVENTORY + PRICING
// ══════════════════════════════════════════════════════
function updateStockBadge(badgeId, qty) {
    const badge = document.getElementById(badgeId);
    if (!badge) return;
    qty = parseInt(qty) || 0;
    badge.textContent = qty === 0 ? "Out of Stock" : qty <= 10 ? "Low Stock" : "In Stock";
    badge.className   = "stock-badge " + (qty === 0 ? "out-of-stock" : qty <= 10 ? "low-stock" : "in-stock");
}

function setupStockListeners() {
    document.querySelectorAll(".stock-input").forEach(input => {
        const badgeId = "badge-" + input.id.replace("stock-", "");
        updateStockBadge(badgeId, input.value);
        input.addEventListener("input", () => updateStockBadge(badgeId, input.value));
    });
}

const STOCK_IDS = [
    "stock-soap-ariel","stock-soap-tide","stock-soap-breeze",
    "stock-soap-surf","stock-soap-pride","stock-soap-wings",
    "stock-fabcon-downy","stock-fabcon-del","stock-fabcon-champion",
    "stock-fabcon-surf-fabcon","stock-fabcon-lala-fabcon","stock-fabcon-personal-choice",
    "stock-wash-quick-wash","stock-wash-deep-clean","stock-wash-premium-wash",
    "stock-wash-eco-wash","stock-wash-cold-wash","stock-wash-hot-wash"
];

function savePricing() {
    const flt = (id, def) => parseFloat(document.getElementById(id)?.value) || def;
    const pricingData = {
        step1: [flt("soap-ariel",20),flt("soap-tide",25),flt("soap-breeze",18),
                flt("soap-surf",15),flt("soap-pride",17),flt("soap-wings",16)],
        step2: [flt("fabcon-downy",30),flt("fabcon-del",20),flt("fabcon-champion",22),
                flt("fabcon-surf-fabcon",18),flt("fabcon-lala-fabcon",15),flt("fabcon-personal-choice",21)],
        step3: [flt("wash-quick-wash",50),flt("wash-deep-clean",80),flt("wash-premium-wash",120),
                flt("wash-eco-wash",60),flt("wash-cold-wash",40),flt("wash-hot-wash",70)],
        deliveryFee: flt("delivery-fee",40),
        kgExtraFee:  flt("kg-extra-fee",5)
    };
    const stockData = {};
    STOCK_IDS.forEach(id => { stockData[id] = parseInt(document.getElementById(id)?.value) || 0; });
    localStorage.setItem("laundryPricing", JSON.stringify(pricingData));
    localStorage.setItem("laundryStocks",  JSON.stringify(stockData));
    window.dispatchEvent(new CustomEvent("pricingUpdated"));

    const statusEl = document.getElementById("pricingStatus");
    statusEl.innerHTML     = "✅ <strong>Saved! Pricing and stocks updated.</strong>";
    statusEl.className     = "pricing-status status-success";
    statusEl.style.display = "block";
    setTimeout(() => { statusEl.style.display = "none"; }, 3000);
}

function loadSavedPricing() {
    try {
        const saved = JSON.parse(localStorage.getItem("laundryPricing"));
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
        if (saved) {
            const [s1, s2, s3] = [saved.step1||[], saved.step2||[], saved.step3||[]];
            setVal("soap-ariel",s1[0]||20); setVal("soap-tide",s1[1]||25);
            setVal("soap-breeze",s1[2]||18); setVal("soap-surf",s1[3]||15);
            setVal("soap-pride",s1[4]||17); setVal("soap-wings",s1[5]||16);
            setVal("fabcon-downy",s2[0]||30); setVal("fabcon-del",s2[1]||20);
            setVal("fabcon-champion",s2[2]||22); setVal("fabcon-surf-fabcon",s2[3]||18);
            setVal("fabcon-lala-fabcon",s2[4]||15); setVal("fabcon-personal-choice",s2[5]||21);
            setVal("wash-quick-wash",s3[0]||50); setVal("wash-deep-clean",s3[1]||80);
            setVal("wash-premium-wash",s3[2]||120); setVal("wash-eco-wash",s3[3]||60);
            setVal("wash-cold-wash",s3[4]||40); setVal("wash-hot-wash",s3[5]||70);
            setVal("delivery-fee", saved.deliveryFee||40);
            setVal("kg-extra-fee", saved.kgExtraFee||5);
        }
        const savedStocks = JSON.parse(localStorage.getItem("laundryStocks")) || {};
        STOCK_IDS.forEach(id => {
            const el = document.getElementById(id);
            if (el && savedStocks[id] !== undefined) el.value = savedStocks[id];
        });
    } catch(e) { console.log("No saved pricing/stocks"); }
    setupStockListeners();
}

function resetPricing() {
    if (!confirm("Reset ALL pricing and stocks to defaults?")) return;
    const defaults = {
        "soap-ariel":20,"soap-tide":25,"soap-breeze":18,"soap-surf":15,"soap-pride":17,"soap-wings":16,
        "fabcon-downy":30,"fabcon-del":20,"fabcon-champion":22,"fabcon-surf-fabcon":18,
        "fabcon-lala-fabcon":15,"fabcon-personal-choice":21,
        "wash-quick-wash":50,"wash-deep-clean":80,"wash-premium-wash":120,
        "wash-eco-wash":60,"wash-cold-wash":40,"wash-hot-wash":70,
        "delivery-fee":40,"express-fee":50,"kg-extra-fee":5,"gcash-fee":5
    };
    Object.entries(defaults).forEach(([id,val]) => { const el = document.getElementById(id); if(el) el.value=val; });
    STOCK_IDS.forEach(id => { const el = document.getElementById(id); if(el) el.value=50; });
    savePricing();
    setupStockListeners();
}

document.addEventListener("click", e => {
    if (e.target.matches("[data-tab='settings']") || e.target.closest("[data-tab='settings']")) {
        setTimeout(loadSavedPricing, 200);
    }
});

// LOGOUT
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        if (!confirm("Are you sure you want to logout?")) return;
        localStorage.removeItem("loggedInUser");
        sessionStorage.clear();
        window.location.href = "../HTML/login.html";
    });
}

// ══════════════════════════════════════════════════════
// PAYMENTS TAB
// ══════════════════════════════════════════════════════
function getPaymentStatuses() {
    try { return JSON.parse(localStorage.getItem('gcashPaymentStatuses')) || {}; }
    catch(e) { return {}; }
}
function savePaymentStatuses(obj) {
    localStorage.setItem('gcashPaymentStatuses', JSON.stringify(obj));
}

let activePayFilter = 'All';

function setPayFilter(filter) {
    activePayFilter = filter;
    document.querySelectorAll('.pay-filter-btn').forEach(btn => {
        btn.classList.toggle('pf-active', btn.dataset.pf === filter);
    });
    renderPaymentsTab();
}

function renderPaymentsTab() {
    const tbody = document.getElementById('paymentsBody');
    if (!tbody) return;

    const statuses    = getPaymentStatuses();
    const gcashOrders = orders.filter(o => o.payment === 'GCash' && o.gcash);

    const total    = gcashOrders.length;
    const verified = gcashOrders.filter(o => (statuses[o.ticket] || 'Pending') === 'Verified').length;
    const pending  = gcashOrders.filter(o => (statuses[o.ticket] || 'Pending') === 'Pending').length;
    const totalAmt = gcashOrders.reduce((s, o) => s + Number(o.amount || 0), 0);

    const el = id => document.getElementById(id);
    if (el('pay-total'))    el('pay-total').innerText    = total;
    if (el('pay-verified')) el('pay-verified').innerText = verified;
    if (el('pay-pending'))  el('pay-pending').innerText  = pending;
    if (el('pay-amount'))   el('pay-amount').innerText   = `₱${totalAmt.toLocaleString()}`;

    const filtered = activePayFilter === 'All'
        ? gcashOrders
        : gcashOrders.filter(o => (statuses[o.ticket] || 'Pending') === activePayFilter);

    if (!filtered.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;padding:36px;color:#64748b;font-size:14px;">
                    ${activePayFilter === 'All'
                        ? 'No GCash payments submitted yet.'
                        : `No <strong>${activePayFilter}</strong> payments found.`}
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(o => {
        const g           = o.gcash || {};
        const payStatus   = statuses[o.ticket] || 'Pending';
        const badgeClass  = payStatus.toLowerCase();
        const orderStatus = o.status || 'Pending';
        const hasProof    = !!g.proofImage;
        const realIdx     = orders.indexOf(o);

        return `
            <tr>
                <td><strong style="color:#0077cc;">#${o.ticket || '—'}</strong></td>
                <td>
                    <div style="font-weight:700;font-size:13.5px;">${o.name || '—'}</div>
                    <div style="font-size:11px;color:#64748b;">${o.address || ''}</div>
                </td>
                <td><div style="font-weight:700;">${g.senderName || '—'}</div></td>
                <td><div style="font-weight:700;font-family:monospace;">${g.senderNumber || '—'}</div></td>
                <td><div style="font-weight:800;font-family:monospace;letter-spacing:0.06em;color:#0d1b2e;">${g.refNumber || '—'}</div></td>
                <td><strong style="font-size:15px;color:#0077cc;">₱${Number(o.amount || 0).toLocaleString()}</strong></td>
                <td>
                    ${hasProof
                        ? `<img class="pay-proof-thumb" src="${g.proofImage}" alt="Proof" title="Click to view full proof" onclick="openPayModal(${realIdx})">`
                        : `<span class="pay-no-proof">No screenshot</span>`}
                </td>
                <td><span class="status ${orderStatus.toLowerCase().replace(/\s+/g,'')}">${orderStatus}</span></td>
                <td><span class="pay-badge ${badgeClass}">${payStatus}</span></td>
                <td>
                    <div class="pay-action-row">
                        ${hasProof ? `<button class="pay-btn verify" onclick="openPayModal(${realIdx})"><i class="fa-solid fa-eye"></i> View</button>` : ''}
                        <button class="pay-btn verify" onclick="setPaymentStatus('${o.ticket}', 'Verified')" ${payStatus === 'Verified' ? 'disabled style="opacity:0.45;cursor:default;"' : ''}>
                            <i class="fa-solid fa-check"></i> Verify
                        </button>
                        <button class="pay-btn reject" onclick="setPaymentStatus('${o.ticket}', 'Rejected')" ${payStatus === 'Rejected' ? 'disabled style="opacity:0.45;cursor:default;"' : ''}>
                            <i class="fa-solid fa-xmark"></i> Reject
                        </button>
                        <button class="pay-btn delete" onclick="deletePaymentRecord('${o.ticket}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function setPaymentStatus(ticket, status) {
    const statuses = getPaymentStatuses();
    statuses[ticket] = status;
    savePaymentStatuses(statuses);
    renderPaymentsTab();
}

function deletePaymentRecord(ticket) {
    if (!confirm(`Remove GCash payment record for ticket #${ticket}?\n\nThe order itself will remain but the payment details will be cleared.`)) return;
    const idx = orders.findIndex(o => o.ticket === ticket);
    if (idx !== -1) {
        delete orders[idx].gcash;
        const statuses = getPaymentStatuses();
        delete statuses[ticket];
        savePaymentStatuses(statuses);
        localStorage.setItem('orders', JSON.stringify(orders));
    }
    renderPaymentsTab();
}

function openPayModal(orderIndex) {
    const o = orders[orderIndex];
    if (!o) return;
    const g = o.gcash || {};
    const statuses  = getPaymentStatuses();
    const payStatus = statuses[o.ticket] || 'Pending';

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

setInterval(() => {
    const payTab = document.getElementById('payments');
    if (payTab && payTab.classList.contains('active-tab')) {
        renderPaymentsTab();
    }
}, 5000);