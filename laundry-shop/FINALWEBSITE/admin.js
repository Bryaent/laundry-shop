const ordersTable = document.querySelector("#ordersBody");
const completedOrdersTable = document.querySelector("#completedOrdersBody");

let orders = [];

// LOAD ORDERS
function loadOrders(){

    fetch("http://localhost:3000/laundry-shop/FINALWEBSITE/orders")
        .then(res => res.json())
        .then(data => {

            orders = data;

            renderOrders();
            renderRevenueChart();

        })
        .catch(err => {

            console.log("Fallback localStorage");

            orders =
                JSON.parse(localStorage.getItem("orders")) || [];

            renderOrders();
            renderRevenueChart();

        });

}

loadOrders();

// RENDER ORDERS
function renderOrders(){

    if(!ordersTable || !completedOrdersTable) return;

    ordersTable.innerHTML = "";
    completedOrdersTable.innerHTML = "";

    const totalOrders = orders.length;

    const completedOrders =
        orders.filter(o => o.status === "Completed").length;

    const pendingOrders =
        totalOrders - completedOrders;

    const totalRevenue =
        orders
        .filter(o => o.status === "Completed")
        .reduce((sum,o) =>
            sum + Number(o.amount || 0),0);

    document.getElementById("card-total-orders").innerText =
        totalOrders;

    document.getElementById("card-completed").innerText =
        completedOrders;

    document.getElementById("card-pending").innerText =
        pendingOrders;

    document.getElementById("card-total-revenue").innerText =
        `₱${totalRevenue.toLocaleString()}`;

    // NO ORDERS
    if(orders.length === 0){

        ordersTable.innerHTML = `
            <tr>
                <td colspan="9"
                style="text-align:center;padding:30px;">
                    No live orders
                </td>
            </tr>
        `;

        completedOrdersTable.innerHTML = `
            <tr>
                <td colspan="7"
                style="text-align:center;padding:30px;">
                    No completed orders
                </td>
            </tr>
        `;

        return;
    }

    // RENDER EACH
    orders.forEach((o,i)=>{

        const tr =
            document.createElement("tr");

        const pickupDisplay =
            o.pickupType ||
            o.delivery ||
            "Store Pickup";

        // COMPLETED
        if(o.status === "Completed"){

            tr.innerHTML = `
                <td>${o.ticket || ""}</td>
                <td>${o.name || ""}</td>
                <td>${o.contact || "N/A"}</td>
                <td>${o.service || ""}</td>

                <td>
                    ₱${Number(o.amount || 0).toLocaleString()}
                </td>

                <td>
                    <span class="status completed">
                        Completed
                    </span>
                </td>

                <td>${pickupDisplay}</td>
            `;

            completedOrdersTable.appendChild(tr);

        }

        // ACTIVE
        else{

            const statusClass =
                (o.status || "Pending")
                .toLowerCase()
                .replace(/\s+/g,"");

            tr.innerHTML = `

                <td>
                    <input
                    type="checkbox"
                    class="select-checkbox order-checkbox"
                    data-index="${i}">
                </td>

                <td>${o.ticket || ""}</td>
                <td>${o.name || ""}</td>
                <td>${o.contact || "N/A"}</td>
                <td>${o.service || ""}</td>

                <td>
                    ₱${Number(o.amount || 0).toLocaleString()}
                </td>

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

    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

    setupSelectAll();

}

// UPDATE STATUS
function updateStatus(i,status){

    const order = orders[i];

    if(!order) return;

    order.status = status;

    renderOrders();
    renderRevenueChart();

}

// DELETE ONE
function deleteOrder(i){

    orders.splice(i,1);

    renderOrders();
    renderRevenueChart();

}

// SELECT ALL
function setupSelectAll(){

    const selectAll =
        document.getElementById("selectAll");

    if(!selectAll) return;

    selectAll.checked = false;

    selectAll.addEventListener("change",()=>{

        const checkboxes =
            document.querySelectorAll(".order-checkbox");

        checkboxes.forEach(box=>{

            box.checked = selectAll.checked;

        });

    });

}

// DELETE SELECTED
function deleteSelectedOrders(){

    const checkedBoxes =
        document.querySelectorAll(
            ".order-checkbox:checked"
        );

    if(checkedBoxes.length === 0){

        alert("Please select orders first.");
        return;

    }

    if(!confirm("Delete selected orders?")) return;

    const indexes = [];

    checkedBoxes.forEach(box=>{

        indexes.push(
            Number(box.dataset.index)
        );

    });

    indexes.sort((a,b)=>b-a);

    indexes.forEach(i=>{

        orders.splice(i,1);

    });

    renderOrders();
    renderRevenueChart();

}

// TAB SWITCHING
const menuButtons =
    document.querySelectorAll(".menu-btn");

const tabs =
    document.querySelectorAll(".tab-content");

function switchTab(tabId){

    menuButtons.forEach(btn=>{

        btn.classList.remove("active");

    });

    tabs.forEach(tab=>{

        tab.classList.remove("active-tab");

    });

    const activeButton =
        document.querySelector(
            `[data-tab="${tabId}"]`
        );

    const activeTab =
        document.getElementById(tabId);

    if(activeButton)
        activeButton.classList.add("active");

    if(activeTab)
        activeTab.classList.add("active-tab");

}

menuButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const tab =
            button.getAttribute("data-tab");

        switchTab(tab);

    });

});

// CLICKABLE CARDS
const clickableCards =
    document.querySelectorAll(".clickable-card");

clickableCards.forEach(card=>{

    card.addEventListener("click",()=>{

        const target =
            card.getAttribute("data-tab-target");

        switchTab(target);

    });

});

// REVENUE CHART
function renderRevenueChart(){

    const ctx =
        document.getElementById("revenueChart");

    if(!ctx || typeof Chart === "undefined")
        return;

    const completed =
        orders.filter(
            o => o.status === "Completed"
        );

    const monthlyRevenue =
        new Array(12).fill(0);

    completed.forEach(order=>{

        const month =
            order.month !== undefined
                ? order.month
                : new Date().getMonth();

        monthlyRevenue[month] +=
            Number(order.amount || 0);

    });

    if(window.revenueChartInstance){

        window.revenueChartInstance.destroy();

    }

    window.revenueChartInstance =
        new Chart(ctx,{

            type:"line",

            data:{

                labels:[
                    "Jan","Feb","Mar","Apr",
                    "May","Jun","Jul","Aug",
                    "Sep","Oct","Nov","Dec"
                ],

                datasets:[{

                    label:"Monthly Revenue",

                    data:monthlyRevenue,

                    tension:0.4,

                    fill:true,

                    borderWidth:4

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false

            }

        });

}

// SEARCH
const searchInput =
    document.getElementById("searchInput");

if(searchInput){

    searchInput.addEventListener("keyup",()=>{

        const value =
            searchInput.value.toLowerCase();

        const rows =
            document.querySelectorAll(
                "#ordersBody tr"
            );

        rows.forEach(row=>{

            const text =
                row.innerText.toLowerCase();

            row.style.display =
                text.includes(value)
                ? ""
                : "none";

        });

    });

}

// INQUIRIES
const inquiriesBody =
    document.querySelector("#inquiriesBody");

let inquiries =
    JSON.parse(
        localStorage.getItem("inquiries")
    ) || [];

function renderInquiries(){

    if(!inquiriesBody) return;

    inquiriesBody.innerHTML = "";

    if(inquiries.length === 0){

        inquiriesBody.innerHTML = `
            <tr>
                <td colspan="6"
                style="text-align:center;padding:30px;">
                    No franchise inquiries
                </td>
            </tr>
        `;

        return;

    }

    inquiries.forEach((inq,i)=>{

        const tr =
            document.createElement("tr");

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

function deleteInquiry(i){

    inquiries.splice(i,1);

    localStorage.setItem(
        "inquiries",
        JSON.stringify(inquiries)
    );

    renderInquiries();

}