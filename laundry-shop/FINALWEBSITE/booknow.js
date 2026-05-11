// ===== KIOSK STEP SYSTEM =====
let stepBoxes = document.querySelectorAll(".step-box");
const productsPanel = document.querySelector(".products-panel");
let currentStep = 1;
let isConfirmed = false; // ✅ Lock system

// ===== USER SELECTIONS =====
const selections = {
  1: null,
  2: null,
  3: null,
  4: null,
  5: null
};

// ===== EXTRA ORDER DATA =====
let orderQuantity = 1;
let kg = 1;
let deliveryFee = 0;

// ===== STEP CONTENTS WITH PRICES =====
const stepContents = {
  1: {
    title: "Select Your Laundry Soap",
    text: "Choose your preferred detergent product.",
    items: [
      { name: "Ariel", img: "img/Ariel.jpg", price: 20 },
      { name: "Tide", img: "img/tide.jpg", price: 25 },
      { name: "Breeze", img: "img/breeze.jpg", price: 18 },
      { name: "Surf", img: "img/surf.jpg", price: 15 },
      { name: "Pride", img: "img/pride.jpg", price: 17 },
      { name: "Wings", img: "img/wings.jpg", price: 16 }
    ]
  },

  2: {
    title: "Select Fabric Conditioner",
    text: "Choose your preferred fabric conditioner.",
    items: [
      { name: "Downy", img: "img/downy.jpg", price: 30 },
      { name: "Del", img: "img/del.jpg", price: 20 },
      { name: "Champion", img: "img/champ.jpg", price: 22 },
      { name: "Surf Fabcon", img: "img/serf.jpg", price: 18 },
      { name: "Lala Fabcon", img: "img/lala.jpg", price: 15 },
      { name: "Personal Choice", img: "img/placeholder.jpg", price: 10 }
    ]
  },

  3: {
    title: "Select Wash Type",
    text: "Choose your wash preference.",
    items: [
      { name: "Quick Wash", img: "img/quick.jpg", price: 50 },
      { name: "Deep Clean", img: "img/deep.jpg", price: 80 },
      { name: "Premium Wash", img: "img/premium.jpg", price: 120 },
      { name: "Eco Wash", img: "img/eco.jpg", price: 60 },
      { name: "Cold Wash", img: "img/cold.jpg", price: 40 },
      { name: "Hot Wash", img: "img/hot.jpg", price: 70 }
    ]
  },

  4: {
    title: "Pickup Details",
    text: "Choose your pickup schedule.",
    items: [
      { name: "Morning", img: "img/morning.jpg", price: 0 },
      { name: "Afternoon", img: "img/afternoon.jpg", price: 0 },
      { name: "Evening", img: "img/evening.jpg", price: 0 },
      { name: "Express Pickup", img: "img/express.jpg", price: 50 },
      { name: "Store Pickup", img: "img/A1.jpg", price: 0 },
      { name: "Home Delivery", img: "img/home.png", price: 40 }
    ]
  },

  5: {
    title: "Select Payment",
    text: "Choose your payment method.",
    items: [
      { name: "Cash", img: "img/cash.jpg", price: 0 },
      { name: "GCash", img: "img/gcash.jpg", price: 5 },
      { name: "Maya", img: "img/maya.jpg", price: 5 },
      { name: "Credit Card", img: "img/card.jpg", price: 10 },
      { name: "Debit Card", img: "img/debit.jpg", price: 5 },
      { name: "Online Banking", img: "img/online.jpg", price: 15 }
    ]
  }
};

// ===== TOTAL =====
function getSubtotal() {
  let total = 0;
  for (let i = 1; i <= 5; i++) {
    if (selections[i]) total += selections[i].price;
  }
  return total;
}

function getTotal() {
  let base = getSubtotal() * orderQuantity;
  let kgCharge = kg > 8 ? 5 : 0;
  return base + kgCharge + deliveryFee;
}

// ===== STEP CHECKS =====
function updateStepChecks() {
  stepBoxes.forEach((step, index) => {
    const span = step.querySelector("span");
    const stepNum = index + 1;

    if (stepNum <= 5 && selections[stepNum]) {
      span.textContent = "✔";
      span.style.background = "#28a745";
    } else if (stepNum === 6 && isConfirmed) {
      span.textContent = "✔";
      span.style.background = "#28a745";
    } else {
      span.textContent = stepNum;
      span.style.background = "#0094ff";
    }
  });
}

