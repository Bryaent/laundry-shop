const ordersTable         = document.querySelector("#ordersBody");
const completedOrdersTable = document.querySelector("#completedOrdersBody");

let orders = [];

// ══════════════════════════════════════════════════════
// COMPLETE LOCK: order must have been set to "Ready" first
// ══════════════════════════════════════════════════════
function canComplete(order) {
    return order.wasReady === true;
}

// ══════════════════════════════════════════════════════
// LOAD ORDERS  +  LIVE POLLING (every 5 seconds)
// ══════════════════════════════════════════════════════
function loadOrders() {
    fetch("http://localhost:3000/laundry-shop/FINALWEBSITE/PHP/orders.php")
        .then(res => res.json())
        .then(data => {
            // Merge server data with local state (preserve wasReady, completedDate, etc.)
            orders = data.map(serverOrder => {
                const local = orders.find(o => o.id === serverOrder.id || o.ticket === serverOrder.ticket);
                return {
                    ...serverOrder,
                    status:      serverOrder.status      || "Pending",
                    wasReady:    local ? local.wasReady  : (serverOrder.wasReady === true),
                    completedDate: local ? local.completedDate : serverOrder.completedDate,
                    month:       local ? local.month     : serverOrder.month,
                    year:        local ? local.year      : serverOrder.year,
                    day:         local ? local.day       : serverOrder.day,
                };
            });
            renderOrders();
            renderRevenueChart();
        })
        .catch(() => {
            // Fallback to localStorage when server is unavailable
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

// Initial load
loadOrders();

// ── Auto-refresh every 5 seconds (live orders) ──
setInterval(loadOrders, 5000);

// ══════════════════════════════════════════════════════
// RENDER ORDERS
// ══════════════════════════════════════════════════════
function renderOrders() {
    if (!ordersTable || !completedOrdersTable) return;

    ordersTable.innerHTML          = "";
    completedOrdersTable.innerHTML = "";

    // Overview cards
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

    let hasLive = false, hasCompleted = false;

    orders.forEach((o, i) => {
        const tr     = document.createElement("tr");
        const pickup = o.pickupType || o.delivery || "Store Pickup";

        // ── COMPLETED TABLE ──
        if (o.status === "Completed") {
            hasCompleted = true;
            tr.innerHTML = `
                <td>${o.ticket  || ""}</td>
                <td>${o.name    || ""}</td>
                <td>${o.contact || "N/A"}</td>
                <td>${o.service || ""}</td>
                <td>₱${Number(o.amount || 0).toLocaleString()}</td>
                <td><span class="status completed">Completed</span></td>
                <td>${pickup}</td>
                <td>
                    <button class="action-btn delete-btn" onclick="deleteCompletedOrder(${i})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            `;
            completedOrdersTable.appendChild(tr);

        // ── LIVE TABLE ──
        } else {
            hasLive = true;
            const currentStatus = o.status || "Pending";
            const statusClass   = currentStatus.toLowerCase().replace(/\s+/g, "");

            // Complete button locked until "Ready" was clicked
            const completeLocked = canComplete(o) ? "" : "disabled";

            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="select-checkbox order-checkbox" data-index="${i}">
                </td>
                <td>${o.ticket  || ""}</td>
                <td>${o.name    || ""}</td>
                <td>${o.contact || "N/A"}</td>
                <td>${o.service || ""}</td>
                <td>₱${Number(o.amount || 0).toLocaleString()}</td>
                <td><span class="status ${statusClass}">${currentStatus}</span></td>
                <td>${pickup}</td>
                <td>
                    <button class="action-btn received-btn" onclick="updateStatus(${i},'Received')">Received</button>
                    <button class="action-btn progress-btn" onclick="updateStatus(${i},'In Progress')">In Progress</button>
                    <button class="action-btn ready-btn"    onclick="updateStatus(${i},'Ready')">Ready</button>
                    <button class="action-btn complete-btn" onclick="updateStatus(${i},'Completed')" ${completeLocked}>Complete</button>
                    <button class="action-btn delete-btn"   onclick="deleteOrder(${i})">Delete</button>
                </td>
            `;
            ordersTable.appendChild(tr);
        }
    });

    if (!hasLive) {
        ordersTable.innerHTML = `
            <tr><td colspan="9" style="text-align:center;padding:30px;color:#64748b;">No live orders</td></tr>`;
    }
    if (!hasCompleted) {
        completedOrdersTable.innerHTML = `
            <tr><td colspan="8" style="text-align:center;padding:30px;color:#64748b;">No completed orders</td></tr>`;
    }

    localStorage.setItem("orders", JSON.stringify(orders));
    setupSelectAll();
}

// ══════════════════════════════════════════════════════
// UPDATE STATUS
// ══════════════════════════════════════════════════════
function updateStatus(i, status) {
    const order = orders[i];
    if (!order) return;

    // Track when Ready is clicked
    if (status === "Ready") {
        order.wasReady = true;
    }

    // Hard block — Complete only after Ready
    if (status === "Completed" && !canComplete(order)) {
        return;
    }

    order.status = status;

    if (status === "Completed") {
        const now         = new Date();
        order.completedDate = now.toISOString();
        order.month         = now.getMonth();
        order.year          = now.getFullYear();
        order.day           = now.toDateString();
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
// DELETE — COMPLETED ORDER (subtracts from all revenue)
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
}

menuButtons.forEach(btn =>
    btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")))
);
document.querySelectorAll(".clickable-card").forEach(card =>
    card.addEventListener("click", () => switchTab(card.getAttribute("data-tab-target")))
);

// ══════════════════════════════════════════════════════
// SEARCH — filters both tables live
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
// REVENUE CHART — Daily / Monthly / Yearly
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