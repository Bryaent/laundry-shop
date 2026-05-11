const ordersTable = document.querySelector("#ordersTable tbody");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

let orders = JSON.parse(localStorage.getItem("orders")) || [];

// ===================== RENDER ORDERS =====================
function renderOrders() {

  orders = JSON.parse(localStorage.getItem("orders")) || [];

  ordersTable.innerHTML = "";

  if (orders.length === 0) {

    ordersTable.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px;">
          No live orders yet.
        </td>
      </tr>
    `;

    return;
  }

  orders.forEach((o, i) => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${o.ticket || "-"}</td>

      <td>${o.name || "-"}</td>

      <td>${o.contact || "-"}</td>

      <td>${o.service || "-"}</td>

      <td>₱${o.amount || 0}</td>

      <td>
        <span class="status ${
          o.status === "Pending"
            ? "pending"
            : o.status === "In Progress"
            ? "progress"
            : "completed"
        }">
          ${o.status}
        </span>
      </td>

      <td>

        <button class="action-btn btn-progress"
          onclick="updateStatus(${i}, 'In Progress')">
          In Progress
        </button>

        <button class="action-btn btn-complete"
          onclick="updateStatus(${i}, 'Completed')">
          Complete
        </button>

        <button class="action-btn btn-delete"
          onclick="deleteOrder(${i})">
          Delete
        </button>

      </td>
    `;

    ordersTable.appendChild(tr);
  });

  updateAnalytics();

  filterTable();
}

// ===================== UPDATE STATUS =====================
function updateStatus(index, status) {

  orders[index].status = status;

  localStorage.setItem(
    "orders",
    JSON.stringify(orders)
  );

  renderOrders();
}

// ===================== DELETE =====================
function deleteOrder(index) {

  const confirmDelete = confirm(
    "Delete this order?"
  );

  if (!confirmDelete) return;

  orders.splice(index, 1);

  localStorage.setItem(
    "orders",
    JSON.stringify(orders)
  );

  renderOrders();
}

// ===================== ANALYTICS =====================
function updateAnalytics() {

  const totalOrders =
    orders.length;

  const totalRevenue =
    orders.reduce((sum, o) =>
      sum + Number(o.amount || 0), 0);

  const pending =
    orders.filter(o =>
      o.status === "Pending").length;

  const completed =
    orders.filter(o =>
      o.status === "Completed").length;

  document.querySelectorAll(".analytics-card h2")[0]
    .textContent = totalOrders;

  document.querySelectorAll(".analytics-card h2")[1]
    .textContent = "₱" + totalRevenue;

  document.querySelectorAll(".analytics-card h2")[2]
    .textContent = pending;

  document.querySelectorAll(".analytics-card h2")[3]
    .textContent = completed;
}

// ===================== SEARCH + FILTER =====================
function filterTable() {

  const search =
    searchInput.value.toLowerCase();

  const status =
    statusFilter.value;

  document.querySelectorAll(
    "#ordersTable tbody tr"
  ).forEach(row => {

    const text =
      row.innerText.toLowerCase();

    const rowStatus =
      row.querySelector(".status")
      ?.textContent
      .trim()
      .toLowerCase();

    const matchSearch =
      text.includes(search);

    const matchStatus =
      status === "all"
      || rowStatus.includes(status);

    row.style.display =
      matchSearch && matchStatus
      ? ""
      : "none";
  });
}

// ===================== EVENTS =====================
searchInput.addEventListener(
  "input",
  filterTable
);

statusFilter.addEventListener(
  "change",
  filterTable
);

// ===================== INIT =====================
renderOrders();