// ✅ LOCK STEPS FUNCTION
function lockPreviousSteps() {
  stepBoxes.forEach((step, index) => {
    const stepNum = index + 1;
    
    if (stepNum < 6 && isConfirmed) {
      step.style.pointerEvents = "none";
      step.style.opacity = "0.6";
      step.style.cursor = "not-allowed";
    } else if (stepNum === 6 && isConfirmed) {
      step.style.pointerEvents = "none";
      step.style.opacity = "1";
      step.style.cursor = "default";
    }
  });
}

// ===== STEP CLICK (LOCKED) =====
function activateStepClicks() {
  stepBoxes = document.querySelectorAll(".step-box");

  stepBoxes.forEach((step, index) => {
    step.onclick = () => {
      const stepNum = index + 1;
      
      if (isConfirmed || stepNum >= currentStep) {
        return; // Locked!
      }
      
      currentStep = stepNum;
      updateStepUI();
    };
  });
}

// ===== EXTRA CONTROLS =====
function updateKg(val) {
  kg = val < 1 ? 1 : parseInt(val);
  if (isConfirmed) renderConfirmation();
  else updateConfirmationLive();
}

function togglePickup(type) {
  deliveryFee = type === "delivery" ? 40 : 0;
  if (isConfirmed) renderConfirmation();
  else updateConfirmationLive();
}

// ✅ FULL DROPDOWN CUSTOMIZATION IN CONFIRMATION
function renderConfirmation() {
  isConfirmed = true;
  lockPreviousSteps();
  updateStepChecks();

  let html = `
  <div class="confirm-layout">

    <!-- LEFT FORM -->
    <div class="confirm-form">

      <h2>✅ Customize Your Order</h2>
      <p style="color:#28a745; font-weight:600;">🔒 Steps locked! Customize quantities & details below:</p>

      <input id="custName" placeholder="Full Name *" required>
      <input id="custAddress" placeholder="Address *" required>

      <label>Pickup Type</label>
      <select id="pickupType" onchange="togglePickup(this.value)">
        <option value="store" ${deliveryFee === 0 ? 'selected' : ''}>Store Pickup (Free)</option>
        <option value="delivery" ${deliveryFee === 40 ? 'selected' : ''}>Home Delivery (+₱40)</option>
      </select>

      <label>Pickup Time</label>
      <select id="pickupTime">
        <option>8:00 AM</option>
        <option>10:00 AM</option>
        <option>12:00 PM</option>
        <option>2:00 PM</option>
        <option>4:00 PM</option>
        <option>6:00 PM</option>
      </select>

      <label>Kilograms</label>
      <div class="qty-control" style="margin-bottom:12px;">
        <button onclick="updateKg(${kg-1})" ${kg <= 1 ? 'disabled' : ''}>-</button>
        <input type="number" id="kgInput" value="${kg}" min="1" style="width:80px;" onchange="updateKg(this.value)">
        <button onclick="updateKg(${kg+1})">+</button>
      </div>
      ${kg > 8 ? `<p style="color:red; font-size:14px;">⚠️ +₱5 extra charge (above 8kg)</p>` : ""}

      <label>Order Quantity</label>
      <div class="qty-control">
        <button onclick="changeQty(-1)">-</button>
        <input type="text" value="${orderQuantity}" id="qtyDisplay" readonly>
        <button onclick="changeQty(1)">+</button>
      </div>

    </div>

    <!-- RIGHT SUMMARY - FULL DROPDOWNS ✅ -->
    <div class="confirmation-box">

      <h2>📋 Final Selections</h2>
      <p style="color:#666; font-size:14px;">Click dropdowns to customize your choices:</p>

  `;

  // ✅ FULL DROPDOWN FOR ALL 5 STEPS
  for (let i = 1; i <= 5; i++) {
    const data = stepContents[i];
    
    html += `
      <div style="margin-bottom:15px; padding:12px; background:#f8f9ff; border-radius:10px;">
        <div style="font-weight:700; color:#0094ff; margin-bottom:8px; font-size:16px;">
          ${data.title}
        </div>
        
        <select onchange="updateSelection(${i}, this.value)" style="width:100%; padding:12px; border:2px solid #0094ff; border-radius:10px; font-size:15px; font-weight:600;">
          ${data.items.map(item => `
            <option value="${item.name}" ${selections[i]?.name === item.name ? "selected" : ""}>
              ${item.name} - ₱${item.price}
            </option>
          `).join("")}
        </select>
      </div>
    `;
  }

  html += `
      <hr style="margin: 25px 0;">

      <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#e3f2fd; border-radius:12px; margin-bottom:20px;">
        <strong style="font-size:22px;">🧺 GRAND TOTAL:</strong>
        <span id="totalLive" style="font-size:28px; font-weight:700; color:#0094ff;">
          ₱${getTotal().toLocaleString()}
        </span>
      </div>

      <button class="select-product-btn confirm-btn" onclick="confirmFinalOrder()" style="margin-bottom:15px;">
        ✅ CONFIRM FINAL ORDER
      </button>

      <div style="padding:15px; background:#fff3cd; border:1px solid #ffeaa7; border-radius:10px; font-size:14px; color:#856404;">
        <strong>ℹ️ Info:</strong> All selections above are now <strong>FINAL</strong> after confirmation!
      </div>

    </div>
  </div>
  `;

  productsPanel.innerHTML = html;
  
  // Update live total immediately
  updateConfirmationLive();
}

