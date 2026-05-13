// ================= ORDERS =================

const ordersTable =
document.querySelector("#ordersBody");

const completedOrdersTable =
document.querySelector("#completedOrdersBody");

let orders =
JSON.parse(localStorage.getItem("orders")) || [];

function renderOrders(){

    ordersTable.innerHTML = "";
    completedOrdersTable.innerHTML = "";

    const totalOrders = orders.length;

    const completedOrders =
    orders.filter(o => o.status === "Completed").length;

    const pendingOrders =
    totalOrders - completedOrders;

    const totalRevenue = orders
    .filter(o => o.status === "Completed")
    .reduce((sum, o) =>
        sum + Number(o.amount), 0);

    document.getElementById(
        "card-total-orders"
    ).innerText = totalOrders;

    document.getElementById(
        "card-completed"
    ).innerText = completedOrders;

    document.getElementById(
        "card-pending"
    ).innerText = pendingOrders;

    document.getElementById(
        "card-total-revenue"
    ).innerText = `₱${totalRevenue}`;

    if(orders.length === 0){

        ordersTable.innerHTML = `
        <tr>
            <td colspan="8"
            style="text-align:center;padding:20px;">
                No live orders
            </td>
        </tr>
        `;

        completedOrdersTable.innerHTML = `
        <tr>
            <td colspan="7"
            style="text-align:center;padding:20px;">
                No completed orders
            </td>
        </tr>
        `;

        return;
    }

    orders.forEach((o,i)=>{

        const tr =
        document.createElement("tr");

        if(o.status === "Completed"){

            tr.innerHTML = `
            <td>${o.ticket}</td>
            <td>${o.name}</td>
            <td>${o.contact}</td>
            <td>${o.service}</td>
            <td>₱${o.amount}</td>

            <td>
                <span class="status completed">
                    Completed
                </span>
            </td>

            <td>${o.delivery}</td>
            `;

            completedOrdersTable.appendChild(tr);

        }

        else{

            tr.innerHTML = `
            <td>${o.ticket}</td>

            <td>${o.name}</td>

            <td>${o.contact}</td>

            <td>${o.service}</td>

            <td>₱${o.amount}</td>

            <td>
                <span class="status ${
                    o.status
                    .toLowerCase()
                    .replace(" ","")
                }">
                    ${o.status}
                </span>
            </td>

            <td>${o.delivery}</td>

            <td>

                <button
                class="action-btn received-btn"
                onclick="updateStatus(${i},
                'Received')">
                Received
                </button>

                <button
                class="action-btn ready-btn"
                onclick="updateStatus(${i},
                'Ready')">
                Ready
                </button>

                <button
                class="action-btn progress-btn"
                onclick="updateStatus(${i},
                'In Progress')">
                In Progress
                </button>

                <button
                class="action-btn complete-btn"
                onclick="updateStatus(${i},
                'Completed')">
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

}

// UPDATE STATUS
function updateStatus(i,status){

    orders[i].status = status;

    if(status === "Completed"){

        orders[i].month =
        new Date().getMonth();

    }

    renderOrders();
    renderRevenueChart();

}

// DELETE
function deleteOrder(i){

    orders.splice(i,1);

    renderOrders();
    renderRevenueChart();

}

renderOrders();


// ================= TAB SWITCHING =================

const menuButtons =
document.querySelectorAll(".menu-btn");

const tabs =
document.querySelectorAll(".tab-content");

function switchTab(tabId){

    menuButtons.forEach(btn =>
        btn.classList.remove("active")
    );

    tabs.forEach(t =>
        t.classList.remove("active-tab")
    );

    document
    .querySelector(`[data-tab="${tabId}"]`)
    .classList.add("active");

    document
    .getElementById(tabId)
    .classList.add("active-tab");

}

menuButtons.forEach(button => {

    button.addEventListener("click", () => {

        const tab =
        button.getAttribute("data-tab");

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

function renderRevenueChart(){

    const completedOrders =
    orders.filter(
        o => o.status === "Completed"
    );

    const monthlyRevenue =
    new Array(12).fill(0);

    completedOrders.forEach(order => {

        const month =
        order.month !== undefined
        ? order.month
        : new Date().getMonth();

        monthlyRevenue[month] +=
        Number(order.amount);

    });

    const ctx =
    document.getElementById(
        "revenueChart"
    );

    if(window.revenueChartInstance){

        window.revenueChartInstance.destroy();

    }

    window.revenueChartInstance =
    new Chart(ctx, {

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

            maintainAspectRatio:false,

            scales:{
                y:{
                    beginAtZero:true
                }
            }
        }

    });

}

renderRevenueChart();


// ================= SEARCH =================

const searchInput =
document.getElementById("searchInput");

if(searchInput){

    searchInput.addEventListener("keyup", () => {

        const value =
        searchInput.value.toLowerCase();

        const rows =
        document.querySelectorAll(
            "#ordersBody tr"
        );

        rows.forEach(row => {

            const text =
            row.innerText.toLowerCase();

            row.style.display =
            text.includes(value)
            ? ""
            : "none";

        });

    });

}


// ================= INQUIRIES =================

const inquiriesBody =
document.querySelector("#inquiriesBody");

let inquiries =
JSON.parse(
    localStorage.getItem("inquiries")
) || [];

function renderInquiries(){

    inquiriesBody.innerHTML = "";

    if(inquiries.length === 0){

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

    inquiries.forEach((inq, i)=>{

        const tr =
        document.createElement("tr");

        tr.innerHTML = `
            <td>${inq.fullName}</td>
            <td>${inq.email}</td>
            <td>${inq.contact}</td>
            <td>${inq.message}</td>
            <td>${inq.date}</td>

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

