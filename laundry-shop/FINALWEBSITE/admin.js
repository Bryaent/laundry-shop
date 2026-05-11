const ordersTable = document.querySelector("#ordersBody");

let orders = JSON.parse(localStorage.getItem("orders")) || [
    {
        ticket: 748,
        name: "Lance Mabborang",
        contact: "N/A",
        service: "Quick Wash",
        amount: 100,
        status: "Received",
        delivery: "Drop-off"
    }
];

// RENDER
function renderOrders(){
    ordersTable.innerHTML = "";

    // CONNECT DATA TO CARDS
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === "Completed").length;
    const pendingOrders = totalOrders - completedOrders;
    const totalRevenue = orders
        .filter(o => o.status === "Completed")
        .reduce((sum, o) => sum + Number(o.amount), 0);

    // Update Card UI
    document.getElementById("card-total-orders").innerText = totalOrders;
    document.getElementById("card-completed").innerText = completedOrders;
    document.getElementById("card-pending").innerText = pendingOrders;
    document.getElementById("card-total-revenue").innerText = `₱${totalRevenue}`;

    if(orders.length === 0){
        ordersTable.innerHTML = `
        <tr><td colspan="8" style="text-align:center;padding:20px;">No orders</td></tr>`;
        return;
    }

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
                : o.status.toLowerCase().replace(" ", "")
            }">
                ${o.status}
            </span>
        </td>
        <td>${o.delivery}</td>
        <td>
            <button class="action-btn received-btn" onclick="updateStatus(${i}, 'Received')">Received</button>
            <button class="action-btn ready-btn" onclick="updateStatus(${i}, 'Ready')">Ready</button>
            <button class="action-btn progress-btn" onclick="updateStatus(${i}, 'In Progress')">In Progress</button>
            <button class="action-btn complete-btn" onclick="updateStatus(${i}, 'Completed')">Complete</button>
            <button class="action-btn delete-btn" onclick="deleteOrder(${i})">Delete</button>
        </td>
        `;
        ordersTable.appendChild(tr);
    });

    localStorage.setItem("orders", JSON.stringify(orders));
}

// UPDATE
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