// ===== LIVE UPDATE =====
function updateConfirmationLive() {
  const el = document.getElementById("totalLive");
  if (el) el.textContent = "₱" + getTotal().toLocaleString();
}

// ✅ DROPDOWN SELECTION - WORKS IN CONFIRMATION
function updateSelection(step, value) {
  const item = stepContents[step].items.find(i => i.name === value);
  selections[step] = item;

  updateStepChecks();
  
  // Re-render to show updated selections + total
  if (isConfirmed) {
    renderConfirmation();
  } else {
    updateConfirmationLive();
  }
}

// ===== QTY =====
function changeQty(val) {
  orderQuantity += val;
  if (orderQuantity < 1) orderQuantity = 1;

  if (isConfirmed) {
    renderConfirmation();
  } else {
    updateConfirmationLive();
  }
}

// ===== MAIN UI =====
function updateStepUI() {
  stepBoxes.forEach(s => s.classList.remove("active-step"));
  if (stepBoxes[currentStep - 1]) {
    stepBoxes[currentStep - 1].classList.add("active-step");
  }

  updateStepChecks();

  if (currentStep === 6) {
    renderConfirmation();
    return;
  }

  const data = stepContents[currentStep];

  productsPanel.innerHTML = `
    <h2>${data.title}</h2>
    <p class="select-text">${data.text}</p>

    <div class="products-grid">
      ${data.items.map((item, index) => `
        <div class="product-card">
          <img src="${item.img}">
          <h3>${item.name}</h3>
          <p>₱${item.price}</p>
          <button onclick="selectItem(${currentStep}, ${index})">
            Select
          </button>
        </div>
      `).join("")}
    </div>

    <div style="margin-top:20px; font-weight:700; color:#0094ff;">
      Total: ₱${getTotal().toLocaleString()}
    </div>
  `;
}

// ===== SELECT ITEM =====
function selectItem(step, index) {
  selections[step] = stepContents[step].items[index];
  currentStep++;
  updateStepUI();
}

// ===== FINAL ORDER CONFIRMATION =====
function confirmFinalOrder() {

  const name = document.getElementById("custName")?.value;
  const address = document.getElementById("custAddress")?.value;

  if (!name || !address) {
    alert("❌ Please fill in your name and address!");
    return;
  }

  // ===== GENERATE TICKET =====
  const ticketNumber =
  Math.floor(100 + Math.random() * 900).toString();

  // ===== ORDER OBJECT =====
  const newOrder = {
    ticket: ticketNumber,
    name: name,
    contact: "N/A",
    address: address,

    service: selections[3]
      ? selections[3].name
      : "Laundry Service",

    soap: selections[1]
      ? selections[1].name
      : "",

    fabcon: selections[2]
      ? selections[2].name
      : "",

    pickup: selections[4]
      ? selections[4].name
      : "",

    payment: selections[5]
      ? selections[5].name
      : "",

    kg: kg,
    quantity: orderQuantity,

    amount: getTotal(),

    status: "Pending",

    pickupType:
      deliveryFee === 40
        ? "Home Delivery"
        : "Store Pickup",

    pickupTime:
      document.getElementById("pickupTime")
        ? document.getElementById("pickupTime").value
        : ""
  };

  // ===== SAVE TO LOCAL STORAGE =====
  let orders =
    JSON.parse(localStorage.getItem("orders")) || [];

  orders.push(newOrder);

  localStorage.setItem(
    "orders",
    JSON.stringify(orders)
  );

  // ===== SUCCESS =====
  alert(
    "🎉 ORDER CONFIRMED!\n\n" +
    "Ticket Number: " + ticketNumber +
    "\n\nCustomer: " + name +
    "\nTotal: ₱" + getTotal() +
    "\n\nYou can now track your laundry."
  );

  // ===== REDIRECT =====
  window.location.href =
    "tracklaundry.html?ticket=" + ticketNumber;
}

// ===== INITIALIZE =====
updateStepUI();
activateStepClicks();
