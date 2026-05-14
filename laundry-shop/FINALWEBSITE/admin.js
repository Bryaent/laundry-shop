// ================= ORDERS =================

const ordersTable = document.querySelector("#ordersBody");
const completedOrdersTable = document.querySelector("#completedOrdersBody");

let orders = [];

// ================= LOAD ORDERS =================
function loadOrders() {
    fetch("http://localhost:3000/laundry-shop/FINALWEBSITE/orders")
        .then(res => res.json())
        .then(data => {
            orders = data;
            renderOrders();
            renderRevenueChart();
        })
        .catch(err => {
            console.log("DB error, fallback localStorage");

            orders = JSON.parse(localStorage.getItem("orders")) || [];
            renderOrders();
            renderRevenueChart();
        });
}

loadOrders();

// ================= RENDER ORDERS =================
function renderOrders() {
    if (!ordersTable || !completedOrdersTable) return;

    ordersTable.innerHTML = "";
    completedOrdersTable.innerHTML = "";

    const totalOrders = orders.length;

    const completedOrders = orders.filter(
        o => o.status === "Completed"
    ).length;

    const pendingOrders = totalOrders - completedOrders;

    const totalRevenue = orders
        .filter(o => o.status === "Completed")
        .reduce((sum, o) => sum + Number(o.amount || 0), 0);

    // Dashboard Cards
    const cardTotalOrders = document.getElementById("card-total-orders");
    const cardCompleted = document.getElementById("card-completed");
    const cardPending = document.getElementById("card-pending");
    const cardRevenue = document.getElementById("card-total-revenue");

    if (cardTotalOrders) cardTotalOrders.innerText = totalOrders;
    if (cardCompleted) cardCompleted.innerText = completedOrders;
    if (cardPending) cardPending.innerText = pendingOrders;
    if (cardRevenue) cardRevenue.innerText = `₱${totalRevenue.toLocaleString()}`;

    // No Orders
    if (orders.length === 0) {
        ordersTable.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:20px;">
                    No live orders
                </td>
            </tr>
        `;

        completedOrdersTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:20px;">
                    No completed orders
                </td>
            </tr>
        `;

        return;
    }

    // Render Each Order
    orders.forEach((o, i) => {
        const tr = document.createElement("tr");

        const pickupDisplay =
            o.pickupType || o.delivery || "Store Pickup";

        // COMPLETED ORDERS
        if (o.status === "Completed") {
            tr.innerHTML = `
                <td>${o.ticket || ""}</td>
                <td>${o.name || ""}</td>
                <td>${o.contact || "N/A"}</td>
                <td>${o.service || ""}</td>
                <td>₱${Number(o.amount || 0).toLocaleString()}</td>
                <td>
                    <span class="status completed">
                        Completed
                    </span>
                </td>
                <td>${pickupDisplay}</td>
            `;

            completedOrdersTable.appendChild(tr);
        }

        // ACTIVE ORDERS
        else {
            const statusClass = (o.status || "Pending")
                .toLowerCase()
                .replace(/\s+/g, "");

            tr.innerHTML = `
                <td>${o.ticket || ""}</td>
                <td>${o.name || ""}</td>
                <td>${o.contact || "N/A"}</td>
                <td>${o.service || ""}</td>
                <td>₱${Number(o.amount || 0).toLocaleString()}</td>
                <td>
                    <span class="status ${statusClass}">
                        ${o.status || "Pending"}
                    </span>
                </td>
                <td>${pickupDisplay}</td>
                <td>
                    <button
                        class="action-btn received-btn"
                        onclick="updateStatus(${i}, 'Received')">
                        Received
                    </button>

                    <button
                        class="action-btn ready-btn"
                        onclick="updateStatus(${i}, 'Ready')">
                        Ready
                    </button>

                    <button
                        class="action-btn progress-btn"
                        onclick="updateStatus(${i}, 'In Progress')">
                        In Progress
                    </button>

                    <button
                        class="action-btn complete-btn"
                        onclick="updateStatus(${i}, 'Completed')">
                        Complete
                    </button>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteOrder(${i})">
                        Delete
                    </button>
                </td>
            `;

            ordersTable.appendChild(tr);
        }
    });

    // Backup to localStorage
    localStorage.setItem("orders", JSON.stringify(orders));
}

