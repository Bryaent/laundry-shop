const ordersTable = document.querySelector("#ordersTable tbody");
const historyTable = document.querySelector("#historyTable tbody");
const liveTab = document.getElementById("liveTab");
const historyTab = document.getElementById("historyTab");
const liveOrders = document.getElementById("liveOrders");
const orderHistory = document.getElementById("orderHistory");

// Load data from localStorage
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let history = JSON.parse(localStorage.getItem("orderHistory")) || [];

// ===== RENDER ORDERS =====
function renderOrders() {
  ordersTable.innerHTML = "";
  if (orders.length === 0) {
    ordersTable.innerHTML = `<tr><td colspan="7" class="empty">No live orders yet.</td></tr>`;
    return;
  }

  orders.forEach((o, i) => {
    const tr = document.createElement("tr");
    const service = o.service || (o.address ? "Laundry Service" : "—");
    const amount = o.amount
      ? `₱${parseFloat(o.amount).toLocaleString()}`
      : "₱0";

    tr.innerHTML = `
      <td>${o.ticket || '—'}</td>
      <td>${o.name}</td>
      <td>${o.contact}</td>
      <td>${service}</td>
      <td>${amount}</td>
      <td><span class="status ${o.status.toLowerCase().replace(' ', '')}">${o.status}</span></td>
      <td>
        <button class="btn in-progress" onclick="updateStatus(${i}, 'In Progress')">In Progress</button>
        <button class="btn completed" onclick="updateStatus(${i}, 'Completed')">Complete</button>
        <button class="btn delete" onclick="deleteOrder(${i})">Delete</button>
      </td>
    `;
    ordersTable.appendChild(tr);
  });
}

// ===== RENDER HISTORY =====
function renderHistory() {
  historyTable.innerHTML = "";
  if (history.length === 0) {
    historyTable.innerHTML = `<tr><td colspan="7" class="empty">No completed orders yet.</td></tr>`;
    return;
  }

  history.forEach((o, i) => {
    const service = o.service || "Laundry Service";
    const amount = o.amount
      ? `₱${parseFloat(o.amount).toLocaleString()}`
      : "₱0";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${o.ticket || '—'}</td>
      <td>${o.name}</td>
      <td>${o.contact}</td>
      <td>${service}</td>
      <td>${amount}</td>
      <td><span class="status completed">Completed</span></td>
      <td><button class="btn delete" onclick="deleteHistory(${i})">Delete</button></td>
    `;
    historyTable.appendChild(tr);
  });
}

// ===== UPDATE STATUS =====
function updateStatus(index, newStatus) {
  orders[index].status = newStatus;

  if (newStatus === "Completed") {
    history.push(orders[index]);
    orders.splice(index, 1);
  }

  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.setItem("orderHistory", JSON.stringify(history));

  renderOrders();
  renderHistory();
}

// ===== DELETE ORDER (LIVE) =====
function deleteOrder(index) {
  if (confirm("Delete this live order?")) {
    orders.splice(index, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    renderOrders();
  }
}

// ===== DELETE HISTORY (COMPLETED) =====
function deleteHistory(index) {
  if (confirm("Delete this completed order?")) {
    history.splice(index, 1);
    localStorage.setItem("orderHistory", JSON.stringify(history));
    renderHistory();
  }
}

// ===== TAB SWITCH =====
liveTab.onclick = () => {
  liveTab.classList.add("active");
  historyTab.classList.remove("active");
  liveOrders.style.display = "block";
  orderHistory.style.display = "none";
};

historyTab.onclick = () => {
  historyTab.classList.add("active");
  liveTab.classList.remove("active");
  liveOrders.style.display = "none";
  orderHistory.style.display = "block";
};

// ===== LOGOUT =====
function logout() {
  // alisin lang ang “login/session” info, pero hindi lahat ng data
  localStorage.removeItem("loggedInUser"); // kung may login info ka
  alert("You have been logged out.");

  // redirect sa login or home page
  window.location.href = "login.html";
}

// ===== INITIAL RENDER =====
renderOrders();
renderHistory();
