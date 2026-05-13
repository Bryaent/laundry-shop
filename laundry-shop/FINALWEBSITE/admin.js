// ================= ORDERS =================

const ordersTable = document.querySelector("#ordersBody");

let orders = JSON.parse(localStorage.getItem("orders")) || [];

function renderOrders(){

    ordersTable.innerHTML = "";

    const totalOrders = orders.length;

    const completedOrders =
    orders.filter(o => o.status === "Completed").length;

    const pendingOrders =
    totalOrders - completedOrders;

    const totalRevenue = orders
    .filter(o => o.status === "Completed")
    .reduce((sum, o) => sum + Number(o.amount), 0);

    // UPDATE CARDS
    document.getElementById("card-total-orders").innerText = totalOrders;

    document.getElementById("card-completed").innerText = completedOrders;

    document.getElementById("card-pending").innerText = pendingOrders;

    document.getElementById("card-total-revenue").innerText =
    `₱${totalRevenue}`;

    // EMPTY
    if(orders.length === 0){

        ordersTable.innerHTML = `
        <tr>
            <td colspan="8" style="text-align:center;padding:20px;">
                No orders
            </td>
        </tr>
        `;

        return;
    }

    // LOOP
    orders.forEach((o,i)=>{

        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td>${o.ticket}</td>

        <td>${o.name}</td>

        <td>${o.contact}</td>

        <td>${o.service}</td>

        <td>₱${o.amount}</td>

        <td>
            <span class="status ${
                o.status === "Completed"
                ? "completed"
                : o.status.toLowerCase().replace(" ","")
            }">
                ${o.status}
            </span>
        </td>

        <td>${o.delivery}</td>

        <td>

            <button class="action-btn received-btn"
            onclick="updateStatus(${i}, 'Received')">
            Received
            </button>

            <button class="action-btn ready-btn"
            onclick="updateStatus(${i}, 'Ready')">
            Ready
            </button>

            <button class="action-btn progress-btn"
            onclick="updateStatus(${i}, 'In Progress')">
            In Progress
            </button>

            <button class="action-btn complete-btn"
            onclick="updateStatus(${i}, 'Completed')">
            Complete
            </button>

            <button class="action-btn delete-btn"
            onclick="deleteOrder(${i})">
            Delete
            </button>

        </td>
        `;

        ordersTable.appendChild(tr);

    });

    localStorage.setItem("orders", JSON.stringify(orders));

}

// UPDATE STATUS
function updateStatus(i,status){

    orders[i].status = status;

    renderOrders();

}

// DELETE
function deleteOrder(i){

    orders.splice(i,1);

    renderOrders();

}

renderOrders();


// ================= TAB SWITCHING =================

const menuButtons = document.querySelectorAll(".menu-btn");

const tabs = document.querySelectorAll(".tab-content");

menuButtons.forEach(button => {

    button.addEventListener("click", () => {

        const tab = button.getAttribute("data-tab");

        if(!tab) return;

        // REMOVE
        menuButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        tabs.forEach(t =>
            t.classList.remove("active-tab")
        );

        // ADD
        button.classList.add("active");

        document
        .getElementById(tab)
        .classList.add("active-tab");

    });

});


// ================= FRANCHISE INQUIRIES =================

const inquiriesBody =
document.querySelector("#inquiriesBody");

// CONNECT TO WEBSITE FORM
let inquiries =
JSON.parse(localStorage.getItem("inquiries")) || [];

// RENDER
function renderInquiries(){

    inquiriesBody.innerHTML = "";

    // EMPTY
    if(inquiries.length === 0){

        inquiriesBody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;padding:20px;">
                No franchise inquiries
            </td>
        </tr>
        `;

        return;
    }

    // LOOP
    inquiries.forEach((inq, i)=>{

    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${inq.fullName}</td>
        <td>${inq.email}</td>
        <td>${inq.contact}</td>
        <td>${inq.message}</td>
        <td>${inq.date}</td>

        <td>
            <button class="action-btn delete-btn"
            onclick="deleteInquiry(${i})">
                Delete
            </button>
        </td>
    `;

    inquiriesBody.appendChild(tr);

});

}

// LOAD
renderInquiries();

// DELETE INQUIRY
function deleteInquiry(i){

    inquiries.splice(i,1);

    localStorage.setItem(
        "inquiries",
        JSON.stringify(inquiries)
    );

    renderInquiries();

}