// ================= UPDATE STATUS =================
function updateStatus(i, status) {
    const order = orders[i];
    if (!order) return;

    // 1. UPDATE UI FIRST (Optimistic Update)
    order.status = status;
    renderOrders();
    renderRevenueChart();

    if (!order.id) return; // Stop if no ID exists for the DB

    // 2. YOUR ORIGINAL DATABASE CONNECTIVITY
    fetch("http://localhost/laundry-shop/FINALWEBSITE/orders.php?action=update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: order.id,
            status: status
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err));
}

// ================= DELETE ORDER =================
function deleteOrder(i) {
    const order = orders[i];
    if (!order) return;

    // 1. UPDATE UI FIRST (Optimistic Update)
    orders.splice(i, 1);
    renderOrders();
    renderRevenueChart();

    if (!order.id) return; // Stop if no ID exists for the DB

    // 2. YOUR ORIGINAL DATABASE CONNECTIVITY
    fetch("http://localhost/laundry-shop/FINALWEBSITE/orders.php?action=delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: order.id,
            action: "delete"
        })
    })
    .then(res => res.json())
    .catch(err => console.log(err));
}

// ================= TAB SWITCHING =================
const menuButtons = document.querySelectorAll(".menu-btn");
const tabs = document.querySelectorAll(".tab-content");

function switchTab(tabId) {
    menuButtons.forEach(btn =>
        btn.classList.remove("active")
    );

    tabs.forEach(tab =>
        tab.classList.remove("active-tab")
    );

    const activeButton = document.querySelector(
        `[data-tab="${tabId}"]`
    );

    const activeTab = document.getElementById(tabId);

    if (activeButton) activeButton.classList.add("active");
    if (activeTab) activeTab.classList.add("active-tab");
}

menuButtons.forEach(button => {
    button.addEventListener("click", () => {
        const tab = button.getAttribute("data-tab");
        switchTab(tab);
    });
});

// ================= CLICKABLE CARDS =================
const clickableCards =
    document.querySelectorAll(".clickable-card");

clickableCards.forEach(card => {
    card.addEventListener("click", () => {
        const target =
            card.getAttribute("data-tab-target");

        switchTab(target);
    });
});

// ================= REVENUE CHART =================
function renderRevenueChart() {
    const ctx = document.getElementById("revenueChart");
    if (!ctx || typeof Chart === "undefined") return;

    const completed = orders.filter(
        o => o.status === "Completed"
    );

    const monthlyRevenue = new Array(12).fill(0);

    completed.forEach(order => {
        const month =
            order.month !== undefined
                ? order.month
                : new Date().getMonth();

        monthlyRevenue[month] += Number(order.amount || 0);
    });

    if (window.revenueChartInstance) {
        window.revenueChartInstance.destroy();
    }

    window.revenueChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: [
                "Jan", "Feb", "Mar", "Apr",
                "May", "Jun", "Jul", "Aug",
                "Sep", "Oct", "Nov", "Dec"
            ],
            datasets: [{
                label: "Monthly Revenue",
                data: monthlyRevenue,
                tension: 0.4,
                fill: true,
                borderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ================= SEARCH =================
const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("keyup", () => {
        const value = searchInput.value.toLowerCase();

        const rows = document.querySelectorAll(
            "#ordersBody tr"
        );

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();

            row.style.display = text.includes(value)
                ? ""
                : "none";
        });
    });
}

// ================= INQUIRIES =================
const inquiriesBody =
    document.querySelector("#inquiriesBody");

let inquiries =
    JSON.parse(localStorage.getItem("inquiries")) || [];

function renderInquiries() {
    if (!inquiriesBody) return;

    inquiriesBody.innerHTML = "";

    if (inquiries.length === 0) {
        inquiriesBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;padding:20px;">
                    No franchise inquiries
                </td>
            </tr>
        `;
        return;
    }

    inquiries.forEach((inq, i) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${inq.fullName || ""}</td>
            <td>${inq.email || ""}</td>
            <td>${inq.contact || ""}</td>
            <td>${inq.message || ""}</td>
            <td>${inq.date || ""}</td>
            <td>
                <button
                    class="action-btn delete-btn"
                    onclick="deleteInquiry(${i})">
                    Delete
                </button>
            </td>
        `;

        inquiriesBody.appendChild(tr);
    });
}

renderInquiries();

function deleteInquiry(i) {
    inquiries.splice(i, 1);

    localStorage.setItem(
        "inquiries",
        JSON.stringify(inquiries)
    );

    renderInquiries();
}